<template>
  <v-card elevation="4" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <span>Gerenciamento de Salas</span>
      <v-btn color="senai-red" size="small" @click="openModal()" prepend-icon="mdi-plus">Nova Sala</v-btn>
    </v-card-title>
    <v-divider />
    
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Pesquisar sala..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        class="mb-4"
        hide-details
        clearable
      />

      <v-table v-if="filteredClassrooms.length > 0">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Capacidade</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in filteredClassrooms" :key="room.id">
            <td class="font-weight-bold">{{ room.name }}</td>
            <td>{{ room.capacity || 'N/A' }}</td>
            <td>{{ room.type || 'Geral' }}</td>
            <td>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openModal(room)" title="Editar"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(room)" title="Excluir"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else class="text-center py-8 text-grey">
        Nenhuma sala encontrada.
      </div>
    </v-card-text>

    <!-- Classroom Modal -->
    <v-dialog v-model="modal" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="bg-senai-navy text-white">{{ editing ? 'Editar Sala' : 'Nova Sala' }}</v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="formRef">
            <v-text-field v-model="form.name" label="Nome da Sala" variant="outlined" placeholder="Ex: Sala A10" />
            <v-text-field v-model.number="form.capacity" type="number" label="Capacidade" variant="outlined" />
            <v-text-field v-model="form.type" label="Tipo / Descrição" variant="outlined" placeholder="Ex: Laboratório de Informática" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="modal = false">Cancelar</v-btn>
          <v-btn color="senai-red" @click="save" :loading="loading">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMapaSalaStore } from '@/store/mapaSala'

const store = useMapaSalaStore()
const search = ref('')
const modal = ref(false)
const editing = ref(null)
const loading = ref(false)

const form = ref({
  name: '',
  capacity: null,
  type: ''
})

const filteredClassrooms = computed(() => {
  if (!search.value) return store.classrooms
  const s = search.value.toLowerCase().trim()
  return store.classrooms.filter(r => 
    r.name.toLowerCase().includes(s) || 
    (r.type && r.type.toLowerCase().includes(s))
  )
})

const openModal = (room = null) => {
  editing.value = room
  if (room) {
    form.value = { ...room }
  } else {
    form.value = { name: '', capacity: null, type: '' }
  }
  modal.value = true
}

const save = async () => {
  if (!form.value.name.trim()) return
  loading.value = true
  try {
    if (editing.value) {
      await store.updateClassroom(editing.value.id, form.value)
    } else {
      await store.createClassroom(form.value)
    }
    modal.value = false
  } catch (err) {
    console.error('Error saving classroom:', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (room) => {
  if (!confirm(`Deseja realmente excluir a sala ${room.name}? Todas as reservas desta sala serão removidas.`)) return
  try {
    await store.deleteClassroom(room.id)
  } catch (err) {
    console.error('Error deleting classroom:', err)
  }
}

onMounted(() => {
  store.fetchData()
})
</script>
