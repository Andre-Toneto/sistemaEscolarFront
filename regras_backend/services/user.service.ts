import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function authenticate(nif: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { nif }
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw new Error("Invalid credentials")
  }

  return user
}

export async function createUser(data: any) {
  const hashedPassword = await bcrypt.hash(data.password, 10)

  return prisma.users.create({
    data: {
      ...data,
      password: hashedPassword
    }
  })
}

export async function getUsers() {
  return prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  })
}

export async function updateUser(id: string, data: any) {
 const updateData: any = {
    name: data.name,
    email: data.email,
    nif: data.nif,
    role: data.role,
    updatedAt: new Date()
  }

  // 🔥 Se enviou senha, criptografa
  if (data.password && data.password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    updateData.password = hashedPassword
  }

  const user = await prisma.users.update({
    where: { id },
    data: updateData
  })

  return user
}

export async function deleteUser(id: string) {
  return prisma.users.delete({
    where: { id }
  })
}