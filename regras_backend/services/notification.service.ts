import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// =====================
// CRUD e helpers
// =====================

export async function getUserNotifications(userId: string) {
  return prisma.notifications.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" }
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notifications.count({
    where: { user_id: userId, read: false }
  })
}

export async function markAsRead(id: string) {
  return prisma.notifications.update({
    where: { id },
    data: { read: true }
  })
}

export async function markAllAsRead(userId: string) {
  return prisma.notifications.updateMany({
    where: { user_id: userId, read: false },
    data: { read: true }
  })
}

// =====================
// Helper para criar notificações
// =====================

// Pega usuários por role
export async function getUserIdsByRole(role: string): Promise<string[]> {
  const users = await prisma.users.findMany({
    where: { role },
    select: { id: true }
  })
  return users.map(u => u.id)
}

export async function createNotification(
  io: any,
  userIds: string[],
  title: string,
  message: string,
  type: string,
  entity_id?: string,
  entity_type?: string
) {
  const notifications = userIds.map(user_id => ({
    user_id,
    title,
    message,
    type,
    entity_id,
    entity_type
  }))

  const created = await prisma.notifications.createMany({ data: notifications })

  userIds.forEach(user_id => {
    io.to(user_id).emit("notification:new", {
      title,
      message,
      type,
      entity_id,
      entity_type
    })
  })

  return created
}