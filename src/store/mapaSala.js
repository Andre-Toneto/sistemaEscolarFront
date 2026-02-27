import { defineStore } from 'pinia'
import * as mapaSalaService from '@/services/mapaSala.services'
import { stringToColor } from '@/utils/colorUtils'

export const useMapaSalaStore = defineStore('mapaSala', {
  state: () => ({
    classrooms: [],
    reservations: [],
    loading: false,
    error: null,
    // PERIODOS are constants
    PERIODOS: [
      { id: 'MANHA', label: 'Manhã', start: '07:00', end: '12:00' },
      { id: 'TARDE', label: 'Tarde', start: '13:00', end: '18:00' },
      { id: 'NOITE', label: 'Noite', start: '19:00', end: '22:00' }
    ]
  }),

  getters: {
    getReservation: (state) => (diaISO, classroomId, period) => {
      return state.reservations.find(r => {
        const resDate = new Date(r.data).toISOString().split('T')[0]
        return resDate === diaISO && r.classroom_id === classroomId && r.period === period
      })
    },

    getReservaColor: (state) => (diaISO, classroomId, period) => {
      const res = state.reservations.find(r => {
        const resDate = new Date(r.data).toISOString().split('T')[0]
        return resDate === diaISO && r.classroom_id === classroomId && r.period === period
      })
      if (!res) return 'primary'
      return stringToColor(res.user_id || res.user_name)
    }
  },

  actions: {
    async fetchData() {
      this.loading = true
      try {
        const [rooms, res] = await Promise.all([
          mapaSalaService.getClassrooms(),
          mapaSalaService.getReservations()
        ])
        this.classrooms = rooms
        this.reservations = res
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async createReservation(payload) {
      this.loading = true
      try {
        const newRes = await mapaSalaService.createReservation(payload)
        await this.fetchData() // Refresh
        return newRes
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateReservation(id, payload) {
      this.loading = true
      try {
        const updatedRes = await mapaSalaService.updateReservation(id, payload)
        await this.fetchData()
        return updatedRes
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteReservation(id) {
      this.loading = true
      try {
        await mapaSalaService.deleteReservation(id)
        await this.fetchData()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async createBulkReservations(payload) {
      this.loading = true
      try {
        const result = await mapaSalaService.createBulkReservations(payload)
        await this.fetchData()
        return result
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteBulkReservations(payload) {
      this.loading = true
      try {
        await mapaSalaService.deleteBulkReservations(payload)
        await this.fetchData()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async transferReservations(payload) {
      this.loading = true
      try {
        await mapaSalaService.transferReservations(payload)
        await this.fetchData()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async createClassroom(data) {
      try {
        await mapaSalaService.createClassroom(data)
        await this.fetchData()
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    async updateClassroom(id, data) {
      try {
        await mapaSalaService.updateClassroom(id, data)
        await this.fetchData()
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    async deleteClassroom(id) {
      try {
        await mapaSalaService.deleteClassroom(id)
        await this.fetchData()
      } catch (err) {
        this.error = err.message
        throw err
      }
    }
  }
})
