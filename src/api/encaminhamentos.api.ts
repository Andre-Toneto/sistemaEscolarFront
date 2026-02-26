import { api } from "./axios"

export function getEncaminhamentos(params) {
  return api.get("/occurrences", { params })
}

export function createEncaminhamento(data) {
  return api.post("/occurrences", data)
}

export function updateEncaminhamento(id, data) {
  return api.put(`/occurrences/${id}`, data)
}

export function deleteEncaminhamento(id) {
  return api.delete(`/occurrences/${id}`)
}

export function finalizeEncaminhamento(id, data) {
  return api.patch(`/occurrences/${id}/finalize`, data)
}
