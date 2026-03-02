import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// =============================
// REFERRALS
// =============================

export async function createReferral(data: any) {
  return prisma.student_referrals.create({
    data: {
      student_name: data.student_name,
      reason: data.reason,
      description: data.description,
      status: data.status ?? "aberto",
      created_by_id: data.created_by_id,
      created_by_name: data.created_by_name,
      assigned_to_id: data.assigned_to_id ?? null,
      assigned_to_name: data.assigned_to_name ?? null
    }
  })
}

export async function getAllReferrals() {
  return prisma.student_referrals.findMany({
    include: {
      student_referral_comments: true
    },
    orderBy: {
      created_at: "desc"
    }
  })
}

export async function getReferralById(id: string) {
  return prisma.student_referrals.findUnique({
    where: { id },
    include: {
      student_referral_comments: {
        orderBy: {
          created_at: "asc"
        }
      }
    }
  })
}

export async function updateReferral(id: string, data: any) {
  return prisma.student_referrals.update({
    where: { id },
    data: {
      reason: data.reason,
      description: data.description,
      status: data.status,
      assigned_to_id: data.assigned_to_id ?? null,
      assigned_to_name: data.assigned_to_name ?? null,
      updated_at: new Date()
    }
  })
}

export async function finalizeReferral(id: string, data: any) {
  return prisma.student_referrals.update({
    where: { id },
    data: {
      status: "finalizado",
      finalized_by_id: data.finalized_by_id,
      finalized_by_name: data.finalized_by_name,
      finalized_at: new Date(),
      updated_at: new Date()
    }
  })
}

export async function deleteReferral(id: string) {
  return prisma.student_referrals.delete({
    where: { id }
  })
}


// =============================
// COMMENTS
// =============================

export async function addComment(data: any) {
  return prisma.student_referral_comments.create({
    data: {
      referral_id: data.referral_id,
      author_id: data.author_id,
      author_name: data.author_name,
      comment: data.comment
    }
  })
}

export async function deleteComment(id: string) {
  return prisma.student_referral_comments.delete({
    where: { id }
  })
}