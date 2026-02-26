import { FastifyInstance } from "fastify"
import * as controller from "../controllers/student.controller"

export async function studentRoutes(app: FastifyInstance) {

  app.post("/students", { preHandler: [app.authenticate] }, controller.create)
  app.get("/students", { preHandler: [app.authenticate] }, controller.findAll)
  app.get("/students/:id", { preHandler: [app.authenticate] }, controller.findOne)
  app.put("/students/:id", { preHandler: [app.authenticate] }, controller.update)
  app.delete("/students/:id", { preHandler: [app.authenticate] }, controller.remove)

}
