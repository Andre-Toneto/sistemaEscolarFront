import { FastifyRequest, FastifyReply } from "fastify"
import * as referralService from "../services/studentReferral.service"

// =============================
// REFERRALS
// =============================

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const referral = await referralService.createReferral(request.body)

    const io = request.server.io
    io.emit("referral:changed")

    return reply.status(201).send(referral)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao criar encaminhamento" })
  }
}

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const referrals = await referralService.getAllReferrals()
  return reply.send(referrals)
}

export async function findOne(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const referral = await referralService.getReferralById(id)

  if (!referral) {
    return reply.status(404).send({ message: "Encaminhamento não encontrado" })
  }

  return reply.send(referral)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const referral = await referralService.updateReferral(id, request.body)

    const io = request.server.io
    io.emit("referral:changed")

    return reply.send(referral)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao atualizar encaminhamento" })
  }
}

export async function finalize(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const referral = await referralService.finalizeReferral(id, request.body)

    const io = request.server.io
    io.emit("referral:changed")

    return reply.send(referral)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao finalizar encaminhamento" })
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  await referralService.deleteReferral(id)

  const io = request.server.io
  io.emit("referral:changed")

  return reply.status(204).send()
}


// =============================
// COMMENTS
// =============================

export async function addComment(request: FastifyRequest, reply: FastifyReply) {
  try {
    const comment = await referralService.addComment(request.body)

    const io = request.server.io
    io.emit("referral:changed")

    return reply.status(201).send(comment)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro ao adicionar comentário" })
  }
}

export async function deleteComment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  await referralService.deleteComment(id)

  const io = request.server.io
  io.emit("referral:changed")

  return reply.status(204).send()
}