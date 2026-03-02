<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4 text-senai-red font-weight-bold">Gerenciamento de Usuários</h1>
      </v-col>
    </v-row>

    <UserForm
      ref="userFormRef"
      :editingId="editingId"
      :initialForm="currentForm"
      :loading="loading"
      @save="handleSave"
      @cancel="cancelEdit"
    />

    <UserTable
      :users="store.users"
      @edit="editUser"
      @delete="deleteUser"
    />

    <v-snackbar v-model="snack.show" :color="snack.color">
      {{ snack.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useUsersStore } from '@/store/users'

// Subcomponents
import UserForm from '@/components/users/UserForm.vue'
import UserTable from '@/components/users/UserTable.vue'

const store = useUsersStore()
const editingId = ref(null)
const currentForm = ref(null)
const loading = ref(false)
const snack = reactive({ show: false, text: '', color: 'success' })

const userFormRef = ref(null)

const showSnack = (text, color = 'success') => {
  snack.text = text
  snack.color = color
  snack.show = true
}

const handleSave = async (formData) => {
  loading.value = true
  try {
    const payload = { ...formData }
    delete payload.passwordConfirm

    if (payload.birthDate) {
      // Send birthDate as YYYY-MM-DD string as backend now uses DATE column
      const [y, m, d] = payload.birthDate.split('-').map(Number)
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        // We keep it as YYYY-MM-DD to be consistent with the new DATE format in DB
        // If the backend still needs ISO, it will parse this string correctly.
        // But sending it raw is safer for date-only columns.
        payload.birthDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      } else {
        delete payload.birthDate
      }
    }

    if (editingId.value) {
      await store.updateUser(editingId.value, payload)
      showSnack("Usuário atualizado!")
    } else {
      await store.createUser(payload)
      showSnack("Usuário criado!")
    }
    cancelEdit()
  } catch (err) {
    showSnack(err.response?.data?.message || "Erro na operação", 'error')
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  editingId.value = user.id
  currentForm.value = {
    name: user.name || "",
    email: user.email || "",
    nif: user.nif || "",
    birthDate: user.birthDate ? String(user.birthDate).split("T")[0] : "",
    password: "",
    passwordConfirm: "",
    role: user.role || "regular"
  }
}

const cancelEdit = () => {
  editingId.value = null
  currentForm.value = null
  if (userFormRef.value) userFormRef.value.reset()
}

const deleteUser = async (id) => {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) return
  loading.value = true
  try {
    await store.deleteUser(id)
    showSnack("Usuário excluído")
  } catch (err) {
    showSnack("Erro ao excluir usuário", 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  store.fetchUsers()
})
</script>
