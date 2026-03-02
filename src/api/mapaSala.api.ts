import { api } from "./axios"

export function getClassrooms() {
  return api.get("/classrooms")
}

export function createClassroom(data) {
  return api.post("/classrooms", data)
}

export function updateClassroom(id, data) {
  return api.put(`/classrooms/${id}`, data)
}

export function deleteClassroom(id) {
  return api.delete(`/classrooms/${id}`)
}

export function getReservations() {
  return api.get("/reserve-classrooms")
}

export function createReservation(data) {
  return api.post("/reserve-classrooms", data)
}

export function updateReservation(id, data) {
  return api.put(`/reserve-classrooms/${id}`, data)
}

export function deleteReservation(id) {
  return api.delete(`/reserve-classrooms/${id}`)
}

export function createBulkReservations(data) {
  return api.post("/reserve-classrooms/bulk", data)
}

export function deleteBulkReservations(data) {
  return api.post("/reserve-classrooms/bulk-delete", data)
}

export function transferReservations(data) {
  return api.post("/reserve-classrooms/transfer", data)
}
