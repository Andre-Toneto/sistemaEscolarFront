import { FastifyInstance } from "fastify"
import * as controller from "../controllers/notification.controller"

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/notifications", controller.getAll)
  app.patch("/notifications/:id/read", controller.markAsRead)
  app.patch("/notifications/read-all", controller.markAllAsRead)
  app.get("/notifications/unread-count", controller.getUnreadCount)
}