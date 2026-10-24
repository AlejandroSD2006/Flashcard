// Reglas de puntuación de una sesión (individual o duelo). Puras y testeadas para que
// la interfaz solo las muestre, nunca las reinvente.

export const POINTS_BY_ATTEMPTS = { 1: 100, 2: 70, 3: 40 }
export const FAILED_POINTS = 0
export const FIRST_TRY_BONUS = 20
export const STREAK_BONUS_STEP = 0.1
export const STREAK_BONUS_MAX_STEPS = 10
export const STREAK_BONUS_CAP_MULTIPLIER = 1 + STREAK_BONUS_STEP * STREAK_BONUS_MAX_STEPS // x2

/**
 * Calcula los puntos de una tarjeta ya resuelta.
 *
 * - `outcome`: 'first' | 'retry' | 'failed'.
 * - `attemptsUsed`: número de intentos consumidos (1-3).
 * - `streakBefore`: aciertos consecutivos ANTES de esta tarjeta (no incluye la actual).
 *
 * El multiplicador de racha solo se aplica sobre la base de un acierto real, así que
 * fallar nunca puede generar puntos ni una racha "negativa". La racha se reinicia fuera
 * de esta función (en quien la invoca) en cuanto una tarjeta se falla por completo.
 */
export function scoreForAnswer({ outcome, attemptsUsed, streakBefore = 0 }) {
  if (outcome === 'failed') {
    return { base: 0, streakBonus: 0, firstTryBonus: 0, total: 0, multiplier: 1 }
  }

  const base = POINTS_BY_ATTEMPTS[attemptsUsed] ?? FAILED_POINTS
  const multiplier = 1 + STREAK_BONUS_STEP * Math.min(Math.max(streakBefore, 0), STREAK_BONUS_MAX_STEPS)
  const streakBonus = Math.round(base * multiplier) - base
  const firstTryBonus = outcome === 'first' ? FIRST_TRY_BONUS : 0
  const total = base + streakBonus + firstTryBonus

  return { base, streakBonus, firstTryBonus, total, multiplier }
}
