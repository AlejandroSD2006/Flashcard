<script setup>
import { shallowRef } from 'vue'
import DuelSetup from './DuelSetup.vue'
import DuelPlay from './DuelPlay.vue'
import { useDuelSession } from '../composables/useDuelSession.js'

const emit = defineEmits(['exit'])

// shallowRef: el objeto que devuelve useDuelSession ya contiene sus propios refs
// internos; envolverlo en un ref() normal los desenvolvería de forma incorrecta.
const duel = shallowRef(null)

function handleStart(config) {
  duel.value = useDuelSession(config)
}

function handleExit() {
  duel.value = null
  emit('exit')
}
</script>

<template>
  <DuelSetup v-if="!duel" @start="handleStart" @exit="emit('exit')" />
  <DuelPlay v-else :duel="duel" @exit="handleExit" />
</template>
