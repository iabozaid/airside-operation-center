from datetime import datetime, timezone
from typing import Dict, Any

class VisitorService:
    def get_zone_density(self) -> Dict[str, Any]:
        """
        Returns stable mock data for visitor density across terminal zones.
        """
        return {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "zones": [
                {
                    "zone_id": "T1-CHECKIN-A",
                    "name": "Terminal 1 Check-in Area A",
                    "density": 1.2,
                    "unit": "pax_per_m2",
                    "count": 450
                },
                {
                    "zone_id": "T1-SECURITY-MAIN",
                    "name": "Terminal 1 Main Security",
                    "density": 2.5,
                    "unit": "pax_per_m2",
                    "count": 120
                },
                {
                    "zone_id": "T1-GATE-B12",
                    "name": "Gate B12 Waiting Area",
                    "density": 0.8,
                    "unit": "pax_per_m2",
                    "count": 85
                }
            ],
            "health": {
                "status": "mock",
                "note": "Placeholder logic for Visitor tracking."
            }
        }
