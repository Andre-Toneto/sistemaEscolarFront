import { loginRequest, forgotPasswordRequest, changePasswordRequest, getBirthdaysRequest } from "@/api/auth.api"
import { initSocket } from "@/services/socket.services"
import { registerSocketListeners } from "@/services/socketListeners.services"

export async function login(nif: string, password: string) {
  const response = await loginRequest({ nif, password })

  const token = response.data.token
  const user = response.data.user

  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))

  // 🔥 conecta o socket após login
  initSocket(token)
  registerSocketListeners()

  return user
}

export async function forgotPassword(email: string) {
  const response = await forgotPasswordRequest(email)
  return response.data
}

export async function changePassword(data: any) {
  const response = await changePasswordRequest(data)
  return response.data
}

export async function getBirthdays() {
  const response = await getBirthdaysRequest()
  return response.data
}
