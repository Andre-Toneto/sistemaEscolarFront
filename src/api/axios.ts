import axios from "axios"

// Usar /api para permitir proxy pelo Vite ou fallback dinâmico para o host atual na porta 3000
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  // Ao usar proxy no Vite ou Nginx, podemos usar o caminho relativo
  return "/api"
}

export const api = axios.create({
  baseURL: getBaseURL()
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
