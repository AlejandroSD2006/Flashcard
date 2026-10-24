import { describe, expect, it } from 'vitest'
import { isAnswerCorrect, normalizeAnswer } from './normalizeAnswer.js'

describe('normalizeAnswer', () => {
  it('quita espacios al principio y al final', () => {
    expect(normalizeAnswer('  gato  ')).toBe('gato')
  })

  it('colapsa espacios repetidos', () => {
    expect(normalizeAnswer('gato   negro')).toBe('gato negro')
  })

  it('ignora mayúsculas y minúsculas', () => {
    expect(normalizeAnswer('GaTo')).toBe('gato')
  })

  it('elimina tildes y acentos', () => {
    expect(normalizeAnswer('cucaracha')).toBe('cucaracha')
    expect(normalizeAnswer('árbol')).toBe('arbol')
    expect(normalizeAnswer('AVIÓN')).toBe('avion')
  })

  it('devuelve cadena vacía si no es texto', () => {
    expect(normalizeAnswer(undefined)).toBe('')
    expect(normalizeAnswer(null)).toBe('')
  })
})

describe('isAnswerCorrect', () => {
  it('acepta la respuesta correcta exacta', () => {
    expect(isAnswerCorrect('Jirafa', ['Jirafa'])).toBe(true)
  })

  it('ignora mayúsculas, espacios y tildes', () => {
    expect(isAnswerCorrect('  AVIÓN  ', ['Avion'])).toBe(true)
  })

  it('acepta respuestas alternativas', () => {
    expect(isAnswerCorrect('giraffe', ['Jirafa', 'giraffe'])).toBe(true)
  })

  it('rechaza una respuesta vacía', () => {
    expect(isAnswerCorrect('   ', ['Jirafa'])).toBe(false)
  })

  it('rechaza respuestas claramente distintas', () => {
    expect(isAnswerCorrect('elefante', ['Jirafa'])).toBe(false)
  })

  it('tolera una sola errata tipográfica en palabras largas', () => {
    expect(isAnswerCorrect('jiraf', ['jirafa'])).toBe(true)
    expect(isAnswerCorrect('jirrafa', ['jirafa'])).toBe(true)
  })

  it('no tolera erratas en palabras cortas', () => {
    expect(isAnswerCorrect('sol', ['sal'])).toBe(false)
  })

  it('no acepta diferencias de más de un carácter', () => {
    expect(isAnswerCorrect('jirafante', ['jirafa'])).toBe(false)
  })
})
