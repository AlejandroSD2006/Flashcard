<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>

<template>
  <div class="progress" role="group" aria-label="Progreso de la sesión">
    <p class="progress-label">Tarjeta {{ current }} de {{ total }}</p>
    <div
      class="progress-track"
      role="progressbar"
      :aria-valuenow="current"
      :aria-valuemin="0"
      :aria-valuemax="total"
    >
      <div
        class="progress-fill"
        :style="{ width: total ? `${(current / total) * 100}%` : '0%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.progress-label {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.progress-track {
  height: 10px;
  border-radius: 999px;
  background: var(--color-surface-muted);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}
</style>
