import axios from "axios";

//export const BASE_URL = "http://localhost:1111"; 
export const BASE_URL = "https://ai-travel-app-backend-l7ji.onrender.com";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});

export default API;