# 🌾 Smart Agri Advisor

### **AI-Powered Agentic Crop Intelligence for Indian Farmers**

<div align="center">

[![Framework - React 19](https://img.shields.io/badge/Frontend-React_19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend - FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.127-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![AI Core - Gemini](https://img.shields.io/badge/AI_Core-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Database - SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
[![Live Data - Serper](https://img.shields.io/badge/Grounding-Serper_API-FF6B6B?style=for-the-badge)](https://serper.dev/)
[![Build - Vite 6](https://img.shields.io/badge/Build-Vite_6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License - MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## 🌟 What is Smart Agri Advisor?

**Smart Agri Advisor** is an **Agentic AI** agricultural intelligence platform that empowers Indian farmers with real-time, personalized crop recommendations. Unlike traditional AI apps, this system uses **5 specialized AI agents** that collaborate autonomously to deliver accurate, grounded insights.

### Key Highlights:
- 🗺️ **Map-Based Location Analysis** - Tap anywhere on India to get district-specific crop recommendations
- 🌱 **5-10 Crop Recommendations** - AI-powered suggestions based on soil NPK, pH, and live market demand
- 📈 **Live Mandi Prices** - Real-time price grounding via web search (not outdated training data)
- 📊 **Price Forecasting** - 4-month historical + 4-month future price predictions with interactive charts
- 💬 **Neural Memory Chatbot** - AI that remembers your name, history, and current context
- 📁 **Persistent Reports** - All analyses saved to personal vault with SQLite

---

## 🤖 Agentic AI Architecture

What makes this an **Agentic AI** application? We use **5 specialized agents** that work autonomously:

| Agent | Role | Technology |
|-------|------|------------|
| 🗺️ **Location Agent** | Converts GPS coordinates to district/city names | OpenStreetMap Nominatim API |
| 🌱 **Soil Agent** | Analyzes soil NPK, pH, and moisture levels | Location-based soil profiling |
| 💰 **Mandi Agent** | Searches for LIVE market prices | Serper API (web search) |
| 🧠 **Recommendation Agent** | Generates AI-powered crop suggestions | Google Gemini 2.5 Flash |
| 💾 **Memory Agent** | Stores and retrieves user history | SQLite + SQLAlchemy |

```
USER TAPS ON MAP
       ↓
┌──────────────────────────────────────────────────────────┐
│ Location Agent → Soil Agent → Memory Agent → Mandi Agent │
│                           ↓                              │
│              Recommendation Agent (AI Brain)             │
│                           ↓                              │
│                   Memory Agent (Save)                    │
└──────────────────────────────────────────────────────────┘
       ↓
6 PERSONALIZED CROP RECOMMENDATIONS
```

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **Live Grounding** | Every Mandi price is verified via Serper web search - no hallucination |
| **Personalized AI** | Chatbot knows user name, past searches, and current screen context |
| **District Accuracy** | OpenStreetMap reverse geocoding for precise location detection |
| **Dynamic Dates** | Price charts show exact dates (today's date, not generic months) |
| **Edit Profile** | Users can update their display name anytime |
| **Offline Access** | Once saved, reports work without internet |

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.127.0 | High-performance Python web framework |
| **SQLAlchemy** | 2.0.36 | ORM for SQLite database |
| **google-genai** | 1.56.0 | Google Gemini SDK for AI |
| **Serper API** | - | Live web search for price grounding |
| **OpenStreetMap** | - | Free reverse geocoding |
| **Pydantic** | 2.10.4 | Data validation |
| **Uvicorn** | 0.34.0 | ASGI server |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | Modern UI framework |
| **TypeScript** | 5.8.2 | Type-safe JavaScript |
| **Vite** | 6.2.0 | Lightning-fast build tool |
| **Leaflet** | 1.9.4 | Interactive India map (CDN) |
| **Recharts** | 3.6.0 | Beautiful area charts for price visualization |
| **Custom CSS** | - | Glassmorphism styling with gradients |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

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

Create `.env` file in `backend/` directory:
```env
# Gemini API Key
API_KEY=your_gemini_api_key

# Serper API for web grounding (live Mandi prices)
SERPER_API_KEY=your_serper_key
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
│   ├── app.py                  # FastAPI routes & main server
│   ├── models.py               # SQLAlchemy database models
│   ├── requirements.txt        # Python dependencies
│   ├── smart_agri_advisor.db   # SQLite database (auto-created)
│   └── services/
│       ├── __init__.py         # Package initializer
│       ├── agent_service.py    # Location, Soil, Recommendation agents
│       ├── gemini_service.py   # AI + Mandi Agent (web search)
│       └── db_service.py       # Memory Agent (database ops)
│
├── frontend/
│   ├── App.tsx                 # Main application component
│   ├── types.ts                # TypeScript interfaces
│   ├── index.html              # Entry HTML with Leaflet CDN
│   ├── index.tsx               # React entry point
│   ├── vite.config.ts          # Vite configuration
│   ├── package.json            # Node dependencies
│   ├── components/
│   │   ├── LoginPage.tsx       # Phone authentication
│   │   ├── Header.tsx          # Application header
│   │   ├── CropCard.tsx        # Crop recommendation cards
│   │   ├── CropDetails.tsx     # Detailed analysis modal with charts
│   │   ├── AgriChat.tsx        # AI chatbot interface
│   │   ├── SoilDashboard.tsx   # NPK & pH display gauges
│   │   ├── Resources.tsx       # Agricultural resources
│   │   ├── Marketplace.tsx     # Product marketplace
│   │   ├── DatabaseManager.tsx # Profile & database management
│   │   ├── MapInstructions.tsx # Map usage guide
│   │   └── SkeletonLoaders.tsx # Loading animations
│   └── services/
│       ├── agentService.ts     # Crop analysis API calls
│       ├── geminiService.ts    # AI & details API calls
│       ├── dbService.ts        # Auth & history API calls
│       └── apiConfig.ts        # API base URL configuration
│
├── aadya.md                    # Complete presentation guide
├── DEVELOPER_GUIDE.md          # Developer documentation
├── PROJECT_DOCUMENTATION.html  # Interactive HTML documentation
├── LICENSE                     # MIT License
└── README.md                   # This file
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

### History & Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Fetch saved reports |
| DELETE | `/api/history/{id}` | Delete a report |
| GET | `/api/stats` | Get user statistics |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/ask` | Ask AI chatbot |
| GET | `/api/chat/history` | Get chat history |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Search knowledge base |
| GET | `/api/schemes` | Get government schemes |
| GET | `/api/marketplace` | Search agri products |

---

## 📄 Documentation

For detailed interactive documentation with architecture blueprints:

### [👉 VIEW FULL DOCUMENTATION](./PROJECT_DOCUMENTATION.html)

Additional resources:
- [Developer Guide](./DEVELOPER_GUIDE.md) - Setup and development instructions
- [Presentation Guide](./aadya.md) - Complete client presentation script

---

## 🏆 Why Smart Agri Advisor?

| Traditional Apps | Smart Agri Advisor |
|------------------|-------------------|
| Static/outdated prices | Live Mandi grounding via web search |
| Generic recommendations | Location + soil-specific AI analysis |
| Session-based memory | Persistent neural memory (SQLite) |
| Basic UI | Premium glassmorphic design |
| Single AI call | 5 collaborative agents |

---

## 🔒 Security Features

- **Fallback Crops**: Pre-defined recommendations if AI fails
- **JSON Repair**: Auto-fix malformed AI responses
- **Session Management**: Secure phone-based authentication
- **Environment Variables**: All secrets in `.env` files (not in code)

---

## 📱 Screenshots

<details>
<summary>Click to view screenshots</summary>

| Feature | Description |
|---------|-------------|
| **Map View** | Interactive India map with tap-to-analyze |
| **Crop Cards** | 5-10 AI-recommended crops with prices |
| **Price Charts** | 8-month price visualization (past + future) |
| **AI Chat** | Context-aware chatbot with memory |
| **Soil Dashboard** | NPK and pH visualization gauges |

</details>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👩‍💻 Developer

**Aadya Madankar**  
📧 GitHub: [@Aadya-Madankar](https://github.com/Aadya-Madankar)

---

<div align="center">
  <p><b>🌾 Designed for India. Engineered for Impact. 🌾</b></p>
  <p>© 2025-2026 | Smart Agri Advisor | Built with ❤️ using Agentic AI</p>
</div>
