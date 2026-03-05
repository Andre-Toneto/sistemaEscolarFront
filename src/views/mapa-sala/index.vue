<template>
  <v-container fluid>
    <!-- Header -->
    <v-card color="senai-red" theme="dark" elevation="8" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-light mb-2">Mapa de Sala</h1>
            <p class="text-body-1 font-weight-light opacity-80">Visualize e reserve salas por período</p>
          </v-col>
          <v-col cols="12" md="4" class="text-right text-center-md">
            <v-btn-toggle v-model="modo" color="white" rounded="xl" class="bg-white" mandatory>
              <v-btn value="semana" variant="text" prepend-icon="mdi-calendar-week">Semana</v-btn>
              <v-btn value="mes" variant="text" prepend-icon="mdi-calendar-month">Mês</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Toolbar & Actions -->
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
          <v-col cols="12" md="6" class="text-right d-flex ga-2 justify-end">
            <v-btn v-if="!isSecretariaAdmin" color="info" variant="outlined" prepend-icon="mdi-calendar-range" @click="abrirBulkGeral">
              RESERVAr
            </v-btn>
            <v-btn color="success" variant="outlined" prepend-icon="mdi-file-export" @click="exportarCSV">
              Exportar
            </v-btn>
            <v-btn v-if="isAdmin && !isSecretariaAdmin" color="primary" variant="elevated" prepend-icon="mdi-plus" @click="abrirDialogClassroom()">
              Nova Sala
            </v-btn>
          </v-col>
        </v-row>

        <!-- View: Semana -->
        <div v-if="modo === 'semana'">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex ga-2 align-center">
              <v-btn variant="outlined" color="primary" size="small" icon="mdi-chevron-left" @click="semanaAnterior" />
              <v-btn variant="outlined" color="primary" @click="irParaSemanaAtual">Hoje</v-btn>
              <v-btn variant="outlined" color="primary" size="small" icon="mdi-chevron-right" @click="proximaSemana" />
            </div>
            <div class="text-h6 font-weight-medium text-senai-red">
              {{ tituloSemana }}
            </div>
          </div>

          <div class="tabela-wrapper">
            <table class="tabela-semana">
              <thead>
                <tr>
                  <th class="col-sala">Sala</th>
                  <th class="col-periodo-header">Período</th>
                  <th v-for="d in diasSemana" :key="d.toISOString()">{{ formatDia(d) }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="sala in salasFiltradas" :key="sala.id">
                  <tr v-for="(p, pIdx) in store.PERIODOS" :key="sala.id + p.id" :class="{ 'sala-divider': pIdx === store.PERIODOS.length - 1 }">
                    <!-- Column Sala: only shown in the first period of each room (rowspan) -->
                    <td v-if="pIdx === 0" class="col-sala" :rowspan="store.PERIODOS.length">
                      <div class="d-flex align-center justify-space-between">
                        <div class="font-weight-bold text-h6">{{ sala.name }}</div>
                        <v-btn v-if="isAdmin && !isSecretariaAdmin" icon="mdi-pencil" variant="text" size="x-small" @click="abrirDialogClassroom(sala)" />
                      </div>
                      <div class="text-caption text-grey">{{ sala.type || 'Geral' }} - Cap: {{ sala.capacity || 'N/A' }}</div>
                    </td>
                    <!-- Column Period -->
                    <td class="col-periodo">
                      <div class="d-flex align-center ga-1 text-caption font-weight-bold text-uppercase text-grey-darken-1">
                        <v-icon size="14">{{ p.id === 'MANHA' ? 'mdi-weather-sunset-up' : p.id === 'TARDE' ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
                        {{ p.label }}
                      </div>
                    </td>
                    <!-- Days columns -->
                    <td v-for="d in diasSemana" :key="sala.id + p.id + toDateOnly(d)" class="celula-dia">
                      <v-card
                        :color="getReservaColor(toDateOnly(d), sala.id, p.id)"
                        :variant="getReserva(toDateOnly(d), sala.id, p.id) ? 'tonal' : 'outlined'"
                        rounded="lg"
                        min-height="50"
                        max-widht="100px"
                        :class="['pa-2', !isSecretariaAdmin ? 'cursor-pointer' : '', 'reservation-card', 'd-flex', 'flex-column', 'justify-center']"
                        @click="!isSecretariaAdmin ? abrirReservaDialog(toDateOnly(d), sala, p.id) : null"
                        elevation="0"
                      >
                        <template v-if="getReserva(toDateOnly(d), sala.id, p.id)">
                          <div class="font-weight-bold text-truncate line-height-1" style="font-size: 11px;">
                            {{ getReserva(toDateOnly(d), sala.id, p.id).user_name }}
                          </div>
                          <div class="text-caption text-truncate opacity-80 mt-1 line-height-1" style="font-size: 10px;">
                            {{ getReserva(toDateOnly(d), sala.id, p.id).course_type }} - 
                            {{ getReserva(toDateOnly(d), sala.id, p.id).course_name }}
                          </div>
                          <div class="text-caption text-truncate opacity-80 line-height-1" style="font-size: 10px;">
                          </div>
                        </template>
                        <div v-else class="text-caption text-green text-center font-italic" style="font-size: 10px;">
                          Livre
                        </div>
                      </v-card>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- View: Mes -->
        <div v-else>
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex ga-2">
              <v-btn variant="outlined" color="primary" icon="mdi-chevron-left" @click="mesAnterior" />
              <v-btn variant="outlined" color="primary" @click="irParaMesAtual">Hoje</v-btn>
              <v-btn variant="outlined" color="primary" icon="mdi-chevron-right" @click="proximoMes" />
            </div>
            <div class="text-h6 font-weight-medium text-senai-red">
              {{ tituloMes }}
            </div>
          </div>
          <div class="grid-mes">
            <div v-for="h in ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']" :key="h" class="header">{{ h }}</div>
            <template v-for="(week, wi) in mesMatrix" :key="wi">
              <div
                v-for="d in week"
                :key="d.toISOString()"
                class="cell-dia"
                :class="{ 'fora': d.getMonth() !== mesAtual, 'hoje': isHoje(d) }"
                @click="abrirDia(d)"
              >
                <div class="cell-dia-header">
                  <span class="num">{{ d.getDate() }}</span>
                </div>
                <div class="resumo-chips">
                  <v-chip size="x-small" variant="tonal" color="primary" v-if="getResumoDia(d).total > 0">
                    {{ getResumoDia(d).total }} Reservas
                  </v-chip>
                </div>
              </div>
            </template>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Reservation Dialog -->
    <v-dialog v-model="dialogReserva" max-width="600">
      <v-card rounded="xl">
        <v-card-title class="pa-0 bg-primary text-white overflow-hidden">
          <v-toolbar color="primary" flat dark>
            <v-toolbar-title>
              {{ isEdicao ? 'Detalhes da Reserva' : 'Nova Reserva' }}
              <v-chip v-if="bulkMode" color="white" variant="flat" size="small" label class="text-primary font-weight-bold ml-2">
                MODO LOTE
              </v-chip>
            </v-toolbar-title>
          </v-toolbar>
          <v-tabs v-if="bulkMode && !isEdicao" v-model="activeTab" bg-color="primary" grow slider-color="white">
            <v-tab :value="0" prepend-icon="mdi-plus-box">Reservar</v-tab>
            <v-tab :value="1" prepend-icon="mdi-minus-box">Remover</v-tab>
            <v-tab :value="2" prepend-icon="mdi-swap-horizontal">Transferir</v-tab>
          </v-tabs>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Common Fields for all modes (Bulk or Single) -->
          <v-list density="compact" class="mb-4 bg-grey-lighten-4 rounded-lg">
            <v-list-item v-if="!bulkGeneral" prepend-icon="mdi-door" :title="reservaForm.salaName" />
            <v-autocomplete
              v-else
              v-model="reservaForm.classroom_id"
              :items="store.classrooms"
              item-title="name"
              item-value="id"
              label="Selecionar Sala"
              variant="outlined"
              density="compact"
              class="ma-2"
              hide-details
              prepend-inner-icon="mdi-door"
            />
            <v-list-item v-if="!bulkMode" prepend-icon="mdi-calendar" :title="reservaForm.diaFormatted" />
            <v-list-item v-if="!bulkMode" prepend-icon="mdi-clock" :title="reservaForm.periodoLabel" />
          </v-list>

          <v-form ref="formReservaRef">
            <!-- Admin: Choose user (Common) -->
            <v-autocomplete
              v-if="isAdmin"
              v-model="reservaForm.user_id"
              :items="usersStore.users"
              item-title="name"
              item-value="id"
              label="Usuário Responsável"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              class=""
            />

            <!-- Tab Content for Bulk Mode -->
            <v-window v-if="bulkMode && !isEdicao" v-model="activeTab">
              <!-- TAB 0: RESERVAR -->
              <v-window-item :value="0">
                <v-row dense class="mt-1">
                  <v-col cols="6">
                    <v-text-field v-model="reservaForm.dia"  type="date" label="Data Início" variant="outlined" density="comfortable" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="reservaForm.dia_fim" type="date" label="Data Fim" variant="outlined" density="comfortable" />
                  </v-col>
                </v-row>

                <v-select
                  v-model="reservaForm.selected_periods"
                  :items="store.PERIODOS"
                  item-title="label"
                  item-value="id"
                  label="Períodos"
                  multiple
                  chips
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                />

                <div class="mb-4">
                  <div class="text-caption mb-1">Dias da Semana:</div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-checkbox v-for="(label, index) in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']"
                      :key="index"
                      v-model="reservaForm.weekdays"
                      :value="index"
                      :label="label"
                      hide-details
                      density="compact"
                      class="ma-0"
                    />
                  </div>
                </div>

                <v-autocomplete
                  v-model="reservaForm.course_id"
                  :items="carometroStore.courses"
                  item-title="name"
                  item-value="id"
                  label="Curso / Evento"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-book-education"
                  class="mb-2"
                />
                <v-text-field
                  v-model="reservaForm.course_name"
                  label="Aula"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-pencil"
                  class="mb-2"
                />
                <v-autocomplete
                  v-model="reservaForm.class_id"
                  :items="filteredClasses"
                  item-title="class_name"
                  item-value="id"
                  label="Turma"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-group"
                  :disabled="!reservaForm.course_id"
                  class="mb-2"
                >
                  <template v-slot:append v-if="canQuickCreateTurma">
                    <v-btn icon="mdi-plus-circle-outline" variant="text" size="small" color="primary" @click.stop="openQuickTurma(reservaForm.course_id)" title="Criar Nova Turma" />
                  </template>
                </v-autocomplete>
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      v-model.number="reservaForm.number_students"
                      type="number"
                      label="Quantidade de Alunos"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- TAB 1: REMOVER -->
              <v-window-item :value="1">
                <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
                  Selecione o período e os dias para remover as reservas.
                </v-alert>
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field v-model="reservaForm.dia" type="date" label="Data Início" variant="outlined" density="comfortable" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="reservaForm.dia_fim" type="date" label="Data Fim" variant="outlined" density="comfortable" />
                  </v-col>
                </v-row>
                <v-select
                  v-model="reservaForm.selected_periods"
                  :items="store.PERIODOS"
                  item-title="label"
                  item-value="id"
                  label="Períodos"
                  multiple
                  chips
                  variant="outlined"
                  density="comfortable"
                />
              </v-window-item>

              <!-- TAB 2: TRANSFERIR -->
              <v-window-item :value="2">
                <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                  Transfira as reservas do período selecionado para outra sala ou usuário.
                </v-alert>
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field v-model="reservaForm.dia" type="date" label="Data Início" variant="outlined" density="comfortable" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="reservaForm.dia_fim" type="date" label="Data Fim" variant="outlined" density="comfortable" />
                  </v-col>
                </v-row>
                <v-select
                  v-model="reservaForm.target_classroom_id"
                  :items="store.classrooms"
                  item-title="name"
                  item-value="id"
                  label="Sala de Destino"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-door-open"
                  class="mb-2"
                  clearable
                />
                <v-autocomplete
                  v-model="reservaForm.to_user_id"
                  :items="usersStore.users"
                  item-title="name"
                  item-value="id"
                  label="Novo Usuário Responsável"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-switch"
                  class="mb-2"
                  clearable
                />
                <v-select
                  v-model="reservaForm.selected_periods"
                  :items="store.PERIODOS"
                  item-title="label"
                  item-value="id"
                  label="Filtrar por Períodos"
                  multiple
                  chips
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                />
              </v-window-item>
            </v-window>

            <!-- Single Mode Fields (Current Layout) -->
            <template v-else>
              <v-autocomplete
                v-model="reservaForm.course_id"
                :items="carometroStore.courses"
                item-title="name"
                item-value="id"
                label="Curso / Evento"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-book-education"
                class="mb-2"
                :readonly="isEdicao && !podeEditar"
              />
              <v-text-field
                v-model="reservaForm.course_name"
                label="Aula"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-pencil"
                class="mb-2"
                :readonly="isEdicao && !podeEditar"
              />
              <v-autocomplete
                v-model="reservaForm.class_id"
                :items="filteredClasses"
                item-title="class_name"
                item-value="id"
                label="Turma"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-group"
                :disabled="!reservaForm.course_id"
                class="mb-2"
                :readonly="isEdicao && !podeEditar"
              >
                <template v-slot:append v-if="canQuickCreateTurma">
                  <v-btn icon="mdi-plus-circle-outline" variant="text" size="small" color="primary" @click.stop="openQuickTurma(reservaForm.course_id)" title="Criar Nova Turma" />
                </template>
              </v-autocomplete>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model.number="reservaForm.number_students"
                    type="number"
                    label="Quantidade de Alunos"
                    variant="outlined"
                    :readonly="isEdicao && !podeEditar"
                  />
                </v-col>
              </v-row>

              <div v-if="isEdicao" class="mt-2 text-caption text-grey d-flex align-center">
                <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
                Reservado por: {{ reservaForm.user_name }}
              </div>

              <!-- Single Transfer Section -->
              <v-expand-transition>
                <div v-if="isEdicao && podeEditar && transferMode" class="mt-4 pa-4 bg-blue-lighten-5 rounded-lg border">
                  <div class="text-subtitle-2 mb-2">Transferir para:</div>
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="reservaForm.target_classroom_id"
                        :items="store.classrooms"
                        item-title="name"
                        item-value="id"
                        label="Nova Sala"
                        variant="outlined"
                        density="comfortable"
                        clearable
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-autocomplete
                        v-model="reservaForm.to_user_id"
                        :items="usersStore.users"
                        item-title="name"
                        item-value="id"
                        label="Novo Usuário"
                        variant="outlined"
                        density="comfortable"
                        clearable
                      />
                    </v-col>
                  </v-row>
                  <div class="d-flex flex-wrap ga-2">
                    <v-btn color="primary" variant="tonal" size="small" @click="transferirReserva('single')">Esta reserva</v-btn>
                    <v-btn color="primary" variant="elevated" size="small" @click="transferirReserva('all')">Todas futuras</v-btn>
                  </div>
                </div>
              </v-expand-transition>
            </template>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogReserva = false">Fechar</v-btn>
          <v-spacer />

          <template v-if="!isSecretariaAdmin">
            <!-- Actions for Bulk Mode Tabs -->
            <template v-if="bulkMode && !isEdicao">
              <v-btn v-if="activeTab === 0" color="primary" variant="elevated" @click="salvarReserva" :disabled="!reservaForm.classroom_id" :loading="loading">
                Reservar Período
              </v-btn>
              <v-btn v-if="activeTab === 1" color="error" variant="elevated" @click="removerReserva" :disabled="!reservaForm.classroom_id" :loading="loading">
                Remover do Período
              </v-btn>
              <v-btn v-if="activeTab === 2" color="info" variant="elevated" @click="transferirReserva('period')" :disabled="!reservaForm.classroom_id || (!reservaForm.target_classroom_id && !reservaForm.to_user_id)" :loading="loading">
                Transferir Período
              </v-btn>
            </template>

            <!-- Actions for Single Mode -->
            <template v-else>
              <template v-if="isEdicao && podeEditar">
                <v-btn color="warning" variant="text" @click="transferMode = !transferMode">
                  {{ transferMode ? 'Cancelar Transferir' : 'Transferir' }}
                </v-btn>
                <v-btn color="error" variant="text" @click="removerReserva" :loading="loading">Remover</v-btn>
                <v-btn color="primary" variant="elevated" @click="salvarReserva" :loading="loading">Atualizar</v-btn>
              </template>
              <template v-else-if="!isEdicao">
                <v-btn color="primary" variant="elevated" @click="salvarReserva" :disabled="!reservaForm.classroom_id" :loading="loading">
                  Reservar
                </v-btn>
              </template>
            </template>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Classroom Dialog -->
    <v-dialog v-model="dialogClassroom" max-width="400">
      <v-card rounded="xl">
        <v-card-title>{{ classroomForm.id ? 'Editar Sala' : 'Nova Sala' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="classroomForm.name" label="Nome da Sala" variant="outlined" />
          <v-text-field v-model.number="classroomForm.capacity" type="number" label="Capacidade" variant="outlined" />
          <v-text-field v-model="classroomForm.type" label="Tipo (ex: Laboratório)" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="dialogClassroom = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn v-if="classroomForm.id" color="error" variant="text" @click="deletarSala" :loading="loading">Excluir</v-btn>
          <v-btn color="primary" variant="elevated" @click="salvarSala" :loading="loading">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Day Details Dialog -->
    <v-dialog v-model="dialogDia" max-width="800">
      <v-card rounded="xl">
        <v-card-title class="pa-4 d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
          Reservas de {{ diaSelecionadoFormatted }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col v-for="sala in store.classrooms" :key="sala.id" cols="12" md="6">
              <v-card variant="outlined" class="pa-2">
                <div class="font-weight-bold mb-2">{{ sala.name }}</div>
                <div class="d-flex ga-2">
                  <v-chip
                    v-for="p in store.PERIODOS"
                    :key="p.id"
                    size="small"
                    :color="getReservaColor(toDateOnly(diaSelecionado), sala.id, p.id)"
                    :variant="getReserva(toDateOnly(diaSelecionado), sala.id, p.id) ? 'flat' : 'outlined'"
                    @click="abrirReservaDialog(toDateOnly(diaSelecionado), sala, p.id)"
                  >
                    {{ p.label }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogDia = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color">{{ snack.text }}</v-snackbar>

    <!-- Quick Turma Dialog -->
    <v-dialog v-model="quickTurma.show" max-width="350">
      <v-card rounded="xl">
        <v-card-title class="pa-4">Nova Turma</v-card-title>
        <v-card-text class="pa-4 pt-0">
          <v-text-field
            v-model="quickTurma.name"
            label="Nome da Turma"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            hide-details
            @keyup.enter="saveQuickTurma"
            placeholder="Ex: 2024-1A"
          />
          <v-text-field
            v-model.number="quickTurma.number_students"
            label="Quantidade de Alunos"
            type="number"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="quickTurma.show = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveQuickTurma" :loading="quickTurma.loading" :disabled="!quickTurma.name.trim()">
            Criar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-4 d-flex align-center">
          <v-icon :color="confirmDialog.color" class="mr-2">{{ confirmDialog.icon }}</v-icon>
          {{ confirmDialog.title }}
        </v-card-title>
        <v-card-text class="pa-4">{{ confirmDialog.message }}</v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog.show = false">Cancelar</v-btn>
          <v-btn :color="confirmDialog.color" variant="elevated" @click="confirmDialog.action">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useMapaSalaStore } from '@/store/mapaSala'
import { useAuthStore } from '@/store/auth'
import { useCarometroStore } from '@/store/carometro'
import { useUsersStore } from '@/store/users'
import * as carometroService from '@/services/carometro.services'
import { toDateOnly, weekDaysMonSat, monthMatrix, startOfWeekMonday } from '@/utils/dateUtils'
import { stringToColor } from '@/utils/colorUtils'

const store = useMapaSalaStore()
const authStore = useAuthStore()
const carometroStore = useCarometroStore()
const usersStore = useUsersStore()

const isAdmin = computed(() => authStore.isAdmin)
const isSecretariaAdmin = computed(() => authStore.isSecretariaAdmin)

const reservaForm = ref({
  id: null,
  dia: '',
  dia_fim: '',
  classroom_id: '',
  target_classroom_id: null,
  to_user_id: null,
  period: '',
  selected_periods: [],
  course_name: '',
  course_type: 'Técnico',
  number_students: 0,
  user_id: null,
  user_name: '',
  diaFormatted: '',
  salaName: '',
  periodoLabel: '',
  weekdays: [1, 2, 3, 4, 5] // Mon-Fri by default
})

const podeEditar = computed(() => {
  if (!authStore.user) return false
  if (isAdmin.value) return true
  const res = store.getReservation(reservaForm.value.dia, reservaForm.value.classroom_id, reservaForm.value.period)
  return res && res.user_id === authStore.user.id
})

const filteredClasses = computed(() => {
  if (!reservaForm.value.course_id) return []
  return carometroStore.getClassesByCourseId(reservaForm.value.course_id)
})

const modo = ref('semana')
const baseDate = ref(new Date())
const salaFiltro = ref('')
const loading = ref(false)
const snack = reactive({ show: false, text: '', color: 'success' })

const showSnack = (text, color = 'success') => {
  snack.text = text
  snack.color = color
  snack.show = true
}

const isEdicao = ref(false)
const bulkMode = ref(false)
const bulkGeneral = ref(false)
const transferMode = ref(false)
const activeTab = ref(0)

const quickTurma = reactive({
  show: false,
  loading: false,
  name: '',
  number_students: 0,
  courseId: null
})

const canQuickCreateTurma = computed(() => {
  const courseId = reservaForm.value.course_id
  if (!courseId) return false
  const courses = carometroStore.courses || []
  const course = courses.find(c => String(c.id) === String(courseId))
  if (!course) return false
  // Check if course name contains "FIC" (case-insensitive)
  return course.name?.toUpperCase().includes('FIC')
})

const openQuickTurma = (courseId) => {
  quickTurma.courseId = courseId
  quickTurma.name = ''
  quickTurma.number_students = reservaForm.value.number_students || 0
  quickTurma.show = true
}

const saveQuickTurma = async () => {
  if (!quickTurma.name.trim() || !quickTurma.courseId) return
  quickTurma.loading = true
  try {
    const newClass = await carometroService.createClass({
      class_name: quickTurma.name.trim(),
      course_id: quickTurma.courseId,
      number_students: quickTurma.number_students
    })
    await carometroStore.fetchClasses()
    reservaForm.value.class_id = newClass.id
    reservaForm.value.number_students = quickTurma.number_students
    quickTurma.show = false
    showSnack('Turma criada com sucesso!')
  } catch (err) {
    showSnack('Erro ao criar turma: ' + err.message, 'error')
  } finally {
    quickTurma.loading = false
  }
}

watch(() => reservaForm.value.course_id, (newId) => {
  if (newId) {
    // Only reset class if the current class doesn't belong to the new course
    if (reservaForm.value.class_id) {
      const cls = carometroStore.classes.find(c => c.id === reservaForm.value.class_id)
      if (cls && cls.course_id !== newId) {
        reservaForm.value.class_id = null
      }
    }
  }
})

// Data Navigation
const diasSemana = computed(() => weekDaysMonSat(baseDate.value))
const mesAtual = ref(new Date().getMonth())
const anoAtual = ref(new Date().getFullYear())
const mesMatrix = computed(() => monthMatrix(anoAtual.value, mesAtual.value))

const tituloSemana = computed(() => {
  const d = diasSemana.value
  if (!d.length) return ''
  return `${d[0].toLocaleDateString('pt-BR')} — ${d[d.length - 1].toLocaleDateString('pt-BR')}`
})

const tituloMes = computed(() => {
  return new Date(anoAtual.value, mesAtual.value, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const formatDia = (d) => {
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

const isHoje = (d) => toDateOnly(d) === toDateOnly(new Date())

const semanaAnterior = () => {
  const d = new Date(baseDate.value)
  d.setDate(d.getDate() - 7)
  baseDate.value = d
}
const proximaSemana = () => {
  const d = new Date(baseDate.value)
  d.setDate(d.getDate() + 7)
  baseDate.value = d
}
const irParaSemanaAtual = () => {
  baseDate.value = new Date()
}

const mesAnterior = () => {
  if (mesAtual.value === 0) {
    mesAtual.value = 11
    anoAtual.value--
  } else {
    mesAtual.value--
  }
}
const proximoMes = () => {
  if (mesAtual.value === 11) {
    mesAtual.value = 0
    anoAtual.value++
  } else {
    mesAtual.value++
  }
}
const irParaMesAtual = () => {
  const d = new Date()
  mesAtual.value = d.getMonth()
  anoAtual.value = d.getFullYear()
}

// Filtering
const salasFiltradas = computed(() => {
  if (!salaFiltro.value) return store.classrooms
  const f = salaFiltro.value.toLowerCase().trim()
  return store.classrooms.filter(s => s.name.toLowerCase().includes(f))
})

// Reservations Logic
const getReserva = (diaISO, classroomId, period) => store.getReservation(diaISO, classroomId, period)

const getReservaColor = (diaISO, classroomId, period) => {
  const r = getReserva(diaISO, classroomId, period)
  if (!r) return 'grey-lighten-4'
  return stringToColor(r.user_id || r.user_name)
}

const getResumoDia = (d) => {
  const iso = toDateOnly(d)
  const total = store.reservations.filter(r => new Date(r.data).toISOString().split('T')[0] === iso).length
  return { total }
}

// Dialogs
const dialogReserva = ref(false)

const confirmDialog = reactive({
  show: false,
  title: '',
  message: '',
  color: 'primary',
  icon: 'mdi-help-circle',
  action: () => {}
})

const abrirConfirmacao = (title, message, action, color = 'primary', icon = 'mdi-help-circle') => {
  confirmDialog.title = title
  confirmDialog.message = message
  confirmDialog.action = () => {
    action()
    confirmDialog.show = false
  }
  confirmDialog.color = color
  confirmDialog.icon = icon
  confirmDialog.show = true
}

const abrirBulkGeral = () => {
  isEdicao.value = false
  bulkMode.value = true
  bulkGeneral.value = true
  transferMode.value = false
  activeTab.value = 0

  const today = toDateOnly(new Date())

  reservaForm.value = {
    id: null,
    dia: today,
    dia_fim: today,
    classroom_id: '',
    target_classroom_id: null,
    to_user_id: null,
    period: 'MANHA',
    selected_periods: ['MANHA'],
    course_name: '',
    course_id: null,
    class_id: null,
    course_type: 'Técnico',
    number_students: 0,
    user_id: authStore.user?.id,
    user_name: authStore.user?.name,
    diaFormatted: 'Selecione o período',
    salaName: 'Selecione a sala',
    periodoLabel: 'Vários',
    weekdays: [1, 2, 3, 4, 5]
  }

  dialogReserva.value = true
}

const abrirReservaDialog = (dia, sala, periodoId) => {
  const r = getReserva(dia, sala.id, periodoId)
  isEdicao.value = !!r
  bulkMode.value = false
  bulkGeneral.value = false
  transferMode.value = false
  activeTab.value = 0

  const p = store.PERIODOS.find(opt => opt.id === periodoId)

  reservaForm.value = {
    id: r?.id || null,
    dia,
    dia_fim: dia,
    classroom_id: sala.id,
    target_classroom_id: null,
    to_user_id: null,
    period: periodoId,
    selected_periods: [periodoId],
    course_name: r?.course_name || '',
    course_id: r?.course_id || null,
    class_id: r?.class_id || null,
    course_type: r?.course_type || 'Técnico',
    number_students: r?.number_students || 0,
    user_id: r?.user_id || authStore.user?.id,
    user_name: r?.user_name || authStore.user?.name,
    diaFormatted: new Date(dia + 'T12:00:00').toLocaleDateString('pt-BR'),
    salaName: sala.name,
    periodoLabel: p?.label || periodoId,
    weekdays: [1, 2, 3, 4, 5]
  }

  dialogReserva.value = true
}

const salvarReserva = async () => {
  loading.value = true
  try {
    const selectedUser = usersStore.users.find(u => u.id === reservaForm.value.user_id) || authStore.user
    const courseObj = carometroStore.courses.find(c => c.id === reservaForm.value.course_id)
    const selectedCourseName = courseObj ? courseObj.name : 'Outro'

    if (bulkMode.value) {
      const payload = {
        classroom_id: reservaForm.value.classroom_id,
        start_date: reservaForm.value.dia,
        end_date: reservaForm.value.dia_fim,
        periods: reservaForm.value.selected_periods,
        weekdays: reservaForm.value.weekdays,
        user_id: selectedUser.id,
        user_name: selectedUser.name,
        course_name: reservaForm.value.course_name,
        course_id: reservaForm.value.course_id,
        class_id: reservaForm.value.class_id,
        course_type: selectedCourseName,
        number_students: Number(reservaForm.value.number_students)
      }
      await store.createBulkReservations(payload)
      showSnack('Reservas em lote realizadas!')
    } else {
      const payload = {
        classroom_id: reservaForm.value.classroom_id,
        data: reservaForm.value.dia,
        period: reservaForm.value.period,
        user_id: selectedUser.id,
        user_name: selectedUser.name,
        course_name: reservaForm.value.course_name,
        course_id: reservaForm.value.course_id,
        class_id: reservaForm.value.class_id,
        course_type: selectedCourseName,
        number_students: Number(reservaForm.value.number_students)
      }

      if (isEdicao.value) {
        await store.updateReservation(reservaForm.value.id, payload)
        showSnack('Reserva atualizada!')
      } else {
        await store.createReservation(payload)
        showSnack('Reserva realizada!')
      }
    }
    dialogReserva.value = false
  } catch (err) {
    showSnack('Erro ao salvar reserva: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

const removerReserva = async () => {
  const title = 'Confirmar Exclusão'
  const msg = bulkMode.value
    ? 'Deseja realmente excluir as reservas deste período?'
    : 'Deseja realmente excluir esta reserva?'

  abrirConfirmacao(title, msg, async () => {
    loading.value = true
    try {
      if (bulkMode.value) {
        const payload = {
          classroom_id: reservaForm.value.classroom_id,
          start_date: reservaForm.value.dia,
          end_date: reservaForm.value.dia_fim,
          periods: reservaForm.value.selected_periods,
          user_id: isAdmin.value ? undefined : authStore.user?.id
        }
        await store.deleteBulkReservations(payload)
        showSnack('Reservas removidas do período!')
      } else {
        await store.deleteReservation(reservaForm.value.id)
        showSnack('Reserva removida!')
      }
      dialogReserva.value = false
    } catch (err) {
      showSnack('Erro ao remover: ' + err.message, 'error')
    } finally {
      loading.value = false
    }
  }, 'error', 'mdi-delete')
}

const transferirReserva = async (mode = 'single') => {
  if (!reservaForm.value.target_classroom_id && !reservaForm.value.to_user_id) {
    showSnack('Selecione a sala ou o usuário de destino', 'warning')
    return
  }

  loading.value = true
  try {
    const payload = {
      from_classroom_id: reservaForm.value.classroom_id,
      to_classroom_id: reservaForm.value.target_classroom_id,
      user_id: reservaForm.value.user_id,
      to_user_id: reservaForm.value.to_user_id,
      reservation_id: reservaForm.value.id,
      all: mode === 'all',
      by_period: mode === 'period',
      start_date: mode === 'period' ? reservaForm.value.dia : undefined,
      end_date: mode === 'period' ? reservaForm.value.dia_fim : undefined,
      periods: (mode === 'all' || mode === 'period') ? reservaForm.value.selected_periods : undefined
    }
    await store.transferReservations(payload)

    let snackMsg = 'Reserva transferida!'
    if (mode === 'all') snackMsg = 'Todas as reservas futuras transferidas!'
    if (mode === 'period') snackMsg = 'Reservas do período transferidas!'

    showSnack(snackMsg)
    dialogReserva.value = false
  } catch (err) {
    showSnack('Erro ao transferir: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// Classroom Management
const dialogClassroom = ref(false)
const classroomForm = ref({ id: null, name: '', capacity: 0, type: '' })

const abrirDialogClassroom = (sala = null) => {
  if (sala) {
    classroomForm.value = { ...sala }
  } else {
    classroomForm.value = { id: null, name: '', capacity: 0, type: '' }
  }
  dialogClassroom.value = true
}

const salvarSala = async () => {
  loading.value = true
  try {
    if (classroomForm.value.id) {
      await store.updateClassroom(classroomForm.value.id, classroomForm.value)
      showSnack('Sala atualizada!')
    } else {
      await store.createClassroom(classroomForm.value)
      showSnack('Sala criada!')
    }
    dialogClassroom.value = false
  } catch (err) {
    showSnack('Erro ao salvar sala', 'error')
  } finally {
    loading.value = false
  }
}

const deletarSala = async () => {
  abrirConfirmacao(
    'Excluir Sala',
    'Deseja excluir esta sala e todas as suas reservas? Esta ação não pode ser desfeita.',
    async () => {
      loading.value = true
      try {
        await store.deleteClassroom(classroomForm.value.id)
        showSnack('Sala excluída!')
        dialogClassroom.value = false
      } catch (err) {
        showSnack('Erro ao excluir sala', 'error')
      } finally {
        loading.value = false
      }
    },
    'error',
    'mdi-delete-forever'
  )
}

// Day View
const dialogDia = ref(false)
const diaSelecionado = ref(new Date())
const diaSelecionadoFormatted = computed(() => diaSelecionado.value.toLocaleDateString('pt-BR'))

const abrirDia = (d) => {
  diaSelecionado.value = d
  dialogDia.value = true
}

// Export
const exportarCSV = () => {
  const headers = ['Data', 'Sala', 'Período', 'Responsável', 'Curso', 'Aula', 'Alunos']
  const rows = store.reservations.map(r => [
    new Date(r.data).toLocaleDateString('pt-BR'),
    r.classrooms?.name || 'N/A',
    r.period,
    r.user_name,
    r.course_type || '',
    r.course_name || '',
    r.number_students
  ])

  let csvContent = "data:text/csv;charset=utf-8," 
    + "\uFEFF" // BOM for Excel
    + headers.join(";") + "\n"
    + rows.map(e => e.join(";")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `mapa_sala_${toDateOnly(new Date())}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  store.fetchData()
  carometroStore.fetchData()
  if (isAdmin.value) usersStore.fetchUsers()
})
</script>

<style scoped>
.tabela-wrapper { overflow-x: auto; overflow-y: auto; max-height: 70vh; border: 1px solid rgba(0,0,0,0.05); border-radius: 8px; }
.tabela-semana { width: 100%; border-collapse: separate; border-spacing: 0; }
.tabela-semana thead th { position: sticky; top: 0; background: #f8fafc; z-index: 2; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 0.875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.tabela-semana td { padding: 4px; border-bottom: 1px solid #f9f1f1; border-right: 1px solid #f1f5f9; vertical-align: middle; }
.tabela-semana tr { padding: 4px; border-bottom: 1px solid #ff0000; border-right: 4px solid #0482ff; vertical-align: middle; }
.col-sala { width: 180px; min-width: 180px; background: #f8fafc; position: sticky; left: 0; z-index: 1; border-right: 2px solid #e2e8f0 !important; border-bottom: 3px solid #e2e8f0  !important; }
.col-periodo-header { position: sticky; left: 180px; z-index: 2; background: #f8fafc; border-right: 2px solid #e2e8f0 !important; }
.col-periodo { width: 100px; min-width: 100px; background: #f8fafc; position: sticky; left: 180px; z-index: 1; border-right: 2px solid #e2e8f0 !important; }
thead th.col-sala, thead th.col-periodo-header { z-index: 3; }
.celula-dia { max-width: 120px; }
.line-height-1 { line-height: 1.2; }
.sala-divider td { border-bottom: 3px solid #cbd5e1 !important; }
.reservation-card { transition: transform 0.1s, box-shadow 0.1s; }
.reservation-card:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.grid-mes { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.grid-mes .header { text-align: center; font-weight: 600; color: #1e3a8a; padding: 8px; background: #f1f5f9; border-radius: 8px; }
.cell-dia { border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; min-height: 100px; cursor: pointer; background: white; transition: all 0.2s; }
.cell-dia:hover { border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.cell-dia.fora { background: #f8fafc; color: #cbd5e1; }
.cell-dia.hoje { border: 2px solid #ef4444; }
.cell-dia-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.cell-dia-header .num { font-weight: 700; font-size: 1.1rem; }
.resumo-chips { display: flex; flex-direction: column; gap: 2px; }

.text-center-md { text-align: center; }
@media (max-width: 960px) {
  .col-sala { min-width: 140px; }
  .celula-periodos { min-width: 120px; }
}
</style>
