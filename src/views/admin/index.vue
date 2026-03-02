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
      <v-tab value="classrooms">Salas</v-tab>
      <v-tab value="students">Alunos</v-tab>
      <v-tab value="photos">Fotos em Lote</v-tab>
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

      <!-- Salas -->
      <v-window-item value="classrooms">
        <ClassroomManager />
      </v-window-item>

      <!-- Fotos em Lote -->
      <v-window-item value="photos">
        <v-card elevation="4" rounded="xl" class="pa-6 text-center">
          <v-icon size="64" color="senai-navy" class="mb-4">mdi-image-multiple</v-icon>
          <h2 class="text-h5 mb-2">Upload de Fotos em Lote</h2>
          <p class="text-body-1 text-grey mb-6">
            Suba múltiplas fotos de uma vez. O sistema identificará cada aluno pela matrícula no nome do arquivo.
          </p>
          <v-btn color="senai-navy" size="large" @click="photoBatchDialog = true">
            Abrir Seletor de Fotos
          </v-btn>
        </v-card>
      </v-window-item>
    </v-window>

    <StudentImportDialog v-model="importDialog" @imported="onImported" />
    <PhotoBatchUploadDialog v-model="photoBatchDialog" @completed="onPhotosUploaded" />

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
import ClassroomManager from '@/components/admin/ClassroomManager.vue'
import StudentImportDialog from '@/components/admin/StudentImportDialog.vue'
import PhotoBatchUploadDialog from '@/components/admin/PhotoBatchUploadDialog.vue'

const store = useCarometroStore()
const tab = ref('dashboard')
const importDialog = ref(false)
const photoBatchDialog = ref(false)
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

const onPhotosUploaded = () => {
  showSnack('Upload de fotos concluído')
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
