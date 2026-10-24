import { ref, computed } from 'vue'
import { shuffle } from '../utils/shuffle.js'

/**
 * Gestiona el recorrido de una sesión de estudio sobre una lista fija de
 * tarjetas: progreso, resultados por tarjeta y estadísticas finales.
 *
 * El orden de las tarjetas se mezcla al iniciar la sesión (cada ronda, incluidas
 * las repeticiones, presenta las fotografías en un orden distinto).
 *
 * No se puede avanzar a la siguiente tarjeta hasta que la actual registre
 * un resultado (acierto o intentos agotados); eso se garantiza porque
 * `goToNext` exige que la tarjeta actual ya tenga un resultado registrado.
 */
export function useStudySession(sessionCards) {
  const cards = ref(shuffle(sessionCards))
  const currentIndex = ref(0)
  const results = ref(Array(sessionCards.length).fill(null))
  const startedAt = ref(Date.now())
  const finishedAt = ref(null)

  const totalCards = computed(() => cards.value.length)
  const currentCard = computed(() => cards.value[currentIndex.value] ?? null)
  const currentResult = computed(() => results.value[currentIndex.value])
  const isSessionFinished = computed(
    () => finishedAt.value !== null || currentIndex.value >= totalCards.value,
  )
  const progress = computed(() => ({
    current: Math.min(currentIndex.value + 1, totalCards.value),
    total: totalCards.value,
    percentage: totalCards.value
      ? Math.round((Math.min(currentIndex.value, totalCards.value) / totalCards.value) * 100)
      : 0,
  }))

  /** Registra el resultado de la tarjeta actual. outcome: 'first' | 'retry' | 'failed'. */
  function recordResult(outcome, attemptsUsed) {
    results.value[currentIndex.value] = { outcome, attemptsUsed }
  }

  /** Avanza a la siguiente tarjeta. Solo funciona si la actual ya tiene resultado. */
  function goToNext() {
    if (!currentResult.value) return false

    if (currentIndex.value + 1 >= totalCards.value) {
      currentIndex.value += 1
      finishedAt.value = Date.now()
    } else {
      currentIndex.value += 1
    }
    return true
  }

  const summary = computed(() => {
    const recorded = results.value.filter(Boolean)
    const firstTry = recorded.filter((r) => r.outcome === 'first').length
    const retryTry = recorded.filter((r) => r.outcome === 'retry').length
    const failed = recorded.filter((r) => r.outcome === 'failed').length
    const total = totalCards.value
    const correct = firstTry + retryTry
    const percentage = total ? Math.round((correct / total) * 100) : 0
    const durationMs = (finishedAt.value ?? Date.now()) - startedAt.value

    return { total, firstTry, retryTry, failed, correct, percentage, durationMs }
  })

  return {
    cards,
    currentIndex,
    currentCard,
    currentResult,
    totalCards,
    progress,
    isSessionFinished,
    recordResult,
    goToNext,
    summary,
  }
}
