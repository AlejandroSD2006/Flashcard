<script setup>
import { onMounted, ref } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'
import CelebrationBurst from './CelebrationBurst.vue'

const props = defineProps({
  summary: { type: Object, required: true },
  xpGained: { type: Number, default: 0 },
  leveledUp: { type: Boolean, default: false },
  levelAfter: { type: Number, default: 1 },
  newBadges: { type: Array, default: () => [] },
})

defineEmits(['repeat', 'back-to-collection', 'view-ranking'])

const celebrationActive = ref(false)

onMounted(() => {
  celebrationActive.value = true
})

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
      <CelebrationBurst :active="celebrationActive" :intensity="summary.failed === 0 ? 'big' : 'normal'" />

      <h1>{{ summary.failed === 0 ? '¡Sesión perfecta!' : 'Resultados de la sesión' }}</h1>

      <div class="results-score">
        <span class="results-score-label">Puntos conseguidos</span>
        <span class="results-score-value"><AnimatedNumber :value="summary.totalScore" /></span>
      </div>

      <p class="results-percentage">{{ summary.percentage }}% de aciertos</p>

      <div class="results-xp">
        <span>+<AnimatedNumber :value="xpGained" /> XP</span>
        <span v-if="leveledUp" class="results-level-up pop-in">¡Subiste a nivel {{ levelAfter }}!</span>
      </div>

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
          <dt>Mejor racha</dt>
          <dd>{{ summary.bestStreakInSession }}</dd>
        </div>
        <div class="results-item">
          <dt>Tiempo total</dt>
          <dd>{{ formatDuration(summary.durationMs) }}</dd>
        </div>
      </dl>

      <div v-if="newBadges.length" class="results-badges">
        <h2 class="results-badges-title">¡Nuevas insignias!</h2>
        <ul class="badge-list">
          <li v-for="badge in newBadges" :key="badge.id" class="badge-item pop-in">
            <span class="badge-icon" aria-hidden="true">{{ badge.icon }}</span>
            <span class="badge-name">{{ badge.name }}</span>
          </li>
        </ul>
      </div>

      <div class="results-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('back-to-collection')">
          Mis colecciones
        </button>
        <button type="button" class="btn btn-secondary" @click="$emit('view-ranking')">Ver ranking</button>
        <button type="button" class="btn btn-primary" @click="$emit('repeat')">Repetir sesión</button>
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
  position: relative;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  overflow: visible;
}

.results-score {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.results-score-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.results-score-value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
}

.results-percentage {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.results-xp {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 700;
  color: var(--color-xp);
  font-size: 1.1rem;
}

.results-level-up {
  background: var(--color-xp-bg);
  color: var(--color-xp);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.85rem;
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
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
}

.results-badges-title {
  font-size: 1rem;
  margin: 0 0 var(--space-2);
}

.badge-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.badge-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--color-xp-bg);
  border: 1px solid var(--color-xp);
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.badge-icon {
  font-size: 1.1rem;
}

.results-actions {
  display: flex;
  flex-wrap: wrap;
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
