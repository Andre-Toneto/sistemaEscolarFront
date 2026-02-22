<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-h6">Login</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
        />

        <v-text-field
          v-model="password"
          label="Senha"
          type="password"
        />

        <v-alert
          v-if="error"
          type="error"
          class="mb-2"
        >
          {{ error }}
        </v-alert>

        <v-btn
          block
          color="primary"
          @click="handleLogin"
          :loading="loading"
        >
          Entrar
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { login } from "@/services/auth.services"

const email = ref("")
const password = ref("")
const router = useRouter()

async function handleLogin() {
  await login(email.value, password.value)
  router.push("/dashboard")
}
</script>