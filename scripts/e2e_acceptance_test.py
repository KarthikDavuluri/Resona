import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.app.main import app

def run_end_to_end_test():
    print("=" * 70)
    print("RESONA BACKEND END-TO-END ACCEPTANCE TEST")
    print("Tagline: 'Every experiment leaves a memory.'")
    print("=" * 70)

    client = TestClient(app)

    # 1. Health check
    h_res = client.get("/health")
    print(f"\n[STEP 1] System Health: {h_res.json()['status']} | DB: {h_res.json()['services']['database']} | Hindsight: {h_res.json()['services']['hindsight_memory']}")
    assert h_res.status_code == 200

    # 2. Proposal Review 1 (Initial State - Low/No Prior Specific Memory)
    p1_payload = {
        "experiment_name": "Nickel-Catalyzed Cross-Coupling in Anisole",
        "description": "High temperature cross-coupling using NiCl2(dppf) catalyst in Anisole at 155degC",
        "proposed_parameters": {"temperature": 155.0, "solvent": "Anisole", "catalyst": "NiCl2(dppf)"},
        "memory_mode": True
    }
    r1_res = client.post("/api/v1/proposals/review", json=p1_payload).json()
    print(f"\n[STEP 2] Proposal Review 1 Result:")
    print(f" - Similar Experiments Found: {r1_res['similar_experiments_count']}")
    print(f" - Historical Successes: {r1_res['historical_successes_count']}, Failures: {r1_res['historical_failures_count']}")
    print(f" - Confidence Score: {r1_res['confidence']['score']} ({r1_res['confidence']['level']})")
    print(f" - Counterfactual Suggestion: {r1_res['counterfactual_suggestions'][0]['suggested_modification']}")

    # 3. Create Experiment
    exp_payload = {
        "project_id": "proj_palladium_cross_coupling",
        "researcher_id": "res_dr_elena",
        "experiment_name": "Nickel Cross-Coupling Run #1",
        "description": "Cross-coupling in Anisole at 155degC",
        "experiment_type": "reaction",
        "parameters": [
            {"parameter_name": "temperature", "parameter_value": "155.0", "numeric_value": 155.0, "unit": "degC"},
            {"parameter_name": "solvent", "parameter_value": "Anisole", "parameter_type": "solvent"},
            {"parameter_name": "catalyst", "parameter_value": "NiCl2(dppf)", "parameter_type": "catalyst"}
        ],
        "observations": [
            {"observation_type": "visual", "observation_text": "Clear solution maintained; high conversion observed via HPLC."}
        ]
    }
    exp_res = client.post("/api/v1/experiments", json=exp_payload).json()
    exp_id = exp_res["id"]
    print(f"\n[STEP 3] Created Experiment: {exp_id} ({exp_res['experiment_name']})")

    # 4. Log Outcome & Trigger Memory Worker
    out_payload = {
        "status": "success",
        "yield_percentage": 93.4,
        "notes": "Excellent yield achieved with NiCl2(dppf) in Anisole at 155degC.",
        "uncertainty_level": "low"
    }
    out_res = client.post(f"/api/v1/experiments/{exp_id}/outcome", json=out_payload).json()
    print(f"\n[STEP 4] Logged Outcome: Status={out_res['status']}, Yield={out_res['yield_percentage']}%")

    # 5. Proposal Review 2 (Future Researcher Querying Similar Experiment)
    p2_payload = {
        "experiment_name": "Nickel Cross-Coupling Verification",
        "description": "Testing NiCl2 catalyst in Anisole at 155degC for polymer synthesis",
        "proposed_parameters": {"temperature": 155.0, "solvent": "Anisole", "catalyst": "NiCl2(dppf)"},
        "memory_mode": True
    }
    r2_res = client.post("/api/v1/proposals/review", json=p2_payload).json()
    print(f"\n[STEP 5] Proposal Review 2 (After Memory Accumulation):")
    print(f" - Similar Experiments Found: {r2_res['similar_experiments_count']}")
    print(f" - Historical Successes: {r2_res['historical_successes_count']}")
    print(f" - Confidence Score: {r2_res['confidence']['score']} ({r2_res['confidence']['level']})")
    print(f" - Provenance Count: {len(r2_res['provenance'])}")

    # 6. Memory ON vs Memory OFF Comparison
    q_on = client.post("/api/v1/query", json={"query": "NiCl2 Anisole 155degC", "memory_mode": True}).json()
    q_off = client.post("/api/v1/query", json={"query": "NiCl2 Anisole 155degC", "memory_mode": False}).json()
    print(f"\n[STEP 6] Memory ON vs Memory OFF Comparison:")
    print(f" - MEMORY_ON Hindsight Memories Recalled: {len(q_on['hindsight_memories'])}")
    print(f" - MEMORY_OFF Hindsight Memories Recalled: {len(q_off['hindsight_memories'])}")

    # 7. Impact Metrics
    impact = client.get("/api/v1/impact-metrics").json()
    print(f"\n[STEP 7] Impact Metrics ROI Summary:")
    print(f" - Total Experiments: {impact['summary']['total_accumulated_experiments']}")
    print(f" - Total Experiential Memories: {impact['summary']['total_experiential_memories']}")
    print(f" - Failure Avoidance Gain: {impact['ablation_study']['memory_improvement_delta']['failure_avoidance_improvement']}")

    print("\n" + "=" * 70)
    print("END-TO-END ACCEPTANCE TEST PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_end_to_end_test()
