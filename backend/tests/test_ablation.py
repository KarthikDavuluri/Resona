import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_memory_ablation_mode_comparison():
    payload_memory_on = {
        "query": "Coupling reaction temperature optimization",
        "parameters": {"temperature": 180},
        "memory_mode": True
    }
    payload_memory_off = {
        "query": "Coupling reaction temperature optimization",
        "parameters": {"temperature": 180},
        "memory_mode": False
    }

    res_on = client.post("/api/v1/query", json=payload_memory_on).json()
    res_off = client.post("/api/v1/query", json=payload_memory_off).json()

    assert res_on["memory_mode"] == "MEMORY_ON"
    assert res_off["memory_mode"] == "MEMORY_OFF"

    # Impact metrics endpoint
    impact_res = client.get("/api/v1/impact-metrics")
    assert impact_res.status_code == 200
    impact_data = impact_res.json()
    assert "ablation_study" in impact_data
    assert "with_resona_memory_mode" in impact_data["ablation_study"]
