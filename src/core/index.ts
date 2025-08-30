import { ref, reactive, computed, watch } from 'vue'

export type BaseId = string | number

export interface BaseModel {
  id: BaseId
  [k: string]: any
}

export type Nullable<T> = T | null

export enum CrudStatus {
  Idle = 'idle',
  Loading = 'loading',
  Saving = 'saving',
  Error = 'error',
  Success = 'success'
}

export type SortDirection = 'asc' | 'desc'
export interface SortBy {
  field: string
  direction: SortDirection
}

export interface Page {
  page: number
  pageSize: number
  total: number
}

export type FilterOp = 'eq' | 'ne' | 'contains' | 'startsWith' | 'in'

export interface FilterItem {
  field: string
  op: FilterOp
  value: unknown
}

export interface QueryOptions {
  filters?: FilterItem[]
  sortBy?: SortBy | null
  page?: Page
  search?: string
}

export interface Service<T extends BaseModel> {
  list(query: QueryOptions): Promise<{ data: T[]; total: number }>
  get(id: BaseId): Promise<T | null>
  create(payload: Partial<T>): Promise<T>
  update(id: BaseId, payload: Partial<T>): Promise<T>
  remove(id: BaseId): Promise<void>
}

export function applyFilters<T extends Record<string, any>>(rows: T[], filters: FilterItem[] = []): T[] {
  return rows.filter(row => {
    return filters.every(f => {
      const v = row[f.field]
      if (f.op === 'eq') return v === f.value
      if (f.op === 'ne') return v !== f.value
      if (f.op === 'in' && Array.isArray(f.value)) return (f.value as any[]).includes(v)
      if (typeof v === 'string' && typeof f.value === 'string') {
        if (f.op === 'contains') return v.toLowerCase().includes((f.value as string).toLowerCase())
        if (f.op === 'startsWith') return v.toLowerCase().startsWith((f.value as string).toLowerCase())
      }
      return false
    })
  })
}

export function applySearch<T extends Record<string, any>>(rows: T[], term: string | undefined, keys: string[]): T[] {
  if (!term) return rows
  const q = term.toLowerCase()
  return rows.filter(r => keys.some(k => String(r[k] ?? '').toLowerCase().includes(q)))
}

export function applySort<T>(rows: T[], sortBy: SortBy | null): T[] {
  if (!sortBy) return rows
  const { field, direction } = sortBy
  const mul = direction === 'asc' ? 1 : -1
  return [...rows].sort((a: any, b: any) => {
    const av = a[field]
    const bv = b[field]
    if (av === bv) return 0
    return (av > bv ? 1 : -1) * mul
  })
}

export function paginate<T>(rows: T[], page: Page): { data: T[]; total: number } {
  const start = (page.page - 1) * page.pageSize
  const end = start + page.pageSize
  return { data: rows.slice(start, end), total: rows.length }
}

// Minimal Broker base with selection and query controls
export class Broker<T extends BaseModel> {
  status = ref<CrudStatus>(CrudStatus.Idle)
  error = ref<string | null>(null)
  items = ref<T[]>([])
  selection = ref<T[]>([])

  search = ref<string>('')
  filters = ref<FilterItem[]>([])
  sortBy = ref<SortBy | null>(null)
  page = reactive<Page>({ page: 1, pageSize: 10, total: 0 })

  constructor(public service: Service<T>) { }

  setSort(field: string) {
    const current = this.sortBy.value
    if (!current || current.field !== field) {
      this.sortBy.value = { field, direction: 'asc' }
    } else {
      this.sortBy.value = { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    }
    this.fetch()
  }

  setPage(p: number) { this.page.page = p; this.fetch() }
  setPageSize(ps: number) { this.page.pageSize = ps; this.page.page = 1; this.fetch() }
  setSearch(q: string) { this.search.value = q; this.page.page = 1; this.fetch() }
  setFilters(next: FilterItem[]) { this.filters.value = next; this.page.page = 1; this.fetch() }

  select(row: T, on: boolean) {
    if (on) {
      if (!this.selection.value.find(x => x.id === row.id)) this.selection.value.push(row)
    } else {
      this.selection.value = this.selection.value.filter(x => x.id != row.id)
    }
  }
  clearSelection() { this.selection.value = [] }

  async fetch() {
    this.status.value = CrudStatus.Loading
    this.error.value = null
    try {
      const res = await this.service.list({
        search: this.search.value,
        sortBy: this.sortBy.value,
        page: this.page,
        filters: this.filters.value
      })
      this.items.value = res.data
      this.page.total = res.total
      this.status.value = CrudStatus.Success
    } catch (e: any) {
      this.error.value = e?.message ?? String(e)
      this.status.value = CrudStatus.Error
    }
  }

  async create(payload: Partial<T>) {
    this.status.value = CrudStatus.Saving
    try {
      await this.service.create(payload)
      await this.fetch()
    } finally {
      this.status.value = CrudStatus.Success
    }
  }
  async update(id: BaseId, payload: Partial<T>) {
    this.status.value = CrudStatus.Saving
    try {
      await this.service.update(id, payload)
      await this.fetch()
    } finally {
      this.status.value = CrudStatus.Success
    }
  }
  async remove(id: BaseId) {
    this.status.value = CrudStatus.Saving
    try {
      await this.service.remove(id)
      await this.fetch()
    } finally {
      this.status.value = CrudStatus.Success
    }
  }
}
