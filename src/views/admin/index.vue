<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-2 text-senai-red font-weight-bold">Administração</h1>
        <p class="text-subtitle-1 text-grey">Gerenciamento de cursos, turmas e alunos</p>
      </v-col>
    </v-row>

    <v-tabs v-model="tab" color="senai-red" class="mb-4">
      <v-tab value="dashboard">Dashboard</v-tab>
      <v-tab value="academic">Cursos & Turmas</v-tab>
      <v-tab value="students">Alunos</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- Dashboard / Stats -->
      <v-window-item value="dashboard">
        <AdminDashboard />
      </v-window-item>

      <!-- Cursos & Turmas -->
      <v-window-item value="academic">
        <v-row>
          <v-col cols="12" md="6">
            <CourseManager @updated="onDataUpdated" />
          </v-col>
          <v-col cols="12" md="6">
            <ClassManager @updated="onDataUpdated" />
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Alunos -->
      <v-window-item value="students">
        <StudentManager ref="studentManagerRef" @open-import="importDialog = true" />
      </v-window-item>
    </v-window>

    <StudentImportDialog v-model="importDialog" @imported="onImported" />

    <v-snackbar v-model="snack.show" :color="snack.color">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useCarometroStore } from '@/store/carometro'

// Subcomponents
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
import CourseManager from '@/components/admin/CourseManager.vue'
import ClassManager from '@/components/admin/ClassManager.vue'
import StudentManager from '@/components/admin/StudentManager.vue'
import StudentImportDialog from '@/components/admin/StudentImportDialog.vue'

const store = useCarometroStore()
const tab = ref('dashboard')
const importDialog = ref(false)
const studentManagerRef = ref(null)
const snack = reactive({ show: false, text: '', color: 'success' })

const showSnack = (text, color = 'success') => {
  snack.text = text
  snack.color = color
  snack.show = true
}

const onDataUpdated = () => {
  showSnack('Dados atualizados com sucesso')
  if (studentManagerRef.value) {
    studentManagerRef.value.fetchStudents()
  }
}

const onImported = () => {
  showSnack('Alunos importados com sucesso')
  if (studentManagerRef.value) {
    studentManagerRef.value.fetchStudents()
  }
}

onMounted(() => {
  store.fetchData()
})
</script>

<style scoped>
.v-container {
  max-width: 1400px;
}
</style>
