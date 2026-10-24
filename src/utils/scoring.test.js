import { describe, expect, it } from 'vitest'
import { scoreForAnswer, STREAK_BONUS_CAP_MULTIPLIER } from './scoring.js'

describe('scoreForAnswer', () => {
  it('da 0 puntos siempre que la tarjeta se falla', () => {
    const result = scoreForAnswer({ outcome: 'failed', attemptsUsed: 3, streakBefore: 9 })
    expect(result.total).toBe(0)
    expect(result.base).toBe(0)
    expect(result.streakBonus).toBe(0)
    expect(result.firstTryBonus).toBe(0)
  })

  it('base de 100 puntos al acertar al primer intento, sin racha previa', () => {
    const result = scoreForAnswer({ outcome: 'first', attemptsUsed: 1, streakBefore: 0 })
    expect(result.base).toBe(100)
    expect(result.multiplier).toBe(1)
    expect(result.streakBonus).toBe(0)
    expect(result.firstTryBonus).toBe(20)
    expect(result.total).toBe(120)
  })

  it('base de 70 puntos al acertar al segundo intento (sin bonus de primer intento)', () => {
    const result = scoreForAnswer({ outcome: 'retry', attemptsUsed: 2, streakBefore: 0 })
    expect(result.base).toBe(70)
    expect(result.firstTryBonus).toBe(0)
    expect(result.total).toBe(70)
  })

  it('base de 40 puntos al acertar al tercer intento', () => {
    const result = scoreForAnswer({ outcome: 'retry', attemptsUsed: 3, streakBefore: 0 })
    expect(result.base).toBe(40)
  })

  it('aplica el multiplicador de racha sobre la base', () => {
    const result = scoreForAnswer({ outcome: 'first', attemptsUsed: 1, streakBefore: 3 })
    // multiplicador = 1 + 0.1*3 = 1.3 -> 130 puntos base, +20 de primer intento
    expect(result.multiplier).toBeCloseTo(1.3)
    expect(result.base + result.streakBonus).toBe(130)
    expect(result.total).toBe(150)
  })

  it('el multiplicador de racha tiene un tope (x2 a partir de 10 aciertos consecutivos)', () => {
    const atCap = scoreForAnswer({ outcome: 'first', attemptsUsed: 1, streakBefore: 10 })
    const beyondCap = scoreForAnswer({ outcome: 'first', attemptsUsed: 1, streakBefore: 50 })
    expect(atCap.multiplier).toBe(STREAK_BONUS_CAP_MULTIPLIER)
    expect(beyondCap.multiplier).toBe(STREAK_BONUS_CAP_MULTIPLIER)
    expect(beyondCap.total).toBe(atCap.total)
  })

  it('una racha negativa (defensivo) no reduce la base por debajo de lo normal', () => {
    const result = scoreForAnswer({ outcome: 'retry', attemptsUsed: 2, streakBefore: -5 })
    expect(result.multiplier).toBe(1)
    expect(result.total).toBe(70)
  })

  it('nunca devuelve un total negativo o inferior a la base', () => {
    const result = scoreForAnswer({ outcome: 'first', attemptsUsed: 1, streakBefore: 7 })
    expect(result.total).toBeGreaterThanOrEqual(result.base)
  })
})
