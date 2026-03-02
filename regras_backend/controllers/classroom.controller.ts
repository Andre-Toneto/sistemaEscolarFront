import { FastifyRequest, FastifyReply } from "fastify"
import * as classroomService from "../services/classroom.service"

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const classroom = await classroomService.createClassroom(request.body)
    const io = request.server.io
    io.emit("classroom:changed")
    return reply.status(201).send(classroom)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar sala" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const classrooms = await classroomService.getAllClassrooms()
  return reply.send(classrooms)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any

  const classroom = await classroomService.getClassroomById(id)

  if (!classroom) {
    return reply.status(404).send({ message: "Sala não encontrada" })
  }

  return reply.send(classroom)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const classroom = await classroomService.updateClassroom(id, request.body)
    const io = request.server.io
    io.emit("classroom:changed")
    return reply.send(classroom)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar sala" })
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    await classroomService.deleteClassroom(id)
    const io = request.server.io
    io.emit("classroom:changed")
    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao deletar sala" })
  }
}