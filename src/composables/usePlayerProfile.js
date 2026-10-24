import { ref, computed } from 'vue'
import { readJSON, writeJSON } from '../utils/localStore.js'
import { levelFromXp, xpForOutcome } from '../utils/xp.js'
import { BADGES, evaluateBadges } from '../data/badges.js'

const STORAGE_KEY = 'flashcards-visuales:profile'

function defaultProfile() {
  const now = new Date().toISOString()
  return {
    playerName: 'Jugador',
    totalXp: 0,
    bestScore: 0,
    bestStreak: 0,
    totalCardsSolved: 0,
    totalFirstTry: 0,
    badges: [], // [{ id, unlockedAt }]
    createdAt: now,
    updatedAt: now,
  }
}

const profile = ref(readJSON(STORAGE_KEY, defaultProfile()))

function persist() {
  profile.value = { ...profile.value, updatedAt: new Date().toISOString() }
  writeJSON(STORAGE_KEY, profile.value)
}

function setPlayerName(name) {
  const trimmed = (name || '').trim()
  profile.value = { ...profile.value, playerName: trimmed || 'Jugador' }
  persist()
}

/**
 * Aplica el resultado de una sesión individual terminada: suma XP, actualiza récords
 * y desbloquea las insignias nuevas que correspondan. Devuelve un resumen pensado para
 * mostrarse en la pantalla de resultados (XP ganada, si subió de nivel, insignias
 * nuevas).
 */
function applySessionResult(summary, collectionSize) {
  const levelBefore = levelFromXp(profile.value.totalXp).level

  const xpGained =
    summary.firstTry * xpForOutcome('first') +
    summary.retryTry * xpForOutcome('retry') +
    summary.failed * xpForOutcome('failed')

  const updated = {
    ...profile.value,
    totalXp: profile.value.totalXp + xpGained,
    bestScore: Math.max(profile.value.bestScore, summary.totalScore ?? 0),
    bestStreak: Math.max(profile.value.bestStreak, summary.bestStreakInSession ?? 0),
    totalCardsSolved: profile.value.totalCardsSolved + summary.total,
    totalFirstTry: profile.value.totalFirstTry + summary.firstTry,
  }

  const unlockedIds = evaluateBadges({
    profile: updated,
    sessionStats: {
      total: summary.total,
      firstTryCount: summary.firstTry,
      failed: summary.failed,
      bestStreakInSession: summary.bestStreakInSession ?? 0,
    },
    collectionSize,
  })

  const alreadyUnlocked = new Set(updated.badges.map((b) => b.id))
  const newBadgeIds = unlockedIds.filter((id) => !alreadyUnlocked.has(id))
  const now = new Date().toISOString()
  updated.badges = [...updated.badges, ...newBadgeIds.map((id) => ({ id, unlockedAt: now }))]

  profile.value = updated
  persist()

  const levelAfter = levelFromXp(updated.totalXp).level

  return {
    xpGained,
    leveledUp: levelAfter > levelBefore,
    levelBefore,
    levelAfter,
    newBadges: BADGES.filter((badge) => newBadgeIds.includes(badge.id)),
  }
}

export function usePlayerProfile() {
  const levelInfo = computed(() => levelFromXp(profile.value.totalXp))
  const unlockedBadgeIds = computed(() => new Set(profile.value.badges.map((b) => b.id)))

  return {
    profile,
    levelInfo,
    unlockedBadgeIds,
    allBadges: BADGES,
    setPlayerName,
    applySessionResult,
  }
}
