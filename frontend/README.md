# 🎨 Smart Agri Advisor - Frontend

**React 19 + Vite powered premium agricultural intelligence UI**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at: `http://localhost:5173`

---

## ⚙️ Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Gemini API Key (for client-side calls if needed)
GEMINI_API_KEY=your_gemini_key
```

> **Note**: Most API calls go through the backend. This is only for direct Gemini access if configured.

---

## 📁 Project Structure

```
frontend/
├── App.tsx                 # Main application component
├── index.tsx               # React entry point
├── index.html              # HTML template
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies
│
├── components/
│   ├── Header.tsx          # Navigation bar with user info
│   ├── LoginPage.tsx       # Phone + OTP authentication
│   ├── CropCard.tsx        # Crop recommendation card
│   ├── CropDetails.tsx     # Detailed analysis modal with charts
│   ├── SoilDashboard.tsx   # NPK visualization gauges
│   ├── Resources.tsx       # Knowledge base & articles
│   ├── AgriChat.tsx        # AI chatbot interface
│   └── DatabaseManager.tsx # Profile panel with edit name
│
├── services/
│   ├── agentService.ts     # /api/analysis calls
│   ├── geminiService.ts    # /api/crops, /api/chat calls
│   ├── dbService.ts        # /api/auth, /api/history calls
│   └── apiConfig.ts        # Base URL configuration
│
└── public/
    ├── docs.html           # In-app documentation
    └── noise.jpg           # Background texture
```

---

## 🧩 Key Components

### `App.tsx` - Main Application
- State management for user, analysis, history
- Tab navigation (Dashboard, Chat, Reports, Knowledge, Docs)
- Interactive location selection for India
- Coordinates India boundary for geo-fencing

### `LoginPage.tsx` - Authentication
- Phone number input with validation
- Simulated OTP verification
- Name registration for new users

### `CropCard.tsx` - Recommendation Cards
- Displays crop name, price, confidence score
- AI tips for each crop
- "Get Full Plan" button for detailed analysis

### `CropDetails.tsx` - Analysis Modal
- **Price Chart**: 4 past months + TODAY + 4 future months
- **Strategy Section**: Bullet-pointed farming advice
- **Government Schemes**: Relevant subsidies
- **Verified Sources**: Links to actual Mandi portals

### `AgriChat.tsx` - AI Chatbot
- Typewriter streaming effect
- Context-aware (knows current tab, current report)
- Markdown formatting support
- Message history

### `SoilDashboard.tsx` - Soil Visualization
- Circular gauges for N, P, K values
- pH level indicator
- Moisture percentage

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Emerald-600 | `#059669` | Primary actions |
| Emerald-500 | `#10B981` | Accents, charts |
| Slate-900 | `#0F172A` | Dark backgrounds |
| Slate-100 | `#F1F5F9` | Light backgrounds |

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Effects
- Glassmorphism (`backdrop-blur-md`)
- Soft shadows (`shadow-xl`)
- Smooth transitions (`transition-all duration-300`)

---

## 📊 State Management

```typescript
// Key application state
const [user, setUser] = useState<User | null>(null);
const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
const [analysis, setAnalysis] = useState<RecommendationResponse | null>(null);
const [history, setHistory] = useState<FarmerRecord[]>([]);
const [selectedCropDetail, setSelectedCropDetail] = useState<CropDetail | null>(null);
const [chatMessages, setChatMessages] = useState<Message[]>([]);
```

---

## 🔌 API Integration

### Base URL
```typescript
// services/apiConfig.ts
export const API_BASE_URL = 'http://localhost:8000/api';
```

### Key Service Functions

**agentService.ts**
```typescript
runFullAnalysis(phone, lat, lng, skipSearch?) → RecommendationResponse
```

**geminiService.ts**
```typescript
getCropDetails(cropName, location, soil, phone, analysisId) → CropDetail
askQuestion(phone, question, context, history) → string
```

**dbService.ts**
```typescript
login(phone, name) → User
getHistory(phone) → FarmerRecord[]
updateUserName(phone, name) → User
```

---

## 📦 Dependencies

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "recharts": "^3.6.0",
  "@google/genai": "^1.34.0",
  "@clerk/clerk-react": "^5.59.2"
}
```

### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^5.0.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

---

## 🏗️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📞 Support

**Developer**: Aadya Madankar  
**GitHub**: https://github.com/Aadya-Madankar/Smart-Agri-Avisor
