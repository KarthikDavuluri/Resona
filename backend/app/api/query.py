import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.query import QueryRequest, QueryResponse, ProposalReviewRequest, ProposalReviewResponse
from backend.app.services.hybrid_retrieval import hybrid_retrieval
from backend.app.services.evidence_analyzer import evidence_analyzer
from backend.app.services.counterfactual_service import counterfactual_engine

router = APIRouter(tags=["Query & Proposals"])

@router.post("/query", response_model=QueryResponse)
def execute_query(req: QueryRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    memory_mode = req.memory_mode if req.memory_mode is not None else True

    # 1. Hybrid Retrieval
    retrieval_res = hybrid_retrieval.search(
        db=db,
        query_text=req.query,
        parameters=req.parameters,
        memory_mode=memory_mode
    )

    ranked_results = retrieval_res["ranked_results"]
    hindsight_memories = retrieval_res["hindsight_memories"]
    provenance = retrieval_res["provenance"]

    # 2. Evidence Analysis
    analysis = evidence_analyzer.analyze_evidence(
        db=db,
        ranked_results=ranked_results,
        proposed_parameters=req.parameters or {},
        hindsight_memories=hindsight_memories
    )

    # 3. Counterfactual Generation
    counterfactuals = counterfactual_engine.generate_counterfactuals(
        db=db,
        proposed_parameters=req.parameters or {},
        ranked_results=ranked_results,
        hindsight_memories=hindsight_memories
    )

    supporting_ev = []
    for item in ranked_results:
        exp = item["experiment"]
        supporting_ev.append({
            "experiment_id": exp.id,
            "experiment_name": exp.experiment_name,
            "outcome": exp.outcome.status if exp.outcome else "unknown",
            "yield": exp.outcome.yield_percentage if exp.outcome else None,
            "relevance_score": item["score"],
            "signals": item["signals"]
        })

    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "query": req.query,
        "memory_mode": "MEMORY_ON" if memory_mode else "MEMORY_OFF",
        "decision_support": analysis["decision_support"],
        "confidence": analysis["confidence"],
        "counterfactuals": counterfactuals,
        "supporting_evidence": supporting_ev,
        "hindsight_memories": hindsight_memories,
        "contradictions": analysis["contradictions"],
        "candidate_directives": [],
        "provenance": provenance,
        "latency_ms": latency_ms
    }

@router.post("/proposals/review", response_model=ProposalReviewResponse)
def review_proposal(req: ProposalReviewRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    memory_mode = req.memory_mode if req.memory_mode is not None else True

    query_str = f"{req.experiment_name} {req.description or ''}"
    
    retrieval_res = hybrid_retrieval.search(
        db=db,
        query_text=query_str,
        parameters=req.proposed_parameters,
        memory_mode=memory_mode
    )

    ranked_results = retrieval_res["ranked_results"]
    hindsight_memories = retrieval_res["hindsight_memories"]
    provenance = retrieval_res["provenance"]

    analysis = evidence_analyzer.analyze_evidence(
        db=db,
        ranked_results=ranked_results,
        proposed_parameters=req.proposed_parameters,
        hindsight_memories=hindsight_memories
    )

    counterfactuals = counterfactual_engine.generate_counterfactuals(
        db=db,
        proposed_parameters=req.proposed_parameters,
        ranked_results=ranked_results,
        hindsight_memories=hindsight_memories
    )

    ds = analysis["decision_support"]
    rec = "Proceed with proposal with baseline parameters."
    if ds["failed_experiments"] > ds["successful_experiments"]:
        rec = "Caution: Historical experiments in this parameter regime show high failure rates. Consider evaluating counterfactual suggestions before proceeding."

    return {
        "proposal": {
            "experiment_name": req.experiment_name,
            "description": req.description,
            "proposed_parameters": req.proposed_parameters
        },
        "memory_mode": "MEMORY_ON" if memory_mode else "MEMORY_OFF",
        "similar_experiments_count": ds["total_similar_experiments"],
        "historical_failures_count": ds["failed_experiments"],
        "historical_successes_count": ds["successful_experiments"],
        "decision_support": ds,
        "confidence": analysis["confidence"],
        "counterfactual_suggestions": counterfactuals,
        "hindsight_recalled_experience": hindsight_memories,
        "provenance": provenance,
        "recommendation": rec,
        "uncertainty_note": "Decision-support recommendations are evidence-backed historical inferences, not guaranteed scientific predictions."
    }
