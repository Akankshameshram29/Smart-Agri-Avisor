# 🌾 Smart Agri Advisor
### **AI-Powered Crop Intelligence for Indian Farmers**

[![Framework - React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend - FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![AI Core - Gemini 2.5](https://img.shields.io/badge/AI_Core-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Database - SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
[![Live Data - Serper](https://img.shields.io/badge/Grounding-Serper_API-FF6B6B?style=for-the-badge)](https://serper.dev/)

---

## 🌟 What is Smart Agri Advisor?

**Smart Agri Advisor** is an enterprise-grade agricultural intelligence platform that empowers Indian farmers with:

- 🗺️ **Map-Based Location Analysis** - Tap anywhere on India to get district-specific crop recommendations
- 🌱 **5-10 Crop Recommendations** - AI-powered suggestions based on soil NPK, pH, and market demand
- 📈 **Live Mandi Prices** - Real-time price grounding via web search (not outdated training data)
- 📊 **Price Forecasting** - 4-month historical + 4-month future price predictions with charts
- 💬 **Neural Memory Chatbot** - AI that remembers your name, history, and current context
- 📁 **Persistent Reports** - All analyses saved to personal vault with SQLite

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **Live Grounding** | Every Mandi price is verified via Serper web search - no hallucination |
| **Zero Downtime** | Automatic API key rotation (3 keys) ensures 100% uptime |
| **Personalized AI** | Chatbot knows user name, past searches, and current screen context |
| **District Accuracy** | OpenStreetMap reverse geocoding for precise location detection |
| **Dynamic Dates** | Price charts show exact dates (today's date, not generic months) |
| **Edit Profile** | Users can update their display name anytime |

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - ORM for SQLite database
- **Google Gemini 2.5 Flash** - AI model for recommendations
- **Serper API** - Live web search for price grounding
- **OpenStreetMap Nominatim** - Free reverse geocoding

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Recharts** - Beautiful area charts for price visualization
- **Leaflet** - Interactive India map
- **TailwindCSS** - Utility-first styling

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Aadya-Madankar/Smart-Agri-Avisor.git
cd Smart-Agri-Avisor
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

Create `.env` file:
```env
GEMINI_KEYS=your_key_1,your_key_2,your_key_3
API_KEY=your_primary_key
SERPER_API_KEY=your_serper_key
SECRET_KEY=your_secret_key
DATABASE_URL=
```

Start the server:
```bash
python app.py
```
Server runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
Smart-Agri-Avisor/
├── backend/
│   ├── app.py              # FastAPI routes
│   ├── models.py           # Database schema
│   ├── services/
│   │   ├── agent_service.py    # Analysis orchestration
│   │   ├── gemini_service.py   # AI integration
│   │   └── db_service.py       # Database operations
│   └── requirements.txt
│
├── frontend/
│   ├── App.tsx             # Main application
│   ├── components/
│   │   ├── LoginPage.tsx       # Authentication
│   │   ├── CropCard.tsx        # Recommendation cards
│   │   ├── CropDetails.tsx     # Detailed analysis modal
│   │   ├── AgriChat.tsx        # AI chatbot
│   │   └── ...
│   └── services/
│       ├── agentService.ts     # Analysis API
│       ├── geminiService.ts    # AI API
│       └── dbService.ts        # Database API
│
├── PROJECT_DOCUMENTATION.html  # Interactive docs
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login/Register user |
| POST | `/api/analysis/run` | Run crop analysis |
| POST | `/api/crops/details` | Get detailed crop insights |
| GET | `/api/history` | Fetch saved reports |
| DELETE | `/api/history/{id}` | Delete a report |
| POST | `/api/chat/ask` | Ask AI chatbot |
| GET | `/api/chat/history` | Get chat history |
| GET | `/api/resources` | Search knowledge base |
| GET | `/api/marketplace` | Search agri products |

---

## 📄 Documentation

For detailed interactive documentation with architecture blueprints:

### [👉 VIEW FULL DOCUMENTATION](./PROJECT_DOCUMENTATION.html)

---

## 🏆 Why Smart Agri Advisor?

| Traditional Apps | Smart Agri Advisor |
|------------------|-------------------|
| Static/outdated prices | Live Mandi grounding |
| Generic recommendations | Location-specific AI |
| Session-based memory | Persistent neural memory |
| Single API key | Automatic key rotation |
| Basic UI | Premium glassmorphic design |

---

## 👩‍💻 Developer

**Aadya Madankar**  
📧 GitHub: [@Aadya-Madankar](https://github.com/Aadya-Madankar)

---

<div align="center">
  <p><b>Designed for India. Engineered for Impact.</b></p>
  <p>© 2025 | Smart Agri Advisor</p>
</div>
