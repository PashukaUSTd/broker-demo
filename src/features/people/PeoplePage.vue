<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { CrudStatus, type FilterItem } from '@/core'
import { PeopleBroker } from './PeopleBroker'
import type { Person } from './types'
import { personForm } from './form'

const broker = new PeopleBroker()

// --- UI State
const editing = ref<null | Person>(null)
const formModel = reactive<Record<string, any>>({})

// Filters / search / saved views
const searchInput = ref(localStorage.getItem('users.search') || '')
const selectedStatuses = ref<string[]>(JSON.parse(localStorage.getItem('users.statuses') || '[]'))
const savedViews = ref<{ name: string; statuses: string[]; search: string }[]>(JSON.parse(localStorage.getItem('users.views') || '[]'))

watch(searchInput, v => localStorage.setItem('users.search', v))
watch(selectedStatuses, v => localStorage.setItem('users.statuses', JSON.stringify(v)), { deep: true })
watch(savedViews, v => localStorage.setItem('users.views', JSON.stringify(v)), { deep: true })
watch(() => broker.page.pageSize, v => localStorage.setItem('users.pageSize', String(v)))

function onNew() {
  Object.assign(formModel, {
    firstName: '', lastName: '', email: '', login: '', role: 'Viewer', status: 'Invited',
    timeZone: 'Etc/UTC', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', mfaEnabled: false
  })
  editing.value = null
}
function onEdit(row: Person) {
  Object.assign(formModel, row)
  editing.value = row
}
async function onSave() {
  if (editing.value) {
    await broker.update(editing.value.id, formModel)
  } else {
    await broker.invite(formModel) // create as invited with token
  }
  editing.value = null
}

function toggleSelect(row: Person, ev: Event) {
  const checked = (ev.target as HTMLInputElement).checked
  broker.select(row, checked)
}

function queryStatusLabel() {
  const s = broker.status.value
  if (s === CrudStatus.Loading) return 'Loading…'
  if (s === CrudStatus.Saving) return 'Saving…'
  if (s === CrudStatus.Error) return 'Error'
  return ''
}

const totalPages = computed(() => Math.max(1, Math.ceil(broker.page.total / broker.page.pageSize)))

function applyFilters() {
  const filters: FilterItem[] = []
  if (selectedStatuses.value.length) {
    filters.push({ field: 'status', op: 'in', value: [...selectedStatuses.value] })
  }
  broker.setSearch(searchInput.value.trim())
  broker.setFilters(filters)
}

function saveView() {
  const name = prompt('Name this view (e.g., Active Admins)')
  if (!name) return
  savedViews.value.push({ name, statuses: [...selectedStatuses.value], search: searchInput.value })
}
function loadView(v: { name: string; statuses: string[]; search: string }) {
  selectedStatuses.value = [...v.statuses]
  searchInput.value = v.search
  applyFilters()
}
function deleteView(idx: number) {
  savedViews.value.splice(idx, 1)
}

onMounted(() => {
  const ps = Number(localStorage.getItem('users.pageSize') || '20')
  broker.page.pageSize = [10,20,50].includes(ps) ? ps : 20
  broker.fetch().then(() => applyFilters())
})
</script>

<template>
  <h1 style="margin-bottom: 12px;">Workspace → Users & Invitations</h1>
  <div class="grid">
    <div>
      <div class="card">
        <div class="toolbar">
          <button class="primary" @click="onNew">Invite</button>
          <button class="ghost" :disabled="!broker.selection.value.length" @click="broker.bulkChangeRole('Viewer')">Bulk → Viewer</button>
          <button class="ghost" :disabled="!broker.selection.value.length" @click="broker.bulkChangeRole('Editor')">Bulk → Editor</button>
          <div style="margin-left:auto; display:flex; gap:8px; align-items: center;">
            <span class="muted">Search</span>
            <input type="text" v-model="searchInput" @keydown.enter="applyFilters" placeholder="name, email, login…" />
            <span class="muted">Status</span>
            <select multiple v-model="selectedStatuses" @change="applyFilters">
              <option>Active</option>
              <option>Inactive</option>
              <option>Invited</option>
            </select>
            <button @click="applyFilters">Apply</button>
            <button @click="saveView">Save view</button>
          </div>
        </div>
        <div style="padding:12px; display:flex; gap:8px; align-items:center; flex-wrap: wrap;">
          <span v-if="queryStatusLabel()" class="pill">{{ queryStatusLabel() }}</span>
          <span class="muted">Rows: {{ broker.page.total }}</span>
          <span class="muted">Selected: {{ broker.selection.value.length }}</span>
          <template v-for="(v, i) in savedViews" :key="v.name">
            <button class="ghost" @click="loadView(v)">{{ v.name }}</button>
            <button class="ghost" title="Delete view" @click="deleteView(i)">×</button>
          </template>
        </div>
        <div style="overflow:auto;">
          <table>
            <thead>
              <tr>
                <th></th>
                <th @click="broker.setSort('firstName')" style="cursor:pointer">Name</th>
                <th @click="broker.setSort('email')" style="cursor:pointer">Email</th>
                <th @click="broker.setSort('role')" style="cursor:pointer">Role</th>
                <th @click="broker.setSort('status')" style="cursor:pointer">Status</th>
                <th @click="broker.setSort('mfaEnabled')" style="cursor:pointer">MFA</th>
                <th @click="broker.setSort('lastLogin')" style="cursor:pointer">Last login</th>
                <th @click="broker.setSort('createdAt')" style="cursor:pointer">Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in broker.items.value" :key="row.id">
                <td><input type="checkbox" :checked="!!broker.selection.value.find(x => x.id === row.id)" @change="ev => toggleSelect(row, ev)" /></td>
                <td>{{ row.firstName }} {{ row.lastName }}</td>
                <td><span class="kbd">{{ row.email }}</span></td>
                <td><span class="pill">{{ row.role }}</span></td>
                <td><span class="pill">{{ row.status }}</span></td>
                <td>{{ row.mfaEnabled ? 'On' : 'Off' }}</td>
                <td>{{ row.lastLogin ? new Date(row.lastLogin).toLocaleString() : '—' }}</td>
                <td>{{ new Date(row.createdAt).toLocaleDateString() }}</td>
                <td class="row-actions">
                  <button @click="onEdit(row)">Edit</button>
                  <button v-if="row.status==='Active'" @click="broker.deactivate(row.id)">Deactivate</button>
                  <button v-else-if="row.status==='Inactive'" @click="broker.reactivate(row.id)">Reactivate</button>
                  <button @click="broker.resetMfa(row.id)">Reset MFA</button>
                  <button @click="broker.remove(row.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex; gap:8px; align-items:center; padding: 12px;">
          <span class="muted">Page {{ broker.page.page }} / {{ Math.max(1, Math.ceil(broker.page.total / broker.page.pageSize)) }}</span>
          <button @click="broker.setPage(Math.max(1, broker.page.page - 1))" :disabled="broker.page.page <= 1">Prev</button>
          <button @click="broker.setPage(Math.min(Math.max(1, Math.ceil(broker.page.total / broker.page.pageSize)), broker.page.page + 1))" :disabled="broker.page.page >= Math.max(1, Math.ceil(broker.page.total / broker.page.pageSize))">Next</button>
          <span style="margin-left:auto" class="muted">Page size</span>
          <select v-model.number="broker.page.pageSize" @change="broker.setPageSize(broker.page.pageSize)">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Right panel: create/edit -->
    <div class="drawer">
      <h2 style="margin:0 0 12px;">{{ editing ? 'Edit user' : 'Invite user' }}</h2>
      <form @submit.prevent="onSave">
        <div v-for="f in personForm.fields" :key="f.code" class="field">
          <label :for="f.code">{{ f.label }}</label>
          <template v-if="f.type === 'string' || f.type === 'email'">
            <input :id="f.code" :type="f.type === 'email' ? 'email' : 'text'" v-model="formModel[f.code]" :required="f.required" />
          </template>
          <template v-else-if="f.type === 'select'">
            <select :id="f.code" v-model="formModel[f.code]">
              <option v-for="opt in f.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </template>
          <template v-else>
            <select :id="f.code" v-model="formModel[f.code]">
              <option v-for="opt in f.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </template>
        </div>
        <div style="display:flex; gap:8px; margin-top: 12px;">
          <button class="primary" type="submit">{{ editing ? 'Save' : 'Send invite' }}</button>
          <button type="button" @click="editing = null">Cancel</button>
        </div>
      </form>
      <p class="muted" style="margin-top:12px;">
        Tips: Click headers to sort. Save common filters as named views.
      </p>
    </div>
  </div>
</template>
