# 🔧 Smart Agri Advisor - Backend

**FastAPI-powered API server for agricultural intelligence**

---

## 🚀 Quick Start

```bash
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file (see below)

# Start server
python app.py
```

Server runs at: `http://localhost:5000`

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Gemini API Keys (comma-separated for rotation)
GEMINI_KEYS=key1,key2,key3

# Primary API Key (fallback)
API_KEY=your_gemini_key

# Serper API for web grounding
SERPER_API_KEY=your_serper_key

# JWT Secret for sessions
SECRET_KEY=your_secret_key

# Database URL (empty = SQLite)
DATABASE_URL=

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 📁 Project Structure

```
backend/
├── app.py              # FastAPI application & routes
├── models.py           # SQLAlchemy database models
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (not in git)
├── .env.example        # Example env file
└── services/
    ├── agent_service.py    # Analysis orchestration
    ├── gemini_service.py   # Gemini AI integration
    └── db_service.py       # Database operations
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login or register user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/update-name` | Update display name |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/run` | Run full crop analysis |
| POST | `/api/crops/details` | Get detailed crop insights |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get user's saved reports |
| DELETE | `/api/history/{id}` | Delete a report |
| GET | `/api/stats` | Get user statistics |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/ask` | Ask AI a question |
| GET | `/api/chat/history` | Get chat history |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Search knowledge articles |
| GET | `/api/schemes` | Get government schemes |
| GET | `/api/marketplace` | Search agri products |

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| phone | String(15) | Unique phone number |
| name | String(100) | Display name |
| joined_at | DateTime | Registration date |

### FarmerRecords Table
| Column | Type | Description |
|--------|------|-------------|
| id | String(20) | Record ID (REC-XXXXXXXX) |
| user_id | Integer | Foreign key to users |
| lat | Float | Latitude |
| lng | Float | Longitude |
| district | String(100) | District name |
| timestamp | DateTime | Created date |
| data | Text | Full analysis JSON |

### ChatMessages Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to users |
| role | String(20) | 'user' or 'assistant' |
| content | Text | Message content |
| timestamp | DateTime | Message time |

---

## 🔄 Key Features

### 1. API Key Rotation
```python
# Automatically rotates through multiple Gemini keys
GEMINI_KEYS=key1,key2,key3
```
If one key exhausts quota, the system switches to the next automatically.

### 2. Live Web Grounding
Uses Serper API to search for real-time Mandi prices before generating recommendations.

### 3. Reverse Geocoding
Uses OpenStreetMap Nominatim (free, no API key) to convert GPS coordinates to district names.

### 4. Neural Memory
The AI chatbot receives full user context including:
- User name and phone
- Past 5 search records
- Current screen context (active tab, current report)

---

## 🛠️ Dependencies

```
fastapi==0.115.0
uvicorn==0.30.0
sqlalchemy==2.0.35
python-dotenv==1.0.1
google-genai==1.3.0
requests==2.32.0
python-dateutil==2.9.0
pydantic==2.9.0
```

---

## 📞 Support

**Developer**: Aadya Madankar  
**GitHub**: https://github.com/Aadya-Madankar/Smart-Agri-Avisor
