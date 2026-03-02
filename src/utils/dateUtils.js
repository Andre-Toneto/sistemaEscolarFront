export const toDateOnly = (d) => {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date)) return null
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const fromDateOnly = (s) => {
  if (!s) return null
  const dateStr = String(s).split('T')[0]
  const [y, m, dd] = dateStr.split('-').map(Number)
  if (isNaN(y) || isNaN(m) || isNaN(dd)) return null
  return new Date(y, m - 1, dd)
}

export const startOfWeekMonday = (d) => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export const weekDaysMonSat = (d) => {
  const start = startOfWeekMonday(d)
  const days = []
  for (let i = 0; i < 6; i++) {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    days.push(x)
  }
  return days
}

export const monthMatrix = (year, month) => {
  const first = new Date(year, month, 1)
  const start = startOfWeekMonday(first)
  const weeks = []
  let cursor = new Date(start)
  do {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  } while (cursor.getMonth() === month || (weeks.length < 6 && cursor.getMonth() !== month))
  return weeks
}
