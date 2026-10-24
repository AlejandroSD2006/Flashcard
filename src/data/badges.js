// Definiciones de insignias. `check(ctx)` recibe el perfil ya actualizado con la sesión
// recién jugada, las estadísticas de esa sesión y el tamaño de la colección, y decide
// si la insignia debería estar desbloqueada. Son condiciones puras y deterministas.

export const BADGES = [
  {
    id: 'first-step',
    name: 'Primer paso',
    description: 'Completa tu primera tarjeta.',
    icon: '🥾',
    check: (ctx) => ctx.profile.totalCardsSolved >= 1,
  },
  {
    id: 'hawk-eye',
    name: 'Ojo de halcón',
    description: 'Acierta 5 tarjetas al primer intento en una misma sesión.',
    icon: '🦅',
    check: (ctx) => ctx.sessionStats.firstTryCount >= 5,
  },
  {
    id: 'unstoppable',
    name: 'Imparable',
    description: 'Consigue 5 aciertos consecutivos.',
    icon: '🔥',
    check: (ctx) => ctx.sessionStats.bestStreakInSession >= 5,
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Termina una sesión sin fallar ninguna tarjeta.',
    icon: '💎',
    check: (ctx) => ctx.sessionStats.total > 0 && ctx.sessionStats.failed === 0,
  },
  {
    id: 'collector',
    name: 'Coleccionista',
    description: 'Crea una colección de 20 tarjetas.',
    icon: '🗂️',
    check: (ctx) => ctx.collectionSize >= 20,
  },
]

/**
 * Evalúa todas las insignias y devuelve las que deberían estar desbloqueadas ahora
 * (independientemente de si ya lo estaban). Quien llama decide cuáles son nuevas.
 */
export function evaluateBadges(ctx) {
  return BADGES.filter((badge) => badge.check(ctx)).map((badge) => badge.id)
}
