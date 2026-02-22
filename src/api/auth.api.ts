import { api } from "./axios"

export function loginRequest(data: { email: string; password: string }) {
  return api.post("/users/login", data)
}