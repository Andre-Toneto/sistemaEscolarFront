import { FastifyRequest, FastifyReply } from "fastify"
import * as reserveService from "../services/reserveClassroom.service"

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const reserve = await reserveService.createReserveClassroom(request.body)
    const io = request.server.io
    io.emit("reserve:changed")

    return reply.status(201).send(reserve)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar reserva" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const reserves = await reserveService.getAllReserveClassrooms()
  return reply.send(reserves)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any

  const reserve = await reserveService.getReserveClassroomById(id)

  if (!reserve) {
    return reply.status(404).send({ message: "Reserva não encontrada" })
  }

  return reply.send(reserve)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const reserve = await reserveService.updateReserveClassroom(id, request.body)

    const io = request.server.io
    io.emit("reserve:changed")

    return reply.send(reserve)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar reserva" })
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    await reserveService.deleteReserveClassroom(id)

    const io = request.server.io
    io.emit("reserve:changed")

    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao deletar reserva" })
  }
}

export async function createBulk(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await reserveService.createBulkReserveClassrooms(request.body)
    
    const io = request.server.io
    io.emit("reserve:changed")

    return reply.status(201).send(result)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar reservas em lote" })
  }
}

export async function removeBulk(request: FastifyRequest, reply: FastifyReply) {
  try {
    await reserveService.deleteBulkReserveClassrooms(request.body)

    const io = request.server.io
    io.emit("reserve:changed")

    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao deletar reservas em lote" })
  }
}

export async function transfer(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await reserveService.transferReservations(request.body)
    return reply.send(result)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao transferir reserva" })
  }
}
