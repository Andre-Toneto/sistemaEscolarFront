import { FastifyRequest, FastifyReply } from "fastify"
import * as notificationService from "../services/notification.service"

// Lista notificações do usuário logado
export async function getAll(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  const notifications = await notificationService.getUserNotifications(userId)
  return reply.send(notifications)
}

// Marca uma notificação como lida
export async function markAsRead(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const notification = await notificationService.markAsRead(id)
  return reply.send(notification)
}

// Marca todas notificações como lidas
export async function markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  const updated = await notificationService.markAllAsRead(userId)
  return reply.send({ updatedCount: updated.count })
}

// Retorna a quantidade de notificações não lidas
export async function getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  const count = await notificationService.getUnreadCount(userId)
  return reply.send({ count })
}