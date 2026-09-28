import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_experiment_lifecycle():
    # 1. Create Experiment
    payload = {
        "project_id": "proj_palladium_cross_coupling",
        "researcher_id": "res_dr_elena",
        "experiment_name": "Test Reaction 101",
        "description": "Cross coupling test run",
        "experiment_type": "reaction",
        "parameters": [
            {"parameter_name": "temperature", "parameter_value": "170", "numeric_value": 170.0, "unit": "degC"}
        ]
    }
    create_res = client.post("/api/v1/experiments", json=payload)
    assert create_res.status_code == 201
    exp_data = create_res.json()
    exp_id = exp_data["id"]
    assert exp_data["experiment_name"] == "Test Reaction 101"

    # 2. Get Experiment
    get_res = client.get(f"/api/v1/experiments/{exp_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == exp_id

    # 3. Log Outcome
    outcome_payload = {
        "status": "failure",
        "yield_percentage": 18.5,
        "notes": "Low yield due to overheating",
        "uncertainty_level": "low"
    }
    out_res = client.post(f"/api/v1/experiments/{exp_id}/outcome", json=outcome_payload)
    assert out_res.status_code == 200
    assert out_res.json()["status"] == "failure"

    # 4. Log Failure
    fail_payload = {
        "failure_category": "parameter",
        "description": "Thermal decomposition of palladium catalyst above 165degC.",
        "severity": "severe"
    }
    fail_res = client.post(f"/api/v1/experiments/{exp_id}/failure", json=fail_payload)
    assert fail_res.status_code == 200
    assert fail_res.json()["failure_category"] == "parameter"
