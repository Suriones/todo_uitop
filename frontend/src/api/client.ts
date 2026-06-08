import axios from "axios";

// In production (GitHub Pages): NEXT_PUBLIC_API_URL must point to the deployed backend
// e.g. https://your-app.onrender.com
// In development: falls back to the Next.js proxy at /api (see next.config.ts rewrites)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:4000");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});
