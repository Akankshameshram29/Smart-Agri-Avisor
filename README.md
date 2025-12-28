# Smart Agri Advisor: AI-Powered Mandi Expert 🌾

[![V1.0.0 Production Release](https://img.shields.io/badge/Release-V1.0.0-emerald?style=for-the-badge)](https://github.com/Aadya-Madankar/Smart-Agri-Avisor)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Google_Gemini-blue?style=for-the-badge)](https://ai.google.dev/)
[![Location Strategy](https://img.shields.io/badge/Strategy-Location--Aware-orange?style=for-the-badge)](#)

> **A high-precision AI decision-support system for Indian farmers.** Combining real-time Mandi search grounding with historical price trends and predictive analysis.

---

## 🚀 Vision
Smart Agri Advisor is a **Verification Pipeline** designed to provide farmers with reliable, data-backed agricultural insights. It eliminates AI "hallucinations" by grounding its reasoning in real-time web data (Mandi rates) and personalizing recommendations based on the user's localized search history.

---

## 🛠️ Technological Stack

### **Frontend Layer**
- **React 18 + TypeScript**: For a type-safe, responsive UI.
- **Tailwind CSS**: Modern design system with efficient, utility-first styling.
- **Leaflet Engine**: Interactive map interaction for precise location selection.
- **Recharts**: Data visualization for price history and future trends.

### **Backend & Intelligence**
- **Python FastAPI**: High-performance asynchronous API server.
- **Google Gemini 3.0**: Advanced reasoning engine for geological and agricultural analysis.
- **Hybrid Search Grounding**: Integration with Google Search (via Serper) to fetch live Mandi prices.
- **SQLAlchemy + SQLite**: Robust data persistence for user history and personalization.

---

## ⚙️ How It Works (Actual Mechanism)

1.  **Map-Based Geo-Tagging**: The user selects their farm's location on an interactive map. The system captures the precise geocoordinates (Latitude/Longitude).
2.  **Geo-Resolution**: The AI resolves these coordinates into a specific **Agricultural District and State** in India.
3.  **Live Mandi Grounding**: The system performs a live search for the latest crop prices in the identified district's Mandis.
4.  **Adaptive Personalization**: After 3 searches in a specific region, the system begins to inject historical "regional patterns" from the user's own database into the AI context, providing more personalized advice.
5.  **9-Point Temporal Insight**: Generates a timeline showing 4 months of history, today's verified rate, and a 4-month market projection.

---

## 📊 Comparison: Smart Agri Advisor vs. Traditional Methods

| Feature | Static Apps/Databases | Smart Agri Advisor |
| :--- | :--- | :--- |
| **Price Data** | Often outdated (months old) | **Live Verified Rates** (Refreshed via Search) |
| **Personalization** | Generic for the whole state | **Adaptive** (Learns from your history) |
| **Location** | Manual district selection | **1-Tap Map Pinning** |
| **Forecasting** | Simple averages | **Predictive Analysis** with Risk Bounds |

---

## 💻 Developer Setup

### **1. Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Create .env with Gemini API Key
python app.py
```

### **2. Frontend**
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
├── frontend/            # React TypeScript Application (UI)
├── DEVELOPER_GUIDE.md   # Technical Deep-Dive & Demo Script
├── PROJECT_DOCUMENTATION.html # Project Documentation Archive
└── README.md            # You are here
```

---

*Smart Agri Advisor | © 2025*
