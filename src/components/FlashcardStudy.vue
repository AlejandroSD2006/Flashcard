<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useFlashcards } from '../composables/useFlashcards.js'
import { useAnswerValidation, MAX_ATTEMPTS } from '../composables/useAnswerValidation.js'
import { useStudySession } from '../composables/useStudySession.js'
import ProgressBar from './ProgressBar.vue'
import AnswerFeedback from './AnswerFeedback.vue'
import ScoreHud from './ScoreHud.vue'
import CelebrationBurst from './CelebrationBurst.vue'

const props = defineProps({
  cards: { type: Array, required: true },
})

const emit = defineEmits(['session-finished', 'exit'])

const { imageUrls } = useFlashcards()

const session = useStudySession(props.cards)
const validation = useAnswerValidation()

const answerText = ref('')
const answerInput = ref(null)
const shakeActive = ref(false)
const bounceActive = ref(false)
const celebrationActive = ref(false)
const celebrationIntensity = ref('normal')

const feedbackStatus = computed(() => {
  if (validation.status.value === 'correct') return 'correct'
  if (validation.status.value === 'failed') return 'failed'
  if (validation.lastResult.value === 'incorrect') return 'incorrect'
  return 'idle'
})

watch(
  () => session.currentCard.value,
  () => {
    validation.reset()
    answerText.value = ''
    shakeActive.value = false
    bounceActive.value = false
    celebrationActive.value = false
    nextTick(() => answerInput.value?.focus())
  },
  { immediate: true },
)

watch(
  () => session.isSessionFinished.value,
  (finished) => {
    if (finished) {
      emit('session-finished', session.summary.value)
    }
  },
)

function triggerShake() {
  shakeActive.value = false
  requestAnimationFrame(() => {
    shakeActive.value = true
  })
  setTimeout(() => {
    shakeActive.value = false
  }, 450)
}

function checkAnswer() {
  if (!session.currentCard.value || validation.isResolved.value) return
  if (!answerText.value.trim()) return

  const card = session.currentCard.value
  const resolved = validation.submitAnswer(answerText.value, card.name, card.alternatives)

  if (validation.lastResult.value === 'incorrect') {
    triggerShake()
  }

  if (resolved) {
    if (validation.status.value === 'correct') {
      celebrationIntensity.value = validation.attemptsMade.value === 1 ? 'big' : 'normal'
      celebrationActive.value = true
      bounceActive.value = false
      requestAnimationFrame(() => {
        bounceActive.value = true
      })
    }

    const outcome =
      validation.status.value === 'correct'
        ? validation.attemptsMade.value === 1
          ? 'first'
          : 'retry'
        : 'failed'
    session.recordResult(outcome, validation.attemptsMade.value)
  }
}

function goNext() {
  session.goToNext()
}
</script>

<template>
  <div v-if="session.currentCard.value" class="study">
    <header class="study-header">
      <div class="study-header-row">
        <h1>Flashcards Visuales</h1>
        <button type="button" class="btn-exit" @click="$emit('exit')">← Salir</button>
      </div>
      <ProgressBar :current="session.progress.value.current" :total="session.progress.value.total" />
      <ScoreHud :score="session.summary.value.totalScore" :streak="session.currentStreak.value" />
    </header>

    <Transition name="card-flip" mode="out-in">
      <div
        :key="session.currentCard.value.id"
        class="study-card card-surface"
        :class="{ 'shake-error': shakeActive, 'bounce-success': bounceActive }"
      >
        <CelebrationBurst :active="celebrationActive" :intensity="celebrationIntensity" />

        <div class="study-image-wrap tag-cut">
          <img
            v-if="imageUrls[session.currentCard.value.id]"
            :src="imageUrls[session.currentCard.value.id]"
            :alt="validation.isResolved.value ? session.currentCard.value.name : 'Fotografía para identificar'"
            class="study-image"
          />
        </div>

        <form class="study-form" @submit.prevent="checkAnswer">
          <label class="study-label" :for="'answer-' + session.currentCard.value.id">
            ¿Qué aparece en la fotografía?
          </label>
          <div class="study-input-row">
            <input
              :id="'answer-' + session.currentCard.value.id"
              ref="answerInput"
              v-model="answerText"
              type="text"
              autocomplete="off"
              :disabled="validation.isResolved.value"
              placeholder="Escribe tu respuesta"
            />
            <button type="submit" class="btn btn-primary" :disabled="validation.isResolved.value">
              Comprobar respuesta
            </button>
          </div>

          <p
            class="study-attempts"
            :class="{ 'study-attempts--warning': validation.attemptsRemaining.value === 1 }"
            :key="validation.attemptsRemaining.value"
          >
            <template v-if="!validation.isResolved.value && validation.attemptsRemaining.value > 1">
              Te quedan {{ validation.attemptsRemaining.value }} de {{ MAX_ATTEMPTS }} intentos.
            </template>
            <template v-else-if="!validation.isResolved.value">¡Último intento!</template>
            <template v-else>Tarjeta resuelta.</template>
          </p>
        </form>

        <AnswerFeedback
          :status="feedbackStatus"
          :correct-answer="session.currentCard.value.name"
          :description="session.currentCard.value.description"
        />

        <div class="study-actions">
          <button
            type="button"
            class="btn btn-primary btn-next"
            :disabled="!validation.isResolved.value"
            @click="goNext"
          >
            Siguiente tarjeta
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.study {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.study-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.study-header-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
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

.study-card {
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
  max-height: 420px;
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

.study-input-row input:disabled {
  background: var(--color-surface-muted);
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

.btn-next {
  padding: 0.75rem 1.75rem;
}

@media (max-width: 640px) {
  .study-input-row {
    flex-direction: column;
  }
}
</style>
