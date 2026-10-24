<script setup>
import { ref } from 'vue'
import AppNav from './components/AppNav.vue'
import HomeScreen from './components/HomeScreen.vue'
import FlashcardEditor from './components/FlashcardEditor.vue'
import FlashcardStudy from './components/FlashcardStudy.vue'
import SessionResults from './components/SessionResults.vue'
import Duel from './components/Duel.vue'
import RankingView from './components/RankingView.vue'
import ProfileStats from './components/ProfileStats.vue'
import { useFlashcards } from './composables/useFlashcards.js'
import { usePlayerProfile } from './composables/usePlayerProfile.js'
import { useSoloLeaderboard } from './composables/useLeaderboard.js'

const { cards, isCardReady } = useFlashcards()
const { profile, applySessionResult } = usePlayerProfile()
const soloLeaderboard = useSoloLeaderboard()

// 'home' | 'collection' | 'study' | 'results' | 'duel' | 'ranking' | 'profile'
const screen = ref('home')
const sessionCards = ref([])
const sessionSummary = ref(null)
const sessionExtras = ref(null)
const lastSessionId = ref('')
const sessionRunKey = ref(0)

function createSessionId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toSessionCards(sourceCards) {
  return sourceCards.map((card) => ({
    id: card.id,
    name: card.name.trim(),
    alternatives: card.alternatives,
    description: card.description,
  }))
}

function startSession(cardsForSession) {
  sessionCards.value = cardsForSession
  sessionRunKey.value += 1
  screen.value = 'study'
}

/**
 * Se dispara una sola vez por sesión (el watch de FlashcardStudy solo emite en la
 * transición a "terminada"): aplica XP/récords/insignias al perfil y registra la
 * partida en el ranking individual, con un id de sesión único para no duplicarla.
 */
function onSessionFinished(summary) {
  sessionSummary.value = summary
  const sessionId = createSessionId()
  lastSessionId.value = sessionId

  sessionExtras.value = applySessionResult(summary, cards.value.length)

  soloLeaderboard.addEntry({
    id: sessionId,
    playerName: profile.value.playerName,
    score: summary.totalScore,
    date: new Date().toISOString(),
    accuracy: summary.percentage,
    firstTryCount: summary.firstTry,
    total: summary.total,
  })

  screen.value = 'results'
}

function repeatSession() {
  sessionRunKey.value += 1
  screen.value = 'study'
}

function handleNavigate(key) {
  if (key === 'play') {
    const readyCards = cards.value.filter(isCardReady)
    if (!readyCards.length) {
      screen.value = 'collection'
    } else {
      startSession(toSessionCards(readyCards))
    }
    return
  }
  screen.value = key
}
</script>

<template>
  <AppNav :active-screen="screen" @navigate="handleNavigate" />

  <Transition name="screen-fade" mode="out-in">
    <HomeScreen v-if="screen === 'home'" @navigate="handleNavigate" />

    <FlashcardEditor v-else-if="screen === 'collection'" @start-session="startSession" />

    <FlashcardStudy
      v-else-if="screen === 'study'"
      :key="sessionRunKey"
      :cards="sessionCards"
      @session-finished="onSessionFinished"
      @exit="screen = 'home'"
    />

    <SessionResults
      v-else-if="screen === 'results' && sessionSummary"
      :summary="sessionSummary"
      :xp-gained="sessionExtras?.xpGained ?? 0"
      :leveled-up="sessionExtras?.leveledUp ?? false"
      :level-after="sessionExtras?.levelAfter ?? 1"
      :new-badges="sessionExtras?.newBadges ?? []"
      @repeat="repeatSession"
      @back-to-collection="screen = 'collection'"
      @view-ranking="screen = 'ranking'"
    />

    <Duel v-else-if="screen === 'duel'" @exit="screen = 'home'" />

    <RankingView v-else-if="screen === 'ranking'" :highlight-id="lastSessionId" />

    <ProfileStats v-else-if="screen === 'profile'" />
  </Transition>
</template>
