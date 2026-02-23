<template>
  <v-app-bar app color="senai-red" dark elevation="4" density="comfortable">
    <!-- Logo Section -->
    <template v-slot:prepend>
      <v-img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTUzRTNFIi8+Cjx0ZXh0IHg9IjYwIiB5PSIyNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNFTkFJPC90ZXh0Pgo8L3N2Zz4="
        alt="SENAI"
        max-height="36"
        max-width="120"
        class="mr-4"
      />
    </template>

    <v-divider vertical class="mx-2 opacity-30" />

    <!-- Date Section -->
    <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
    <span class="text-body-2 font-weight-medium text-capitalize">{{ formattedDate }}</span>

    <v-spacer />

    <!-- Notification Bell for Admins -->
    <v-menu v-if="isAdmin" offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" variant="text" aria-label="Notificações">
          <v-icon>mdi-bell</v-icon>
          <v-badge v-if="unreadCount" color="error" :content="unreadCount" class="ml-1" />
        </v-btn>
      </template>

      <v-card style="min-width:320px; max-width:420px;">
        <v-list>
          <v-list-item>
            <v-list-item-title>Notificações</v-list-item-title>
            <v-spacer />
            <v-btn variant="text" size="small" @click="ackAll">OK tudo</v-btn>
          </v-list-item>
          <v-divider />

          <template v-if="notifications && notifications.length">
            <v-list-item v-for="note in notifications" :key="note.id" class="align-start">
              <div class="notification-content" @click="openNotification(note)" style="cursor:pointer; padding: 8px 0;">
                <div class="text-subtitle-2 font-weight-medium">{{ note.aluno }}</div>
                <div class="text-caption">{{ note.matricula }} • {{ note.turma }}</div>
                <div class="text-caption">Registrado por: {{ note.createdByName || note.createdByReg || 'Usuário' }}</div>
                <div class="text-caption opacity-70">{{ formatDate(note.createdAt) }}</div>
              </div>
              <v-list-item-action>
                <v-btn variant="text" size="small" @click.stop="ack(note)">OK</v-btn>
              </v-list-item-action>
            </v-list-item>
          </template>

          <template v-else>
            <v-list-item>
              <v-list-item-title>Nenhuma notificação</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Desktop Menu Items -->
    <template v-slot:append>
      <div class="d-none d-lg-flex">
        <v-btn
          v-for="item in menuItems"
          :key="item.text"
          :href="item.link"
          target="_blank"
          variant="text"
          size="small"
          class="text-caption opacity-90"
        >
          <v-icon size="small" class="mr-1">{{ item.icon }}</v-icon>
          {{ item.text }}
        </v-btn>
         <v-btn
         @click="goHome"
          target="_blank"
          variant="text"
          size="small"
          class="text-caption opacity-90"
        >
          <v-icon size="small" class="mr-1">mdi-home</v-icon>
          INÍCIO
        </v-btn>
        <v-divider vertical class="mx-2 opacity-30" />
      </div> 

       <v-menu class="d-none d-lg-flex">
        <template v-slot:activator="{ props }">
          <v-btn
            class="d-none d-lg-flex"
            icon="mdi-dots-vertical"
            v-bind="props"
            variant="text"
          />
        </template>
        <v-list>
          <v-list-item>
            <template v-slot:prepend><v-icon>mdi-account</v-icon></template>
            <v-list-item-title>{{ currentUserName }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item v-if="isAdmin" @click="abrirCadastro">
            <template v-slot:prepend><v-icon>mdi-account-plus</v-icon></template>
            <v-list-item-title>Cadastrar usuário</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="abrirResetSenha">
            <template v-slot:prepend><v-icon>mdi-lock-reset</v-icon></template>
            <v-list-item-title>Redefinir senha</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Sair</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Mobile Menu -->
      <v-menu class="d-flex d-lg-none">
        <template v-slot:activator="{ props }">
          <v-btn
            class="d-flex d-lg-none"
            icon="mdi-dots-vertical"
            v-bind="props"
            variant="text"
          />
        </template>
        <v-list>
          <v-list-item>
            <template v-slot:prepend><v-icon>mdi-account</v-icon></template>
            <v-list-item-title>{{ currentUserName }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item
            v-for="item in menuItems"
            :key="item.text"
            :href="item.link"
            target="_blank"
          >
            <template v-slot:prepend>
              <v-icon>{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="abrirCadastro">
            <template v-slot:prepend><v-icon>mdi-account-plus</v-icon></template>
            <v-list-item-title>Cadastrar usuário</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="abrirResetSenha">
            <template v-slot:prepend><v-icon>mdi-lock-reset</v-icon></template>
            <v-list-item-title>Redefinir senha</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="goHome">
            <template v-slot:prepend><v-icon>mdi-home</v-icon></template>
            <v-list-item-title>Início</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Sair</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    
    <v-dialog v-model="cadastroAberto" max-width="640">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Cadastro de usuário</v-card-title>
        <v-card-text>
          <v-form ref="cadastroFormRef" v-model="cadastroFormValid" @submit.prevent="registrar">
            <v-row>
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="cadastro.registro"
                  label="Número do NIF"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-card-account-details"
                  :rules="registroRules"
                  autocomplete="off"
                />
              </v-col>
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="cadastro.nome_completo"
                  label="Nome completo"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  :rules="nomeRules"
                  autocomplete="name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cadastro.data_nascimento"
                  label="Data de nascimento"
                  placeholder="DD/MM/AAAA"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-cake-variant"
                  :rules="dataNascimentoRules"
                  autocomplete="bday"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="cadastro.tipo_usuario"
                  :items="tiposUsuario"
                  label="Tipo de usuário"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-badge"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cadastro.senha"
                  :type="mostrarSenhaCadastro ? 'text' : 'password'"
                  label="Senha"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="mostrarSenhaCadastro ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="mostrarSenhaCadastro = !mostrarSenhaCadastro"
                  :rules="senhaRules"
                  autocomplete="new-password"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cadastro.confirmarSenha"
                  :type="mostrarSenhaCadastro ? 'text' : 'password'"
                  label="Confirmar senha"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock-check"
                  :rules="confirmarSenhaRules"
                  autocomplete="new-password"
                />
              </v-col>
            </v-row>

            <v-alert v-if="cadastroErro" type="error" variant="tonal" class="mb-4">
              {{ cadastroErro }}
            </v-alert>

            <v-btn
              :disabled="!cadastroFormValid"
              :loading="loadingCadastro"
              color="senai-red"
              size="large"
              block
              type="submit"
              elevation="2"
            >
              Cadastrar
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" color="senai-red" @click="cadastroAberto = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="resetAberto" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Redefinir senha do usuário</v-card-title>
        <v-card-text>
          <v-form ref="resetFormRef" v-model="resetFormValido" @submit.prevent="executarReset">
            <v-text-field
              v-model="resetRegistro"
              label="Número do NIF"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-card-account-details"
              :rules="registroRules"
              autocomplete="off"
              class="mb-4"
            />
            <v-text-field
              v-model="resetSenhaTemp"
              :type="mostrarResetSenha ? 'text' : 'password'"
              label="Senha temporária"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-reset"
              :append-inner-icon="mostrarResetSenha ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="mostrarResetSenha = !mostrarResetSenha"
              :rules="senhaTempRules"
              autocomplete="new-password"
              class="mb-2"
            />
            <div class="d-flex align-center mb-4">
              <v-btn size="small" variant="text" color="senai-red" @click="gerarSenhaTemp" class="mr-2">
                <v-icon start>mdi-refresh</v-icon>
                Gerar outra
              </v-btn>
              <v-btn size="small" variant="text" color="senai-red" @click="copiarSenhaTemp">
                <v-icon start>mdi-content-copy</v-icon>
                Copiar
              </v-btn>
            </div>

            <v-alert v-if="resetErro" type="error" variant="tonal" class="mb-4">
              {{ resetErro }}
            </v-alert>
            <v-alert v-if="resetOk" type="success" variant="tonal" class="mb-4">
              Senha redefinida. Entregue a senha temporária ao usuário e peça para alterá-la no próximo login.
            </v-alert>

            <v-btn
              :disabled="!resetFormValido"
              :loading="resetLoading"
              color="senai-red"
              size="large"
              block
              type="submit"
              elevation="2"
            >
              Redefinir senha
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" color="senai-red" @click="resetAberto = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import { db } from '@/services/firebase.js'
// import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
// import { sha256Hex, hexToBase64 } from '@/utils/hash.js'
// import { restGetDoc, restSetDoc, restUpdateDoc } from '@/services/firestoreRest.js'

const router = useRouter()
const route = useRoute()

const cadastroAberto = ref(false)
const cadastroFormRef = ref(null)
const cadastroFormValid = ref(false)
const loadingCadastro = ref(false)
const mostrarSenhaCadastro = ref(false)
const forceChangeOpen = ref(false)
const cadastroErro = ref('')

// Login state used for post-cadastro autenticação
const loginFormValid = ref(true)
const loadingLogin = ref(false)
const credentials = ref({ registro: '', senha: '' })
const currentUserRef = ref(null)
const currentUserPath = ref('')
const currentUserData = ref(null)

// Reset senha (admin)
const resetAberto = ref(false)
const resetFormRef = ref(null)
const resetFormValido = ref(false)
const resetLoading = ref(false)
const resetRegistro = ref('')
const resetSenhaTemp = ref('')
const mostrarResetSenha = ref(false)
const resetErro = ref('')
const resetOk = ref(false)

// Rules
const registroRules = [v => !!v || 'Número de registro é obrigatório']
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

const cadastro = ref({
  registro: '',
  data_nascimento: '',
  nome_completo: '',
  senha: '',
  confirmarSenha: '',
  tipo_usuario: 'regular'
})

const tiposUsuario = [
  { title: 'Regular', value: 'regular' },
  { title: 'FIC', value: 'fic' },
  { title: 'ADM', value: 'adm' },
  { title: 'Secretaria', value: 'secretaria' }
]

const user = ref({})
const loadUser = () => {
  try { user.value = JSON.parse(sessionStorage.getItem('carometro_user') || '{}') } catch { user.value = {} }
}

onMounted(() => {
  loadUser()
  const handler = () => loadUser()
  window.addEventListener('carometro-session-changed', handler)
  window.addEventListener('visibilitychange', handler)
  window.addEventListener('focus', handler)
  onUnmounted(() => {
    window.removeEventListener('carometro-session-changed', handler)
    window.removeEventListener('visibilitychange', handler)
    window.removeEventListener('focus', handler)
  })
})

const currentUserName = computed(() => user.value?.nome_completo || user.value?.registro || 'Usuário')
const isAdmin = computed(() => {
  const t = (user.value?.tipo_usuario || '').toString().toLowerCase()
  return t === 'admin' || t === 'adm'
})

const formattedDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const menuItems = [
  { text: 'INTRANET', icon: 'mdi-web', link: 'http://intranet568.sp.senai.br/' },
  { text: 'Diário FIC', icon: 'mdi-school', link: 'https://diariofic.sp.senai.br/' },
  { text: 'PORTAL EDU', icon: 'mdi-school', link: 'https://pess.sesisenaispedu.org.br/' },
  { text: 'RH SAP', icon: 'mdi-account-group', link: 'https://portalrh.sesisenaisp.org.br/arte/' },
  { text: 'GED', icon: 'mdi-file-document', link: 'https://sesisenaisp.sharepoint.com/sites/NovaGED' },
  { text: 'OUTLOOK', icon: 'mdi-email', link: 'https://mail.sesisenaisp.org.br/' },
  { text: 'SGSET', icon: 'mdi-cog', link: 'https://sgset.sp.senai.br/' },
  { text: 'EMPREGRA+', icon: 'mdi-briefcase', link: 'https://www.senaipr.org.br/' },
]

const goHome = () => {
  router.push('/home')
}

const abrirCadastro = () => {
  cadastroErro.value = ''
  cadastroAberto.value = true
}

const abrirResetSenha = () => {
  resetErro.value = ''
  resetOk.value = false
  resetRegistro.value = ''
  resetSenhaTemp.value = gerarSenha()
  mostrarResetSenha.value = false
  resetAberto.value = true
}

function gerarSenha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

const gerarSenhaTemp = () => { resetSenhaTemp.value = gerarSenha() }

const copiarSenhaTemp = async () => {
  try { await navigator.clipboard.writeText(String(resetSenhaTemp.value || '')) } catch {}
}

const registrar = async () => {
  if (!cadastroFormValid.value) return
  loadingCadastro.value = true
  cadastroErro.value = ''
  try {
    const dados = { ...cadastro.value }
    const registro = String(dados.registro || '').trim()

    const res = await getUserDoc(registro)
    if (res.snap.exists()) {
      cadastroErro.value = 'Já existe um usuário com este número de registro.'
      loadingCadastro.value = false
      return
    }

    const senhaHash = await sha256Hex(dados.senha)

    const payload = {
      registro,
      data_nascimento: dados.data_nascimento,
      nome_completo: dados.nome_completo,
      tipo_usuario: String(dados.tipo_usuario || 'regular'),
      senhaHash,
      forcePasswordChange: true,
      createdAt: new Date().toISOString()
    }

    await createOrSetUser(res.ref, res.path, payload)

    cadastroAberto.value = false

    credentials.value.registro = registro
    credentials.value.senha = dados.senha

    await authenticate()
  } catch (e) {
    cadastroErro.value = 'Falha ao cadastrar. Tente novamente.'
  } finally {
    loadingCadastro.value = false
  }
}

// Utils
async function getUserDoc(registro) {
  const id = String(registro)
  const primaryRef = doc(db, 'users', id)
  try {
    const snap = await getDoc(primaryRef)
    if (snap.exists()) return { ref: primaryRef, snap, via: 'sdk', path: `users/${id}` }
  } catch (_) {}
  const altRef = doc(db, 'User', id)
  try {
    const snap = await getDoc(altRef)
    if (snap.exists()) return { ref: altRef, snap, via: 'sdk', path: `User/${id}` }
  } catch (_) {}
  const rest1 = await restGetDoc(`users/${id}`)
  if (rest1.exists()) return { ref: null, snap: rest1, via: 'rest', path: `users/${id}` }
  const rest2 = await restGetDoc(`User/${id}`)
  return { ref: null, snap: rest2, via: 'rest', path: rest2.exists() ? `User/${id}` : `users/${id}` }
}

async function getAdminDoc(registro) {
  const id = String(registro)
  const primaryRef = doc(db, 'admins', id)
  try {
    const snap = await getDoc(primaryRef)
    if (snap.exists()) return { ref: primaryRef, snap, via: 'sdk', path: `admins/${id}` }
  } catch (_) {}
  const altRef = doc(db, 'admin', id)
  try {
    const snap = await getDoc(altRef)
    if (snap.exists()) return { ref: altRef, snap, via: 'sdk', path: `admin/${id}` }
  } catch (_) {}
  const rest1 = await restGetDoc(`admins/${id}`)
  if (rest1.exists()) return { ref: null, snap: rest1, via: 'rest', path: `admins/${id}` }
  const rest2 = await restGetDoc(`admin/${id}`)
  return { ref: null, snap: rest2, via: 'rest', path: rest2.exists() ? `admin/${id}` : `admins/${id}` }
}

function normalizeRole(v) {
  const s = String(v || '').toLowerCase().trim()
  if (['admin', 'adm', 'administrador', 'coordenador', 'coord', 'gestor'].includes(s)) return 'admin'
  if (['secretaria', 'secretário', 'secretaria(o)', 'sec'].includes(s)) return 'secretaria'
  if (['fic'].includes(s)) return 'fic'
  if (['regular', 'usuario', 'user', 'aluno', 'estudante'].includes(s)) return 'regular'
  return s || 'regular'
}

async function determineUserRole(currentData) {
  const baseTipo = normalizeRole(currentData?.tipo_usuario || currentData?.Tipo_usuario || 'regular')
  if (baseTipo === 'admin') return 'admin'
  try {
    const { snap } = await getAdminDoc(currentData?.registro || '')
    if (snap.exists()) return 'admin'
  } catch (_) {}
  return baseTipo
}

async function setTipoUsuario(targetRef, targetPath, tipo) {
  try {
    if (targetRef) return await updateDoc(targetRef, { tipo_usuario: tipo })
  } catch (_) {}
  try {
    if (targetPath) return await restUpdateDoc(targetPath, { tipo_usuario: tipo })
  } catch (_) {}
}

async function createOrSetUser(targetRef, targetPath, data) {
  try {
    if (targetRef) return await setDoc(targetRef, data)
  } catch (_) {}
  return await restSetDoc(targetPath, data)
}

// Reset password action
const executarReset = async () => {
  if (!resetFormValido.value) return
  resetLoading.value = true
  resetErro.value = ''
  resetOk.value = false
  try {
    const registro = String(resetRegistro.value || '').trim()
    const novaSenha = String(resetSenhaTemp.value || '').trim()
    if (!registro) {
      resetErro.value = 'Informe o número de registro.'
      resetLoading.value = false
      return
    }
    if (!novaSenha || novaSenha.length < 6) {
      resetErro.value = 'Senha temporária inválida.'
      resetLoading.value = false
      return
    }

    const { ref: userRef, snap, path } = await getUserDoc(registro)
    if (!snap.exists()) {
      resetErro.value = 'Usuário não encontrado.'
      resetLoading.value = false
      return
    }

    const senhaHash = await sha256Hex(novaSenha)
    try {
      if (userRef) {
        await updateDoc(userRef, {
          senhaHash,
          forcePasswordChange: true,
          passwordResetAt: new Date().toISOString(),
          passwordChangedAt: null
        })
      } else if (path) {
        await restUpdateDoc(path, {
          senhaHash,
          forcePasswordChange: true,
          passwordResetAt: new Date().toISOString(),
          passwordChangedAt: null
        })
      }
      resetOk.value = true
    } catch (e) {
      resetErro.value = 'Falha ao redefinir senha. Tente novamente.'
    }
  } finally {
    resetLoading.value = false
  }
}

// Actions
const authenticate = async () => {
  if (!loginFormValid.value) return
  loadingLogin.value = true
  try {
    const registro = String(credentials.value.registro || '').trim()
    const senha = String(credentials.value.senha || '')
    const { ref, snap, path } = await getUserDoc(registro)

    if (!snap.exists()) {
      alert('Usuário não encontrado.')
      loadingLogin.value = false
      return
    }

    const data = snap.data() || {}
    const typedHash = await sha256Hex(senha)
    const typedHashUpper = typedHash.toUpperCase()
    const typedBase64 = hexToBase64(typedHash)
    const storedHashRaw = data.senhaHash || data.SenhaHash || data.senha_hash || data.hashSenha || data.passwordHash || ''
    const storedHash = String(storedHashRaw || '').trim()

    let senhaOk = false
    if (storedHash) {
      const isHex = /^[a-fA-F0-9]{64}$/.test(storedHash)
      const isB64 = /^(?:[A-Za-z0-9+/]{44}|[A-Za-z0-9+/]{43}=|[A-Za-z0-9+/]{42}==)$/.test(storedHash)
      if (isHex) {
        senhaOk = storedHash === typedHash || storedHash === typedHashUpper
      } else if (isB64) {
        senhaOk = storedHash === typedBase64
      } else {
        senhaOk = storedHash.toLowerCase() === typedHash
      }
    } else if (data.senha || data.Senha) {
      senhaOk = (String(data.senha || data.Senha) === senha)
    }

    if (!senhaOk) {
      alert('Senha inválida.')
      loadingLogin.value = false
      return
    }

    const tipo = await determineUserRole({ ...data, registro })

    const atual = normalizeRole(data.tipo_usuario || data.Tipo_usuario)
    if (atual !== tipo) await setTipoUsuario(ref, path, tipo)

    const userSession = {
      registro,
      nome_completo: data.nome_completo || data.Nome_completo || '',
      tipo_usuario: tipo
    }

    // Force password change on first login
    if (data.forcePasswordChange || data.forceChangePassword) {
      currentUserRef.value = ref
      currentUserPath.value = path
      currentUserData.value = data
      forceChangeOpen.value = true
      loadingLogin.value = false
      return
    }

    sessionStorage.setItem('carometro_authenticated', 'true')
    sessionStorage.setItem('carometro_user', JSON.stringify(userSession))

    window.dispatchEvent(new CustomEvent('carometro-session-changed'))
    const redirect = router.currentRoute?.value?.query?.redirect || route?.query?.redirect
    router.push(redirect ? String(redirect) : '/carometro')
  } catch (e) {
    alert('Falha ao autenticar. Verifique sua conexão e tente novamente.')
  } finally {
    loadingLogin.value = false
  }
}

const logout = () => {
  try {
    sessionStorage.removeItem('carometro_authenticated')
    sessionStorage.removeItem('carometro_user')
    sessionStorage.removeItem('carometro_selecao')
  } catch {}
  window.dispatchEvent(new CustomEvent('carometro-session-changed'))
  router.push('/carometro/login')
}
// Notifications powered by Firestore (similar to encaminhamentos)
const notifications = ref([])
const loadingNotifications = ref(false)
const NOTIF_COLL = 'notificacoes_ocorrencias'

const unreadCount = computed(() => (notifications.value || []).length)

function formatDate(d) {
  try { return new Date(d).toLocaleString('pt-BR') } catch { return d }
}

async function loadNotificationsFromServer() {
  try {
    loadingNotifications.value = true
    const collRef = collection(db, NOTIF_COLL)
    const q = query(collRef, orderBy('createdAt', 'desc'), limit(25))
    const snap = await getDocs(q)
    const list = []
    snap.forEach(d => list.push({ id: d.id, ...(d.data() || {}) }))
    // Filter out acknowledged by current user
    const userReg = String(user.value?.registro || '')
    notifications.value = list.filter(n => {
      const ack = Array.isArray(n.acknowledgedBy) ? n.acknowledgedBy : []
      return !ack.includes(userReg)
    })
  } catch (e) {
    console.warn('Falha ao carregar notificações:', e)
    notifications.value = []
  } finally { loadingNotifications.value = false }
}

async function ack(note) {
  try {
    const userReg = String(user.value?.registro || '')
    const refDoc = doc(db, NOTIF_COLL, String(note.id))
    // Add current user to acknowledgedBy array (server-side merge handled by updateDoc)
    const existing = note.acknowledgedBy || []
    const updated = Array.isArray(existing) ? Array.from(new Set([...existing, userReg])) : [userReg]
    await updateDoc(refDoc, { acknowledgedBy: updated }).catch(() => {})
    // remove locally
    notifications.value = (notifications.value || []).filter(n => n.id !== note.id)
  } catch (e) {
    console.warn('Falha ao confirmar notificação:', e)
  }
}

async function ackAll() {
  try {
    const userReg = String(user.value?.registro || '')
    await Promise.all((notifications.value || []).map(async (n) => {
      const refDoc = doc(db, NOTIF_COLL, String(n.id))
      const existing = n.acknowledgedBy || []
      const updated = Array.isArray(existing) ? Array.from(new Set([...existing, userReg])) : [userReg]
      await updateDoc(refDoc, { acknowledgedBy: updated }).catch(() => {})
    }))
    notifications.value = []
  } catch (e) { console.warn('Falha ao confirmar todas notificações:', e) }
}

async function openNotification(note) {
  try {
    // Mark as acknowledged locally (and server-side)
    ack(note)

    // Persist an open request so the Carômetro view can reliably hydrate and open the modal even if
    // the event is dispatched before it mounts (and also after login redirects).
    try {
      const payload = {
        curso: note.cursoId || note.curso,
        turma: note.turmaId || note.turma,
        matricula: note.matricula,
        aluno: note.aluno || note.alunoNome || ''
      }
      sessionStorage.setItem('carometro_open_request', JSON.stringify(payload))
    } catch (_) {}

    // Navigate to Carômetro with query params (primary deep-link mechanism)
    await router.push({
      path: '/carometro',
      query: {
        curso: note.cursoId || note.curso,
        turma: note.turmaId || note.turma,
        openPessoa: note.matricula
      }
    })

    // Also dispatch an event shortly after navigation as a secondary mechanism.
    try {
      setTimeout(() => {
        try { window.dispatchEvent(new CustomEvent('carometro-open-pessoa', { detail: note })) } catch {}
      }, 100)
    } catch (_) {}
  } catch (e) { console.error('Erro ao abrir notificação:', e) }
}

onMounted(() => {
  loadNotificationsFromServer()
  const handler = () => loadNotificationsFromServer()
  window.addEventListener('carometro-session-changed', handler)
  window.addEventListener('focus', handler)
  onUnmounted(() => {
    window.removeEventListener('carometro-session-changed', handler)
    window.removeEventListener('focus', handler)
  })
})

</script>
