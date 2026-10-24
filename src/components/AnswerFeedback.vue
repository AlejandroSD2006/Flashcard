<script setup>
defineProps({
  // 'idle' | 'incorrect' | 'correct' | 'failed'
  status: { type: String, default: 'idle' },
  correctAnswer: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="feedback" aria-live="polite">
    <div v-if="status === 'correct'" class="feedback-message feedback-message--success">
      <p class="feedback-title">
        <span class="feedback-icon" aria-hidden="true">✓</span>
        ¡CORRECTO! Es: <strong>{{ correctAnswer }}</strong>
      </p>
      <p v-if="description" class="feedback-description">{{ description }}</p>
    </div>

    <p v-else-if="status === 'incorrect'" class="feedback-message feedback-message--error">
      <span class="feedback-icon" aria-hidden="true">✕</span>
      Incorrecto, inténtalo de nuevo.
    </p>

    <div v-else-if="status === 'failed'" class="feedback-message feedback-message--error">
      <p class="feedback-title">
        <span class="feedback-icon" aria-hidden="true">✕</span>
        Has agotado los intentos.
      </p>
      <p class="feedback-reveal">La respuesta correcta era: <strong>{{ correctAnswer }}</strong></p>
      <p v-if="description" class="feedback-description">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.feedback {
  min-height: 2.5rem;
}

.feedback-message {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  animation: feedback-pop 0.2s ease;
}

.feedback-message--success,
.feedback-message--error {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.feedback-message--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.feedback-message--error {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.feedback-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.feedback-reveal,
.feedback-description {
  margin: 0;
  font-weight: 400;
  font-size: 0.9rem;
}

.feedback-icon {
  display: inline-flex;
  width: 1.4rem;
  height: 1.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: currentColor;
  color: var(--color-surface);
  font-size: 0.8rem;
}

@keyframes feedback-pop {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
