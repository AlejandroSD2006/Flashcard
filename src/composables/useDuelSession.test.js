import { describe, expect, it } from 'vitest'
import { useDuelSession } from './useDuelSession.js'

function makePool(size) {
  return Array.from({ length: size }, (_, i) => ({
    id: `card-${i}`,
    name: `Carta ${i}`,
    alternatives: [],
    description: '',
  }))
}

describe('useDuelSession', () => {
  it('no permite avanzar de turno sin resolver la tarjeta actual', () => {
    const duel = useDuelSession({ pool: makePool(4), playerNames: { A: 'Ana', B: 'Beto' }, roundsPerPlayer: 1 })
    duel.startMatch()
    const turnBefore = duel.turnIndex.value

    duel.continueTurn() // fase es 'turn', no 'resolved': debe ignorarse
    expect(duel.turnIndex.value).toBe(turnBefore)
    expect(duel.phase.value).toBe('turn')
  })

  it('ignora submitAnswer fuera de la fase "turn"', () => {
    const duel = useDuelSession({ pool: makePool(4), playerNames: { A: 'Ana', B: 'Beto' }, roundsPerPlayer: 1 })
    duel.startMatch()
    const card = duel.currentCard.value
    duel.submitAnswer(card.name)
    duel.continueTurn() // -> 'transition' (quedaba el turno de B)
    expect(duel.phase.value).toBe('transition')

    duel.submitAnswer('cualquier cosa')
    expect(duel.scores.value.B.total).toBe(0)
  })

  it('no duplica la puntuación si se reenvía una respuesta tras resolver la tarjeta', () => {
    const duel = useDuelSession({ pool: makePool(4), playerNames: { A: 'Ana', B: 'Beto' }, roundsPerPlayer: 1 })
    duel.startMatch()
    const card = duel.currentCard.value

    duel.submitAnswer(card.name)
    const scoreAfterFirst = duel.scores.value.A.score
    const totalAfterFirst = duel.scores.value.A.total

    duel.submitAnswer(card.name) // ya resuelta: no debe volver a puntuar
    expect(duel.scores.value.A.score).toBe(scoreAfterFirst)
    expect(duel.scores.value.A.total).toBe(totalAfterFirst)
  })

  it('determina el ganador según la puntuación de cada jugador', () => {
    const duel = useDuelSession({ pool: makePool(4), playerNames: { A: 'Ana', B: 'Beto' }, roundsPerPlayer: 1 })
    duel.startMatch()

    const cardA = duel.currentCard.value
    duel.submitAnswer(cardA.name) // Ana acierta a la primera
    duel.continueTurn()
    duel.confirmTransition()

    expect(duel.currentPlayerKey.value).toBe('B')
    duel.submitAnswer('incorrecta 1')
    duel.submitAnswer('incorrecta 2')
    duel.submitAnswer('incorrecta 3') // Beto falla los 3 intentos
    expect(duel.phase.value).toBe('resolved')

    duel.continueTurn() // era el último turno -> finaliza la partida
    expect(duel.phase.value).toBe('finished')
    expect(duel.summary.value.winner).toBe('A')
    expect(duel.summary.value.diff).toBeGreaterThan(0)
  })

  it('declara empate cuando ambos jugadores acaban con la misma puntuación', () => {
    const duel = useDuelSession({ pool: makePool(4), playerNames: { A: 'Ana', B: 'Beto' }, roundsPerPlayer: 1 })
    duel.startMatch()

    const cardA = duel.currentCard.value
    duel.submitAnswer(cardA.name)
    duel.continueTurn()
    duel.confirmTransition()

    const cardB = duel.currentCard.value
    duel.submitAnswer(cardB.name)
    duel.continueTurn()

    expect(duel.phase.value).toBe('finished')
    expect(duel.summary.value.winner).toBe('tie')
    expect(duel.summary.value.diff).toBe(0)
  })

  it('rematch() reinicia el marcador, los turnos y reparte cartas de nuevo', () => {
    const duel = useDuelSession({ pool: makePool(6), playerNames: { A: 'Ana', B: 'Beto' }, roundsPerPlayer: 2 })
    duel.startMatch()
    const card = duel.currentCard.value
    duel.submitAnswer(card.name)
    expect(duel.scores.value.A.score).toBeGreaterThan(0)

    duel.rematch()
    expect(duel.phase.value).toBe('presenting')
    expect(duel.turnIndex.value).toBe(0)
    expect(duel.scores.value.A.score).toBe(0)
    expect(duel.scores.value.B.score).toBe(0)
  })
})
