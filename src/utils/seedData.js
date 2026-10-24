// Datos de ejemplo para poder probar la aplicación sin tener que importar
// fotografías propias. Las "fotos" son imágenes generadas en un <canvas>
// (color de fondo + emoji + nombre), no fotografías reales.

import { shuffle } from './shuffle.js'

const SAMPLE_ITEMS = [
  { name: 'Jirafa', alternatives: ['giraffe'], description: 'Es el animal terrestre más alto del mundo.', emoji: '🦒', color: '#fbbf24' },
  { name: 'Elefante', alternatives: ['elefante africano'], description: 'El mamífero terrestre más grande que existe.', emoji: '🐘', color: '#9ca3af' },
  { name: 'Pulpo', alternatives: ['octopus'], description: 'Tiene ocho tentáculos y tres corazones.', emoji: '🐙', color: '#f472b6' },
  { name: 'Tortuga', alternatives: ['tortuga marina'], description: 'Reptil de caparazón duro y vida muy longeva.', emoji: '🐢', color: '#34d399' },
  { name: 'Mariposa', alternatives: ['butterfly'], description: 'Insecto volador con alas de colores vistosos.', emoji: '🦋', color: '#60a5fa' },
  { name: 'Pingüino', alternatives: ['pinguino'], description: 'Ave marina que no vuela y vive en climas fríos.', emoji: '🐧', color: '#38bdf8' },
  { name: 'Camaleón', alternatives: ['camaleon'], description: 'Reptil capaz de cambiar de color para camuflarse.', emoji: '🦎', color: '#4ade80' },
  { name: 'Koala', alternatives: [], description: 'Marsupial australiano que se alimenta de eucalipto.', emoji: '🐨', color: '#a8a29e' },
  { name: 'Manzana', alternatives: ['apple'], description: 'Fruta roja o verde muy habitual en la dieta.', emoji: '🍎', color: '#f87171' },
  { name: 'Plátano', alternatives: ['platano', 'banana'], description: 'Fruta alargada y amarilla rica en potasio.', emoji: '🍌', color: '#fde047' },
  { name: 'Fresa', alternatives: ['strawberry'], description: 'Fruta roja pequeña con semillas en el exterior.', emoji: '🍓', color: '#fb7185' },
  { name: 'Piña', alternatives: ['pina', 'ananá', 'ananas'], description: 'Fruta tropical de piel rugosa y pulpa dulce.', emoji: '🍍', color: '#facc15' },
  { name: 'Uvas', alternatives: ['uva'], description: 'Fruta pequeña que crece en racimos.', emoji: '🍇', color: '#a78bfa' },
  { name: 'Martillo', alternatives: ['hammer'], description: 'Herramienta para golpear clavos u otros objetos.', emoji: '🔨', color: '#78716c' },
  { name: 'Destornillador', alternatives: [], description: 'Herramienta para apretar o aflojar tornillos.', emoji: '🪛', color: '#94a3b8' },
  { name: 'Tijeras', alternatives: ['tijera', 'scissors'], description: 'Herramienta de dos hojas para cortar.', emoji: '✂️', color: '#64748b' },
  { name: 'Llave inglesa', alternatives: ['llave'], description: 'Herramienta para apretar o aflojar tuercas.', emoji: '🔧', color: '#71717a' },
  { name: 'Montaña', alternatives: ['montana'], description: 'Gran elevación natural del terreno.', emoji: '⛰️', color: '#86efac' },
  { name: 'Playa', alternatives: ['beach'], description: 'Zona costera de arena junto al mar.', emoji: '🏖️', color: '#7dd3fc' },
  { name: 'Volcán', alternatives: ['volcan'], description: 'Estructura geológica que puede expulsar lava.', emoji: '🌋', color: '#fca5a5' },
  { name: 'Faro', alternatives: ['lighthouse'], description: 'Torre con luz para guiar a los barcos.', emoji: '🗼', color: '#fdba74' },
  { name: 'Bicicleta', alternatives: ['bici', 'bicycle'], description: 'Vehículo de dos ruedas que se impulsa pedaleando.', emoji: '🚲', color: '#5eead4' },
  { name: 'Paraguas', alternatives: ['umbrella'], description: 'Objeto para protegerse de la lluvia.', emoji: '☂️', color: '#818cf8' },
  { name: 'Cactus', alternatives: [], description: 'Planta que almacena agua y suele tener espinas.', emoji: '🌵', color: '#4ade80' },
  { name: 'Girasol', alternatives: [], description: 'Flor grande y amarilla que gira hacia el sol.', emoji: '🌻', color: '#fde047' },
]

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `card-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Dibuja una imagen placeholder (color + emoji + nombre) y la convierte en Blob PNG. */
function createPlaceholderImageBlob(item) {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 480
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = item.color
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '220px "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  ctx.fillText(item.emoji, canvas.width / 2, canvas.height / 2 - 30)

  ctx.font = 'bold 40px sans-serif'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillText(item.name, canvas.width / 2, canvas.height - 60)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

/**
 * Genera `count` tarjetas de ejemplo aleatorias (sin repetir tema), listas
 * para insertarse en la colección a partir de `startOrder`.
 */
export async function generateRandomCards(count, startOrder = 0) {
  const chosen = shuffle(SAMPLE_ITEMS).slice(0, Math.min(count, SAMPLE_ITEMS.length))

  const cards = await Promise.all(
    chosen.map(async (item, index) => {
      const imageBlob = await createPlaceholderImageBlob(item)
      return {
        id: createId(),
        order: startOrder + index,
        name: item.name,
        alternatives: item.alternatives,
        description: item.description,
        imageBlob,
        imageType: 'image/png',
        fileName: `${item.name.toLowerCase()}.png`,
      }
    }),
  )

  return cards
}
