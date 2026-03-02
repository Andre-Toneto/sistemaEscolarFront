import { FastifyRequest, FastifyReply } from "fastify"
import * as studentService from "../services/student.service"

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const student = await studentService.createStudent(request.body)
    const io = request.server.io
    io.emit("student:changed")
    return reply.status(201).send(student)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar aluno" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const { class_id } = request.query as any
  const students = await studentService.getAllStudents(class_id)
  return reply.send(students)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const student = await studentService.getStudentById(id)

  if (!student) {
    return reply.status(404).send({ message: "Aluno não encontrado" })
  }

  return reply.send(student)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const student = await studentService.updateStudent(id, request.body)
    const io = request.server.io
    io.emit("student:changed")
    return reply.send(student)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar aluno" })
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    await studentService.deleteStudent(id)
    const io = request.server.io
    io.emit("student:changed")
    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao deletar aluno" })
  }
}
