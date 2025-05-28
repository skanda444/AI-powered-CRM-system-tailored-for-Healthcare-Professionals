# backend/database.py
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from typing import List, Dict, Any, Optional

# Define your SQLite database URL.
# This will create a file named 'pharma_interactions.db' in the same directory as your main.py
SQLALCHEMY_DATABASE_URL = "sqlite:///./pharma_interactions.db"

# Create the SQLAlchemy engine
# connect_args={"check_same_thread": False} is necessary for SQLite when used with FastAPI
# because FastAPI can run multiple threads concurrently, and SQLite is not thread-safe by default.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declare a base class for your declarative models.
Base = declarative_base()

# Define your SQLAlchemy model for interactions
class Interaction(Base):
    __tablename__ = "interactions" # Name of the table in your database

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, index=True, nullable=True)
    interaction_type = Column(String, nullable=True)
    interaction_date = Column(String, nullable=True) # Storing as string to match your Pydantic schema
    interaction_time = Column(String, nullable=True) # Storing as string to match your Pydantic schema
    products_discussed = Column(JSON, nullable=True) # Store as JSON
    topics_discussed = Column(Text, nullable=True)
    materials_shared = Column(JSON, nullable=True) # Store as JSON
    hcp_sentiment = Column(String, nullable=True)
    follow_up_actions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Interaction(id={self.id}, hcp_name='{self.hcp_name}')>"

    # Helper method to convert model to a dict, aligning with Pydantic output
    def to_dict(self):
        return {
            "hcpName": self.hcp_name,
            "interactionType": self.interaction_type,
            "date": self.interaction_date,
            "time": self.interaction_time,
            "productsDiscussed": self.products_discussed,
            "topicsDiscussed": self.topics_discussed,
            "materialsShared": self.materials_shared,
            "hcpSentiment": self.hcp_sentiment,
            "followUpActions": self.follow_up_actions,
            # 'id', 'created_at', 'updated_at' are typically internal
        }

# Dependency for FastAPI to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create tables (for initial setup)
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)