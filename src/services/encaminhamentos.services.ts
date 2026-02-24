import * as encaminhamentoApi from "@/api/encaminhamentos.api"

export async function getEncaminhamentos(status?: string, type?: string) {
  const response = await encaminhamentoApi.getEncaminhamentos({ status, type })
  // Return direct array as expected by simple backend
  return response.data
}

export async function createEncaminhamento(data) {
  const response = await encaminhamentoApi.createEncaminhamento(data)
  return response.data
}

export async function updateEncaminhamento(id, data) {
  const response = await encaminhamentoApi.updateEncaminhamento(id, data)
  return response.data
}

export async function deleteEncaminhamento(id) {
  const response = await encaminhamentoApi.deleteEncaminhamento(id)
  return response.data
}

export async function finalize(id, responseText?: string) {
  // Mapping finalize to a simple update since dedicated finalize might not exist
  const response = await encaminhamentoApi.updateEncaminhamento(id, { 
    type: 'finalizado', 
    description: responseText // Or wherever the response fits in Prisma schema
  })
  return response.data
}
