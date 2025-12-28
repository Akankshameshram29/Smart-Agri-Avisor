# Smart Agri Advisor: AI-Powered Mandi Expert 🌾

[![V1.1.0 Production Release](https://img.shields.io/badge/Release-V1.1.0-emerald?style=for-the-badge)](https://github.com/Aadya-Madankar/Smart-Agri-Avisor)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Google_Gemini_2.5-blue?style=for-the-badge)](https://ai.google.dev/)
[![Resilience](https://img.shields.io/badge/API_Rotation-Enabled-green?style=for-the-badge)](#)

> **A high-precision AI decision-support system for Indian farmers.** Combining real-time Mandi search grounding with robust API failovers and an ultra-premium conversational advisor.

---

## 🚀 Vision
Smart Agri Advisor is a **Verification Pipeline** designed to provide farmers with reliable, data-backed agricultural insights. It eliminates AI "hallucinations" by grounding its reasoning in real-time web data and personalizing recommendations based on the user's localized search history.

---

## 🛠️ Technological Stack

### **Frontend Layer**
- **React 18 + TypeScript**: Type-safe, high-performance UI components.
- **Glassmorphic UI Engine**: Custom-built CSS for a premium, lightweight aesthetic.
- **Leaflet Engine**: Interactive map integration for village-level geo-tagging.
- **Improved Charting**: High-fidelity Recharts with dual-unit price tracking (₹/Quintal & ₹/kg).

### **Backend & Intelligence**
- **FastAPI Core**: Asynchronous API handling for rapid response delivery.
- **Adaptive Key Rotation**: Automated failover between multiple Gemini 2.5 API keys to ensure 99.9% uptime.
- **Neural History Engine**: Full conversation memory allowing complex follow-up questions.
- **Multi-Linguistic Flow**: Native support for Hindi, English, and **Hinglish** with automatic style detection.

---

## ⚙️ How It Works (Actual Mechanism)

1.  **Map-Based Geo-Tagging**: Precise geocoordinates capture for local climate context.
2.  **API Resilience Layer**: In-built logic that rotates API keys if rate limits (429) are hit.
3.  **Real-Time Grounding**: Live search for verified rates via Serper, filtered for high authority.
4.  **Empathy-Driven Advisor**: AI system prompt tuned to address farmer problems with respect and practical solutions.
5.  **Standardized Mandi Logic**: Clear distinction between Mandi trading units (Quintal) and consumer/farmer planning units (kg).

---

## 📊 Comparison: Smart Agri Advisor vs. Traditional Methods

| Feature | Static Apps/Databases | Smart Agri Advisor |
| :--- | :--- | :--- |
| **Price Data** | Often outdated (months old) | **Live Verified Rates** (Auto-Grounding) |
| **Resilience** | Fails under load | **Key Rotation Engine** (Zero Downtime) |
| **Conversational Flow** | Command-based/Rigid | **Hinglish/Natural** (Matches User Style) |
| **Context** | Generic | **History-Aware** (Remembers your farm) |

---

## 💻 Developer Setup

### **1. Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure .env with multiple keys for rotation:
# GEMINI_KEYS=key1,key2,key3
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

*Smart Agri Advisor | Built for the Future of Indian Agriculture | © 2025*
