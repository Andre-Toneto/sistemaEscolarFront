<template>
  <div>
    <!-- Seleção de Curso e Turma (se não selecionada) -->
    <div v-if="!selecaoFeita">
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12">
            <v-card elevation="8" rounded="xl" class="pa-6 mb-4">
              <v-card-title class="text-center pb-4">
                <div class="text-center">
                  <v-icon size="56" color="senai-red" class="mb-3">mdi-account-school</v-icon>
                  <h2 class="text-h4 text-senai-red font-weight-medium mb-2">Carômetro SENAI</h2>
                  <p class="text-body-1 text-medium-emphasis">Selecione o curso e turma para visualizar os alunos</p>
                </div>
              </v-card-title>

              <v-card-text>
                <!-- Seletor de Curso e Turma -->
                <div v-if="!temDadosExcel" class="text-center py-12">
                  <v-progress-circular
                    indeterminate
                    color="senai-red"
                    size="64"
                  />
                  <p class="text-body-1 text-medium-emphasis mt-4">
                    Carregando cursos e turmas...
                  </p>
                </div>
                <CarometroCursoTurmaSelector
                  v-else
                  ref="selectorRef"
                  @curso-turma-selecionados="onCursoTurmaSelecionados"
                  @configurar-excel="abrirConfigExcel"
                />

              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Carômetro (se curso/turma selecionada) -->
    <div v-else>
      <!-- Header da Turma -->
      <v-container fluid class="pb-0">
        <v-card :color="cursoSelecionado.cor || 'senai-red'" dark elevation="4" rounded="xl" class="mb-4">
          <v-card-text class="pa-3">
            <v-row align="center">
              <v-col>
                <div class="d-flex align-center">
                  <v-avatar :color="lightenColor(cursoSelecionado.cor || '#D32F2F')" size="64" class="mr-4">
                    <v-icon color="white" size="32">mdi-school</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-h5 font-weight-bold mb-1">{{ turmaSelecionada.nome }}</h3>
                    <p class="text-h6 opacity-90 mb-1">{{ cursoSelecionado.nome }}</p>
                    <p class="text-body-2 opacity-80 mb-0">{{ totalAlunos }} alunos cadastrados</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="auto">
                <div class="d-flex gap-2">
                  <v-btn
                    v-if="isAdmin"
                    variant="elevated"
                    color="white"
                    class="text-primary font-weight-bold"
                    @click="abrirAdicionarAluno"
                    prepend-icon="mdi-account-plus"
                  >
                    Novo Aluno
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="white"
                    @click="voltarSelecao"
                    prepend-icon="mdi-arrow-left"
                  >
                    Voltar
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>

      <!-- Componente Carômetro -->
      <Carometro
        ref="carometroRef"
        :turma="turmaSelecionada.id"
        :curso="cursoSelecionado.id"
        @selectPessoa="selecionarPessoa"
        @updateTotal="atualizarTotal"
      />
    </div>

    <!-- Modal de Pessoa -->
    <CarometroPessoaModal
      v-model="modalAberto"
      :pessoa="pessoaSelecionada"
      :curso="cursoSelecionado"
      :turma="turmaSelecionada"
      @aluno-movimentado="onAlunoMovimentado"
      @aluno-removido="onAlunoRemovido"
    />

    <!-- Modal de Adicionar Aluno -->
    <AddStudentModal
      v-model="addStudentOpen"
      :curso-id="cursoSelecionado.id"
      :curso-nome="cursoSelecionado.nome"
      :turma-id="turmaSelecionada.id"
      @sucesso="onAlunoAdicionado"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import { useExcelData } from '@/composables/useExcelData.js'
// import { useCarometro } from '@/composables/useCarometro.js'
// import CarometroCursoTurmaSelector from '@/components/carometro/cursoTurmaSelector.vue'
// import Carometro from '@/components/carometro/index.vue'
// import CarometroPessoaModal from '@/components/carometro/pessoaModal.vue'
// import AddStudentModal from '@/components/admin/AddStudentModal.vue'

const router = useRouter()
const route = useRoute()
const modalAberto = ref(false)
const configExcelAberto = ref(false)
const addStudentOpen = ref(false)
const pessoaSelecionada = ref({})

const { temDadosPlanilha, sincronizarPlanilhaConfigurada, getAlunosPorCursoTurma } = useExcelData()
const { getAlunosTurma } = useCarometro()

// Estado da seleção
const selecaoFeita = ref(false)
const cursoSelecionado = ref({})
const turmaSelecionada = ref({})
const totalAlunos = ref(0)

const isAdmin = computed(() => {
  try {
    const user = JSON.parse(sessionStorage.getItem('carometro_user') || '{}')
    return (user?.tipo_usuario || '').toString().toLowerCase() === 'admin'
  } catch {
    return false
  }
})

// Estado para entrada manual
const temDadosExcel = ref(false)

const selectorRef = ref(null)
const carometroRef = ref(null)

// Verificar se há dados Excel disponíveis
const verificarDadosExcel = () => {
  temDadosExcel.value = temDadosPlanilha()
}

onMounted(async () => {
  // Sem autenticação: acesso direto ao carômetro
  console.log('🚀 Iniciando carômetro...')

  // Forçar limpeza de cache se houver parâmetro na URL
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('nocache') || urlParams.has('refresh')) {
    console.log('🧹 Parâmetro de limpeza detectado, limpando cache...')
    try {
      localStorage.removeItem('carometro_dados_excel')
      localStorage.removeItem('carometro_excel_timestamp')
      sessionStorage.removeItem('carometro_selecao')
    } catch (e) {
      console.warn('Erro ao limpar cache:', e)
    }
  }

  // Sincroniza automaticamente se houver URL configurada (ENV/localStorage)
  try {
    console.log('📊 Sincronizando planilha...')
    await sincronizarPlanilhaConfigurada(true) // Sempre forçar na primeira carga
  } catch (e) {
    console.warn('Falha ao sincronizar planilha configurada automaticamente:', e?.message || e)
  }

  verificarDadosExcel()

  // Verificar se há seleção salva
  const selecaoSalva = sessionStorage.getItem('carometro_selecao')
  if (selecaoSalva) {
    try {
      const selecao = JSON.parse(selecaoSalva)
      cursoSelecionado.value = selecao.curso
      turmaSelecionada.value = selecao.turma
      selecaoFeita.value = true
    } catch (error) {
      console.error('Erro ao carregar seleção salva:', error)
    }
  }

  // Checar pedido de abertura salvo (seguro mesmo após redirecionamentos)
  try {
    const pendingRaw = sessionStorage.getItem('carometro_open_request')
    if (pendingRaw) {
      const pending = JSON.parse(pendingRaw)
      if (pending?.curso) cursoSelecionado.value = { id: pending.curso, nome: pending.curso }
      if (pending?.turma) turmaSelecionada.value = { id: pending.turma, nome: pending.turma }
      if (pending?.curso && pending?.turma) selecaoFeita.value = true
      if (pending?.matricula) {
        const full = await resolvePessoaPorMatricula(pending.matricula, pending.curso, pending.turma, pending.aluno)
        pessoaSelecionada.value = full
        modalAberto.value = true
      }
      sessionStorage.removeItem('carometro_open_request')
    }
  } catch (e) { console.warn('Falha ao processar pedido salvo de abertura:', e) }

  // Handle potential notification deep-linking via query params
  try {
    const route = useRoute()
    const q = route.query || {}
    const hasQuery = q.curso || q.turma || q.openPessoa
    if (hasQuery) {
      if (q.curso) cursoSelecionado.value = { id: q.curso, nome: q.curso }
      if (q.turma) turmaSelecionada.value = { id: q.turma, nome: q.turma }
      if (q.curso && q.turma) selecaoFeita.value = true
      if (q.openPessoa) {
        const full = await resolvePessoaPorMatricula(String(q.openPessoa), String(q.curso || cursoSelecionado.value.id || ''), String(q.turma || turmaSelecionada.value.id || ''), '')
        pessoaSelecionada.value = full
        modalAberto.value = true
      }
      // Clear query to prevent repeated opening
      router.replace({ path: '/carometro', query: {} })
    }

    // Watch route query so opening works when already on /carometro
    watch(() => route.query, async (newQ) => {
      try {
        if (!newQ) return
        const nq = newQ || {}
        if (nq.curso) cursoSelecionado.value = { id: nq.curso, nome: nq.curso }
        if (nq.turma) turmaSelecionada.value = { id: nq.turma, nome: nq.turma }
        if (nq.curso && nq.turma) selecaoFeita.value = true
        if (nq.openPessoa) {
          const full = await resolvePessoaPorMatricula(String(nq.openPessoa), String(nq.curso || cursoSelecionado.value.id || ''), String(nq.turma || turmaSelecionada.value.id || ''), '')
          pessoaSelecionada.value = full
          modalAberto.value = true
        }
        // Clear query after handling
        if (nq.openPessoa || nq.curso || nq.turma) router.replace({ path: '/carometro', query: {} })
      } catch (err) { console.warn(err) }
    })
  } catch (e) { console.warn('Falha ao processar query de notificação:', e) }

  // Fallback: listen for explicit open events dispatched by notifications
  const eventHandler = async (ev) => {
    try {
      const note = ev?.detail || {}
      const curso = note.cursoId || note.curso || note.curso?.id || null
      const turma = note.turmaId || note.turma || note.turma?.id || null
      const matricula = note.matricula || note.ocorrenciaMatricula || note.matriculaAluno || null
      if (curso) cursoSelecionado.value = { id: curso, nome: curso }
      if (turma) turmaSelecionada.value = { id: turma, nome: turma }
      if (curso && turma) selecaoFeita.value = true
      if (matricula) {
        const full = await resolvePessoaPorMatricula(String(matricula), String(curso || ''), String(turma || ''), String(note.aluno || note.alunoNome || note.createdByName || ''))
        pessoaSelecionada.value = full
        modalAberto.value = true
      }
      // Small delay to ensure route/reactivity settles
      setTimeout(() => {
        try { router.replace({ path: '/carometro', query: {} }) } catch (e) {}
      }, 200)
    } catch (e) { console.warn('Erro no evento carometro-open-pessoa', e) }
  }

  window.addEventListener('carometro-open-pessoa', eventHandler)
  onUnmounted(() => window.removeEventListener('carometro-open-pessoa', eventHandler))
})

const onCursoTurmaSelecionados = (selecao) => {
  cursoSelecionado.value = selecao.curso
  turmaSelecionada.value = selecao.turma
  selecaoFeita.value = true
  
  // Salvar seleção
  sessionStorage.setItem('carometro_selecao', JSON.stringify(selecao))
}


const voltarSelecao = () => {
  selecaoFeita.value = false
  cursoSelecionado.value = {}
  turmaSelecionada.value = {}
  totalAlunos.value = 0

  sessionStorage.removeItem('carometro_selecao')
}

const selecionarPessoa = (pessoa) => {
  pessoaSelecionada.value = pessoa
  modalAberto.value = true
}

const abrirAdicionarAluno = () => {
  addStudentOpen.value = true
}

const onAlunoAdicionado = async () => {
  // 1. Sincronizar com Firestore para atualizar o cache local (localStorage)
  await sincronizarPlanilhaConfigurada(true)

  // 2. Recarregar a lista no carômetro
  if (carometroRef.value) {
    await carometroRef.value.recarregar()
  }
}

const onAlunoRemovido = async () => {
  // 1. Sincronizar com Firestore para atualizar o cache local (localStorage)
  await sincronizarPlanilhaConfigurada(true)

  // 2. Recarregar a lista no carômetro
  if (carometroRef.value) {
    await carometroRef.value.recarregar()
  }
}

const onAlunoMovimentado = async (dados) => {
  console.log('Aluno movimentado:', dados)

  // 1. Sincronizar com Firestore para atualizar o cache local (localStorage)
  await sincronizarPlanilhaConfigurada(true)

  // 2. Recarregar a lista no carômetro
  if (carometroRef.value) {
    await carometroRef.value.recarregar()
  }

  // 3. Atualizar estatísticas se necessário (já é feito pelo recarregar)
}

const atualizarTotal = (alunos) => {
  totalAlunos.value = Array.isArray(alunos) ? alunos.length : 0
}

// Utilidades para foto (alinhadas ao componente de lista)
const toNFC = (s) => { try { return String(s || '').normalize('NFC') } catch { return String(s || '') } }
const baseNome = (nome) => String(nome || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s_-]/g, '')
  .replace(/\s+/g, ' ')
const nomeComSep = (nome, sep) => baseNome(nome).replace(/\s+/g, sep)
const mapearCursoParaPasta = (cursoNome) => {
  const m = {
    'CAI': 'CAI',
    'SESI_TEC_ADM': 'TÉCNICO ADMINISTRAÇÃO',
    'SEDUC_TEC_ELETROMECANICA': 'TÉCNICO ELETROMECÂNICA',
    'SESI_TEC_DES_SIST': 'SesiTecDesSist',
    'SESI TÉC ADM': 'TÉCNICO ADMINISTRAÇÃO',
    'SEDUC TÉC ELETROMECÂNICA': 'TÉCNICO ELETROMECÂNICA'
  }
  return m[cursoNome] || cursoNome
}
const folderVariants = (str, isCurso = false) => {
  const strMap = isCurso ? mapearCursoParaPasta(str) : str
  const raw = String(strMap || '').trim().replace(/\s+/g, ' ')
  const rawNFC = toNFC(raw)
  const variants = [
    raw, rawNFC, str,
    raw.toUpperCase(), raw.toLowerCase(), rawNFC.toUpperCase(), rawNFC.toLowerCase(),
    nomeComSep(strMap, '_'), nomeComSep(strMap, '-'),
    nomeComSep(str, '_'), nomeComSep(str, '-'),
    baseNome(strMap), baseNome(str)
  ]
  return [...new Set(variants.filter(v => v && v.trim()))]
}
const enc = (s) => encodeURIComponent(String(s || ''))
const buildFotoPadrao = (cursoId, turmaId, matricula, nome) => {
  const baseURL = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './'
  const turma = String(turmaId || '').replace(/\s+/g, '').trim()
  const cursoFolderVariants = folderVariants(cursoId, true)
  cursoFolderVariants.push('SeducTecEletromecanica', 'SesiTecAdm', 'SesiTecDesSist', 'CAI', 'Cai')
  if (matricula) return `${baseURL}uploads/fotos/${enc(cursoFolderVariants[0])}/${enc(turma)}/${enc(matricula)}.png`
  return `${baseURL}fotos/${enc(cursoFolderVariants[0])}/${enc(turma)}/${enc(String(nome || ''))}.png`
}

// Resolve dados completos do aluno por matrícula a partir das fontes disponíveis
const resolvePessoaPorMatricula = async (matricula, cursoId, turmaId, nomeFallback = '') => {
  let aluno = null
  try {
    if (temDadosPlanilha()) {
      const lista = getAlunosPorCursoTurma?.(cursoId, turmaId) || []
      aluno = lista.find(a => String(a.matricula) === String(matricula)) || null
    }
    if (!aluno) {
      const listaLocal = getAlunosTurma(turmaId, cursoId) || []
      aluno = listaLocal.find(a => String(a.matricula) === String(matricula)) || null
    }
  } catch {}

  const pessoa = aluno ? { ...aluno } : { matricula: String(matricula), nome: String(nomeFallback || '') }
  if (!pessoa.foto) pessoa.foto = buildFotoPadrao(cursoId, turmaId, pessoa.matricula, pessoa.nome)
  return pessoa
}

const abrirConfigExcel = () => {
  configExcelAberto.value = true
}

const onDadosConfigurados = () => {
  verificarDadosExcel()
  
  // Recarregar cursos no seletor
  if (selectorRef.value && selectorRef.value.recarregarCursos) {
    selectorRef.value.recarregarCursos()
  }
  
  // Se estiver em modo manual e agora tem dados Excel, voltar para seleção
  if (selecaoFeita.value && cursoSelecionado.value.id === 'MANUAL') {
    voltarSelecao()
  }
}

// Função auxiliar para clarear cor
const lightenColor = (color) => {
  // Remover # se presente
  color = color.replace('#', '')
  
  // Converter para RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // Clarear 20%
  const factor = 1.2
  const newR = Math.min(255, Math.floor(r * factor))
  const newG = Math.min(255, Math.floor(g * factor))
  const newB = Math.min(255, Math.floor(b * factor))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
</script>
