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

    <!-- Ferramentas principais (apenas as ativas) -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 text-senai-red font-weight-medium mb-4">Acesso Rápido</h2>
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card elevation="2" rounded="lg" hover @click="() => router.push('/carometro')" class="card-clickable">
          <v-card-text class="pa-4 text-center">
            <v-icon color="senai-red" size="36" class="mb-3">mdi-account-group</v-icon>
            <h4 class="text-h6 text-senai-red font-weight-medium">Carômetro</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">Gestão de alunos</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card elevation="2" rounded="lg" hover @click="() => router.push('/calendario-escolar')" class="card-clickable">
          <v-card-text class="pa-4 text-center">
            <v-icon color="success" size="36" class="mb-3">mdi-calendar</v-icon>
            <h4 class="text-h6 text-senai-red font-weight-medium">Calendário Escolar</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">Documento digital</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card elevation="2" rounded="lg" hover @click="() => router.push('/mapa-sala')" class="card-clickable">
          <v-card-text class="pa-4 text-center">
            <v-icon color="senai-red" size="36" class="mb-3">mdi-floor-plan</v-icon>
            <h4 class="text-h6 text-senai-red font-weight-medium">Mapa de Sala</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">Reservas por período</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.card-clickable {
  cursor: pointer;
}
</style>
