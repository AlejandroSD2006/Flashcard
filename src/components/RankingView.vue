<script setup>
import { computed, ref } from 'vue'
import { useSoloLeaderboard, useDuelLeaderboard } from '../composables/useLeaderboard.js'

const props = defineProps({
  highlightId: { type: String, default: '' },
})

const soloLeaderboard = useSoloLeaderboard()
const duelLeaderboard = useDuelLeaderboard()

const activeTab = ref('solo') // 'solo' | 'duel'
const filter = ref('top') // 'top' | 'all'
const confirmingReset = ref(false)

const MEDALS = ['🥇', '🥈', '🥉']

const soloSorted = computed(() => {
  if (filter.value === 'top') return [...soloLeaderboard.entries.value].sort((a, b) => b.score - a.score)
  return [...soloLeaderboard.entries.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const duelSorted = computed(() => {
  if (filter.value === 'top') return [...duelLeaderboard.entries.value].sort((a, b) => b.score - a.score)
  return [...duelLeaderboard.entries.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const podium = computed(() => {
  const list = activeTab.value === 'solo' ? soloLeaderboard.entries.value : duelLeaderboard.entries.value
  return [...list].sort((a, b) => b.score - a.score).slice(0, 3)
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function requestReset() {
  confirmingReset.value = true
}

function cancelReset() {
  confirmingReset.value = false
}

function confirmReset() {
  if (activeTab.value === 'solo') soloLeaderboard.reset()
  else duelLeaderboard.reset()
  confirmingReset.value = false
}
</script>

<template>
  <div class="ranking">
    <header class="ranking-header">
      <h1>Clasificación</h1>
      <p class="ranking-disclaimer">
        Ranking local de este navegador: solo guarda tus propias partidas en este dispositivo, no es una
        clasificación global de Internet.
      </p>
    </header>

    <div class="ranking-tabs" role="tablist">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'solo' }"
        role="tab"
        :aria-selected="activeTab === 'solo'"
        @click="activeTab = 'solo'; confirmingReset = false"
      >
        Individual
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'duel' }"
        role="tab"
        :aria-selected="activeTab === 'duel'"
        @click="activeTab = 'duel'; confirmingReset = false"
      >
        Duelos
      </button>
    </div>

    <div v-if="podium.length" class="podium">
      <div v-for="(entry, index) in podium" :key="entry.id" class="podium-spot tag-cut" :class="`podium-spot--${index}`">
        <span class="podium-medal" aria-hidden="true">{{ MEDALS[index] }}</span>
        <span class="podium-name">
          {{ activeTab === 'solo' ? entry.playerName : `${entry.playerA.name} vs ${entry.playerB.name}` }}
        </span>
        <span class="podium-score">{{ entry.score }} pts</span>
      </div>
    </div>

    <div class="ranking-filters">
      <button type="button" class="btn btn-secondary" :class="{ 'btn-filter--active': filter === 'top' }" @click="filter = 'top'">
        Mejores puntuaciones
      </button>
      <button type="button" class="btn btn-secondary" :class="{ 'btn-filter--active': filter === 'all' }" @click="filter = 'all'">
        Todas las partidas
      </button>
    </div>

    <p v-if="activeTab === 'solo' && !soloSorted.length" class="ranking-empty">
      Todavía no hay partidas individuales registradas. ¡Juega una sesión para aparecer aquí!
    </p>
    <p v-else-if="activeTab === 'duel' && !duelSorted.length" class="ranking-empty">
      Todavía no se ha jugado ningún Duelo 1vs1.
    </p>

    <table v-else-if="activeTab === 'solo'" class="ranking-table">
      <thead>
        <tr>
          <th scope="col">Jugador</th>
          <th scope="col">Puntos</th>
          <th scope="col">% acierto</th>
          <th scope="col">1er intento</th>
          <th scope="col">Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in soloSorted" :key="entry.id" :class="{ 'row--highlight': entry.id === highlightId }">
          <td>{{ entry.playerName }}</td>
          <td>{{ entry.score }}</td>
          <td>{{ entry.accuracy }}%</td>
          <td>{{ entry.firstTryCount }}</td>
          <td>{{ formatDate(entry.date) }}</td>
        </tr>
      </tbody>
    </table>

    <table v-else class="ranking-table">
      <thead>
        <tr>
          <th scope="col">Jugador A</th>
          <th scope="col">Jugador B</th>
          <th scope="col">Ganador</th>
          <th scope="col">Puntuación</th>
          <th scope="col">Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in duelSorted" :key="entry.id" :class="{ 'row--highlight': entry.id === highlightId }">
          <td>{{ entry.playerA.name }} ({{ entry.playerA.score }})</td>
          <td>{{ entry.playerB.name }} ({{ entry.playerB.score }})</td>
          <td>
            {{
              entry.winner === 'tie'
                ? 'Empate'
                : entry.winner === 'A'
                  ? entry.playerA.name
                  : entry.playerB.name
            }}
          </td>
          <td>{{ entry.score }}</td>
          <td>{{ formatDate(entry.date) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="ranking-reset">
      <template v-if="!confirmingReset">
        <button type="button" class="btn btn-danger" @click="requestReset">Reiniciar ranking</button>
      </template>
      <template v-else>
        <p class="reset-confirm-text">¿Seguro que quieres borrar este ranking? No se puede deshacer.</p>
        <div class="reset-confirm-actions">
          <button type="button" class="btn btn-secondary" @click="cancelReset">Cancelar</button>
          <button type="button" class="btn btn-danger" @click="confirmReset">Sí, reiniciar</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ranking {
  max-width: 820px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.ranking-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ranking-disclaimer {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.ranking-tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  border: none;
  background: none;
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.tab-btn--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.podium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  align-items: end;
}

.podium-spot {
  --notch: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  padding: var(--space-4) var(--space-2);
  text-align: center;
  filter: drop-shadow(0 8px 12px rgba(33, 31, 26, 0.14));
}

.podium-spot--0 {
  order: 2;
  padding-top: var(--space-6);
  border-color: var(--color-gold);
}

.podium-spot--1 {
  order: 1;
  border-color: var(--color-silver);
}

.podium-spot--2 {
  order: 3;
  border-color: var(--color-bronze);
}

.podium-medal {
  font-family: var(--font-display);
  font-size: 1.8rem;
}

.podium-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.podium-score {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.ranking-filters {
  display: flex;
  gap: var(--space-2);
}

.btn-filter--active {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}

.ranking-empty {
  color: var(--color-text-muted);
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.ranking-table th,
.ranking-table td {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.row--highlight {
  background: var(--color-xp-bg);
  font-weight: 700;
}

.ranking-reset {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.reset-confirm-text {
  margin: 0;
  color: var(--color-error);
  font-size: 0.9rem;
}

.reset-confirm-actions {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 640px) {
  .podium {
    grid-template-columns: 1fr;
  }

  .podium-spot--0,
  .podium-spot--1,
  .podium-spot--2 {
    order: 0;
    padding-top: var(--space-4);
  }

  .ranking-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
