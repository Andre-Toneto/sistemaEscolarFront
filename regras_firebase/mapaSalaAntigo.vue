<template>
  <v-container fluid>
    <v-card color="senai-red" dark elevation="8" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-light mb-2">Mapa de Sala</h1>
            <p class="text-body-1 font-weight-light opacity-80">Visualize e reserve salas por período</p>
          </v-col>
          <v-col cols="12" md="4" class="text-right text-center-md">
            <v-btn-toggle v-model="modo" color="white" rounded="xl" class="bg-white">
              <v-btn value="semana" variant="text" prepend-icon="mdi-calendar-week">Semana</v-btn>
              <v-btn value="mes" variant="text" prepend-icon="mdi-calendar-month">Mês</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card rounded="xl" elevation="4" class="mb-6">
      <v-card-text>
        <v-row class="mb-3" align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="salaFiltro"
              label="Pesquisar sala"
              placeholder="Digite o nome da sala..."
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6" class="text-right text-center-md d-flex ga-2 justify-end">
            <v-menu>
              <template #activator="{ props }">
                <v-btn color="success" variant="outlined" prepend-icon="mdi-file-export" v-bind="props">
                  Exportar
                </v-btn>
              </template>
              <v-list>
                <v-list-item prepend-icon="mdi-calendar-view-day" @click="exportarCSV">
                  <v-list-item-title>Vista atual ({{ modo === 'semana' ? 'Semana' : 'Mês' }})</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-calendar-range" @click="abrirExportarPeriodo">
                  <v-list-item-title>Período personalizado...</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-calendar-multiple-check" @click="abrirLote">
              Reservar por período
            </v-btn>
          </v-col>
        </v-row>

        <div v-if="modo === 'semana'">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex ga-2">
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-chevron-left" @click="semanaAnterior">Anterior</v-btn>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-calendar-today" @click="irParaSemanaAtual">Hoje</v-btn>
              <v-btn variant="outlined" color="primary" append-icon="mdi-chevron-right" @click="proximaSemana">Próxima</v-btn>
            </div>
            <div class="text-h6 font-weight-medium text-senai-red">
              {{ tituloSemana }}
            </div>
          </div>

          <!-- <div class="mb-2 d-flex align-center ga-2">
            <v-chip size="small" color="primary" variant="outlined"><v-icon start size="14">mdi-weather-sunset-up</v-icon> Manhã</v-chip>
            <v-chip size="small" color="primary" variant="outlined"><v-icon start size="14">mdi-white-balance-sunny</v-icon> Tarde</v-chip>
            <v-chip size="small" color="primary" variant="outlined"><v-icon start size="14">mdi-weather-night</v-icon> Noite</v-chip>
          </div> -->

          <div class="tabela-wrapper">
            <table class="tabela-semana">
              <thead>
                <tr>
                  <th class="col-sala">Sala</th>
                  <th>Periodo</th>
                  <th v-for="d in diasSemana" :key="d.toISOString()">{{ formatDia(d) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sala in salasFiltradas" :key="sala">
                  <td class="col-sala text-h6 content-center">
                    <div class="d-flex align-center ga-1">
                      {{ sala }}
                      <v-btn
                        v-if="isAdmin"
                        icon="mdi-pencil"
                        variant="text"
                        size="x-small"
                        color="grey"
                        @click="abrirDialogRenomear(sala)"
                      />
                    </div>
                  </td>
                  <td class="">
                      <div class="celula-turno">
                        <v-chip height="45" color="primary" variant="outlined" class="pa-4"><v-icon start size="14">mdi-weather-sunset-up</v-icon> Manhã</v-chip>
                        <v-chip height="45" color="primary" variant="outlined" class="pa-4"><v-icon start size="14">mdi-white-balance-sunny</v-icon> Tarde</v-chip>
                        <v-chip height="45" color="primary" variant="outlined" class="pa-4"><v-icon start size="14">mdi-weather-night</v-icon> Noite</v-chip>
                      </div>
                   </td>
                  <td v-for="d in diasSemana" :key="sala + toDateOnly(d)">
                    <div class="celula-periodos">
                      <v-tooltip
                        v-for="p in PERIODOS"
                        :key="p.id"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-card
                            v-bind="props"
                            :color="getReservaColor(toDateOnly(d), sala, p.id)"
                            :variant="getReserva(toDateOnly(d), sala, p.id) ? 'tonal' : 'outlined'"
                            rounded="lg"
                            height="40"
                            width="180"
                            class="mb-1 pa-2 d-flex align-center"
                            @click="abrirReservaDialog({ dia: toDateOnly(d), sala, periodo: p.id })"
                          >
                            <div class="d-flex align-center ga-2 w-100">
                              <div class="d-flex flex-column w-100">
                                <div class="text-body-2 font-weight-medium text-truncate">
                                  <v-icon size="14">{{ getReserva(toDateOnly(d), sala, p.id) ? 'mdi-account' : 'mdi-plus' }}</v-icon>
                                  {{ getReservaTopLine(toDateOnly(d), sala, p.id, p.label) }}
                                </div>
                                <div v-if="getReservaCursoLine(toDateOnly(d), sala, p.id)" class="text-caption text-medium-emphasis text-truncate">
                                  {{ getReservaCursoLine(toDateOnly(d), sala, p.id) }}
                                </div>
                              </div>
                            </div>
                          </v-card>
                        </template>
                        <span>{{ getReservaTitle(toDateOnly(d), sala, p.id, p.label) }}</span>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else>
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex ga-2">
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-chevron-left" @click="mesAnterior">Anterior</v-btn>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-calendar-today" @click="irParaMesAtual">Hoje</v-btn>
              <v-btn variant="outlined" color="primary" append-icon="mdi-chevron-right" @click="proximoMes">Próximo</v-btn>
            </div>
            <div class="text-h6 font-weight-medium text-senai-red">
              {{ tituloMes }}
            </div>
          </div>
          <div class="grid-mes">
            <div class="header">Seg</div>
            <div class="header">Ter</div>
            <div class="header">Qua</div>
            <div class="header">Qui</div>
            <div class="header">Sex</div>
            <div class="header">Sáb</div>
            <div class="header">Dom</div>
            <template v-for="(week, wi) in mesMatrix" :key="wi">
              <div v-for="d in week" :key="d.toISOString()" class="cell-dia" :class="{ 'fora': d.getMonth() !== mesAtual, 'hoje': isHoje(d) }" @click="abrirDia(d)">
                <div class="cell-dia-header">
                  <span class="num">{{ d.getDate() }}</span>
                </div>
                <div class="mini-indicadores">
                  <div v-for="s in SALAS.slice(0, 3)" :key="s" class="dot" :class="{ 'ok': temAlgumaReserva(toDateOnly(d), s) }"></div>
                </div>
                <div class="periodo-resumo">
                  <v-tooltip location="bottom">
                    <template #activator="{ props }">
                      <div v-bind="props" class="d-flex ga-1 flex-wrap">
                        <v-chip
                          v-if="resumoPorPeriodo(toDateOnly(d)).manha"
                          size="x-small"
                          color="primary"
                          variant="outlined"
                        >
                          <v-icon start size="12">mdi-weather-sunset-up</v-icon>
                          {{ resumoPorPeriodo(toDateOnly(d)).manha }}
                        </v-chip>
                        <v-chip
                          v-if="resumoPorPeriodo(toDateOnly(d)).tarde"
                          size="x-small"
                          color="primary"
                          variant="outlined"
                        >
                          <v-icon start size="12">mdi-white-balance-sunny</v-icon>
                          {{ resumoPorPeriodo(toDateOnly(d)).tarde }}
                        </v-chip>
                        <v-chip
                          v-if="resumoPorPeriodo(toDateOnly(d)).noite"
                          size="x-small"
                          color="primary"
                          variant="outlined"
                        >
                          <v-icon start size="12">mdi-weather-night</v-icon>
                          {{ resumoPorPeriodo(toDateOnly(d)).noite }}
                        </v-chip>
                        <v-chip
                          v-if="resumoPorPeriodo(toDateOnly(d)).salas"
                          size="x-small"
                          color="senai-red"
                          variant="outlined"
                        >
                          <v-icon start size="12">mdi-door</v-icon>
                          {{ resumoPorPeriodo(toDateOnly(d)).salas }}/{{ SALAS.length }}
                        </v-chip>
                      </div>
                    </template>
                    <span>{{ resumoTooltip(toDateOnly(d)) }}</span>
                  </v-tooltip>
                </div>
              </div>
            </template>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogReserva" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="pa-4 pb-2">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-calendar-plus</v-icon>
            {{ isEdicao ? 'Editar Reserva' : 'Nova Reserva' }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ reservaForm.dia }} • {{ reservaForm.sala }}</div>
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <v-radio-group v-model="reservaForm.periodo" :disabled="loading">
            <v-radio v-for="p in PERIODOS" :key="p.id" :label="p.label" :value="p.id" />
          </v-radio-group>

          <v-text-field v-model="reservaForm.curso" label="Curso" variant="outlined" density="comfortable" class="mb-3" />

          <v-autocomplete
            v-if="isAdmin"
            v-model="reservaForm.usuario"
            :items="usuarios"
            item-title="nome"
            item-value="registro"
            label="Usuário (opcional)"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            clearable
            return-object
          />

          <v-alert v-if="erroReserva" type="error" variant="tonal" class="mb-3">{{ erroReserva }}</v-alert>
          <v-alert v-if="avisoPermissao" type="warning" variant="tonal" class="mb-3">{{ avisoPermissao }}</v-alert>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-btn variant="outlined" @click="dialogReserva = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn v-if="isEdicao" color="error" variant="outlined" :disabled="!podeEditar" @click="removerReserva" :loading="loading">Remover</v-btn>
          <v-btn color="primary" @click="salvarReserva" :loading="loading">{{ isEdicao ? 'Atualizar' : 'Reservar' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDia" max-width="1200">
      <v-card rounded="xl">
        <v-card-title class="pa-4 pb-2 d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
          Reservas do dia {{ diaSelecionadoLabel }}
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <v-row>
            <v-col v-for="sala in SALAS" :key="sala" cols="12" md="6">
              <v-card rounded="lg" variant="tonal" class="mb-2">
                <v-card-title class="text-h6">{{ sala }}</v-card-title>
                <v-card-text class="pt-0">
                  <div class="d-flex ga-2">
                    <v-tooltip
                      v-for="p in PERIODOS"
                      :key="p.id"
                      location="top"
                    >
                      <template #activator="{ props }">
                        <!-- NÃO CONSIGO MEXER AQUI -->
                        <v-card
                          v-bind="props"
                          :color="getReservaColor(diaSelecionadoISO, sala, p.id)"
                          :variant="getReserva(diaSelecionadoISO, sala, p.id) ? 'tonal' : 'outlined'"
                          rounded="lg"
                          height="40"
                          width="170"
                          class="d-flex align-center"
                          @click="abrirReservaDialog({ dia: diaSelecionadoISO, sala, periodo: p.id })"
                        >
                          <div class="d-flex align-center ga-2 w-100">
                           
                            <div class="d-flex flex-column pa-2 w-100">
                              <div class="font-weight-medium text-truncate">
                                 <v-icon size="14">{{ getReserva(toDateOnly(d), sala, p.id) ? 'mdi-account' : 'mdi-plus' }}</v-icon>
                                {{ getReservaCalendario(diaSelecionadoISO, sala, p.id, p.label) }}
                              </div>
                              <div v-if="getReservaCursoLine(diaSelecionadoISO, sala, p.id)" class="text-caption text-medium-emphasis text-truncate">
                                {{ getReservaCursoLine(diaSelecionadoISO, sala, p.id) }}
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </template>
                      <span>{{ getReservaTitle(diaSelecionadoISO, sala, p.id, p.label) }}</span>
                    </v-tooltip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="outlined" @click="dialogDia = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

<v-dialog v-model="dialogLote" max-width="640">
  <v-card rounded="xl">
    <v-card-title class="pa-4 pb-2 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-calendar-multiple-check</v-icon>
      Reservar em lote
    </v-card-title>
    <v-card-text class="pa-4 pt-0">
      <v-row>
        <v-col cols="12">
          <div class="text-body-2 text-medium-emphasis mb-1">Ação</div>
          <v-btn-toggle v-model="loteForm.acao" rounded="xl" mandatory color="primary" class="mb-2">
            <v-btn value="reservar" variant="outlined" prepend-icon="mdi-plus">Reservar</v-btn>
            <v-btn value="remover" variant="outlined" prepend-icon="mdi-delete" color="error">Remover</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12" md="6" v-if="loteForm.acao === 'reservar'">
          <v-autocomplete :items="SALAS" v-model="loteForm.sala" label="Sala" variant="outlined" density="comfortable" clearable />
        </v-col>
        <v-col cols="12" md="6" v-else>
          <v-autocomplete :items="SALAS" v-model="loteForm.sala" label="Sala" variant="outlined" density="comfortable" clearable />
        </v-col>
        <v-col cols="12" md="6" v-if="loteForm.acao === 'reservar'">
          <v-text-field v-model="loteForm.curso" label="Curso" variant="outlined" density="comfortable" clearable />
        </v-col>
        <v-col v-if="isAdmin && loteForm.acao === 'reservar'" cols="12" md="6">
          <v-autocomplete
            v-model="loteForm.usuario"
            :items="usuarios"
            item-title="nome"
            item-value="registro"
            label="Usuário (opcional)"
            variant="outlined"
            density="comfortable"
            clearable
            return-object
          />
        </v-col>
        <v-col cols="12">
          <div class="text-body-2 text-medium-emphasis mb-1">Períodos</div>
          <div class="d-flex ga-2 flex-wrap">
            <v-checkbox
              v-for="p in PERIODOS"
              :key="p.id"
              v-model="loteForm.periodos"
              :label="p.label"
              :value="p.id"
              density="compact"
              hide-details
            />
          </div>
        </v-col>
        <v-col cols="12">
          <v-btn-toggle v-model="loteForm.modo" rounded="xl" class="mb-2">
            <v-btn value="dias" variant="outlined" prepend-icon="mdi-calendar">Dias</v-btn>
            <v-btn value="semanas" variant="outlined" prepend-icon="mdi-calendar-week">Semanas</v-btn>
            <v-btn value="meses" variant="outlined" prepend-icon="mdi-calendar-month">Meses</v-btn>
          </v-btn-toggle>
        </v-col>
        <template v-if="loteForm.modo === 'dias'">
          <v-col cols="12">
            <div class="text-body-2 text-medium-emphasis mb-1">Dias desta semana</div>
            <div class="d-flex ga-3 flex-wrap">
              <v-checkbox
                v-for="d in diasSemana"
                :key="toDateOnly(d)"
                v-model="loteForm.dias"
                :label="formatDia(d)"
                :value="toDateOnly(d)"
                density="compact"
                hide-details
              />
            </div>
          </v-col>
        </template>
        <template v-else-if="loteForm.modo === 'semanas'">
          <v-col cols="12" md="4">
            <v-text-field v-model.number="loteForm.qtdSemanas" type="number" min="1" max="52" label="Quantidade de semanas" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="8">
            <div class="text-body-2 text-medium-emphasis mb-1">Dias da semana</div>
            <div class="d-flex ga-3 flex-wrap">
              <v-checkbox
                v-for="opt in diasSemanaIdx"
                :key="opt.idx"
                v-model="loteForm.diasSemanaSelecionados"
                :label="opt.label"
                :value="opt.idx"
                density="compact"
                hide-details
              />
            </div>
          </v-col>
        </template>
        <template v-else>
          <v-col cols="12" md="4">
            <v-text-field v-model.number="loteForm.qtdMeses" type="number" min="1" max="12" label="Quantidade de meses" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="8">
            <div class="text-body-2 text-medium-emphasis mb-1">Dias da semana</div>
            <div class="d-flex ga-3 flex-wrap">
              <v-checkbox
                v-for="opt in diasSemanaIdx"
                :key="opt.idx"
                v-model="loteForm.diasSemanaSelecionados"
                :label="opt.label"
                :value="opt.idx"
                density="compact"
                hide-details
              />
            </div>
          </v-col>
        </template>
      </v-row>
      <v-alert v-if="erroLote" type="error" variant="tonal" class="mt-2">{{ erroLote }}</v-alert>
    </v-card-text>
    <v-card-actions class="pa-4 pt-0">
      <v-btn variant="outlined" @click="dialogLote = false">Cancelar</v-btn>
      <v-spacer />
      <v-btn color="primary" :loading="loteLoading" @click="salvarLote">Aplicar</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="dialogExportar" max-width="480">
  <v-card rounded="xl">
    <v-card-title class="pa-4 pb-2 d-flex align-center">
      <v-icon color="success" class="mr-2">mdi-file-export</v-icon>
      Exportar Reservas
    </v-card-title>
    <v-card-text class="pa-4 pt-0">
      <p class="text-body-2 text-medium-emphasis mb-4">Selecione o período para exportar as reservas em formato CSV.</p>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="exportarForm.de"
            type="date"
            label="De"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="exportarForm.ate"
            type="date"
            label="Até"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
      <v-alert v-if="erroExportar" type="error" variant="tonal" class="mt-2">{{ erroExportar }}</v-alert>
    </v-card-text>
    <v-card-actions class="pa-4 pt-0">
      <v-btn variant="outlined" @click="dialogExportar = false">Cancelar</v-btn>
      <v-spacer />
      <v-btn color="success" :loading="exportLoading" @click="executarExportarPeriodo">Exportar CSV</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="dialogRenomear" max-width="400">
  <v-card rounded="xl">
    <v-card-title class="pa-4 pb-2 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
      Renomear Sala
    </v-card-title>
    <v-card-text class="pa-4 pt-0">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Alterar o nome da sala <strong>{{ salaParaRenomear }}</strong>.<br>
        Todas as reservas existentes serão migradas para o novo nome.
      </p>
      <v-text-field
        v-model="novoNomeSala"
        label="Novo nome da sala"
        variant="outlined"
        density="comfortable"
        autofocus
        @keyup.enter="executarRenomear"
      />
      <v-alert v-if="erroRenomear" type="error" variant="tonal" class="mt-2">{{ erroRenomear }}</v-alert>
    </v-card-text>
    <v-card-actions class="pa-4 pt-0">
      <v-btn variant="outlined" @click="dialogRenomear = false">Cancelar</v-btn>
      <v-spacer />
      <v-btn color="primary" :loading="renomearLoading" @click="executarRenomear">Salvar</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMapaSala } from '@/composables/useMapaSala.js'

const { SALAS, PERIODOS, toDateOnly, weekDaysMonSat, monthMatrix, fetchRange, fetchWeek, fetchMonth, getReserva, reservar, atualizar, remover, removerEmLote, fetchSalas, initializeSalas, renomearSala, canEdit, loading, cache, listUsuarios } = useMapaSala()

const salaFiltro = ref('')
const salasFiltradas = computed(() => {
  const termo = salaFiltro.value.trim().toLowerCase()
  if (!termo) return SALAS.value
  return SALAS.value.filter(s => s.toLowerCase().includes(termo))
})

// Sessão do usuário
const currentUser = computed(() => {
  try { return JSON.parse(sessionStorage.getItem('carometro_user') || '{}') } catch { return {} }
})
const isAdmin = computed(() => (currentUser.value?.tipo_usuario || '').toString().toLowerCase() === 'admin')

// Lista de usuários para seleção (somente admins)
const usuarios = ref([])
const carregarUsuarios = async () => {
  try { usuarios.value = await listUsuarios() } catch { usuarios.value = [] }
}

// Estado geral
const modo = ref('semana')
const baseDate = ref(new Date())
const diasSemana = ref([])
const mesAtual = ref(new Date().getMonth())
const anoAtual = ref(new Date().getFullYear())
const mesMatrix = ref([])

const tituloSemana = computed(() => {
  if (!diasSemana.value.length) return ''
  const a = diasSemana.value[0]
  const b = diasSemana.value[diasSemana.value.length - 1]
  return `${a.toLocaleDateString('pt-BR')} — ${b.toLocaleDateString('pt-BR')}`
})
const tituloMes = computed(() => new Date(anoAtual.value, mesAtual.value, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
const formatDia = (d) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
const isHoje = (d) => toDateOnly(d) === toDateOnly(new Date())

onMounted(async () => {
  const rooms = await fetchSalas()
  SALAS.value = rooms
  await carregarSemana()
  loteForm.value.dias = diasSemana.value.map(d => toDateOnly(d))
  if (isAdmin.value) await carregarUsuarios()
})

const carregarSemana = async () => {
  const { days } = await fetchWeek(baseDate.value)
  diasSemana.value = days
}

const carregarMes = async () => {
  const { matrix } = await fetchMonth(anoAtual.value, mesAtual.value)
  mesMatrix.value = matrix
}

const semanaAnterior = async () => { const d = new Date(baseDate.value); d.setDate(d.getDate() - 7); baseDate.value = d; await carregarSemana() }
const proximaSemana = async () => { const d = new Date(baseDate.value); d.setDate(d.getDate() + 7); baseDate.value = d; await carregarSemana() }
const irParaSemanaAtual = async () => { baseDate.value = new Date(); await carregarSemana() }

const mesAnterior = async () => { if (mesAtual.value === 0) { mesAtual.value = 11; anoAtual.value -= 1 } else { mesAtual.value -= 1 } await carregarMes() }
const proximoMes = async () => { if (mesAtual.value === 11) { mesAtual.value = 0; anoAtual.value += 1 } else { mesAtual.value += 1 } await carregarMes() }
const irParaMesAtual = async () => { const d = new Date(); mesAtual.value = d.getMonth(); anoAtual.value = d.getFullYear(); await carregarMes() }

watch(modo, async (nv) => { if (nv === 'mes') await carregarMes(); else await carregarSemana() })


const getReservaTitle = (diaISO, sala, periodo, label) => {
  const r = getReserva(diaISO, sala, periodo)
  if (!r) return `Disponível — ${label}`
  const partes = [label, r.nome]
  if (r.curso) partes.push(r.curso)
  return partes.join(' — ')
}
const getReservaTopLine = (diaISO, sala, periodo, label) => {
  const r = getReserva(diaISO, sala, periodo)
  if (!r) return `Disponível`
  return `${r.nome}`
}

const getReservaCalendario = (diaISO, sala, periodo, label) => {
  const r = getReserva(diaISO, sala, periodo)
  if (!r) return `Disponível (${label})`
  return `${label} - ${r.nome}`
}

const getReservaCursoLine = (diaISO, sala, periodo) => {
  const r = getReserva(diaISO, sala, periodo)
  if (!r) return ''
  const curso = r.curso ? String(r.curso).trim() : ''
  return `${curso}`.trim()
}
const getReservaColor = (diaISO, sala, periodo) => {
  const r = getReserva(diaISO, sala, periodo)
  return r ? r.cor || 'success' : 'primary'
}

// Resumo por período no mês
const resumoPorPeriodo = (diaISO) => {
  try {
    let manha = 0, tarde = 0, noite = 0, salas = 0
    for (const s of SALAS.value) {
      const rM = !!getReserva(diaISO, s, 'manha')
      const rT = !!getReserva(diaISO, s, 'tarde')
      const rN = !!getReserva(diaISO, s, 'noite')
      if (rM) manha++
      if (rT) tarde++
      if (rN) noite++
      if (rM || rT || rN) salas++
    }
    return { manha, tarde, noite, total: manha + tarde + noite, salas }
  } catch { return { manha: 0, tarde: 0, noite: 0, total: 0, salas: 0 } }
}
const resumoTooltip = (diaISO) => {
  const r = resumoPorPeriodo(diaISO)
  return `Manhã: ${r.manha} • Tarde: ${r.tarde} • Noite: ${r.noite} • Salas: ${r.salas}/${SALAS.value.length}`
}

// Dialog de reserva
const dialogReserva = ref(false)
const isEdicao = ref(false)
const reservaForm = ref({ dia: '', sala: '', periodo: '', curso: '', usuario: null })
const erroReserva = ref('')
const avisoPermissao = ref('')

const abrirReservaDialog = ({ dia, sala, periodo }) => {
  erroReserva.value = ''
  avisoPermissao.value = ''
  const atual = getReserva(dia, sala, periodo)
  const usuarioAtual = atual ? { registro: atual.registro, nome: atual.nome, cor: atual.cor } : null
  reservaForm.value = { dia, sala, periodo, curso: (atual && atual.curso) || '', usuario: usuarioAtual }
  isEdicao.value = !!atual
  if (isEdicao.value && !canEdit(atual, currentUser.value)) {
    avisoPermissao.value = 'Apenas o autor da reserva ou um administrador pode editar/remover.'
  }
  dialogReserva.value = true
}

const podeEditar = computed(() => {
  if (!isEdicao.value) return false
  const { dia, sala, periodo } = reservaForm.value
  const atual = getReserva(dia, sala, periodo)
  return !!atual && canEdit(atual, currentUser.value)
})

const salvarReserva = async () => {
  try {
    erroReserva.value = ''
    const { dia, sala, periodo, curso, usuario } = reservaForm.value
    if (!dia || !sala || !periodo) throw new Error('Preencha todos os campos')
    if (!String(curso || '').trim()) throw new Error('Informe o curso')
    const atual = getReserva(dia, sala, periodo)
    if (atual) {
      if (!canEdit(atual, currentUser.value)) throw new Error('Sem permissão para editar')
      const patch = { curso: String(curso).trim() }
      if (isAdmin.value && usuario && usuario.registro) {
        patch.registro = usuario.registro
        patch.nome = usuario.nome
        patch.cor = usuario.cor
      }
      await atualizar(atual.id, patch, currentUser.value)
    } else {
      const alvo = (isAdmin.value && usuario && usuario.registro) ? { registro: usuario.registro, nome_completo: usuario.nome } : currentUser.value
      await reservar(dia, sala, periodo, alvo, String(curso).trim())
    }
    dialogReserva.value = false
  } catch (e) {
    erroReserva.value = e?.message || 'Falha ao salvar'
  }
}

const removerReserva = async () => {
  try {
    const { dia, sala, periodo } = reservaForm.value
    const atual = getReserva(dia, sala, periodo)
    if (!atual) { dialogReserva.value = false; return }
    if (!canEdit(atual, currentUser.value)) { erroReserva.value = 'Sem permissão para remover'; return }
    await remover(atual.id, currentUser.value)
    dialogReserva.value = false
  } catch (e) {
    erroReserva.value = e?.message || 'Falha ao remover'
  }
}

// Dialog por dia (mês)
const dialogDia = ref(false)
const diaSelecionadoISO = ref('')
const diaSelecionadoLabel = computed(() => {
  try { return fromISO(diaSelecionadoISO.value).toLocaleDateString('pt-BR') } catch { return diaSelecionadoISO.value }
})

// Reserva em lote
const dialogLote = ref(false)
const loteForm = ref({ acao: 'reservar', sala: '', curso: '', periodos: [], dias: [], modo: 'dias', qtdSemanas: 4, qtdMeses: 1, diasSemanaSelecionados: [1,2,3,4,5,6], usuario: null })
const loteLoading = ref(false)
const erroLote = ref('')
const abrirLote = () => {
  erroLote.value = ''
  loteForm.value = {
    acao: 'reservar',
    sala: '',
    curso: '',
    periodos: PERIODOS.map(p => p.id),
    dias: diasSemana.value.map(d => toDateOnly(d)),
    modo: 'dias',
    qtdSemanas: 4,
    qtdMeses: 1,
    diasSemanaSelecionados: [1,2,3,4,5,6],
    usuario: null
  }
  dialogLote.value = true
}
const salvarLote = async () => {
  try {
    erroLote.value = ''
    if (!loteForm.value.sala) throw new Error('Selecione a sala')
    if (!loteForm.value.periodos.length) throw new Error('Selecione ao menos um período')

    if (loteForm.value.acao === 'reservar') {
      if (!String(loteForm.value.curso || '').trim()) throw new Error('Informe o curso')
    }

    let diasSelecionadosISO = []
    if (loteForm.value.modo === 'dias') {
      if (!loteForm.value.dias.length) throw new Error('Selecione ao menos um dia')
      diasSelecionadosISO = [...loteForm.value.dias]
    } else if (loteForm.value.modo === 'semanas') {
      const base = new Date(baseDate.value)
      for (let i = 0; i < Math.max(1, Number(loteForm.value.qtdSemanas || 1)); i++) {
        const ref = new Date(base)
        ref.setDate(ref.getDate() + i * 7)
        const days = weekDaysMonSat(ref)
        for (const d of days) {
          const dow = d.getDay() === 0 ? 7 : d.getDay()
          if (loteForm.value.diasSemanaSelecionados.includes(dow)) diasSelecionadosISO.push(toDateOnly(d))
        }
      }
    } else {
      const start = new Date(baseDate.value)
      for (let m = 0; m < Math.max(1, Number(loteForm.value.qtdMeses || 1)); m++) {
        const ref = new Date(start)
        ref.setMonth(ref.getMonth() + m)
        const y = ref.getFullYear(); const mm = ref.getMonth()
        const matrix = monthMatrix(y, mm)
        for (const week of matrix) {
          for (const d of week) {
            if (d.getMonth() !== mm) continue
            const dow = d.getDay() === 0 ? 7 : d.getDay()
            if (loteForm.value.diasSemanaSelecionados.includes(dow)) diasSelecionadosISO.push(toDateOnly(d))
          }
        }
      }
    }
    diasSelecionadosISO = Array.from(new Set(diasSelecionadosISO))
    loteLoading.value = true

    if (loteForm.value.acao === 'reservar') {
      for (const dia of diasSelecionadosISO) {
        for (const p of loteForm.value.periodos) {
          const atual = getReserva(dia, loteForm.value.sala, p)
          if (atual) continue
          try {
            const alvo = (isAdmin.value && loteForm.value.usuario && loteForm.value.usuario.registro) ? { registro: loteForm.value.usuario.registro, nome_completo: loteForm.value.usuario.nome } : currentUser.value
            await reservar(dia, loteForm.value.sala, p, alvo, String(loteForm.value.curso).trim())
          } catch (_) {}
        }
      }
    } else {
      // Remoção em lote
      await removerEmLote(diasSelecionadosISO, loteForm.value.sala, loteForm.value.periodos, currentUser.value)
    }

    dialogLote.value = false
  } catch (e) {
    erroLote.value = e?.message || 'Falha ao aplicar'
  } finally {
    loteLoading.value = false
  }
}

// Renomear Sala
const dialogRenomear = ref(false)
const renomearLoading = ref(false)
const erroRenomear = ref('')
const salaParaRenomear = ref('')
const novoNomeSala = ref('')

const abrirDialogRenomear = (sala) => {
  salaParaRenomear.value = sala
  novoNomeSala.value = sala
  erroRenomear.value = ''
  dialogRenomear.value = true
}

const executarRenomear = async () => {
  try {
    if (!novoNomeSala.value.trim() || novoNomeSala.value.trim() === salaParaRenomear.value) {
      dialogRenomear.value = false
      return
    }
    renomearLoading.value = true
    await renomearSala(salaParaRenomear.value, novoNomeSala.value, currentUser.value)

    // Atualizar lista local
    const rooms = await fetchSalas()
    SALAS.value = rooms

    // Limpar cache para forçar recarregamento se necessário, ou apenas recarregar vista
    if (modo.value === 'mes') await carregarMes(); else await carregarSemana()

    dialogRenomear.value = false
  } catch (e) {
    erroRenomear.value = e?.message || 'Erro ao renomear'
  } finally {
    renomearLoading.value = false
  }
}

const abrirDia = async (d) => {
  diaSelecionadoISO.value = toDateOnly(d)
  dialogDia.value = true
  await fetchWeek(d) // garante cache do dia
}

const temAlgumaReserva = (diaISO, sala) => {
  return !!(getReserva(diaISO, sala, 'manha') || getReserva(diaISO, sala, 'tarde') || getReserva(diaISO, sala, 'noite'))
}

const fromISO = (s) => { const [y,m,dd] = String(s).split('-').map(Number); return new Date(y, m - 1, dd) }
const diasSemanaIdx = [
  { idx: 1, label: 'Seg' },
  { idx: 2, label: 'Ter' },
  { idx: 3, label: 'Qua' },
  { idx: 4, label: 'Qui' },
  { idx: 5, label: 'Sex' },
  { idx: 6, label: 'Sáb' }
]

// Exportar personalizado
const dialogExportar = ref(false)
const exportLoading = ref(false)
const erroExportar = ref('')
const exportarForm = ref({ de: '', ate: '' })

const abrirExportarPeriodo = () => {
  erroExportar.value = ''
  const hoje = new Date()
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  exportarForm.value = {
    de: toDateOnly(primeiroDia),
    ate: toDateOnly(ultimoDia)
  }
  dialogExportar.value = true
}

const executarExportarPeriodo = async () => {
  try {
    erroExportar.value = ''
    const { de, ate } = exportarForm.value
    if (!de || !ate) throw new Error('Selecione as datas de início e fim')

    const dIni = fromISO(de)
    const dFim = fromISO(ate)
    if (dIni > dFim) throw new Error('A data de início deve ser anterior à data de fim')

    exportLoading.value = true

    // Buscar dados do range
    await fetchRange(dIni, dFim)

    // Gerar lista de dias
    const days = []
    let cursor = new Date(dIni)
    // Limite de segurança para não travar o navegador
    let safety = 0
    while (cursor <= dFim && safety < 1000) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
      safety++
    }

    performExport(days, `mapa_sala_${de}_a_${ate}.csv`)
    dialogExportar.value = false
  } catch (e) {
    erroExportar.value = e?.message || 'Falha ao exportar'
  } finally {
    exportLoading.value = false
  }
}

const exportarCSV = () => {
  // Determinar quais dias exportar com base no modo atual
  let daysToExport = []
  if (modo.value === 'semana') {
    daysToExport = [...diasSemana.value]
  } else {
    // No modo mês, pegar todos os dias da matriz que pertencem ao mês atual
    daysToExport = mesMatrix.value.flat().filter(d => d.getMonth() === mesAtual.value)
  }

  performExport(daysToExport, `mapa_sala_${modo.value}_${diaISO_safe(new Date())}.csv`)
}

const performExport = (days, filename) => {
  const data = []
  const headers = ['Data', 'Sala', 'Período', 'ID_Período', 'Responsável', 'Registro', 'Curso', 'Status']

  // Ordenar dias
  const sortedDays = [...days].sort((a, b) => a - b)

  for (const d of sortedDays) {
    const diaISO = toDateOnly(d)
    if (!diaISO) continue

    for (const sala of SALAS.value) {
      for (const p of PERIODOS) {
        const r = getReserva(diaISO, sala, p.id)
        data.push([
          diaISO,
          sala,
          p.label,
          p.id,
          r ? r.nome : '',
          r ? r.registro : '',
          r ? r.curso : '',
          r ? 'Ocupada' : 'Livre'
        ])
      }
    }
  }

  // Gerar string CSV (UTF-8 com BOM para Excel reconhecer acentos)
  const BOM = '\uFEFF'
  let csv = headers.join(';') + '\n' // Usar ponto e vírgula para compatibilidade com Excel BR
  data.forEach(row => {
    csv += row.map(v => {
      const s = String(v || '').replace(/"/g, '""')
      return `"${s}"`
    }).join(';') + '\n'
  })

  // Download
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const diaISO_safe = (d) => {
  try {
    return d.toISOString().split('T')[0]
  } catch {
    return 'export'
  }
}
</script>

<style scoped>
.tabela-wrapper { overflow-x: auto; overflow-y: auto; max-height: 65vh; }
.tabela-semana { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
.tabela-semana thead th { position: sticky; top: 0; background: rgb(var(--v-theme-surface)); z-index: 2; }
.tabela-semana th, .tabela-semana td { padding: 8px; text-align: left; vertical-align: top; }
.col-sala { min-width: 120px; font-weight: 600; vertical-align: middle;}
.celula-periodos { display: flex; flex-direction: column; gap: 6px; min-width: 100%; }
.celula-turno {display: flex; flex-direction: column; gap: 16px; min-width: 75px; }
.grid-mes { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.grid-mes .header { text-align: center; font-weight: 600; color: rgb(var(--v-theme-senai-navy)); }
.cell-dia { border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 8px; min-height: 80px; cursor: pointer; }
.cell-dia:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.cell-dia.fora { opacity: 0.5; }
.cell-dia.hoje { border-color: rgb(var(--v-theme-primary)); }
.cell-dia-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.cell-dia-header .num { font-weight: 700; }
.mini-indicadores { display: flex; gap: 4px; }
.mini-indicadores .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.08); }
.mini-indicadores .dot.ok { background: rgb(var(--v-theme-senai-red)); }
.w-100 { width: 100%; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-center-md { text-align: center; }
@media (max-width: 960px) { .col-sala { min-width: 120px } .celula-periodos { min-width: 140px } }
.chip-reserva { width: 100%; justify-content: flex-start; }
.chip-reserva:deep(.v-chip__content) { width: 100%; align-items: flex-start; }
.chip-reserva-content { display: flex; align-items: flex-start; gap: 6px; width: 100%; min-width: 0; }
.chip-reserva-details { display: flex; flex-direction: column; min-width: 0; width: 100%; }
.chip-reserva-top { white-space: normal; word-break: break-word; line-height: 1.2; }
.chip-reserva-course { white-space: normal; word-break: break-word; font-size: 12px; opacity: 0.85; }
@media (max-width: 960px) { .chip-reserva-top { font-size: 12px; } .chip-reserva-course { font-size: 11px; } }
.periodo-resumo { margin-top: 6px; }
.periodo-resumo :deep(.v-chip) { height: 22px; border-radius: 12px; }

</style>
