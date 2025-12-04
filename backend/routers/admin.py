from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.db import get_db
from core.security import decode_token
from models.models import User, RecyclerCenter, Report
from schemas.schemas import RecyclerCenterOut

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    sub = decode_token(token)
    if sub is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(sub))
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


@router.post("/centers/{center_id}/approve")
def approve_center(center_id: int, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict:
    center = db.query(RecyclerCenter).get(center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    center.approved = True
    db.commit()
    return {"ok": True}


@router.get("/users", response_model=List[str])
def list_users(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[str]:
    return [u.email for u in db.query(User).all()]


