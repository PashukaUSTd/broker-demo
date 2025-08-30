# Workspace Users Admin (Vue 3 + TS)

admin page for **Workspace → Users & Invitations**:

- **Users table** with search, status filter, sort, pagination.
- **Columns**: role, status, MFA, last login, created at.
- **Actions**: Invite (token), Deactivate/Reactivate, Reset MFA, Edit, Delete.
- **Bulk**: change role for selected users.
- **Saved Views**: filter presets in localStorage (e.g., "Active Admins").
- **State persistence**: search/sort/pageSize saved to localStorage.

Run:

```bash
npm i
npm run dev
```
