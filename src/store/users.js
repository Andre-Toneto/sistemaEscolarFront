import { defineStore } from 'pinia'
import { api } from '@/api/axios'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const { data } = await api.get('/users')
        this.users = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async createUser(payload) {
      await api.post('/users/register', payload)
      await this.fetchUsers()
    },
    async updateUser(id, payload) {
      await api.put(`/users/${id}`, payload)
      await this.fetchUsers()
    },
    async deleteUser(id) {
      await api.delete(`/users/${id}`)
      await this.fetchUsers()
    }
  }
})
