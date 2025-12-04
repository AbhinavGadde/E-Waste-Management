from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user")  # user, recycler, admin
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    total_co2_saved: Mapped[float] = mapped_column(Float, default=0.0)
    total_items_recycled: Mapped[int] = mapped_column(Integer, default=0)
    badges: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of badge IDs
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_active: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    reports: Mapped[list["Report"]] = relationship(back_populates="user")
    managed_center: Mapped[Optional["RecyclerCenter"]] = relationship(
        "RecyclerCenter", back_populates="manager", uselist=False, foreign_keys="RecyclerCenter.manager_user_id"
    )
    achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="user")


class RecyclerCenter(Base):
    __tablename__ = "recycler_centers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    manager_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    total_recycled: Mapped[int] = mapped_column(Integer, default=0)
    total_co2_saved: Mapped[float] = mapped_column(Float, default=0.0)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contact_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    reports: Mapped[list["Report"]] = relationship(back_populates="recycler")
    manager: Mapped[Optional["User"]] = relationship(
        "User", back_populates="managed_center", foreign_keys=[manager_user_id]
    )


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    image_path: Mapped[str] = mapped_column(String(512), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    suggestion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recycler_id: Mapped[Optional[int]] = mapped_column(ForeignKey("recycler_centers.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, assigned, received, recycled
    co2_saved: Mapped[float] = mapped_column(Float, default=0.0)
    points_awarded: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    recycled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="reports")
    recycler: Mapped[Optional["RecyclerCenter"]] = relationship(back_populates="reports")


class Achievement(Base):
    __tablename__ = "achievements"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(100), nullable=False)
    badge_type: Mapped[str] = mapped_column(String(50), nullable=False)  # bronze, silver, gold, platinum
    requirement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON criteria
    points_reward: Mapped[int] = mapped_column(Integer, default=0)

    user_achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")


class Challenge(Base):
    __tablename__ = "challenges"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    target: Mapped[int] = mapped_column(Integer, nullable=False)  # Target number of items
    current_progress: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    reward_points: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ImpactMetric(Base):
    __tablename__ = "impact_metrics"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    total_reports: Mapped[int] = mapped_column(Integer, default=0)
    total_recycled: Mapped[int] = mapped_column(Integer, default=0)
    total_co2_saved: Mapped[float] = mapped_column(Float, default=0.0)
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    total_centers: Mapped[int] = mapped_column(Integer, default=0)
