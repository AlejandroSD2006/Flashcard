<script setup>
import AnimatedNumber from './AnimatedNumber.vue'

defineProps({
  score: { type: Number, required: true },
  streak: { type: Number, default: 0 },
  label: { type: String, default: 'Puntos' },
})
</script>

<template>
  <div class="score-hud">
    <div class="score-points">
      <span class="score-label">{{ label }}</span>
      <span class="score-value"><AnimatedNumber :value="score" /></span>
    </div>
    <div v-if="streak > 0" class="score-streak pop-in" :key="streak">
      <span aria-hidden="true">🔥</span>
      Racha de {{ streak }}
    </div>
  </div>
</template>

<style scoped>
.score-hud {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.score-points {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.score-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.score-value {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-primary);
}

.score-streak {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--color-xp-bg);
  color: var(--color-streak);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #f0dcb8;
}
</style>
