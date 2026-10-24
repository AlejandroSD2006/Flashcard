// Envoltorio seguro sobre localStorage: nunca lanza (modo privado, cuota agotada,
// almacenamiento bloqueado...) y siempre devuelve datos utilizables.

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
