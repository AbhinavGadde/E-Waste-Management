from typing import List, Annotated, Optional
import hashlib
from pathlib import Path
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from PIL import Image

from core.db import get_db
from core.security import decode_token
from models.models import User, Report, RecyclerCenter
from schemas.schemas import ReportOut, ReportCreate
from routers.ml import detect_ewaste

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

UPLOAD_DIR = Path("uploads")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)) -> User:
    sub = decode_token(token)
    if sub is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(sub))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def deterministic_predict(filename: str) -> tuple[str, float, str]:
    h = int(hashlib.sha256(filename.encode("utf-8")).hexdigest(), 16)
    categories = [
        ("Battery", "Take to a recycling center; avoid general trash."),
        ("Circuit Board", "Handle carefully; recycle at e-waste facility."),
        ("Plastic Casing", "Separate and recycle if local rules allow."),
        ("Metal Scrap", "Can be melted and reused; recycle."),
        ("Display Panel", "Contains hazardous materials; recycle safely."),
    ]
    idx = h % len(categories)
    base_conf = 0.65 + (h % 35) / 100.0  # between 0.65 and 0.99
    category, suggestion = categories[idx]
    return category, round(min(base_conf, 0.99), 2), suggestion


@router.post("/create", response_model=ReportOut)
async def create_report(
    file: UploadFile = File(...),
    recycler_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportOut:
    # Save image
    suffix = Path(file.filename).suffix or ".jpg"
    safe_name = f"{current_user.id}_{hashlib.md5(file.filename.encode()).hexdigest()}{suffix}"
    dest = UPLOAD_DIR / safe_name
    data = await file.read()
    dest.write_bytes(data)
    # Verify image loadable (basic)
    try:
        with Image.open(BytesIO(data)) as img:
            img.verify()
    except Exception:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Invalid image")
    
    # Check if image contains e-waste
    has_ewaste, reason = detect_ewaste(data, file.content_type)
    if not has_ewaste:
        dest.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=(
                "No e-waste detected in the image. "
                "Please upload an image containing electronic waste items. "
                f"Reason: {reason}"
            ),
        )

    # Predict
    category, confidence, suggestion = deterministic_predict(file.filename)

    assigned_id = None
    if recycler_id:
        center = db.query(RecyclerCenter).get(recycler_id)
        if center:
            assigned_id = center.id

    # Calculate CO2 saved (1.2 kg per item, varies by category)
    co2_by_category = {
        "Battery": 2.5,
        "Circuit Board": 1.8,
        "Plastic Casing": 0.8,
        "Metal Scrap": 1.5,
        "Display Panel": 3.0,
    }
    co2_saved = co2_by_category.get(category, 1.2)
    
    # Calculate points (base 10 + bonus for confidence)
    points = 10 + int(confidence * 10)
    
    # Update user level (100 points per level)
    new_level = (current_user.points + points) // 100 + 1
    if new_level > current_user.level:
        current_user.level = new_level
    
    report = Report(
        user_id=current_user.id,
        image_path=safe_name,
        category=category,
        confidence=confidence,
        suggestion=suggestion,
        recycler_id=assigned_id,
        status="assigned" if assigned_id else "pending",
        co2_saved=co2_saved,
        points_awarded=points,
    )
    
    # Update user stats
    current_user.points += points
    current_user.total_co2_saved += co2_saved
    current_user.last_active = datetime.utcnow()
    
    db.add(report)
    db.commit()
    db.refresh(report)
    recycler = db.query(RecyclerCenter).get(report.recycler_id) if report.recycler_id else None
    return ReportOut(
        id=report.id,
        image_url=f"/uploads/{report.image_path}",
        category=report.category,
        confidence=report.confidence,
        suggestion=report.suggestion,
        recycler=recycler,
        status=report.status,
        co2_saved=report.co2_saved,
        points_awarded=report.points_awarded,
        created_at=report.created_at,
    )


@router.get("/history", response_model=List[ReportOut])
def history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ReportOut]:
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
    out: list[ReportOut] = []
    for r in reports:
        center = db.query(RecyclerCenter).get(r.recycler_id) if r.recycler_id else None
        out.append(
            ReportOut(
                id=r.id,
                image_url=f"/uploads/{r.image_path}",
                category=r.category,
                confidence=r.confidence,
                suggestion=r.suggestion,
                recycler=center,
                status=r.status,
                co2_saved=r.co2_saved,
                points_awarded=r.points_awarded,
                created_at=r.created_at,
            )
        )
    return out


