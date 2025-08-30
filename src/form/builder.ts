export type FieldType = 'string' | 'email' | 'select' | 'timezone' | 'dateformat' | 'timeformat'

export interface FieldSchema {
  code: string
  label: string
  type: FieldType
  options?: { label: string; value: string }[]
  required?: boolean
}

export interface FormSchema {
  title: string
  fields: FieldSchema[]
}

export const timeZones = [
  { label: 'UTC−12:00', value: 'Etc/GMT+12' },
  { label: 'UTC', value: 'Etc/UTC' },
  { label: 'UTC+01:00', value: 'Etc/GMT-1' },
  { label: 'UTC+03:00', value: 'Etc/GMT-3' },
  { label: 'UTC+05:30', value: 'Asia/Kolkata' },
  { label: 'UTC+08:00', value: 'Asia/Shanghai' },
]

export const dateFormats = ['YYYY-MM-DD', 'DD.MM.YYYY', 'MM/DD/YYYY'].map(x => ({ label: x, value: x }))
export const timeFormats = ['HH:mm', 'h:mm A'].map(x => ({ label: x, value: x }))
