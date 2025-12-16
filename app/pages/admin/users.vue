<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

interface User {
  id: number
  username: string
  displayName: string | null
  role: string
  isActive: boolean
  createdAt: string
}

const { data: usersList, refresh } = await useFetch<User[]>('/api/admin/users')

const showModal = ref(false)
const editingUser = ref<User | null>(null)
const form = ref({
  username: '',
  displayName: '',
  password: '',
  role: 'admin',
  isActive: true,
})
const error = ref('')
const success = ref('')

function openCreate() {
  editingUser.value = null
  form.value = { username: '', displayName: '', password: '', role: 'admin', isActive: true }
  error.value = ''
  showModal.value = true
}

function openEdit(user: User) {
  editingUser.value = user
  form.value = {
    username: user.username,
    displayName: user.displayName || '',
    password: '', // Don't populate password
    role: user.role,
    isActive: user.isActive,
  }
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
  error.value = ''
}

async function handleSave() {
  try {
    error.value = ''

    // Validate
    if (!form.value.username) {
      error.value = 'Username is required'
      return
    }
    if (!editingUser.value && !form.value.password) {
      error.value = 'Password is required for new users'
      return
    }

    const body: Record<string, any> = {
      username: form.value.username,
      displayName: form.value.displayName,
      role: form.value.role,
      isActive: form.value.isActive,
    }

    // Only include password if provided
    if (form.value.password) {
      body.password = form.value.password
    }

    if (editingUser.value) {
      await $fetch(`/api/admin/users/${editingUser.value.id}`, {
        method: 'PUT',
        body,
      })
      success.value = 'User updated'
    } else {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body,
      })
      success.value = 'User created'
    }
    showModal.value = false
    await refresh()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to save'
  }
}

async function handleDelete(user: User) {
  if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return

  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    success.value = 'User deleted'
    await refresh()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to delete'
    setTimeout(() => error.value = '', 3000)
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: bold;">Users</h2>
      <button class="btn-primary" @click="openCreate">Add User</button>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="success" style="padding: 0.75rem; background: #1a3a1a; border: 1px solid #2a5a2a; color: #4ade80; border-radius: 4px; margin-bottom: 1rem;">
      {{ success }}
    </div>
    <div v-if="error && !showModal" style="padding: 0.75rem; background: #3a1a1a; border: 1px solid #5a2a2a; color: #f87171; border-radius: 4px; margin-bottom: 1rem;">
      {{ error }}
    </div>

    <!-- Table -->
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #333;">
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Username</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Display Name</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Role</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Status</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Created</th>
            <th style="padding: 0.75rem; text-align: right; font-size: 0.875rem; font-weight: 500; color: #888;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersList" :key="user.id" style="border-bottom: 1px solid #222;">
            <td style="padding: 0.75rem; font-size: 0.875rem;">{{ user.username }}</td>
            <td style="padding: 0.75rem; font-size: 0.875rem; color: #888;">{{ user.displayName || '-' }}</td>
            <td style="padding: 0.75rem; font-size: 0.875rem;">
              <span :style="{ color: user.role === 'admin' ? '#d0232a' : '#888' }">{{ user.role }}</span>
            </td>
            <td style="padding: 0.75rem; font-size: 0.875rem;">
              <span v-if="user.isActive" style="color: #4ade80;">Active</span>
              <span v-else style="color: #666;">Inactive</span>
            </td>
            <td style="padding: 0.75rem; font-size: 0.875rem; color: #888;">{{ formatDate(user.createdAt) }}</td>
            <td style="padding: 0.75rem; text-align: right;">
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-secondary" @click="openEdit(user)">Edit</button>
                <button class="btn-danger" @click="handleDelete(user)">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="!usersList?.length">
            <td colspan="6" style="padding: 2rem; text-align: center; color: #666;">No users found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 50;">
      <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">
          {{ editingUser ? 'Edit' : 'Add' }} User
        </h3>

        <div v-if="error" style="padding: 0.75rem; background: #3a1a1a; border: 1px solid #5a2a2a; color: #f87171; border-radius: 4px; margin-bottom: 1rem;">
          {{ error }}
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">Username *</label>
            <input v-model="form.username" placeholder="username" required class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input v-model="form.displayName" placeholder="John Smith" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ editingUser ? 'New Password (leave blank to keep)' : 'Password *' }}</label>
            <input v-model="form.password" type="password" :placeholder="editingUser ? '••••••••' : 'Enter password'" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-input">
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="checkbox-label">
              <input v-model="form.isActive" type="checkbox" class="checkbox" />
              <span>Active</span>
            </label>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  padding: 0.5rem 1rem;
  background: #d0232a;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #e02530;
  box-shadow: 0 0 14px rgba(208, 35, 42, 0.4);
  transform: scale(1.03);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #333;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #252525;
  border-color: #555;
  color: #f0f0f0;
  transform: scale(1.03);
}

.btn-danger {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #5a2a2a;
  color: #f87171;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: rgba(248, 113, 113, 0.1);
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.2);
  transform: scale(1.03);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #f0f0f0;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  width: 100%;
  transition: all 0.2s ease;
}

.form-input:hover,
.form-input:focus {
  border-color: #d0232a;
  box-shadow: 0 0 8px rgba(208, 35, 42, 0.2);
  outline: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #d0232a;
}
</style>
