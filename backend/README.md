# 🔧 Smart Agri Advisor - Backend

<div align="center">

**FastAPI-powered Agentic AI API Server for Agricultural Intelligence**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.127.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)

</div>

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

Server runs at: `http://localhost:8000`  
API Documentation: `http://localhost:8000/docs`

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Gemini API Key
API_KEY=your_gemini_api_key

# Serper API for web grounding (live Mandi prices)
SERPER_API_KEY=your_serper_key
```

---

## 🤖 Agent Architecture

The backend implements **5 specialized AI agents** that collaborate:

| Agent | File | Function | Role |
|-------|------|----------|------|
| 🗺️ **Location** | `agent_service.py` | `_get_location_info()` | GPS → District name |
| 🌱 **Soil** | `agent_service.py` | `_get_soil_data()` | NPK, pH analysis |
| 💰 **Mandi** | `gemini_service.py` | `_search_web()` | Live price search |
| 🧠 **Recommendation** | `agent_service.py` | `_generate_recommendations()` | AI crop suggestions |
| 💾 **Memory** | `db_service.py` | All functions | Persistent storage |

### Agent Flow
```
Request → Location Agent → Soil Agent → Memory Agent
                              ↓
                         Mandi Agent (web search)
                              ↓
                      Recommendation Agent (Gemini AI)
                              ↓
                      Memory Agent (save) → Response
```

---

## 📁 Project Structure

```
backend/
├── app.py                  # FastAPI application & routes
├── models.py               # SQLAlchemy database models (ORM)
├── requirements.txt        # Python dependencies
├── smart_agri_advisor.db   # SQLite database file (auto-created)
├── .env                    # Environment variables (not in git)
└── services/
    ├── __init__.py         # Package initializer
    ├── agent_service.py    # Location, Soil, Recommendation agents
    ├── gemini_service.py   # Gemini AI + Mandi Agent (web search)
    └── db_service.py       # Memory Agent (database operations)
```

---

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login or register user |
| `POST` | `/api/auth/logout` | Logout user |
| `POST` | `/api/auth/update-name` | Update display name |

### 🌾 Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analysis/run` | Run full crop analysis |
| `POST` | `/api/crops/details` | Get detailed crop insights with charts |

### 📊 History
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history` | Get user's saved reports |
| `DELETE` | `/api/history/{id}` | Delete a report |
| `GET` | `/api/stats` | Get user statistics |

### 💬 Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/ask` | Ask AI a question |
| `GET` | `/api/chat/history` | Get chat history |

### 📚 Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/resources` | Search knowledge articles |
| `GET` | `/api/schemes` | Get government schemes |
| `GET` | `/api/marketplace` | Search agri products |

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `phone` | String(15) | Unique phone number |
| `name` | String(100) | Display name |
| `joined_at` | DateTime | Registration timestamp |

### FarmerRecords Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | String(20) | Record ID (REC-XXXXXXXX) |
| `user_id` | Integer | Foreign key → users |
| `lat` | Float | Latitude coordinate |
| `lng` | Float | Longitude coordinate |
| `district` | String(100) | District name |
| `timestamp` | DateTime | Created timestamp |
| `data` | Text | Full analysis JSON |

### ChatMessages Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `user_id` | Integer | Foreign key → users |
| `role` | String(20) | 'user' or 'assistant' |
| `content` | Text | Message content |
| `timestamp` | DateTime | Message timestamp |

---

## 🔄 Key Features

### 1. Live Web Grounding
Uses **Serper API** to search for real-time Mandi prices before generating recommendations. Example queries:
- "Tomato Mandi price Pune today"
- "AgMarknet onion rate Maharashtra"
- "e-NAM wheat price January 2026"

### 2. Reverse Geocoding
Uses **OpenStreetMap Nominatim** (free, no API key) to convert GPS coordinates to district names.

### 3. Neural Memory
The AI chatbot receives full user context including:
- User name and phone
- Past 5 search records
- Current screen context (active tab, current report)
- Chat history

### 5. Error Recovery
- **Fallback Crops**: Pre-defined recommendations if AI fails
- **JSON Repair**: Auto-fix malformed AI responses
- **Retry Logic**: Automatic retries on transient failures

---

## 🛠️ Dependencies

```txt
fastapi==0.127.0
uvicorn==0.34.0
sqlalchemy==2.0.36
python-dotenv==1.0.1
google-genai==1.56.0
requests==2.32.3
python-dateutil==2.9.0.post0
pydantic==2.10.4
```

Install all dependencies:
```bash
pip install -r requirements.txt
```

---

## 🧪 Development

### Run in Development Mode
```bash
python app.py
# or with uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### View API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Test Endpoints
```bash
# Health check
curl http://localhost:8000/

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "name": "Test User"}'
```

---

## 📦 External APIs Used

| API | Purpose | Auth Required |
|-----|---------|---------------|
| **Google Gemini** | AI recommendations | API Key (via SDK) |
| **Serper** | Web search for prices | API Key (via HTTP) |
| **OpenStreetMap** | Reverse geocoding | No (FREE!) |

---

## 📞 Support

**Developer**: Aadya Madankar  
**GitHub**: https://github.com/Aadya-Madankar/Smart-Agri-Avisor

---

<div align="center">
  <p>Part of <b>Smart Agri Advisor</b> - Agentic AI for Indian Agriculture</p>
</div>
