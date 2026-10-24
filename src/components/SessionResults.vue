<script setup>
const props = defineProps({
  summary: { type: Object, required: true },
})

defineEmits(['repeat', 'back-to-collection'])

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds} s`
  return `${minutes} min ${seconds.toString().padStart(2, '0')} s`
}
</script>

<template>
  <div class="results">
    <div class="results-card card-surface">
      <h1>Resultados de la sesión</h1>
      <p class="results-percentage">{{ summary.percentage }}% de aciertos</p>

      <dl class="results-grid">
        <div class="results-item">
          <dt>Tarjetas totales</dt>
          <dd>{{ summary.total }}</dd>
        </div>
        <div class="results-item">
          <dt>Acertadas al primer intento</dt>
          <dd>{{ summary.firstTry }}</dd>
        </div>
        <div class="results-item">
          <dt>Acertadas en 2º o 3er intento</dt>
          <dd>{{ summary.retryTry }}</dd>
        </div>
        <div class="results-item">
          <dt>Falladas por completo</dt>
          <dd>{{ summary.failed }}</dd>
        </div>
        <div class="results-item">
          <dt>Tiempo total</dt>
          <dd>{{ formatDuration(summary.durationMs) }}</dd>
        </div>
      </dl>

      <div class="results-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('back-to-collection')">
          Volver a la colección
        </button>
        <button type="button" class="btn btn-primary" @click="$emit('repeat')">
          Repetir sesión
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.results-card {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.results-percentage {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.results-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.results-item {
  background: var(--color-surface-muted);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

.results-item dt {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.results-item dd {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.results-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@media (max-width: 480px) {
  .results-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column-reverse;
  }

  .results-actions .btn {
    width: 100%;
  }
}
</style>
