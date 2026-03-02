<template>
  <v-app>
    <AppToolbar />
    <AppNavigation />
    <v-main>
      <router-view />
    </v-main>

    <!-- Birthday Notification -->
    <v-snackbar
      v-model="showBirthdaySnack"
      color="senai-red"
      location="top right"
      vertical
      timeout="10000"
      elevation="12"
      rounded="xl"
    >
      <div class="d-flex align-center mb-2">
        <v-icon size="32" class="mr-3">mdi-party-popper</v-icon>
        <div>
          <div class="text-h6">Parabéns, {{ authStore.user?.name }}! 🎂</div>
          <div class="text-subtitle-2 opacity-80">Hoje é o seu dia especial!</div>
        </div>
      </div>
      <p class="mb-0 font-italic">{{ motivationalMessage }}</p>

      <template v-slot:actions>
        <v-btn variant="text" @click="showBirthdaySnack = false">Obrigado!</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AppToolbar from '@/components/appToolbar/index.vue'
import AppNavigation from '@/components/appNavigation/index.vue'
import { useAuthStore } from '@/store/auth'
import { fromDateOnly } from '@/utils/dateUtils'

const authStore = useAuthStore()
const showBirthdaySnack = ref(false)

const motivationalMessages = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia. Que seu novo ciclo seja brilhante!",
  "Acredite que você pode e você já está no meio do caminho. Feliz aniversário!",
  "Tudo o que um sonho precisa para ser realizado é alguém que acredite nele. Continue sonhando alto!",
  "A persistência é o caminho do êxito. Parabéns por mais um ano de conquistas!",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário. Sua dedicação é inspiradora!"
]

const motivationalMessage = computed(() => {
  const index = new Date().getDate() % motivationalMessages.length
  return motivationalMessages[index]
})

onMounted(() => {
  checkBirthday()
})

function checkBirthday() {
  if (!authStore.user?.birthDate) return

  const birth = fromDateOnly(authStore.user.birthDate)
  const today = new Date()

  if (birth && birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth()) {
    showBirthdaySnack.value = true
  }
}
</script>
