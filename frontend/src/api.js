import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5096/api", // change if different port
   withCredentials: true, // <--- this allows sending cookies
});

export default api;
