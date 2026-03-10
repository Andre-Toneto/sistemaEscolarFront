import { defineStore } from 'pinia'
import * as carometroService from '@/services/carometro.services'

export const useCarometroStore = defineStore('carometro', {
  state: () => ({
    courses: [],
    classes: [],
    loading: false,
    error: null
  }),
  getters: {
    getCourseById: (state) => (id) => state.courses.find(c => String(c.id) === String(id)),
    getClassById: (state) => (id) => state.classes.find(c => String(c.id) === String(id)),
    getCourseName: (state) => (id) => state.courses.find(c => String(c.id) === String(id))?.name || 'Desconhecido',
    getClassName: (state) => (id) => state.classes.find(c => String(c.id) === String(id))?.class_name || 'Desconhecido',
    getClassesByCourseId: (state) => (courseId) => state.classes.filter(c => String(c.course_id) === String(courseId) && !c.archived)
  },
  actions: {
    async fetchData() {
      this.loading = true
      try {
        const [courses, classes] = await Promise.all([
          carometroService.getCourses(),
          carometroService.getClasses()
        ])
        this.courses = courses
        this.classes = classes
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchCourses() {
      this.courses = await carometroService.getCourses()
    },
    async fetchClasses() {
      this.classes = await carometroService.getClasses()
    }
  }
})
