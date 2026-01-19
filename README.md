# 🌾 Smart Agri Advisor
### **AI-Powered Crop Intelligence for Indian Farmers**

[![Framework - React 19](https://img.shields.io/badge/Frontend-React_19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend - FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.127-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![AI Core - Gemini 2.5](https://img.shields.io/badge/AI_Core-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Database - SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
[![Live Data - Serper](https://img.shields.io/badge/Grounding-Serper_API-FF6B6B?style=for-the-badge)](https://serper.dev/)
[![Build - Vite 6](https://img.shields.io/badge/Build-Vite_6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

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
- **FastAPI 0.127.0** - High-performance Python web framework
- **SQLAlchemy 2.0.36** - ORM for SQLite database
- **Google Gemini 2.5 Flash** - AI model for recommendations (google-genai 1.56.0)
- **Serper API** - Live web search for price grounding
- **OpenStreetMap Nominatim** - Free reverse geocoding
- **Pydantic 2.10.4** - Data validation

### Frontend
- **React 19.2.3** - Modern UI framework
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Vite 6.2.0** - Lightning-fast build tool
- **Recharts 3.6.0** - Beautiful area charts for price visualization
- **Custom CSS** - Glassmorphism styling with gradients

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
Server runs at: `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
Smart-Agri-Avisor/
├── backend/
│   ├── app.py                  # FastAPI routes (327 lines)
│   ├── models.py               # SQLAlchemy database models
│   ├── requirements.txt        # Python dependencies
│   ├── smart_agri_advisor.db   # SQLite database
│   └── services/
│       ├── agent_service.py    # Location, Soil, Recommendation agents
│       ├── gemini_service.py   # AI + Mandi Agent (web search)
│       └── db_service.py       # Memory Agent (database ops)
│
├── frontend/
│   ├── App.tsx                 # Main application (30KB)
│   ├── types.ts                # TypeScript interfaces
│   ├── index.html              # Entry HTML
│   ├── vite.config.ts          # Vite configuration
│   ├── components/
│   │   ├── LoginPage.tsx       # Phone authentication
│   │   ├── CropCard.tsx        # Crop recommendation cards
│   │   ├── CropDetails.tsx     # Detailed analysis modal
│   │   ├── AgriChat.tsx        # AI chatbot interface
│   │   ├── Header.tsx          # Application header
│   │   ├── SoilDashboard.tsx   # NPK & pH display
│   │   ├── Resources.tsx       # Agricultural resources
│   │   ├── Marketplace.tsx     # Product marketplace
│   │   ├── DatabaseManager.tsx # Database management
│   │   ├── MapInstructions.tsx # Map usage guide
│   │   └── SkeletonLoaders.tsx # Loading animations
│   └── services/
│       ├── agentService.ts     # Crop analysis API
│       ├── geminiService.ts    # AI & details API
│       ├── dbService.ts        # Auth & history API
│       └── apiConfig.ts        # API configuration
│
├── aadya.md                    # Detailed presentation guide
├── DEVELOPER_GUIDE.md          # Developer documentation
├── PROJECT_DOCUMENTATION.html  # Interactive HTML docs
├── LICENSE                     # MIT License
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
