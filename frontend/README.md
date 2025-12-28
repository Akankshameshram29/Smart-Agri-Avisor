# AgroSmart Frontend - React Application

This is the React TypeScript frontend for the AgroSmart Intelligent Crop Advisor.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment (Optional)**
    Create a `.env.local` file if you need to override the backend URL:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will start on `http://localhost:5173`.

---

## Project Structure

```
frontend/
├── App.tsx              # Main application component (Map, Dashboard)
├── index.html           # Entry HTML with CDN links
├── index.tsx            # React DOM entry point
├── components/
│   ├── CropCard.tsx     # Individual crop recommendation card
│   ├── CropDetails.tsx  # Detailed crop view with price chart
│   ├── Header.tsx       # Navigation header
│   ├── LoginPage.tsx    # Phone-based authentication
│   ├── Marketplace.tsx  # Agri-marketplace search
│   └── Resources.tsx    # Government schemes and articles
├── services/
│   ├── apiConfig.ts     # Backend API URL configuration
│   ├── agentService.ts  # Calls to /api/analysis/run
│   ├── geminiService.ts # Calls to /api/crops/details
│   └── dbService.ts     # History and stats fetching
└── types.ts             # TypeScript interfaces
```

---

## Key Features

-   **Interactive Map**: Leaflet-based map with India boundary geofencing.
-   **Glassmorphic UI**: Premium design using Tailwind CSS.
-   **Real-Time Charts**: Price history and 2026 forecasts via Recharts.
-   **Multi-Tab Navigation**: Dashboard, Reports, and Knowledge Hub.

---

## Notes

-   Ensure the backend is running on `http://localhost:5000` before starting the frontend.
-   The `node_modules/` folder should **not** be committed to Git.
