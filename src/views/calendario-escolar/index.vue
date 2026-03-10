<template>
  <v-container fluid height="100%" class="d-flex flex-column pa-0">
    <!-- Header -->
    <v-card elevation="4" color="senai-red" rounded="0" class="pa-4">
      <v-row align="center" no-gutters>
        <v-col class="d-flex align-center">
          <v-icon size="32" color="white">mdi-calendar-clock</v-icon>
          <h1 class="text-h4 ml-3 font-weight-medium text-white">Calendário Escolar</h1>
        </v-col>
        <v-col v-if="isAdmin" cols="auto">
          <v-btn
            color="white"
            variant="flat"
            prepend-icon="mdi-upload"
            @click="modalUpload = true"
            class="text-senai-red font-weight-bold"
          >
            Alterar Calendário
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Content -->
      <div v-if="loading" class="fill-height d-flex flex-column align-center justify-center">
        <v-progress-circular indeterminate color="senai-red" size="64" width="6" />
        <p class="mt-4 text-h6 text-grey-darken-1">Carregando calendário...</p>
      </div>

      <template v-else>
        <iframe
          v-if="activeCalendar"
          :src="activeCalendar.file_path"
          width="100%"
          height="100%"
          style="border:none;"
          class="ma-0"
        ></iframe>

        <v-container v-else class="fill-height d-flex align-center justify-center">
          <v-empty-state
            icon="mdi-calendar-remove"
            title="Nenhum calendário disponível"
            text="O calendário escolar para este período ainda não foi publicado."
            class="bg-white rounded-xl elevation-2"
          />
        </v-container>
      </template>

    <!-- Upload Modal -->
    <v-dialog v-model="modalUpload" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-senai-red text-white d-flex align-center">
          <v-icon color="white" class="mr-2">mdi-file-upload</v-icon>
          Upload de Novo Calendário
        </v-card-title>
        
        <v-card-text class="pa-4 pt-6">
          <v-file-input
            v-model="file"
            label="Selecione o arquivo PDF"
            accept="application/pdf"
            variant="outlined"
            prepend-icon="mdi-file-pdf-box"
            show-size
            :rules="[v => !!v || 'Arquivo é obrigatório']"
          />
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="error = null"
          >
            {{ error }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeModal" :disabled="uploading">Cancelar</v-btn>
          <v-btn
            color="senai-red"
            variant="elevated"
            @click="handleUpload"
            :loading="uploading"
            :disabled="!file"
          >
            Salvar e Publicar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import * as calendarApi from '@/api/schoolCalendar.api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const activeCalendar = ref(null)
const loading = ref(true)
const uploading = ref(false)
const modalUpload = ref(false)
const file = ref(null)
const error = ref(null)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const fetchCalendar = async () => {
  loading.value = true
  try {
    const { data } = await calendarApi.getActiveCalendar()
    activeCalendar.value = data
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error('Error fetching calendar:', err)
    }
    activeCalendar.value = null
  } finally {
    loading.value = false
  }
}

const handleUpload = async () => {
  if (!file.value) return

  uploading.value = true
  error.value = null

  try {
    const reader = new FileReader()
    reader.readAsDataURL(file.value)
    
    reader.onload = async () => {
      const base64Content = reader.result
      
      try {
        await calendarApi.uploadCalendar({
          name: file.value.name,
          base64_content: base64Content
        })
        
        showSnackbar('Calendário atualizado com sucesso!')
        closeModal()
        fetchCalendar()
      } catch (err) {
        error.value = err.response?.data?.details || err.response?.data?.message || 'Erro ao enviar arquivo para o servidor.'
        console.error(err)
      } finally {
        uploading.value = false
      }
    }

    reader.onerror = () => {
      error.value = 'Erro ao ler o arquivo PDF.'
      uploading.value = false
    }

  } catch (err) {
    error.value = 'Ocorreu um erro inesperado.'
    uploading.value = false
    console.error(err)
  }
}

const closeModal = () => {
  modalUpload.value = false
  file.value = null
  error.value = null
}

const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

onMounted(() => {
  fetchCalendar()
})
</script>

<style scoped>
.calendar-iframe {
  background-color: white;
}
.v-container {
  max-width: 100% !important;
}
</style>
