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
        v-for="item in navItems"
        v-show="item.route !== 'admin' || isAdmin"
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
          <v-chip v-if="item.route && item.route.includes('encaminhamentos')" size="x-small" color="senai-red" text-color="white">
            {{ pendingTotal }}
          </v-chip>
          <template v-else-if="item.badge">
            <v-chip size="x-small" color="senai-red" text-color="white">
              {{ item.badge }}
            </v-chip>
          </template>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
// import { db } from '@/services/firebase.js'
// import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'

const route = useRoute()
const navigationWidth = ref(280)
const pendingTotal = ref(0)

const navItems = [
  { text: 'Carômetro', route: 'carometro', icon: 'mdi-account-group'},
  { text: 'Encaminhamentos', route: 'encaminhamentos/abertos', icon: 'mdi-send' },
  { text: 'Mapa de Sala', route: 'mapa-sala', icon: 'mdi-floor-plan' },
  // { text: 'Formulários', route: 'formularios', icon: 'mdi-form-select' },
  { text: 'Calendário Escolar', route: 'calendario-escolar', icon: 'mdi-calendar' },
  { text: 'Administração', route: 'admin', icon: 'mdi-cog' }
]

const isSecretaria = ref(false)
const isAdmin = ref(false)

let _unsub = null

const setupListeners = () => {
  // teardown previous
  if (typeof _unsub === 'function') { _unsub(); _unsub = null }
  try {
    const user = JSON.parse(sessionStorage.getItem('carometro_user') || '{}')
    const role = String(user?.tipo_usuario || '').toLowerCase()
    isSecretaria.value = role === 'secretaria'
    isAdmin.value = role === 'admin'

    const coll = collection(db, 'encaminhamentos')

    if (isSecretaria.value || isAdmin.value) {
      const q = query(coll, where('status', '==', 'aberto'))
      _unsub = onSnapshot(q, (snap) => {
        pendingTotal.value = snap.size
      }, () => { pendingTotal.value = 0 })
    } else {
      const userReg = String(user?.registro || '')
      if (!userReg) { pendingTotal.value = 0; return }
      const q = query(coll, where('status', '==', 'finalizado'), where('createdByReg', '==', userReg))
      _unsub = onSnapshot(q, (snap) => {
        // Option 1: count all finalized items created by the user
        pendingTotal.value = snap.size
      }, () => { pendingTotal.value = 0 })
    }
  } catch (e) {
    pendingTotal.value = 0
  }
}

onMounted(() => {
  const updateWidth = () => { navigationWidth.value = window.innerWidth < 960 ? 260 : 280 }

  updateWidth()
  window.addEventListener('resize', updateWidth)
  setupListeners()
  const handler = () => setupListeners()
  window.addEventListener('carometro-session-changed', handler)
  window.addEventListener('visibilitychange', handler)
  window.addEventListener('focus', handler)

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
    window.removeEventListener('carometro-session-changed', handler)
    window.removeEventListener('visibilitychange', handler)
    window.removeEventListener('focus', handler)
    if (typeof _unsub === 'function') { _unsub(); _unsub = null }
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
