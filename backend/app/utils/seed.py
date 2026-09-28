import logging
import uuid
import datetime
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, init_db
from backend.app.models.researcher import Researcher
from backend.app.models.project import Project
from backend.app.models.experiment import Experiment, ExperimentParameter, ExperimentObservation, ExperimentOutcome
from backend.app.models.failure import FailureRecord
from backend.app.models.memory import MemoryEvent, MentalModel, Directive

logger = logging.getLogger("resona.seed")
logging.basicConfig(level=logging.INFO)

def seed_database(db: Session = None):
    close_session = False
    if db is None:
        init_db()
        db = SessionLocal()
        close_session = True

    try:
        logger.info("Seeding database with benchmark synthetic scientific datasets...")

        # 1. Researchers
        r1 = db.query(Researcher).filter(Researcher.id == "res_dr_elena").first()
        if not r1:
            r1 = Researcher(
                id="res_dr_elena",
                name="Dr. Elena Rostova",
                email="elena.rostova@resona.ai",
                institution="Materials Discovery Institute",
                domain_expertise=["catalysis", "organometallics"],
                total_experiments=14,
                reputation_score=1.2
            )
            db.add(r1)

        r2 = db.query(Researcher).filter(Researcher.id == "res_dr_marcus").first()
        if not r2:
            r2 = Researcher(
                id="res_dr_marcus",
                name="Dr. Marcus Vance",
                email="marcus.vance@resona.ai",
                institution="High-Throughput Reaction Lab",
                domain_expertise=["high_pressure", "polymerization"],
                total_experiments=8,
                reputation_score=1.0
            )
            db.add(r2)

        # 2. Projects
        p1 = db.query(Project).filter(Project.id == "proj_palladium_cross_coupling").first()
        if not p1:
            p1 = Project(
                id="proj_palladium_cross_coupling",
                name="High-Temperature Palladium Cross-Coupling Optimization",
                description="Optimization of C-C coupling under high temperature and varying solvent conditions",
                domain="catalysis"
            )
            db.add(p1)

        db.commit()

        # 3. Synthetic Benchmark Experiments (with is_synthetic = True)
        synthetic_benchmarks = [
            {
                "name": "High Temp Suzuki Coupling Run A1",
                "desc": "Cross coupling at 185°C using Pd(PPh3)4 in DMF",
                "temp": 185.0,
                "solvent": "DMF",
                "catalyst": "Pd(PPh3)4",
                "status": "failure",
                "yield": 12.0,
                "failure_cat": "parameter",
                "failure_desc": "Unexpected black palladium metal precipitation occurred within 15 minutes of heating above 180°C."
            },
            {
                "name": "High Temp Suzuki Coupling Run A2",
                "desc": "Cross coupling at 180°C using Pd(PPh3)4 in DMF at 0.5M concentration",
                "temp": 180.0,
                "solvent": "DMF",
                "catalyst": "Pd(PPh3)4",
                "status": "failure",
                "yield": 24.0,
                "failure_cat": "parameter",
                "failure_desc": "Low yield due to rapid catalyst decomposition and premature precipitation."
            },
            {
                "name": "Modified Temp Suzuki Coupling Run B1",
                "desc": "Cross coupling at 160°C using Pd(PPh3)4 in Toluene at 0.25M concentration",
                "temp": 160.0,
                "solvent": "Toluene",
                "catalyst": "Pd(PPh3)4",
                "status": "success",
                "yield": 86.5,
                "failure_cat": None,
                "failure_desc": None
            },
            {
                "name": "Modified Temp Suzuki Coupling Run B2",
                "desc": "Cross coupling at 155°C using NiCl2(dppf) in Anisole at 0.2M concentration",
                "temp": 155.0,
                "solvent": "Anisole",
                "catalyst": "NiCl2(dppf)",
                "status": "success",
                "yield": 91.2,
                "failure_cat": None,
                "failure_desc": None
            }
        ]

        for i, sb in enumerate(synthetic_benchmarks, 1):
            exp_id = f"exp_synth_{i:03d}"
            existing_exp = db.query(Experiment).filter(Experiment.id == exp_id).first()
            if not existing_exp:
                exp = Experiment(
                    id=exp_id,
                    project_id="proj_palladium_cross_coupling",
                    researcher_id="res_dr_elena",
                    experiment_name=sb["name"],
                    description=sb["desc"],
                    experiment_type="reaction",
                    status="completed",
                    source_type="RESONA_SYNTHETIC",
                    is_synthetic=True,
                    meta_info={"benchmark_tag": "synthetic_seed"}
                )
                db.add(exp)
                db.flush()

                # Parameters
                param_temp = ExperimentParameter(
                    id=f"p_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    parameter_name="temperature",
                    parameter_value=str(sb["temp"]),
                    numeric_value=sb["temp"],
                    unit="degC",
                    parameter_type="condition"
                )
                param_solv = ExperimentParameter(
                    id=f"p_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    parameter_name="solvent",
                    parameter_value=sb["solvent"],
                    parameter_type="solvent"
                )
                param_cat = ExperimentParameter(
                    id=f"p_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    parameter_name="catalyst",
                    parameter_value=sb["catalyst"],
                    parameter_type="catalyst"
                )
                db.add_all([param_temp, param_solv, param_cat])

                # Observation
                obs = ExperimentObservation(
                    id=f"obs_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    observation_type="visual",
                    observation_text=sb["failure_desc"] if sb["failure_desc"] else "Clear homogeneous solution maintained throughout heating period.",
                    observed_by="Dr. Elena Rostova"
                )
                db.add(obs)

                # Outcome
                outcome = ExperimentOutcome(
                    id=f"out_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    status=sb["status"],
                    yield_percentage=sb["yield"],
                    notes=f"Synthetic seed experiment {sb['name']}",
                    uncertainty_level="low",
                    derived_label=False
                )
                db.add(outcome)

                # Failure if status == failure
                if sb["status"] == "failure" and sb["failure_desc"]:
                    fail = FailureRecord(
                        id=f"fail_{uuid.uuid4().hex[:8]}",
                        experiment_id=exp_id,
                        failure_category=sb["failure_cat"],
                        description=sb["failure_desc"],
                        severity="severe",
                        confidence_score=0.95
                    )
                    db.add(fail)

                # Memory Event
                mem = MemoryEvent(
                    id=f"me_{uuid.uuid4().hex[:8]}",
                    experiment_id=exp_id,
                    event_type="retain",
                    content=f"Stored synthetic experiment experience {sb['name']}",
                    meta_info={"is_synthetic": True}
                )
                db.add(mem)

        # 4. Directive candidate
        d1 = db.query(Directive).filter(Directive.id == "dir_synth_001").first()
        if not d1:
            d1 = Directive(
                id="dir_synth_001",
                directive_text="Avoid heating organometallic palladium catalyst systems in DMF above 175°C without concentration reduction below 0.3M.",
                reasoning="Historical synthetic benchmarks demonstrate palladium black precipitation and yield loss under high thermal stress.",
                status="candidate",
                confidence=0.88,
                supporting_experiment_ids=["exp_synth_001", "exp_synth_002"]
            )
            db.add(d1)

        db.commit()
        logger.info("Database seeding completed successfully.")

    finally:
        if close_session and db:
            db.close()

if __name__ == "__main__":
    seed_database()
