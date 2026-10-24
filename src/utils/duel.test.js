import { describe, expect, it } from 'vitest'
import { buildTurnOrder, maxRoundsForPool, splitDisjointHands } from './duel.js'

function makePool(size) {
  return Array.from({ length: size }, (_, i) => ({ id: `card-${i}`, name: `Carta ${i}` }))
}

describe('maxRoundsForPool', () => {
  it('permite la mitad de la colección por jugador', () => {
    expect(maxRoundsForPool(10)).toBe(5)
    expect(maxRoundsForPool(7)).toBe(3)
  })

  it('nunca es negativo', () => {
    expect(maxRoundsForPool(0)).toBe(0)
    expect(maxRoundsForPool(1)).toBe(0)
  })
})

describe('splitDisjointHands', () => {
  it('reparte manos del tamaño pedido sin tarjetas repetidas entre jugadores', () => {
    const pool = makePool(10)
    const { handA, handB, rounds } = splitDisjointHands(pool, 4)

    expect(rounds).toBe(4)
    expect(handA).toHaveLength(4)
    expect(handB).toHaveLength(4)

    const idsA = new Set(handA.map((c) => c.id))
    const idsB = new Set(handB.map((c) => c.id))
    const overlap = [...idsA].filter((id) => idsB.has(id))
    expect(overlap).toHaveLength(0)
  })

  it('ajusta las rondas si se pide más de lo que la colección permite', () => {
    const pool = makePool(5)
    const { handA, handB, rounds } = splitDisjointHands(pool, 10)

    expect(rounds).toBe(2) // floor(5/2)
    expect(handA).toHaveLength(2)
    expect(handB).toHaveLength(2)
  })
})

describe('buildTurnOrder', () => {
  it('alterna estrictamente A y B', () => {
    expect(buildTurnOrder(3)).toEqual(['A', 'B', 'A', 'B', 'A', 'B'])
  })

  it('tiene el mismo número de turnos para cada jugador', () => {
    const order = buildTurnOrder(5)
    expect(order.filter((p) => p === 'A')).toHaveLength(5)
    expect(order.filter((p) => p === 'B')).toHaveLength(5)
  })
})
