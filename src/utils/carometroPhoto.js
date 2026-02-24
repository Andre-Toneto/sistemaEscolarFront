export const toNFC = (s) => { 
  try { return String(s || '').normalize('NFC') } catch { return String(s || '') } 
}

export const baseNome = (nome) => String(nome || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s_-]/g, '')
  .replace(/\s+/g, ' ')

export const nomeComSep = (nome, sep) => baseNome(nome).replace(/\s+/g, sep)

export const mapearCursoParaPasta = (cursoNome) => {
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

export const folderVariants = (str, isCurso = false) => {
  if (!str || typeof str !== 'string') return []
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
  return [...new Set(variants.filter(v => typeof v === 'string' && v.trim()))]
}

const enc = (s) => encodeURIComponent(String(s || ''))

export const buildCandidatosModal = (pessoa, curso, turma) => {
  // Garantir IDs ou nomes como strings
  const cursoId = (typeof curso === 'string' ? curso : (curso?.id || curso?.nome || pessoa?.curso)) || ''
  const turmaId = (typeof turma === 'string' ? turma : (turma?.id || turma?.class_name || turma?.nome || pessoa?.turma)) || ''

  if (!cursoId || !turmaId || typeof cursoId !== 'string' || typeof turmaId !== 'string') return []

  const matricula = String(pessoa?.matricula || '').trim()
  const nome = String(pessoa?.nome || '').trim()

  const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './'
  const turmaStr = String(turmaId || '').replace(/\s+/g, '').trim()
  const exts = ['.png', '.jpg', '.PNG', '.jpeg']
  const candidatos = []

  const cursoFolderVariants = folderVariants(cursoId, true)
  const extras = ['SeducTecEletromecanica', 'SesiTecAdm', 'SesiTecDesSist', 'Cai', 'CAI']
  extras.forEach(e => { if (!cursoFolderVariants.includes(e)) cursoFolderVariants.push(e) })

  if (matricula) {
    for (const ext of exts) {
      for (const f of cursoFolderVariants) {
        candidatos.push(`${base}uploads/fotos/${enc(f)}/${enc(turmaStr)}/${enc(matricula)}${ext}`)
        candidatos.push(`${base}fotos/${enc(f)}/${enc(turmaStr)}/${enc(matricula)}${ext}`)
      }
    }
  }

  if (nome) {
    const nomes = [
      nome,
      nome.replace(/\s+/g, '_'),
      nome.replace(/\s+/g, ' ').split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' '),
      nome.toUpperCase()
    ]
    for (const ext of exts) {
      for (const f of cursoFolderVariants) {
        for (const n of nomes) {
          candidatos.push(`${base}uploads/fotos/${enc(f)}/${enc(turmaStr)}/${enc(n)}${ext}`)
          candidatos.push(`${base}fotos/${enc(f)}/${enc(turmaStr)}/${enc(n)}${ext}`)
        }
      }
    }
  }

  return [...new Set(candidatos.filter(Boolean))]
}

export const buildFotoPadrao = (pessoa, curso, turma) => {
  const cursoId = (typeof curso === 'string' ? curso : (curso?.id || curso?.nome || pessoa?.curso)) || ''
  const turmaId = (typeof turma === 'string' ? turma : (turma?.id || turma?.class_name || turma?.nome || pessoa?.turma)) || ''

  if (!cursoId || !turmaId || typeof cursoId !== 'string' || typeof turmaId !== 'string') return ''

  const baseURL = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './'
  const turmaStr = String(turmaId || '').replace(/\s+/g, '').trim()
  const cursoFolderVariants = folderVariants(cursoId, true)

  const prefer = ['Cai', 'CAI']
  prefer.forEach(p => {
    const idx = cursoFolderVariants.indexOf(p)
    if (idx > 0) {
      cursoFolderVariants.splice(idx, 1)
      cursoFolderVariants.unshift(p)
    }
  })

  cursoFolderVariants.push('SeducTecEletromecanica', 'SesiTecAdm')

  const matricula = String(pessoa?.matricula || '')
  const nome = String(pessoa?.nome || '')

  if (matricula) return `${baseURL}uploads/fotos/${enc(cursoFolderVariants[0])}/${enc(turmaStr)}/${enc(matricula)}.png`
  return `${baseURL}fotos/${enc(cursoFolderVariants[0])}/${enc(turmaStr)}/${enc(nome)}.png`
}

export const ensureFoto = (pessoa, curso, turma) => {
  if (!pessoa) return
  
  const candidatos = buildCandidatosModal(pessoa, curso, turma)
  
  if (!pessoa.foto) {
    try { pessoa.foto = buildFotoPadrao(pessoa, curso, turma) } catch {}
  }
  
  if (!candidatos || candidatos.length === 0) return
  
  let i = 0
  let found = false
  
  const tryNext = () => {
    if (i >= candidatos.length || found) return
    const url = candidatos[i++]
    
    const img = new Image()
    const t = setTimeout(() => { 
      img.onload = img.onerror = null
      if (!found) tryNext() 
    }, 1500)
    
    img.onload = () => {
      clearTimeout(t)
      if (!found) {
        found = true
        pessoa.foto = url
      }
    }
    img.onerror = () => { 
      clearTimeout(t)
      if (!found) tryNext() 
    }
    img.src = url
  }
  
  tryNext()
}
