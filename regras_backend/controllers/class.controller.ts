import { FastifyRequest, FastifyReply } from "fastify"
import * as classService from "../services/class.service"

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const turma = await classService.createClass(request.body)
    
    const io = request.server.io
    io.emit("class:changed")
    
    return reply.status(201).send(turma)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar turma" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const { course_id } = request.query as any
  const turmas = await classService.getAllClasses(course_id)
  return reply.send(turmas)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const turma = await classService.getClassById(id)

  if (!turma) {
    return reply.status(404).send({ message: "Turma não encontrada" })
  }

  return reply.send(turma)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const turma = await classService.updateClass(id, request.body)

    const io = request.server.io
    io.emit("class:changed")
    
    return reply.send(turma)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar turma" })
  }
}

export async function archive(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const turma = await classService.archiveClass(id)

  const io = request.server.io
  io.emit("class:changed")

  return reply.send(turma)
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  await classService.deleteClass(id)

  const io = request.server.io
  io.emit("class:changed")

  return reply.status(204).send()
}
