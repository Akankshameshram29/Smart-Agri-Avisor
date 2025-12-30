from models import User, FarmerRecord, ChatMessage, SessionLocal
from datetime import datetime
import json


class DatabaseService:
    """Database operations for Smart Agri Advisor."""
    
    def get_or_create_user(self, db, phone: str, name: str = "Farmer") -> User:
        """Get existing user or create new one. Updates name if user exists and new name is provided."""
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            user = User(phone=phone, name=name, joined_at=datetime.utcnow())
            db.add(user)
            db.commit()
            db.refresh(user)
        elif name and name != "Farmer" and user.name != name:
            # Update user's name if a new, non-default name is provided
            user.name = name
            db.commit()
            db.refresh(user)
        return user
    
    def update_user_name(self, db, phone: str, new_name: str) -> User:
        """Update an existing user's name."""
        user = db.query(User).filter(User.phone == phone).first()
        if user and new_name and new_name.strip():
            user.name = new_name.strip()
            db.commit()
            db.refresh(user)
        return user
    
    def save_chat_message(self, db, phone: str, role: str, content: str) -> None:
        """Save a chat message to history."""
        user = self.get_or_create_user(db, phone)
        message = ChatMessage(
            user_id=user.id,
            role=role,
            content=content,
            timestamp=datetime.utcnow()
        )
        db.add(message)
        
        # Keep only last 100 messages per user to avoid bloat
        all_msgs = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).order_by(ChatMessage.timestamp.desc()).all()
        if len(all_msgs) > 100:
            for old_msg in all_msgs[100:]:
                db.delete(old_msg)
                
        db.commit()

    def get_chat_history(self, db, phone: str, limit: int = 50) -> list:
        """Retrieve recent chat history for a user."""
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            return []
            
        messages = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).order_by(ChatMessage.timestamp.desc()).limit(limit).all()
        # Return in correct chronological order
        return [m.to_dict() for m in reversed(messages)]

    def save_analysis(self, db, phone: str, record_data: dict) -> None:
        """Save analysis record for a user."""
        if not phone:
            return
            
        user = self.get_or_create_user(db, phone)
        
        # Check if record already exists
        existing = db.query(FarmerRecord).filter(FarmerRecord.id == record_data.get('id')).first()
        if existing:
            existing.set_data(record_data)
            existing.timestamp = datetime.utcnow()
        else:
            record = FarmerRecord(
                id=record_data.get('id'),
                user_id=user.id,
                lat=record_data.get('location', {}).get('latitude', 0),
                lng=record_data.get('location', {}).get('longitude', 0),
                district=record_data.get('location', {}).get('district', 'Unknown'),
                timestamp=datetime.utcnow()
            )
            record.set_data(record_data)
            db.add(record)
        
        # Keep only last 50 records
        all_records = db.query(FarmerRecord).filter(FarmerRecord.user_id == user.id).order_by(FarmerRecord.timestamp.desc()).all()
        if len(all_records) > 50:
            for old_record in all_records[50:]:
                db.delete(old_record)
        
        db.commit()
    
    def update_crop_detail(self, db, phone: str, analysis_id: str, crop_name: str, detail: dict) -> None:
        """Update crop detail for an existing analysis."""
        if not phone:
            return
            
        record = db.query(FarmerRecord).filter(FarmerRecord.id == analysis_id).first()
        if record:
            data = record.get_data()
            if 'crop_details' not in data:
                data['crop_details'] = {}
            data['crop_details'][crop_name] = detail
            record.set_data(data)
            db.commit()
    
    def get_history(self, db, phone: str) -> list:
        """Get all analysis records for a user."""
        if not phone:
            return []
            
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            return []
            
        records = db.query(FarmerRecord).filter(FarmerRecord.user_id == user.id).order_by(FarmerRecord.timestamp.desc()).all()
        return [r.to_dict() for r in records]
    
    def get_regional_patterns(self, db, phone: str, district: str) -> str:
        """Get regional patterns from user history."""
        history = self.get_history(db, phone)
        regional_records = [r for r in history if r.get('district') == district]
        
        if not regional_records:
            return "No specific local history found in your vault for this district."
        
        patterns = []
        for r in regional_records[:3]:
            data = r.get('data', {})
            crops = data.get('crops', [])
            crop_str = ", ".join([f"{c.get('name')} (Rs.{c.get('current_price')})" for c in crops])
            timestamp = r.get('timestamp', '')
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    date_str = dt.strftime('%d/%m/%Y')
                except:
                    date_str = timestamp[:10]
            else:
                date_str = 'Unknown'
            patterns.append(f"On {date_str}: {crop_str}")
        
        return " | ".join(patterns)
    
    def get_search_count(self, db, phone: str) -> int:
        """Get total number of searches by user."""
        if not phone:
            return 0
            
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            return 0
            
        return db.query(FarmerRecord).filter(FarmerRecord.user_id == user.id).count()
    
    def delete_record(self, db, phone: str, record_id: str) -> bool:
        """Delete a specific record."""
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            return False
            
        record = db.query(FarmerRecord).filter(FarmerRecord.id == record_id, FarmerRecord.user_id == user.id).first()
        if record:
            db.delete(record)
            db.commit()
            return True
        return False


db_service = DatabaseService()
