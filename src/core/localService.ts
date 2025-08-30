import type { BaseModel, Service, QueryOptions, FilterItem, SortBy, Page } from './index'
import { applyFilters, applySearch, applySort, paginate } from './index'

export class LocalService<T extends BaseModel> implements Service<T> {
  constructor(private data: T[], private searchKeys: (keyof T)[] = []) {}

  async list(query: QueryOptions): Promise<{ data: T[]; total: number }> {
    const page: Page = query.page ?? { page: 1, pageSize: 10, total: 0 }
    let rows = [...this.data]
    rows = applySearch(rows, query.search, this.searchKeys as string[])
    rows = applyFilters(rows, query.filters)
    rows = applySort(rows, query.sortBy ?? null)
    const res = paginate(rows, page)
    return res
  }
  async get(id: string | number): Promise<T | null> {
    return this.data.find(x => x.id === id) ?? null
  }
  async create(payload: Partial<T>): Promise<T> {
    const next = { ...payload, id: Math.random().toString(36).slice(2) } as T
    this.data.unshift(next)
    return next
  }
  async update(id: string | number, payload: Partial<T>): Promise<T> {
    const idx = this.data.findIndex(x => x.id === id)
    if (idx === -1) throw new Error('Not found')
    this.data[idx] = { ...this.data[idx], ...payload }
    return this.data[idx]
  }
  async remove(id: string | number): Promise<void> {
    const idx = this.data.findIndex(x => x.id === id)
    if (idx !== -1) this.data.splice(idx, 1)
  }
}
