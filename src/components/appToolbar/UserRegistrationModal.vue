<template>
  <v-dialog v-model="isOpen" max-width="640">
    <v-card rounded="lg">
      <v-card-title class="text-h6">Cadastro de usuário</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="handleRegister">
          <v-row>
            <v-col cols="12" md="5">
              <v-text-field
                v-model="form.nif"
                label="Número do NIF"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-card-account-details"
                :rules="rules.required"
                autocomplete="off"
              />
            </v-col>
            <v-col cols="12" md="7">
              <v-text-field
                v-model="form.name"
                label="Nome completo"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                :rules="rules.name"
                autocomplete="name"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="E-mail"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email"
                autocomplete="email"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.role"
                :items="roles"
                label="Tipo de usuário"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-badge"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Senha"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="rules.password"
                autocomplete="new-password"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Confirmar senha"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-check"
                :rules="rules.confirmPassword"
                autocomplete="new-password"
              />
            </v-col>
          </v-row>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
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
            Cadastrar
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
import { ref, reactive, computed } from 'vue'
import { api } from '@/api/axios'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'registered'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const error = ref('')

const form = reactive({
  nif: '',
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  role: 'regular'
})

const roles = [
  { title: 'Regular', value: 'regular' },
  { title: 'FIC', value: 'fic' },
  { title: 'Admin', value: 'admin' },
  { title: 'Secretaria', value: 'secretaria' }
]

const rules = {
  required: [v => !!v || 'Campo obrigatório'],
  name: [v => !!v || 'Nome é obrigatório'],
  password: [v => !!v || 'Senha é obrigatória'],
  confirmPassword: [
    v => !!v || 'Confirmação é obrigatória',
    v => v === form.password || 'As senhas não conferem'
  ]
}

const handleRegister = async () => {
  if (!valid.value) return
  loading.value = true
  error.value = ''
  try {
    const payload = { ...form }
    delete payload.confirmPassword
    await api.post("/users/register", payload)
    isOpen.value = false
    emit('registered')
    resetForm()
  } catch (e) {
    error.value = e.response?.data?.message || 'Falha ao cadastrar.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    nif: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'regular'
  })
}
</script>
