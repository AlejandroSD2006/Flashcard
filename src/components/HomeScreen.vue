<script setup>
import { usePlayerProfile } from '../composables/usePlayerProfile.js'

const emit = defineEmits(['navigate'])
const { profile, levelInfo } = usePlayerProfile()

const TILES = [
  { key: 'play', icon: '▶️', title: 'Jugar', description: 'Estudia tu colección como un juego de memoria.' },
  { key: 'collection', icon: '🖼️', title: 'Mis colecciones', description: 'Importa fotos y edita tus tarjetas.' },
  { key: 'duel', icon: '⚔️', title: 'Duelo 1vs1', description: 'Compite contra otra persona en el mismo dispositivo.' },
  { key: 'ranking', icon: '🏆', title: 'Ranking', description: 'Consulta las mejores puntuaciones locales.' },
  { key: 'profile', icon: '📈', title: 'Progreso', description: 'Tu nivel, tus récords y tus insignias.' },
]
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1>Flashcards Visuales</h1>
      <p class="home-greeting">
        Hola, {{ profile.playerName }}. Vas por el nivel {{ levelInfo.level }}.
      </p>
    </header>

    <div class="home-grid">
      <button
        v-for="tile in TILES"
        :key="tile.key"
        type="button"
        class="home-tile tag-cut"
        @click="emit('navigate', tile.key)"
      >
        <span class="home-tile-icon" aria-hidden="true">{{ tile.icon }}</span>
        <span class="home-tile-title">{{ tile.title }}</span>
        <span class="home-tile-desc">{{ tile.description }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 920px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.home-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.home-greeting {
  margin: 0;
  color: var(--color-text-muted);
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.home-tile {
  --notch: 18px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  text-align: left;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background: var(--color-surface);
  filter: drop-shadow(0 8px 14px rgba(33, 31, 26, 0.12));
  transition: transform 0.15s ease, filter 0.15s ease;
}

.home-tile:hover,
.home-tile:focus-visible {
  transform: translateY(-3px);
  filter: drop-shadow(0 12px 18px rgba(47, 93, 78, 0.22));
}

.home-tile-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background: var(--color-surface-muted);
  border-radius: 999px;
}

.home-tile-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
}

.home-tile-desc {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
</style>
