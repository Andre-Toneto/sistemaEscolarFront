import { FastifyRequest, FastifyReply } from "fastify"
import {
  authenticate,
  createUser,
  getUsers,
  updateUser,
  deleteUser
} from "../services/user.service"

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { nif, password } = request.body as any

  const user = await authenticate(nif, password)

  const token = await reply.jwtSign({
    id: user.id,
    role: user.role
  })

  return reply.send({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as any

  const user = await createUser(body)

  return reply.status(201).send(user)
}

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const users = await getUsers()
  return reply.send(users)
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const body = request.body as any

  const user = await updateUser(id, body)

  return reply.send(user)
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any

  await deleteUser(id)

  return reply.status(204).send()
}