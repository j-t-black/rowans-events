export function useTheme() {
  const isDark = useState('theme-dark', () => true)

  function initTheme() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      isDark.value = saved ? saved === 'dark' : true
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
  }
}
