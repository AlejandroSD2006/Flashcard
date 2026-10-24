<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion.js'

const props = defineProps({
  value: { type: Number, required: true },
  duration: { type: Number, default: 600 },
})

const { prefersReducedMotion } = useReducedMotion()
const displayValue = ref(props.value)
let frameId = null

function animateTo(target) {
  const start = displayValue.value
  const diff = target - start
  if (diff === 0) return

  if (prefersReducedMotion.value) {
    displayValue.value = target
    return
  }

  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = 1 - (1 - progress) * (1 - progress) // ease-out
    displayValue.value = Math.round(start + diff * eased)

    if (progress < 1) {
      frameId = requestAnimationFrame(step)
    }
  }

  frameId = requestAnimationFrame(step)
}

watch(
  () => props.value,
  (newValue) => {
    if (frameId) cancelAnimationFrame(frameId)
    animateTo(newValue)
  },
)

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId)
})
</script>

<template>
  <span>{{ displayValue }}</span>
</template>
