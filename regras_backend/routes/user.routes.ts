import { FastifyInstance } from "fastify"
import {
  login,
  register,
  list,
  update,
  remove
} from "../controllers/user.controller"

export async function userRoutes(app: FastifyInstance) {

  // rota pública
  app.post("/login", login)

  // rotas protegidas
  app.post("/register", {
    preHandler: [app.authenticate]
  }, register)

  app.get("/", {
    preHandler: [app.authenticate]
  }, list)

  app.put("/:id", {
    preHandler: [app.authenticate]
  }, update)

  app.delete("/:id", {
    preHandler: [app.authenticate]
  }, remove)
}