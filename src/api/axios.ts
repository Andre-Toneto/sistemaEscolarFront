import axios from "axios"

// Usar /api para permitir proxy pelo Vite ou fallback dinâmico para o host atual na porta 3000
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  // Se estivermos em produção ou acessando via IP na rede, usamos o mesmo hostname mas na porta 3000
  const { hostname, protocol } = window.location
  return `${protocol}//${hostname}:3000`
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
