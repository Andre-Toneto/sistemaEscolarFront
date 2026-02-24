<template>
  <v-dialog v-model="isOpen" :max-width="isAdmin ? 1100 : 800" persistent>
    <v-card elevation="24" rounded="xl" class="modal-gradient-card">
      <!-- Header -->
      <PessoaHeader
        :pessoa="pessoa"
        :isAdmin="isAdmin"
        @close="isOpen = false"
        @edit="editOpen = true"
        @move="moveOpen = true"
        @remove="removeOpen = true"
        @copy="onCopy"
      />

      <!-- Conteúdo -->
      <v-card-text class="pa-6">
        <!-- Cards de Informação -->
        <PessoaInfo
          :pessoa="pessoa"
          :cursoNome="curso?.nome"
          :turmaNome="turma?.class_name"
          :isAdmin="isAdmin"
          @copy="onCopy"
        />

        <!-- Ocorrências -->
        <PessoaOccurrences
          :studentId="pessoa?.id"
          :isAdmin="isAdmin"
          @export-pdf="exportPDF"
          @updated="onOcorrenciaUpdated"
        />
      </v-card-text>
    </v-card>

    <!-- Diálogos de Ação -->
    <PessoaActions
      :student="pessoa"
      v-model:editOpen="editOpen"
      v-model:removeOpen="removeOpen"
      v-model:moveOpen="moveOpen"
      @updated="onStudentUpdated"
      @removed="onStudentRemoved"
      @moved="onStudentMoved"
    />

    <!-- Feedbacks -->
    <v-snackbar v-model="copySnackbar" :timeout="2000" color="success">
      {{ copyMessage }}
    </v-snackbar>

    <v-dialog v-model="errorDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">Erro</v-card-title>
        <v-card-text class="pa-4">{{ errorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="errorDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useOccurrencesStore } from '@/store/occurrences'
import { exportOcorrenciasPDF } from '@/utils/exportUtils'
import { ensureFoto } from '@/utils/carometroPhoto'

// Subcomponents
import PessoaHeader from './pessoaModal/PessoaHeader.vue'
import PessoaInfo from './pessoaModal/PessoaInfo.vue'
import PessoaOccurrences from './pessoaModal/PessoaOccurrences.vue'
import PessoaActions from './pessoaModal/PessoaActions.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  pessoa: { type: Object, default: () => ({}) },
  curso: { type: Object, default: () => ({}) },
  turma: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'aluno-movimentado', 'aluno-removido', 'aluno-atualizado'])

const authStore = useAuthStore()
const occurrencesStore = useOccurrencesStore()

const isAdmin = computed(() => authStore.isAdmin)

// Estados dos diálogos de ação
const editOpen = ref(false)
const removeOpen = ref(false)
const moveOpen = ref(false)

// Feedbacks
const errorDialog = ref(false)
const errorMessage = ref('')
const copySnackbar = ref(false)
const copyMessage = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Inicialização
onMounted(() => {
  occurrencesStore.fetchOccurrences()
})

watch(() => props.pessoa, (novaPessoa) => {
  if (novaPessoa?.id) {
    ensureFoto(props.pessoa, props.curso, props.turma)
  }
}, { immediate: true })

// Handlers
const onCopy = ({ label, value }) => {
  if (!value) return
  navigator.clipboard.writeText(value)
  copyMessage.value = `${label} copiado: ${value}`
  copySnackbar.value = true
}

const exportPDF = async () => {
  try {
    const studentOccurrences = occurrencesStore.getOccurrencesByStudentId(props.pessoa.id)
    await exportOcorrenciasPDF(props.pessoa, props.curso, props.turma, studentOccurrences)
  } catch (err) {
    errorMessage.value = 'Falha ao gerar PDF'
    errorDialog.value = true
  }
}

const onOcorrenciaUpdated = () => {
  // O store já foi atualizado pelo componente filho
}

const onStudentUpdated = (updatedPessoa) => {
  Object.assign(props.pessoa, updatedPessoa)
  emit('aluno-atualizado', props.pessoa)
}

const onStudentRemoved = (studentId) => {
  isOpen.value = false
  emit('aluno-removido', { alunoId: studentId })
}

const onStudentMoved = (dados) => {
  isOpen.value = false
  emit('aluno-movimentado', dados)
}
</script>

<style scoped>
.modal-gradient-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}
</style>
