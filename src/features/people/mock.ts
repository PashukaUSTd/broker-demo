import type { Person } from './types'

const firstNames = ['Alice','Berta','Carmen','David','Ethan','Farah','Gita','Henry','Isa','Jon']
const lastNames = ['Iverson','Johnson','Kim','Lopez','Martinez','Ng','Olsen','Petrova','Qureshi','Rossi']
const roles: Person['role'][] = ['Admin','Viewer','Editor','Analyst']

function randToken(len = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export function makeMockPeople(n = 60): Person[] {
  const rows: Person[] = []
  const now = Date.now()
  for (let i = 0; i < n; i++) {
    const f = firstNames[i % firstNames.length]
    const l = lastNames[(i * 7) % lastNames.length]
    const email = `${f.toLowerCase()}.${l.toLowerCase()}@example.com`
    const status: Person['status'] = i % 6 === 0 ? 'Invited' : i % 4 === 0 ? 'Inactive' : 'Active'
    rows.push({
      id: (i + 1).toString(),
      firstName: f,
      lastName: l,
      email,
      login: f.toLowerCase(),
      role: roles[i % roles.length],
      status,
      timeZone: i % 3 === 0 ? 'Etc/UTC' : 'Asia/Shanghai',
      dateFormat: i % 2 === 0 ? 'YYYY-MM-DD' : 'DD.MM.YYYY',
      timeFormat: i % 2 === 0 ? 'HH:mm' : 'h:mm A',
      mfaEnabled: i % 3 === 0,
      lastLogin: status === 'Invited' ? null : new Date(now - (i+1)*86400000).toISOString(),
      createdAt: new Date(now - (i+10)*86400000).toISOString(),
      inviteToken: status === 'Invited' ? 'tok_' + randToken(12) : null
    })
  }
  return rows
}
