<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="8" rounded="xl" class="pa-4 mb-4">
          <v-tabs v-model="tab" density="comfortable" color="senai-red">
            <v-tab :to="{ name: 'Encaminhamentos', params: { status: 'abertos' } }" value="abertos">
              <v-icon start>mdi-folder-open</v-icon>
              Abertos
            </v-tab>
            <v-tab :to="{ name: 'Encaminhamentos', params: { status: 'finalizados' } }" value="finalizados">
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
            <v-card-subtitle class="mb-2">Preencha os dados ao lado para registrar um encaminhamento</v-card-subtitle>
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
                      label="Nome do curso (ex: FIC - Microsoft Power BI)"
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
                <v-chip v-for="ct in courseTypes" :key="ct" size="small" class="ma-1" v-if="ct !== 'Todos'">
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
            <span class="text-h6 text-senai-red">Meus encaminhamentos — {{ tabLabel }}</span>
            <div class="d-flex align-center">
              <v-btn variant="text" color="senai-red" @click="carregar(true)">
                <v-icon start>mdi-refresh</v-icon>
                Atualizar
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="mb-3 d-flex align-center gap-2 flex-wrap">
              <v-chip
                v-for="ct in courseTypes"
                :key="ct"
                :color="selectedCourseType === ct ? 'senai-red' : 'default'"
                :variant="selectedCourseType === ct ? 'flat' : 'outlined'"
                size="small"
                @click="selectedCourseType = ct"
              >
                {{ ct }} <span v-if="counts.byType && counts.byType[ct]"> • {{ counts.byType[ct] }}</span>
              </v-chip>
            </div>

            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="senai-red" size="56" />
              <p class="text-medium-emphasis mt-2">Carregando...</p>
            </div>

            <div v-else-if="items.length === 0" class="text-center py-12">
              <v-icon size="80" color="grey-lighten-2" class="mb-2">mdi-inbox</v-icon>
              <p class="text-body-2 text-medium-emphasis mb-0">Nenhum encaminhamento {{ tab === 'abertos' ? 'em aberto' : 'finalizado' }}.</p>
            </div>

            <v-list v-else lines="two" density="comfortable">
              <v-list-item v-for="e in items" :key="e.id" rounded="lg" class="mb-2" :subtitle="e.descricao">
                <template #prepend>
                  <v-avatar color="senai-light-red">
                    <v-icon color="senai-red">{{ tab === 'abertos' ? 'mdi-folder-open' : 'mdi-check-circle' }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ e.aluno }} • {{ e.courseType || e.curso }} • {{ e.cursoNome || e.curso }} • {{ e.turma }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div><span class="text-medium-emphasis">Motivo: </span>{{ e.motivo }}</div>
                  <div class="text-caption">
                    Criado por: {{ e.createdByName || e.createdBy }}
                    <span v-if="e.finalizedByName"> �� Finalizado por: {{ e.finalizedByName }} em {{ e.finalizedAt ? new Date(e.finalizedAt).toLocaleString() : '' }}</span>
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

                    <v-btn v-if="tab === 'abertos' && user.tipo_usuario && user.tipo_usuario.toLowerCase() === 'secretaria'" size="small" color="success" variant="outlined" @click.stop="abrirFinalizar(e)">
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

    <!-- Visualizar detalhes -->
    <v-dialog v-model="viewAberto" max-width="720">
      <v-card>
        <v-card-title>Detalhes do encaminhamento</v-card-title>
        <v-card-text>
          <div v-if="viewItem">
            <p><strong>Aluno:</strong> {{ viewItem.aluno }}</p>
            <p><strong>Curso:</strong> {{ viewItem.courseType || viewItem.curso }} - {{ viewItem.cursoNome || '' }}</p>
            <p><strong>Turma:</strong> {{ viewItem.turma }}</p>
            <p><strong>Motivo:</strong> {{ viewItem.motivo }}</p>
            <p><strong>Descrição:</strong><br/>{{ viewItem.descricao }}</p>
            <p v-if="viewItem.response"><strong>Resposta (Secretaria):</strong><br/>{{ viewItem.response }}</p>
            <p class="text-caption">Criado por: {{ viewItem.createdByName || viewItem.createdByReg }} em {{ viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : '' }}</p>
            <p v-if="viewItem.finalizedAt" class="text-caption">Finalizado por: {{ viewItem.finalizedByName || viewItem.finalizedByReg }} em {{ viewItem.finalizedAt ? new Date(viewItem.finalizedAt).toLocaleString() : '' }}</p>
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
import { useRoute } from 'vue-router'
// import { db } from '@/services/firebase.js'
// import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'

const route = useRoute()

const courseTypes = ['FIC','CAI','Técnico']

const tab = ref('abertos')
const selectedCourseType = ref('Todos')
const tabLabel = computed(() => (tab.value === 'abertos' ? 'Abertos' : 'Finalizados'))

const formRef = ref(null)
const formValid = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = ref({ aluno: '', courseType: '', cursoNome: '', turma: '', motivo: '', descricao: '' })

const snack = ref({ open: false, msg: '' })

const user = ref({})
const loadUser = () => {
  try { user.value = JSON.parse(sessionStorage.getItem('carometro_user') || '{}') } catch { user.value = {} }
}

const coll = collection(db, 'encaminhamentos')

const items = ref([])

const counts = ref({ total: 0, byType: {} })

const isSecretaria = computed(() => (String(user.value?.tipo_usuario || '').toLowerCase() === 'secretaria'))

const computeCounts = async (status = 'aberto') => {
  try {
    const collRef = collection(db, 'encaminhamentos')
    const userReg = String(user.value?.registro || '')
    const sec = isSecretaria.value

    // total for status
    let totalSnap
    if (sec) {
      totalSnap = await getDocs(query(collRef, where('status', '==', status)))
    } else {
      totalSnap = await getDocs(query(collRef, where('status', '==', status), where('createdByReg', '==', userReg)))
    }
    counts.value.total = totalSnap.size

    // per type for status
    const byType = {}
    for (const t of courseTypes) {
      if (t === 'Todos') continue
      let snap
      if (sec) {
        snap = await getDocs(query(collRef, where('status', '==', status), where('courseType', '==', t)))
      } else {
        snap = await getDocs(query(collRef, where('status', '==', status), where('createdByReg', '==', userReg), where('courseType', '==', t)))
      }
      byType[t] = snap.size
    }
    counts.value.byType = byType
  } catch (e) {
    counts.value = { total: 0, byType: {} }
  }
}

// View dialog state
const viewAberto = ref(false)
const viewItem = ref(null)
const abrirDetalhes = (e) => { viewItem.value = e; viewAberto.value = true }

const carregar = async (force = false) => {
  loading.value = true
  try {
    const status = tab.value === 'abertos' ? 'aberto' : 'finalizado'
    // Build query depending on role (secretaria sees all)
    let q
    const isSecretaria = (user.value?.tipo_usuario || '').toLowerCase() === 'secretaria'
    if (isSecretaria) {
      q = query(coll, where('status', '==', status))
    } else {
      q = query(coll, where('createdByReg', '==', String(user.value?.registro || '')),
                where('status', '==', status))
    }
    const snap = await getDocs(q)
    const out = []
    snap.forEach(d => out.push({ id: d.id, ...(d.data() || {}) }))

    // Client-side filter by courseType
    let filtered = out
    if (selectedCourseType.value && selectedCourseType.value !== 'Todos') {
      filtered = filtered.filter(i => String(i.courseType || (i.curso || '')).toLowerCase() === String(selectedCourseType.value).toLowerCase())
    }
    // Sort by createdAt desc locally
    filtered.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
    items.value = filtered
    await computeCounts(status)

    // Owner notifications: notify creators when their items moved to finalizado and weren't yet notified
    try {
      const userReg = String(user.value?.registro || '')
      if (userReg) {
        const unnotified = filtered.filter(i => i.status === 'finalizado' && String(i.createdByReg || '') === userReg && !i.ownerNotified)
        if (unnotified.length > 0) {
          snack.value = { open: true, msg: `Você tem ${unnotified.length} encaminhamento(s) finalizado(s).` }
          // mark as notified
          await Promise.all(unnotified.map(u => updateDoc(doc(db, 'encaminhamentos', String(u.id)), { ownerNotified: true }).catch(() => {})))
        }
      }
    } catch (e) { console.warn('Falha ao notificar owner:', e) }

    // Secretaria: notify about pending opens (only when count changes)
    try {
      const isSec = (user.value?.tipo_usuario || '').toLowerCase() === 'secretaria'
      if (isSec) {
        const prev = Number(sessionStorage.getItem('enc_pending_count') || '0')
        const current = counts.value.total || 0
        if (current > 0 && current !== prev) {
          snack.value = { open: true, msg: `${current} encaminhamento(s) pendente(s)` }
          sessionStorage.setItem('enc_pending_count', String(current))
        }
      }
    } catch (e) { console.warn('Falha ao notificar secretaria:', e) }

  } catch (e) {
    console.warn('Falha ao carregar encaminhamentos:', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

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
      aluno: String(form.value.aluno || '').trim(),
      courseType: String(form.value.courseType || '').trim(),
      cursoNome: String(form.value.cursoNome || '').trim(),
      turma: String(form.value.turma || '').trim(),
      motivo: String(form.value.motivo || '').trim(),
      descricao: String(form.value.descricao || '').trim(),
      status: 'aberto',
      createdByReg: String(user.value?.registro || ''),
      createdByName: String(user.value?.nome_completo || ''),
      createdByRole: String(user.value?.tipo_usuario || ''),
      createdAt: new Date().toISOString(),
      updatedAt: null
    }
    await addDoc(coll, payload)
    form.value = { aluno: '', courseType: '', cursoNome: '', turma: '', motivo: '', descricao: '' }
    if (formRef.value?.resetValidation) formRef.value.resetValidation()
    snack.value = { open: true, msg: 'Encaminhamento criado.' }
    await carregar(true)
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
  if (!canEdit(editForm.value)) {
    snack.value = { open: true, msg: 'Você não tem permissão para editar este encaminhamento.' }
    return
  }
  try {
    saving.value = true
    const dref = doc(db, 'encaminhamentos', String(editForm.value.id))
    const patch = {
      aluno: String(editForm.value.aluno || '').trim(),
      courseType: String(editForm.value.courseType || editForm.value.courseType || '').trim(),
      cursoNome: String(editForm.value.cursoNome || '').trim(),
      turma: String(editForm.value.turma || '').trim(),
      motivo: String(editForm.value.motivo || '').trim(),
      descricao: String(editForm.value.descricao || '').trim(),
      updatedAt: new Date().toISOString()
    }
    await updateDoc(dref, patch)
    editAberto.value = false
    snack.value = { open: true, msg: 'Encaminhamento atualizado.' }
    await carregar(true)
  } catch (err) {
    console.error('Falha ao atualizar:', err)
    snack.value = { open: true, msg: 'Falha ao atualizar.' }
  } finally { saving.value = false }
}

const confirmDelete = (e) => { toDelete.value = e; deleteConfirm.value = true }

const executarDelete = async () => {
  if (!toDelete.value) return
  if (!canEdit(toDelete.value)) {
    snack.value = { open: true, msg: 'Você não tem permissão para excluir este encaminhamento.' }
    deleteConfirm.value = false
    return
  }
  try {
    const dref = doc(db, 'encaminhamentos', String(toDelete.value.id))
    await deleteDoc(dref)
    snack.value = { open: true, msg: 'Encaminhamento removido.' }
    deleteConfirm.value = false
    toDelete.value = null
    await carregar(true)
  } catch (err) {
    console.error('Falha ao excluir:', err)
    snack.value = { open: true, msg: 'Falha ao excluir.' }
  }
}

const abrirFinalizar = (e) => { finalizeTarget.value = e; finalizeResponse.value = e.response || ''; finalizeDialog.value = true }

const canEdit = (e) => {
  const t = (user.value?.tipo_usuario || '').toLowerCase()
  if (!e) return false
  // only admin or the original creator can edit/delete
  if (t === 'admin') return true
  return String(user.value?.registro || '') === String(e.createdByReg || '')
}

const executarFinalizar = async () => {
  if (!finalizeTarget.value) return
  const isSec = (user.value?.tipo_usuario || '').toLowerCase() === 'secretaria'
  if (isSec && (!finalizeResponse.value || !finalizeResponse.value.trim())) {
    snack.value = { open: true, msg: 'Preencha a resposta antes de finalizar.' }
    return
  }
  try {
    const dref = doc(db, 'encaminhamentos', String(finalizeTarget.value.id))
    const patch = {
      status: 'finalizado',
      updatedAt: new Date().toISOString(),
      finalizedByReg: String(user.value?.registro || ''),
      finalizedByName: String(user.value?.nome_completo || ''),
      finalizedAt: new Date().toISOString()
    }
    if (finalizeResponse.value) {
      patch.response = String(finalizeResponse.value || '').trim()
      patch.responseBy = String(user.value?.registro || '')
      patch.responseAt = new Date().toISOString()
    }
    await updateDoc(dref, patch)
    finalizeDialog.value = false
    snack.value = { open: true, msg: 'Encaminhamento finalizado.' }
    await carregar(true)
  } catch (err) {
    console.error('Falha ao finalizar:', err)
    snack.value = { open: true, msg: 'Falha ao finalizar.' }
  }
}

const finalizar = async (e) => {
  try {
    const dref = doc(db, 'encaminhamentos', String(e.id))
    await updateDoc(dref, { status: 'finalizado', updatedAt: new Date().toISOString(), finalizedByReg: String(user.value?.registro || ''), finalizedByName: String(user.value?.nome_completo || ''), finalizedAt: new Date().toISOString() })
    snack.value = { open: true, msg: 'Encaminhamento finalizado.' }
    await carregar(true)
  } catch (err) {
    snack.value = { open: true, msg: 'Falha ao finalizar encaminhamento.' }
  }
}


onMounted(() => {
  loadUser()
  const s = (route.params?.status === 'finalizados') ? 'finalizados' : 'abertos'
  tab.value = s
  carregar()
})

watch(() => route.params?.status, (v) => {
  tab.value = (v === 'finalizados') ? 'finalizados' : 'abertos'
  carregar()
})

watch(selectedCourseType, () => carregar())
</script>
