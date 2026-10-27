
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in backend/.env")

app = FastAPI(
    title="MIZAN Customer Intelligence API",
    description="Customer segmentation and business intelligence",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "https://YOUR-FRONTEND-DOMAIN.vercel.app",
    "https://mizan-vercel-deployment.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection():
    return psycopg.connect(
        DATABASE_URL,
        connect_timeout=10,
        row_factory=dict_row,
    )


def database_error(message: str, error: Exception):
    print(f"{message}: {type(error).__name__}: {error}")
    raise HTTPException(
        status_code=503,
        detail=message,
    )


@app.get("/")
def home():
    return {"message": "MIZAN Customer Intelligence API is running"}


@app.get("/api/summary")
def get_summary():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        COUNT(*) AS total_customers,
                        COALESCE(SUM(monetary), 0) AS total_revenue,
                        COALESCE(AVG(frequency), 0) AS average_frequency,
                        COUNT(DISTINCT cluster) AS total_clusters
                    FROM public.customers
                """)
                result = cur.fetchone()

        return {
            "total_customers": int(result["total_customers"]),
            "total_revenue": round(float(result["total_revenue"]), 2),
            "average_frequency": round(float(result["average_frequency"]), 2),
            "total_clusters": int(result["total_clusters"]),
        }
    except psycopg.Error as error:
        database_error("Could not retrieve dashboard summary", error)


@app.get("/api/segments")
def get_segments():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        cluster,
                        segment_name,
                        description,
                        customer_count,
                        total_revenue,
                        revenue_percentage,
                        avg_recency,
                        avg_frequency,
                        avg_monetary
                    FROM public.cluster_profiles
                    ORDER BY cluster
                """)
                results = cur.fetchall()

        for row in results:
            for key, value in row.items():
                if value is not None and key in {
                    "total_revenue",
                    "revenue_percentage",
                    "avg_recency",
                    "avg_frequency",
                    "avg_monetary",
                }:
                    row[key] = float(value)

        return results
    except psycopg.Error as error:
        database_error("Could not retrieve customer segments", error)


@app.get("/api/customers")
def get_customers(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    search: str = Query(default="", max_length=50),
    cluster: int | None = Query(default=None, ge=0),
):
    # Build parameterized conditions; never insert user input into SQL.
    conditions = []
    params = []

    search = search.strip()
    if search:
        if not search.isdigit():
            raise HTTPException(
                status_code=400,
                detail="Search must be a numeric customer ID.",
            )
        conditions.append("CAST(customer_id AS TEXT) LIKE %s")
        params.append(f"%{search}%")

    if cluster is not None:
        conditions.append("cluster = %s")
        params.append(cluster)

    where_clause = (
        "WHERE " + " AND ".join(conditions)
        if conditions
        else ""
    )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT COUNT(*) AS total
                    FROM public.customers
                    {where_clause}
                    """,
                    params,
                )
                total = int(cur.fetchone()["total"])

                cur.execute(
                    f"""
                    SELECT
                        customer_id,
                        recency,
                        frequency,
                        monetary,
                        cluster
                    FROM public.customers
                    {where_clause}
                    ORDER BY customer_id
                    LIMIT %s OFFSET %s
                    """,
                    params + [limit, offset],
                )
                results = cur.fetchall()

        for row in results:
            if row["monetary"] is not None:
                row["monetary"] = float(row["monetary"])

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "search": search,
            "cluster": cluster,
            "results": results,
        }
    except psycopg.Error as error:
        database_error("Could not retrieve customer records", error)
