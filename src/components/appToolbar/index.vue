<template>
  <v-app-bar app color="senai-red" dark elevation="4" density="comfortable">
    <!-- Logo Section -->
    <template v-slot:prepend>
      <v-img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTUzRTNFIi8+Cjx0ZXh0IHg9IjYwIiB5PSIyNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNFTkFJPC90ZXh0Pgo8L3N2Zz4="
        alt="SENAI"
        max-height="36"
        max-width="120"
        class="mr-4"
      />
    </template>

    <v-divider vertical class="mx-2 opacity-30" />

    <!-- Date Section -->
    <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
    <span class="text-body-2 font-weight-medium text-capitalize">{{ formattedDate }}</span>

    <v-spacer />

    <!-- Desktop Menu Items -->
    <template v-slot:append>
      <div class="d-none d-lg-flex align-center">
        <!-- Notification Bell -->
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              v-bind="props"
              variant="text"
              class="mr-2"
              @click="notificationStore.fetchNotifications()"
            >
              <v-badge
                :content="notificationStore.unreadCount"
                :model-value="notificationStore.unreadCount > 0"
                color="yellow-accent-4"
                overlap
              >
                <v-icon>mdi-bell</v-icon>
              </v-badge>
            </v-btn>
          </template>

          <v-card width="350" class="elevation-12">
            <v-toolbar color="senai-red" density="compact" dark>
              <v-toolbar-title class="text-subtitle-1">Notificações</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon size="small" @click="notificationStore.markAllAsRead()">
                <v-icon>mdi-check-all</v-icon>
                <v-tooltip activator="parent" location="bottom">Marcar tudo como lido</v-tooltip>
              </v-btn>
            </v-toolbar>

            <v-list lines="three" class="pa-0 notification-list" max-height="400" style="overflow-y: auto;">
              <v-list-item v-if="notificationStore.notifications.length === 0" class="text-center pa-4">
                <v-list-item-title class="text-grey">Nenhuma notificação</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-for="notif in notificationStore.notifications"
                :key="notif.id"
                :class="{'unread-notif': !notif.read}"
                @click="notificationStore.handleNotificationClick(notif, router)"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getNotifColor(notif.type)" size="40">
                    <v-icon color="white">{{ getNotifIcon(notif.type) }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold text-subtitle-2">
                  {{ notif.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ notif.message }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption mt-1 font-italic">
                  {{ formatTime(notif.created_at) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-btn
          v-for="item in menuItems"
          :key="item.text"
          :href="item.link"
          target="_blank"
          variant="text"
          size="small"
          class="text-caption opacity-90"
        >
          <v-icon size="small" class="mr-1">{{ item.icon }}</v-icon>
          {{ item.text }}
        </v-btn>
         <v-btn
         @click="goHome"
          variant="text"
          size="small"
          class="text-caption opacity-90"
        >
          <v-icon size="small" class="mr-1">mdi-home</v-icon>
          INÍCIO
        </v-btn>
        <v-divider vertical class="mx-2 opacity-30" />
      </div> 

       <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            v-bind="props"
            variant="text"
          />
        </template>
        <v-list>
          <v-list-item>
            <template v-slot:prepend><v-icon>mdi-account</v-icon></template>
            <v-list-item-title>{{ currentUserName }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item v-if="isAdmin && !isSecretariaAdmin" @click="cadastroAberto = true">
            <template v-slot:prepend><v-icon>mdi-account-plus</v-icon></template>
            <v-list-item-title>Cadastrar usuário</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin && !isSecretariaAdmin" @click="resetAberto = true">
            <template v-slot:prepend><v-icon>mdi-lock-reset</v-icon></template>
            <v-list-item-title>Redefinir senha</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Sair</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Modals -->
    <UserRegistrationModal v-model="cadastroAberto" @registered="onRegistered" />
    <PasswordResetModal v-model="resetAberto" />
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useNotificationStore } from '@/store/notifications'

// Subcomponents
import UserRegistrationModal from './UserRegistrationModal.vue'
import PasswordResetModal from './PasswordResetModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isSecretariaAdmin = computed(() => authStore.isSecretariaAdmin)

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.fetchNotifications()
    notificationStore.fetchUnreadCount()
  }
})

const currentUserName = computed(() => authStore.user?.name || authStore.user?.nif || 'Usuário')
const isAdmin = computed(() => authStore.isAdmin)

const getNotifIcon = (type) => {
  switch (type) {
    case 'new_occurrence': return 'mdi-alert-circle'
    case 'new_referral': return 'mdi-account-arrow-right'
    case 'referral_update': return 'mdi-update'
    case 'referral_finalized': return 'mdi-check-circle'
    case 'referral_comment': return 'mdi-comment'
    case 'birthday': return 'mdi-cake-variant'
    default: return 'mdi-bell'
  }
}

const getNotifColor = (type) => {
  switch (type) {
    case 'new_occurrence': return 'error'
    case 'new_referral': return 'primary'
    case 'birthday': return 'pink'
    case 'referral_finalized': return 'success'
    default: return 'grey'
  }
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formattedDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const menuItems = [
  { text: 'INTRANET', icon: 'mdi-web', link: 'http://intranet568.sp.senai.br/' },
  { text: 'Diário FIC', icon: 'mdi-school', link: 'https://diariofic.sp.senai.br/' },
  { text: 'PORTAL EDU', icon: 'mdi-school', link: 'https://pess.sesisenaispedu.org.br/' },
  { text: 'RH SAP', icon: 'mdi-account-group', link: 'https://portalrh.sesisenaisp.org.br/arte/' },
  { text: 'GED', icon: 'mdi-file-document', link: 'https://sesisenaisp.sharepoint.com/sites/NovaGED' },
  { text: 'OUTLOOK', icon: 'mdi-email', link: 'https://mail.sesisenaisp.org.br/' },
  { text: 'SGSET', icon: 'mdi-cog', link: 'https://sgset.sp.senai.br/' },
  { text: 'EMPREGRA+', icon: 'mdi-briefcase', link: 'https://www.senaipr.org.br/' },
]

const goHome = () => router.push('/home')

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const cadastroAberto = ref(false)
const resetAberto = ref(false)

const onRegistered = () => {
  alert("Usuário cadastrado com sucesso!")
}
</script>

<style scoped>
.unread-notif {
  background-color: rgba(255, 193, 7, 0.05);
}
.notification-list::-webkit-scrollbar {
  width: 4px;
}
.notification-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
