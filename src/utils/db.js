import { openDB } from 'idb'

const DB_NAME = 'flashcards-visuales-db'
const DB_VERSION = 1
const STORE_NAME = 'cards'

let dbPromise = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('order', 'order')
        }
      },
    })
  }
  return dbPromise
}

/** Devuelve todas las tarjetas guardadas, ordenadas por su campo `order`. */
export async function getAllCards() {
  const db = await getDb()
  const cards = await db.getAll(STORE_NAME)
  return cards.sort((a, b) => a.order - b.order)
}

/** Guarda (crea o reemplaza) una tarjeta completa, incluyendo el Blob de la imagen. */
export async function putCard(card) {
  const db = await getDb()
  await db.put(STORE_NAME, card)
}

/** Guarda varias tarjetas en una sola transacción. */
export async function putCards(cards) {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await Promise.all(cards.map((card) => tx.store.put(card)))
  await tx.done
}

/** Elimina una tarjeta por id. */
export async function deleteCard(id) {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}

/** Elimina todas las tarjetas. */
export async function clearAllCards() {
  const db = await getDb()
  await db.clear(STORE_NAME)
}
