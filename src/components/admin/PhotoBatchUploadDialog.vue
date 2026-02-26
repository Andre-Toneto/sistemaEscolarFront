<template>
  <v-dialog v-model="isOpen" max-width="700">
    <v-card rounded="lg">
      <v-card-title class="bg-senai-navy text-white pa-4">
        <v-icon start color="white">mdi-image-multiple</v-icon>
        Upload de Fotos em Lote
      </v-card-title>
      
      <v-card-text class="pa-6">
        <v-alert type="info" variant="tonal" class="mb-4">
          Selecione múltiplos arquivos de imagem. O nome de cada arquivo deve ser exatamente a <b>matrícula</b> do aluno (ex: 12345.jpg).
        </v-alert>

        <v-file-input
          v-model="files"
          label="Selecionar Fotos"
          variant="outlined"
          multiple
          accept="image/*"
          prepend-icon="mdi-camera"
          counter
          :loading="processing"
          :disabled="processing"
          show-size
        >
          <template v-slot:selection="{ fileName }">
            <v-chip size="small" label color="primary" class="mr-1">
              {{ fileName }}
            </v-chip>
          </template>
        </v-file-input>

        <v-divider v-if="results.length > 0" class="my-4" />

        <div v-if="processing" class="text-center py-4">
          <v-progress-linear indeterminate color="primary" class="mb-2" />
          <p class="text-caption">Processando fotos: {{ currentProgress }} de {{ files.length }}</p>
        </div>

        <v-list v-if="results.length > 0" max-height="300" class="overflow-y-auto">
          <v-list-item v-for="(res, idx) in results" :key="idx" :color="res.success ? 'success' : 'error'">
            <template v-slot:prepend>
              <v-icon :color="res.success ? 'success' : 'error'">
                {{ res.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
            </template>
            <v-list-item-title>{{ res.filename }}</v-list-item-title>
            <v-list-item-subtitle>{{ res.message }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false" :disabled="processing">Fechar</v-btn>
        <v-btn
          color="senai-red"
          @click="startUpload"
          :loading="processing"
          :disabled="!files || files.length === 0"
        >
          Iniciar Upload
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as carometroService from '@/services/carometro.services'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'completed'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const files = ref([])
const processing = ref(false)
const currentProgress = ref(0)
const results = ref([])

const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Compress image to avoid connection reset issues
const compressImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
  })
}

const startUpload = async () => {
  if (!files.value || files.value.length === 0) return

  processing.value = true
  results.value = []
  currentProgress.value = 0

  try {
    const allStudents = await carometroService.getStudents()

    for (const file of files.value) {
      currentProgress.value++
      const filename = file.name
      const matricula = filename.split('.')[0].trim()

      try {
        const student = allStudents.find(s =>
          String(s.registration_number || s.matricula || '').trim() === matricula
        )

        if (!student) {
          results.value.unshift({
            filename,
            success: false,
            message: `Aluno com matrícula ${matricula} não encontrado.`
          })
          continue
        }

        let base64 = await readFileAsBase64(file)

        // Compress if possible
        try {
          base64 = await compressImage(base64)
        } catch (e) {
          console.warn('Falha ao comprimir imagem, enviando original:', e)
        }

        await carometroService.updateStudent(student.id, {
          photo_url: base64
        })

        results.value.unshift({
          filename,
          success: true,
          message: `Foto enviada com sucesso para ${student.name || student.nome}.`
        })
      } catch (err) {
        results.value.unshift({
          filename,
          success: false,
          message: `Erro: ${err.message}`
        })
      }
    }

    files.value = []
    emit('completed')
  } catch (err) {
    console.error('Erro no upload em lote:', err)
    alert('Erro ao processar lote de fotos')
  } finally {
    processing.value = false
  }
}
</script>
