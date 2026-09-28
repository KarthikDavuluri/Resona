import logging
from sqlalchemy.orm import Session
from backend.app.services.failure_analysis import failure_analysis_service
from backend.app.services.pattern_service import pattern_service

logger = logging.getLogger("resona.analytics_worker")

class AnalyticsWorker:
    """
    Background Analytics Worker for failure clustering, statistical summaries,
    and pattern discovery.
    """

    def process_analytics(self, db: Session):
        logger.info("AnalyticsWorker: Starting background failure clustering and pattern discovery...")
        clusters = failure_analysis_service.cluster_failures(db)
        patterns_res = pattern_service.discover_patterns(db)
        logger.info(f"AnalyticsWorker completed: {len(clusters)} clusters, {patterns_res.get('new_candidate_directives_count')} new directives generated.")
        return patterns_res

analytics_worker = AnalyticsWorker()
