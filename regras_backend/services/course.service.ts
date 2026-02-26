import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createCourse(data: any) {
  return prisma.courses.create({
    data: {
      name: data.name,
      color: data.color ?? null
    }
  })
}

export async function getAllCourses() {
  return prisma.courses.findMany({
    include: {
      classes: true,
      students: true
    },
    orderBy: {
      created_at: "desc"
    }
  })
}

export async function getCourseById(id: string) {
  return prisma.courses.findUnique({
    where: { id },
    include: {
      classes: true,
      students: true
    }
  })
}

export async function updateCourse(id: string, data: any) {
  return prisma.courses.update({
    where: { id },
    data: {
      name: data.name,
      color: data.color ?? null,
      updated_at: new Date()
    }
  })
}

export async function deleteCourse(id: string) {
  return prisma.courses.delete({
    where: { id }
  })
}