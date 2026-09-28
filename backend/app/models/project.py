import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    domain = Column(String, default="materials_science", index=True)
    meta_info = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    experiments = relationship("Experiment", back_populates="project")
