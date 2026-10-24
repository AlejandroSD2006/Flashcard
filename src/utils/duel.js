import { shuffle } from './shuffle.js'

/** Número máximo de rondas por jugador que admite una colección de `poolSize` tarjetas. */
export function maxRoundsForPool(poolSize) {
  return Math.max(0, Math.floor(poolSize / 2))
}

/**
 * Reparte `roundsPerPlayer` tarjetas a cada jugador, sin solapar: ninguna fotografía se
 * repite entre A y B, así que nadie tiene ventaja por haberla visto ya.
 */
export function splitDisjointHands(pool, roundsPerPlayer) {
  const rounds = Math.min(roundsPerPlayer, maxRoundsForPool(pool.length))
  const shuffled = shuffle(pool)

  return {
    handA: shuffled.slice(0, rounds),
    handB: shuffled.slice(rounds, rounds * 2),
    rounds,
  }
}

/** Secuencia alternada de turnos: A, B, A, B, ... hasta `roundsPerPlayer` cada uno. */
export function buildTurnOrder(roundsPerPlayer) {
  const order = []
  for (let i = 0; i < roundsPerPlayer; i += 1) {
    order.push('A', 'B')
  }
  return order
}
