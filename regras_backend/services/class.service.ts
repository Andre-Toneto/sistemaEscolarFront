import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createClass(data: any) {
  return prisma.classes.create({
    data: {
      class_name: data.class_name,
      course_id: data.course_id,
      archived: data.archived ?? 0,
      upgrade_by_id: data.upgrade_by_id ?? null
    }
  })
}

export async function getAllClasses(courseId?: string) {
  const where: any = {}
  if (courseId) {
    where.course_id = courseId
  }

  return prisma.classes.findMany({
    where,
    include: {
      courses: true,
      classes: true,
      other_classes: true
    },
    orderBy: {
      created_at: "desc"
    }
  })
}

export async function getClassById(id: string) {
  return prisma.classes.findUnique({
    where: { id },
    include: {
      courses: true,
      classes: true,
      other_classes: true
    }
  })
}

export async function updateClass(id: string, data: any) {
  return prisma.classes.update({
    where: { id },
    data: {
      class_name: data.class_name,
      course_id: data.course_id,
      archived: data.archived,
      upgrade_by_id: data.upgrade_by_id ?? null
    }
  })
}

export async function archiveClass(id: string) {
  return prisma.classes.update({
    where: { id },
    data: {
      archived: 1,
      data_archived: new Date()
    }
  })
}

export async function deleteClass(id: string) {
  return prisma.classes.delete({
    where: { id }
  })
}
