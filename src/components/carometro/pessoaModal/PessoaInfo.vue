<template>
  <v-row dense>
    <!-- Foto -->
    <v-col cols="12" :sm="isAdmin ? 3 : 4" class="d-flex justify-center">
      <v-img v-if="pessoa.foto" :src="pessoa.foto" height="240" width="180" rounded="lg" cover class="elevation-6">
        <template #error>
          <v-sheet height="240" width="180" rounded="lg" class="elevation-6 d-flex align-center justify-center">
            <v-icon size="80" color="grey-lighten-2">mdi-account</v-icon>
          </v-sheet>
        </template>
      </v-img>
      <v-sheet v-else height="240" width="180" rounded="lg" class="elevation-6 d-flex align-center justify-center">
        <v-icon size="80" color="grey-lighten-2">mdi-account</v-icon>
      </v-sheet>
    </v-col>

    <!-- Acadêmico -->
    <v-col cols="12" :sm="isAdmin ? 3 : 4">
      <v-card elevation="4" rounded="xl" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon color="primary" class="mr-2">mdi-school</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Acadêmico</span>
          </div>
          <v-divider class="mb-2" />
          <v-list class="flex" density="compact">
            <v-list-item title="Matrícula">
              <template #subtitle>
                <span class="d-flex align-center">
                  <span class="truncate-info">{{ safeValue(pessoa.registration_number || pessoa.matricula) }}</span>
                  <v-btn icon size="16" variant="text" color="primary" class="ml-2" @click.stop="copy('Matrícula', pessoa.registration_number || pessoa.matricula)" title="Copiar matrícula">
                    <v-icon size="16">mdi-content-copy</v-icon>
                  </v-btn>
                </span>
              </template>
            </v-list-item>
            <v-list-item title="Turma" :subtitle="safeValue(turmaNome || pessoa.turma)" />
            <v-list-item title="Curso" :subtitle="safeValue(cursoNome || pessoa.curso)" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Pessoal -->
    <v-col cols="12" :sm="isAdmin ? 3 : 4">
      <v-card elevation="4" rounded="xl" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon color="warning" class="mr-2">mdi-account-circle</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Pessoal</span>
          </div>
          <v-divider class="mb-2" />
          <v-list density="compact">
            <v-list-item title="Data de Nascimento">
              <template #subtitle>
                <v-tooltip :text="formatData(pessoa.birth_date || pessoa.data_nascimento)">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props">{{ formatData(pessoa.birth_date || pessoa.data_nascimento) }}</span>
                  </template>
                </v-tooltip>
              </template>
            </v-list-item>
            <v-list-item title="CPF" :subtitle="safeValue(pessoa.cpf)" />
            <v-list-item title="RG" :subtitle="safeValue(pessoa.rg)" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Contato -->
    <v-col cols="12" :sm="isAdmin ? 3 : 12">
      <v-card elevation="4" rounded="xl" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon color="info" class="mr-2">mdi-phone</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Contato</span>
          </div>
          <v-divider class="mb-2" />
          <v-list density="compact">
            <v-list-item title="E-mail" :subtitle="safeValue(pessoa.email)" />
            <v-list-item title="Celular" :subtitle="safeValue(pessoa.mobile_phone || pessoa.celular)" />
            <v-list-item title="Telefone" :subtitle="safeValue(pessoa.phone || pessoa.telefone)" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { safeValue, formatData } from '@/utils/exportUtils'

defineProps({
  pessoa: Object,
  cursoNome: String,
  turmaNome: String,
  isAdmin: Boolean
})

const emit = defineEmits(['copy'])

const copy = (label, value) => {
  emit('copy', { label, value })
}
</script>

<style scoped>
.truncate-info {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
