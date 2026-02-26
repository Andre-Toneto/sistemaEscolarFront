import { FastifyInstance } from "fastify"
import * as controller from "../controllers/student.controller"

export async function studentRoutes(app: FastifyInstance) {

  app.post("/students", controller.create)
  app.get("/students", controller.findAll)
  app.get("/students/:id", controller.findOne)
  app.put("/students/:id", controller.update)
  app.delete("/students/:id", controller.remove)

}