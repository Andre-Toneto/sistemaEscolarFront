import { loginRequest } from "@/api/auth.api"

export async function login(nif: string, password: string) {
  const response = await loginRequest({ nif, password })

  localStorage.setItem("token", response.data.token)
  localStorage.setItem("user", JSON.stringify(response.data.user))

  return response.data.user
}
