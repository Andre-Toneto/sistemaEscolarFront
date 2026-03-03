<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="mb-4 referral-card"
    :class="borderClass"
  >
    <v-card-text class="pa-4">
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <h3 class="text-h6 font-weight-bold mb-0">{{ item.student_name }}</h3>
          <div v-if="item.course_name || item.class_name" class="text-caption text-medium-emphasis mb-1">
            <span v-if="item.course_name">{{ item.course_name }}</span>
            <span v-if="item.course_name && item.class_name"> • </span>
            <span v-if="item.class_name">{{ item.class_name }}</span>
          </div>
          <div class="text-subtitle-2 text-senai-red font-weight-medium">{{ item.reason }}</div>
        </div>
        <v-chip :color="statusColor" size="small" variant="flat" class="text-uppercase font-weight-bold">
          {{ item.status }}
        </v-chip>
      </div>

      <p class="text-body-2 text-truncate-3 mb-3">{{ item.description }}</p>

      <v-divider class="mb-3" />

      <div class="d-flex justify-space-between align-center flex-wrap ga-2">
        <div class="d-flex align-center ga-3 flex-wrap">
          <div class="text-caption text-medium-emphasis d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-account-edit</v-icon>
            {{ item.created_by_name }}
          </div>
          <div class="text-caption text-medium-emphasis d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
            {{ formatDate(item.created_at) }}
          </div>
          <div v-if="item.assigned_to_name" class="text-caption text-success d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-account-check</v-icon>
            Atendido por: {{ item.assigned_to_name }}
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn
            v-if="isSecretaria && item.status === 'aberto'"
            color="info"
            variant="flat"
            size="small"
            rounded="pill"
            @click="$emit('attend', item)"
          >
            <v-icon start size="18">mdi-account-plus</v-icon>
            Atender
          </v-btn>

          <v-btn
            v-if="canFinalize"
            color="success"
            variant="flat"
            size="small"
            rounded="pill"
            @click="$emit('finalize', item)"
          >
            <v-icon start size="18">mdi-check-all</v-icon>
            Finalizar
          </v-btn>

          <v-btn color="senai-red" variant="tonal" size="small" rounded="pill" @click="$emit('view', item)">
            <v-icon start size="18">mdi-eye</v-icon>
            Detalhes
            <v-badge v-if="item.student_referral_comments?.length" color="senai-red" :content="item.student_referral_comments.length" inline />
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  user: { type: Object, required: true },
  isSecretaria: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})

defineEmits(['attend', 'finalize', 'view'])

const statusColor = computed(() => {
  if (props.item.status === 'aberto') return 'info'
  if (props.item.status === 'em andamento') return 'warning'
  return 'success'
})

const borderClass = computed(() => {
  if (props.item.status === 'finalizado') return 'border-l-4-success'
  if (props.item.status === 'em andamento') return 'border-l-4-warning'
  return 'border-l-4-info'
})

const canFinalize = computed(() => {
  if (props.item.status === 'finalizado') return false
  if (props.isAdmin) return true
  if (props.item.created_by_id === props.user.id) return true
  if (props.item.assigned_to_id === props.user.id) return true
  return false
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.referral-card {
  transition: transform 0.2s;
}

.referral-card:hover {
  transform: translateY(-2px);
}

.border-l-4-info { border-left: 4px solid #2196F3 !important; }
.border-l-4-warning { border-left: 4px solid #FB8C00 !important; }
.border-l-4-success { border-left: 4px solid #4CAF50 !important; }

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-senai-red {
  color: #ED1C24 !important;
}
</style>
