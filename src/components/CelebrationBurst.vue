<script setup>
import { ref, watch } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion.js'

const props = defineProps({
  active: { type: Boolean, default: false },
  // 'big' para un acierto al primer intento, 'normal' para 2º/3º intento.
  intensity: { type: String, default: 'normal' },
})

const BIG_MESSAGES = ['¡PERFECTO!', '¡BRUTAL!', '¡IMPARABLE!']
const NORMAL_MESSAGES = ['¡ACERTASTE!', '¡BIEN HECHO!', '¡ESO ES!']
const COLORS = ['#4f46e5', '#f59e0b', '#16a34a', '#fb7185', '#38bdf8']

const { prefersReducedMotion } = useReducedMotion()
const visible = ref(false)
const message = ref('')
const particles = ref([])
let hideTimer = null

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function burst() {
  const isBig = props.intensity === 'big'
  message.value = randomFrom(isBig ? BIG_MESSAGES : NORMAL_MESSAGES)

  if (!prefersReducedMotion.value) {
    const count = isBig ? 26 : 14
    particles.value = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      rotate: Math.random() * 360,
      color: randomFrom(COLORS),
    }))
  } else {
    particles.value = []
  }

  visible.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, prefersReducedMotion.value ? 900 : 1100)
}

watch(() => props.active, (isActive) => {
  if (isActive) burst()
})
</script>

<template>
  <div v-if="visible" class="celebration" aria-hidden="true">
    <span
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: particle.left + '%',
        animationDelay: particle.delay + 's',
        backgroundColor: particle.color,
        transform: `rotate(${particle.rotate}deg)`,
      }"
    ></span>
    <p class="celebration-message" :class="{ 'celebration-message--big': intensity === 'big' }">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.celebration {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}

.particle {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  opacity: 0.9;
  animation: confetti-fall 0.9s ease-in forwards;
}

@media (prefers-reduced-motion: reduce) {
  .particle {
    display: none;
  }
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(160px) rotate(260deg);
    opacity: 0;
  }
}

.celebration-message {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  background: var(--color-surface);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  animation: pop-in 0.25s ease;
}

.celebration-message--big {
  font-size: 1.9rem;
  color: var(--color-success);
}

@media (prefers-reduced-motion: reduce) {
  .celebration-message {
    animation: none;
  }
}
</style>
