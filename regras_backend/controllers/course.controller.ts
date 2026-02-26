import { FastifyRequest, FastifyReply } from "fastify"
import * as courseService from "../services/course.service"

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const course = await courseService.createCourse(request.body)
    return reply.status(201).send(course)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar curso" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const courses = await courseService.getAllCourses()
  return reply.send(courses)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any

  const course = await courseService.getCourseById(id)

  if (!course) {
    return reply.status(404).send({ message: "Curso não encontrado" })
  }

  return reply.send(course)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const course = await courseService.updateCourse(id, request.body)
    return reply.send(course)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar curso" })
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    await courseService.deleteCourse(id)
    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao deletar curso" })
  }
}