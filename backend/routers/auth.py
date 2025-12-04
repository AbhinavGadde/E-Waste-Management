from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.db import get_db
from core.security import verify_password, get_password_hash, create_access_token
from models.models import User, RecyclerCenter
from schemas.schemas import UserCreate, UserOut, Token, LoginRequest

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if user_in.role == "recycler":
        if (
            not user_in.center_name
            or user_in.center_latitude is None
            or user_in.center_longitude is None
        ):
            raise HTTPException(
                status_code=400,
                detail="Recycler registration requires center name and coordinates",
            )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        name=user_in.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    if user.role == "recycler":
        center = RecyclerCenter(
            name=user_in.center_name,
            latitude=user_in.center_latitude,
            longitude=user_in.center_longitude,
            approved=False,
            performance_score=0.0,
            manager_user_id=user.id,
        )
        db.add(center)
        db.commit()
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)


@router.post("/login-json", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)


