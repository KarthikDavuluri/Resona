import pytest
from backend.app.services.hindsight_service import hindsight_service

def test_hindsight_service_retain_and_recall():
    payload = {
        "experiment_context": "Suzuki Coupling with NiCl2 catalyst",
        "parameters": {"temperature": 150, "solvent": "Anisole"},
        "observations": ["Homogeneous solution maintained"],
        "outcome": "success",
        "lessons_learned": ["Lower temperature prevents precipitation"]
    }

    retain_res = hindsight_service.retain(payload)
    assert retain_res["status"] == "stored"
    assert "memory_id" in retain_res

    memories = hindsight_service.recall(query="Suzuki Coupling Anisole")
    assert isinstance(memories, list)
    assert len(memories) > 0
