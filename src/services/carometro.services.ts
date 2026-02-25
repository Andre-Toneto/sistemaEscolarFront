import * as carometroApi from "@/api/carometro.api"

// Helper para normalizar respostas da API de forma extremamente resiliente
function normalizeResponse(response) {
  if (!response || !response.data) return []
  
  const data = response.data
  
  // Se já for um array, retorna direto
  if (Array.isArray(data)) return data
  
  if (data && typeof data === 'object') {
    // Lista de chaves prováveis que contêm os dados reais
    const priorityKeys = ['students', 'data', 'alunos', 'courses', 'classes', 'items', 'list', 'results']
    
    // 1. Procura nas chaves de prioridade no primeiro nível
    for (const key of priorityKeys) {
      if (Array.isArray(data[key])) return data[key]
    }
    
    // 2. Procura nas chaves de prioridade dentro de um possível objeto 'data'
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      for (const key of priorityKeys) {
        if (Array.isArray(data.data[key])) return data.data[key]
      }
    }
    
    // 3. Fallback: Procura por qualquer propriedade que seja um array no primeiro nível
    const anyArrayKey = Object.keys(data).find(key => Array.isArray(data[key]))
    if (anyArrayKey) return data[anyArrayKey]
  }
  
  return []
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
  try {
    const response = await carometroApi.getStudents(classId)
    return normalizeResponse(response)
  } catch (err) {
    console.error('Erro ao buscar alunos:', err)

    // Fallback: se houver um erro 500, tentamos uma busca sem filtro para ver se o problema é o parâmetro
    if (err.response?.status === 500 && classId) {
      console.warn('Backend retornou erro 500. Tentando busca sem filtro de turma como fallback...')
      try {
        const fallbackResponse = await carometroApi.getStudents()
        const allStudents = normalizeResponse(fallbackResponse)
        // Filtramos no frontend apenas para não deixar o usuário sem dados
        return allStudents.filter(s => String(s.class_id || s.turma_id) === String(classId))
      } catch (fallbackErr) {
        console.error('Busca de fallback também falhou:', fallbackErr)
      }
    }
    throw err
  }
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
