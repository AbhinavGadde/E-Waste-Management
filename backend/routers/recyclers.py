from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.db import get_db
from core.security import decode_token
from models.models import RecyclerCenter, User, Report
from schemas.schemas import RecyclerCenterOut, RecyclerCenterCreate, ReportOut, StatusUpdate

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    sub = decode_token(token)
    if sub is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(sub))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/centers", response_model=List[RecyclerCenterOut])
def list_centers(db: Session = Depends(get_db)) -> list[RecyclerCenter]:
    centers = db.query(RecyclerCenter).all()
    # Seed mocks if empty
    if not centers:
        seed = [
            RecyclerCenter(
                name="GreenCycle Hub",
                latitude=28.6139,
                longitude=77.2090,
                approved=True,
                performance_score=78.5,
            ),
            RecyclerCenter(
                name="EcoReclaim Center",
                latitude=12.9716,
                longitude=77.5946,
                approved=True,
                performance_score=82.0,
            ),
            RecyclerCenter(
                name="Renew Tech Recyclers",
                latitude=19.0760,
                longitude=72.8777,
                approved=False,
                performance_score=60.0,
            ),
        ]
        db.add_all(seed)
        db.commit()
        centers = db.query(RecyclerCenter).all()
    return centers


@router.post("/centers", response_model=RecyclerCenterOut)
def create_center(center: RecyclerCenterCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> RecyclerCenter:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    c = RecyclerCenter(**center.model_dump(), approved=False)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.post("/centers/{center_id}/claim", response_model=RecyclerCenterOut)
def claim_center(center_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> RecyclerCenter:
    if current_user.role != "recycler":
        raise HTTPException(status_code=403, detail="Recycler only")
    center = db.query(RecyclerCenter).get(center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    if not center.approved:
        raise HTTPException(status_code=400, detail="Center not yet approved")
    if center.manager_user_id and center.manager_user_id != current_user.id:
        raise HTTPException(status_code=409, detail="Center already claimed")
    center.manager_user_id = current_user.id
    db.commit()
    db.refresh(center)
    return center


@router.get("/assigned", response_model=List[ReportOut])
def list_assigned(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Report]:
    if current_user.role != "recycler":
        raise HTTPException(status_code=403, detail="Recycler only")
    centers = (
        db.query(RecyclerCenter)
        .filter(RecyclerCenter.manager_user_id == current_user.id)
        .all()
    )
    if not centers:
        return []
    center_ids = [c.id for c in centers]
    reports = (
        db.query(Report)
        .filter(Report.recycler_id.in_(center_ids))
        .order_by(Report.created_at.desc())
        .all()
    )
    center_lookup = {c.id: c for c in centers}
    return [
        ReportOut(
            id=r.id,
            image_url=f"/uploads/{r.image_path}",
            category=r.category,
            confidence=r.confidence,
            suggestion=r.suggestion,
            recycler=center_lookup.get(r.recycler_id),
            status=r.status,
            co2_saved=getattr(r, 'co2_saved', 0.0),
            points_awarded=getattr(r, 'points_awarded', 0),
            created_at=r.created_at,
        )
        for r in reports
    ]


@router.post("/assigned/{report_id}/status")
def update_status(report_id: int, payload: StatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if current_user.role != "recycler":
        raise HTTPException(status_code=403, detail="Recycler only")
    report = db.query(Report).get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    allowed_center_ids = (
        db.query(RecyclerCenter.id)
        .filter(RecyclerCenter.manager_user_id == current_user.id)
        .all()
    )
    allowed_ids = {cid for (cid,) in allowed_center_ids}
    if report.recycler_id not in allowed_ids:
        raise HTTPException(status_code=403, detail="Not assigned to your center")
    if payload.status not in {"received", "recycled"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    from datetime import datetime
    old_status = report.status
    report.status = payload.status
    
    # If marking as recycled, update stats
    if payload.status == "recycled" and old_status != "recycled":
        report.recycled_at = datetime.utcnow()
        
        # Update user stats
        user = db.query(User).get(report.user_id)
        if user:
            user.total_items_recycled += 1
        
        # Update center stats
        center = db.query(RecyclerCenter).get(report.recycler_id)
        if center:
            center.total_recycled += 1
            center.total_co2_saved += report.co2_saved
            # Update performance score
            center.performance_score = min(100.0, center.performance_score + 2.0)
    
    db.commit()
    return {"ok": True}


