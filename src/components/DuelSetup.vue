<script setup>
import { computed, ref } from 'vue'
import { useFlashcards } from '../composables/useFlashcards.js'
import { maxRoundsForPool } from '../utils/duel.js'

const emit = defineEmits(['start', 'exit'])

const { cards, isCardReady } = useFlashcards()

const readyCards = computed(() =>
  cards.value
    .filter(isCardReady)
    .map((card) => ({ id: card.id, name: card.name.trim(), alternatives: card.alternatives, description: card.description })),
)

const maxRounds = computed(() => maxRoundsForPool(readyCards.value.length))
const canPlay = computed(() => maxRounds.value >= 1)

const nameA = ref('')
const nameB = ref('')
const roundsPerPlayer = ref(5)
const error = ref('')

function clampedRounds() {
  return Math.min(Math.max(1, roundsPerPlayer.value || 1), maxRounds.value)
}

function startDuel() {
  if (!canPlay.value) {
    error.value = 'Necesitas al menos 2 tarjetas listas en tu colección para jugar un duelo.'
    return
  }
  if (!nameA.value.trim() || !nameB.value.trim()) {
    error.value = 'Escribe el nombre de los dos jugadores.'
    return
  }

  error.value = ''
  emit('start', {
    pool: readyCards.value,
    playerNames: { A: nameA.value.trim(), B: nameB.value.trim() },
    roundsPerPlayer: clampedRounds(),
  })
}
</script>

<template>
  <div class="duel-setup">
    <header class="duel-setup-header">
      <h1>Duelo 1vs1</h1>
      <button type="button" class="btn-exit" @click="$emit('exit')">← Salir</button>
    </header>

    <div class="duel-setup-card card-surface">
      <p class="duel-setup-info">
        Dos jugadores se turnan en este mismo dispositivo, usando la colección actual
        ({{ readyCards.length }} tarjeta(s) lista(s)). Cada uno responde a fotografías distintas, para que
        nadie tenga ventaja.
      </p>

      <p v-if="!canPlay" class="duel-setup-error" role="alert">
        Necesitas al menos 2 tarjetas listas (con imagen y respuesta) en "Mis colecciones" para poder jugar
        un duelo.
      </p>

      <template v-else>
        <div class="duel-setup-fields">
          <label class="field">
            <span class="field-label">Nombre del jugador 1</span>
            <input v-model="nameA" type="text" placeholder="Ej. Ana" />
          </label>
          <label class="field">
            <span class="field-label">Nombre del jugador 2</span>
            <input v-model="nameB" type="text" placeholder="Ej. Beto" />
          </label>
          <label class="field">
            <span class="field-label">Rondas por jugador (máximo {{ maxRounds }})</span>
            <input v-model.number="roundsPerPlayer" type="number" min="1" :max="maxRounds" />
          </label>
        </div>

        <p v-if="error" class="duel-setup-error" role="alert">{{ error }}</p>

        <div class="duel-setup-actions">
          <button type="button" class="btn btn-primary btn-start" @click="startDuel">¡Empezar duelo!</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.duel-setup {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.duel-setup-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
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

.duel-setup-card {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.duel-setup-info {
  margin: 0;
  color: var(--color-text-muted);
}

.duel-setup-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.field input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
}

.duel-setup-error {
  color: var(--color-error);
  margin: 0;
  font-size: 0.9rem;
}

.duel-setup-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-start {
  padding: 0.75rem 1.75rem;
}
</style>
