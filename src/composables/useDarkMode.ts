import { onScopeDispose, ref, watchEffect } from 'vue'

export function useDarkMode() {
  const isDarkMode = ref(false)
  let cleanup: (() => void) | undefined

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mediaQuery.matches

    const handler = (e: MediaQueryListEvent) => {
      isDarkMode.value = e.matches
    }

    mediaQuery.addEventListener('change', handler)
    cleanup = () => mediaQuery.removeEventListener('change', handler)
  }

  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode.value)
    }
  })

  onScopeDispose(() => {
    cleanup?.()
  })

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
  }

  return {
    isDarkMode,
    toggleDarkMode,
  }
}
