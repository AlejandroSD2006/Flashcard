# Flashcards Visuales

Juego de memoria con fotografías propias, con una capa de gamificación estilo
Duolingo: puntos, racha, nivel/XP, insignias, ranking local y un modo Duelo 1vs1 en el
mismo dispositivo.

Construida con **Vue 3 (Composition API) + Vite**, 100% en el navegador (sin backend).
Las tarjetas e imágenes se guardan en **IndexedDB**; el perfil, el ranking y las
insignias en **localStorage**. Todo persiste entre recargas de la página.

## Instalación y arranque

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev
```

Abre la URL que indique la terminal (por defecto `http://localhost:5173`).

```bash
npm run build      # build de producción
npm run preview    # sirve la build generada, opcional
npm test           # pruebas unitarias
```

## Pantallas

La barra superior (siempre visible) da acceso a:

- **Inicio** — menú principal con accesos directos a cada sección.
- **Jugar** — si tu colección ya tiene tarjetas listas, entra directo a una sesión de
  estudio individual (orden aleatorio cada vez); si no, te lleva a "Mis colecciones".
- **Mis colecciones** — importar/arrastrar imágenes (JPG, JPEG, PNG, WebP), editar
  nombre/alternativas/explicación de cada tarjeta, reordenar, eliminar, generar tarjetas
  de ejemplo aleatorias, y el campo de "nombre de jugador" antes de empezar.
- **Duelo 1vs1** — dos jugadores compiten por turnos en el mismo dispositivo (ver más
  abajo).
- **Ranking** — mejores puntuaciones locales (individual y de duelos), con podio,
  medallas y filtros.
- **Progreso** — tu nivel, XP, récords, racha, insignias y las reglas de puntuación.

## Sesión individual

Se muestra una fotografía; escribes tu respuesta (Enter o "Comprobar respuesta") con
hasta **3 intentos**. Acertar muestra una celebración (más intensa si es al primer
intento, con confeti y un mensaje grande); fallar sacude la tarjeta y avisa de los
intentos restantes, remarcando el último. Tras 3 fallos se revela la respuesta y la
explicación. Al terminar, se guarda tu resultado real en el ranking individual, se suma
XP a tu perfil y se comprueban las insignias nuevas.

### Puntuación

- Acierto al 1er intento: **100 pts** + 20 de bonus.
- Acierto al 2º intento: **70 pts**. Al 3er intento: **40 pts**.
- Fallar los 3 intentos: **0 pts**, y se reinicia tu racha.
- Racha de aciertos consecutivos: multiplicador creciente sobre la base, hasta un tope
  de **x2** a partir de 10 aciertos seguidos (ver `utils/scoring.js`).

Las reglas completas también se muestran en la pantalla "Progreso".

### Progresión

XP por tarjeta (30 al primer intento, 20 en 2º/3º, 5 de participación si falla),
nivel con umbrales crecientes, récord personal, mejor racha, tarjetas resueltas y
aciertos al primer intento — todo calculado a partir de resultados reales, nunca
simulado. Insignias desbloqueables: *Primer paso*, *Ojo de halcón* (5 aciertos al primer
intento en una sesión), *Imparable* (racha de 5), *Perfeccionista* (sesión sin fallos) y
*Coleccionista* (colección de 20 tarjetas).

## Ranking

Local a este navegador (no es una clasificación de Internet, y se indica en la propia
pantalla). Pestañas para el ranking individual y el de duelos, podio con medallas para
el top 3, filtro "mejores puntuaciones" / "todas las partidas", resalta la partida que
acabas de jugar, y un botón para reiniciar el ranking con confirmación previa.

## Duelo 1vs1 local

Dos personas se turnan en el mismo dispositivo con la colección actual:

1. **Configuración**: nombre de ambos jugadores y número de rondas por jugador
   (limitado a la mitad de las tarjetas disponibles, para que a cada jugador le toquen
   fotografías distintas y nadie tenga ventaja).
2. **Turnos alternados**: cada jugador responde su propia fotografía con hasta 3
   intentos, siguiendo las mismas reglas de puntuación que el modo individual (racha y
   bonus independientes por jugador).
3. **Pantalla de privacidad**: al terminar un turno se oculta la respuesta y aparece
   "Pasa el dispositivo a [nombre]" antes de mostrar la siguiente fotografía — no hay
   forma de volver atrás ni de ver respuestas anteriores.
4. **Resultado final**: puntuación y aciertos de cada jugador, ganador (o empate),
   diferencia de puntos, celebración animada, y botones de "Revancha" o "Volver al
   menú". Cada partida se guarda una sola vez en el ranking de duelos.

El Duelo no modifica el perfil individual (XP/nivel/insignias): son dos personas
distintas compartiendo el dispositivo, así que solo alimenta su propio ranking.

## Estructura del proyecto

```
src/
  components/
    ImageUploader.vue, FlashcardEditor.vue, FlashcardStudy.vue,
    ProgressBar.vue, AnswerFeedback.vue, SessionResults.vue   # núcleo del modo individual
    AppNav.vue, HomeScreen.vue                                 # navegación y menú principal
    ScoreHud.vue, AnimatedNumber.vue, CelebrationBurst.vue      # feedback de juego
    RankingView.vue, ProfileStats.vue                           # ranking y progresión
    DuelSetup.vue, DuelPlay.vue, Duel.vue                        # modo Duelo 1vs1
  composables/
    useFlashcards.js        # colección + persistencia en IndexedDB
    useAnswerValidation.js  # intentos (máx. 3) de una tarjeta — reutilizado en Duelo
    useStudySession.js      # progreso, puntuación y estadísticas de una sesión
    useDuelSession.js       # turnos, reparto de cartas y marcador del Duelo
    usePlayerProfile.js     # XP, nivel, récords e insignias (localStorage)
    useLeaderboard.js       # rankings persistidos (individual y duelos)
    useReducedMotion.js     # respeta prefers-reduced-motion
  utils/
    normalizeAnswer.js, scoring.js, xp.js, duel.js, shuffle.js,
    seedData.js, db.js, localStore.js
  data/
    badges.js               # definiciones de insignias
  App.vue, main.js, style.css
```

## Validación de respuestas

Antes de comparar, cada respuesta se normaliza (`utils/normalizeAnswer.js`): se recortan
espacios, se colapsan los repetidos, se ignoran mayúsculas/minúsculas y tildes. Una
respuesta vacía nunca cuenta como intento. Tolerancia conservadora a erratas: se acepta
una distancia de edición de como máximo 1 carácter, solo si la respuesta válida tiene 4
o más caracteres (para evitar aceptar palabras cortas distintas que se parecen, como
"sol" / "sal").

## Persistencia

Imágenes y datos de cada tarjeta en **IndexedDB** (vía `idb`), con URLs de objeto
regeneradas en memoria al cargar (nunca se guardan, así que no hay enlaces rotos tras
recargar). Perfil, ranking individual y ranking de duelos en **localStorage**
(`utils/localStore.js`, con lectura/escritura segura ante errores de almacenamiento).

## Limitaciones conocidas

- Una sola colección local por navegador: el Duelo usa siempre la colección actual, no
  hay selector de varios mazos guardados.
- No hay racha diaria (mecánica opcional que se deja fuera en esta versión).
- No hay backend ni sincronización entre dispositivos; todo vive en el navegador donde
  se creó.
- La tolerancia a erratas es intencionadamente conservadora; no corrige errores
  gramaticales ni de orden de palabras.
- No se incluyen pruebas automatizadas de los componentes Vue (sí de la lógica pura:
  normalización, intentos, puntuación, XP y Duelo); la interfaz se ha verificado
  mediante compilación y ejecución del servidor de desarrollo, sin navegador disponible
  en este entorno para una prueba visual.
- No hay exportación/importación de colecciones o del perfil entre navegadores.
