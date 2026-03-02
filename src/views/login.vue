<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="12" rounded="lg" class="pa-6">
          <v-card-title class="text-center pb-4">
            <div class="text-center">
              <v-icon size="48" color="senai-red" class="mb-2">mdi-account-group</v-icon>
              <h2 class="text-h4 text-senai-red font-weight-medium mb-2">Acesse sua conta</h2>
              <p class="text-body-1 text-medium-emphasis">Autenticação necessária</p>
            </div>
          </v-card-title>

          <v-card-text>
            <v-form ref="loginFormRef" v-model="loginFormValid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="credentials.registro"
                label="Número de registro (NIF)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-card-account-details"
                :rules="registroRules"
                class="mb-3"
                autocomplete="username"
              />

              <v-text-field
                v-model="credentials.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                label="Senha"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarSenha = !mostrarSenha"
                :rules="senhaRules"
                class="mb-4"
                autocomplete="current-password"
              />

              <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
                {{ error }}
              </v-alert>

              <v-btn
                :disabled="!loginFormValid"
                :loading="loadingLogin"
                color="senai-red"
                size="large"
                block
                type="submit"
                elevation="2"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// Login state
const loginFormRef = ref(null)
const loginFormValid = ref(false)
const loadingLogin = ref(false)
const mostrarSenha = ref(false)
const error = ref("")

const credentials = ref({
  registro: '',
  senha: ''
})

// Rules
const registroRules = [v => !!v || 'Número de registro é obrigatório']
const senhaRules = [v => !!v || 'Senha é obrigatória']

async function handleLogin() {
  if (!loginFormValid.value) return
  
  try {
    loadingLogin.value = true
    error.value = ""

    await authStore.login(credentials.value.registro, credentials.value.senha)

    // Disparar evento de mudança de sessão para atualizar outros componentes (legado)
    window.dispatchEvent(new CustomEvent('carometro-session-changed'))

    const redirect = router.currentRoute.value.query.redirect || "/home"
    router.push(redirect)
  } catch (err) {
    console.error('Erro no login:', err)
    error.value = err.response?.data?.message || "Credenciais inválidas ou erro no servidor"
  } finally {
    loadingLogin.value = false
  }
}
</script>
