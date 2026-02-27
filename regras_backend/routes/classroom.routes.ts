import { FastifyInstance } from "fastify"
import * as controller from "../controllers/classroom.controller"

export async function classroomRoutes(app: FastifyInstance) {
  app.post("/classrooms", controller.create)
  app.get("/classrooms", controller.findAll)
  app.get("/classrooms/:id", controller.findOne)
  app.put("/classrooms/:id", controller.update)
  app.delete("/classrooms/:id", controller.remove)
}