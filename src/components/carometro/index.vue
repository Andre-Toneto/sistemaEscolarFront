<template>
  <v-container fluid>
    <!-- Campo de Busca -->
    <v-row class="mb-4" v-if="pessoas.length > 0">
      <v-col cols="12" md="6" class="pb-0">
        <v-text-field
          v-model="termoBusca"
          label="Buscar por nome ou matrícula"
          placeholder="Digite o nome ou matrícula do aluno..."
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="rounded-lg"
        >
          <template v-slot:append-inner>
            <v-fade-transition>
              <v-chip
                v-if="termoBusca && pessoasFiltradas.length !== pessoas.length"
                size="small"
                color="primary"
                variant="flat"
              >
                {{ pessoasFiltradas.length }} de {{ pessoas.length }}
              </v-chip>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-chip-group class="flex-wrap">
          <v-chip
            :color="!filtroAtivo ? 'primary' : 'default'"
            :variant="!filtroAtivo ? 'flat' : 'outlined'"
            size="small"
            @click="limparFiltros"
          >
            <v-icon start size="small">mdi-account-group</v-icon>
            Todos ({{ pessoas.length }})
          </v-chip>
          <v-chip
            v-if="termoBusca"
            color="success"
            variant="flat"
            size="small"
            prepend-icon="mdi-filter"
          >
            Filtrados ({{ pessoasFiltradas.length }})
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Cabeçalho com botões de ação -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex justify-space-between align-center flex-wrap ga-2">
          <div>
            <h3 class="text-h6 text-senai-red font-weight-medium">
              {{ pessoasFiltradas.length }} {{ pessoasFiltradas.length === 1 ? 'pessoa encontrada' : 'pessoas encontradas' }}
              <span v-if="termoBusca" class="text-body-2 text-medium-emphasis">de {{ pessoas.length }} total</span>
            </h3>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="senai-red" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">Carregando dados...</p>
    </div>

    <!-- Lista vazia -->
    <div v-else-if="pessoas.length === 0" class="text-center py-12">
      <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-account-off</v-icon>
      <h3 class="text-h6 text-medium-emphasis mb-2">Nenhuma pessoa encontrada</h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Esta turma ainda não possui alunos cadastrados ou importados.
      </p>
      <div class="d-flex gap-2 justify-center flex-wrap">
        <v-btn variant="outlined" color="primary" prepend-icon="mdi-refresh" @click="carregarAlunos">
          Atualizar Dados
        </v-btn>
      </div>
    </div>

    <!-- Grid de Alunos -->
    <v-row v-else-if="pessoasFiltradas.length > 0" class="d-flex">
      <v-col
        v-for="pessoa in pessoasFiltradas"
        :key="pessoa.id"
        cols="12"
        sm="6"
        md="4"
        lg="2"
        xl="2"
        class="d-flex pa-1"
      >
        <StudentCard
          :pessoa="pessoa"
          @click="abrirModal(pessoa)"
          @copy="copyToClipboard($event, 'Matrícula')"
        />
      </v-col>
    </v-row>

    <v-snackbar v-model="copySnackbar" :timeout="2000" color="primary" location="bottom">
      {{ copyMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as carometroService from '@/services/carometro.services'
import StudentCard from './StudentCard.vue'

const props = defineProps({
  turma: String, // class_id
  curso: String  // course_id
})

const emit = defineEmits(['selectPessoa', 'updateTotal'])

const pessoas = ref([])
const loading = ref(false)
const termoBusca = ref('')

const pessoasFiltradas = computed(() => {
  if (!termoBusca.value) return pessoas.value
  const termo = termoBusca.value.toLowerCase().trim()
  return pessoas.value.filter(pessoa => {
    const nome = pessoa.name?.toLowerCase() || ''
    const matricula = pessoa.registration_number?.toString().toLowerCase() || ''
    return nome.includes(termo) || matricula.includes(termo)
  })
})

const filtroAtivo = computed(() => !!termoBusca.value)

const carregarAlunos = async () => {
  if (!props.turma) return
  loading.value = true
  try {
    const alunos = await carometroService.getStudents(props.turma)
    pessoas.value = sortPessoas(alunos)
    emit('updateTotal', pessoas.value.length)
  } catch (error) {
    console.error('Erro ao carregar alunos:', error)
    pessoas.value = []
    emit('updateTotal', 0)
  } finally {
    loading.value = false
  }
}

const abrirModal = (pessoa) => {
  emit('selectPessoa', pessoa)
}

const limparFiltros = () => {
  termoBusca.value = ''
}

defineExpose({
  recarregar: carregarAlunos
})

onMounted(() => {
  if (props.turma) carregarAlunos()
})

watch(() => props.turma, (newTurma) => {
  if (newTurma) carregarAlunos()
})

const sortPessoas = (arr) => {
  if (!Array.isArray(arr)) return arr
  return [...arr].sort((a, b) => {
    const na = String(a?.name || a?.registration_number || '').trim()
    const nb = String(b?.name || b?.registration_number || '').trim()
    return na.localeCompare(nb, 'pt', { sensitivity: 'base' })
  })
}

const copySnackbar = ref(false)
const copyMessage = ref('')

const copyToClipboard = async (value, label = '') => {
  if (!value) return
  try {
    await navigator.clipboard.writeText(String(value))
    copyMessage.value = `${label ? label + ' copiado' : 'Copiado'}: ${value}`
    copySnackbar.value = true
  } catch (e) {
    console.error('Erro ao copiar:', e)
  }
}
</script>
