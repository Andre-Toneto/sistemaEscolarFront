import { FastifyRequest, FastifyReply } from "fastify"
import * as occurrenceService from "../services/occurrence.service"

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const occurrence = await occurrenceService.createOccurrence(request.body)
    return reply.status(201).send(occurrence)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar ocorrência" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const occurrences = await occurrenceService.getAllOccurrences()
  return reply.send(occurrences)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any

  const occurrence = await occurrenceService.getOccurrenceById(id)

  if (!occurrence) {
    return reply.status(404).send({ message: "Ocorrência não encontrada" })
  }

  return reply.send(occurrence)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const occurrence = await occurrenceService.updateOccurrence(id, request.body)
    return reply.send(occurrence)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar ocorrência" })
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    await occurrenceService.deleteOccurrence(id)
    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao deletar ocorrência" })
  }
}