import logging
from sqlalchemy.orm import Session
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.pattern_service import pattern_service

logger = logging.getLogger("resona.reflection_worker")

class ReflectionWorker:
    """
    Background Reflection Worker:
    Triggers Hindsight REFLECT, updates accumulated mental models, and produces candidate directives.
    """

    def process_reflection(self, db: Session, domain: str = "materials_catalysis"):
        logger.info(f"ReflectionWorker: Triggering Hindsight Reflect for domain '{domain}'...")
        reflect_res = hindsight_service.reflect(domain=domain)
        patterns_res = pattern_service.discover_patterns(db)
        logger.info(f"ReflectionWorker completed: {len(reflect_res.get('patterns', []))} reflections processed.")
        return {
            "reflect": reflect_res,
            "patterns": patterns_res
        }

reflection_worker = ReflectionWorker()
