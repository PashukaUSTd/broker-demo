import type { FormSchema } from '@/form/builder'
import { dateFormats, timeFormats, timeZones } from '@/form/builder'

export const personForm: FormSchema = {
  title: 'Person',
  fields: [
    { code: 'firstName', label: 'First name', type: 'string', required: true },
    { code: 'lastName', label: 'Last name', type: 'string', required: true },
    { code: 'email', label: 'Email', type: 'email', required: true },
    { code: 'login', label: 'Login', type: 'string', required: true },
    { code: 'role', label: 'Role', type: 'select', options: ['Admin','Editor','Viewer','Analyst'].map(x => ({ label: x, value: x })) },
    { code: 'status', label: 'Status', type: 'select', options: ['Active','Inactive','Invited'].map(x => ({ label: x, value: x })) },
    { code: 'timeZone', label: 'Time zone', type: 'timezone', options: timeZones },
    { code: 'dateFormat', label: 'Date format', type: 'dateformat', options: dateFormats },
    { code: 'timeFormat', label: 'Time format', type: 'timeformat', options: timeFormats },
  ]
}
