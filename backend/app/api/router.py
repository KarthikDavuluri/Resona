from fastapi import APIRouter
from backend.app.api.health import router as health_router
from backend.app.api.experiments import router as experiments_router
from backend.app.api.query import router as query_router
from backend.app.api.memory import router as memory_router
from backend.app.api.patterns import router as patterns_router
from backend.app.api.feedback import router as feedback_router
from backend.app.api.impact import router as impact_router
from backend.app.api.audit import router as audit_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(experiments_router)
api_router.include_router(query_router)
api_router.include_router(memory_router)
api_router.include_router(patterns_router)
api_router.include_router(feedback_router)
api_router.include_router(impact_router)
api_router.include_router(audit_router)
