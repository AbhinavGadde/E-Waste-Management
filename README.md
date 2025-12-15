# E-Waste Management & Recycling Portal (Software-Only)

## Tech
- Backend: FastAPI, SQLAlchemy (SQLite), JWT (python-jose), Uvicorn, Pillow, Google Gemini
- Frontend: React (Vite), Tailwind CSS, Axios, React Router, Recharts, React-Leaflet (OpenStreetMap)

## Run (Dev)

```bash
# 1) Backend
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# 2) Frontend
cd ../frontend
npm install
npm run dev  # open shown URL
```

## Notes
- Set `GEMINI_API_KEY` in the backend environment to enable Google Gemini image inspection. 
  - **For local development**: Create a `backend/.env` file with `GEMINI_API_KEY=AIzaSyDuLJv5crUyyD3lvXTG7S3ZONXmqZ-1bLc`
  - **For production**: Set the environment variable in your deployment platform (Railway, Render, etc.)
  - Optionally, override the model with `GEMINI_MODEL_NAME` (defaults to `gemini-1.5-flash-001`). The backend will automatically fall back to other 1.5 Flash variants if the chosen model is unavailable.
- Report uploads are blocked when Gemini determines the photo does not contain e-waste; users receive an invalid image message in that case.
- The ML `/predict` endpoint is a deterministic stub based on image filename hash; replace later as needed.
- Map uses OpenStreetMap via React-Leaflet without any API keys.
- Recycler centers are mock locations stored in the database and can be approved by an Admin.


