import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_query_and_proposal_review():
    query_payload = {
        "query": "Have we tried Suzuki coupling at 180degC in DMF?",
        "parameters": {"temperature": 180, "solvent": "DMF"},
        "memory_mode": True
    }
    query_res = client.post("/api/v1/query", json=query_payload)
    assert query_res.status_code == 200
    q_data = query_res.json()
    assert q_data["memory_mode"] == "MEMORY_ON"
    assert "decision_support" in q_data
    assert "confidence" in q_data
    assert "counterfactuals" in q_data

    proposal_payload = {
        "experiment_name": "Proposed High-Temp Reaction",
        "description": "Running coupling reaction at 185degC",
        "proposed_parameters": {"temperature": 185, "solvent": "DMF", "concentration": 0.5},
        "memory_mode": True
    }
    prop_res = client.post("/api/v1/proposals/review", json=proposal_payload)
    assert prop_res.status_code == 200
    p_data = prop_res.json()
    assert "recommendation" in p_data
    assert "counterfactual_suggestions" in p_data
