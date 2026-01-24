# 🔄 Smart Agri Advisor - Code Flow & Architecture

## System Architecture Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMART AGRI ADVISOR                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         FRONTEND (React)                            │  │
│   │                                                                     │  │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │  │
│   │   │  App.tsx  │  │ CropCard  │  │ AgriChat  │  │  Header   │       │  │
│   │   │  (Main)   │  │   .tsx    │  │   .tsx    │  │   .tsx    │       │  │
│   │   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───────────┘       │  │
│   │         │              │              │                             │  │
│   │         └──────────────┼──────────────┘                             │  │
│   │                        ▼                                            │  │
│   │              ┌─────────────────────┐                                │  │
│   │              │   services/         │                                │  │
│   │              │  - agentService.ts  │  ◄─── API Calls                │  │
│   │              │  - geminiService.ts │                                │  │
│   │              │  - dbService.ts     │                                │  │
│   │              └──────────┬──────────┘                                │  │
│   └─────────────────────────┼───────────────────────────────────────────┘  │
│                             │                                               │
│                             │ HTTP Requests                                 │
│                             ▼                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        BACKEND (FastAPI)                            │  │
│   │                                                                     │  │
│   │   ┌───────────────────────────────────────────────────────────┐    │  │
│   │   │                      app.py                                │    │  │
│   │   │              (API Routes & Endpoints)                      │    │  │
│   │   └───────────────────────────┬───────────────────────────────┘    │  │
│   │                               │                                     │  │
│   │               ┌───────────────┼───────────────┐                     │  │
│   │               ▼               ▼               ▼                     │  │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │  │
│   │   │agent_service  │  │gemini_service │  │  db_service   │          │  │
│   │   │     .py       │  │     .py       │  │     .py       │          │  │
│   │   │               │  │               │  │               │          │  │
│   │   │ • Location    │  │ • Gemini AI   │  │ • SQLite      │          │  │
│   │   │ • Soil        │  │ • Mandi Agent │  │ • Memory      │          │  │
│   │   │ • Recommend   │  │ • Web Search  │  │ • History     │          │  │
│   │   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘          │  │
│   │           │                  │                  │                   │  │
│   └───────────┼──────────────────┼──────────────────┼───────────────────┘  │
│               │                  │                  │                       │
│               ▼                  ▼                  ▼                       │
│   ┌───────────────┐      ┌───────────────┐  ┌───────────────┐              │
│   │ OpenStreetMap │      │ Serper API    │  │    SQLite     │              │
│   │  (Geocoding)  │      │ (Web Search)  │  │   Database    │              │
│   └───────────────┘      │               │  │               │              │
│                          │ Google Gemini │  │  models.py    │              │
│                          │  (AI Model)   │  │   (Tables)    │              │
│                          └───────────────┘  └───────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Flow 1: User Taps on Map (Crop Analysis)

```
USER TAPS ON MAP (Pune: 18.52, 73.85)
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: App.tsx                                                           │
│                                                                             │
│   handleMapClick(lat, lng) {                                                │
│       setLoading(true);                                                     │
│       const result = await runFullAnalysis(phone, lat, lng);  ──────────┐  │
│       setAnalysis(result);                                               │  │
│   }                                                                      │  │
└──────────────────────────────────────────────────────────────────────────┼──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: services/agentService.ts                                          │
│                                                                             │
│   export async function runFullAnalysis(phone, lat, lng) {                  │
│       const response = await fetch('/api/analysis/run', {                   │
│           method: 'POST',                                                   │
│           body: JSON.stringify({ phone, lat, lng })  ───────────────────┐  │
│       });                                                                │  │
│       return response.json();                                            │  │
│   }                                                                      │  │
└──────────────────────────────────────────────────────────────────────────┼──┘
                                                                           │
                        HTTP POST /api/analysis/run                        │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: app.py                                                             │
│                                                                             │
│   @app.post("/api/analysis/run")                                            │
│   async def run_analysis(request: AnalysisRequest):                         │
│       # Call the agent service                                              │
│       result = await agent_service.run_full_analysis(                       │
│           request.phone,                                                    │
│           request.lat,   ──────────────────────────────────────────────┐   │
│           request.lng                                                   │   │
│       )                                                                 │   │
│       return result                                                     │   │
└─────────────────────────────────────────────────────────────────────────┼───┘
                                                                          │
                                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/agent_service.py                                          │
│                                                                             │
│   async def run_full_analysis(phone, lat, lng):                             │
│                                                                             │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 1: LOCATION AGENT                                          │  │
│       │                                                                 │  │
│       │   location = _get_location_info(lat, lng)                       │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   # Calls OpenStreetMap API                                     │  │
│       │   requests.get("nominatim.openstreetmap.org/reverse")           │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   Result: {"district": "Pune", "state": "Maharashtra"}          │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
│                             ▼                                               │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 2: SOIL AGENT                                              │  │
│       │                                                                 │  │
│       │   soil = _get_soil_data(lat, lng)                               │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   Result: {nitrogen: 52, phosphorus: 38, potassium: 145,        │  │
│       │            ph: 6.8, moisture: 45}                               │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
│                             ▼                                               │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/gemini_service.py                                         │
│                                                                             │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 3: MANDI AGENT (Web Search)                                │  │
│       │                                                                 │  │
│       │   mandi_data = _search_web(                                     │  │
│       │       f"best crops {location} Mandi price today"                │  │
│       │   )                                                             │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   # Calls Serper API (Google Search for AI)                     │  │
│       │   requests.post("google.serper.dev/search",                     │  │
│       │       headers={"X-API-KEY": SERPER_KEY},                        │  │
│       │       json={"q": query}                                         │  │
│       │   )                                                             │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   Result: "Tomato ₹4,500... Onion ₹2,800... (from AgMarknet)"   │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
│                             ▼                                               │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 4: RECOMMENDATION AGENT (Gemini AI)                        │  │
│       │                                                                 │  │
│       │   recommendations = _generate_recommendations(                  │  │
│       │       location, soil, mandi_data                                │  │
│       │   )                                                             │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   # Calls Google Gemini 2.5 Flash                               │  │
│       │   client = genai.Client(api_key=API_KEY)                        │  │
│       │   response = client.models.generate_content(                    │  │
│       │       model="gemini-2.5-flash-preview-05-20",                   │  │
│       │       contents=prompt                                           │  │
│       │   )                                                             │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   Result: [{name: "Tomato", price: 4500, confidence: 92%},      │  │
│       │            {name: "Onion", price: 2800, confidence: 88%}, ...]  │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/db_service.py                                             │
│                                                                             │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 5: MEMORY AGENT (Save to Database)                         │  │
│       │                                                                 │  │
│       │   record_id = save_analysis(user_id, {                          │  │
│       │       location, soil, crops, timestamp                          │  │
│       │   })                                                            │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   # SQLite Database (models.py)                                 │  │
│       │   session.add(FarmerRecord(...))                                │  │
│       │   session.commit()                                              │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   Result: "REC-12345678" (saved record ID)                      │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESPONSE FLOWS BACK                                                         │
│                                                                             │
│   Backend returns JSON:                                                     │
│   {                                                                         │
│       "id": "REC-12345678",                                                 │
│       "location": {"district": "Pune", "state": "Maharashtra"},             │
│       "soil": {"nitrogen": 52, "phosphorus": 38, ...},                      │
│       "crops": [                                                            │
│           {"name": "Tomato", "price": 4500, "confidence": 92, ...},         │
│           {"name": "Onion", "price": 2800, "confidence": 88, ...},          │
│           ...                                                               │
│       ]                                                                     │
│   }                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: App.tsx renders CropCard components                               │
│                                                                             │
│   {analysis.crops.map(crop => (                                             │
│       <CropCard                                                             │
│           name={crop.name}                                                  │
│           price={crop.price}                                                │
│           confidence={crop.confidence}                                      │
│           onGetDetails={() => handleGetDetails(crop)}                       │
│       />                                                                    │
│   ))}                                                                       │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│   │  🍅 Tomato  │  │  🧅 Onion   │  │  🍆 Brinjal │   ...                  │
│   │ ₹4,500/q    │  │ ₹2,800/q    │  │ ₹3,200/q    │                        │
│   │ 92% conf    │  │ 88% conf    │  │ 85% conf    │                        │
│   │[Get Plan]   │  │[Get Plan]   │  │[Get Plan]   │                        │
│   └─────────────┘  └─────────────┘  └─────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Flow 2: User Clicks "Get Full Plan" (Crop Details)

```
USER CLICKS "Get Full Plan" ON TOMATO
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: CropCard.tsx                                                      │
│                                                                             │
│   <button onClick={() => onGetDetails(crop)}>                               │
│       Get Full Plan                                                         │
│   </button>                                                                 │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: App.tsx                                                           │
│                                                                             │
│   const handleGetDetails = async (crop) => {                                │
│       const details = await getCropDetails(                                 │
│           crop.name,                                                        │
│           analysis.location,                                                │
│           analysis.soil                                                     │
│       );                                                                    │
│       setSelectedCropDetail(details);                                       │
│   }                                                                         │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: services/geminiService.ts                                         │
│                                                                             │
│   export async function getCropDetails(cropName, location, soil) {          │
│       const response = await fetch('/api/crops/details', {                  │
│           method: 'POST',                                                   │
│           body: JSON.stringify({ cropName, location, soil })                │
│       });                                                                   │
│       return response.json();                                               │
│   }                                                                         │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                        HTTP POST /api/crops/details                       │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: app.py                                                             │
│                                                                             │
│   @app.post("/api/crops/details")                                           │
│   async def get_crop_details(request):                                      │
│       return await gemini_service.get_crop_details(                         │
│           request.cropName,                                                 │
│           request.location,                                                 │
│           request.soil                                                      │
│       )                                                                     │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/gemini_service.py                                         │
│                                                                             │
│   async def get_crop_details(crop_name, location, soil):                    │
│                                                                             │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 1: MANDI AGENT (Search specific crop price)                │  │
│       │                                                                 │  │
│       │   mandi_data = _search_web(                                     │  │
│       │       f"{crop_name} Mandi price {location} January 2026"        │  │
│       │   )                                                             │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   # Serper API searches:                                        │  │
│       │   # - AgMarknet (govt Mandi portal)                             │  │
│       │   # - e-NAM (electronic market)                                 │  │
│       │   # - News articles about prices                                │  │
│       │                     │                                           │  │
│       │                     ▼                                           │  │
│       │   Result: "Tomato Pune: Min ₹3,800 Max ₹5,200 Modal ₹4,500"     │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
│                             ▼                                               │
│       ┌─────────────────────────────────────────────────────────────────┐  │
│       │ STEP 2: GEMINI AI (Generate detailed strategy)                  │  │
│       │                                                                 │  │
│       │   prompt = f"""                                                 │  │
│       │       Crop: {crop_name}                                         │  │
│       │       Location: {location}                                      │  │
│       │       Soil: {soil}                                              │  │
│       │       Live Mandi Data: {mandi_data}                             │  │
│       │                                                                 │  │
│       │       Generate:                                                 │  │
│       │       1. Price chart (4 past + today + 4 future months)         │  │
│       │       2. Cultivation strategy                                   │  │
│       │       3. Fertilizer schedule                                    │  │
│       │       4. Government schemes                                     │  │
│       │       5. Verified source URLs                                   │  │
│       │   """                                                           │  │
│       │                                                                 │  │
│       │   response = client.models.generate_content(prompt)             │  │
│       └─────────────────────────────────────────────────────────────────┘  │
│                             │                                               │
│                             ▼                                               │
│       Return: {                                                             │
│           priceChart: [{month: "Sep 2025", price: 4200}, ...],              │
│           strategy: ["Plant in raised beds...", "Use drip irrigation..."], │
│           fertilizers: ["DAP: 50kg/acre...", "Urea: 25kg/acre..."],         │
│           schemes: ["PM-KISAN: ₹6000/year", "Soil Health Card..."],         │
│           sources: ["https://agmarknet.gov.in/...", ...]                    │
│       }                                                                     │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: CropDetails.tsx (Modal with charts)                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         🍅 TOMATO                                   │  │
│   │                     Pune, Maharashtra                               │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  PRICE CHART (Recharts)                                             │  │
│   │                                                                     │  │
│   │  ₹5000 ┤                    ╭─╮                                     │  │
│   │  ₹4500 ┤              ╭────╯  ╰────╮                               │  │
│   │  ₹4000 ┤         ╭───╯             ╰───╮                           │  │
│   │  ₹3500 ┤    ╭───╯                      ╰───                        │  │
│   │        └────┴────┴────┴────┴────┴────┴────┴────                    │  │
│   │         Sep  Oct  Nov  Dec  Jan  Feb  Mar  Apr                     │  │
│   │                           ▲                                         │  │
│   │                         TODAY                                       │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  📋 CULTIVATION STRATEGY                                            │  │
│   │  • Plant in raised beds for better drainage                         │  │
│   │  • Use drip irrigation, water every 2-3 days                        │  │
│   │  • Apply mulching to retain moisture                                │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  🏛️ GOVERNMENT SCHEMES                                              │  │
│   │  • PM-KISAN: ₹6,000/year direct transfer                            │  │
│   │  • Soil Health Card: Free soil testing                              │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  🔗 VERIFIED SOURCES                                                │  │
│   │  • agmarknet.gov.in • enam.gov.in • mahaagri.gov.in                │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💬 Flow 3: User Asks AI Chatbot

```
USER TYPES: "What did I search yesterday?"
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: AgriChat.tsx                                                      │
│                                                                             │
│   const handleSend = async (message) => {                                   │
│       addMessage({ role: 'user', content: message });                       │
│                                                                             │
│       const response = await askQuestion(                                   │
│           user.phone,                                                       │
│           message,                                                          │
│           {                                                                 │
│               currentTab: activeTab,           // "chat"                    │
│               currentCrop: selectedCrop,       // current crop if any       │
│               recentSearches: history          // past 5 analyses           │
│           },                                                                │
│           chatHistory                          // past messages             │
│       );                                                                    │
│                                                                             │
│       addMessage({ role: 'assistant', content: response });                 │
│   }                                                                         │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: services/geminiService.ts                                         │
│                                                                             │
│   export async function askQuestion(phone, question, context, history) {    │
│       const response = await fetch('/api/chat/ask', {                       │
│           method: 'POST',                                                   │
│           body: JSON.stringify({ phone, question, context, history })       │
│       });                                                                   │
│       return response.json();                                               │
│   }                                                                         │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                        HTTP POST /api/chat/ask                             │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: app.py                                                             │
│                                                                             │
│   @app.post("/api/chat/ask")                                                │
│   async def chat_ask(request):                                              │
│       # Get full user context from Memory Agent                             │
│       user_context = await db_service.get_full_user_context(request.phone)  │
│                                                                             │
│       return await gemini_service.ask_question(                             │
│           request.question,                                                 │
│           user_context,                                                     │
│           request.context,                                                  │
│           request.history                                                   │
│       )                                                                     │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/db_service.py (Memory Agent)                              │
│                                                                             │
│   def get_full_user_context(phone):                                         │
│       user = get_user_by_phone(phone)                                       │
│       recent_records = get_recent_records(user.id, limit=5)                 │
│                                                                             │
│       return {                                                              │
│           "name": user.name,              # "Aadya"                         │
│           "phone": user.phone,            # "9876543210"                    │
│           "past_searches": [                                                │
│               {"location": "Pune", "date": "Jan 24", "crops": [...]},       │
│               {"location": "Nagpur", "date": "Jan 20", "crops": [...]},     │
│           ],                                                                │
│           "total_analyses": 15                                              │
│       }                                                                     │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/gemini_service.py                                         │
│                                                                             │
│   def ask_question(question, user_context, screen_context, chat_history):   │
│                                                                             │
│       prompt = f"""                                                         │
│       You are Smart Agri Advisor AI assistant.                              │
│                                                                             │
│       USER INFO:                                                            │
│       - Name: {user_context['name']}                                        │
│       - Past searches: {user_context['past_searches']}                      │
│                                                                             │
│       CURRENT CONTEXT:                                                      │
│       - User is on: {screen_context['currentTab']} tab                      │
│       - Looking at: {screen_context['currentCrop']}                         │
│                                                                             │
│       CHAT HISTORY:                                                         │
│       {format_history(chat_history)}                                        │
│                                                                             │
│       USER QUESTION: {question}                                             │
│                                                                             │
│       Respond helpfully, using their name and referring to their history.   │
│       """                                                                   │
│                                                                             │
│       response = client.models.generate_content(prompt)                     │
│       return response.text                                                  │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ AI RESPONSE (Context-Aware!)                                                │
│                                                                             │
│   "Hi Aadya! Yesterday you searched for crop recommendations in Pune,       │
│    Maharashtra. The top crops I suggested were:                             │
│                                                                             │
│    1. Tomato - ₹4,500/quintal (92% confidence)                              │
│    2. Onion - ₹2,800/quintal (88% confidence)                               │
│    3. Brinjal - ₹3,200/quintal (85% confidence)                             │
│                                                                             │
│    Would you like me to give you more details about any of these crops?"    │
└─────────────────────────────────────────────────────────────────────────────┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/db_service.py (Save chat message)                         │
│                                                                             │
│   save_chat_message(user_id, "user", question)                              │
│   save_chat_message(user_id, "assistant", response)                         │
│                                                                             │
│   # Chat is now saved for future reference                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flow 4: User Login

```
USER ENTERS PHONE: 9876543210
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: LoginPage.tsx                                                     │
│                                                                             │
│   const handleLogin = async () => {                                         │
│       const user = await login(phone, name);                                │
│       setUser(user);                                                        │
│       navigate('/dashboard');                                               │
│   }                                                                         │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                        HTTP POST /api/auth/login                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: app.py                                                             │
│                                                                             │
│   @app.post("/api/auth/login")                                              │
│   async def login(request):                                                 │
│       return await db_service.login_or_register(                            │
│           request.phone,                                                    │
│           request.name                                                      │
│       )                                                                     │
└──────────────────────────────────────────────────────────────────────────┬──┘
                                                                           │
                                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: services/db_service.py                                             │
│                                                                             │
│   def login_or_register(phone, name):                                       │
│       # Check if user exists                                                │
│       user = session.query(User).filter_by(phone=phone).first()             │
│                                                                             │
│       if user:                                                              │
│           # Existing user - return their info                               │
│           return {"id": user.id, "name": user.name, "isNew": False}         │
│       else:                                                                 │
│           # New user - create account                                       │
│           user = User(phone=phone, name=name, joined_at=datetime.now())     │
│           session.add(user)                                                 │
│           session.commit()                                                  │
│           return {"id": user.id, "name": name, "isNew": True}               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Tables (models.py)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SQLITE DATABASE                                │
│                          smart_agri_advisor.db                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                          TABLE: users                               │  │
│   ├──────────┬──────────────┬───────────────────────────────────────────┤  │
│   │  Column  │    Type      │              Description                  │  │
│   ├──────────┼──────────────┼───────────────────────────────────────────┤  │
│   │  id      │  INTEGER PK  │  Auto-increment primary key               │  │
│   │  phone   │  VARCHAR(15) │  Unique phone number                      │  │
│   │  name    │  VARCHAR(100)│  Farmer's display name                    │  │
│   │  joined_at│ DATETIME    │  Registration timestamp                   │  │
│   └──────────┴──────────────┴───────────────────────────────────────────┘  │
│                                      │                                      │
│                                      │ 1:N                                  │
│                    ┌─────────────────┴─────────────────┐                   │
│                    ▼                                   ▼                   │
│   ┌────────────────────────────────┐  ┌────────────────────────────────┐  │
│   │    TABLE: farmer_records       │  │    TABLE: chat_messages        │  │
│   ├──────────┬─────────────────────┤  ├──────────┬─────────────────────┤  │
│   │  id      │  VARCHAR(20) PK     │  │  id      │  INTEGER PK         │  │
│   │  user_id │  INTEGER FK→users   │  │  user_id │  INTEGER FK→users   │  │
│   │  lat     │  FLOAT              │  │  role    │  VARCHAR(20)        │  │
│   │  lng     │  FLOAT              │  │  content │  TEXT               │  │
│   │  district│  VARCHAR(100)       │  │  timestamp│ DATETIME           │  │
│   │  timestamp│ DATETIME           │  └──────────┴─────────────────────┘  │
│   │  data    │  TEXT (JSON)        │                                      │
│   └──────────┴─────────────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 The 5 Agents Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          5 AGENTIC AI AGENTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │  🗺️ LOCATION    │     │  🌱 SOIL        │     │  💰 MANDI       │       │
│  │     AGENT       │     │     AGENT       │     │     AGENT       │       │
│  │                 │     │                 │     │                 │       │
│  │ File:           │     │ File:           │     │ File:           │       │
│  │ agent_service.py│     │ agent_service.py│     │ gemini_service  │       │
│  │                 │     │                 │     │           .py   │       │
│  │ Function:       │     │ Function:       │     │ Function:       │       │
│  │ _get_location_  │     │ _get_soil_data  │     │ _search_web     │       │
│  │    info()       │     │      ()         │     │      ()         │       │
│  │                 │     │                 │     │                 │       │
│  │ External API:   │     │ Data Source:    │     │ External API:   │       │
│  │ OpenStreetMap   │     │ Location-based  │     │ Serper          │       │
│  │ Nominatim       │     │ soil profiles   │     │ (Web Search)    │       │
│  │                 │     │                 │     │                 │       │
│  │ Input:          │     │ Input:          │     │ Input:          │       │
│  │ lat, lng        │     │ lat, lng        │     │ Search query    │       │
│  │                 │     │                 │     │                 │       │
│  │ Output:         │     │ Output:         │     │ Output:         │       │
│  │ District, State │     │ N, P, K, pH     │     │ Live prices     │       │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘       │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   ▼                                         │
│                    ┌─────────────────────────────┐                          │
│                    │  🧠 RECOMMENDATION AGENT    │                          │
│                    │                             │                          │
│                    │ Files:                      │                          │
│                    │ agent_service.py +          │                          │
│                    │ gemini_service.py           │                          │
│                    │                             │                          │
│                    │ Function:                   │                          │
│                    │ _generate_recommendations() │                          │
│                    │ get_crop_details()          │                          │
│                    │                             │                          │
│                    │ External API:               │                          │
│                    │ Google Gemini 2.5 Flash     │                          │
│                    │                             │                          │
│                    │ Input:                      │                          │
│                    │ Location + Soil + Mandi     │                          │
│                    │                             │                          │
│                    │ Output:                     │                          │
│                    │ Crop recommendations        │                          │
│                    └──────────────┬──────────────┘                          │
│                                   │                                         │
│                                   ▼                                         │
│                    ┌─────────────────────────────┐                          │
│                    │  💾 MEMORY AGENT            │                          │
│                    │                             │                          │
│                    │ File:                       │                          │
│                    │ db_service.py               │                          │
│                    │                             │                          │
│                    │ Functions:                  │                          │
│                    │ save_analysis()             │                          │
│                    │ get_history()               │                          │
│                    │ get_full_user_context()     │                          │
│                    │ save_chat_message()         │                          │
│                    │                             │                          │
│                    │ Database:                   │                          │
│                    │ SQLite (models.py)          │                          │
│                    │                             │                          │
│                    │ Stores:                     │                          │
│                    │ Users, Records, Chat        │                          │
│                    └─────────────────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WHY THIS IS AGENTIC AI                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ TOOL USE                                                         │   │
│  │     Agents use external tools: Web Search, Maps API, Database       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ AUTONOMY                                                         │   │
│  │     Agents decide what to search, what data to use                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ MEMORY                                                           │   │
│  │     System remembers users, past searches, conversations            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ COLLABORATION                                                    │   │
│  │     5 agents pass data to each other, work as a team                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ GROUNDING                                                        │   │
│  │     AI responses are grounded in REAL web data, not just training   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*This flowchart shows exactly how code flows from frontend to backend, through all 5 agents, and back to the user.*
