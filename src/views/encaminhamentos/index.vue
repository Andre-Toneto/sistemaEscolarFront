<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="8" rounded="xl" class="pa-4 mb-4">
          <v-tabs v-model="tab" density="comfortable" color="senai-red">
            <v-tab value="abertos" @click="changeTab('abertos')">
              <v-icon start>mdi-folder-open</v-icon>
              Abertos
            </v-tab>
            <v-tab value="finalizados" @click="changeTab('finalizados')">
              <v-icon start>mdi-check-circle</v-icon>
              Finalizados
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="5">
        <div v-if="!isSecretaria">
          <v-card elevation="8" rounded="xl" class="pa-4">
            <v-card-title class="text-h6 text-senai-red pa-0">Novo encaminhamento</v-card-title>
            <v-card-subtitle class="mb-2">Preencha os dados abaixo para registrar um encaminhamento</v-card-subtitle>
            <v-card-text>
              <v-form ref="formRef" v-model="formValid" @submit.prevent="criarEncaminhamento">
                <v-text-field
                  v-model="form.aluno"
                  label="Nome do aluno"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-3"
                />

                <v-row>
                  <v-col cols="12" md="5">
                    <v-select
                      v-model="form.courseType"
                      :items="courseTypes"
                      label="Tipo do curso"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-format-list-bulleted"
                      :rules="[v => !!v || 'Obrigatório']"
                    />
                  </v-col>
                  <v-col cols="12" md="7">
                    <v-text-field
                      v-model="form.cursoNome"
                      label="Nome do curso"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-book-open"
                      :rules="[v => !!v || 'Obrigatório']"
                    />
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.turma"
                  label="Turma"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-multiple"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-3"
                />

                <v-text-field
                  v-model="form.motivo"
                  label="Motivo"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-comment-alert"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-3"
                />

                <v-textarea
                  v-model="form.descricao"
                  label="Descrição"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-text"
                  :rows="4"
                  :rules="[v => !!v || 'Obrigatório']"
                  class="mb-4"
                />

                <v-btn type="submit" :loading="saving" :disabled="!formValid" color="senai-red" block rounded>
                  <v-icon start>mdi-send</v-icon>
                  Encaminhar
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </div>
        <div v-else>
          <v-card elevation="2" rounded="lg" class="pa-4">
            <v-card-title class="text-h6">Área da Secretaria</v-card-title>
            <v-card-text>
              <p class="text-body-2 text-medium-emphasis">A secretaria tem acesso a todos os encaminhamentos. </p>
              <p><strong>Pendentes:</strong> {{ counts.total }} </p>
              <div class="mt-2">
                <v-chip v-for="ct in courseTypes" :key="ct" size="small" class="ma-1">
                  {{ ct }} • {{ counts.byType[ct] || 0 }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="7">
        <v-card elevation="8" rounded="xl" class="pa-4">
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6 text-senai-red">Encaminhamentos — {{ tabLabel }}</span>
            <div class="d-flex align-center">
              <v-text-field
                v-model="termoBusca"
                label="Pesquisar..."
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="mr-4"
                style="max-width: 300px"
                clearable
              />
              <v-btn variant="text" color="senai-red" @click="carregar" :loading="loading">
                <v-icon start>mdi-refresh</v-icon>
                Atualizar
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="mb-3 d-flex align-center gap-2 flex-wrap">
              <v-chip
                v-for="ct in ['Todos', ...courseTypes]"
                :key="ct"
                :color="selectedCourseType === ct ? 'senai-red' : 'default'"
                :variant="selectedCourseType === ct ? 'flat' : 'outlined'"
                size="small"
                @click="selectedCourseType = ct"
              >
                {{ ct }} <span v-if="counts.byType && counts.byType[ct] && ct !== 'Todos'"> • {{ counts.byType[ct] }}</span>
              </v-chip>
            </div>

            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="senai-red" size="56" />
              <p class="text-medium-emphasis mt-2">Carregando...</p>
            </div>

            <div v-else-if="filteredItems.length === 0" class="text-center py-12">
              <v-icon size="80" color="grey-lighten-2" class="mb-2">mdi-inbox</v-icon>
              <p class="text-body-2 text-medium-emphasis mb-0">Nenhum encaminhamento encontrado.</p>
            </div>

            <v-list v-else lines="two" density="comfortable">
              <v-list-item v-for="e in filteredItems" :key="e.id" rounded="lg" class="mb-2" :subtitle="e.descricao">
                <template #prepend>
                  <v-avatar color="senai-light-red">
                    <v-icon color="senai-red">{{ tab === 'abertos' ? 'mdi-folder-open' : 'mdi-check-circle' }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ e.aluno }} • {{ e.courseType }} • {{ e.cursoNome }} • {{ e.turma }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div><span class="text-medium-emphasis">Motivo: </span>{{ e.motivo }}</div>
                  <div class="text-caption">
                    Criado por: {{ e.user_name || e.createdByName || 'N/A' }}
                    <span v-if="e.finalizedByName"> • Finalizado por: {{ e.finalizedByName }} em {{ e.finalizedAt ? new Date(e.finalizedAt).toLocaleString() : '' }}</span>
                    <span v-else-if="e.status === 'finalizado'"> • Finalizado</span>
                  </div>
                  <div v-if="e.response" class="mt-1"><strong>Resposta (Secretaria):</strong> {{ e.response }}</div>
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center ga-2">
                    <v-chip size="x-small" :color="tab === 'abertos' ? 'warning' : 'success'" variant="flat" class="mr-2">
                      {{ e.status }}
                    </v-chip>

                    <v-btn size="small" color="info" variant="text" @click.stop="abrirDetalhes(e)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn v-if="canEdit(e)" size="small" color="primary" variant="text" @click.stop="abrirEdicao(e)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn v-if="canEdit(e)" size="small" color="error" variant="text" @click.stop="confirmDelete(e)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>

                    <v-btn v-if="tab === 'abertos' && isSecretaria" size="small" color="success" variant="outlined" @click.stop="abrirFinalizar(e)">
                      <v-icon start size="small">mdi-check</v-icon>
                      Finalizar (Secretaria)
                    </v-btn>

                    <v-btn v-else-if="tab === 'abertos'" size="small" color="success" variant="outlined" @click.stop="finalizar(e)">
                      <v-icon start size="small">mdi-check</v-icon>
                      Finalizar
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogs remain similar but use new services -->
    <v-dialog v-model="editAberto" max-width="720">
      <v-card rounded="lg">
        <v-card-title>Editar encaminhamento</v-card-title>
        <v-card-text>
          <v-form ref="editFormRef" @submit.prevent="salvarEdicao">
            <v-text-field v-model="editForm.aluno" label="Nome do aluno" variant="outlined" class="mb-3" />
            <v-row>
              <v-col cols="12" md="5">
                <v-select v-model="editForm.courseType" :items="courseTypes" label="Tipo do curso" />
              </v-col>
              <v-col cols="12" md="7">
                <v-text-field v-model="editForm.cursoNome" label="Nome do curso" />
              </v-col>
            </v-row>
            <v-text-field v-model="editForm.turma" label="Turma" class="mb-3" />
            <v-text-field v-model="editForm.motivo" label="Motivo" class="mb-3" />
            <v-textarea v-model="editForm.descricao" label="Descrição" rows="4" class="mb-3" />
            <div class="d-flex justify-end">
              <v-btn variant="text" color="senai-red" @click="editAberto = false" :disabled="saving" class="mr-2">Cancelar</v-btn>
              <v-btn type="submit" :loading="saving" color="senai-red">Salvar</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirm" max-width="480">
      <v-card>
        <v-card-title>Confirmar exclusão</v-card-title>
        <v-card-text>Tem certeza que deseja excluir este encaminhamento?</v-card-text>
        <v-card-actions>
          <v-btn variant="text" color="senai-red" @click="deleteConfirm = false">Cancelar</v-btn>
          <v-btn variant="text" color="error" @click="executarDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="finalizeDialog" max-width="720">
      <v-card>
        <v-card-title>Finalizar encaminhamento (Secretaria)</v-card-title>
        <v-card-text>
          <p>Insira a resposta da secretaria antes de finalizar:</p>
          <v-textarea v-model="finalizeResponse" rows="4" label="Resposta" />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" color="senai-red" @click="finalizeDialog = false">Cancelar</v-btn>
          <v-btn variant="text" color="success" @click="executarFinalizar">Finalizar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewAberto" max-width="720">
      <v-card>
        <v-card-title>Detalhes do encaminhamento</v-card-title>
        <v-card-text>
          <div v-if="viewItem">
            <p><strong>Aluno:</strong> {{ viewItem.aluno }}</p>
            <p><strong>Curso:</strong> {{ viewItem.courseType }} - {{ viewItem.cursoNome }}</p>
            <p><strong>Turma:</strong> {{ viewItem.turma }}</p>
            <p><strong>Motivo:</strong> {{ viewItem.motivo }}</p>
            <p><strong>Descrição:</strong><br/>{{ viewItem.descricao }}</p>
            <p v-if="viewItem.response"><strong>Resposta (Secretaria):</strong><br/>{{ viewItem.response }}</p>
            <p class="text-caption">Criado por: {{ viewItem.createdByName }} em {{ viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : '' }}</p>
            <p v-if="viewItem.finalizedAt" class="text-caption">Finalizado por: {{ viewItem.finalizedByName }} em {{ viewItem.finalizedAt ? new Date(viewItem.finalizedAt).toLocaleString() : '' }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" color="senai-red" @click="viewAberto = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.open" :timeout="2200" color="primary" location="bottom">
      {{ snack.msg }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as encaminhamentosService from '@/services/encaminhamentos.services'
import { formatData } from '@/utils/exportUtils'

const route = useRoute()
const router = useRouter()

const courseTypes = ['FIC', 'CAI', 'Técnico']

const tab = ref('abertos')
const selectedCourseType = ref('Todos')
const termoBusca = ref('')
const tabLabel = computed(() => (tab.value === 'abertos' ? 'Abertos' : 'Finalizados'))

const formRef = ref(null)
const formValid = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = ref({ aluno: '', courseType: '', cursoNome: '', turma: '', motivo: '', descricao: '' })

const snack = ref({ open: false, msg: '' })

const user = ref({})
const loadUser = () => {
  try {
    const userData = localStorage.getItem('user')
    user.value = userData ? JSON.parse(userData) : {}
  } catch {
    user.value = {}
  }
}

const items = ref([])
const counts = ref({ total: 0, byType: {} })

const filteredItems = computed(() => {
  if (!termoBusca.value.trim()) return items.value
  const termo = termoBusca.value.toLowerCase().trim()
  return items.value.filter(e => {
    return (e.aluno || '').toLowerCase().includes(termo) ||
           (e.cursoNome || '').toLowerCase().includes(termo) ||
           (e.turma || '').toLowerCase().includes(termo) ||
           (e.motivo || '').toLowerCase().includes(termo) ||
           (e.descricao || '').toLowerCase().includes(termo) ||
           (e.user_name || e.createdByName || '').toLowerCase().includes(termo) ||
           formatData(e.date || e.createdAt).toLowerCase().includes(termo)
  })
})

const isSecretaria = computed(() => (String(user.value?.role || '').toLowerCase() === 'secretaria'))

const carregar = async () => {
  loading.value = true
  try {
    const status = tab.value === 'abertos' ? 'aberto' : 'finalizado'
    const type = selectedCourseType.value === 'Todos' ? undefined : selectedCourseType.value

    const data = await encaminhamentosService.getEncaminhamentos(status, type)
    // Handle both {items, counts} and direct array responses
    items.value = Array.isArray(data) ? data : (data.items || [])

    if (Array.isArray(data)) {
      // Calculate simple counts from array
      const byType = {}
      data.forEach(item => {
        const t = item.courseType || 'Outros'
        byType[t] = (byType[t] || 0) + 1
      })
      counts.value = { total: data.length, byType }
    } else {
      counts.value = data.counts || { total: 0, byType: {} }
    }

  } catch (e) {
    console.error('Falha ao carregar encaminhamentos:', e)
    snack.value = { open: true, msg: 'Falha ao carregar encaminhamentos.' }
    items.value = []
  } finally {
    loading.value = false
  }
}

const changeTab = (v) => {
  tab.value = v
  carregar()
}

// View dialog state
const viewAberto = ref(false)
const viewItem = ref(null)
const abrirDetalhes = (e) => { viewItem.value = e; viewAberto.value = true }

const editAberto = ref(false)
const editForm = ref({})
const deleteConfirm = ref(false)
const toDelete = ref(null)
const finalizeDialog = ref(false)
const finalizeResponse = ref('')
const finalizeTarget = ref(null)

const criarEncaminhamento = async () => {
  if (!formValid.value) return
  saving.value = true
  try {
    const payload = {
      ...form.value,
      user_id: user.value?.id,
      user_name: user.value?.name,
      date: new Date().toISOString()
    }
    await encaminhamentosService.createEncaminhamento(payload)
    form.value = { aluno: '', courseType: '', cursoNome: '', turma: '', motivo: '', descricao: '' }
    if (formRef.value?.resetValidation) formRef.value.resetValidation()
    snack.value = { open: true, msg: 'Encaminhamento criado.' }
    await carregar()
  } catch (e) {
    console.error('Erro ao criar encaminhamento:', e)
    snack.value = { open: true, msg: 'Falha ao criar encaminhamento.' }
  } finally {
    saving.value = false
  }
}

const abrirEdicao = (e) => {
  editForm.value = { ...e }
  editAberto.value = true
}

const salvarEdicao = async () => {
  if (!editForm.value || !editForm.value.id) return
  try {
    saving.value = true
    await encaminhamentosService.updateEncaminhamento(editForm.value.id, editForm.value)
    editAberto.value = false
    snack.value = { open: true, msg: 'Encaminhamento atualizado.' }
    await carregar()
  } catch (err) {
    console.error('Falha ao atualizar:', err)
    snack.value = { open: true, msg: 'Falha ao atualizar.' }
  } finally { saving.value = false }
}

const confirmDelete = (e) => { toDelete.value = e; deleteConfirm.value = true }

const executarDelete = async () => {
  if (!toDelete.value) return
  try {
    await encaminhamentosService.deleteEncaminhamento(toDelete.value.id)
    snack.value = { open: true, msg: 'Encaminhamento removido.' }
    deleteConfirm.value = false
    toDelete.value = null
    await carregar()
  } catch (err) {
    console.error('Falha ao excluir:', err)
    snack.value = { open: true, msg: 'Falha ao excluir.' }
  }
}

const abrirFinalizar = (e) => { 
  finalizeTarget.value = e
  finalizeResponse.value = e.response || ''
  finalizeDialog.value = true 
}

const canEdit = (e) => {
  const role = (user.value?.role || '').toLowerCase()
  if (!e) return false
  if (role === 'admin') return true
  // Supondo que o backend retorna o criador ou que podemos comparar com o user logado
  return String(user.value?.nif || '') === String(e.createdByNif || e.createdByReg || '')
}

const executarFinalizar = async () => {
  if (!finalizeTarget.value) return
  if (isSecretaria.value && (!finalizeResponse.value || !finalizeResponse.value.trim())) {
    snack.value = { open: true, msg: 'Preencha a resposta antes de finalizar.' }
    return
  }
  try {
    await encaminhamentosService.finalize(finalizeTarget.value.id, finalizeResponse.value)
    finalizeDialog.value = false
    snack.value = { open: true, msg: 'Encaminhamento finalizado.' }
    await carregar()
  } catch (err) {
    console.error('Falha ao finalizar:', err)
    snack.value = { open: true, msg: 'Falha ao finalizar.' }
  }
}

const finalizar = async (e) => {
  try {
    await encaminhamentosService.finalize(e.id)
    snack.value = { open: true, msg: 'Encaminhamento finalizado.' }
    await carregar()
  } catch (err) {
    snack.value = { open: true, msg: 'Falha ao finalizar encaminhamento.' }
  }
}

onMounted(() => {
  loadUser()
  carregar()
})

watch(selectedCourseType, () => carregar())
</script>
