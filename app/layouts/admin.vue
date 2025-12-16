<script setup lang="ts">
const router = useRouter()
const { isDark, initTheme, toggleTheme } = useTheme()

const navItems = [
  { label: 'Schedule', to: '/admin' },
  { label: 'Events', to: '/admin/events' },
  { label: 'Users', to: '/admin/users' },
]

onMounted(() => {
  initTheme()
})

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  router.push('/')
}
</script>

<template>
  <div
    :style="{
      minHeight: '100vh',
      backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
      color: isDark ? '#f0f0f0' : '#1a1a1a',
      fontFamily: '\'Fira Code\', monospace',
    }"
  >
    <header
      :style="{
        borderBottom: '1px solid #d0232a',
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      }"
    >
      <div style="max-width: 1400px; margin: 0 auto; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 2rem;">
          <h1 style="font-size: 1.25rem; font-weight: bold; color: #d0232a;">Rowans Events</h1>
          <nav style="display: flex; gap: 1.5rem;">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              :style="{ fontSize: '0.875rem', color: isDark ? '#888' : '#666', textDecoration: 'none' }"
              active-class="active-link"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button
            @click="toggleTheme"
            class="theme-toggle"
            :style="{
              padding: '0.5rem',
              background: 'transparent',
              border: '1px solid',
              borderColor: isDark ? '#333' : '#ccc',
              color: isDark ? '#888' : '#666',
              cursor: 'pointer',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: '1',
            }"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <button
            @click="handleLogout"
            :style="{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid',
              borderColor: isDark ? '#333' : '#ccc',
              color: isDark ? '#888' : '#666',
              cursor: 'pointer',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main style="max-width: 1400px; margin: 0 auto; padding: 2rem 1rem;">
      <slot />
    </main>
  </div>
</template>

<style scoped>
nav a:hover {
  color: #d0232a;
}
nav a.router-link-active,
nav a.active-link {
  color: #d0232a;
}
</style>
