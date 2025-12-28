# AgroSmart: Intelligent Crop Advisor 🌾

An AI-powered agricultural decision-support system for Indian farmers, built with React, FastAPI, and Google Gemini.

---

## Project Structure

```
agrosmart-neural-advisor/
├── backend/             # Python FastAPI Server
│   ├── app.py           # Main API entry point
│   ├── services/        # AI, Database, and Agent logic
│   └── requirements.txt
│
├── frontend/            # React TypeScript Application
│   ├── App.tsx          # Main Application Component
│   ├── components/      # Reusable UI Components
│   ├── services/        # API client services
│   └── package.json
│
├── DEVELOPER_GUIDE.md   # Technical Deep-Dive & Demo Script
└── README.md            # This file
```

---

## Features

- **Satellite Plot Lock**: Tap-based farm location identification on an interactive Leaflet map.
- **Hybrid AI Grounding**: Uses Google Search to verify real-time Mandi prices before generating recommendations.
- **2026 Price Forecasting**: A 9-point chronological engine showing 4 months of history, today's rate, and 4 months of predictions.
- **Diversified Portfolio**: Provides 5-7 crop options instead of a single recommendation.
- **Fail-Safe Recovery**: Built-in resilience logic for network or API failures.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Leaflet.js |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, SQLite |
| **AI Engine** | Google Gemini (1.5 Flash / 3.0 Preview) |
| **Grounding** | Serper.dev / Google Search API |

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt

# Create a .env file with your API keys
# API_KEY=your_gemini_api_key
# SERPER_API_KEY=your_serper_key (optional)

python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `API_KEY` | Google Gemini API Key | Yes |
| `SERPER_API_KEY` | Serper.dev API Key for live search | No (Recommended) |

---

## License

This project is developed for educational and demonstration purposes.

---

*AgroSmart Neural V1.0.0 | December 2025*
