import { Broker, type FilterItem } from '@/core'
import type { Person } from './types'
import { makePeopleService } from './service'

export class PeopleBroker extends Broker<Person> {
  constructor() {
    super(makePeopleService())
  }

  filterByStatus(statuses: string[]) {
    const filters: FilterItem[] = statuses.length ? [{ field: 'status', op: 'in', value: statuses }] : []
    this.setFilters(filters)
  }

  async deactivate(id: string) {
    await this.update(id, { status: 'Inactive' })
  }
  async reactivate(id: string) {
    await this.update(id, { status: 'Active' })
  }
  async resetMfa(id: string) {
    await this.update(id, { mfaEnabled: false })
  }
  async invite(payload: Partial<Person>) {
    const created = await this.create({ ...payload, status: 'Invited', inviteToken: 'tok_' + Math.random().toString(36).slice(2, 10) })
    return created
  }
  async bulkChangeRole(role: Person['role']) {
    const ids = this.selection.value.map(x => x.id)
    for (const id of ids) await this.update(id, { role })
    this.clearSelection()
  }
}
