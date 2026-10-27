# MIZAN — Customer Intelligence Dashboard

MIZAN is a full-stack customer intelligence dashboard designed to explore customer behavior, analyze spending patterns, and understand customer segments using data-driven business insights.

**Live demo:** https://mizan-vercel-deployment.vercel.app/  
**Backend API:** https://mizan-api-sigv.onrender.com/

## Features

- **Customer overview** — summary metrics for customers, revenue, order frequency, and segments.
- **Customer Explorer** — explore customer records and search/filter customer data.
- **Business Insights** — view insights derived from customer segments.
- **Customer segmentation** — display groups identified using K-Means clustering.
- **Interactive dashboard** — charts, metric cards, and a dark/light theme toggle.
- **Full-stack architecture** — React frontend connected to a FastAPI backend and PostgreSQL database.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts, GSAP, Lucide React |
| Backend | Python, FastAPI, Uvicorn |
| Database | PostgreSQL via Supabase |
| Database driver | Psycopg |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Version control | Git and GitHub |

## Architecture

```text
User's browser
     |
     v
React + Vite dashboard (Vercel)
     |
     | HTTPS API requests
     v
FastAPI backend (Render)
     |
     | PostgreSQL connection
     v
Supabase PostgreSQL
```

## Project Structure

```text
mizan-customer-intelligence/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── notebooks/
├── .gitignore
└── README.md
```

## Run Locally

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- A Supabase PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/saubantariq05/mizan-customer-intelligence.git
cd mizan-customer-intelligence
```

### 2. Configure the backend

Create and activate a Python virtual environment from the repository root.

**Windows:**

```bat
python -m venv .venv
.venv\Scripts\activate
```

Install the backend dependencies:

```bat
pip install -r backend/requirements.txt
```

Create `backend/.env` and add your database connection string:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/YOUR_DATABASE
```

Replace the example values with your actual Supabase PostgreSQL connection details. Do not commit `.env` or publish database credentials.

Start the API:

```bat
cd backend
uvicorn main:app --reload
```

The API should be available at `http://127.0.0.1:8000`. Interactive API documentation is usually available at `http://127.0.0.1:8000/docs`.

### 3. Configure the frontend

Open a second terminal:

```bat
cd frontend
npm install
npm run dev
```

Vite will print the local development URL, typically `http://localhost:5173`.

For local development, configure the frontend API base URL to `http://127.0.0.1:8000`. For production, use the deployed Render API URL:

```text
https://mizan-api-sigv.onrender.com
```

### 4. Database setup

The backend expects the PostgreSQL tables and columns used by its queries to exist in your Supabase database. Configure `DATABASE_URL` with a connection string that has the necessary access. Consult the application code for the exact schema and query requirements.

## Deployment

- **Frontend:** deployed on Vercel from the `frontend` directory.
- **Backend:** deployed on Render using `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- **Database:** hosted by Supabase PostgreSQL.

For production, set `DATABASE_URL` in the Render service's environment variables. Configure FastAPI CORS to allow the exact deployed frontend origin. Keep all secrets in environment variables, not in source code.

Free hosting services may take some time to respond after a period of inactivity.

## Notes

- Dashboard metrics depend on database contents and backend queries; values can change as the data changes.
- Customer segmentation is intended for exploratory and business-intelligence use. Interpret segment labels using the underlying data and clustering analysis.
- Never commit database passwords, API keys, `.env` files, or private customer data.

## Author

**Saubantariq**

GitHub: https://github.com/saubantariq05

---

Built as a full-stack customer analytics and segmentation project.
