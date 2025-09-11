import axios from "axios";



export const API_BASE = 'http://127.0.0.1:8000';
// Create base API instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",  // root URL of your Django backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

const BASE_URL = "http://127.0.0.1:8000/api"; // your API root

// a small wrapper around fetch
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
