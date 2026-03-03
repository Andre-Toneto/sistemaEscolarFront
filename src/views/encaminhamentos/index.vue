<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="8" rounded="xl" class="pa-4 mb-4">
          <v-tabs v-model="tab" density="comfortable" color="senai-red">
            <v-tab value="aberto">
              <v-icon start>mdi-folder-open</v-icon>
              Abertos
            </v-tab>
            <v-tab value="em andamento">
              <v-icon start>mdi-progress-check</v-icon>
              Em Andamento
            </v-tab>
            <v-tab value="finalizado">
              <v-icon start>mdi-check-circle</v-icon>
              Finalizados
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Formulário de Criação ou Dashboard Secretaria -->
      <v-col cols="12" md="4">
        <template v-if="!isSecretaria">
          <v-card elevation="8" rounded="xl" class="pa-4 sticky-card">
            <v-card-title class="text-h6 text-senai-red pa-0 mb-1">Novo encaminhamento</v-card-title>
            <v-card-subtitle class="pa-0 mb-4">Registre um novo encaminhamento para a secretaria</v-card-subtitle>
            <v-card-text class="pa-0">
              <v-form ref="formRef" v-model="formValid" @submit.prevent="criarEncaminhamento">
                <v-text-field
                  v-model="form.student_name"
                  label="Nome do aluno"
                  placeholder="Aluno matriculado ou não"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-3"
                />

                <v-row dense>
                  <v-col cols="12" sm="7">
                    <v-text-field
                      v-model="form.course_name"
                      label="Curso"
                      placeholder="Ex: Técnico em Mecânica"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-book-education"
                      class="mb-3"
                    />
                  </v-col>
                  <v-col cols="12" sm="5">
                    <v-text-field
                      v-model="form.class_name"
                      label="Turma"
                      placeholder="Ex: 1MT"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-group-outline"
                      class="mb-3"
                    />
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.reason"
                  label="Motivo"
                  placeholder="Ex: Documentação pendente, Indisciplina..."
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-comment-alert"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-3"
                />

                <v-textarea
                  v-model="form.description"
                  label="Descrição detalhada"
                  placeholder="Descreva o que aconteceu ou o que é necessário..."
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-text"
                  :rows="4"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-4"
                />

                <v-btn type="submit" :loading="saving" :disabled="!formValid" color="senai-red" block rounded="lg" size="large" elevation="2">
                  <v-icon start>mdi-send</v-icon>
                  Enviar Encaminhamento
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </template>
        <template v-else>
          <v-card elevation="8" rounded="xl" class="pa-4 bg-senai-red text-white">
            <v-card-title class="text-h6">Olá, {{ user.name }}!</v-card-title>
            <v-card-text>
              <p class="mb-4 opacity-80">Gerencie aqui os atendimentos da secretaria.</p>
              
              <v-row dense>
                <v-col cols="6">
                  <v-card color="white" class="text-senai-red text-center pa-2" rounded="lg">
                    <div class="text-h4 font-weight-bold">{{ countAbertos }}</div>
                    <div class="text-caption text-uppercase">Abertos</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card color="white" class="text-senai-red text-center pa-2" rounded="lg">
                    <div class="text-h4 font-weight-bold">{{ countMeusAndamento }}</div>
                    <div class="text-caption text-uppercase">Meus Atendimentos</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
      </v-col>

      <!-- Lista de Encaminhamentos -->
      <v-col cols="12" md="8">
        <v-card elevation="8" rounded="xl" class="pa-4">
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2 pa-0 mb-4">
            <span class="text-h6 text-senai-red">
              <v-icon color="senai-red" start>{{ currentTabIcon }}</v-icon>
              {{ currentTabTitle }}
            </span>
            <div class="d-flex align-center ga-2">
              <v-text-field
                v-model="search"
                label="Buscar..."
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
                style="max-width: 250px"
                clearable
              />
              <v-btn icon color="senai-red" variant="text" @click="carregar" :loading="loading">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <div v-if="loading" class="text-center py-12">
              <v-progress-circular indeterminate color="senai-red" size="64" />
              <p class="text-medium-emphasis mt-4">Buscando encaminhamentos...</p>
            </div>

            <div v-else-if="filteredItems.length === 0" class="text-center py-12 border rounded-xl bg-grey-lighten-4">
              <v-icon size="80" color="grey-lighten-2" class="mb-2">mdi-inbox-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis">Nenhum encaminhamento nesta categoria.</p>
            </div>

            <div v-else class="referrals-list">
              <ReferralCard
                v-for="item in filteredItems"
                :key="item.id"
                :item="item"
                :user="user"
                :is-secretaria="isSecretaria"
                :is-admin="isAdmin"
                @attend="atenderEncaminhamento"
                @finalize="abrirFinalizar"
                @view="abrirDetalhes"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de Detalhes e Comentários -->
    <ReferralDetailsDialog
      v-model="detailsDialog"
      :item="selectedItem"
      :user="user"
      :is-admin="isAdmin"
      :commenting="commenting"
      @add-comment="enviarComentario"
      @finalize="abrirFinalizar"
    />

    <!-- Diálogo para Finalizar -->
    <v-dialog v-model="finalizeDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">Finalizar Encaminhamento</v-card-title>
        <v-card-text>
          <p class="mb-4">Deseja finalizar o encaminhamento de <strong>{{ itemToFinalize?.student_name }}</strong>?</p>
          <v-textarea
            v-model="finalizeFeedback"
            label="Comentário final (opcional)"
            placeholder="Alguma observação final sobre o encerramento?"
            variant="outlined"
            density="comfortable"
            rows="3"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="finalizeDialog = false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" :loading="saving" @click="confirmarFinalizacao">Finalizar Agora</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import * as referralService from '@/services/encaminhamentos.services'
import { getSocket } from "@/services/socket.services"
import ReferralCard from './ReferralCard.vue'
import ReferralDetailsDialog from './ReferralDetailsDialog.vue'

const route = useRoute()
const router = useRouter()
const tab = ref('aberto')
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const commenting = ref(false)

const items = ref([])
const user = ref({})
const socket = getSocket()

const formRef = ref(null)
const formValid = ref(false)
const form = ref({
  student_name: '',
  course_name: '',
  class_name: '',
  reason: '',
  description: ''
})

const detailsDialog = ref(false)
const selectedItem = ref(null)

const finalizeDialog = ref(false)
const itemToFinalize = ref(null)
const finalizeFeedback = ref('')

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const loadUser = () => {
  try {
    const userData = localStorage.getItem('user')
    user.value = userData ? JSON.parse(userData) : {}
  } catch {
    user.value = {}
  }
}

const isAdmin = computed(() => user.value.role?.toLowerCase() === 'admin')
const isSecretaria = computed(() => user.value.role?.toLowerCase() === 'secretaria')

const currentTabTitle = computed(() => {
  if (tab.value === 'aberto') return 'Encaminhamentos em Aberto'
  if (tab.value === 'em andamento') return 'Em Atendimento / Andamento'
  return 'Encaminhamentos Finalizados'
})

const currentTabIcon = computed(() => {
  if (tab.value === 'aberto') return 'mdi-folder-open'
  if (tab.value === 'em andamento') return 'mdi-progress-check'
  return 'mdi-check-circle'
})

const carregar = async () => {
  loading.value = true
  try {
    const data = await referralService.getEncaminhamentos()
    items.value = Array.isArray(data) ? data : []

    // Atualiza o item selecionado se o diálogo estiver aberto
    if (detailsDialog.value && selectedItem.value) {
      const updated = items.value.find(i => i.id === selectedItem.value.id)
      if (updated) selectedItem.value = updated
    }

    // Se houver um ID na query, abrir o diálogo
    checkReferralFromQuery()
  } catch (error) {
    console.error(error)
    showSnack('Erro ao carregar dados', 'error')
  } finally {
    loading.value = false
  }
}

const checkReferralFromQuery = () => {
  const referralId = route.query.id
  if (referralId && items.value.length > 0) {
    const found = items.value.find(i => i.id === referralId)
    if (found) {
      tab.value = found.status
      abrirDetalhes(found)

      // Limpar o ID da query para não re-abrir ao trocar de aba ou atualizar
      router.replace({ query: { ...route.query, id: undefined } })
    }
  }
}

const filteredItems = computed(() => {
  let result = items.value.filter(item => item.status === tab.value)

  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(item =>
      item.student_name.toLowerCase().includes(s) ||
      item.reason.toLowerCase().includes(s) ||
      item.description.toLowerCase().includes(s) ||
      item.created_by_name.toLowerCase().includes(s)
    )
  }

  return result
})

const countAbertos = computed(() => items.value.filter(i => i.status === 'aberto').length)
const countMeusAndamento = computed(() => items.value.filter(i => i.status === 'em andamento' && i.assigned_to_id === user.value.id).length)

const showSnack = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const criarEncaminhamento = async () => {
  if (!formValid.value) return
  saving.value = true
  try {
    await referralService.createEncaminhamento({
      ...form.value,
      created_by_name: user.value.name
    })
    form.value = {
      student_name: '',
      course_name: '',
      class_name: '',
      reason: '',
      description: ''
    }
    if (formRef.value) formRef.value.resetValidation()
    showSnack('Encaminhamento enviado com sucesso!')
    await carregar()
  } catch (error) {
    showSnack('Erro ao enviar encaminhamento', 'error')
  } finally {
    saving.value = false
  }
}

const atenderEncaminhamento = async (item) => {
  saving.value = true
  try {
    await referralService.updateEncaminhamento(item.id, {
      ...item,
      status: 'em andamento',
      assigned_to_id: user.value.id,
      assigned_to_name: user.value.name
    })
    showSnack('Atendimento iniciado!')
    tab.value = 'em andamento'
    await carregar()
  } catch (error) {
    showSnack('Erro ao iniciar atendimento', 'error')
  } finally {
    saving.value = false
  }
}

const abrirFinalizar = (item) => {
  itemToFinalize.value = item
  finalizeFeedback.value = ''
  finalizeDialog.value = true
}

const confirmarFinalizacao = async () => {
  if (!itemToFinalize.value) return
  saving.value = true
  try {
    await referralService.finalize(itemToFinalize.value.id, finalizeFeedback.value)
    finalizeDialog.value = false
    detailsDialog.value = false
    showSnack('Encaminhamento finalizado!')
    tab.value = 'finalizado'
    await carregar()
  } catch (error) {
    showSnack('Erro ao finalizar', 'error')
  } finally {
    saving.value = false
  }
}

const abrirDetalhes = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const enviarComentario = async (text) => {
  if (!text.trim() || !selectedItem.value) return
  commenting.value = true
  try {
    await referralService.addComment({
      referral_id: selectedItem.value.id,
      comment: text
    })
    await carregar()
  } catch (error) {
    showSnack('Erro ao enviar comentário', 'error')
  } finally {
    commenting.value = false
  }
}

const handleSocketUpdate = () => {
  console.log("🔄 Referral change detected via socket")
  carregar()
}

onMounted(() => {
  loadUser()
  carregar()

  if (socket) {
    socket.on('referral:changed', handleSocketUpdate)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.off('referral:changed', handleSocketUpdate)
  }
})

watch(tab, () => carregar())

watch(() => route.query.id, () => {
  checkReferralFromQuery()
})
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 20px;
}

.bg-senai-red {
  background-color: #ED1C24 !important;
}

.text-senai-red {
  color: #ED1C24 !important;
}

.ga-2 { gap: 8px; }
</style>
