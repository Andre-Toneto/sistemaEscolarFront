import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createStudent(data: any) {
  return prisma.students.create({
    data: {
      ...data,
      birth_date: data.birth_date
        ? new Date(data.birth_date)
        : null
    }
  })
}

export async function getAllStudents(classId?: string) {
  const where: any = {}
  if (classId) {
    where.class_id = classId
  }

  return prisma.students.findMany({
    where,
    include: {
      courses: true,
      occurrences: true
    },
    orderBy: {
      created_at: "desc"
    }
  })
}

export async function getStudentById(id: string) {
  return prisma.students.findUnique({
    where: { id },
    include: {
      courses: true,
      occurrences: true
    }
  })
}

export async function updateStudent(id: string, data: any) {
  const updateData = { ...data, updated_at: new Date() }

  if (data.birth_date !== undefined) {
    updateData.birth_date = data.birth_date ? new Date(data.birth_date) : null
  }

  return prisma.students.update({
    where: { id },
    data: updateData
  })
}

export async function deleteStudent(id: string) {
  return prisma.students.delete({
    where: { id }
  })
}
