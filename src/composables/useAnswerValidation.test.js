import { describe, expect, it } from 'vitest'
import { useAnswerValidation, MAX_ATTEMPTS } from './useAnswerValidation.js'

describe('useAnswerValidation', () => {
  it('empieza en estado pendiente con todos los intentos disponibles', () => {
    const v = useAnswerValidation()
    expect(v.status.value).toBe('pending')
    expect(v.attemptsRemaining.value).toBe(MAX_ATTEMPTS)
    expect(v.isResolved.value).toBe(false)
  })

  it('una respuesta vacía no consume intento', () => {
    const v = useAnswerValidation()
    const resolved = v.submitAnswer('   ', 'gato', [])
    expect(resolved).toBe(false)
    expect(v.attemptsMade.value).toBe(0)
    expect(v.attemptsRemaining.value).toBe(MAX_ATTEMPTS)
  })

  it('una respuesta correcta resuelve la tarjeta de inmediato', () => {
    const v = useAnswerValidation()
    const resolved = v.submitAnswer('gato', 'gato', [])
    expect(resolved).toBe(true)
    expect(v.status.value).toBe('correct')
    expect(v.attemptsMade.value).toBe(1)
  })

  it('acepta respuestas alternativas', () => {
    const v = useAnswerValidation()
    const resolved = v.submitAnswer('cat', 'gato', ['cat', 'minino'])
    expect(resolved).toBe(true)
    expect(v.status.value).toBe('correct')
  })

  it('permite reintentar tras una respuesta incorrecta, sin exceder el máximo', () => {
    const v = useAnswerValidation()
    expect(v.submitAnswer('perro', 'gato', [])).toBe(false)
    expect(v.attemptsRemaining.value).toBe(2)
    expect(v.status.value).toBe('pending')

    expect(v.submitAnswer('perro', 'gato', [])).toBe(false)
    expect(v.attemptsRemaining.value).toBe(1)

    expect(v.submitAnswer('gato', 'gato', [])).toBe(true)
    expect(v.status.value).toBe('correct')
    expect(v.attemptsMade.value).toBe(3)
  })

  it('tras agotar 3 intentos fallidos, la tarjeta queda en estado "failed"', () => {
    const v = useAnswerValidation()
    v.submitAnswer('perro', 'gato', [])
    v.submitAnswer('perro', 'gato', [])
    const resolved = v.submitAnswer('perro', 'gato', [])
    expect(resolved).toBe(true)
    expect(v.status.value).toBe('failed')
    expect(v.attemptsRemaining.value).toBe(0)
  })

  it('no permite enviar más respuestas una vez resuelta la tarjeta', () => {
    const v = useAnswerValidation()
    v.submitAnswer('gato', 'gato', [])
    const resolvedAgain = v.submitAnswer('perro', 'gato', [])
    expect(resolvedAgain).toBe(true)
    expect(v.attemptsMade.value).toBe(1)
  })

  it('reset() vuelve a dejar la tarjeta en su estado inicial', () => {
    const v = useAnswerValidation()
    v.submitAnswer('perro', 'gato', [])
    v.reset()
    expect(v.status.value).toBe('pending')
    expect(v.attemptsMade.value).toBe(0)
    expect(v.lastResult.value).toBe(null)
  })
})
