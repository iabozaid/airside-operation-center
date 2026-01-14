from fastapi import APIRouter
from src.visitors.service import VisitorService
from src.visitors.schemas import VisitorDensityResponse

router = APIRouter(prefix="/visitors", tags=["visitors"])
service = VisitorService()

@router.get("/density", response_model=VisitorDensityResponse)
async def get_visitor_density():
    return service.get_zone_density()
