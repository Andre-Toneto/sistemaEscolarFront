import { api } from "./axios"

export function getEncaminhamentos(params) {
  // Mapping query params to match Prisma schema used in new backend
  const apiParams: any = {}
  if (params?.status) apiParams.status = params.status
  if (params?.type) apiParams.type = params.type
  if (params?.student_id) apiParams.student_id = params.student_id

  return api.get("/occurrences", { params: apiParams })
}

export function createEncaminhamento(data) {
  // Map fields to Prisma schema if necessary
  const payload = {
    ...data,
    student_id: data.student_id || data.aluno_id,
    user_id: data.user_id || data.autor_id,
    type: data.type || data.tipo,
    description: data.description || data.descricao,
    date: data.date || data.data || new Date().toISOString()
  }
  return api.post("/occurrences", payload)
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
