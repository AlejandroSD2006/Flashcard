<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useFlashcards } from '../composables/useFlashcards.js'
import { MAX_ATTEMPTS } from '../composables/useAnswerValidation.js'
import ProgressBar from './ProgressBar.vue'
import AnswerFeedback from './AnswerFeedback.vue'
import CelebrationBurst from './CelebrationBurst.vue'

const props = defineProps({
  duel: { type: Object, required: true },
})

const emit = defineEmits(['exit'])

const { imageUrls } = useFlashcards()
const duel = props.duel

const answerText = ref('')
const answerInput = ref(null)
const shakeActive = ref(false)
const bounceActive = ref(false)
const celebrationActive = ref(false)
const celebrationIntensity = ref('normal')
const finishCelebration = ref(false)

const feedbackStatus = computed(() => {
  if (duel.phase.value !== 'resolved') return 'idle'
  if (duel.validation.status.value === 'correct') return 'correct'
  if (duel.validation.status.value === 'failed') return 'failed'
  return 'idle'
})

watch(
  () => duel.currentCard.value,
  () => {
    answerText.value = ''
    shakeActive.value = false
    bounceActive.value = false
    celebrationActive.value = false
    nextTick(() => answerInput.value?.focus())
  },
)

watch(
  () => duel.phase.value,
  (phase) => {
    if (phase === 'finished') finishCelebration.value = true
  },
)

onMounted(() => {
  if (duel.phase.value === 'finished') finishCelebration.value = true
})

function triggerShake() {
  shakeActive.value = false
  requestAnimationFrame(() => {
    shakeActive.value = true
  })
  setTimeout(() => {
    shakeActive.value = false
  }, 450)
}

function submit() {
  if (!answerText.value.trim()) return
  duel.submitAnswer(answerText.value)

  if (duel.validation.lastResult.value === 'incorrect') {
    triggerShake()
  }
  if (duel.phase.value === 'resolved' && duel.validation.status.value === 'correct') {
    celebrationIntensity.value = duel.validation.attemptsMade.value === 1 ? 'big' : 'normal'
    celebrationActive.value = true
    bounceActive.value = false
    requestAnimationFrame(() => {
      bounceActive.value = true
    })
  }
}

function rematch() {
  finishCelebration.value = false
  duel.rematch()
}

function accuracy(stats) {
  return stats.total ? Math.round(((stats.firstTry + stats.retry) / stats.total) * 100) : 0
}
</script>

<template>
  <div class="duel-play">
    <header class="duel-header">
      <h1>Duelo 1vs1</h1>
      <button type="button" class="btn-exit" @click="$emit('exit')">← Salir</button>
    </header>

    <!-- Presentación antes del primer turno -->
    <div v-if="duel.phase.value === 'presenting'" class="duel-panel card-surface">
      <p class="duel-announce">Juega primero:</p>
      <p class="duel-announce-name">{{ duel.currentPlayerName.value }}</p>
      <button type="button" class="btn btn-primary" @click="duel.startMatch()">Empezar</button>
    </div>

    <!-- Turno de privacidad: pasar el dispositivo -->
    <div v-else-if="duel.phase.value === 'transition'" class="duel-panel card-surface">
      <p class="duel-announce">Pasa el dispositivo a</p>
      <p class="duel-announce-name">{{ duel.nextPlayerName.value }}</p>
      <p class="duel-announce-hint">No mires la pantalla hasta que te toque 🙈</p>
      <button type="button" class="btn btn-primary" @click="duel.confirmTransition()">Estoy listo</button>
    </div>

    <!-- Partida terminada -->
    <div v-else-if="duel.phase.value === 'finished'" class="duel-panel card-surface duel-finished">
      <CelebrationBurst :active="finishCelebration" intensity="big" />
      <h2 class="duel-winner">
        <template v-if="duel.summary.value.winner === 'tie'">¡Empate!</template>
        <template v-else>
          🏆 Gana {{ duel.summary.value.winner === 'A' ? duel.players.value.A : duel.players.value.B }}
        </template>
      </h2>
      <p class="duel-diff" v-if="duel.summary.value.winner !== 'tie'">
        Diferencia de {{ duel.summary.value.diff }} puntos
      </p>

      <div class="duel-final-scores">
        <div class="duel-final-player">
          <h3>{{ duel.players.value.A }}</h3>
          <p class="duel-final-score">{{ duel.summary.value.scores.A.score }} pts</p>
          <p>{{ duel.summary.value.scores.A.firstTry }} al primer intento · {{ accuracy(duel.summary.value.scores.A) }}% acierto</p>
        </div>
        <div class="duel-final-player">
          <h3>{{ duel.players.value.B }}</h3>
          <p class="duel-final-score">{{ duel.summary.value.scores.B.score }} pts</p>
          <p>{{ duel.summary.value.scores.B.firstTry }} al primer intento · {{ accuracy(duel.summary.value.scores.B) }}% acierto</p>
        </div>
      </div>

      <div class="duel-final-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('exit')">Volver al menú</button>
        <button type="button" class="btn btn-primary" @click="rematch">Revancha</button>
      </div>
    </div>

    <!-- Turno en curso -->
    <template v-else>
      <ProgressBar :current="duel.progress.value.current" :total="duel.progress.value.total" />

      <div class="duel-scoreboard">
        <div class="duel-score" :class="{ 'duel-score--active': duel.currentPlayerKey.value === 'A' }">
          <span>{{ duel.players.value.A }}</span>
          <strong>{{ duel.scores.value.A.score }}</strong>
        </div>
        <div class="duel-score" :class="{ 'duel-score--active': duel.currentPlayerKey.value === 'B' }">
          <span>{{ duel.players.value.B }}</span>
          <strong>{{ duel.scores.value.B.score }}</strong>
        </div>
      </div>

      <p class="duel-turn-banner">Turno de <strong>{{ duel.currentPlayerName.value }}</strong></p>

      <div class="duel-card card-surface" :class="{ 'shake-error': shakeActive, 'bounce-success': bounceActive }">
        <CelebrationBurst :active="celebrationActive" :intensity="celebrationIntensity" />

        <div class="study-image-wrap tag-cut">
          <img
            v-if="duel.currentCard.value && imageUrls[duel.currentCard.value.id]"
            :src="imageUrls[duel.currentCard.value.id]"
            :alt="duel.validation.isResolved.value ? duel.currentCard.value.name : 'Fotografía para identificar'"
            class="study-image"
          />
        </div>

        <form class="study-form" @submit.prevent="submit">
          <label class="study-label">¿Qué aparece en la fotografía?</label>
          <div class="study-input-row">
            <input
              ref="answerInput"
              v-model="answerText"
              type="text"
              autocomplete="off"
              :disabled="duel.validation.isResolved.value"
              placeholder="Escribe tu respuesta"
            />
            <button type="submit" class="btn btn-primary" :disabled="duel.validation.isResolved.value">
              Comprobar
            </button>
          </div>
          <p class="study-attempts" :class="{ 'study-attempts--warning': duel.validation.attemptsRemaining.value === 1 }">
            <template v-if="!duel.validation.isResolved.value && duel.validation.attemptsRemaining.value > 1">
              Te quedan {{ duel.validation.attemptsRemaining.value }} de {{ MAX_ATTEMPTS }} intentos.
            </template>
            <template v-else-if="!duel.validation.isResolved.value">¡Último intento!</template>
            <template v-else>Turno resuelto.</template>
          </p>
        </form>

        <AnswerFeedback
          :status="feedbackStatus"
          :correct-answer="duel.currentCard.value?.name"
          :description="duel.currentCard.value?.description"
        />

        <div class="study-actions">
          <button type="button" class="btn btn-primary" :disabled="duel.phase.value !== 'resolved'" @click="duel.continueTurn()">
            Continuar
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.duel-play {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.duel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.btn-exit {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
}

.btn-exit:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.duel-panel {
  position: relative;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
  overflow: visible;
}

.duel-announce {
  margin: 0;
  color: var(--color-text-muted);
}

.duel-announce-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary);
}

.duel-announce-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.duel-scoreboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.duel-score {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  font-weight: 600;
}

.duel-score--active {
  background: var(--color-xp-bg);
  box-shadow: 0 0 0 2px var(--color-xp) inset;
}

.duel-turn-banner {
  margin: 0;
  text-align: center;
  color: var(--color-text-muted);
}

.duel-card {
  position: relative;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow: visible;
}

.study-image-wrap {
  --notch: 22px;
  display: flex;
  justify-content: center;
  background: var(--color-surface-muted);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  position: relative;
}

.study-image-wrap::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px dashed var(--color-primary);
  opacity: 0.35;
  clip-path: inherit;
  pointer-events: none;
}

.study-image {
  max-width: 100%;
  max-height: 380px;
  object-fit: contain;
  border-radius: 4px;
}

.study-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.study-label {
  font-weight: 600;
}

.study-input-row {
  display: flex;
  gap: var(--space-2);
}

.study-input-row input {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.9rem;
  font-size: 1rem;
}

.study-attempts {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.study-attempts--warning {
  color: var(--color-error);
  font-weight: 700;
}

.study-actions {
  display: flex;
  justify-content: flex-end;
}

.duel-finished {
  gap: var(--space-4);
}

.duel-winner {
  margin: 0;
  font-size: 1.5rem;
}

.duel-diff {
  margin: 0;
  color: var(--color-text-muted);
}

.duel-final-scores {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  width: 100%;
}

.duel-final-player {
  background: var(--color-surface-muted);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
}

.duel-final-player h3 {
  margin: 0 0 var(--space-1);
}

.duel-final-player p {
  margin: 0.15rem 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.duel-final-score {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
}

.duel-final-actions {
  display: flex;
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .study-input-row {
    flex-direction: column;
  }

  .duel-final-scores {
    grid-template-columns: 1fr;
  }
}
</style>
