<script setup>
import { computed, ref } from 'vue'
import { useFlashcards } from '../composables/useFlashcards.js'
import ImageUploader from './ImageUploader.vue'

const emit = defineEmits(['start-session'])

const {
  cards,
  imageUrls,
  isLoaded,
  loadError,
  updateCard,
  removeCard,
  reorderCards,
  seedRandomCards,
  isCardReady,
} = useFlashcards()

const startError = ref('')
const isSeeding = ref(false)
const seedMessage = ref('')

const readyCount = computed(() => cards.value.filter(isCardReady).length)
const hasCards = computed(() => cards.value.length > 0)

function alternativesToText(alternatives) {
  return (alternatives || []).join(', ')
}

function onNameInput(card, event) {
  updateCard(card.id, { name: event.target.value })
  startError.value = ''
}

function onAlternativesInput(card, event) {
  const alternatives = event.target.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  updateCard(card.id, { alternatives })
}

function onDescriptionInput(card, event) {
  updateCard(card.id, { description: event.target.value })
}

function moveUp(index) {
  if (index === 0) return
  reorderCards(index, index - 1)
}

function moveDown(index) {
  if (index === cards.value.length - 1) return
  reorderCards(index, index + 1)
}

async function onDelete(card) {
  await removeCard(card.id)
}

async function onSeedRandomCards() {
  isSeeding.value = true
  seedMessage.value = ''
  try {
    const added = await seedRandomCards(8)
    seedMessage.value = added
      ? `Se han añadido ${added} tarjetas de ejemplo con imágenes generadas automáticamente.`
      : 'No se pudieron generar tarjetas de ejemplo.'
  } finally {
    isSeeding.value = false
  }
}

function startSession() {
  if (!cards.value.length) {
    startError.value = 'Añade al menos una fotografía antes de empezar.'
    return
  }

  const notReady = cards.value.filter((card) => !isCardReady(card))
  if (notReady.length) {
    startError.value = `Faltan datos en ${notReady.length} tarjeta(s): asegúrate de que cada fotografía tenga una respuesta correcta escrita.`
    return
  }

  startError.value = ''
  const sessionCards = cards.value.map((card) => ({
    id: card.id,
    name: card.name.trim(),
    alternatives: card.alternatives,
    description: card.description,
  }))
  emit('start-session', sessionCards)
}
</script>

<template>
  <div class="editor">
    <header class="editor-header">
      <h1>Flashcards Visuales</h1>
      <p class="editor-subtitle">Convierte tus fotografías en un juego de memoria para estudiar.</p>
    </header>

    <p v-if="!isLoaded" class="editor-status">Cargando tu colección guardada…</p>
    <p v-else-if="loadError" class="editor-status editor-status--error" role="alert">{{ loadError }}</p>

    <template v-else>
      <section v-if="!hasCards" class="intro card-surface">
        <h2>Crea tu primera colección</h2>
        <p>
          Importa fotografías de objetos, lugares, animales, plantas o cualquier cosa que quieras
          memorizar. Para cada imagen escribirás el nombre correcto y, si quieres, una breve
          explicación. Después podrás estudiarlas como un juego: se te mostrará la foto y deberás
          escribir qué es, con hasta tres intentos por tarjeta.
        </p>
        <ImageUploader />

        <div class="seed-area">
          <p class="seed-hint">¿No tienes fotos a mano? Prueba la app con tarjetas de ejemplo.</p>
          <button type="button" class="btn btn-secondary" :disabled="isSeeding" @click="onSeedRandomCards">
            {{ isSeeding ? 'Generando…' : 'Cargar tarjetas de ejemplo aleatorias' }}
          </button>
          <p v-if="seedMessage" class="seed-message" role="status">{{ seedMessage }}</p>
        </div>
      </section>

      <section v-else class="collection">
        <div class="collection-toolbar">
          <ImageUploader />
          <div class="seed-area">
            <button type="button" class="btn btn-secondary" :disabled="isSeeding" @click="onSeedRandomCards">
              {{ isSeeding ? 'Generando…' : 'Añadir más tarjetas de ejemplo' }}
            </button>
            <p v-if="seedMessage" class="seed-message" role="status">{{ seedMessage }}</p>
          </div>
        </div>

        <div class="collection-summary">
          <span class="collection-count">{{ cards.length }} tarjeta(s) · {{ readyCount }} lista(s) para estudiar</span>
        </div>

        <ul class="card-list">
          <li v-for="(card, index) in cards" :key="card.id" class="card-item card-surface">
            <img
              v-if="imageUrls[card.id]"
              :src="imageUrls[card.id]"
              :alt="card.name ? `Fotografía de ${card.name}` : 'Fotografía sin nombre asignado'"
              class="card-thumb"
            />

            <div class="card-fields">
              <label class="field">
                <span class="field-label">Nombre o respuesta correcta *</span>
                <input
                  type="text"
                  :value="card.name"
                  placeholder="Ej. Jirafa"
                  @input="onNameInput(card, $event)"
                />
              </label>

              <label class="field">
                <span class="field-label">Respuestas alternativas (opcional, separadas por comas)</span>
                <input
                  type="text"
                  :value="alternativesToText(card.alternatives)"
                  placeholder="Ej. girafa, giraffe"
                  @input="onAlternativesInput(card, $event)"
                />
              </label>

              <label class="field">
                <span class="field-label">Breve explicación (opcional)</span>
                <textarea
                  rows="2"
                  :value="card.description"
                  placeholder="Un dato curioso o una pista adicional"
                  @input="onDescriptionInput(card, $event)"
                ></textarea>
              </label>
            </div>

            <div class="card-actions">
              <button
                type="button"
                class="btn btn-secondary btn-icon"
                :disabled="index === 0"
                aria-label="Mover tarjeta hacia arriba"
                @click="moveUp(index)"
              >
                ↑
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-icon"
                :disabled="index === cards.length - 1"
                aria-label="Mover tarjeta hacia abajo"
                @click="moveDown(index)"
              >
                ↓
              </button>
              <button type="button" class="btn btn-danger" @click="onDelete(card)">Eliminar</button>
            </div>
          </li>
        </ul>

        <div class="start-area">
          <p v-if="startError" class="start-error" role="alert">{{ startError }}</p>
          <button type="button" class="btn btn-primary btn-start" @click="startSession">
            Comenzar sesión de estudio
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.editor {
  max-width: 920px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.editor-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.editor-subtitle {
  margin: 0;
  color: var(--color-text-muted);
}

.editor-status {
  color: var(--color-text-muted);
}

.editor-status--error {
  color: var(--color-error);
}

.intro {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.intro p {
  color: var(--color-text-muted);
  margin: 0;
}

.collection {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.collection-toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.seed-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.seed-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.seed-message {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-success);
}

.collection-summary {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.card-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-item {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: var(--space-4);
  padding: var(--space-4);
  align-items: start;
}

.card-thumb {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}

.card-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.field input,
.field textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  resize: vertical;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.start-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.start-error {
  color: var(--color-error);
  font-size: 0.9rem;
  margin: 0;
}

.btn-start {
  align-self: flex-end;
  padding: 0.75rem 1.75rem;
}

@media (max-width: 640px) {
  .card-item {
    grid-template-columns: 1fr;
  }

  .card-thumb {
    width: 100%;
    height: 180px;
  }

  .card-actions {
    flex-direction: row;
  }

  .start-area {
    align-items: stretch;
  }

  .btn-start {
    align-self: stretch;
  }
}
</style>
