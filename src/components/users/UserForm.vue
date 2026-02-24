<template>
  <v-card class="pa-4 mb-4" rounded="xl" elevation="4">
    <v-card-title>
      {{ editingId ? "Editar Usuário" : "Novo Usuário" }}
    </v-card-title>

    <v-form ref="userForm" v-model="valid">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field v-model="form.name" label="Nome" :rules="rules.name" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field v-model="form.email" label="Email" :rules="rules.email" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="form.nif" label="NIF" :rules="rules.nif" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="form.password" label="Senha" type="password" :rules="rules.password" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="form.passwordConfirm" label="Confirmar Senha" type="password" :rules="rules.passwordConfirm" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field v-model="form.birthDate" label="Data de Nascimento" :rules="rules.birthDate" type="date" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="form.role"
            :items="['admin', 'fic', 'regular', 'secretaria']"
            label="Cargo (Role)"
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-form>

    <v-card-actions>
      <v-btn color="primary" @click="save" :loading="loading">
        {{ editingId ? "Atualizar" : "Criar" }}
      </v-btn>
      <v-btn v-if="editingId" color="grey" variant="text" @click="cancel">
        Cancelar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  editingId: [String, Number],
  initialForm: Object,
  loading: Boolean
})

const emit = defineEmits(['save', 'cancel'])

const userForm = ref(null)
const valid = ref(false)
const form = reactive({
  name: "",
  email: "",
  nif: "",
  birthDate: "",
  password: "",
  passwordConfirm: "",
  role: "regular"
})

const rules = {
  name: [v => !!v || 'Nome é obrigatório'],
  email: [
    v => !!v || 'Email é obrigatório',
    v => /.+@.+\..+/.test(v) || 'Email inválido'
  ],
  nif: [v => !!v || 'NIF é obrigatório'],
  password: [v => !props.editingId ? !!v || 'Senha é obrigatória' : true],
  passwordConfirm: [
    v => !props.editingId ? !!v || 'Confirmação é obrigatória' : true,
    v => v === form.password || 'As senhas não conferem'
  ],
  birthDate: [v => !!v || 'Data de nascimento é obrigatória']
}

const reset = () => {
  if (userForm.value) userForm.value.resetValidation()
  Object.assign(form, {
    name: "",
    email: "",
    nif: "",
    birthDate: "",
    password: "",
    passwordConfirm: "",
    role: "regular"
  })
}

const save = async () => {
  const { valid: formValid } = await userForm.value.validate()
  if (!formValid) return
  emit('save', { ...form })
}

const cancel = () => {
  reset()
  emit('cancel')
}

watch(() => props.initialForm, (val) => {
  if (val) {
    Object.assign(form, val)
  } else {
    reset()
  }
}, { immediate: true })

defineExpose({ reset })
</script>
