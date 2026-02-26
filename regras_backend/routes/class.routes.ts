import { FastifyInstance } from "fastify"
import * as controller from "../controllers/class.controller"

export async function classRoutes(app: FastifyInstance) {

  app.post("/classes", controller.create)
  app.get("/classes", controller.findAll)
  app.get("/classes/:id", controller.findOne)
  app.put("/classes/:id", controller.update)
  app.patch("/classes/:id/archive", controller.archive)
  app.delete("/classes/:id", controller.remove)

}