import { ref, watchEffect } from 'vue'

export function useDarkMode() {
  const isDarkMode = ref(false)

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mediaQuery.matches

    mediaQuery.addEventListener('change', (e) => {
      isDarkMode.value = e.matches
    })
  }

  watchEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
  }

  return {
    isDarkMode,
    toggleDarkMode,
  }
}
