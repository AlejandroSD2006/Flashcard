import { ref, computed } from 'vue'
import { splitDisjointHands, buildTurnOrder } from '../utils/duel.js'
import { scoreForAnswer } from '../utils/scoring.js'
import { useAnswerValidation } from './useAnswerValidation.js'
import { useDuelLeaderboard } from './useLeaderboard.js'

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `duel-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function emptyPlayerScore() {
  return { score: 0, total: 0, firstTry: 0, retry: 0, failed: 0, streak: 0, bestStreak: 0 }
}

/** Para cada turno, en qué posición de la mano de ESE jugador está (0, 1, 2...). */
function computeHandIndices(order) {
  let a = 0
  let b = 0
  return order.map((player) => {
    if (player === 'A') {
      const index = a
      a += 1
      return index
    }
    const index = b
    b += 1
    return index
  })
}

/**
 * Gestiona una partida de Duelo 1vs1 local: reparto de cartas sin solapar, turnos
 * alternados, puntuación independiente por jugador (mismas reglas que el modo
 * individual, ver `utils/scoring.js`) y las fases de privacidad entre turnos.
 *
 * Fases: 'presenting' (antes del primer turno) -> 'turn' (jugando) -> 'resolved'
 * (tarjeta ya resuelta, esperando a continuar) -> 'transition' (pantalla de "pasa el
 * dispositivo", oculta la respuesta) -> 'turn' del siguiente jugador... hasta 'finished'.
 */
export function useDuelSession({ pool, playerNames, roundsPerPlayer }) {
  const { addEntry } = useDuelLeaderboard()

  const players = ref({ A: playerNames.A, B: playerNames.B })
  const phase = ref('presenting')
  const turnIndex = ref(0)
  const scores = ref({ A: emptyPlayerScore(), B: emptyPlayerScore() })
  const sessionId = ref(createId())

  let hands = splitDisjointHands(pool, roundsPerPlayer)
  const rounds = ref(hands.rounds)
  const turnOrder = ref(buildTurnOrder(hands.rounds))
  let handIndices = computeHandIndices(turnOrder.value)
  const handsState = ref({ A: hands.handA, B: hands.handB })

  const validation = useAnswerValidation()

  const totalTurns = computed(() => turnOrder.value.length)
  const currentPlayerKey = computed(() => turnOrder.value[turnIndex.value] ?? null)
  const currentPlayerName = computed(() =>
    currentPlayerKey.value ? players.value[currentPlayerKey.value] : '',
  )
  const nextPlayerName = computed(() => {
    const nextKey = turnOrder.value[turnIndex.value + 1]
    return nextKey ? players.value[nextKey] : ''
  })
  const currentCard = computed(() => {
    if (!currentPlayerKey.value) return null
    const handIndex = handIndices[turnIndex.value]
    return handsState.value[currentPlayerKey.value][handIndex] ?? null
  })
  const progress = computed(() => ({
    current: Math.min(turnIndex.value + 1, totalTurns.value),
    total: totalTurns.value,
  }))

  function startMatch() {
    phase.value = 'turn'
  }

  function submitAnswer(answerText) {
    if (phase.value !== 'turn' || !currentCard.value || validation.isResolved.value) return

    const card = currentCard.value
    const resolved = validation.submitAnswer(answerText, card.name, card.alternatives)
    if (!resolved) return

    const outcome =
      validation.status.value === 'correct'
        ? validation.attemptsMade.value === 1
          ? 'first'
          : 'retry'
        : 'failed'

    registerOutcome(currentPlayerKey.value, outcome, validation.attemptsMade.value)
    phase.value = 'resolved'
  }

  function registerOutcome(playerKey, outcome, attemptsUsed) {
    const current = scores.value[playerKey]
    const points = scoreForAnswer({ outcome, attemptsUsed, streakBefore: current.streak })

    const updated = { ...current, score: current.score + points.total, total: current.total + 1 }
    if (outcome === 'failed') {
      updated.streak = 0
      updated.failed += 1
    } else {
      updated.streak += 1
      updated.bestStreak = Math.max(updated.bestStreak, updated.streak)
      if (outcome === 'first') updated.firstTry += 1
      else updated.retry += 1
    }

    scores.value = { ...scores.value, [playerKey]: updated }
  }

  /** Avanza desde 'resolved': a transición (si quedan turnos) o a fin de partida. */
  function continueTurn() {
    if (phase.value !== 'resolved') return

    if (turnIndex.value + 1 >= totalTurns.value) {
      finishMatch()
    } else {
      phase.value = 'transition'
    }
  }

  /** Confirma que el siguiente jugador ya tiene el dispositivo y empieza su turno. */
  function confirmTransition() {
    if (phase.value !== 'transition') return
    turnIndex.value += 1
    validation.reset()
    phase.value = 'turn'
  }

  function finishMatch() {
    phase.value = 'finished'
    addEntry({
      id: sessionId.value,
      date: new Date().toISOString(),
      score: Math.max(scores.value.A.score, scores.value.B.score),
      playerA: { name: players.value.A, ...scores.value.A },
      playerB: { name: players.value.B, ...scores.value.B },
      winner: summary.value.winner,
    })
  }

  function rematch() {
    hands = splitDisjointHands(pool, roundsPerPlayer)
    rounds.value = hands.rounds
    turnOrder.value = buildTurnOrder(hands.rounds)
    handIndices = computeHandIndices(turnOrder.value)
    handsState.value = { A: hands.handA, B: hands.handB }
    turnIndex.value = 0
    scores.value = { A: emptyPlayerScore(), B: emptyPlayerScore() }
    sessionId.value = createId()
    validation.reset()
    phase.value = 'presenting'
  }

  const summary = computed(() => {
    const a = scores.value.A
    const b = scores.value.B
    let winner = 'tie'
    if (a.score > b.score) winner = 'A'
    else if (b.score > a.score) winner = 'B'

    return {
      players: players.value,
      scores: { A: a, B: b },
      winner,
      diff: Math.abs(a.score - b.score),
      totalRounds: rounds.value,
    }
  })

  return {
    players,
    phase,
    rounds,
    turnIndex,
    totalTurns,
    progress,
    currentPlayerKey,
    currentPlayerName,
    nextPlayerName,
    currentCard,
    validation,
    scores,
    summary,
    startMatch,
    submitAnswer,
    continueTurn,
    confirmTransition,
    rematch,
  }
}
