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

              <div class="text-center mt-4">
                <v-btn variant="text" color="senai-red" @click="dialogEsqueciSenha = true">
                  Esqueci minha senha
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Esqueci Senha -->
    <v-dialog v-model="dialogEsqueciSenha" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Recuperar Senha
        </v-card-title>
        <v-card-text>
          <p class="mb-4 text-body-2">
            Informe seu e-mail de cadastro para receber uma nova senha provisória.
          </p>
          <v-form ref="esqueciSenhaFormRef" v-model="esqueciSenhaValid" @submit.prevent="handleForgot">
            <v-text-field
              v-model="emailRecuperacao"
              label="E-mail"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              :rules="emailRules"
              required
            />

            <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4">
              {{ successMsg }}
            </v-alert>
            <v-alert v-if="forgotError" type="error" variant="tonal" class="mb-4">
              {{ forgotError }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEsqueciSenha = false">Cancelar</v-btn>
          <v-btn
            color="senai-red"
            variant="elevated"
            :loading="loadingForgot"
            :disabled="!esqueciSenhaValid"
            @click="handleForgot"
          >
            Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

// Forgot Password state
const dialogEsqueciSenha = ref(false)
const esqueciSenhaFormRef = ref(null)
const esqueciSenhaValid = ref(false)
const loadingForgot = ref(false)
const emailRecuperacao = ref("")
const successMsg = ref("")
const forgotError = ref("")

// Rules
const registroRules = [v => !!v || 'Número de registro é obrigatório']
const senhaRules = [v => !!v || 'Senha é obrigatória']
const emailRules = [
  v => !!v || 'E-mail é obrigatório',
  v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
]

async function handleForgot() {
  if (!esqueciSenhaValid.value) return

  try {
    loadingForgot.value = true
    forgotError.value = ""
    successMsg.value = ""

    const response = await authStore.forgotPassword(emailRecuperacao.value)

    successMsg.value = response?.message || "Uma nova senha provisória foi enviada para o seu e-mail."
    setTimeout(() => {
      if (successMsg.value.includes("nova senha provisória é:")) {
        // Se a senha foi mostrada na tela (falha de email), damos mais tempo para o usuário ler
        return
      }
      dialogEsqueciSenha.value = false
      successMsg.value = ""
      emailRecuperacao.value = ""
    }, 6000)
  } catch (err) {
    console.error('Erro ao recuperar senha:', err)
    forgotError.value = err.response?.data?.message || "Erro ao solicitar recuperação de senha"
  } finally {
    loadingForgot.value = false
  }
}

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
