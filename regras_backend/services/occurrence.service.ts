import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createOccurrence(data: any) {
  return prisma.occurrences.create({
    data: {
      student_id: data.student_id ?? null,
      user_id: data.user_id ?? null,
      date: new Date(data.date),
      description: data.description ?? null,
      type: data.type ?? null,
    }
  })
}

export async function getAllOccurrences() {
  return prisma.occurrences.findMany({
    include: {
      students: true,
      users: true
    },
    orderBy: {
      created_at: "desc"
    }
  })
}

export async function getOccurrenceById(id: string) {
  return prisma.occurrences.findUnique({
    where: { id },
    include: {
      students: true,
      users: true
    }
  })
}

export async function updateOccurrence(id: string, data: any) {
  return prisma.occurrences.update({
    where: { id },
    data: {
      student_id: data.student_id ?? undefined,
      user_id: data.user_id ?? undefined,
      date: data.date ? new Date(data.date) : undefined,
      description: data.description ?? undefined,
      type: data.type ?? undefined,
      updated_at: new Date()
    }
  })
}

export async function deleteOccurrence(id: string) {
  return prisma.occurrences.delete({
    where: { id }
  })
}