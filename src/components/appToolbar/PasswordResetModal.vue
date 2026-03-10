<template>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4">Alterar minha senha</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="handleChangePassword">
          <v-text-field
            v-model="senhaData.currentPassword"
            label="Senha atual"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :rules="[v => !!v || 'Senha atual é obrigatória']"
            required
            class="mb-2"
          />
          <v-text-field
            v-model="senhaData.newPassword"
            label="Nova senha"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-reset"
            :rules="[v => !!v || 'Nova senha é obrigatória', v => (v && v.length >= 6) || 'Mínimo de 6 caracteres']"
            required
            class="mb-2"
          />
          <v-text-field
            v-model="senhaData.confirmPassword"
            label="Confirmar nova senha"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-check-outline"
            :rules="[v => !!v || 'Confirmação é obrigatória', v => v === senhaData.newPassword || 'As senhas não conferem']"
            required
            class="mb-4"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4 text-caption">
            {{ error }}
          </v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mb-4 text-caption">
            Senha alterada com sucesso!
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
            Salvar alteração
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" color="senai-red" @click="isOpen = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const authStore = useAuthStore()
const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const senhaData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

watch(isOpen, (val) => {
  if (val) {
    error.value = ''
    success.value = false
    senhaData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }
})

const handleChangePassword = async () => {
  if (!valid.value) return
  loading.value = true
  error.value = ''
  success.value = false
  
  try {
    await authStore.changePassword({
      currentPassword: senhaData.value.currentPassword,
      newPassword: senhaData.value.newPassword
    })
    success.value = true
    setTimeout(() => {
      isOpen.value = false
    }, 2000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Falha ao alterar senha.'
  } finally {
    loading.value = false
  }
}
</script>
