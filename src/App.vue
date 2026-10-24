<script setup>
import { ref } from 'vue'
import FlashcardEditor from './components/FlashcardEditor.vue'
import FlashcardStudy from './components/FlashcardStudy.vue'
import SessionResults from './components/SessionResults.vue'

const screen = ref('collection') // 'collection' | 'study' | 'results'
const sessionCards = ref([])
const sessionSummary = ref(null)
const sessionRunKey = ref(0)

function startSession(cards) {
  sessionCards.value = cards
  sessionRunKey.value += 1
  screen.value = 'study'
}

function onSessionFinished(summary) {
  sessionSummary.value = summary
  screen.value = 'results'
}

function repeatSession() {
  sessionRunKey.value += 1
  screen.value = 'study'
}

function backToCollection() {
  screen.value = 'collection'
}
</script>

<template>
  <main>
    <FlashcardEditor v-if="screen === 'collection'" @start-session="startSession" />

    <FlashcardStudy
      v-else-if="screen === 'study'"
      :key="sessionRunKey"
      :cards="sessionCards"
      @session-finished="onSessionFinished"
    />

    <SessionResults
      v-else-if="screen === 'results' && sessionSummary"
      :summary="sessionSummary"
      @repeat="repeatSession"
      @back-to-collection="backToCollection"
    />
  </main>
</template>
