import { api } from "./axios"

export function getEncaminhamentos(params) {
  return api.get("/encaminhamentos", { params })
}

export function createEncaminhamento(data) {
  return api.post("/encaminhamentos", data)
}

export function updateEncaminhamento(id, data) {
  return api.put(`/encaminhamentos/${id}`, data)
}

export function deleteEncaminhamento(id) {
  return api.delete(`/encaminhamentos/${id}`)
}

export function finalizeEncaminhamento(id, data) {
  return api.patch(`/encaminhamentos/${id}/finalize`, data)
}
