<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-card variant="outlined" color="senai-red">
        <v-card-text class="text-center">
          <div class="text-h3 font-weight-bold">{{ store.courses.length }}</div>
          <div class="text-subtitle-1">Cursos Ativos</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card variant="outlined" color="senai-navy">
        <v-card-text class="text-center">
          <div class="text-h3 font-weight-bold">{{ store.classes.length }}</div>
          <div class="text-subtitle-1">Turmas Ativas</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card variant="outlined" color="success">
        <v-card-text class="text-center">
          <div class="text-h3 font-weight-bold">{{ totalStudents }}</div>
          <div class="text-subtitle-1">Alunos Cadastrados</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { useCarometroStore } from '@/store/carometro'
import { ref, onMounted } from 'vue'
import * as carometroService from '@/services/carometro.services'

const store = useCarometroStore()
const totalStudents = ref(0)

const fetchTotalStudents = async () => {
  try {
    const students = await carometroService.getStudents()
    totalStudents.value = students.length
  } catch (err) {
    console.error('Error fetching total students:', err)
  }
}

onMounted(() => {
  fetchTotalStudents()
})
</script>
