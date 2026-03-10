import * as occurrencesApi from "@/api/occurrences.api"

export async function getOccurrences() {
  const response = await occurrencesApi.getOccurrences()
  return response.data
}

export async function createOccurrence(data) {
  const response = await occurrencesApi.createOccurrence(data)
  return response.data
}

export async function updateOccurrence(id, data) {
  const response = await occurrencesApi.updateOccurrence(id, data)
  return response.data
}

export async function deleteOccurrence(id) {
  const response = await occurrencesApi.deleteOccurrence(id)
  return response.data
}
