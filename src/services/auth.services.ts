import { loginRequest } from "@/api/auth.api"

export async function login(email: string, password: string) {
  const response = await loginRequest({ email, password })

  localStorage.setItem("token", response.data.token)

  return response.data.user
}