import { FastifyInstance } from "fastify"
import * as controller from "../controllers/studentReferral.controller"

export async function studentReferralRoutes(app: FastifyInstance) {

  // REFERRALS
  app.post("/student-referrals", controller.create)
  app.get("/student-referrals", controller.findAll)
  app.get("/student-referrals/:id", controller.findOne)
  app.put("/student-referrals/:id", controller.update)
  app.patch("/student-referrals/:id/finalize", controller.finalize)
  app.delete("/student-referrals/:id", controller.remove)

  // COMMENTS
  app.post("/student-referral-comments", controller.addComment)
  app.delete("/student-referral-comments/:id", controller.deleteComment)
}