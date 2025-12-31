from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json
import os

# Database setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get('DATABASE_URL', f'sqlite:///{os.path.join(BASE_DIR, "smart_agri_advisor.db")}')

# PostgreSQL does not support check_same_thread
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
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
    
    # Relationships
    records = relationship('FarmerRecord', back_populates='user', cascade='all, delete-orphan')
    chat_messages = relationship('ChatMessage', back_populates='user', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'phone': self.phone,
            'name': self.name,
            'joinedAt': self.joined_at.isoformat() if self.joined_at else None
        }


class ChatMessage(Base):
    """Stored chat messages for a user."""
    __tablename__ = 'chat_messages'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    role = Column(String(20), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship('User', back_populates='chat_messages')

    def to_dict(self):
        return {
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
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
