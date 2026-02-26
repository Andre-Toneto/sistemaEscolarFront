<template>
  <v-row dense>
    <!-- Foto -->
    <v-col cols="12" :sm="isAdmin ? 3 : 4" class="d-flex flex-column align-center">
      <div class="position-relative">
        <v-img v-if="pessoa.photo_url || pessoa.foto" :src="pessoa.photo_url || pessoa.foto" height="240" width="230" rounded="lg" cover class="elevation-6">
          <template #error>
            <v-sheet height="240" width="180" rounded="lg" class="elevation-6 d-flex align-center justify-center">
              <v-icon size="80" color="grey-lighten-2">mdi-account</v-icon>
            </v-sheet>
          </template>
        </v-img>
        <v-sheet v-else height="240" width="180" rounded="lg" class="elevation-6 d-flex align-center justify-center">
          <v-icon size="80" color="grey-lighten-2">mdi-account</v-icon>
        </v-sheet>

        <!-- Botão de Upload Individual -->
        <v-btn
          v-if="isAdmin"
          icon="mdi-camera"
          color="senai-red"
          size="small"
          class="position-absolute"
          style="bottom: -10px; right: 35px; z-index: 2;"
          @click="triggerUpload"
          :loading="uploading"
          title="Alterar foto"
        />

        <!-- Botão de Remover Foto -->
        <v-btn
          v-if="isAdmin && (pessoa.photo_url || pessoa.foto)"
          icon="mdi-trash-can"
          color="error"
          size="small"
          class="position-absolute"
          style="bottom: -10px; right: -10px; z-index: 2;"
          @click="removePhoto"
          :loading="uploading"
          title="Remover foto"
        />

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="onFileSelected"
        />
      </div>
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
    <v-col v-if="isAdmin" cols="12" :sm="isAdmin ? 3 : 12">
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

    <!-- Pessoal -->
    <v-col v-if="isAdmin" cols="12" :sm="isAdmin ? 5 : 12">
      <v-card elevation="4" rounded="xl" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon color="info" class="mr-2">mdi-account</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Pessoal</span>
          </div>
          <v-divider class="mb-2" />
          <v-list density="compact">
            
            <v-list-item title="Cargo" :subtitle="safeValue(pessoa.position)" />
            <v-list-item title="Pai" :subtitle="safeValue(pessoa.father_name)" />
            <v-list-item title="Mãe" :subtitle="safeValue(pessoa.mother_name)" />
            <v-list-item title="Endereço" :subtitle="safeValue(pessoa.address + ' - ' + pessoa.neighborhood)" />
            <v-list-item title="Cidade" :subtitle="safeValue(pessoa.city + ' - ' + pessoa.postal_code)" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Ocorrências -->
    <v-col cols="12" :sm="isAdmin ? 7 : 12">
      <PessoaOccurrences
        :studentId="pessoa?.id"
        :isAdmin="isAdmin"
        @export-pdf="$emit('export-pdf')"
        @updated="$emit('ocorrencia-atualizada')"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import { safeValue, formatData } from '@/utils/exportUtils'
import * as carometroService from '@/services/carometro.services'
import PessoaOccurrences from './PessoaOccurrences.vue'

const props = defineProps({
  pessoa: Object,
  cursoNome: String,
  turmaNome: String,
  isAdmin: Boolean
})

const emit = defineEmits(['copy', 'aluno-atualizado', 'export-pdf', 'ocorrencia-atualizada'])

const fileInput = ref(null)
const uploading = ref(false)

const triggerUpload = () => {
  fileInput.value?.click()
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

const removePhoto = async () => {
  if (!confirm('Deseja realmente remover a foto do aluno?')) return

  uploading.value = true
  try {
    const updated = await carometroService.updateStudent(props.pessoa.id, {
      photo_url: null
    })
    emit('aluno-atualizado', updated)
  } catch (err) {
    console.error('Falha ao remover foto:', err)
    alert('Erro ao remover imagem')
  } finally {
    uploading.value = false
  }
}

const onFileSelected = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const reader = new FileReader()
    reader.onload = async (event) => {
      let base64 = event.target.result

      // Compress image
      try {
        base64 = await compressImage(base64)
      } catch (e) {
        console.warn('Falha ao comprimir imagem, enviando original:', e)
      }

      // Atualizar no banco via service
      const updated = await carometroService.updateStudent(props.pessoa.id, {
        photo_url: base64
      })

      // Emitir evento para atualizar o estado local
      emit('aluno-atualizado', updated)
      uploading.value = false
    }
    reader.readAsDataURL(file)
  } catch (err) {
    console.error('Falha ao subir foto:', err)
    uploading.value = false
    alert('Erro ao carregar imagem')
  }
}

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
