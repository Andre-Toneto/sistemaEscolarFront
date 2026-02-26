<template>
  <v-card
    hover
    rounded="xl"
    elevation="4"
    class="person-card flex-grow-1"
    @click="$emit('click')"
    style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;"
  >
    <!-- Status aluno -->
    <v-chip
      size="small"
      color="success"
      variant="outlined"
      class="position-absolute"
      style="top: 8px; right: 8px; z-index: 1"
    >
      <v-icon start size="x-small">mdi-check-circle</v-icon>
      Ativo
    </v-chip>

    <!-- Avatar/Foto -->
    <div class="text-center pt-6 pb-2">
      <v-avatar size="80" class="elevation-4">
        <v-img :src="pessoa.photo_url || pessoa.foto_url || pessoa.foto || '/placeholder-student.png'" cover>
          <template #placeholder>
            <v-skeleton-loader type="avatar" />
          </template>
          <template #error>
            <v-icon size="40" color="grey-lighten-1">mdi-account</v-icon>
          </template>
        </v-img>
      </v-avatar>
    </div>

    <!-- Informações -->
    <v-card-title class="text-center text-capitalize text-h6 font-weight-bold text-senai-red px-4 pb-1 student-name" style="text-transform: capitalize !important;">
      {{ capitalizeName(pessoa.name || pessoa.nome) }}
    </v-card-title>

    <!-- Badge de Status e Matrícula -->
    <div class="d-flex justify-center align-center text-center pb-4 gap-2">
      <div class="text-center d-flex">
        <div class="text-caption text-medium-emphasis mr-4">Matrícula:</div>
        <div class="text-body-2 font-weight-medium" @click.stop="$emit('copy', pessoa.registration_number || pessoa.matricula)">
          {{ pessoa.registration_number || pessoa.matricula }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  pessoa: Object
})

defineEmits(['click', 'copy'])

const capitalizeName = (str) => {
  if (!str) return ''
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
</script>

<style scoped>
.person-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.person-card:hover {
  transform: translateY(-8px);
  border-color: rgb(var(--v-theme-senai-red));
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.student-name {
  white-space: normal;
  word-break: break-word;
}
</style>
