import { defineStore } from 'pinia'
import * as encaminhamentosService from '@/services/encaminhamentos.services'

export const useOccurrencesStore = defineStore('occurrences', {
  state: () => ({
    occurrences: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchOccurrences() {
      this.loading = true
      try {
        const data = await encaminhamentosService.getEncaminhamentos('Todos', 'Todos')
        this.occurrences = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async createOccurrence(payload) {
      const newOccurrence = await encaminhamentosService.createEncaminhamento(payload)
      await this.fetchOccurrences()
      return newOccurrence
    },
    async updateOccurrence(id, payload) {
      const updated = await encaminhamentosService.updateEncaminhamento(id, payload)
      await this.fetchOccurrences()
      return updated
    },
    async deleteOccurrence(id) {
      await encaminhamentosService.deleteEncaminhamento(id)
      await this.fetchOccurrences()
    },
    getOccurrencesByStudentId(studentId) {
      return this.occurrences.filter(o => o.student_id === studentId)
    }
  }
})
