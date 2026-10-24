# Flashcards Visuales

Aplicación web de flashcards basada en fotografías: importa imágenes propias, define la respuesta correcta de cada una y estúdialas como un juego de memoria con hasta tres intentos por tarjeta.

Construida con **Vue 3 (Composition API) + Vite**, 100% en el navegador (sin backend). Las colecciones se guardan en **IndexedDB**, así que persisten entre recargas de la página.

## Instalación y arranque

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev
```

Abre la URL que indique la terminal (por defecto `http://localhost:5173`).

Para generar la build de producción:

```bash
npm run build
npm run preview   # sirve la build generada, opcional
```

Para ejecutar las pruebas unitarias:

```bash
npm test
```

## Cómo se usa

1. **Prepara tu colección.** En la pantalla inicial, arrastra o selecciona imágenes (JPG, JPEG, PNG o WebP). Cada imagen se añade como una tarjeta nueva. Si quieres probar la app sin fotos propias, usa el botón "Cargar tarjetas de ejemplo aleatorias": genera tarjetas con nombre, alternativas, explicación e imagen placeholder (dibujada en un `<canvas>`) listas para estudiar.
2. **Completa cada tarjeta.** Escribe el nombre o respuesta correcta (obligatorio), respuestas alternativas separadas por comas (opcional) y una breve explicación (opcional, recomendada). Puedes reordenar las tarjetas con las flechas o eliminarlas.
3. **Comienza la sesión.** El botón "Comenzar sesión de estudio" comprueba que todas las tarjetas tengan imagen y respuesta antes de arrancar.
4. **Estudia.** Se muestra una fotografía a la vez. Escribe tu respuesta y pulsa "Comprobar respuesta" (o Enter). Tienes 3 intentos por tarjeta:
   - Acierto → mensaje "¡CORRECTO!" y se habilita "Siguiente tarjeta".
   - Fallo con intentos restantes → mensaje de error y puedes volver a intentarlo.
   - Tres fallos → se revela la respuesta correcta y la explicación.
5. **Resultados.** Al terminar todas las tarjetas se muestra un resumen (aciertos al primer intento, aciertos en 2º/3er intento, fallos totales, porcentaje y tiempo total), con opciones para repetir la sesión o volver a editar la colección.

## Estructura del proyecto

```
src/
  components/
    ImageUploader.vue      # Selección y arrastre de imágenes
    FlashcardEditor.vue    # Pantalla de colección: alta, edición, orden y arranque de sesión
    FlashcardStudy.vue     # Pantalla de estudio: imagen, respuesta, intentos
    ProgressBar.vue        # Barra e indicador "Tarjeta X de Y"
    AnswerFeedback.vue     # Mensajes de correcto / incorrecto / fallo
    SessionResults.vue     # Resumen final de la sesión
  composables/
    useFlashcards.js       # Estado de la colección + persistencia en IndexedDB
    useAnswerValidation.js # Lógica de intentos (máx. 3) para una tarjeta
    useStudySession.js     # Progreso y estadísticas de una sesión de estudio
  utils/
    normalizeAnswer.js     # Normalización de texto y comparación de respuestas
    db.js                  # Acceso de bajo nivel a IndexedDB (vía `idb`)
  App.vue                  # Orquesta las pantallas: colección / estudio / resultados
  main.js
  style.css                # Variables de diseño y estilos base compartidos
```

## Validación de respuestas

Antes de comparar, cada respuesta se normaliza (`utils/normalizeAnswer.js`):

- Se recortan los espacios al principio y al final.
- Los espacios repetidos se colapsan en uno.
- Se convierte todo a minúsculas.
- Se eliminan tildes y diacríticos (por ejemplo, "AVIÓN" y "avion" se consideran iguales).

Una respuesta vacía nunca cuenta como intento.

**Tolerancia a erratas (conservadora):** si la respuesta normalizada no coincide exactamente con la correcta ni con ninguna alternativa, se acepta igualmente cuando la distancia de edición (Levenshtein) respecto a una de ellas es de **como máximo 1 carácter**, y solo si esa respuesta válida tiene **4 o más caracteres**. Para respuestas de 3 caracteres o menos se exige coincidencia exacta, para evitar aceptar palabras distintas que casualmente se parecen ("sol" vs "sal").

## Persistencia

Las imágenes (como `Blob`) y los datos de cada tarjeta se guardan en IndexedDB mediante la librería `idb`. Al cargar la aplicación se recuperan todas las tarjetas y se generan URLs de objeto en memoria para mostrarlas; estas URLs nunca se guardan ni se reutilizan entre sesiones, por lo que no hay riesgo de enlaces rotos tras recargar la página.

## Limitaciones conocidas

- No hay backend ni sincronización entre dispositivos: la colección vive solo en el navegador donde se creó (y se pierde si se borran los datos del sitio).
- No se ha implementado una pantalla de "deshacer" al eliminar una tarjeta: la eliminación es inmediata.
- La tolerancia a erratas es intencionadamente conservadora (1 carácter en palabras de 4+ letras); no corrige errores gramaticales o de orden de palabras.
- No se incluyen pruebas automatizadas de los componentes Vue (solo de la lógica de normalización y de intentos); la interfaz se ha verificado mediante compilación y ejecución del servidor de desarrollo.
- No hay exportación/importación de colecciones entre navegadores o copias de seguridad.
