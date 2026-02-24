<template>
  <v-app>
    <AppToolbar />
    <AppNavigation />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import AppToolbar from '@/components/appToolbar/index.vue'
import AppNavigation from '@/components/appNavigation/index.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeStore()
})
</script>
