import { defineStore } from 'pinia'
import { login as loginRequest, forgotPassword as forgotPasswordService, changePassword as changePasswordService, getBirthdays as getBirthdaysService } from '@/services/auth.services'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => ['admin', 'adm'].includes((state.user?.role || '').toLowerCase()),
    isSecretariaAdmin: (state) => state.user?.sub_role === 'admin_secretaria',
    userRole: (state) => state.user?.role || 'regular',
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    async login(nif, password) {
      try {
        const user = await loginRequest(nif, password)
        // Note: auth service already sets localStorage but we update store
        this.token = localStorage.getItem('token')
        this.user = user
        return user
      } catch (error) {
        this.logout()
        throw error
      }
    },
    async forgotPassword(email) {
      return await forgotPasswordService(email)
    },
    async changePassword(data) {
      return await changePasswordService(data)
    },
    async getBirthdays() {
      return await getBirthdaysService()
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    initializeStore() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    }
  },
  persist: true
})
