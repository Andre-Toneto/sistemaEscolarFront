<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="12" rounded="lg" class="pa-6">
          <v-card-title class="text-center pb-4">
            <div class="text-center">
              <v-icon size="48" color="senai-red" class="mb-2">mdi-account-group</v-icon>
              <h2 class="text-h4 text-senai-red font-weight-medium mb-2">Acesse sua conta</h2>
              <p class="text-body-1 text-medium-emphasis">Autenticação necessária</p>
            </div>
          </v-card-title>

          <v-card-text>
            <v-form ref="loginFormRef" v-model="loginFormValid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="credentials.registro"
                label="Número de registro"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-card-account-details"
                :rules="registroRules"
                class="mb-3"
                autocomplete="username"
              />

              <v-text-field
                v-model="credentials.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                label="Senha"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarSenha = !mostrarSenha"
                :rules="senhaRules"
                class="mb-4"
                autocomplete="current-password"
              />

              <v-btn
                :disabled="!loginFormValid"
                :loading="loadingLogin"
                color="senai-red"
                size="large"
                block
                type="submit"
                elevation="2"
              >
                Entrar
              </v-btn>

              <!-- <div class="text-center mt-4">
                <v-btn variant="text" color="senai-red" @click="abrirCadastro" prepend-icon="mdi-account-plus">
                  Cadastre-se
                </v-btn>
              </div> -->
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- <v-dialog v-model="cadastroAberto" max-width="640">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Cadastro de usuário</v-card-title>
        <v-card-text>
          <v-form ref="cadastroFormRef" v-model="cadastroFormValid" @submit.prevent="registrar">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cadastro.registro"
                  label="Número de registro (usuário)"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-card-account-details"
                  :rules="registroRules"
                  autocomplete="off"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="cadastro.cpf"
                  label="CPF"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-card-account-details-outline"
                  :rules="cpfRules"
                  autocomplete="off"
                />
              </v-col>
              <v-col cols="12">
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
                  :disabled="true"
                  hint="Definido pela instituição"
                  persistent-hint
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
    </v-dialog> -->

    <v-dialog v-model="forceChangeOpen" persistent max-width="600">
      <v-card rounded="lg">
        <v-card-title>Alterar senha (primeiro acesso)</v-card-title>
        <v-card-text>
          <p>Como este é seu primeiro acesso, é necessário criar uma nova senha.</p>
          <v-form ref="changeFormRef" v-model="changeFormValid" @submit.prevent="changePassword">
            <v-text-field
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="Nova senha"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNewPassword = !showNewPassword"
              :rules="newPasswordRules"
              class="mb-3"
            />

            <v-text-field
              v-model="confirmNewPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="Confirmar nova senha"
              prepend-inner-icon="mdi-lock-check"
              :rules="confirmNewPasswordRules"
              class="mb-4"
            />

            <v-alert v-if="changeError" type="error" variant="tonal" class="mb-4">
              {{ changeError }}
            </v-alert>

            <v-btn :loading="loadingChange" color="senai-red" size="large" block type="submit">
              Criar nova senha
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from "@/services/auth.services"
// import { db } from '@/services/firebase.js'
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
// import { sha256Hex, hexToBase64 } from '@/utils/hash.js'
// import { restGetDoc, restSetDoc, restUpdateDoc } from '@/services/firestoreRest.js'
import { api } from "@/api/axios"

const router = useRouter()
const route = useRoute()

// Login state
const loginFormRef = ref(null)
const loginFormValid = ref(false)
const loadingLogin = ref(false)
const mostrarSenha = ref(false)

const credentials = ref({
  registro: '',
  senha: ''
})

// Cadastro state
const cadastroAberto = ref(false)
// const cadastroFormRef = ref(null)
// const cadastroFormValid = ref(false)
// const loadingCadastro = ref(false)
// const mostrarSenhaCadastro = ref(false)
const cadastroErro = ref('')

onMounted(() => {
  try {
    const abrir = route.query && (route.query.cadastro === '1' || route.query.cadastro === 'true' || route.query.cadastro === true)
    if (abrir) {
      cadastroAberto.value = true
    }
  } catch {}
})

// const cadastro = ref({
//   registro: '',
//   cpf: '',
//   data_nascimento: '',
//   nome_completo: '',
//   senha: '',
//   confirmarSenha: '',
//   tipo_usuario: 'usuario'
// })

// const tiposUsuario = [
//   { title: 'Usuário', value: 'usuario' }
// ]

// Change-password state
const forceChangeOpen = ref(false)
const changeFormRef = ref(null)
const changeFormValid = ref(false)
const newPassword = ref('')
const confirmNewPassword = ref('')
const showNewPassword = ref(false)
const loadingChange = ref(false)
const changeError = ref('')
const currentUserRef = ref(null)
const currentUserPath = ref('')
const currentUserData = ref(null)

const error = ref("")

const newPasswordRules = [
  v => !!v || 'Nova senha é obrigatória',
  v => (v && v.length >= 6) || 'Senha precisa ter ao menos 6 caracteres'
]
const confirmNewPasswordRules = [
  v => !!v || 'Confirmação é obrigatória',
  v => v === newPassword.value || 'As senhas não conferem'
]

// Rules
const registroRules = [v => !!v || 'Número de registro é obrigatório']
const senhaRules = [v => !!v || 'Senha é obrigatória']

// Utils
function normalizeHex(s) {
  const t = String(s || '').trim().replace(/^0x/i, '').replace(/[^a-fA-F0-9]/g, '')
  return t
}
function isHex64(s) {
  return normalizeHex(s).length === 64
}
function isB64Like(s) {
  const v = String(s || '').trim()
  return /^[A-Za-z0-9+/_-]+={0,2}$/.test(v)
}
function toStdB64(s) {
  let v = String(s || '').trim().replace(/-/g, '+').replace(/_/g, '/')
  const pad = v.length % 4
  if (pad) v = v + '='.repeat(4 - pad)
  return v
}

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
    const { snap } = await getAdminDoc(currentData?.registro || currentData?.cpf || '')
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

// async function createOrSetUser(targetRef, targetPath, data) {
//   try {
//     if (targetRef) return await setDoc(targetRef, data)
//   } catch (_) {}
//   return await restSetDoc(targetPath, data)
// }

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
    const storedHashRaw = data.senhaHash || data.SenhaHash || data.senha_hash || data.hashSenha || data.passwordHash || ''
    const storedHash = String(storedHashRaw || '').trim()

    const senhaPlain = String(senha)
    const senhaTrimmed = senhaPlain.trim()

    const typedHash = await sha256Hex(senhaPlain)
    const typedHashUpper = typedHash.toUpperCase()
    const typedBase64 = hexToBase64(typedHash)

    const typedHashTrim = senhaTrimmed !== senhaPlain ? await sha256Hex(senhaTrimmed) : typedHash
    const typedBase64Trim = hexToBase64(typedHashTrim)

    let senhaOk = false
    if (storedHash) {
      const sh = storedHash
      if (isHex64(sh)) {
        const hexNorm = normalizeHex(sh).toLowerCase()
        senhaOk = hexNorm === typedHash || hexNorm === typedHashTrim || hexNorm === typedHashUpper.toLowerCase()
      } else if (isB64Like(sh)) {
        const stdStored = toStdB64(sh)
        const stdTyped = toStdB64(typedBase64)
        const stdTypedTrim = toStdB64(typedBase64Trim)
        senhaOk = stdStored === stdTyped || stdStored === stdTypedTrim
      } else {
        senhaOk = sh.toLowerCase() === typedHash || sh.toLowerCase() === typedHashTrim
      }
    } else if (data.senha || data.Senha) {
      const storedPlain = String(data.senha || data.Senha)
      senhaOk = (storedPlain === senhaPlain) || (storedPlain === senhaTrimmed)
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
      cpf: data.cpf || data.CPF || '',
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
    const redirect = route?.query?.redirect
    router.push(redirect ? String(redirect) : '/carometro')
  } catch (e) {
    alert('Falha ao autenticar. Verifique sua conexão e tente novamente.')
  } finally {
    loadingLogin.value = false
  }
}

async function handleLogin() {
  try {
    loadingLogin.value = true
    // error.value = ""

    // await login(credentials.value.registro, credentials.value.senha)
     const { data } = await api.post("/users/login", {
      nif: credentials.value.registro,
      password: credentials.value.senha
    })
    console.log('login response ', data.token)
    localStorage.setItem("token", data.token)
    localStorage.setItem("role", data.user.role)

    router.push("/users")


    // router.push("/home")

  } catch (err) {
    error.value =
      err.response?.data?.message || "Erro ao fazer login"
  } finally {
    loadingLogin.value = false
  }
}

const abrirCadastro = () => {
  cadastroErro.value = ''
  cadastroAberto.value = true
}

// const registrar = async () => {
//   if (!cadastroFormValid.value) return
//   loadingCadastro.value = true
//   cadastroErro.value = ''
//   try {
//     const dados = { ...cadastro.value }
//     const registro = String(dados.registro || '').trim()

//     const res = await getUserDoc(registro)
//     if (res.snap.exists()) {
//       cadastroErro.value = 'Já existe um usuário com este número de registro.'
//       loadingCadastro.value = false
//       return
//     }

//     const senhaHash = await sha256Hex(dados.senha)

//     const payload = {
//       registro,
//       cpf: (dados.cpf || '').replace(/\D/g, ''),
//       data_nascimento: dados.data_nascimento,
//       nome_completo: dados.nome_completo,
//       tipo_usuario: 'usuario',
//       senhaHash,
//       forcePasswordChange: true,
//       createdAt: new Date().toISOString()
//     }

//     await createOrSetUser(res.ref, res.path, payload)

//     cadastroAberto.value = false

//     credentials.value.registro = registro
//     credentials.value.senha = dados.senha

//     await authenticate()
//   } catch (e) {
//     cadastroErro.value = 'Falha ao cadastrar. Tente novamente.'
//   } finally {
//     loadingCadastro.value = false
//   }
// }

const changePassword = async () => {
  if (!changeFormValid.value) return
  loadingChange.value = true
  changeError.value = ''
  try {
    if (!currentUserRef.value && !currentUserPath.value) {
      changeError.value = 'Usuário inválido.'
      loadingChange.value = false
      return
    }

    if (!newPassword.value || newPassword.value.length < 6) {
      changeError.value = 'Senha precisa ter ao menos 6 caracteres.'
      loadingChange.value = false
      return
    }

    if (newPassword.value !== confirmNewPassword.value) {
      changeError.value = 'As senhas não conferem.'
      loadingChange.value = false
      return
    }

    const newHash = await sha256Hex(newPassword.value)
    try {
      if (currentUserRef.value) {
        await updateDoc(currentUserRef.value, {
          senhaHash: newHash,
          forcePasswordChange: false,
          passwordChangedAt: new Date().toISOString()
        })
      } else if (currentUserPath.value) {
        await restUpdateDoc(currentUserPath.value, {
          senhaHash: newHash,
          forcePasswordChange: false,
          passwordChangedAt: new Date().toISOString()
        })
      }
    } catch (e) {
      changeError.value = 'Falha ao atualizar senha. Tente novamente.'
      loadingChange.value = false
      return
    }

    // Set session and navigate
    const user = currentUserData.value || {}
    const userSession = {
      registro: user.registro || credentials.value.registro,
      nome_completo: user.nome_completo || user.Nome_completo || '',
      cpf: user.cpf || user.CPF || '',
      tipo_usuario: user.tipo_usuario || user.Tipo_usuario || 'usuario'
    }
    sessionStorage.setItem('carometro_authenticated', 'true')
    sessionStorage.setItem('carometro_user', JSON.stringify(userSession))

    window.dispatchEvent(new CustomEvent('carometro-session-changed'))
    forceChangeOpen.value = false
    newPassword.value = ''
    confirmNewPassword.value = ''

    const redirect = route?.query?.redirect
    router.push(redirect ? String(redirect) : '/carometro')
  } finally {
    loadingChange.value = false
  }
}
</script>
