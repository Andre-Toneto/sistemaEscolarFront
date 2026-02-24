<template>
  <v-card elevation="4" rounded="xl" class="mt-4">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        <span>Histórico de Ocorrências</span>
      </div>
      <div class="d-flex ga-2">
        <v-btn v-if="isAdmin" color="primary" size="small" variant="tonal" prepend-icon="mdi-file-pdf-box" @click="$emit('export-pdf')">
          PDF
        </v-btn>
        <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="abrirModalOcorrencia()">
          Nova
        </v-btn>
      </div>
    </v-card-title>
    <v-divider />

    <v-card-text class="pa-0">
      <v-text-field
        v-model="termoPesquisa"
        label="Pesquisar nas ocorrências..."
        prepend-inner-icon="mdi-magnify"
        variant="filled"
        density="compact"
        hide-details
        class="pa-2"
      />

      <v-list v-if="ocorrenciasFiltradas.length > 0" lines="three">
        <v-list-item v-for="oc in ocorrenciasFiltradas" :key="oc.id" class="px-4">
          <template #prepend>
            <v-avatar :color="getTipoColor(oc.type || oc.tipo)" size="40">
              <v-icon color="white">{{ getTipoIcon(oc.type || oc.tipo) }}</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold">
            {{ oc.type || oc.tipo || 'Ocorrência' }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <div class="mb-1">{{ formatData(oc.date || oc.data) }} • por {{ oc.user?.name || oc.autor || 'Sistema' }}</div>
            <div class="text-body-2 text-wrap">{{ oc.description || oc.descricao }}</div>
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex flex-column">
              <v-btn icon size="small" variant="text" color="primary" @click="abrirModalOcorrencia(oc)" v-if="canAlterar(oc)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(oc)" v-if="canAlterar(oc)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="pa-8 text-center text-grey">
        Nenhuma ocorrência encontrada.
      </div>
    </v-card-text>

    <!-- Modal Nova/Editar Ocorrência -->
    <v-dialog v-model="modalOcorrencia" max-width="600">
      <v-card rounded="lg">
        <v-card-title>{{ editandoOcorrencia ? 'Editar Ocorrência' : 'Nova Ocorrência' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="formOcorrencia.tipo"
                :items="tiposOcorrencia"
                label="Tipo"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formOcorrencia.data"
                label="Data"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formOcorrencia.descricao"
                label="Descrição"
                variant="outlined"
                rows="4"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="modalOcorrencia = false">Cancelar</v-btn>
          <v-btn color="primary" @click="salvarOcorrencia" :loading="saving">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Exclusão -->
    <v-dialog v-model="showConfirmDelete" max-width="400">
      <v-card>
        <v-card-title>Confirmar Exclusão</v-card-title>
        <v-card-text>Deseja realmente excluir esta ocorrência?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showConfirmDelete = false">Não</v-btn>
          <v-btn color="error" @click="deleteOccurrence">Sim, Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useOccurrencesStore } from '@/store/occurrences'
import { formatData } from '@/utils/exportUtils'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  studentId: String,
  isAdmin: Boolean
})

const emit = defineEmits(['export-pdf', 'updated'])

const store = useOccurrencesStore()
const authStore = useAuthStore()

const termoPesquisa = ref('')
const modalOcorrencia = ref(false)
const saving = ref(false)
const editandoOcorrencia = ref(null)
const showConfirmDelete = ref(false)
const toDelete = ref(null)

const formOcorrencia = ref({
  tipo: 'Disciplinar',
  descricao: '',
  data: new Date().toISOString().split('T')[0]
})

const typesMapping = {
  'Disciplinar': { color: 'error', icon: 'mdi-alert' },
  'Comportamental': { color: 'warning', icon: 'mdi-account-alert' },
  'Acadêmico': { color: 'info', icon: 'mdi-school' },
  'Falta': { color: 'grey', icon: 'mdi-calendar-remove' },
  'Atraso': { color: 'amber', icon: 'mdi-clock-alert' },
  'Outro': { color: 'blue-grey', icon: 'mdi-information' }
}

const tiposOcorrencia = Object.keys(typesMapping)

const getTipoColor = (tipo) => typesMapping[tipo]?.color || 'blue-grey'
const getTipoIcon = (tipo) => typesMapping[tipo]?.icon || 'mdi-information'

const occurrences = computed(() => store.getOccurrencesByStudentId(props.studentId))

const ocorrenciasFiltradas = computed(() => {
  if (!termoPesquisa.value.trim()) return occurrences.value
  const termo = termoPesquisa.value.toLowerCase().trim()
  return occurrences.value.filter(oc => {
    return (oc.type || oc.tipo || '').toLowerCase().includes(termo) ||
           (oc.description || oc.descricao || '').toLowerCase().includes(termo) ||
           (oc.user?.name || oc.autor || '').toLowerCase().includes(termo)
  })
})

const canAlterar = (oc) => {
  if (authStore.isAdmin) return true
  const autorId = oc.user_id
  return autorId === authStore.user?.id
}

const abrirModalOcorrencia = (oc = null) => {
  if (oc) {
    editandoOcorrencia.value = oc
    formOcorrencia.value = {
      tipo: oc.type || oc.tipo || 'Disciplinar',
      descricao: oc.description || oc.descricao || '',
      data: oc.date ? new Date(oc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }
  } else {
    editandoOcorrencia.value = null
    formOcorrencia.value = {
      tipo: 'Disciplinar',
      descricao: '',
      data: new Date().toISOString().split('T')[0]
    }
  }
  modalOcorrencia.value = true
}

const salvarOcorrencia = async () => {
  if (!formOcorrencia.value.descricao.trim()) return
  
  saving.value = true
  try {
    const payload = {
      student_id: props.studentId,
      user_id: authStore.user?.id,
      description: formOcorrencia.value.descricao,
      type: formOcorrencia.value.tipo,
      date: new Date(formOcorrencia.value.data).toISOString()
    }

    if (editandoOcorrencia.value) {
      await store.updateOccurrence(editandoOcorrencia.value.id, payload)
    } else {
      await store.createOccurrence(payload)
    }
    modalOcorrencia.value = false
    emit('updated')
  } catch (err) {
    console.error('Error saving occurrence:', err)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (oc) => {
  toDelete.value = oc
  showConfirmDelete.value = true
}

const deleteOccurrence = async () => {
  if (!toDelete.value) return
  try {
    await store.deleteOccurrence(toDelete.value.id)
    showConfirmDelete.value = false
    toDelete.value = null
    emit('updated')
  } catch (err) {
    console.error('Error deleting occurrence:', err)
  }
}
</script>
