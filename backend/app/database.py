import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from backend.app.config import settings

logger = logging.getLogger("resona.database")

Base = declarative_base()

def get_engine():
    """
    Creates and returns the SQLAlchemy engine.
    Tries PostgreSQL first; falls back to SQLite if configured and PostgreSQL connection fails.
    """
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("postgresql"):
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3}
            )
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL database.")
            return engine, "postgresql"
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL ({e}). Checking fallback configuration...")

    if settings.USE_SQLITE_FALLBACK_IF_PG_UNAVAILABLE:
        sqlite_url = settings.SQLITE_DB_URL
        logger.info(f"Using SQLite fallback database: {sqlite_url}")
        engine = create_engine(
            sqlite_url,
            connect_args={"check_same_thread": False}
        )
        return engine, "sqlite"
    
    # Re-raise if no fallback allowed
    engine = create_engine(db_url)
    return engine, "postgresql"

engine, active_db_dialect = get_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables and extensions."""
    if active_db_dialect == "postgresql":
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
                conn.commit()
                logger.info("pgvector and pg_trgm extensions initialized.")
        except Exception as e:
            logger.warning(f"Failed to enable PG extensions: {e}")

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized.")

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
