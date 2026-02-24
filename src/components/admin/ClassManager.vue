<template>
  <v-card elevation="4" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <span>Turmas</span>
      <v-btn color="senai-red" size="small" @click="openModal()" :disabled="store.courses.length === 0">Nova Turma</v-btn>
    </v-card-title>
    <v-divider />
    <v-list density="comfortable">
      <v-list-item v-for="cls in store.classes" :key="cls.id" :title="cls.class_name" :subtitle="store.getCourseName(cls.course_id)">
        <template v-slot:append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openModal(cls)"></v-btn>
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(cls)"></v-btn>
        </template>
      </v-list-item>
    </v-list>

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
import { ref, reactive } from 'vue'
import { useCarometroStore } from '@/store/carometro'
import * as carometroService from '@/services/carometro.services'

const store = useCarometroStore()
const modal = ref(false)
const editing = ref(null)
const loading = ref(false)
const form = reactive({ class_name: '', course_id: '' })

const emit = defineEmits(['updated'])

const openModal = (cls = null) => {
  editing.value = cls
  if (cls) {
    Object.assign(form, { class_name: cls.class_name, course_id: cls.course_id })
  } else {
    Object.assign(form, { class_name: '', course_id: store.courses[0]?.id || '' })
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

const confirmDelete = async (cls) => {
  if (!confirm(`Excluir turma ${cls.class_name}? ISSO IRÁ EXCLUIR TODOS OS ALUNOS desta turma!`)) return
  try {
    await carometroService.deleteClass(cls.id)
    await store.fetchClasses()
    emit('updated')
  } catch (err) {
    console.error('Error deleting class:', err)
  }
}
</script>
