<template>
  <v-card elevation="4" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <span>Gerenciamento de Alunos</span>
      <div class="ga-2 d-flex">
        <v-btn color="senai-navy" size="small" @click="emit('open-import')">Importar TXT</v-btn>
        <v-btn color="senai-red" size="small" @click="openModal()" :disabled="store.classes.length === 0">Novo Aluno</v-btn>
      </div>
    </v-card-title>
    <v-divider />
    
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-select
            v-model="filterClass"
            :items="store.classes"
            item-title="class_name"
            item-value="id"
            label="Filtrar por Turma"
            variant="outlined"
            density="comfortable"
            clearable
            @update:model-value="fetchStudents"
          />
        </v-col>
      </v-row>

      <v-table v-if="students.length > 0">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nome</th>
            <th>Turma</th>
            <th>CPF</th>
            <th>E-mail</th>
            <th>Cargo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id">
            <td>{{ student.registration_number || student.matricula || '---' }}</td>
            <td>{{ student.name || student.nome || '---' }}</td>
            <td>{{ store.getClassName(student.class_id || student.turma_id) }}</td>
            <td>{{ student.cpf }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.position || student.cargo }}</td>
            <td>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openModal(student)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(student)"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else class="text-center py-8 text-grey">
        Nenhum aluno encontrado para os filtros selecionados.
      </div>
    </v-card-text>

    <!-- Student Modal -->
    <v-dialog v-model="modal" max-width="700">
      <v-card rounded="lg">
        <v-card-title>{{ editing ? 'Editar Aluno' : 'Novo Aluno' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.course_id"
                :items="store.courses"
                item-title="name"
                item-value="id"
                label="Curso"
                variant="outlined"
                @update:model-value="onCourseChange"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.class_id"
                :items="filteredClasses"
                item-title="class_name"
                item-value="id"
                label="Turma"
                variant="outlined"
                :disabled="!form.course_id"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.registration_number" label="Matrícula" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Nome Completo" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.cpf" label="CPF" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.birth_date" label="Data de Nascimento" type="date" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.rg" label="RG" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="E-mail" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.mobile_phone" label="Celular" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.phone" label="Telefone" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.position" label="Cargo/Função" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.company" label="Empresa" variant="outlined" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Endereço" variant="outlined" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.neighborhood" label="Bairro" variant="outlined" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.city" label="Cidade" variant="outlined" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.postal_code" label="CEP" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.mother_name" label="Nome da Mãe" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.father_name" label="Nome do Pai" variant="outlined" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="modal = false">Cancelar</v-btn>
          <v-btn color="senai-red" @click="save" :loading="loading">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCarometroStore } from '@/store/carometro'
import * as carometroService from '@/services/carometro.services'

const store = useCarometroStore()
const students = ref([])
const filterClass = ref(null)
const modal = ref(false)
const editing = ref(null)
const loading = ref(false)

const form = ref({
  course_id: '',
  class_id: '',
  registration_number: '',
  name: '',
  cpf: '',
  birth_date: '',
  email: '',
  mobile_phone: '',
  phone: '',
  address: '',
  neighborhood: '',
  city: '',
  postal_code: '',
  rg: '',
  position: '',
  mother_name: '',
  father_name: '',
  company: ''
})

const emit = defineEmits(['open-import', 'updated'])

const filteredClasses = computed(() => {
  if (!form.value.course_id) return []
  return store.getClassesByCourseId(form.value.course_id)
})

const fetchStudents = async () => {
  loading.value = true
  try {
    students.value = await carometroService.getStudents(filterClass.value)
  } catch (err) {
    console.error('Error fetching students:', err)
  } finally {
    loading.value = false
  }
}

const onCourseChange = () => {
  form.value.class_id = ''
}

const openModal = (student = null) => {
  editing.value = student
  if (student) {
    form.value = {
      ...student,
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : ''
    }
  } else {
    form.value = {
      course_id: '',
      class_id: '',
      registration_number: '',
      name: '',
      cpf: '',
      birth_date: '',
      email: '',
      mobile_phone: '',
      phone: '',
      address: '',
      neighborhood: '',
      city: '',
      postal_code: '',
      rg: '',
      position: '',
      mother_name: '',
      father_name: '',
      company: ''
    }
  }
  modal.value = true
}

const save = async () => {
  loading.value = true
  try {
    const payload = { ...form.value }
    if (payload.birth_date) payload.birth_date = new Date(payload.birth_date).toISOString()

    // Clean up empty strings to null for unique fields
    if (!payload.registration_number?.trim()) payload.registration_number = null
    if (!payload.cpf?.trim()) payload.cpf = null

    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string' && payload[key].trim() === '') {
        payload[key] = null
      }
    })

    if (editing.value) {
      await carometroService.updateStudent(editing.value.id, payload)
    } else {
      await carometroService.createStudent(payload)
    }
    await fetchStudents()
    modal.value = false
    emit('updated')
  } catch (err) {
    console.error('Error saving student:', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (student) => {
  if (!confirm(`Excluir aluno ${student.name}?`)) return
  try {
    await carometroService.deleteStudent(student.id)
    await fetchStudents()
    emit('updated')
  } catch (err) {
    console.error('Error deleting student:', err)
  }
}

onMounted(() => {
  fetchStudents()
})

defineExpose({
  fetchStudents
})
</script>
