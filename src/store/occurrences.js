import { defineStore } from 'pinia'
import * as occurrencesService from '@/services/occurrences.services'

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
        const data = await occurrencesService.getOccurrences()
        this.occurrences = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchData() {
      return this.fetchOccurrences()
    },
    async createOccurrence(payload) {
      const newOccurrence = await occurrencesService.createOccurrence(payload)
      await this.fetchOccurrences()
      return newOccurrence
    },
    async updateOccurrence(id, payload) {
      const updated = await occurrencesService.updateOccurrence(id, payload)
      await this.fetchOccurrences()
      return updated
    },
    async deleteOccurrence(id) {
      await occurrencesService.deleteOccurrence(id)
      await this.fetchOccurrences()
    },
    getOccurrencesByStudentId(studentId) {
      return this.occurrences.filter(o => o.student_id === studentId)
    }
  }
})
