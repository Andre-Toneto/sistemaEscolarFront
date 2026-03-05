import { api } from "./axios"

export function getActiveCalendar() {
  return api.get("/school-calendars/active")
}

export function getAllCalendars() {
  return api.get("/school-calendars")
}

export function uploadCalendar(data: { name: string, base64_content: string }) {
  return api.post("/school-calendars/upload", data)
}

export function deleteCalendar(id: string) {
  return api.delete(`/school-calendars/${id}`)
}
