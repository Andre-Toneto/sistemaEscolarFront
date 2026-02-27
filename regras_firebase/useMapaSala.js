import { ref } from 'vue'
import { db } from '@/services/firebase.js'
import { collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { sha256Hex } from '@/utils/hash.js'

const SALAS_FIXAS = [
  'A10','A11','A12','A14','A15','B12', 'B13','B18', 'Ajustagem','Tornearia','Torno CNC','Centro de Usinagem CNC'
]
const SALAS_B = Array.from({ length: 10 }, (_, i) => `B${24 + i}`) // B24 até B33
const SALAS_FALLBACK = [...SALAS_FIXAS.slice(0,8), ...SALAS_B, ...SALAS_FIXAS.slice(8)]

const SALAS = ref([...SALAS_FALLBACK])

export const useMapaSala = () => {
  const PERIODOS = [
    { id: 'manha', label: 'Manhã', start: '07:00', end: '12:00' },
    { id: 'tarde', label: 'Tarde', start: '13:00', end: '18:00' },
    { id: 'noite', label: 'Noite', start: '19:00', end: '22:00' }
  ]

  // Helpers de data
  // const toDateOnly = (d) => {
  //   console.log(d)
  //   const yyyy = d.getFullYear()
  //   const mm = String(d.getMonth() + 1).padStart(2, '0')
  //   const dd = String(d.getDate()).padStart(2, '0')
  //   return `${yyyy}-${mm}-${dd}`
  // }
  const toDateOnly = (d) => {
    const date = d instanceof Date ? d : new Date(d)

    if (isNaN(date)) {
      console.warn('toDateOnly: data inválida', d)
      return null
    }

    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  const fromDateOnly = (s) => {
    const [y,m,dd] = String(s).split('-').map(Number)
    return new Date(y, m - 1, dd)
  }
  const startOfWeekMonday = (d) => {
    const date = new Date(d)
    const day = date.getDay() // 0..6, 0 = dom
    const diff = (day === 0 ? -6 : 1 - day) // segunda
    date.setDate(date.getDate() + diff)
    date.setHours(0,0,0,0)
    return date
  }
  const weekDaysMonSat = (d) => {
    const start = startOfWeekMonday(d)
    const days = []
    for (let i = 0; i < 6; i++) {
      const x = new Date(start)
      x.setDate(start.getDate() + i)
      days.push(x)
    }
    return days
  }
  const monthMatrix = (year, month) => {
    const first = new Date(year, month, 1)
    const start = startOfWeekMonday(first)
    const weeks = []
    let cursor = new Date(start)
    do {
      const week = []
      for (let i = 0; i < 7; i++) {
        const x = new Date(cursor)
        week.push(x)
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    } while (cursor.getMonth() === month || cursor.getDay() !== 1)
    return weeks
  }

  const fetchSalas = async () => {
    try {
      const qy = query(salasColl(), orderBy('ordem', 'asc'))
      const snap = await getDocs(qy)
      if (snap.empty) {
        await initializeSalas()
        SALAS.value = [...SALAS_FALLBACK]
        return SALAS_FALLBACK
      }
      const items = []
      snap.forEach(d => {
        const data = d.data()
        if (data && data.nome) {
          items.push(data.nome)
        }
      })
      if (items.length > 0) {
        SALAS.value = items
        return items
      }
      SALAS.value = [...SALAS_FALLBACK]
      return SALAS_FALLBACK
    } catch (e) {
      console.warn('Erro ao carregar salas do Firestore:', e)
      SALAS.value = [...SALAS_FALLBACK]
      return SALAS_FALLBACK
    }
  }

  const initializeSalas = async () => {
    const batch = writeBatch(db)
    SALAS_FALLBACK.forEach((nome, i) => {
      const ref = doc(salasColl(), nome)
      batch.set(ref, { nome, ordem: i })
    })
    await batch.commit()
  }

  const renomearSala = async (oldName, newName, user) => {
    const role = String(user?.tipo_usuario || '').toLowerCase()
    if (role !== 'admin' && role !== 'adm') throw new Error('Apenas administradores podem renomear salas')

    const newNameClean = String(newName || '').trim()
    if (!newNameClean || newNameClean === oldName) return

    // 1. Update/Move room doc
    const oldRef = doc(salasColl(), oldName)
    const newRef = doc(salasColl(), newNameClean)

    const oldSnap = await getDoc(oldRef)
    const oldData = oldSnap.exists() ? oldSnap.data() : { ordem: 999 }

    await setDoc(newRef, { ...oldData, nome: newNameClean })
    await deleteDoc(oldRef)

    // 2. Migrate reservations
    // Note: this could be many docs. For safety, we only migrate future or recent ones?
    // User probably wants all. We'll do a query and loop.
    const qy = query(reservasColl(), where('sala', '==', oldName))
    const snap = await getDocs(qy)

    const operations = []
    snap.forEach(d => {
      const data = d.data()
      const newId = `${newNameClean}__${data.data}__${data.periodo}`
      const newResRef = doc(reservasColl(), newId)
      const oldResRef = d.ref

      operations.push(async () => {
        await setDoc(newResRef, { ...data, sala: newNameClean })
        await deleteDoc(oldResRef)
      })
    })

    // Run migrations in chunks
    for (const op of operations) {
      await op()
    }
  }

  const removerEmLote = async (diasISO, sala, periodos, user) => {
    if (!diasISO?.length || !sala || !periodos?.length || !user) throw new Error('Dados inválidos')

    const role = String(user?.tipo_usuario || '').toLowerCase()
    const isAdmin = role === 'admin' || role === 'adm'

    for (const dia of diasISO) {
      for (const p of periodos) {
        const id = `${sala}__${dia}__${p}`
        const resRef = doc(reservasColl(), id)
        const snap = await getDoc(resRef)

        if (snap.exists()) {
          const res = snap.data()
          if (isAdmin || String(res.registro || '').trim() === String(user.registro || '').trim()) {
            await deleteDoc(resRef)
            if (cache.value?.[dia]?.[sala]?.[p]) delete cache.value[dia][sala][p]
          }
        }
      }
    }
  }

  // Firestore refs
  const reservasColl = () => collection(db, 'salas_reservas')
  const profsColl = () => collection(db, 'salas_usuarios')
  const usersColl = () => collection(db, 'users')
  const salasColl = () => collection(db, 'salas_config')

  // Mapa em memória: { 'YYYY-MM-DD': { [sala]: { [periodo]: reservaObj } } }
  const cache = ref({})
  const loading = ref(false)

  // Busca reservas por intervalo [ini, fim]
  const fetchRange = async (iniDate, fimDate) => {
    try {
      loading.value = true
      const ini = toDateOnly(iniDate)
      const fim = toDateOnly(fimDate)
      const qy = query(reservasColl(), where('data', '>=', ini), where('data', '<=', fim), orderBy('data', 'asc'))
      const snap = await getDocs(qy)
      snap.forEach(d => {
        const r = d.data()
        const dia = r.data
        if (!cache.value[dia]) cache.value[dia] = {}
        if (!cache.value[dia][r.sala]) cache.value[dia][r.sala] = {}
        cache.value[dia][r.sala][r.periodo] = { id: d.id, ...r }
      })
    } finally {
      loading.value = false
    }
  }

  const fetchWeek = async (baseDate = new Date()) => {
    const days = weekDaysMonSat(baseDate)
    const ini = days[0]
    const fim = days[days.length - 1]
    await fetchRange(ini, fim)
    return { days }
  }

  const fetchMonth = async (year, month) => {
    const mtx = monthMatrix(year, month)
    const first = mtx[0][0]
    const last = mtx[mtx.length - 1][6]
    await fetchRange(first, last)
    return { matrix: mtx }
  }

  const getReserva = (diaISO, sala, periodo) => cache.value?.[diaISO]?.[sala]?.[periodo] || null

  const stringToColor = async (str) => {
    const hex = await sha256Hex(str)
    const h = parseInt(hex.slice(0, 6), 16) % 360
    const s = 65
    const l = 55
    return `hsl(${h}deg ${s}% ${l}%)`
  }

  const getOrCreateUser = async (registro, nome) => {
    const id = String(registro || '').trim() || String(nome || '').trim().toLowerCase()
    const ref = doc(profsColl(), id)
    const snap = await getDoc(ref)
    if (snap.exists()) return { id, ...(snap.data() || {}) }
    const cor = await stringToColor(id)
    const payload = { registro: id, nome: nome || id, cor, createdAt: new Date().toISOString() }
    await setDoc(ref, payload, { merge: true })
    return { id, ...payload }
  }

  // Lista usuários do sistema (collection 'users') para seleção por nome (admins)
  const listUsuarios = async () => {
    const qy = query(usersColl(), orderBy('nome_completo', 'asc'))
    const snap = await getDocs(qy)
    const items = []
    snap.forEach(d => {
      const data = d.data() || {}
      items.push({ id: d.id, registro: data.registro || data.uid || d.id, nome: data.nome_completo || data.nome || d.id, cor: data.cor || data.color || null })
    })
    return items
  }

  const canEdit = (reserva, user) => {
    if (!reserva || !user) return false
    const role = String(user?.tipo_usuario || '').toLowerCase()
    if (role === 'admin' || role === 'adm') return true
    return String(reserva.registro || '').trim() === String(user.registro || '').trim()
  }

  const reservar = async (diaISO, sala, periodo, user, curso = '', extra = {}) => {
    if (!diaISO || !sala || !periodo || !user) throw new Error('Dados inválidos')
    const existente = getReserva(diaISO, sala, periodo)
    if (existente) throw new Error('Período já reservado')

    const usr = await getOrCreateUser(user.registro, user.nome_completo || user.registro)
    const id = `${sala}__${diaISO}__${periodo}`
    const ref = doc(reservasColl(), id)
    const payload = {
      sala,
      data: diaISO,
      periodo,
      curso: String(curso || '').trim(),
      cursoPeriodo: String(extra.cursoPeriodo || '').trim(),
      registro: usr.registro || usr.id,
      nome: usr.nome,
      cor: usr.cor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await setDoc(ref, payload, { merge: false })
    if (!cache.value[diaISO]) cache.value[diaISO] = {}
    if (!cache.value[diaISO][sala]) cache.value[diaISO][sala] = {}
    cache.value[diaISO][sala][periodo] = { id, ...payload }
    return { id, ...payload }
  }

  const atualizar = async (id, patch, user) => {
    if (!id) throw new Error('ID inválido')
    const [sala, diaISO, periodo] = id.split('__')
    const atual = getReserva(diaISO, sala, periodo)
    if (!atual) throw new Error('Reserva não encontrada')
    if (!canEdit(atual, user)) throw new Error('Sem permissão para editar')
    const ref = doc(reservasColl(), id)
    const novo = { ...atual, ...patch, updatedAt: new Date().toISOString() }
    await setDoc(ref, novo, { merge: true })
    cache.value[diaISO][sala][periodo] = { id, ...novo }
    return { id, ...novo }
  }

  const remover = async (id, user) => {
    if (!id) throw new Error('ID inválido')
    const [sala, diaISO, periodo] = id.split('__')
    const atual = getReserva(diaISO, sala, periodo)
    if (!atual) return true
    if (!canEdit(atual, user)) throw new Error('Sem permissão para remover')
    await deleteDoc(doc(reservasColl(), id))
    if (cache.value?.[diaISO]?.[sala]?.[periodo]) delete cache.value[diaISO][sala][periodo]
    return true
  }

  return {
    SALAS,
    PERIODOS,
    toDateOnly,
    weekDaysMonSat,
    monthMatrix,
    fetchRange,
    fetchWeek,
    fetchMonth,
    getReserva,
    reservar,
    atualizar,
    remover,
    removerEmLote,
    fetchSalas,
    initializeSalas,
    renomearSala,
    canEdit,
    loading,
    cache,
    listUsuarios
  }
}
