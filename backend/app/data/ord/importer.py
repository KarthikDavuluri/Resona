import argparse
import logging
import uuid
import datetime
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, init_db
from backend.app.models.researcher import Researcher
from backend.app.models.project import Project
from backend.app.models.experiment import Experiment, ExperimentParameter, ExperimentOutcome
from backend.app.models.failure import FailureRecord
from backend.app.data.ord.downloader import ord_downloader
from backend.app.data.ord.parser import ord_parser
from backend.app.data.ord.normalizer import ord_normalizer

logger = logging.getLogger("resona.ord.importer")
logging.basicConfig(level=logging.INFO)

def import_ord_data(sample_size: int = 50, db: Session = None):
    close_session = False
    if db is None:
        init_db()
        db = SessionLocal()
        close_session = True

    try:
        logger.info(f"Starting ORD ingestion pipeline for {sample_size} records...")

        # Ensure default system researcher and project exist
        ord_researcher = db.query(Researcher).filter(Researcher.id == "res_ord_system").first()
        if not ord_researcher:
            ord_researcher = Researcher(
                id="res_ord_system",
                name="Open Reaction Database Ingestion Pipeline",
                email="ord-ingestion@resona.ai",
                institution="Open Reaction Database Project",
                domain_expertise=["organic_synthesis", "reaction_data"]
            )
            db.add(ord_researcher)

        ord_project = db.query(Project).filter(Project.id == "proj_ord_archive").first()
        if not ord_project:
            ord_project = Project(
                id="proj_ord_archive",
                name="Open Reaction Database (ORD) Historical Archive",
                description="Historical reaction records imported directly from Open Reaction Database (ORD)",
                domain="reaction_chemistry"
            )
            db.add(ord_project)

        db.commit()

        # Fetch records
        raw_records = ord_downloader.fetch_sample_ord_records(count=sample_size)
        imported_count = 0
        skipped_count = 0

        for raw_rec in raw_records:
            parsed = ord_parser.parse_reaction(raw_rec)
            norm = ord_normalizer.normalize(parsed)

            source_id = norm["source_id"]
            existing = db.query(Experiment).filter(Experiment.source_id == source_id).first()
            if existing:
                skipped_count += 1
                continue

            exp_id = f"exp_ord_{uuid.uuid4().hex[:8]}"
            experiment = Experiment(
                id=exp_id,
                project_id="proj_ord_archive",
                researcher_id="res_ord_system",
                experiment_name=norm["experiment_name"],
                description=f"ORD Record {source_id}: Reaction {norm['reaction_smiles'] or ''}",
                experiment_type="reaction",
                status="completed",
                reaction_smiles=norm["reaction_smiles"],
                source_type="ORD",
                source_id=source_id,
                is_synthetic=False,
                meta_info={"provenance": norm["provenance"]}
            )
            db.add(experiment)
            db.flush()

            # Add parameters
            p1 = ExperimentParameter(
                id=f"p_{uuid.uuid4().hex[:8]}",
                experiment_id=exp_id,
                parameter_name="temperature",
                parameter_value=str(norm["normalized_temperature"]),
                numeric_value=norm["normalized_temperature"],
                unit="degC",
                parameter_type="condition"
            )
            p2 = ExperimentParameter(
                id=f"p_{uuid.uuid4().hex[:8]}",
                experiment_id=exp_id,
                parameter_name="solvent",
                parameter_value=norm["solvent"],
                parameter_type="solvent"
            )
            p3 = ExperimentParameter(
                id=f"p_{uuid.uuid4().hex[:8]}",
                experiment_id=exp_id,
                parameter_name="catalyst",
                parameter_value=norm["catalyst"],
                parameter_type="catalyst"
            )
            db.add_all([p1, p2, p3])

            # Add outcome
            outcome = ExperimentOutcome(
                id=f"out_ord_{uuid.uuid4().hex[:8]}",
                experiment_id=exp_id,
                status=norm["derived_status"],
                yield_percentage=norm["yield_percentage"],
                notes=f"Derived from ORD source record {source_id}",
                uncertainty_level="low",
                derived_label=True,
                derivation_method="ORD_Yield_Threshold_Derivation"
            )
            db.add(outcome)

            # Add failure record if failure status
            if norm["derived_status"] == "failure" and norm["failure_description"]:
                failure = FailureRecord(
                    id=f"fail_ord_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    failure_category="parameter",
                    description=norm["failure_description"],
                    severity="severe",
                    evidence=f"Yield {norm['yield_percentage']}% at temp {norm['normalized_temperature']}degC",
                    confidence_score=0.9
                )
                db.add(failure)

            imported_count += 1

        db.commit()
        logger.info(f"ORD Ingestion complete! Imported: {imported_count}, Skipped (Duplicates): {skipped_count}.")
        return {"imported": imported_count, "skipped": skipped_count}

    finally:
        if close_session and db:
            db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RESONA ORD Dataset Ingestion Pipeline")
    parser.add_argument("--sample-size", type=int, default=50, help="Number of ORD sample records to ingest")
    args = parser.parse_args()
    import_ord_data(sample_size=args.sample_size)
