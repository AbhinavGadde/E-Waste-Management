from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)
    role: str = "user"
    center_name: Optional[str] = None
    center_latitude: Optional[float] = None
    center_longitude: Optional[float] = None


class UserOut(UserBase):
    id: int
    role: str
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RecyclerCenterBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    contact_info: Optional[str] = None


class RecyclerCenterCreate(RecyclerCenterBase):
    pass


class RecyclerCenterOut(RecyclerCenterBase):
    id: int
    approved: bool
    performance_score: float
    manager_user_id: Optional[int] = None
    total_recycled: int
    total_co2_saved: float
    rating: float

    class Config:
        from_attributes = True


class PredictOut(BaseModel):
    category: str
    confidence: float
    suggestion: str


class ReportCreate(BaseModel):
    recycler_id: Optional[int] = None


class ReportOut(BaseModel):
    id: int
    image_url: str
    category: str
    confidence: float
    suggestion: Optional[str]
    recycler: Optional[RecyclerCenterOut]
    status: str
    co2_saved: float
    points_awarded: int
    created_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str  # received | recycled


class AnalyticsOverview(BaseModel):
    by_category: dict
    top_contributors: List[dict]
    center_performance: List[dict]
    co2_saved_kg: float
    total_users: int
    total_centers: int
    total_reports: int
    total_recycled: int
    growth_rate: float
    impact_timeline: List[dict]


class AchievementOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    badge_type: str
    points_reward: int

    class Config:
        from_attributes = True


class UserAchievementOut(BaseModel):
    achievement: AchievementOut
    earned_at: datetime

    class Config:
        from_attributes = True


class ChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    target: int
    current_progress: int
    start_date: datetime
    end_date: datetime
    is_active: bool
    reward_points: int
    progress_percentage: float

    class Config:
        from_attributes = True


class ImpactStats(BaseModel):
    personal_co2_saved: float
    personal_items_recycled: int
    personal_points: int
    personal_level: int
    global_co2_saved: float
    global_items_recycled: int
    global_users: int
    rank: int
    next_level_points: int
    achievements_count: int
