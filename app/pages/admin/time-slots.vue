<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

interface TimeSlot {
  id: number
  time: string
  displayOrder: number
  isDefault: boolean
}

const { data: timeSlots, refresh } = await useFetch<TimeSlot[]>('/api/admin/time-slots')

const showModal = ref(false)
const editingSlot = ref<TimeSlot | null>(null)
const form = ref({
  time: '',
  displayOrder: 0,
  isDefault: false,
})
const error = ref('')
const success = ref('')

function openCreate() {
  editingSlot.value = null
  form.value = { time: '', displayOrder: (timeSlots.value?.length || 0) + 1, isDefault: false }
  error.value = ''
  showModal.value = true
}

function openEdit(slot: TimeSlot) {
  editingSlot.value = slot
  form.value = { time: slot.time, displayOrder: slot.displayOrder, isDefault: slot.isDefault }
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingSlot.value = null
  error.value = ''
}

async function handleSave() {
  try {
    error.value = ''
    if (editingSlot.value) {
      await $fetch(`/api/admin/time-slots/${editingSlot.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
      success.value = 'Time slot updated'
    } else {
      await $fetch('/api/admin/time-slots', {
        method: 'POST',
        body: form.value,
      })
      success.value = 'Time slot created'
    }
    showModal.value = false
    await refresh()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to save'
  }
}

async function handleDelete(slot: TimeSlot) {
  if (!confirm(`Delete time slot "${slot.time}"?`)) return

  try {
    await $fetch(`/api/admin/time-slots/${slot.id}`, { method: 'DELETE' })
    success.value = 'Time slot deleted'
    await refresh()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to delete'
    setTimeout(() => error.value = '', 3000)
  }
}

const buttonStyle = `
  padding: 0.5rem 1rem;
  background: #d0232a;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
`

const buttonSecondaryStyle = `
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #333;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
`

const inputStyle = `
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #f0f0f0;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  width: 100%;
`
</script>

<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: bold;">Time Slots</h2>
      <button :style="buttonStyle" @click="openCreate">Add Time Slot</button>
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
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Time</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Order</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 500; color: #888;">Default</th>
            <th style="padding: 0.75rem; text-align: right; font-size: 0.875rem; font-weight: 500; color: #888;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in timeSlots" :key="slot.id" style="border-bottom: 1px solid #222;">
            <td style="padding: 0.75rem; font-size: 0.875rem;">{{ slot.time }}</td>
            <td style="padding: 0.75rem; font-size: 0.875rem; color: #888;">{{ slot.displayOrder }}</td>
            <td style="padding: 0.75rem; font-size: 0.875rem;">
              <span v-if="slot.isDefault" style="color: #d0232a;">Yes</span>
              <span v-else style="color: #666;">No</span>
            </td>
            <td style="padding: 0.75rem; text-align: right;">
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button :style="buttonSecondaryStyle" @click="openEdit(slot)">Edit</button>
                <button
                  style="padding: 0.5rem 1rem; background: transparent; border: 1px solid #5a2a2a; color: #f87171; cursor: pointer; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.875rem;"
                  @click="handleDelete(slot)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!timeSlots?.length">
            <td colspan="4" style="padding: 2rem; text-align: center; color: #666;">No time slots found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 50;">
      <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; width: 100%; max-width: 400px;">
        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">
          {{ editingSlot ? 'Edit' : 'Add' }} Time Slot
        </h3>

        <div v-if="error" style="padding: 0.75rem; background: #3a1a1a; border: 1px solid #5a2a2a; color: #f87171; border-radius: 4px; margin-bottom: 1rem;">
          {{ error }}
        </div>

        <form @submit.prevent="handleSave">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.875rem; color: #888; margin-bottom: 0.5rem;">Time</label>
            <input
              v-model="form.time"
              placeholder="22:00"
              required
              :style="inputStyle"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.875rem; color: #888; margin-bottom: 0.5rem;">Display Order</label>
            <input
              v-model.number="form.displayOrder"
              type="number"
              :style="inputStyle"
            />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input
                v-model="form.isDefault"
                type="checkbox"
                style="width: 1rem; height: 1rem; accent-color: #d0232a;"
              />
              <span style="font-size: 0.875rem;">Set as default</span>
            </label>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" :style="buttonSecondaryStyle" @click="closeModal">Cancel</button>
            <button type="submit" :style="buttonStyle">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
