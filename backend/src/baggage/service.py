from datetime import datetime, timezone
from typing import Dict, Any, Callable

def _default_now_utc() -> datetime:
    return datetime.now(timezone.utc)

class BaggageService:
    def __init__(self, now_utc: Callable[[], datetime] = _default_now_utc):
        """
        Initialize with logical clock for testability.
        """
        self._now_utc = now_utc

    def get_mock_stats(self) -> Dict[str, Any]:
        """
        Returns mock statistics for baggage throughput.
        Data structure is deterministic; timestamp is dynamic based on injected clock.
        """
        return {
            "timestamp_utc": self._now_utc(),
            "throughput": {
                "bags_per_min": 45.5,
                "bags_last_15_min": 680,
                "bags_today": 12500
            },
            "health": {
                "status": "mock",
                "note": "Placeholder logic for Baggage handling metrics."
            }
        }
