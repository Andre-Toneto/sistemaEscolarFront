import { loginRequest } from "@/api/auth.api"

export async function login(nif: string, password: string) {
  const response = await loginRequest({ nif, password })

  localStorage.setItem("token", response.data.token)

  return response.data.user
}