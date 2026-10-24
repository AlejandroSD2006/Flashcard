<script setup>
defineProps({
  activeScreen: { type: String, required: true },
})

const emit = defineEmits(['navigate'])

const ITEMS = [
  { key: 'home', label: 'Inicio', matches: ['home'] },
  { key: 'play', label: 'Jugar', matches: ['study'] },
  { key: 'collection', label: 'Mis colecciones', matches: ['collection'] },
  { key: 'duel', label: 'Duelo 1vs1', matches: ['duel'] },
  { key: 'ranking', label: 'Ranking', matches: ['ranking'] },
  { key: 'profile', label: 'Progreso', matches: ['profile'] },
]
</script>

<template>
  <nav class="app-nav" aria-label="Navegación principal">
    <span class="app-nav-brand">🔎 Flashcards</span>
    <ul class="app-nav-list">
      <li v-for="item in ITEMS" :key="item.key">
        <button
          type="button"
          class="app-nav-link"
          :class="{ 'app-nav-link--active': item.matches.includes(activeScreen) }"
          @click="emit('navigate', item.key)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  flex-wrap: wrap;
}

.app-nav-brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-primary);
  white-space: nowrap;
}

.app-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.app-nav-link {
  border: none;
  background: none;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.app-nav-link:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.app-nav-link--active {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}
</style>
