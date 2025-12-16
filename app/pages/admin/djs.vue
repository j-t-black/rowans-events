<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

interface DJ {
  id: number
  name: string
  email: string | null
  instagram: string | null
  whatsapp: string | null
  avatar: string | null
  isActive: boolean
  isDefault: boolean
}

const { data: djsList, refresh } = await useFetch<DJ[]>('/api/admin/djs')

const showModal = ref(false)
const editingDJ = ref<DJ | null>(null)
const form = ref({
  name: '',
  email: '',
  instagram: '',
  whatsapp: '',
  avatar: '',
  isActive: true,
  isDefault: false,
})
const error = ref('')
const success = ref('')

function openCreate() {
  editingDJ.value = null
  form.value = { name: '', email: '', instagram: '', whatsapp: '', avatar: '', isActive: true, isDefault: false }
  error.value = ''
  showModal.value = true
}

function openEdit(dj: DJ) {
  editingDJ.value = dj
  form.value = {
    name: dj.name,
    email: dj.email || '',
    instagram: dj.instagram || '',
    whatsapp: dj.whatsapp || '',
    avatar: dj.avatar || '',
    isActive: dj.isActive,
    isDefault: dj.isDefault
  }
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingDJ.value = null
  error.value = ''
}

async function handleSave() {
  try {
    error.value = ''
    if (editingDJ.value) {
      await $fetch(`/api/admin/djs/${editingDJ.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
      success.value = 'DJ updated'
    } else {
      await $fetch('/api/admin/djs', {
        method: 'POST',
        body: form.value,
      })
      success.value = 'DJ created'
    }
    showModal.value = false
    await refresh()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to save'
  }
}

async function handleDelete(dj: DJ) {
  if (!confirm(`Delete DJ "${dj.name}"?`)) return

  try {
    await $fetch(`/api/admin/djs/${dj.id}`, { method: 'DELETE' })
    success.value = 'DJ deleted'
    await refresh()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to delete'
    setTimeout(() => error.value = '', 3000)
  }
}

</script>

<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: bold;">DJs</h2>
      <button class="btn-primary" @click="openCreate">Add DJ</button>
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
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Name</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Status</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Default</th>
            <th style="padding: 0.75rem; text-align: right; font-size: 0.875rem; font-weight: 500; color: #888;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dj in djsList" :key="dj.id" style="border-bottom: 1px solid #222;">
            <td style="padding: 0.75rem; font-size: 0.875rem;">{{ dj.name }}</td>
            <td style="padding: 0.75rem; font-size: 0.875rem;">
              <span v-if="dj.isActive" style="color: #4ade80;">Active</span>
              <span v-else style="color: #666;">Inactive</span>
            </td>
            <td style="padding: 0.75rem; font-size: 0.875rem;">
              <span v-if="dj.isDefault" style="color: #d0232a;">Yes</span>
              <span v-else style="color: #666;">No</span>
            </td>
            <td style="padding: 0.75rem; text-align: right;">
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-secondary" @click="openEdit(dj)">Edit</button>
                <button class="btn-danger" @click="handleDelete(dj)">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="!djsList?.length">
            <td colspan="4" style="padding: 2rem; text-align: center; color: #666;">No DJs found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 50;">
      <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">
          {{ editingDJ ? 'Edit' : 'Add' }} DJ
        </h3>

        <div v-if="error" style="padding: 0.75rem; background: #3a1a1a; border: 1px solid #5a2a2a; color: #f87171; border-radius: 4px; margin-bottom: 1rem;">
          {{ error }}
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input v-model="form.name" placeholder="DJ Name" required class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" placeholder="dj@example.com" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Instagram</label>
            <input v-model="form.instagram" placeholder="@handle (without @)" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">WhatsApp</label>
            <input v-model="form.whatsapp" placeholder="+44 7123 456789" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Avatar URL</label>
            <input v-model="form.avatar" placeholder="https://example.com/avatar.jpg" class="form-input" />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="form.isActive" type="checkbox" class="checkbox" />
              <span>Active</span>
            </label>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="checkbox-label">
              <input v-model="form.isDefault" type="checkbox" class="checkbox" />
              <span>Set as default</span>
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
