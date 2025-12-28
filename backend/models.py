from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json
import os

# Database setup
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///agrosmart.db')
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    """User model for farmer authentication."""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to farmer records
    records = relationship('FarmerRecord', back_populates='user', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'phone': self.phone,
            'name': self.name,
            'joinedAt': self.joined_at.isoformat() if self.joined_at else None
        }


class FarmerRecord(Base):
    """Stored analysis records for farmers."""
    __tablename__ = 'farmer_records'
    
    id = Column(String(20), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    data = Column(Text, nullable=False)  # JSON stored as text
    
    user = relationship('User', back_populates='records')
    
    def get_data(self):
        """Parse JSON data."""
        try:
            return json.loads(self.data)
        except:
            return {}
    
    def set_data(self, data_dict):
        """Serialize data to JSON."""
        self.data = json.dumps(data_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'lat': self.lat,
            'lng': self.lng,
            'district': self.district,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'data': self.get_data()
        }


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
