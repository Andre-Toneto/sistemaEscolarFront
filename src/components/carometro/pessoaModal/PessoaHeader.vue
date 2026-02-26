<template>
  <v-sheet class="modal-gradient-header d-flex align-center justify-space-between pa-2" rounded="t-xl">
    <div class="d-flex align-center">
      <v-avatar size="64" class="elevation-8 modal-avatar-border">
        <v-img v-if="pessoa.foto" :src="pessoa.foto">
          <template #error>
            <v-icon color="white" size="32">mdi-account</v-icon>
          </template>
        </v-img>
        <v-icon v-else color="white" size="32">mdi-account</v-icon>
      </v-avatar>
      <div class="ml-4">
        <div class="d-flex align-center">
          <h2 class="text-h5 font-weight-bold text-white mr-3">{{ safeValue(pessoa.name || pessoa.nome).toUpperCase() }}</h2>
          <v-chip size="small" color="white" variant="outlined" class="mr-3" v-if="pessoa.registration_number || pessoa.matricula">
            <v-icon start size="small">mdi-card-account-details</v-icon>
            {{ pessoa.registration_number || pessoa.matricula }}
          </v-chip>
          <v-btn icon size="small" variant="text" color="white" class="ml-2" @click.stop="copy('Nome', pessoa.name || pessoa.nome)" title="Copiar nome">
            <v-icon size="18">mdi-content-copy</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" icon size="small" variant="text" color="white" class="ml-1" @click.stop="$emit('edit')" title="Editar dados do aluno">
            <v-icon size="18">mdi-account-edit</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" icon size="small" variant="text" color="white" class="ml-1" @click.stop="$emit('move')" title="Mover aluno de turma">
            <v-icon size="18">mdi-account-switch</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" icon size="small" variant="text" color="white" class="ml-1" @click.stop="$emit('remove')" title="Remover aluno da turma">
            <v-icon size="18">mdi-account-remove</v-icon>
          </v-btn>
          <v-chip size="small" color="success" variant="elevated">
            <v-icon start size="small">mdi-check-circle</v-icon>
            Ativo
          </v-chip>
        </div>
        <p class="text-body-2 text-white" v-if="pessoa.position || pessoa.cargo">{{ safeValue(pessoa.position || pessoa.cargo) }}</p>
      </div>
    </div>
    <v-btn icon="mdi-close" variant="text" color="white" size="large" @click="$emit('close')" />
  </v-sheet>
</template>

<script setup>
import { safeValue } from '@/utils/exportUtils'

defineProps({
  pessoa: Object,
  isAdmin: Boolean
})

const emit = defineEmits(['close', 'edit', 'move', 'remove', 'copy'])

const copy = (label, value) => {
  emit('copy', { label, value })
}
</script>

<style scoped>
.modal-gradient-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
}
.modal-avatar-border {
  border: 4px solid rgba(255, 255, 255, 0.3);
}
</style>
