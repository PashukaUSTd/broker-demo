import type { Service, QueryOptions, FilterItem } from '@/core'
import { LocalService } from '@/core/localService'
import { makeMockPeople } from './mock'
import type { Person } from './types'

const data = makeMockPeople(120)

// Map abstract FilterItem into fields for people
export function makePeopleService(): Service<Person> {
  return new LocalService<Person>(data, ['firstName','lastName','email','login','role','status'])
}
