import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const isInvalid = (valor) => {
  if (valor === null || valor === undefined) return true
  if (typeof valor === 'number') return Number.isNaN(valor)
  const s = String(valor).trim()
  if (!s) return true
  const lower = s.toLowerCase()
  return lower === 'nan' || lower === 'undefined' || lower === 'null' || lower === 'invalid date'
}

export const safeValue = (valor) => {
  return isInvalid(valor) ? 'Não informado' : String(valor).trim()
}

export const formatData = (valor) => {
  if (isInvalid(valor)) return 'Não informado'
  const s = String(valor).trim()

  // Format ISO (YYYY-MM-DD)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`

  // Other formats via Date object
  try {
    const d = new Date(s)
    if (isNaN(d.getTime())) return 'Não informado'
    return d.toLocaleDateString('pt-BR')
  } catch {
    return 'Não informado'
  }
}

export const buildCsv = (pessoa, curso, turma, items = []) => {
  const sep = ','
  const head = ['Nome','Curso','Matrícula','Tipo','Data','Descrição','Autor']
  const linhas = [head.join(sep)]
  
  const nome = safeValue(pessoa?.name)
  const cursoNome = safeValue(curso?.course || curso)
  const mat = safeValue(pessoa?.matricula)
  
  items.forEach(o => {
    const cols = [
      nome,
      cursoNome,
      mat,
      safeValue(o.tipo || o.type || 'Outro'),
      formatData(o.data || o.date),
      String(o.descricao || o.description || '').replace(/\r?\n|\r/g, ' ').replace(/"/g, '""'),
      safeValue(o.user_name || o.autor)
    ]
    const escaped = cols.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
    linhas.push(escaped.join(sep))
  })
  return linhas.join('\n')
}

export const exportOcorrenciasPDF = async (pessoa, curso, turma, itens) => {
  const titulo = 'Histórico de Ocorrências'
  const aluno = `${safeValue(pessoa?.name)} - Matrícula: ${safeValue(pessoa?.matricula)} - ${safeValue(curso?.nome || curso)} - ${safeValue(turma?.nome || turma)}`

  // Build a printable container
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '1000px'
  container.style.background = '#fff'
  container.innerHTML = `
    <div style="font-family: Arial, Helvetica, sans-serif; padding: 16px; color: #222;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <div style="font-size:18px; font-weight:700;">${titulo}</div>
          <div style="color:#555;">${aluno}</div>
        </div>
        <div style="font-size:12px; color:#666;">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:8px; text-align:left; background:#f5f5f5">Tipo</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:left; background:#f5f5f5">Data</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:left; background:#f5f5f5">Autor</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:left; background:#f5f5f5">Descrição</th>
          </tr>
        </thead>
        <tbody>
          ${itens.length ? itens.map(o => `
            <tr>
              <td style="border:1px solid #ddd; padding:8px; vertical-align:top">${safeValue(o.tipo || o.type || 'Outro')}</td>
              <td style="border:1px solid #ddd; padding:8px; vertical-align:top">${formatData(o.data || o.date)}</td>
              <td style="border:1px solid #ddd; padding:8px; vertical-align:top">${safeValue(o.user_name || o.autor)}</td>
              <td style="border:1px solid #ddd; padding:8px; vertical-align:top">${String(o.descricao || o.description || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
            </tr>
          `).join('') : '<tr><td colspan="4" style="border:1px solid #ddd; padding:16px; text-align:center">Sem ocorrências</td></tr>'}
        </tbody>
      </table>
    </div>
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgProps = pdf.getImageProperties(imgData)
    const imgWidth = pdfWidth
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width
    let position = 0

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      let remainingHeight = imgHeight
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, position * -1, imgWidth, imgHeight)
        remainingHeight -= pdfHeight
        position += pdfHeight
        if (remainingHeight > 0) pdf.addPage()
      }
    }

    const fileSafeName = aluno.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '')
    pdf.save(`${fileSafeName}_ocorrencias.pdf`)
  } catch (e) {
    console.error('Erro ao gerar PDF', e)
    throw e
  } finally {
    try { document.body.removeChild(container) } catch {}
  }
}

export const exportAniversariantesPDF = async (aniversariantes) => {
  const titulo = `Aniversariantes do Mês de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '800px'
  container.style.background = '#fff'
  container.innerHTML = `
    <div style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #222;">
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="font-size:24px; color:#C1272C; margin-bottom:8px;">${titulo}</h1>
        <p style="color:#666;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="border:1px solid #dee2e6; padding:12px; text-align:left;">Dia</th>
            <th style="border:1px solid #dee2e6; padding:12px; text-align:left;">Nome</th>
            <th style="border:1px solid #dee2e6; padding:12px; text-align:left;">E-mail</th>
          </tr>
        </thead>
        <tbody>
          ${aniversariantes.length ? aniversariantes.map(a => `
            <tr>
              <td style="border:1px solid #dee2e6; padding:12px; font-weight:bold;">${new Date(a.birthDate).getDate()}</td>
              <td style="border:1px solid #dee2e6; padding:12px;">${a.name}</td>
              <td style="border:1px solid #dee2e6; padding:12px; color:#555;">${a.email || 'N/A'}</td>
            </tr>
          `).join('') : '<tr><td colspan="3" style="border:1px solid #dee2e6; padding:24px; text-align:center;">Nenhum aniversariante encontrado</td></tr>'}
        </tbody>
      </table>
    </div>
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
    pdf.save(`aniversariantes_${new Date().getMonth() + 1}.pdf`)
  } finally {
    try { document.body.removeChild(container) } catch {}
  }
}
