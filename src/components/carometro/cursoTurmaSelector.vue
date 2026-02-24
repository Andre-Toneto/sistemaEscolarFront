<template>
  <v-container fluid class="pa-0">
    <v-row class="mb-4">
      <!-- Seleção de Curso -->
      <v-col cols="12" lg="6">
        <v-card rounded="xl" elevation="2" class="h-100">
          <v-card-title class="bg-senai-red text-white pa-4">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-school</v-icon>
              <span class="text-h6">Selecionar Curso</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-3 pa-md-4">
            <template v-if="carregandoCursos">
              <div class="text-center py-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2 text-caption">Buscando cursos...</p>
              </div>
            </template>

            <template v-else-if="cursosDisponiveis.length === 0">
              <div class="text-center py-4">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-folder-open</v-icon>
                <p class="text-body-2 text-medium-emphasis">Nenhum curso encontrado no sistema</p>
              </div>
            </template>

            <template v-else>
              <div class="text-center mb-3 d-flex align-center justify-center gap-2">
                <v-chip
                  color="success"
                  size="small"
                  prepend-icon="mdi-check-circle"
                >
                  {{ cursosDisponiveis.length }} cursos encontrados
                </v-chip>
              </div>
              <v-list class="pa-0">
                <v-list-item
                  v-for="curso in cursosDisponiveis"
                  :key="curso.id"
                  :class="{ 'bg-primary': cursoSelecionado?.id === curso.id }"
                  :variant="cursoSelecionado?.id === curso.id ? 'flat' : 'text'"
                  rounded="lg"
                  class="mb-2 curso-item"
                  @click="selecionarCurso(curso)"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="curso.color || 'grey'" size="40">
                      <v-icon color="white" size="24">mdi-book-open-variant</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold text-h6">
                    {{ curso.name }}
                  </v-list-item-title>

                  <template v-slot:append>
                    <v-chip
                      v-if="cursoSelecionado?.id === curso.id"
                      color="success"
                      size="small"
                      variant="flat"
                    >
                      <v-icon start size="small">mdi-check</v-icon>
                      Selecionado
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Seleção de Turma -->
      <v-col cols="12" lg="6">
        <v-card rounded="xl" elevation="2" class="h-100">
          <v-card-title class="bg-primary text-white pa-4">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-account-group</v-icon>
              <span class="text-h6">Selecionar Turma</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-3 pa-md-4">
            <template v-if="!cursoSelecionado">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                Selecione um curso primeiro para ver as turmas disponíveis.
              </v-alert>
            </template>

            <template v-else-if="turmasDisponiveis.length === 0">
              <div class="text-center py-4">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-account-group-outline</v-icon>
                <p class="text-body-2 text-medium-emphasis">
                  Nenhuma turma encontrada para o curso "{{ cursoSelecionado.name }}"
                </p>
              </div>
            </template>

            <template v-else>
              <v-list class="pa-0">
                <v-list-item
                  v-for="turma in turmasDisponiveis"
                  :key="turma.id"
                  :class="{ 'bg-success': turmaSelecionada?.id === turma.id }"
                  :variant="turmaSelecionada?.id === turma.id ? 'flat' : 'text'"
                  rounded="lg"
                  class="mb-2 turma-item"
                  @click="selecionarTurma(turma)"
                >
                  <template v-slot:prepend>
                    <v-chip
                      :color="cursoSelecionado.color || 'primary'"
                      text-color="white"
                      size="small"
                      class="turma-badge"
                      variant="flat"
                    >
                      Turma {{ turma.class_name }}
                    </v-chip>
                  </template>

                  <v-list-item-title class="font-weight-bold text-h6">
                    Turma {{ turma.class_name }}
                  </v-list-item-title>

                  <template v-slot:append>
                    <v-chip
                      v-if="turmaSelecionada?.id === turma.id"
                      color="success"
                      size="small"
                      variant="flat"
                    >
                      <v-icon start size="small">mdi-check</v-icon>
                      Selecionada
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Resumo da Seleção -->
    <v-row v-if="cursoSelecionado && turmaSelecionada">
      <v-col cols="12">
        <v-card rounded="xl" elevation="3" class="bg-gradient-primary">
          <v-card-text class="pa-4 pa-md-6">
            <div class="d-flex align-center flex-column flex-sm-row">
              <v-avatar
                :color="cursoSelecionado.color || 'primary'"
                size="60"
                class="mr-4"
              >
                <v-icon color="white" size="30">mdi-check-circle</v-icon>
              </v-avatar>

              <div class="flex-grow-1 text-center text-sm-left">
                <h3 class="text-h5 font-weight-bold text-white mb-1">
                  Seleção Confirmada
                </h3>
                <p class="text-h6 text-grey-lighten-3 mb-1">
                  {{ cursoSelecionado.name }}
                </p>
                <p class="text-body-2 text-grey-lighten-3 mb-1">
                  Turma {{ turmaSelecionada.class_name }}
                </p>
              </div>

              <div class="d-flex gap-2 align-center">
                <v-btn
                  color="white"
                  variant="flat"
                  size="large"
                  prepend-icon="mdi-arrow-right"
                  @click="confirmarSelecao"
                  rounded="xl"
                >
                  Visualizar Carômetro
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as carometroService from '@/services/carometro.services'

const emit = defineEmits(['curso-turma-selecionados'])

const cursosDisponiveis = ref([])
const turmasDisponiveis = ref([])
const cursoSelecionado = ref(null)
const turmaSelecionada = ref(null)
const carregandoCursos = ref(false)

const carregarCursos = async () => {
  carregandoCursos.value = true
  try {
    cursosDisponiveis.value = await carometroService.getCourses()
  } catch (error) {
    console.error('Erro ao carregar cursos:', error)
  } finally {
    carregandoCursos.value = false
  }
}

const selecionarCurso = async (curso) => {
  cursoSelecionado.value = curso
  turmaSelecionada.value = null
  try {
    turmasDisponiveis.value = await carometroService.getClasses(curso.id)
  } catch (err) {
    console.error('Erro ao carregar turmas:', err)
  }
}

const selecionarTurma = (turma) => {
  turmaSelecionada.value = turma
}

const confirmarSelecao = () => {
  if (cursoSelecionado.value && turmaSelecionada.value) {
    emit('curso-turma-selecionados', {
      curso: { id: cursoSelecionado.value.id, nome: cursoSelecionado.value.name },
      turma: { id: turmaSelecionada.value.id, nome: turmaSelecionada.value.class_name }
    })
  }
}

onMounted(() => {
  carregarCursos()
})

defineExpose({
  recarregarCursos: carregarCursos
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-senai-red)) 100%);
}

.v-list-item {
  transition: all 0.3s ease;
  min-height: 64px;
}

.v-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.turma-badge {
  font-weight: 700;
}
</style>