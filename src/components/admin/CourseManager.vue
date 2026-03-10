<template>
  <v-card elevation="4" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <span>Cursos</span>
      <v-btn color="senai-red" size="small" @click="openModal()">Novo Curso</v-btn>
    </v-card-title>
    <v-divider />
    <v-list density="comfortable">
      <v-list-item v-for="course in store.courses" :key="course.id" :title="course.name">
        <template v-slot:prepend>
          <v-avatar :color="course.color || 'grey'" size="16" class="mr-4"></v-avatar>
        </template>
        <template v-slot:append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openModal(course)"></v-btn>
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(course)"></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <!-- Modal -->
    <v-dialog v-model="modal" max-width="500">
      <v-card rounded="lg">
        <v-card-title>{{ editing ? 'Editar Curso' : 'Novo Curso' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Nome do Curso" variant="outlined" />
          <v-select
            v-model="form.show_carometer"
            :items="[{ title: 'Sim', value: 1 }, { title: 'Não', value: 0 }]"
            label="Exibir no Carômetro?"
            variant="outlined"
          />
          <v-color-picker v-model="form.color" hide-inputs class="mx-auto" />
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
const form = reactive({ name: '', color: '#C1272C', show_carometer: 1 })

const emit = defineEmits(['updated'])

const openModal = (course = null) => {
  editing.value = course
  if (course) {
    Object.assign(form, { name: course.name, color: course.color || '#C1272C', show_carometer: course.show_carometer ?? 1 })
  } else {
    Object.assign(form, { name: '', color: '#C1272C', show_carometer: 1 })
  }
  modal.value = true
}

const save = async () => {
  loading.value = true
  try {
    if (editing.value) {
      await carometroService.updateCourse(editing.value.id, { ...form })
    } else {
      await carometroService.createCourse({ ...form })
    }
    await store.fetchCourses()
    modal.value = false
    emit('updated')
  } catch (err) {
    console.error('Error saving course:', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (course) => {
  if (!confirm(`Excluir curso ${course.name}? Isso pode excluir turmas e alunos vinculados!`)) return
  loading.value = true
  try {
    await carometroService.deleteCourse(course.id)
    await store.fetchCourses()
    emit('updated')
  } catch (err) {
    console.error('Error deleting course:', err)
  } finally {
    loading.value = false
  }
}
</script>
