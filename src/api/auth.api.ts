import { api } from "./axios"

export function loginRequest(data: { nif: string; password: string }) {
  return api.post("/users/login", data)
}

export function forgotPasswordRequest(email: string) {
  return api.post("/users/forgot-password", { email })
}

export function changePasswordRequest(data: any) {
  return api.patch("/users/change-password", data)
}

export function getBirthdaysRequest() {
  return api.get("/users/birthdays")
}
