from fastapi import APIRouter, Depends
from src.baggage.service import BaggageService
from src.baggage.schemas import BaggageStatsResponse

router = APIRouter(prefix="/baggage", tags=["baggage"])

def get_baggage_service() -> BaggageService:
    return BaggageService()

@router.get("/stats", response_model=BaggageStatsResponse)
def get_baggage_stats(service: BaggageService = Depends(get_baggage_service)):
    """
    Get mock baggage statistics.
    """
    return service.get_mock_stats()
