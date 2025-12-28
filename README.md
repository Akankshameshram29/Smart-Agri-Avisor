# Smart Agri Advisor: AI-Powered Mandi Expert 🌾

[![V1.2.0 Production Release](https://img.shields.io/badge/Release-V1.2.0-emerald?style=for-the-badge)](https://github.com/Aadya-Madankar/Smart-Agri-Avisor)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_1.5_/_2.5-blue?style=for-the-badge)](https://ai.google.dev/)
[![Resilience](https://img.shields.io/badge/API_Rotation-Enabled-green?style=for-the-badge)](#)

> **A high-precision AI decision-support system for Indian farmers.** Combining real-time Mandi search grounding with robust API failovers, persistent chat memory, and a localized multi-linguistic advisor.

---

## 🚀 Vision
Smart Agri Advisor is a **Verification Pipeline** designed to provide farmers with reliable, data-backed agricultural insights. It eliminates AI "hallucinations" by grounding its reasoning in real-time web data and personalizing recommendations based on the user's localized search history.

---

## 🛠️ Technological Stack

### **Frontend Layer**
- **React 18 + TypeScript**: Type-safe, high-performance UI components with lifted-state persistent chat.
- **Glassmorphic UI Engine**: Custom-built CSS for a premium, lightweight aesthetic (optimized for low noise and high readability).
- **Leaflet Engine**: Interactive map integration for village-level geo-output.
- **Improved Charting**: High-fidelity Recharts with dual-unit price tracking (₹/Quintal & ₹/kg).

### **Backend & Intelligence**
- **FastAPI Core**: Asynchronous API handling for rapid response delivery.
- **Adaptive Key Rotation**: Automated failover between multiple Gemini API keys to ensure 99.9% uptime.
- **Neural History Engine**: Full conversation persistence via SQLite (`chat_messages` table), surviving page transitions and sessions.
- **Script-Locking Mechanism**: Advanced logic targeting **Latin vs. Devanagari** script matching for Hin-English continuity.

---

## ⚙️ How It Works (Actual Mechanism)

1.  **Neural Onboarding**: Two-step registration (Name + Phone) with virtual OTP verification to create a personalized farmer profile.
2.  **Persistent Chat Architecture**: Every message is stored in the `smart_agri_advisor.db`, allowing users to resume conversations across different sessions.
3.  **Real-Time Grounding**: Live search for verified rates via Serper, filtered for high authority with ₹/kg standardized pricing.
4.  **Empathy-Driven Advisor**: AI system prompt tuned to match user script and energy—no repetitive "Namaste" or "Kisan Bhai" unless contextually appropriate.
5.  **Simulated Character Streaming**: Premium word-by-word response loading to enhance professional "AI-advisor" feedback.

---

## 📊 Comparison: Smart Agri Advisor vs. Traditional Methods

| Feature | Static Apps/Databases | Smart Agri Advisor |
| :--- | :--- | :--- |
| **Price Data** | Often outdated (months old) | **Live Verified Rates** (Auto-Grounding) |
| **Resilience** | Fails under load | **Key Rotation Engine** (Zero Downtime) |
| **Script Handling**| Rigid Language Toggles | **Script-Locking** (Auto-matches Hinglish/Hindi) |
| **Memory** | Session-only | **Permanent DB Storage** (Survives Refresh/Tabs) |

---

## 💻 Developer Setup

### **1. Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Database and Tables are initialized automatically on first run
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
├── backend/             # Python FastAPI Server (Neural & Persistence Core)
│   ├── smart_agri_advisor.db # Unified SQLite Storage (Users, History, Chats)
│   └── services/        # Gemini, DB, and Script-Locking Logic
├── frontend/            # React TypeScript Application (Premium UI)
├── DEVELOPER_GUIDE.md   # Technical Deep-Dive & Demo Script
├── PROJECT_DOCUMENTATION.html # Project Documentation Archive
└── README.md            # You are here
```

---

*Smart Agri Advisor | Built for the Future of Indian Agriculture | © 2025*
