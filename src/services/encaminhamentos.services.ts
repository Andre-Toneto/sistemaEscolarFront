import * as encaminhamentoApi from "@/api/encaminhamentos.api"

export async function getEncaminhamentos() {
  const response = await encaminhamentoApi.getEncaminhamentos()
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
  // If responseText is provided, we might want to add it as a comment first?
  // Or just update the referral. The backend has a finalize endpoint.
  const response = await encaminhamentoApi.finalizeEncaminhamento(id, {
    // Note: finalized_by_id and name are handled by backend via token
    // If we want to add a final response comment, we can call addComment
  })
  
  if (responseText) {
    await addComment({
      referral_id: id,
      comment: responseText
    })
  }

  return response.data
}

export async function addComment(data) {
  const response = await encaminhamentoApi.addComment(data)
  return response.data
}

export async function deleteComment(id) {
  const response = await encaminhamentoApi.deleteComment(id)
  return response.data
}
