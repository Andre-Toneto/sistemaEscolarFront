<template>
  <v-dialog v-model="isOpen" max-width="520">
    <v-card rounded="lg">
      <v-card-title class="text-h6">Redefinir senha do usuário</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="handleReset">
          <v-text-field
            v-model="nif"
            label="Número do NIF"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-card-account-details"
            :rules="[v => !!v || 'Campo obrigatório']"
            autocomplete="off"
            class="mb-4"
          />
          <v-text-field
            v-model="tempPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Nova senha"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-reset"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="[v => !!v || 'Obrigatório', v => (v && v.length >= 6) || 'Mínimo de 6 caracteres']"
            autocomplete="new-password"
            class="mb-2"
          />
          <div class="d-flex align-center mb-4">
            <v-btn size="small" variant="text" color="senai-red" @click="generateNewPassword" class="mr-2">
              <v-icon start>mdi-refresh</v-icon>
              Gerar outra
            </v-btn>
            <v-btn size="small" variant="text" color="senai-red" @click="copyPassword">
              <v-icon start>mdi-content-copy</v-icon>
              Copiar
            </v-btn>
          </div>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
            Senha redefinida com sucesso.
          </v-alert>

          <v-btn
            :disabled="!valid"
            :loading="loading"
            color="senai-red"
            size="large"
            block
            type="submit"
            elevation="2"
          >
            Redefinir senha
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" color="senai-red" @click="isOpen = false">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '@/api/axios'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'reset'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)
const nif = ref('')
const tempPassword = ref('')
const showPassword = ref(false)
const error = ref('')
const success = ref(false)

const generateNewPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  tempPassword.value = out
}

watch(isOpen, (val) => {
  if (val) {
    error.value = ''
    success.value = false
    nif.value = ''
    generateNewPassword()
  }
})

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(String(tempPassword.value || ''))
  } catch {}
}

const handleReset = async () => {
  if (!valid.value) return
  loading.value = true
  error.value = ''
  success.value = false
  try {
    // Note: This endpoint should be implemented in backend
    await api.post(`/users/reset-password`, { 
      nif: nif.value, 
      newPassword: tempPassword.value 
    })
    success.value = true
    emit('reset')
  } catch (e) {
    error.value = e.response?.data?.message || 'Falha ao redefinir senha.'
  } finally {
    loading.value = false
  }
}
</script>
