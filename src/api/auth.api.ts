import { api } from "./axios"

export function loginRequest(data: { nif: string; password: string }) {
  return api.post("/users/login", data)
}