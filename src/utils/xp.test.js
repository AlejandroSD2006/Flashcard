import { describe, expect, it } from 'vitest'
import { levelFromXp, xpForOutcome } from './xp.js'

describe('xpForOutcome', () => {
  it('da más XP por acertar al primer intento que por reintento', () => {
    expect(xpForOutcome('first')).toBeGreaterThan(xpForOutcome('retry'))
  })

  it('siempre da algo de XP de participación, incluso al fallar', () => {
    expect(xpForOutcome('failed')).toBeGreaterThan(0)
  })
})

describe('levelFromXp', () => {
  it('empieza en nivel 1 con 0 XP', () => {
    const info = levelFromXp(0)
    expect(info.level).toBe(1)
    expect(info.currentXp).toBe(0)
  })

  it('sube a nivel 2 exactamente al llegar al umbral', () => {
    const info = levelFromXp(100)
    expect(info.level).toBe(2)
    expect(info.currentXp).toBe(0)
  })

  it('cada nivel pide más XP que el anterior', () => {
    const level2 = levelFromXp(100)
    const level3 = levelFromXp(100 + 150)
    expect(level3.level).toBe(3)
    expect(level3.neededXp).toBeGreaterThan(level2.neededXp)
  })

  it('el nivel es monótono creciente con el XP total', () => {
    let previousLevel = 1
    for (let xp = 0; xp <= 2000; xp += 37) {
      const { level } = levelFromXp(xp)
      expect(level).toBeGreaterThanOrEqual(previousLevel)
      previousLevel = level
    }
  })

  it('nunca da un nivel por debajo de 1, incluso con XP negativo', () => {
    expect(levelFromXp(-50).level).toBe(1)
    expect(levelFromXp(-50).currentXp).toBe(0)
  })
})
