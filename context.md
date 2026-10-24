# Proyecto: Flashcards visuales interactivas

Quiero que desarrolles una aplicación web funcional de flashcards visuales utilizando **Vue 3 + Vite**, con JavaScript y Composition API. El objetivo es que el usuario pueda importar fotografías desde su ordenador y utilizarlas para estudiar o memorizar objetos, conceptos, lugares, animales, plantas, herramientas o cualquier otra cosa que aparezca en las imágenes.

No quiero únicamente una maqueta visual. Quiero una aplicación funcional, con una interfaz cuidada, una buena experiencia de usuario y toda la lógica implementada.

## 1. Concepto principal

La aplicación funciona como un juego de memoria basado en imágenes.

El usuario importa una colección de fotografías. La aplicación muestra una fotografía cada vez y el usuario debe escribir qué aparece en ella para poder avanzar a la siguiente.

Cada fotografía tiene asociada una respuesta correcta y una breve explicación.

El funcionamiento debe ser el siguiente:

1. El usuario importa una o varias imágenes desde su ordenador.
2. Antes de empezar, debe poder indicar el nombre o la respuesta correcta de cada imagen y escribir una breve descripción.
3. Cuando empieza la sesión, aparece la primera fotografía, sin revelar su nombre ni su explicación.
4. Debajo de la imagen aparece un campo de texto donde el usuario escribe su respuesta.
5. Al pulsar Enter o el botón de comprobar, la aplicación evalúa la respuesta.
6. Si la respuesta es correcta, aparece un mensaje destacado de «¡CORRECTO!».
7. Si la respuesta es incorrecta, aparece un mensaje de «Incorrecto, inténtalo de nuevo» y se permite otro intento.
8. El usuario dispone de un máximo de tres intentos por fotografía.
9. Si acierta, puede avanzar a la siguiente fotografía mediante un botón.
10. Si falla los tres intentos, se revela la respuesta correcta junto con su explicación.
11. Después de acertar o agotar los intentos, aparece un botón para continuar a la siguiente tarjeta.
12. Al terminar todas las fotografías, se muestra una pantalla de resultados de la sesión.

**Regla fundamental:** no se puede pasar a la siguiente fotografía hasta haber acertado la respuesta o haber agotado los tres intentos. No debe existir ninguna opción para saltarse una tarjeta durante la sesión normal.

## 2. Importación y gestión de fotografías

Crea una pantalla inicial desde la que el usuario pueda preparar su colección de flashcards.

Debe incluir:

- Un botón para seleccionar varias imágenes desde el explorador de archivos.
- Una zona de arrastrar y soltar imágenes.
- Una vista previa en miniatura de todas las imágenes importadas.
- La posibilidad de eliminar imágenes de la colección.
- La posibilidad de cambiar el orden de las tarjetas.
- Un formulario para editar cada tarjeta con estos campos:
  - Imagen.
  - Nombre o respuesta correcta.
  - Respuestas alternativas aceptadas, opcionales.
  - Breve explicación.
- Un indicador del número de tarjetas preparadas.
- Un botón para comenzar la sesión.

Acepta formatos habituales como JPG, JPEG, PNG y WebP. Valida los archivos y muestra mensajes de error comprensibles si un archivo no es válido.

No es necesario utilizar un backend para la primera versión. Todo debe funcionar en el navegador.

## 3. Sistema de comprobación de respuestas

Implementa un sistema de validación razonable para las respuestas escritas.

Requisitos:

- Ignorar mayúsculas y minúsculas.
- Ignorar espacios sobrantes al principio y al final.
- Normalizar espacios repetidos.
- Permitir respuestas alternativas que el usuario haya definido previamente.
- Tratar correctamente las tildes y los caracteres acentuados para evitar errores por diferencias ortográficas menores.
- Evitar que una respuesta vacía cuente como intento.
- Mostrar claramente los intentos restantes.
- Deshabilitar el campo de respuesta y el botón de comprobación cuando la tarjeta ya se haya resuelto.
- Impedir que una tarjeta permita más de tres intentos.

La validación debe ser determinista y local, sin necesidad de una API de inteligencia artificial.

No utilices coincidencias excesivamente permisivas que permitan aceptar respuestas claramente equivocadas. Si implementas tolerancia a pequeños errores tipográficos, hazlo de forma conservadora y documenta cómo funciona.

## 4. Interfaz durante el estudio

Esta es la pantalla más importante de la aplicación.

Quiero una interfaz moderna, minimalista y centrada en la fotografía.

Debe contener:

- Nombre de la aplicación.
- Indicador de progreso, por ejemplo: «Tarjeta 3 de 15».
- Barra de progreso de la sesión.
- Fotografía central grande, con buena resolución y sin deformarse.
- Campo de texto para escribir la respuesta.
- Botón «Comprobar respuesta».
- Indicador de intentos restantes, por ejemplo: «Te quedan 2 intentos».
- Zona de mensajes para mostrar el resultado.
- Botón «Siguiente tarjeta», que solo aparece o se habilita cuando la tarjeta se ha resuelto.

Estados visuales:

**Estado inicial:** imagen visible, campo vacío y tres intentos disponibles.

**Respuesta incorrecta:** mensaje de error visible, intento actualizado y posibilidad de volver a responder.

**Respuesta correcta:** mensaje destacado «¡CORRECTO!», confirmación visual positiva y acceso a la siguiente tarjeta.

**Tres fallos:** mensaje que indique que se han agotado los intentos, revelación del nombre correcto y explicación de la imagen.

**Tarjeta resuelta:** no se pueden enviar más respuestas y se puede continuar.

**Fin de sesión:** resumen de resultados y opciones para repetir la sesión o volver al menú.

Los mensajes de éxito y error deben ser accesibles y comprensibles sin depender únicamente del color.

## 5. Resultados y estadísticas

Al finalizar una sesión, muestra una pantalla de resumen con:

- Número total de tarjetas.
- Número de tarjetas acertadas al primer intento.
- Número de tarjetas acertadas al segundo o tercer intento.
- Número de tarjetas que se fallaron completamente.
- Porcentaje de aciertos.
- Tiempo total de la sesión, si resulta sencillo implementarlo.
- Botón para repetir la sesión.
- Botón para volver a la colección y editar las tarjetas.

Las estadísticas deben calcularse a partir de los resultados reales de la sesión, no ser valores simulados.

## 6. Diseño visual

Quiero una estética moderna, limpia y agradable, similar a una aplicación educativa bien diseñada.

Utiliza estos principios:

- Vue 3 con Composition API.
- Vite como herramienta de desarrollo.
- Diseño responsive para escritorio, tablet y móvil.
- Fondo neutro y una paleta de colores coherente.
- Tarjetas con bordes redondeados y sombras sutiles.
- Tipografía moderna y legible.
- Espaciado generoso.
- Transiciones discretas entre fotografías.
- Animaciones pequeñas para los mensajes de éxito y error, sin excesos.
- Botones claros y con estados hover, focus y disabled.
- Buena accesibilidad mediante etiquetas, navegación por teclado y contraste suficiente.

Evita una apariencia genérica o recargada. La fotografía debe ser siempre el elemento visual principal.

Puedes utilizar CSS moderno y una librería de iconos ligera si aporta valor. No añadas dependencias innecesarias.

## 7. Arquitectura técnica

Organiza el proyecto de forma modular y mantenible.

Utiliza Vue 3, Vite y JavaScript.

Propón una estructura similar a esta, adaptándola si es necesario:

src/
  components/
    ImageUploader.vue
    FlashcardEditor.vue
    FlashcardStudy.vue
    ProgressBar.vue
    AnswerFeedback.vue
    SessionResults.vue
  composables/
    useFlashcards.js
    useAnswerValidation.js
    useStudySession.js
  utils/
    normalizeAnswer.js
  App.vue
  main.js
  style.css

Puedes utilizar Vue Router si realmente aporta valor, pero no es obligatorio para una aplicación de este tamaño.

Separa la lógica de negocio de los componentes visuales. Utiliza una gestión de estado reactiva adecuada y evita duplicar lógica.

## 8. Persistencia de datos

Quiero que las tarjetas creadas puedan seguir disponibles después de recargar la página.

Implementa una solución local para esta primera versión, sin backend ni registro de usuarios.

Puedes utilizar IndexedDB para almacenar las imágenes y los datos de las tarjetas, ya que es más apropiado que guardar fotografías grandes directamente en localStorage.

La aplicación debe permitir:

- Crear y editar tarjetas.
- Guardar las colecciones localmente.
- Recuperar las colecciones al volver a abrir la aplicación.
- Eliminar tarjetas.
- Mantener los datos de forma consistente.

Si el usuario elimina una imagen, gestiona también correctamente los datos asociados.

No dependas de rutas temporales de archivos locales ni de objetos URL que dejen de ser válidos después de recargar la página.

## 9. Experiencia de usuario

Incluye una pantalla inicial con dos situaciones:

- Si todavía no hay tarjetas, explica brevemente cómo crear la primera colección.
- Si ya existen tarjetas guardadas, permite retomarlas o editarlas.

Antes de comenzar una sesión, comprueba que todas las tarjetas tengan una respuesta correcta y una imagen válida. La explicación puede ser opcional, pero recomiendo que se anime al usuario a incluirla.

Si solo hay una tarjeta, la sesión debe funcionar correctamente.

Controla los estados vacíos, errores de importación y posibles problemas de almacenamiento.

Evita que el usuario pueda iniciar una sesión con una colección vacía o avanzar por estados inválidos.

## 10. Requisitos de calidad

- El proyecto debe arrancar correctamente con `npm install` y `npm run dev`.
- Incluye un `README.md` con instrucciones de instalación y uso.
- Añade comentarios donde la lógica no sea evidente.
- Evita código duplicado y componentes excesivamente grandes.
- No dejes botones sin funcionalidad.
- No utilices datos ficticios para simular las funcionalidades principales.
- Comprueba los casos límite: colección vacía, una sola tarjeta, respuesta vacía, tres respuestas incorrectas, respuestas alternativas, edición de tarjetas y recarga de la aplicación.
- Si es viable, añade pruebas para la normalización de respuestas y la lógica de intentos.

## 11. Forma de trabajar

Antes de empezar, inspecciona el directorio de trabajo y comprueba si ya existe un proyecto. Si existe, analiza su estructura y reutiliza lo que tenga sentido. No sobrescribas archivos existentes sin necesidad.

Después, implementa la aplicación completa. No te limites a darme instrucciones o a mostrarme fragmentos de código: trabaja directamente sobre los archivos del proyecto.

Cuando termines:

1. Comprueba que las dependencias y el proyecto están correctamente configurados.
2. Ejecuta la compilación de producción con `npm run build`.
3. Corrige los errores que encuentres.
4. Si has añadido pruebas, ejecútalas.
5. Indícame qué archivos y funcionalidades has implementado.
6. Explícame cómo arrancar la aplicación localmente.
7. Enumera las limitaciones que todavía existan.

Prioriza una primera versión completamente funcional, sencilla de utilizar y fácil de ampliar en el futuro.