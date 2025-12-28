# AgroSmart Backend - FastAPI Server

This is the Python backend for the AgroSmart Intelligent Crop Advisor.

## Setup

1.  **Create Virtual Environment**
    ```bash
    python -m venv venv
    ```

2.  **Activate Environment**
    ```bash
    # Windows
    .\venv\Scripts\activate
    
    # Linux/macOS
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment**
    Create a `.env` file in this directory:
    ```env
    API_KEY=your_google_gemini_api_key
    SERPER_API_KEY=your_serper_api_key   # Optional
    DATABASE_URL=sqlite:///./agrosmart.db
    CORS_ORIGINS=http://localhost:5173,http://localhost:3000
    ```

5.  **Run the Server**
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:5000`.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analysis/run` | Run full AI crop analysis for a location |
| `POST` | `/api/crops/details` | Get detailed info for a specific crop |
| `GET` | `/api/history?phone=...` | Get analysis history for a user |
| `GET` | `/api/stats?phone=...` | Get user statistics |
| `GET` | `/api/schemes` | Get active government schemes |

---

## Services Architecture

-   **`agent_service.py`**: The AI orchestrator. Handles geo-resolution, hybrid search, and main crop analysis.
-   **`gemini_service.py`**: Direct interface to Google Gemini for crop details, marketplace, and resources.
-   **`db_service.py`**: SQLAlchemy-based database operations for user history.

---

## Notes

-   The `agrosmart.db` file is auto-generated on the first run.
-   The `venv/` folder should **not** be committed to Git.
