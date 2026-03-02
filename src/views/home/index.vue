<template>
  <v-container fluid>
    <!-- Welcome Section -->
    <v-card color="senai-red" dark elevation="8" rounded="lg" class="mb-6">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="8">
            <h1 class="text-h3 font-weight-light mb-3">Bem-vindo ao Portal SENAI</h1>
            <p class="text-h6 font-weight-light opacity-80">
              Acesse rapidamente as ferramentas abaixo
            </p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-icon size="80" color="white" class="opacity-80">mdi-school</v-icon>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-row>
      <v-col cols="12" md="6">
        <!-- Ferramentas principais (apenas as ativas) -->
          <v-row>
            <v-col cols="12">
              <h2 class="text-h4 text-senai-red font-weight-medium mb-4">Acesso Rápido</h2>
            </v-col>

            <v-col cols="12" sm="6" >
              <v-card elevation="2" rounded="lg" hover @click="() => router.push('/carometro')" class="card-clickable">
                <v-card-text class="pa-4 text-center">
                  <v-icon color="senai-red" size="36" class="mb-3">mdi-account-group</v-icon>
                  <h4 class="text-h6 text-senai-red font-weight-medium">Carômetro</h4>
                  <p class="text-body-2 text-medium-emphasis mb-0">Gestão de alunos</p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" >
              <v-card elevation="2" rounded="lg" hover @click="() => router.push('/calendario-escolar')" class="card-clickable">
                <v-card-text class="pa-4 text-center">
                  <v-icon color="success" size="36" class="mb-3">mdi-calendar</v-icon>
                  <h4 class="text-h6 text-senai-red font-weight-medium">Calendário Escolar</h4>
                  <p class="text-body-2 text-medium-emphasis mb-0">Documento digital</p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" >
              <v-card elevation="2" rounded="lg" hover @click="() => router.push('/mapa-sala')" class="card-clickable">
                <v-card-text class="pa-4 text-center">
                  <v-icon color="senai-red" size="36" class="mb-3">mdi-floor-plan</v-icon>
                  <h4 class="text-h6 text-senai-red font-weight-medium">Mapa de Sala</h4>
                  <p class="text-body-2 text-medium-emphasis mb-0">Reservas por período</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
      </v-col>
      <v-col cols="12" md="6">
        <!-- Aniversariantes Section -->
        <v-row >
          <v-col cols="12" class="d-flex align-center justify-space-between">
            <h2 class="text-h4 text-senai-red font-weight-medium">Aniversariantes do Mês</h2>
            <v-btn
              color="success"
              variant="tonal"
              prepend-icon="mdi-file-pdf-box"
              @click="exportBirthdays"
              :disabled="!aniversariantesMes.length"
            >
              Exportar PDF
            </v-btn>
          </v-col>
    
          <v-col cols="12">
            <v-card elevation="4" rounded="xl">
              <v-table v-if="aniversariantesMes.length > 0">
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold">Dia</th>
                    <th class="text-left font-weight-bold">Nome</th>
                    <th class="text-left font-weight-bold">E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in aniversariantesMes" :key="user.id" :class="{ 'bg-red-lighten-5': isHoje(user.birthDate) }">
                    <td class="font-weight-bold">{{ fromDateOnly(user.birthDate)?.getDate() }}</td>
                    <td>
                      {{ user.name }}
                      <v-chip v-if="isHoje(user.birthDate)" size="x-small" color="senai-red" class="ml-2">Hoje! 🎂</v-chip>
                    </td>
                    <td class="text-grey">{{ user.email }}</td>
                  </tr>
                </tbody>
              </v-table>
              <v-card-text v-else class="text-center py-8 text-grey">
                <v-icon size="48" class="mb-2 opacity-20">mdi-cake-variant</v-icon>
                <p>Nenhum aniversariante encontrado para este mês.</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    

  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/store/users'
import { exportAniversariantesPDF } from '@/utils/exportUtils'
import { fromDateOnly } from '@/utils/dateUtils'

const router = useRouter()
const usersStore = useUsersStore()

const aniversariantesMes = computed(() => {
  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  return usersStore.users
    .filter(u => {
      if (!u.birthDate) return false
      const birth = fromDateOnly(u.birthDate)
      return birth && birth.getMonth() === mesAtual
    })
    .sort((a, b) => {
      const dateA = fromDateOnly(a.birthDate)
      const dateB = fromDateOnly(b.birthDate)
      return (dateA?.getDate() || 0) - (dateB?.getDate() || 0)
    })
})

const isHoje = (date) => {
  if (!date) return false
  const d = fromDateOnly(date)
  const hoje = new Date()
  return d && d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth()
}

const exportBirthdays = async () => {
  await exportAniversariantesPDF(aniversariantesMes.value)
}

onMounted(() => {
  usersStore.fetchUsers()
})
</script>

<style scoped>
.card-clickable {
  cursor: pointer;
}
</style>
