import { FastifyInstance } from "fastify"
import * as controller from "../controllers/course.controller"

export async function courseRoutes(app: FastifyInstance) {

  app.post("/courses", controller.create)
  app.get("/courses", controller.findAll)
  app.get("/courses/:id", controller.findOne)
  app.put("/courses/:id", controller.update)
  app.delete("/courses/:id", controller.remove)

}