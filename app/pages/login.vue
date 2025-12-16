<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const form = ref({
  username: '',
  password: '',
})

async function handleLogin() {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value,
    })
    router.push('/admin')
  } catch (error: any) {
    toast.add({
      title: 'Login failed',
      description: error.data?.message || 'Invalid credentials',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: #0a0a0a;">
    <UCard class="w-full max-w-sm mx-4">
      <template #header>
        <h1 class="text-xl font-semibold text-center">Rowans Rota</h1>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormField label="Username">
          <UInput
            v-model="form.username"
            placeholder="Username"
            autocomplete="username"
            required
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Login
        </UButton>
      </form>
    </UCard>
  </div>
</template>
