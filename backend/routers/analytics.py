from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.db import get_db
from core.security import decode_token
from models.models import User, Report, RecyclerCenter
from schemas.schemas import AnalyticsOverview

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


@router.get("/overview", response_model=AnalyticsOverview)
def overview(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> AnalyticsOverview:
    from datetime import datetime, timedelta
    
    # Waste by category
    cat_rows = db.query(Report.category, func.count(Report.id)).group_by(Report.category).all()
    by_category = {c: int(n) for c, n in cat_rows}

    # Top contributors by points
    users = db.query(User).order_by(User.points.desc()).limit(5).all()
    top_contributors = [{"name": (u.name or u.email), "points": u.points} for u in users]

    # Center performance: number of recycled reports
    perf_rows = (
        db.query(RecyclerCenter.name, func.count(Report.id))
        .join(Report, Report.recycler_id == RecyclerCenter.id, isouter=True)
        .filter(Report.status == "recycled")
        .group_by(RecyclerCenter.name)
        .all()
    )
    center_performance = [{"name": n, "recycled": int(cnt)} for n, cnt in perf_rows]

    # CO2 saved: sum from reports
    total_co2 = db.query(func.sum(Report.co2_saved)).scalar() or 0.0
    co2_saved_kg = round(float(total_co2), 1)
    
    # Total stats
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    total_recycled = db.query(func.count(Report.id)).filter(Report.status == "recycled").scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_centers = db.query(func.count(RecyclerCenter.id)).scalar() or 0
    
    # Growth rate (last 30 days vs previous 30 days)
    now = datetime.utcnow()
    last_30 = now - timedelta(days=30)
    prev_30 = last_30 - timedelta(days=30)
    
    recent_reports = db.query(func.count(Report.id)).filter(Report.created_at >= last_30).scalar() or 0
    previous_reports = db.query(func.count(Report.id)).filter(
        Report.created_at >= prev_30, Report.created_at < last_30
    ).scalar() or 0
    
    growth_rate = ((recent_reports - previous_reports) / previous_reports * 100) if previous_reports > 0 else 0.0
    
    # Impact timeline (last 7 days)
    timeline = []
    for i in range(7):
        date = now - timedelta(days=i)
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start + timedelta(days=1)
        
        day_reports = db.query(func.count(Report.id)).filter(
            Report.created_at >= date_start, Report.created_at < date_end
        ).scalar() or 0
        
        day_co2 = db.query(func.sum(Report.co2_saved)).filter(
            Report.created_at >= date_start, Report.created_at < date_end
        ).scalar() or 0.0
        
        timeline.append({
            "date": date_start.date().isoformat(),
            "reports": day_reports,
            "co2": round(float(day_co2 or 0), 1),
        })
    
    timeline.reverse()

    return AnalyticsOverview(
        by_category=by_category,
        top_contributors=top_contributors,
        center_performance=center_performance,
        co2_saved_kg=co2_saved_kg,
        total_users=total_users,
        total_centers=total_centers,
        total_reports=total_reports,
        total_recycled=total_recycled,
        growth_rate=round(growth_rate, 1),
        impact_timeline=timeline,
    )


