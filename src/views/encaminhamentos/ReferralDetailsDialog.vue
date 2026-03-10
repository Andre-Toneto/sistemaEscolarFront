<template>
  <v-dialog v-model="internalModel" max-width="800" scrollable>
    <v-card rounded="xl" v-if="item">
      <v-toolbar color="senai-red" density="compact">
        <v-toolbar-title class="text-body-1 font-weight-bold">Detalhes do Encaminhamento</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="internalModel = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h2 class="text-h5 font-weight-bold">{{ item.student_name }}</h2>
            <div v-if="item.course_name || item.class_name" class="text-subtitle-1 text-medium-emphasis mb-1">
              <v-icon size="18" class="mr-1">mdi-book-education</v-icon>
              {{ item.course_name || 'N/A' }}
              <span class="mx-2">•</span>
              <v-icon size="18" class="mr-1">mdi-account-group-outline</v-icon>
              {{ item.class_name || 'N/A' }}
            </div>
            <div class="text-h6 text-senai-red">{{ item.reason }}</div>
          </div>
          <v-chip :color="statusColor" variant="flat">{{ item.status }}</v-chip>
        </div>

        <v-card variant="tonal" color="grey-lighten-3" class="mb-6 rounded-lg">
          <v-card-text class="text-body-1 text-black">
            {{ item.description }}
          </v-card-text>
        </v-card>

        <v-row dense class="mb-6">
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Criado por</div>
            <div class="text-body-2 font-weight-bold">{{ item.created_by_name }}</div>
            <div class="text-caption">{{ formatDate(item.created_at) }}</div>
          </v-col>
          <v-col cols="12" sm="6" v-if="item.assigned_to_name">
            <div class="text-caption text-medium-emphasis">Responsável</div>
            <div class="text-body-2 font-weight-bold">{{ item.assigned_to_name }}</div>
            <div v-if="item.status === 'em andamento'" class="text-caption text-warning">Em atendimento...</div>
          </v-col>
          <v-col cols="12" v-if="item.status === 'finalizado'">
            <v-divider class="my-2" />
            <div class="text-caption text-medium-emphasis">Finalizado por</div>
            <div class="text-body-2 font-weight-bold">{{ item.finalized_by_name }}</div>
            <div class="text-caption">{{ formatDate(item.finalized_at) }}</div>
          </v-col>
        </v-row>

        <v-divider class="mb-4" />

        <h3 class="text-h6 mb-3 d-flex align-center">
          <v-icon class="mr-2">mdi-comment-text-multiple</v-icon>
          Comentários ({{ item.student_referral_comments?.length || 0 }})
        </h3>

        <div class="comments-section mb-4" ref="commentsBox">
          <div v-if="!item.student_referral_comments?.length" class="text-center py-4 text-medium-emphasis">
            Nenhum comentário ainda.
          </div>
          <div v-for="comment in item.student_referral_comments" :key="comment.id" class="mb-3 pa-3 rounded-lg bg-grey-lighten-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-body-2 font-weight-bold" :class="{ 'text-senai-red': comment.author_id === item.created_by_id }">
                {{ comment.author_name }}
                <v-chip v-if="comment.author_id === item.created_by_id" size="x-small" color="senai-red" variant="flat" class="ml-1">Autor</v-chip>
                <v-chip v-else-if="comment.author_id === item.assigned_to_id" size="x-small" color="success" variant="flat" class="ml-1">Secretaria</v-chip>
              </span>
              <span class="text-caption text-medium-emphasis">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="text-body-2 mb-0">{{ comment.comment }}</p>
          </div>
        </div>

        <v-form v-if="item.status !== 'finalizado'" @submit.prevent="submitComment" class="d-flex ga-2">
          <v-text-field
            v-model="commentText"
            placeholder="Escreva um comentário..."
            variant="outlined"
            density="comfortable"
            hide-details
            :disabled="commenting"
          />
          <v-btn color="senai-red" :loading="commenting" :disabled="!commentText.trim()" type="submit" icon="mdi-send" rounded="lg" />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" color="grey-darken-1" @click="internalModel = false">Fechar</v-btn>
        <v-btn v-if="canFinalize" color="success" @click="$emit('finalize', item)">Finalizar Encaminhamento</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  item: { type: Object, default: null },
  user: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  commenting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'add-comment', 'finalize'])

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const commentText = ref('')
const commentsBox = ref(null)

const statusColor = computed(() => {
  if (props.item?.status === 'aberto') return 'info'
  if (props.item?.status === 'em andamento') return 'warning'
  return 'success'
})

const canFinalize = computed(() => {
  if (!props.item || props.item.status === 'finalizado') return false
  if (props.isAdmin) return true
  if (props.item.created_by_id === props.user.id) return true
  if (props.item.assigned_to_id === props.user.id) return true
  return false
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  emit('add-comment', commentText.value)
  commentText.value = ''
}

// Auto-scroll comments to bottom
watch(() => props.item?.student_referral_comments?.length, () => {
  nextTick(() => {
    if (commentsBox.value) {
      commentsBox.value.scrollTop = commentsBox.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.comments-section {
  max-height: 300px;
  overflow-y: auto;
}

.text-senai-red {
  color: #ED1C24 !important;
}

.ga-2 { gap: 8px; }
</style>
