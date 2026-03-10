import * as carometroApi from "@/api/carometro.api"

// Helper para normalizar respostas da API
function normalizeResponse(response) {
  if (!response || !response.data) return []
  const data = response.data
  if (Array.isArray(data)) return data
  return data?.data || []
}

// Courses
export async function getCourses() {
  const response = await carometroApi.getCourses()
  return normalizeResponse(response)
}

export async function createCourse(data) {
  const response = await carometroApi.createCourse(data)
  return response.data
}

export async function updateCourse(id, data) {
  const response = await carometroApi.updateCourse(id, data)
  return response.data
}

export async function deleteCourse(id) {
  const response = await carometroApi.deleteCourse(id)
  return response.data
}

// Classes
export async function getClasses(courseId?: string) {
  const response = await carometroApi.getClasses(courseId)
  return normalizeResponse(response)
}

export async function createClass(data) {
  const response = await carometroApi.createClass(data)
  return response.data
}

export async function updateClass(id, data) {
  const response = await carometroApi.updateClass(id, data)
  return response.data
}

export async function archiveClass(id) {
  const response = await carometroApi.archiveClass(id)
  return response.data
}

export async function deleteClass(id) {
  try {
    const students = await getStudents(id)
    if (students && students.length > 0) {
      await Promise.all(students.map(s => deleteStudent(s.id)))
    }
  } catch (err) {
    console.error('Erro ao limpar alunos da turma:', err)
  }

  const response = await carometroApi.deleteClass(id)
  return response.data
}

// Students
export async function getStudents(classId?: string) {
  const response = await carometroApi.getStudents(classId)
  return normalizeResponse(response)
}

export async function createStudent(studentData) {
  const response = await carometroApi.createStudent(studentData)
  return response.data
}

export async function updateStudent(id, studentData) {
  const response = await carometroApi.updateStudent(id, studentData)
  return response.data
}

export async function deleteStudent(id) {
  const response = await carometroApi.deleteStudent(id)
  return response.data
}

export async function getStudent(id) {
  const response = await carometroApi.getStudent(id)
  return response.data
}
