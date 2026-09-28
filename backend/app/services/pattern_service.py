import logging
import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.failure import PatternCluster
from backend.app.models.memory import MentalModel, Directive
from backend.app.services.hindsight_service import hindsight_service

logger = logging.getLogger("resona.patterns")

class PatternDiscoveryService:
    """
    Discovers recurring patterns across experiments, synthesizes Mental Models,
    and generates candidate directives requiring explicit researcher approval.
    """

    def discover_patterns(self, db: Session) -> Dict[str, Any]:
        clusters = db.query(PatternCluster).order_by(PatternCluster.last_seen.desc()).all()
        
        # Trigger Hindsight Reflect
        hindsight_reflect = hindsight_service.reflect(domain="materials_catalysis")

        # Generate Candidate Directives from clusters
        new_directives = []
        for cl in clusters:
            if cl.supporting_experiments_count >= 2:
                d_text = f"Before attempting configuration related to '{cl.cluster_name}', inspect parameters to avoid: {cl.description}"
                reason = f"Identified recurring failure pattern supported by {int(cl.supporting_experiments_count)} experiments."
                
                # Check if directive already exists
                existing = db.query(Directive).filter(Directive.directive_text == d_text).first()
                if not existing:
                    directive = Directive(
                        id=f"dir_{uuid.uuid4().hex[:8]}",
                        directive_text=d_text,
                        reasoning=reason,
                        status="candidate",
                        confidence=cl.confidence,
                        supporting_experiment_ids=cl.supporting_experiment_ids
                    )
                    db.add(directive)
                    new_directives.append(directive)
        
        db.commit()

        return {
            "clusters": clusters,
            "hindsight_reflections": hindsight_reflect,
            "new_candidate_directives_count": len(new_directives)
        }

    def approve_directive(self, db: Session, directive_id: str, approved_by: str, status: str) -> Optional[Directive]:
        directive = db.query(Directive).filter(Directive.id == directive_id).first()
        if not directive:
            return None
        
        directive.status = status
        directive.approved_by = approved_by
        directive.updated_at = datetime.datetime.utcnow()
        
        db.commit()
        db.refresh(directive)
        return directive

pattern_service = PatternDiscoveryService()
