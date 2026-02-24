<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card rounded="lg">
      <v-card-title>Importar Alunos (TXT)</v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          Selecione o destino e o arquivo. O sistema usará os dados do arquivo para preencher nome, matrícula e CPF.
        </v-alert>

        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.course_id"
              :items="store.courses"
              item-title="name"
              item-value="id"
              label="Curso de Destino"
              variant="outlined"
              density="comfortable"
              @update:model-value="form.class_id = ''"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.class_id"
              :items="filteredClasses"
              item-title="class_name"
              item-value="id"
              label="Turma de Destino"
              variant="outlined"
              density="comfortable"
              :disabled="!form.course_id"
            />
          </v-col>
        </v-row>

        <v-file-input
          v-model="importFile"
          label="Selecione o arquivo TXT"
          variant="outlined"
          accept=".txt,.csv,.tsv"
          prepend-icon="mdi-file-document"
          :disabled="!form.class_id"
        />

        <v-alert v-if="results" :type="results.error ? 'error' : 'success'" variant="tonal" class="mt-4">
          <div v-html="results.message"></div>
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">Fechar</v-btn>
        <v-btn color="senai-navy" @click="handleImport" :loading="loading" :disabled="!importFile || !form.class_id">Importar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useCarometroStore } from '@/store/carometro'
import * as carometroService from '@/services/carometro.services'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'imported'])

const store = useCarometroStore()
const loading = ref(false)
const importFile = ref(null)
const results = ref(null)
const form = reactive({ course_id: '', class_id: '' })

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filteredClasses = computed(() => {
  if (!form.course_id) return []
  return store.getClassesByCourseId(form.course_id)
})

const handleImport = async () => {
  if (!importFile.value || !form.class_id) return
  loading.value = true
  results.value = null

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target.result
        const lines = content.split('\n').map(l => l.trim()).filter(l => l)
        if (lines.length < 2) throw new Error('Arquivo sem dados')

        // Tenta detectar o separador (tab ou ponto e vírgula)
        let separator = '\t'
        if (!lines[0].includes('\t') && lines[0].includes(';')) {
          separator = ';'
        }

        const headers = lines[0].split(separator).map(h => h.trim().toLowerCase())
        const data = lines.slice(1).map(line => {
          const values = line.split(separator)
          const obj = {}
          headers.forEach((h, i) => obj[h] = values[i]?.trim())
          return obj
        })

        let imported = 0
        let errors = 0
        const total = data.length
        const errorList = []

        const getVal = (row, variants) => {
          for (const v of variants) {
            if (row[v.toLowerCase()]) return row[v.toLowerCase()]
          }
          return null
        }

        const parseDate = (str) => {
          if (!str) return null
          const parts = str.split('/')
          if (parts.length === 3) {
            const d = new Date(parts[2], parts[1] - 1, parts[0])
            return isNaN(d.getTime()) ? null : d.toISOString()
          }
          const d = new Date(str)
          return isNaN(d.getTime()) ? null : d.toISOString()
        }

        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          try {
            if (i % 5 === 0 || i === total - 1) {
              results.value = {
                message: `Processando: ${i + 1} de ${total}...`,
                error: false
              }
            }

            const regNum = getVal(row, ['matricula', 'matrícula', 'nº de matrícula', 'nº matrícula', 'registration_number']) || ''
            const cpfNum = getVal(row, ['cpf']) || ''

            const studentData = {
              name: getVal(row, ['nome', 'nome completo', 'name']) || 'Sem Nome',
              registration_number: regNum.trim() || null,
              cpf: cpfNum.trim() || null,
              course_id: form.course_id,
              class_id: form.class_id,
              birth_date: parseDate(getVal(row, ['data de nascimento', 'nascimento', 'data nascimento', 'birth_date', 'data_nascimento'])),
              email: getVal(row, ['email', 'e-mail']) || null,
              mobile_phone: getVal(row, ['celular', 'mobile', 'mobile_phone']) || null,
              phone: getVal(row, ['telefone', 'phone', 'fone']) || null,
              address: getVal(row, ['endereco', 'endereo', 'endereço', 'address', 'logradouro']) || null,
              neighborhood: getVal(row, ['bairro', 'neighborhood', 'distrito']) || null,
              city: getVal(row, ['cidade', 'city', 'municipio', 'município']) || null,
              postal_code: getVal(row, ['cep', 'postal_code', 'zip code', 'zip_code']) || null,
              rg: getVal(row, ['rg', 'identidade']) || null,
              position: getVal(row, ['cargo', 'position', 'função', 'funcao']) || null,
              mother_name: getVal(row, ['mãe', 'mae', 'nome da mãe', 'mother_name', 'mother']) || null,
              father_name: getVal(row, ['pai', 'nome do pai', 'father_name', 'father']) || null,
              company: getVal(row, ['empresa', 'company', 'unidade']) || null
            }

            await carometroService.createStudent(studentData)
            imported++
          } catch (err) {
            errors++
            const studentName = row['nome'] || `Linha ${i + 2}`
            const errorMsg = err.response?.data?.message || err.message
            errorList.push(`- ${studentName}: ${errorMsg}`)
          }
        }

        results.value = {
          message: `<b>Importação concluída!</b><br>${imported} alunos importados.<br>${errors} erros encontrados.${errors > 0 ? '<br><br>Erros:<br>' + errorList.join('<br>') : ''}`,
          error: errors > 0
        }
        emit('imported')
      } catch (err) {
        results.value = { message: 'Erro ao processar arquivo: ' + err.message, error: true }
      }
    }
    reader.readAsText(importFile.value, 'ISO-8859-1')
  } catch (e) {
    results.value = { message: 'Erro na importação', error: true }
  } finally {
    loading.value = false
  }
}
</script>
