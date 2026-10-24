/**
 * Normaliza una cadena de texto para poder comparar respuestas del usuario
 * de forma tolerante a mayúsculas/minúsculas, espacios y acentos.
 *
 * Pasos:
 * 1. Quita espacios al principio/final.
 * 2. Colapsa espacios repetidos en uno solo.
 * 3. Convierte a minúsculas.
 * 4. Elimina diacríticos (tildes, diéresis...) vía descomposición Unicode (NFD).
 */
export function normalizeAnswer(text) {
  if (typeof text !== 'string') return ''

  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Distancia de Levenshtein entre dos cadenas, usada para tolerar pequeñas
 * erratas tipográficas (una letra cambiada, añadida o eliminada).
 */
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // eliminación
          matrix[i][j - 1] + 1, // inserción
          matrix[i - 1][j - 1] + 1, // sustitución
        )
      }
    }
  }

  return matrix[a.length][b.length]
}

/**
 * Comprueba si una respuesta del usuario coincide con alguna de las
 * respuestas válidas (la correcta + alternativas), tras normalizar ambas.
 *
 * Tolerancia tipográfica conservadora: solo se acepta si la distancia de
 * Levenshtein entre la respuesta normalizada y una respuesta válida es de
 * como máximo 1 carácter, y únicamente cuando la respuesta válida tiene 4
 * o más caracteres (para palabras muy cortas, un solo carácter de diferencia
 * puede cambiar completamente el significado, así que ahí se exige
 * coincidencia exacta).
 */
export function isAnswerCorrect(userAnswer, validAnswers) {
  const normalizedUser = normalizeAnswer(userAnswer)
  if (!normalizedUser) return false

  const candidates = validAnswers.map(normalizeAnswer).filter(Boolean)

  return candidates.some((candidate) => {
    if (normalizedUser === candidate) return true

    if (candidate.length >= 4) {
      return levenshteinDistance(normalizedUser, candidate) <= 1
    }

    return false
  })
}
