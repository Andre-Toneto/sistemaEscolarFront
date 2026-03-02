import * as mapaSalaApi from "@/api/mapaSala.api"

export async function getClassrooms() {
  const response = await mapaSalaApi.getClassrooms()
  return response.data
}

export async function createClassroom(data) {
  const response = await mapaSalaApi.createClassroom(data)
  return response.data
}

export async function updateClassroom(id, data) {
  const response = await mapaSalaApi.updateClassroom(id, data)
  return response.data
}

export async function deleteClassroom(id) {
  const response = await mapaSalaApi.deleteClassroom(id)
  return response.data
}

export async function getReservations() {
  const response = await mapaSalaApi.getReservations()
  return response.data
}

export async function createReservation(data) {
  const response = await mapaSalaApi.createReservation(data)
  return response.data
}

export async function updateReservation(id, data) {
  const response = await mapaSalaApi.updateReservation(id, data)
  return response.data
}

export async function deleteReservation(id) {
  const response = await mapaSalaApi.deleteReservation(id)
  return response.data
}

export async function createBulkReservations(data) {
  const response = await mapaSalaApi.createBulkReservations(data)
  return response.data
}

export async function deleteBulkReservations(data) {
  const response = await mapaSalaApi.deleteBulkReservations(data)
  return response.data
}

export async function transferReservations(data) {
  const response = await mapaSalaApi.transferReservations(data)
  return response.data
}
