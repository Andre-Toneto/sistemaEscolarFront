import { FastifyInstance } from "fastify"
import * as controller from "../controllers/reserveClassroom.controller"

export async function reserveClassroomRoutes(app: FastifyInstance) {
  app.post("/reserve-classrooms", controller.create)
  app.post("/reserve-classrooms/bulk", controller.createBulk)
  app.post("/reserve-classrooms/bulk-delete", controller.removeBulk)
  app.post("/reserve-classrooms/transfer", controller.transfer)
  app.get("/reserve-classrooms", controller.findAll)
  app.get("/reserve-classrooms/:id", controller.findOne)
  app.put("/reserve-classrooms/:id", controller.update)
  app.delete("/reserve-classrooms/:id", controller.remove)
}
