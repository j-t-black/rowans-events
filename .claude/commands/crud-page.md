# Create CRUD Admin Page

Create a full CRUD admin page with table view and modal editing.

## Context
- This is for the Rowans Rota admin interface
- Uses Nuxt UI 4 Pro components
- Protected by auth middleware
- Dark theme with Fira Code font

## Standard Pattern

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { data: items, refresh } = await useFetch('/api/admin/[resource]')

const isModalOpen = ref(false)
const editingItem = ref(null)

const openCreate = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const openEdit = (item) => {
  editingItem.value = item
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  if (editingItem.value) {
    await $fetch(`/api/admin/[resource]/${editingItem.value.id}`, {
      method: 'PUT',
      body: formData
    })
  } else {
    await $fetch('/api/admin/[resource]', {
      method: 'POST',
      body: formData
    })
  }
  isModalOpen.value = false
  refresh()
}

const handleDelete = async (id) => {
  await $fetch(`/api/admin/[resource]/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2>Resource Name</h2>
        <UButton @click="openCreate">Add New</UButton>
      </div>
    </template>

    <UTable :rows="items" :columns="columns">
      <!-- Action column with edit/delete -->
    </UTable>
  </UCard>

  <UModal v-model="isModalOpen">
    <!-- Form for create/edit -->
  </UModal>
</template>
```

Please specify:
1. Resource name (e.g., "time-slots", "djs")
2. Fields to display/edit
3. Any special validation rules
