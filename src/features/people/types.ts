export type PersonStatus = 'Active' | 'Inactive' | 'Invited'

export interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  login: string
  role: 'Admin' | 'Viewer' | 'Editor' | 'Analyst'
  status: PersonStatus
  timeZone: string
  dateFormat: string
  timeFormat: string
  mfaEnabled: boolean
  lastLogin: string | null   // ISO
  createdAt: string          // ISO
  inviteToken?: string | null
}
