import { ref, shallowRef } from 'vue'
import { getAllCards, putCard, putCards, deleteCard as deleteCardFromDb, clearAllCards } from '../utils/db.js'
import { generateRandomCards } from '../utils/seedData.js'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB por imagen, margen generoso

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `card-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function validateFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `"${file.name}" no es un formato admitido (usa JPG, PNG o WebP).`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" supera el tamaño máximo permitido (15 MB).`
  }
  return null
}

// Estado compartido entre todos los componentes que usen el composable.
const cards = ref([])
// URLs de objeto creadas en memoria a partir de los Blobs, indexadas por id de tarjeta.
const imageUrls = shallowRef({})
const isLoaded = ref(false)
const loadError = ref('')
let loadingStarted = false

function setImageUrl(id, blob) {
  if (imageUrls.value[id]) {
    URL.revokeObjectURL(imageUrls.value[id])
  }
  imageUrls.value = { ...imageUrls.value, [id]: URL.createObjectURL(blob) }
}

function revokeImageUrl(id) {
  if (imageUrls.value[id]) {
    URL.revokeObjectURL(imageUrls.value[id])
    const next = { ...imageUrls.value }
    delete next[id]
    imageUrls.value = next
  }
}

async function loadCards() {
  try {
    const stored = await getAllCards()
    cards.value = stored
    stored.forEach((card) => setImageUrl(card.id, card.imageBlob))
    isLoaded.value = true
  } catch (error) {
    loadError.value = 'No se pudieron cargar las tarjetas guardadas. Comprueba el almacenamiento del navegador.'
    isLoaded.value = true
  }
}

/**
 * Añade una o varias imágenes a la colección como tarjetas nuevas (sin nombre
 * todavía). Devuelve los errores de validación encontrados, si los hay.
 */
async function addImages(fileList) {
  const files = Array.from(fileList)
  const errors = []
  const newCards = []

  let nextOrder = cards.value.length

  for (const file of files) {
    const error = validateFile(file)
    if (error) {
      errors.push(error)
      continue
    }

    const card = {
      id: createId(),
      order: nextOrder,
      name: '',
      alternatives: [],
      description: '',
      imageBlob: file,
      imageType: file.type,
      fileName: file.name,
    }
    nextOrder += 1
    newCards.push(card)
  }

  for (const card of newCards) {
    await putCard(card)
    setImageUrl(card.id, card.imageBlob)
  }

  if (newCards.length) {
    cards.value = [...cards.value, ...newCards]
  }

  return errors
}

async function updateCard(id, patch) {
  const index = cards.value.findIndex((card) => card.id === id)
  if (index === -1) return

  const updated = { ...cards.value[index], ...patch }
  cards.value = cards.value.map((card) => (card.id === id ? updated : card))
  await putCard(updated)
}

async function removeCard(id) {
  await deleteCardFromDb(id)
  revokeImageUrl(id)
  const remaining = cards.value
    .filter((card) => card.id !== id)
    .map((card, index) => ({ ...card, order: index }))
  cards.value = remaining
  await Promise.all(remaining.map((card) => putCard(card)))
}

/** Mueve una tarjeta de una posición a otra y persiste el nuevo orden. */
async function reorderCards(fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= cards.value.length ||
    toIndex >= cards.value.length
  ) {
    return
  }

  const next = [...cards.value]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)

  const reindexed = next.map((card, index) => ({ ...card, order: index }))
  cards.value = reindexed
  await Promise.all(reindexed.map((card) => putCard(card)))
}

/**
 * Añade tarjetas de ejemplo con datos e imágenes generadas aleatoriamente
 * (útil para probar la aplicación sin tener fotografías propias a mano).
 */
async function seedRandomCards(count = 8) {
  const newCards = await generateRandomCards(count, cards.value.length)
  if (!newCards.length) return 0

  await putCards(newCards)
  newCards.forEach((card) => setImageUrl(card.id, card.imageBlob))
  cards.value = [...cards.value, ...newCards]
  return newCards.length
}

async function clearCollection() {
  await clearAllCards()
  Object.keys(imageUrls.value).forEach(revokeImageUrl)
  cards.value = []
}

/** Una tarjeta es válida para estudiar si tiene imagen y nombre no vacío. */
function isCardReady(card) {
  return Boolean(card.imageBlob) && card.name.trim().length > 0
}

export function useFlashcards() {
  if (!loadingStarted) {
    loadingStarted = true
    loadCards()
  }

  return {
    cards,
    imageUrls,
    isLoaded,
    loadError,
    addImages,
    updateCard,
    removeCard,
    reorderCards,
    seedRandomCards,
    clearCollection,
    isCardReady,
    acceptedTypes: ACCEPTED_TYPES,
  }
}
