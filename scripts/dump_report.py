import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.hindsight_service import hindsight_service
from backend.app.database import SessionLocal, init_db
from backend.app.models.experiment import Experiment
from backend.app.models.failure import FailureRecord, PatternCluster

client = TestClient(app)

with open("verification_dump.txt", "w", encoding="utf-8") as f:
    f.write("=== ITEM 1: GET /api/v1/impact-metrics ===\n")
    res1 = client.get("/api/v1/impact-metrics")
    f.write(json.dumps(res1.json(), indent=2))
    f.write("\n\n")

    f.write("=== ITEM 9: POST /api/v1/proposals/review ===\n")
    prop_payload = {
        "experiment_name": "High Temp Suzuki Coupling Run A3",
        "description": "Cross coupling reaction using Pd(PPh3)4 in DMF heated to 185degC",
        "proposed_parameters": {
            "temperature": 185.0,
            "solvent": "DMF",
            "catalyst": "Pd(PPh3)4",
            "concentration": 0.5
        },
        "memory_mode": True
    }
    res9 = client.post("/api/v1/proposals/review", json=prop_payload)
    f.write(json.dumps(res9.json(), indent=2))
    f.write("\n\n")

    f.write("=== ITEM 10: COMPLETE EXPERIMENT LIFECYCLE ===\n")
    # Step A: Proposal Review (Before)
    p_before = client.post("/api/v1/proposals/review", json={
        "experiment_name": "Novel Ni-Catalyzed Polymerization Test",
        "description": "NiCl2 catalyst in THF solvent at 140degC",
        "proposed_parameters": {"temperature": 140.0, "solvent": "THF", "catalyst": "NiCl2"},
        "memory_mode": True
    }).json()
    f.write("PROPOSAL BEFORE EXPERIMENT:\n")
    f.write(json.dumps(p_before, indent=2))
    f.write("\n\n")

    # Step B: Create Exp
    exp_c = client.post("/api/v1/experiments", json={
        "project_id": "proj_palladium_cross_coupling",
        "researcher_id": "res_dr_marcus",
        "experiment_name": "Novel Ni-Catalyzed Polymerization Run 1",
        "description": "Polymerization using NiCl2 in THF at 140degC",
        "experiment_type": "polymerization",
        "parameters": [
            {"parameter_name": "temperature", "parameter_value": "140.0", "numeric_value": 140.0, "unit": "degC"},
            {"parameter_name": "solvent", "parameter_value": "THF"},
            {"parameter_name": "catalyst", "parameter_value": "NiCl2"}
        ]
    }).json()
    exp_id = exp_c["id"]
    f.write(f"CREATED EXPERIMENT ID: {exp_id}\n\n")

    # Step C: Outcome Log
    out_c = client.post(f"/api/v1/experiments/{exp_id}/outcome", json={
        "status": "success",
        "yield_percentage": 94.2,
        "notes": "Optimal yield achieved with zero catalyst degradation.",
        "uncertainty_level": "low"
    }).json()
    f.write("LOGGED OUTCOME (RETAIN TRIGGERED):\n")
    f.write(json.dumps(out_c, indent=2))
    f.write("\n\n")

    # Step D: Proposal After
    p_after = client.post("/api/v1/proposals/review", json={
        "experiment_name": "Scale-up Ni-Catalyzed Polymerization",
        "description": "Scale up of NiCl2 polymerization in THF at 140degC",
        "proposed_parameters": {"temperature": 140.0, "solvent": "THF", "catalyst": "NiCl2"},
        "memory_mode": True
    }).json()
    f.write("FUTURE PROPOSAL REVIEW AFTER RETAIN (RECALL TRIGGERED):\n")
    f.write(json.dumps(p_after, indent=2))
    f.write("\n\n")

print("Dump complete -> verification_dump.txt")
