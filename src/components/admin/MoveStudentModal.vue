<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card rounded="xl">
      <v-card-title class="pa-4 bg-primary text-white">
        <v-icon class="mr-2">mdi-account-switch</v-icon>
        Mover Aluno de Turma
      </v-card-title>
      <v-card-text class="pa-4">
        <p class="mb-4 text-body-1">
          Selecione a nova turma para o aluno <strong>{{ student?.name }}</strong>.
        </p>
        
        <v-select
          v-model="form.course_id"
          :items="store.courses"
          item-title="name"
          item-value="id"
          label="Curso"
          variant="outlined"
          @update:model-value="form.class_id = ''"
        />

        <v-select
          v-model="form.class_id"
          :items="filteredClasses"
          item-title="class_name"
          item-value="id"
          label="Turma"
          variant="outlined"
          :disabled="!form.course_id"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">Cancelar</v-btn>
        <v-btn color="primary" @click="handleMove" :loading="loading" :disabled="!form.class_id">Mover Aluno</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useCarometroStore } from '@/store/carometro'
import * as carometroService from '@/services/carometro.services'

const props = defineProps({
  modelValue: Boolean,
  student: Object
})

const emit = defineEmits(['update:modelValue', 'moved'])

const store = useCarometroStore()
const loading = ref(false)
const form = reactive({ course_id: '', class_id: '' })

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filteredClasses = computed(() => {
  if (!form.course_id) return []
  return store.getClassesByCourseId(form.course_id)
})

const handleMove = async () => {
  if (!form.class_id || !props.student?.id) return
  loading.value = true
  try {
    await carometroService.updateStudent(props.student.id, {
      class_id: form.class_id,
      course_id: form.course_id
    })
    isOpen.value = false
    emit('moved', { studentId: props.student.id, newClassId: form.class_id })
  } catch (err) {
    console.error('Error moving student:', err)
  } finally {
    loading.value = false
  }
}
</script>
