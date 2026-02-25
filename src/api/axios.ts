import axios from "axios"

// Usar /api para permitir proxy pelo Vite ou fallback para localhost:3000
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const api = axios.create({
  baseURL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
