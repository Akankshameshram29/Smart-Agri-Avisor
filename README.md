# Smart Agri Advisor: Neural Krishi Expert 🌾

[![V1.0.0 Production Release](https://img.shields.io/badge/Release-V1.0.0-emerald?style=for-the-badge)](https://github.com/Aadya-Madankar/Smart-Agri-Avisor)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Google_Gemini-blue?style=for-the-badge)](https://ai.google.dev/)
[![Location Strategy](https://img.shields.io/badge/Strategy-Satellite_Agnostic-orange?style=for-the-badge)](#)

> **The world's first satellite-driven AI Krishi Expert for Indian farmers.** Providing high-fidelity Mandi intelligence and chronological market forecasts.

---

## 🚀 Vision
Smart Agri Advisor is not just a tool; it's a **Verification Pipeline**. It eliminates AI hallucinations by grounding its reasoning in real-time Mandi data fetched directly from the local markets of India. It bridges the gap between complex satellite data and actionable village-level insights.

---

## 🛠️ Advanced Technological Stack

### **Frontend Layer**
- **React 18 + TypeScript**: For a type-safe, ultra-responsive UI engine.
- **Tailwind CSS**: High-fidelity custom design system with Glassmorphism support.
- **Leaflet Engine**: High-performance satellite map interaction for plot detection.
- **Recharts Neural API**: Sophisticated price trend and risk-bound visualizations.

### **Backend & Intelligence**
- **Python FastAPI**: High-concurrency asynchronous server logic.
- **Google Gemini Neural Core**: Running Gemini 1.5/3.0 for multilingual crop analysis.
- **Hybrid Search Grounding**: Real-time Google Search integration for actual Mandi prices.
- **SQLAlchemy + SQLite**: Local-first data persistence for farmer record logs.

---

## ⚙️ Operational Mechanism

1.  **Satellite Plot Lock**: The user navigates the responsive Leaflet map to their village geographical center. Upon tapping the screen, the system fetches high-precision coordinates inside the India boundary.
2.  **Neural Site Search**: The backend initializes a Hybrid Search Orchestration. It triggers native Google Search Grounding to find actual, real-time prices in local Mandis.
3.  **Advanced Forecasting**: Unlike static apps, Smart Agri Advisor performs chronological analysis. It creates a **9-point temporal window**: 4 months of history, today's pivot rate, and a 4-month 2026 forecast.

---

## 📊 Differentiation: Smart Agri Advisor vs. The Old Way

| Feature | Traditional Apps | Smart Agri Advisor Neural |
| :--- | :--- | :--- |
| **Data Recency** | Static databases (6-12 months old) | **Live Search Grounding** (Refreshed hourly) |
| **Forecasting** | No risk-bound/volatility tracking | **2026 AI Projections** with Risk Bounds |
| **Entry Point** | Manual data entry for every plot | **1-Tap Satellite Analysis** |
| **Strategy** | Generic advice (Call help center) | **Hyper-local fertilization & recovery** |

---

## 💻 Developer Analysis & Setup

### **Core Innovation: Hybrid Search**
The primary technical differentiator is our **Verification Pipeline**. We use the Serper API/Google Search Tool as a deterministic layer to fetch raw text from Mandi websites. The LLM (Gemini) acts as the reasoner, parsing this messy web data into a clean JSON structure for our UI.

### **Quick Start**

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Create a .env file
# API_KEY=your_gemini_api_key
# SERPER_API_KEY=your_serper_key
python app.py
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Architecture
```
smart-agri-advisor/
├── backend/             # Python FastAPI Server (Neural Core)
├── frontend/            # React TypeScript Application (High-Fidelity UI)
├── DEVELOPER_GUIDE.md   # Technical Deep-Dive & Demo Script
├── PROJECT_DOCUMENTATION.html # Premium Web Archive of Docs
└── README.md            # You are here
```

---

*Smart Agri Advisor Neural | © 2025*
