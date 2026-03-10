<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card rounded="lg">
      <v-toolbar color="pink-lighten-1" dark>
        <v-toolbar-title class="text-h6">
          <v-icon start>mdi-cake-variant</v-icon>
          Aniversariantes do Mês
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-0">
        <v-list lines="two">
          <template v-if="loading">
            <v-list-item v-for="i in 3" :key="i">
              <v-list-item-title><v-skeleton-loader type="text" /></v-list-item-title>
            </v-list-item>
          </template>
          <template v-else-if="birthdays.length === 0">
            <v-list-item class="text-center pa-8">
              <v-list-item-title class="text-grey">Nenhum aniversariante este mês</v-list-item-title>
            </v-list-item>
          </template>
          <template v-else>
            <v-list-item v-for="person in birthdays" :key="person.id">
              <template v-slot:prepend>
                <v-avatar color="pink-lighten-4">
                  <span class="text-pink-darken-2 font-weight-bold">
                    {{ person.name.charAt(0) }}
                  </span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{ person.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(person.birthDate) }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-icon v-if="isToday(person.birthDate)" color="pink">mdi-party-popper</v-icon>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const authStore = useAuthStore()
const birthdays = ref([])
const loading = ref(false)

const fetchBirthdays = async () => {
  loading.value = true
  try {
    birthdays.value = await authStore.getBirthdays()
  } catch (error) {
    console.error("Erro ao buscar aniversariantes:", error)
  } finally {
    loading.value = false
  }
}

watch(isOpen, (val) => {
  if (val) {
    fetchBirthdays()
  }
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long'
  })
}

const isToday = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  return date.getUTCDate() === today.getDate() && date.getUTCMonth() === today.getMonth()
}
</script>
