import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:1111/api",
});

export default API;