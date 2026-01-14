from fastapi import APIRouter, Depends
from src.infrastructure.database import db
from src.infrastructure.demo import is_demo_mode

router = APIRouter(tags=["Analytics"])

@router.get("/analytics/summary")
async def get_analytics_summary():
    # 1. Demo Mode Gate (Canonical)
    if is_demo_mode():
        return {
            "incidents_by_severity": {"critical": 1, "high": 3, "medium": 8, "low": 14},
            "sla_breaches": 2,
            "fleet_uptime": 99.4,
            "mtta": "08m", 
            "mttr": "32m",
            "incidents_trend": [4, 6, 8, 2, 5, 9, 3, 4, 2, 5, 7, 12, 8, 4, 3, 2, 6, 8, 4, 5, 3, 2, 1, 4]
        }

    # 2. Real Production Logic
    pool = await db.get_pool()
    
    # Incidents by Severity
    severity_rows = await pool.fetch("SELECT severity, count(*) as count FROM incidents GROUP BY severity")
    incidents_by_severity = {row['severity']: row['count'] for row in severity_rows}
    
    # SLA Breaches
    sla_breaches = await pool.fetchval("SELECT count(*) FROM tickets WHERE status != 'Closed' AND NOW() > sla_deadline")
    
    # Fleet Uptime (Placeholder for real metric)
    uptime = 98.5 
    
    return {
        "incidents_by_severity": incidents_by_severity,
        "sla_breaches": sla_breaches,
        "fleet_uptime": uptime,
        "mtta": "12m", 
        "mttr": "45m"
    }
