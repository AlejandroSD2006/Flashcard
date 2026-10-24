import { ref } from 'vue'
import { readJSON, writeJSON } from '../utils/localStore.js'

/**
 * Fábrica de una lista persistida en localStorage, con deduplicación por `id` (pensada
 * para que una misma sesión/partida nunca pueda registrarse dos veces, aunque algo
 * dispare el guardado más de una vez).
 */
function createPersistedList(storageKey) {
  const entries = ref(readJSON(storageKey, []))

  function persist() {
    writeJSON(storageKey, entries.value)
  }

  function addEntry(entry) {
    if (entries.value.some((existing) => existing.id === entry.id)) {
      return false
    }
    entries.value = [...entries.value, entry]
    persist()
    return true
  }

  function topEntries(n) {
    return [...entries.value].sort((a, b) => b.score - a.score).slice(0, n)
  }

  function reset() {
    entries.value = []
    persist()
  }

  return { entries, addEntry, topEntries, reset }
}

const soloLeaderboard = createPersistedList('flashcards-visuales:leaderboard-solo')
const duelLeaderboard = createPersistedList('flashcards-visuales:leaderboard-duel')

export function useSoloLeaderboard() {
  return soloLeaderboard
}

export function useDuelLeaderboard() {
  return duelLeaderboard
}
