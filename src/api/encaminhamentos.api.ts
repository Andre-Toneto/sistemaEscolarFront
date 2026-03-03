import { api } from "./axios"

export function getEncaminhamentos() {
  return api.get("/student-referrals")
}

export function createEncaminhamento(data) {
  return api.post("/student-referrals", data)
}

export function updateEncaminhamento(id, data) {
  return api.put(`/student-referrals/${id}`, data)
}

export function deleteEncaminhamento(id) {
  return api.delete(`/student-referrals/${id}`)
}

export function finalizeEncaminhamento(id, data) {
  return api.patch(`/student-referrals/${id}/finalize`, data)
}

export function addComment(data) {
  return api.post("/student-referral-comments", data)
}

export function deleteComment(id) {
  return api.delete(`/student-referral-comments/${id}`)
}
