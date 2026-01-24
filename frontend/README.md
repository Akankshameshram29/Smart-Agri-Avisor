# 🎨 Smart Agri Advisor - Frontend

<div align="center">

**React 19 + Vite Powered Premium Agricultural Intelligence UI**

[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-3.6.0-FF6B6B?style=flat-square)](https://recharts.org/)

</div>

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

Create a `.env.local` file in the `frontend/` directory (optional):

```env
# Gemini API Key (for direct client-side calls if needed)
VITE_GEMINI_API_KEY=your_gemini_key

# Backend API URL (default: http://localhost:8000)
VITE_API_URL=http://localhost:8000
```

> **Note**: Most API calls go through the backend. Direct Gemini access is optional.

---

## 📁 Project Structure

```
frontend/
├── App.tsx                 # Main application component (state management)
├── index.tsx               # React entry point
├── index.html              # HTML template with Leaflet CDN
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
├── noise.jpg               # Background texture
│
├── components/
│   ├── Header.tsx          # Navigation bar with user info
│   ├── LoginPage.tsx       # Phone + OTP authentication
│   ├── CropCard.tsx        # Crop recommendation card
│   ├── CropDetails.tsx     # Detailed analysis modal with price charts
│   ├── SoilDashboard.tsx   # NPK & pH visualization gauges
│   ├── AgriChat.tsx        # AI chatbot interface with typewriter effect
│   ├── Resources.tsx       # Knowledge base & articles
│   ├── Marketplace.tsx     # Product marketplace search
│   ├── DatabaseManager.tsx # Profile panel with edit name
│   ├── MapInstructions.tsx # Map usage guide tooltip
│   └── SkeletonLoaders.tsx # Loading animation components
│
├── services/
│   ├── agentService.ts     # /api/analysis calls
│   ├── geminiService.ts    # /api/crops, /api/chat calls
│   ├── dbService.ts        # /api/auth, /api/history calls
│   └── apiConfig.ts        # Base URL configuration
│
└── public/
    └── docs.html           # In-app documentation page
```

---

## 🧩 Key Components

### `App.tsx` - Main Application
- **State Management**: User, analysis, history, chat messages
- **Tab Navigation**: Dashboard, Chat, Reports, Knowledge, Docs
- **Interactive Map**: Leaflet integration (CDN loaded in index.html)
- **India Geo-fencing**: Restricts taps to valid Indian coordinates

### `LoginPage.tsx` - Authentication
- Phone number input with validation
- Simulated OTP verification flow
- Name registration for new users
- Animated glassmorphic design

### `CropCard.tsx` - Recommendation Cards
- Displays crop name, price, confidence score
- AI-generated tips for each crop
- "Get Full Plan" button for detailed analysis
- Hover animations and gradient styling

### `CropDetails.tsx` - Analysis Modal
- **Price Chart**: 4 past months + TODAY + 4 future months (Recharts)
- **Strategy Section**: Bullet-pointed farming advice
- **Government Schemes**: Relevant subsidies and programs
- **Verified Sources**: Links to actual Mandi portals

### `AgriChat.tsx` - AI Chatbot
- Typewriter streaming effect for responses
- Context-aware (knows current tab, current report)
- Markdown formatting support
- Message history with user/assistant bubbles

### `SoilDashboard.tsx` - Soil Visualization
- Circular progress gauges for N, P, K values
- pH level indicator with color coding
- Moisture percentage display
- Animated on data load

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Emerald-600 | `#059669` | Primary actions, buttons |
| Emerald-500 | `#10B981` | Accents, chart lines |
| Slate-900 | `#0F172A` | Dark backgrounds |
| Slate-800 | `#1E293B` | Card backgrounds |
| Slate-100 | `#F1F5F9` | Light text |
| Amber-500 | `#F59E0B` | Warnings, highlights |

### Typography
- **Headings**: Playfair Display (serif) - elegant, premium feel
- **Body**: Inter (sans-serif) - clean, readable

### Effects
- **Glassmorphism**: `backdrop-blur-md`, `bg-white/10`
- **Soft Shadows**: `shadow-xl`, `shadow-2xl`
- **Smooth Transitions**: `transition-all duration-300`
- **Hover Animations**: Scale, glow, color shifts

---

## 📊 State Management

```typescript
// Key application state in App.tsx
const [user, setUser] = useState<User | null>(null);
const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
const [analysis, setAnalysis] = useState<RecommendationResponse | null>(null);
const [history, setHistory] = useState<FarmerRecord[]>([]);
const [selectedCropDetail, setSelectedCropDetail] = useState<CropDetail | null>(null);
const [chatMessages, setChatMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

---

## 🔌 API Integration

### Base URL Configuration
```typescript
// services/apiConfig.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

### Service Functions

**agentService.ts**
```typescript
runFullAnalysis(phone: string, lat: number, lng: number, skipSearch?: boolean)
  → Promise<RecommendationResponse>
```

**geminiService.ts**
```typescript
getCropDetails(cropName: string, location: string, soil: SoilData, phone: string, analysisId: string)
  → Promise<CropDetail>

askQuestion(phone: string, question: string, context: ChatContext, history: Message[])
  → Promise<string>
```

**dbService.ts**
```typescript
login(phone: string, name?: string) → Promise<User>
getHistory(phone: string) → Promise<FarmerRecord[]>
updateUserName(phone: string, name: string) → Promise<User>
deleteRecord(phone: string, recordId: string) → Promise<void>
```

---

## 📦 Dependencies

### Production
```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "recharts": "^3.6.0",
  "@google/genai": "^1.34.0"
}
```

### CDN Dependencies (loaded in index.html)
- **Leaflet 1.9.4**: Interactive map for India location selection
- **Font Awesome 6.x**: Icons throughout the UI
- **Google Fonts**: Inter & Playfair Display

### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^5.0.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

---

## 🏗️ Build Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

---

## 🗺️ Map Integration

The interactive India map uses **Leaflet** loaded via CDN:

```html
<!-- index.html -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

**Features**:
- Tap anywhere on India to get coordinates
- Geo-fencing to valid Indian bounds
- Custom marker for selected location
- Smooth zoom and pan controls

---

## 📱 Responsive Design

The UI is fully responsive:

| Breakpoint | Layout |
|------------|--------|
| `< 640px` | Mobile - Single column, stacked cards |
| `640px - 1024px` | Tablet - 2-column grid |
| `> 1024px` | Desktop - Full layout with sidebar |

---

## 🔧 Development Tips

### Hot Reload
Vite provides instant hot module replacement. Changes to components update immediately without full page refresh.

### Type Safety
All components use TypeScript. Run type checking with:
```bash
npx tsc --noEmit
```

### Adding New Components
1. Create component in `components/` folder
2. Add TypeScript interface in `types.ts`
3. Import in `App.tsx`
4. Follow existing naming conventions

---

## 📞 Support

**Developer**: Aadya Madankar  
**GitHub**: https://github.com/Aadya-Madankar/Smart-Agri-Avisor

---

<div align="center">
  <p>Part of <b>Smart Agri Advisor</b> - Premium Agentic AI for Indian Agriculture</p>
</div>
