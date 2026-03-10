import { defineStore } from 'pinia'
import * as notificationApi from '@/api/notification.api'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false
  }),

  actions: {
    async fetchNotifications() {
      this.loading = true
      try {
        const response = await notificationApi.getNotifications()
        this.notifications = response.data
        await this.fetchUnreadCount()
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      } finally {
        this.loading = false
      }
    },

    async handleNotificationClick(notif, router) {
      // Marcar como lida primeiro
      await this.markAsRead(notif.id)

      // Lógica de Redirecionamento
      if (!notif.type) return

      switch (notif.type) {
        case 'new_occurrence':
          if (notif.entity_id) {
            router.push({ path: '/carometro', query: { studentId: notif.entity_id } })
          }
          break

        case 'new_referral':
        case 'referral_update':
        case 'referral_finalized':
        case 'referral_comment':
          router.push({ path: '/encaminhamentos/abertos', query: { id: notif.entity_id } })
          break

        case 'birthday':
          // Poderia ir para o perfil do usuário se existir, mas por enquanto Home
          router.push('/home')
          break

        default:
          console.log("Notificação sem rota específica para:", notif.type)
          break
      }
    },

    async fetchUnreadCount() {
      try {
        const response = await notificationApi.getUnreadCount()
        this.unreadCount = response.data.count
      } catch (error) {
        console.error('Erro ao buscar contagem de não lidas:', error)
      }
    },

    async markAsRead(id) {
      try {
        await notificationApi.markAsRead(id)
        const index = this.notifications.findIndex(n => n.id === id)
        if (index !== -1 && !this.notifications[index].read) {
          this.notifications[index].read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (error) {
        console.error('Erro ao marcar como lida:', error)
      }
    },

    async markAllAsRead() {
      try {
        await notificationApi.markAllAsRead()
        this.notifications.forEach(n => n.read = true)
        this.unreadCount = 0
      } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error)
      }
    },

    addNotification(notification) {
      this.notifications.unshift({
        ...notification,
        id: notification.id || Date.now().toString(),
        created_at: notification.created_at || new Date().toISOString(),
        read: false
      })
      this.unreadCount++
    }
  }
})
