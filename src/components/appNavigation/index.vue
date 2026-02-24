<template>
  <v-navigation-drawer
    app
    permanent
    :width="navigationWidth"
    color="surface"
    elevation="4"
    border="0"
  >
    <!-- Header -->
    <v-list-item class="pa-4">
      <template v-slot:prepend>
        <v-icon color="senai-red" size="large">mdi-view-dashboard</v-icon>
      </template>
      <v-list-item-title class="text-h6 font-weight-medium">Menu Principal</v-list-item-title>
    </v-list-item>

    <v-divider />

    <!-- Navigation Items -->
    <v-list density="comfortable" nav class="pa-2">
      <v-list-item
        v-for="item in filteredNavItems"
        :key="item.text"
        :to="`/${item.route}`"
        rounded="xl"
        class="mb-1"
      >
        <template v-slot:prepend>
          <v-icon :color="getIconColor(item.route)">{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title class="font-weight-medium">{{ item.text }}</v-list-item-title>
        <template v-slot:append>
          <v-chip v-if="item.route && item.route.includes('encaminhamentos') && pendingTotal > 0" size="x-small" color="senai-red" text-color="white">
            {{ pendingTotal }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <!-- Footer -->
    <template v-slot:append>
      <v-divider />
      <v-list-item
        prepend-icon="mdi-help-circle"
        title="Ajuda"
        subtitle="Suporte técnico"
        density="compact"
        @click="openHelp"
        class="pa-4"
      />
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const authStore = useAuthStore()
const navigationWidth = ref(280)
const pendingTotal = ref(0)

const isAdmin = computed(() => authStore.isAdmin)

const navItems = [
  { text: 'Início', route: 'home', icon: 'mdi-home' },
  { text: 'Carômetro', route: 'carometro', icon: 'mdi-account-group'},
  { text: 'Encaminhamentos', route: 'encaminhamentos/abertos', icon: 'mdi-send' },
  { text: 'Usuários', route: 'users', icon: 'mdi-account-cog', adminOnly: true },
  { text: 'Administração', route: 'admin', icon: 'mdi-cog', adminOnly: true }
]

// Filtrar itens por permissão
const filteredNavItems = computed(() => {
  return navItems.filter(item => !item.adminOnly || isAdmin.value)
})

onMounted(() => {
  const updateWidth = () => { navigationWidth.value = window.innerWidth < 960 ? 260 : 280 }

  updateWidth()
  window.addEventListener('resize', updateWidth)

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })
})

const getIconColor = (routeName) => {
  const currentRoute = route?.path || ''
  return currentRoute.includes(routeName) ? 'senai-red' : 'senai-navy'
}

const openHelp = () => { 
  const url = `https://wa.me/5511973290206`
  window.open(url, "_blank")
}
</script>
