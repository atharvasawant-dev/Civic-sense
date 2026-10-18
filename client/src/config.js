// Backend address, set at build time. Accepts either variable name, with or
// without a trailing slash or "/api" (e.g. https://my-backend.onrender.com).
// Falls back to the local backend for development.
const raw =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const ORIGIN = raw.replace(/\/+$/, "").replace(/\/api$/, "");

export const BASE_URL = ORIGIN;
export const API_BASE_URL = `${ORIGIN}/api`;
