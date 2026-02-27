import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createReserveClassroom(data: any) {
  return prisma.reserve_classrooms.create({
    data: {
      classroom_id: data.classroom_id,
      data: new Date(data.data),
      period: data.period,
      course_name: data.course_name ?? null,
      user_id: data.user_id,
      user_name: data.user_name,
      course_type: data.course_type,
      number_students: data.number_students ?? null
    }
  })
}

export async function getAllReserveClassrooms() {
  return prisma.reserve_classrooms.findMany({
    include: {
      classrooms: true,
      users: true
    },
    orderBy: {
      data: "asc"
    }
  })
}

export async function getReserveClassroomById(id: string) {
  return prisma.reserve_classrooms.findUnique({
    where: { id },
    include: {
      classrooms: true,
      users: true
    }
  })
}

export async function updateReserveClassroom(id: string, data: any) {
  return prisma.reserve_classrooms.update({
    where: { id },
    data: {
      classroom_id: data.classroom_id ?? undefined,
      data: data.data ? new Date(data.data) : undefined,
      period: data.period ?? undefined,
      course_name: data.course_name ?? null,
      user_id: data.user_id ?? undefined,
      user_name: data.user_name ?? undefined,
      course_type: data.course_type ?? undefined,
      number_students: data.number_students ?? undefined
    }
  })
}

export async function deleteReserveClassroom(id: string) {
  return prisma.reserve_classrooms.delete({
    where: { id }
  })
}

export async function createBulkReserveClassrooms(data: any) {
  const { classroom_id, start_date, end_date, periods, user_id, user_name, course_name, course_type, number_students, weekdays } = data
  const startDate = new Date(start_date)
  const endDate = new Date(end_date)
  const reservations = []

  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay() // 0 = Sunday, 1 = Monday...
    // Only add if it's one of the selected weekdays (or if all weekdays are selected)
    if (!weekdays || weekdays.includes(dayOfWeek)) {
      for (const period of periods) {
        reservations.push({
          classroom_id,
          data: new Date(currentDate),
          period,
          user_id,
          user_name,
          course_name: course_name ?? null,
          course_type,
          number_students: number_students ?? null
        })
      }
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  // Use createMany with skipDuplicates to avoid unique constraint errors if some slots are already taken
  return prisma.reserve_classrooms.createMany({
    data: reservations,
    skipDuplicates: true
  })
}

export async function deleteBulkReserveClassrooms(data: any) {
  const { classroom_id, start_date, end_date, periods, user_id } = data
  const startDate = new Date(start_date)
  const endDate = new Date(end_date)

  return prisma.reserve_classrooms.deleteMany({
    where: {
      classroom_id,
      data: {
        gte: startDate,
        lte: endDate
      },
      period: periods ? { in: periods } : undefined,
      user_id: user_id ?? undefined
    }
  })
}

export async function transferReservations(data: any) {
  const { from_classroom_id, to_classroom_id, user_id, reservation_id, all, by_period, start_date, end_date } = data

  if (all) {
    // Transfer all future reservations of this user from one room to another
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.reserve_classrooms.updateMany({
      where: {
        classroom_id: from_classroom_id,
        user_id,
        data: {
          gte: today
        }
      },
      data: {
        classroom_id: to_classroom_id
      }
    })
  } else if (by_period) {
    // Transfer reservations within a specific period
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)

    return prisma.reserve_classrooms.updateMany({
      where: {
        classroom_id: from_classroom_id,
        user_id,
        data: {
          gte: startDate,
          lte: endDate
        }
      },
      data: {
        classroom_id: to_classroom_id
      }
    })
  } else {
    // Transfer only one specific reservation
    return prisma.reserve_classrooms.update({
      where: { id: reservation_id },
      data: {
        classroom_id: to_classroom_id
      }
    })
  }
}
