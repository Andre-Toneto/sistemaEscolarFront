import { api } from "./axios"

export function getCourses() {
  return api.get("/courses")
}

export function createCourse(data) {
  return api.post("/courses", data)
}

export function updateCourse(id, data) {
  return api.put(`/courses/${id}`, data)
}

export function deleteCourse(id) {
  return api.delete(`/courses/${id}`)
}

export function getClasses(courseId?: string) {
  const params: any = {}
  if (courseId) params.course_id = courseId
  return api.get("/classes", { params })
}

export function createClass(data) {
  return api.post("/classes", data)
}

export function updateClass(id, data) {
  return api.put(`/classes/${id}`, data)
}

export function archiveClass(id) {
  return api.patch(`/classes/${id}/archive`)
}

export function deleteClass(id) {
  return api.delete(`/classes/${id}`)
}

export function getStudents(classId?: string) {
  const params: any = {}
  if (classId) params.class_id = classId
  return api.get("/students", { params })
}

export function createStudent(studentData) {
  return api.post("/students", studentData)
}

export function updateStudent(id, studentData) {
  return api.put(`/students/${id}`, studentData)
}

export function deleteStudent(id) {
  return api.delete(`/students/${id}`)
}
