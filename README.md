# 🌾 Smart Agri Advisor
### **Next-Gen AI Agricultural Intelligence & Market Discovery**

![Premium UI](https://img.shields.io/badge/UI-Modern_Glassmorphism-emerald?style=for-the-badge)
![Grounding](https://img.shields.io/badge/Data-Live_Mandi_Grounding-blue?style=for-the-badge)
![Resilience](https://img.shields.io/badge/System-Key_Rotation_Failover-9f1239?style=for-the-badge)

---

## 🌟 The Vision
**Smart Agri Advisor** is a production-grade AI decision-support system designed to empower Indian farmers with real-time, data-backed intelligence. By combining advanced satellite-style mapping with live web-grounding, it bridge the gap between complex agricultural data and actionable village-level strategy.

> *"Turning raw mandi data into profitable farming decisions through empathetic AI."*

---

## 🚀 Key Innovation Pillars

### 📊 **Hybrid Grounding Engine**
Unlike standard LLMs that hallucinate, our system uses the **Serper API** to scrape live Mandi rates from official portals (`agmarknet`, `enam`) before the AI even starts talking. Your advice is always based on *today's* market, not last year's training data.

### 🛡️ **Autonomous Key Rotation**
Built for 100% uptime. Our backend implements a custom **Resilience Wrapper** that automatically rotates between multiple Gemini API keys if a quota limit is reached. The system never stops working, even during peak usage.

### 🧩 **Linguistic Script-Locking**
Standard AI often leaks Devanagari script into Hinglish responses. Our **Linguistic Enforcement** logic scans user input in real-time and hard-locks the AI's output script to match the farmer's preferred style (Latin vs. Devanagari).

### 📈 **Visual Intelligence**
Powered by **Recharts**, the dashboard provides high-fidelity forecasts for 2026, including **Bearish Risk Lower-Bounds** to help farmers plan for worst-case market scenarios.

---

## 🛠️ Technical Stack

- **Frontend**: React 18 (TypeScript), Vite, Tailwind CSS (Glassmorphic Design), Recharts.
- **Backend**: Python FastAPI, SQLAlchemy (SQLite), Google Gemini 2.5 Pro/Flash.
- **Verification**: Serper API for real-time market evidence.
- **Design**: Premium High-Fidelity Noise Texture + Custom Emerald Design System.

---

## ⚡ Quick Start

### **1. Backend Setup**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate # Windows
source venv/bin/activate # Linux
pip install -r requirements.txt
python app.py
```

### **2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

---

## � Presentation & Interactive Docs
The project includes a high-fidelity interactive documentation suite. This is the **primary resource** for understanding the architecture, presentation scripts, and developer blueprints.

### [👉 OPEN INTERACTIVE DOCUMENTATION 👈](./PROJECT_DOCUMENTATION.html)

---

## 📂 Project Structure
- `backend/`: FastAPI server, database services, and AI orchestrators.
- `frontend/`: Premium React UI with map grounding and persistent chat.
- `DEVELOPER_GUIDE.md`: Deep-dive for presentation demos and code structure.

---
<div align="center">
  <p><b>Smart Agri Advisor | Built with ❤️ for the Indian Farmer</b></p>
  <p>© 2025 | Aadya Madankar</p>
</div>
