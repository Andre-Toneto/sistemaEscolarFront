import { api } from "./axios"

export function getOccurrences() {
  return api.get("/occurrences")
}

export function createOccurrence(data) {
  return api.post("/occurrences", data)
}

export function updateOccurrence(id, data) {
  return api.put(`/occurrences/${id}`, data)
}

export function deleteOccurrence(id) {
  return api.delete(`/occurrences/${id}`)
}
