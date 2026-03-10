<template>
  <v-card rounded="xl" elevation="4">
    <v-card-title class="pa-4 bg-primary text-white">
      Lista de Usuários
    </v-card-title>
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
          <td>
            <v-chip size="small" :color="getRoleColor(user.role)">
              {{ user.role }}
            </v-chip>
            <div v-if="user.sub_role" class="text-caption text-grey mt-1">
              {{ formatSubRole(user.sub_role) }}
            </div>
          </td>
          <td>
            <v-btn icon color="blue" variant="text" size="small" @click="$emit('edit', user)" title="Editar">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" variant="text" size="small" @click="$emit('delete', user.id)" title="Excluir">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
defineProps({
  users: Array
})

defineEmits(['edit', 'delete'])

const getRoleColor = (role) => {
  const m = {
    'admin': 'error',
    'fic': 'success',
    'regular': 'info',
    'secretaria': 'warning'
  }
  return m[role?.toLowerCase()] || 'grey'
}

const formatSubRole = (subRole) => {
  const m = {
    'admin_geral': 'Geral',
    'admin_secretaria': 'Secretaria',
    'admin_pedagogico': 'Pedagógico',
    'admin_fic': 'FIC'
  }
  return m[subRole] || subRole
}
</script>
