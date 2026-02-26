import { FastifyInstance } from "fastify"
import * as controller from "../controllers/occurrence.controller"

export async function occurrenceRoutes(app: FastifyInstance) {

  app.post("/occurrences", controller.create)
  app.get("/occurrences", controller.findAll)
  app.get("/occurrences/:id", controller.findOne)
  app.put("/occurrences/:id", controller.update)
  app.delete("/occurrences/:id", controller.remove)

}