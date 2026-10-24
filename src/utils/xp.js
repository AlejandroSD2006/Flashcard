// Experiencia y nivel del jugador. Cada nivel pide un poco más de XP que el anterior,
// para que subir de nivel siga siendo alcanzable sin volverse trivial con el tiempo.

export const XP_BY_OUTCOME = { first: 30, retry: 20, failed: 5 }
const BASE_LEVEL_XP = 100
const LEVEL_XP_STEP = 50

export function xpForOutcome(outcome) {
  return XP_BY_OUTCOME[outcome] ?? 0
}

/**
 * Convierte un total de XP acumulado en nivel + progreso hacia el siguiente nivel.
 * Nivel 1 -> 2 requiere 100 XP, 2 -> 3 requiere 150 XP, 3 -> 4 requiere 200 XP, etc.
 */
export function levelFromXp(totalXp) {
  const xp = Math.max(0, totalXp)
  let level = 1
  let remaining = xp
  let needed = BASE_LEVEL_XP

  while (remaining >= needed) {
    remaining -= needed
    level += 1
    needed += LEVEL_XP_STEP
  }

  return {
    level,
    currentXp: remaining,
    neededXp: needed,
    totalXp: xp,
    percent: Math.round((remaining / needed) * 100),
  }
}
