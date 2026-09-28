import sys
import os
import json
import logging

# Ensure backend package is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.hindsight_service import hindsight_service
from backend.app.database import SessionLocal, init_db
from backend.app.data.ord.downloader import ord_downloader
from backend.app.data.ord.parser import ord_parser
from backend.app.data.ord.normalizer import ord_normalizer
from backend.app.data.ord.importer import import_ord_data
from backend.app.services.failure_analysis import failure_analysis_service
from backend.app.models.experiment import Experiment
from backend.app.models.failure import FailureRecord, PatternCluster

client = TestClient(app)

def run_verification():
    print("==================================================================")
    print("RESONA SYSTEM VERIFICATION REPORT - ACTUAL RAW OUTPUTS")
    print("==================================================================")

    # Item 1: GET /api/v1/impact-metrics
    print("\n--- ITEM 1: GET /api/v1/impact-metrics ---")
    res1 = client.get("/api/v1/impact-metrics")
    print(f"Status Code: {res1.status_code}")
    print("JSON Output:")
    print(json.dumps(res1.json(), indent=2))

    # Item 4: Hindsight Status
    print("\n--- ITEM 4: HINDSIGHT INTEGRATION STATUS ---")
    print(f"hindsight_service.get_status(): {hindsight_service.get_status()}")
    print(f"HINDSIGHT_API_KEY set in env: {bool(hindsight_service.api_key)}")
    print(f"HINDSIGHT_BASE_URL: {hindsight_service.base_url}")
    print(f"HINDSIGHT_BANK_ID: {hindsight_service.bank_id}")

    # Item 5: ORD Ingestion Execution
    print("\n--- ITEM 5: ACTUAL ORD INGESTION RESULTS ---")
    raw_records = ord_downloader.fetch_sample_ord_records(count=50)
    parsed_count = 0
    normalized_count = 0
    sample_provenance = []
    
    for r in raw_records:
        p = ord_parser.parse_reaction(r)
        if p:
            parsed_count += 1
            n = ord_normalizer.normalize(p)
            if n:
                normalized_count += 1
                if len(sample_provenance) < 3:
                    sample_provenance.append(n["provenance"])
    
    db = SessionLocal()
    init_db()
    ingest_summary = import_ord_data(sample_size=50, db=db)
    
    ord_in_db = db.query(Experiment).filter(Experiment.source_type == "ORD").count()
    print(f"Downloaded/Read: {len(raw_records)}")
    print(f"Successfully Parsed: {parsed_count}")
    print(f"Successfully Normalized: {normalized_count}")
    print(f"Inserted into DB: {ingest_summary['imported']}")
    print(f"Skipped (Duplicates): {ingest_summary['skipped']}")
    print(f"Total ORD Experiments in Database: {ord_in_db}")
    print(f"Sample Provenance Data: {json.dumps(sample_provenance, indent=2)}")

    # Item 6: ML & Clustering Execution
    print("\n--- ITEM 6: ACTUAL ML RESULTS ---")
    total_exps = db.query(Experiment).count()
    failures = db.query(FailureRecord).all()
    clusters = failure_analysis_service.cluster_failures(db)
    
    print(f"Total Experiments in DB: {total_exps}")
    print(f"Total Failure Records: {len(failures)}")
    print(f"Generated Clusters Count: {len(clusters)}")
    print("DBSCAN Parameters: eps=0.5, min_samples=2, metric='cosine'")
    print("Embedding Model: all-MiniLM-L6-v2 (SentenceTransformers) / hash fallback")
    cluster_details = []
    for c in clusters:
        cluster_details.append({
            "id": c.id,
            "cluster_name": c.cluster_name,
            "algorithm": c.algorithm,
            "supporting_experiments_count": c.supporting_experiments_count,
            "confidence": c.confidence,
            "supporting_experiment_ids": c.supporting_experiment_ids
        })
    print(f"Cluster Details: {json.dumps(cluster_details, indent=2)}")

    # Item 9: POST /api/v1/proposals/review
    print("\n--- ITEM 9: POST /api/v1/proposals/review ACTUAL RESPONSE ---")
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
    print(f"Status Code: {res9.status_code}")
    print("JSON Output:")
    print(json.dumps(res9.json(), indent=2))

    # Item 10: Complete Experiment Lifecycle
    print("\n--- ITEM 10: COMPLETE EXPERIMENT LIFECYCLE EXECUTION ---")
    # Step A: Proposal Review (Before)
    prop1 = client.post("/api/v1/proposals/review", json={
        "experiment_name": "Novel Ni-Catalyzed Polymerization",
        "description": "NiCl2 catalyst in THF solvent at 140degC",
        "proposed_parameters": {"temperature": 140.0, "solvent": "THF", "catalyst": "NiCl2"},
        "memory_mode": True
    }).json()
    print("A. Proposal Review Before Experiment:")
    print(f"   Similar Exps Found: {prop1['similar_experiments_count']}")
    print(f"   Confidence: {prop1['confidence']['score']} ({prop1['confidence']['level']})")

    # Step B: Create Experiment
    created_exp = client.post("/api/v1/experiments", json={
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
    exp_id = created_exp["id"]
    print(f"B. Created Experiment: ID={exp_id}")

    # Step C: Log Outcome -> Triggers Hindsight RETAIN
    out_res = client.post(f"/api/v1/experiments/{exp_id}/outcome", json={
        "status": "success",
        "yield_percentage": 94.2,
        "notes": "Optimal yield achieved with zero catalyst degradation.",
        "uncertainty_level": "low"
    }).json()
    print(f"C. Logged Outcome (Triggered RETAIN): Status={out_res['status']}, Yield={out_res['yield_percentage']}%")

    # Step D: Future Proposal Review -> Triggers Hindsight RECALL
    prop2 = client.post("/api/v1/proposals/review", json={
        "experiment_name": "Scale-up Ni-Catalyzed Polymerization",
        "description": "Scale up of NiCl2 polymerization in THF at 140degC",
        "proposed_parameters": {"temperature": 140.0, "solvent": "THF", "catalyst": "NiCl2"},
        "memory_mode": True
    }).json()
    print("D. Future Proposal Review After RETAIN (Triggered RECALL):")
    print(f"   Similar Exps Found: {prop2['similar_experiments_count']}")
    print(f"   Historical Successes: {prop2['historical_successes_count']}")
    print(f"   Confidence Score: {prop2['confidence']['score']} ({prop2['confidence']['level']})")
    print(f"   Recalled Memories Count: {len(prop2['hindsight_recalled_experience'])}")
    if prop2['hindsight_recalled_experience']:
        print(f"   Sample Recalled Memory: {json.dumps(prop2['hindsight_recalled_experience'][0], indent=2)}")

    db.close()

if __name__ == "__main__":
    run_verification()
