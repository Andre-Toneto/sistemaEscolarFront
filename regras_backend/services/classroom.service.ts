import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createClassroom(data: any) {
  return prisma.classrooms.create({
    data: {
      name: data.name,
      capacity: data.capacity ?? null,
      type: data.type ?? null
    }
  })
}

export async function getAllClassrooms() {
  return prisma.classrooms.findMany({
    include: {
      reserve_classrooms: true
    },
    orderBy: {
      name: "asc"
    }
  })
}

export async function getClassroomById(id: string) {
  return prisma.classrooms.findUnique({
    where: { id },
    include: {
      reserve_classrooms: true
    }
  })
}

export async function updateClassroom(id: string, data: any) {
  return prisma.classrooms.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      capacity: data.capacity ?? undefined,
      type: data.type ?? undefined
    }
  })
}

export async function deleteClassroom(id: string) {
  return prisma.classrooms.delete({
    where: { id }
  })
}