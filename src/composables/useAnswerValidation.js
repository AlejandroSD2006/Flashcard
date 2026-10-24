import { ref, computed } from 'vue'
import { isAnswerCorrect } from '../utils/normalizeAnswer.js'

export const MAX_ATTEMPTS = 3

/**
 * Gestiona el ciclo de comprobación de respuestas para una única tarjeta:
 * intentos restantes, estado de resuelta y resultado del último intento.
 */
export function useAnswerValidation() {
  const attemptsMade = ref(0)
  const status = ref('pending') // 'pending' | 'correct' | 'failed'
  const lastResult = ref(null) // 'correct' | 'incorrect' | null

  const attemptsRemaining = computed(() => MAX_ATTEMPTS - attemptsMade.value)
  const isResolved = computed(() => status.value !== 'pending')

  function reset() {
    attemptsMade.value = 0
    status.value = 'pending'
    lastResult.value = null
  }

  /**
   * Evalúa una respuesta del usuario. Las respuestas vacías no consumen intento.
   * Devuelve true si la tarjeta queda resuelta (acierto o intentos agotados).
   */
  function submitAnswer(userAnswer, correctAnswer, alternatives = []) {
    if (isResolved.value) return true
    if (!userAnswer || !userAnswer.trim()) return false

    attemptsMade.value += 1

    const correct = isAnswerCorrect(userAnswer, [correctAnswer, ...alternatives])

    if (correct) {
      status.value = 'correct'
      lastResult.value = 'correct'
      return true
    }

    lastResult.value = 'incorrect'

    if (attemptsMade.value >= MAX_ATTEMPTS) {
      status.value = 'failed'
      return true
    }

    return false
  }

  return {
    attemptsMade,
    attemptsRemaining,
    status,
    lastResult,
    isResolved,
    reset,
    submitAnswer,
  }
}
