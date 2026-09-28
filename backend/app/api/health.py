import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db, active_db_dialect
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.embedding_service import embedding_service
from backend.app.workers.redis_stream import redis_broker

router = APIRouter()

@router.get("/health", tags=["Health & System"])
def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive system health check reporting:
    - API Status
    - PostgreSQL / Active Database Dialect
    - Redis Stream Broker
    - Hindsight Experiential Memory Layer (connected / fallback / unavailable)
    - Embedding Service Model
    """
    start_time = time.time()
    
    # DB Status
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = f"healthy ({active_db_dialect})"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Redis Status
    redis_client = redis_broker._get_client()
    redis_status = "connected" if redis_client != "fallback" else "fallback_in_process"

    # Hindsight Status
    hindsight_status = hindsight_service.get_status()

    # Embedding Service Status
    embedding_status = "ready" if embedding_service._model != "fallback" else "fallback_vector"

    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "status": "healthy",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "latency_ms": latency_ms,
        "services": {
            "api": "healthy",
            "database": db_status,
            "redis_broker": redis_status,
            "hindsight_memory": hindsight_status,
            "embedding_model": embedding_status
        }
    }
