// Set REACT_APP_API_URL (e.g. https://your-backend.onrender.com) at build time.
// Falls back to the local backend for development.
const ORIGIN = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const BASE_URL = ORIGIN;
export const API_BASE_URL = `${ORIGIN}/api`;
