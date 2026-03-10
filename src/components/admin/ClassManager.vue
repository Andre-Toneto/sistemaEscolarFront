<template>
  <v-card elevation="4" rounded="xl">
    <v-card-title class="pa-4 pb-2">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center ga-4">
          <span>Turmas</span>
          <v-btn-toggle
            v-model="viewMode"
            mandatory
            density="compact"
            color="senai-red"
            rounded="lg"
          >
            <v-btn value="active" size="small">Ativas</v-btn>
            <v-btn value="archived" size="small">Arquivadas</v-btn>
          </v-btn-toggle>
        </div>
        <v-btn color="senai-red" size="small" @click="openModal()" :disabled="store.courses.length === 0">Nova Turma</v-btn>
      </div>
      
      <v-text-field
        v-model="search"
        placeholder="Pesquisar turma por nome ou curso..."
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        class="bg-grey-lighten-4 rounded-lg"
      />
    </v-card-title>
    <v-divider class="mt-2" />
    
    <v-list density="comfortable" v-if="filteredClasses.length > 0">
      <v-list-item 
        v-for="cls in filteredClasses" 
        :key="cls.id" 
        :title="cls.class_name" 
        :subtitle="store.getCourseName(cls.course_id)"
      >
        <template v-slot:append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openModal(cls)"></v-btn>
          <v-btn 
            v-if="!cls.archived" 
            icon="mdi-archive-arrow-down" 
            variant="text" 
            size="small" 
            color="warning" 
            title="Arquivar Turma"
            @click="confirmArchive(cls)"
          ></v-btn>
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(cls)"></v-btn>
        </template>
      </v-list-item>
    </v-list>
    <div v-else class="text-center py-8 text-grey">
      {{ search ? 'Nenhuma turma encontrada para esta pesquisa.' : `Nenhuma turma ${viewMode === 'active' ? 'ativa' : 'arquivada'} encontrada.` }}
    </div>

    <!-- Modal -->
    <v-dialog v-model="modal" max-width="500">
      <v-card rounded="lg">
        <v-card-title>{{ editing ? 'Editar Turma' : 'Nova Turma' }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="form.course_id"
            :items="store.courses"
            item-title="name"
            item-value="id"
            label="Curso"
            variant="outlined"
          />
          <v-text-field v-model="form.class_name" label="Nome da Turma" variant="outlined" />
          <v-text-field v-model.number="form.number_students" type="number" label="Quantidade de Alunos" variant="outlined" />
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
import { ref, reactive, computed } from 'vue'
import { useCarometroStore } from '@/store/carometro'
import * as carometroService from '@/services/carometro.services'

const store = useCarometroStore()
const modal = ref(false)
const editing = ref(null)
const loading = ref(false)
const viewMode = ref('active')
const search = ref('')
const form = reactive({ class_name: '', course_id: '', number_students: 0 })

const filteredClasses = computed(() => {
  const isArchivedRequested = viewMode.value === 'archived' ? 1 : 0
  let classes = store.classes.filter(c => (c.archived || 0) === isArchivedRequested)
  
  if (search.value) {
    const s = search.value.toLowerCase().trim()
    classes = classes.filter(c => {
      const className = c.class_name?.toLowerCase() || ''
      const courseName = store.getCourseName(c.course_id).toLowerCase()
      return className.includes(s) || courseName.includes(s)
    })
  }
  
  return classes
})

const emit = defineEmits(['updated'])

const openModal = (cls = null) => {
  editing.value = cls
  if (cls) {
    Object.assign(form, { class_name: cls.class_name, course_id: cls.course_id, number_students: cls.number_students || 0 })
  } else {
    Object.assign(form, { class_name: '', course_id: store.courses[0]?.id || '', number_students: 0 })
  }
  modal.value = true
}

const save = async () => {
  loading.value = true
  try {
    if (editing.value) {
      await carometroService.updateClass(editing.value.id, { ...form })
    } else {
      await carometroService.createClass({ ...form })
    }
    await store.fetchClasses()
    modal.value = false
    emit('updated')
  } catch (err) {
    console.error('Error saving class:', err)
  } finally {
    loading.value = false
  }
}

const confirmArchive = async (cls) => {
  if (!confirm(`Deseja arquivar a turma ${cls.class_name}? Ela será renomeada com a data atual (MM/AAAA) para permitir a criação de uma nova turma com o mesmo nome.`)) return
  loading.value = true
  try {
    await carometroService.archiveClass(cls.id)
    await store.fetchClasses()
    emit('updated')
  } catch (err) {
    console.error('Error archiving class:', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (cls) => {
  if (!confirm(`Excluir turma ${cls.class_name}? ISSO IRÁ EXCLUIR TODOS OS ALUNOS desta turma!`)) return
  loading.value = true
  try {
    await carometroService.deleteClass(cls.id)
    await store.fetchClasses()
    emit('updated')
  } catch (err) {
    console.error('Error deleting class:', err)
  } finally {
    loading.value = false
  }
}
</script>
