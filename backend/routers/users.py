from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.db import get_db
from core.security import decode_token
from models.models import User, Report
from schemas.schemas import UserOut

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)) -> User:
    sub = decode_token(token)
    if sub is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(sub))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/stats")
def user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    total_reports = db.query(func.count(Report.id)).filter(Report.user_id == current_user.id).scalar() or 0
    recycled_count = db.query(func.count(Report.id)).filter(
        Report.user_id == current_user.id, Report.status == "recycled"
    ).scalar() or 0
    co2_saved = round(total_reports * 1.2, 1)
    return {
        "points": current_user.points,
        "total_reports": total_reports,
        "recycled_count": recycled_count,
        "co2_saved_kg": co2_saved,
    }


