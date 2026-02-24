<template>
  <div>
    <!-- Modal Edição Aluno -->
    <v-dialog v-model="alunoEditOpen" max-width="700">
      <v-card rounded="xl">
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-account-edit</v-icon>
          Editar Dados do Aluno
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="editFormRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.name" label="Nome Completo" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.registration_number" label="Matrícula" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.cpf" label="CPF" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.rg" label="RG" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.birth_date" label="Data de Nascimento" type="date" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.email" label="E-mail" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.phone" label="Telefone" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="alunoForm.mobile_phone" label="Celular" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="alunoForm.postal_code" label="CEP" variant="outlined" />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="alunoForm.address" label="Endereço" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="alunoForm.neighborhood" label="Bairro" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="alunoForm.city" label="Cidade" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="alunoForm.state" label="Estado" variant="outlined" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="alunoEditOpen = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveEdit" :loading="loading">Salvar Alterações</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Confirmação Remoção -->
    <v-dialog v-model="confirmRemoveOpen" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">Confirmar Remoção</v-card-title>
        <v-card-text class="pa-4">
          Deseja realmente remover o aluno <strong>{{ student?.name }}</strong> do sistema?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="confirmRemoveOpen = false">Cancelar</v-btn>
          <v-btn color="error" @click="handleRemove" :loading="loading">Sim, Remover</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Movimentação -->
    <MoveStudentModal v-model="movimentacaoOpen" :student="student" @moved="$emit('moved', $event)" />
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import * as carometroService from '@/services/carometro.services'
import MoveStudentModal from '@/components/admin/MoveStudentModal.vue'

const props = defineProps({
  student: Object,
  editOpen: Boolean,
  removeOpen: Boolean,
  moveOpen: Boolean
})

const emit = defineEmits(['update:editOpen', 'update:removeOpen', 'update:moveOpen', 'updated', 'removed', 'moved'])

const loading = ref(false)
const alunoForm = ref({})

const alunoEditOpen = ref(false)
const confirmRemoveOpen = ref(false)
const movimentacaoOpen = ref(false)

watch(() => props.editOpen, (val) => {
  if (val) {
    alunoForm.value = {
      ...props.student,
      birth_date: props.student?.birth_date ? props.student.birth_date.split('T')[0] : ''
    }
  }
  alunoEditOpen.value = val
})
watch(alunoEditOpen, (val) => emit('update:editOpen', val))

watch(() => props.removeOpen, (val) => confirmRemoveOpen.value = val)
watch(confirmRemoveOpen, (val) => emit('update:removeOpen', val))

watch(() => props.moveOpen, (val) => movimentacaoOpen.value = val)
watch(movimentacaoOpen, (val) => emit('update:moveOpen', val))

const saveEdit = async () => {
  if (!props.student?.id) return
  loading.value = true
  try {
    const payload = { ...alunoForm.value }
    if (payload.birth_date) payload.birth_date = new Date(payload.birth_date).toISOString()
    
    // Clean up empty strings
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') payload[key] = null
    })

    await carometroService.updateStudent(props.student.id, payload)
    alunoEditOpen.value = false
    emit('updated', payload)
  } catch (err) {
    console.error('Error saving student edits:', err)
  } finally {
    loading.value = false
  }
}

const handleRemove = async () => {
  if (!props.student?.id) return
  loading.value = true
  try {
    await carometroService.deleteStudent(props.student.id)
    confirmRemoveOpen.value = false
    emit('removed', props.student.id)
  } catch (err) {
    console.error('Error removing student:', err)
  } finally {
    loading.value = false
  }
}
</script>
