<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useFlashcards } from '../composables/useFlashcards.js'
import { useAnswerValidation, MAX_ATTEMPTS } from '../composables/useAnswerValidation.js'
import { useStudySession } from '../composables/useStudySession.js'
import ProgressBar from './ProgressBar.vue'
import AnswerFeedback from './AnswerFeedback.vue'

const props = defineProps({
  cards: { type: Array, required: true },
})

const emit = defineEmits(['session-finished'])

const { imageUrls } = useFlashcards()

const session = useStudySession(props.cards)
const validation = useAnswerValidation()

const answerText = ref('')
const answerInput = ref(null)

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

function checkAnswer() {
  if (!session.currentCard.value || validation.isResolved.value) return
  if (!answerText.value.trim()) return

  const card = session.currentCard.value
  const resolved = validation.submitAnswer(answerText.value, card.name, card.alternatives)

  if (resolved) {
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
      <h1>Flashcards Visuales</h1>
      <ProgressBar :current="session.progress.value.current" :total="session.progress.value.total" />
    </header>

    <div class="study-card card-surface">
      <div class="study-image-wrap">
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

        <p class="study-attempts" :class="{ 'study-attempts--warning': validation.attemptsRemaining.value === 1 }">
          <template v-if="!validation.isResolved.value">
            Te quedan {{ validation.attemptsRemaining.value }} de {{ MAX_ATTEMPTS }} intentos.
          </template>
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

.study-card {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.study-image-wrap {
  display: flex;
  justify-content: center;
  background: var(--color-surface-muted);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.study-image {
  max-width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: var(--radius-md);
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
  font-weight: 600;
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
