import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Refleja la preferencia `prefers-reduced-motion` del sistema, para decidir en JS si
 * conviene generar partículas de confeti o animar números (el CSS puro ya se
 * autorregula vía media query).
 */
export function useReducedMotion() {
  const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  const prefersReducedMotion = ref(query ? query.matches : false)

  function onChange(event) {
    prefersReducedMotion.value = event.matches
  }

  onMounted(() => query?.addEventListener('change', onChange))
  onUnmounted(() => query?.removeEventListener('change', onChange))

  return { prefersReducedMotion }
}
