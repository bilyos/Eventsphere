import { ref, watch } from 'vue'

const isDark = ref(false)

function initTheme() {
  const saved = localStorage.getItem('eventsphere-theme')
  isDark.value = saved === 'dark'
  applyTheme()
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('eventsphere-theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

watch(isDark, applyTheme)

initTheme()

export function useTheme() {
  return { isDark, toggleTheme }
}
