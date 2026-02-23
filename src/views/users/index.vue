<template>
  <v-container>

    <v-card class="pa-4 mb-4">
      <v-card-title>
        {{ editingId ? "Editar Usuário" : "Novo Usuário" }}
      </v-card-title>

      <v-row>
            <v-col cols="12" sm="6">
                <v-text-field 
                v-model="form.name" 
                label="Nome" 
                :rules="nomeRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field 
                v-model="form.email" 
                label="Email" 
                :rules="emailRules" />
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field 
                v-model="form.nif" 
                label="NIF" 
                :rules="nifRules" />
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field 
                v-model="form.password" 
                label="Senha" 
                type="password" 
                :rules="senhaRules" />
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field 
                v-model="form.passwordConfirm" 
                label="Confirmar Senha" 
                type="password" 
                :rules="confirmarSenhaRules" />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field 
                v-model="form.bithdate" 
                label="Data de Nascimento" 
                :rules="dataNascimentoRules"
                type="date" />
            </v-col>
            <v-col cols="12" sm="6">
                <v-select
                v-model="form.role"
                :items="['admin', 'fic', 'regular', 'secretaria']"
                label="Role"
                />
            </v-col>
      </v-row>


      <v-btn
        color="primary"
        class="mr-2"
        @click="editingId ? updateUser() : createUser()"
      >
        {{ editingId ? "Atualizar" : "Criar" }}
      </v-btn>

      <v-btn
        v-if="editingId"
        color="grey"
        @click="cancelEdit"
      >
        Cancelar
      </v-btn>

    </v-card>

    <v-card>
      <v-card-title>Lista de Usuários</v-card-title>

      <v-table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>

              <v-btn
                color="blue"
                size="small"
                class="mr-2"
                @click="editUser(user)"
              >
                Editar
              </v-btn>

              <v-btn
                color="red"
                size="small"
                @click="deleteUser(user.id)"
              >
                Excluir
              </v-btn>

            </td>
          </tr>
        </tbody>
      </v-table>

    </v-card>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { api } from "@/api/axios"

const users = ref([])
const editingId = ref(null)

const nifRules = [v => !!v || 'Número de registro é obrigatório']
const senhaRules = [v => !!v || 'Senha é obrigatória']
const senhaTempRules = [v => !!v || 'Senha temporária é obrigatória', v => (v && v.length >= 6) || 'Mínimo de 6 caracteres']
const nomeRules = [v => !!v || 'Nome é obrigatório']
const dataNascimentoRules = [
  v => !!v || 'Data de nascimento é obrigatória',
  v => /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/.test(v || '') || 'Use o formato DD/MM/AAAA'
]
const confirmarSenhaRules = [
  v => !!v || 'Confirmação de senha é obrigatória',
  v => v === cadastro.value.senha || 'As senhas não conferem'
]


const form = ref({
  name: "",
  email: "",
  nif: "",
  password: "",
  role: "regular"
})

function resetForm() {
  form.value = {
    name: "",
    email: "",
    nif: "",
    password: "",
    role: "regular"
  }
}

async function loadUsers() {
  const { data } = await api.get("/users")
  users.value = data
}

async function createUser() {
  try {
    await api.post("/users/register", form.value)
    alert("Usuário criado!")
    resetForm()
    loadUsers()
  } catch (err) {
    alert(err.response?.data?.message || "Erro")
  }
}

function editUser(user) {
  editingId.value = user.id

  form.value = {
    name: user.name,
    email: user.email,
    nif: user.nif,
    password: "", // senha não vem do backend
    role: user.role
  }
}

async function updateUser() {
  try {
    await api.put(`/users/${editingId.value}`, form.value)
    alert("Usuário atualizado!")
    cancelEdit()
    loadUsers()
  } catch (err) {
    alert(err.response?.data?.message || "Erro ao atualizar")
  }
}

function cancelEdit() {
  editingId.value = null
  resetForm()
}

async function deleteUser(id) {
  if (!confirm("Tem certeza?")) return
  await api.delete(`/users/${id}`)
  loadUsers()
}

onMounted(loadUsers)
</script>