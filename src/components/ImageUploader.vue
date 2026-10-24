<script setup>
import { ref } from 'vue'
import { useFlashcards } from '../composables/useFlashcards.js'

const { addImages } = useFlashcards()

const isDragging = ref(false)
const errors = ref([])
const fileInput = ref(null)

async function handleFiles(fileList) {
  if (!fileList || !fileList.length) return
  errors.value = await addImages(fileList)
}

function onInputChange(event) {
  handleFiles(event.target.files)
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  handleFiles(event.dataTransfer.files)
}

function openFileDialog() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="uploader">
    <div
      class="dropzone"
      :class="{ 'dropzone--active': isDragging }"
      role="button"
      tabindex="0"
      aria-label="Arrastra imágenes aquí o pulsa para seleccionarlas"
      @click="openFileDialog"
      @keydown.enter="openFileDialog"
      @keydown.space.prevent="openFileDialog"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true" class="dropzone-icon">
        <path
          fill="currentColor"
          d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 1 1 0 1 1 2 0 5 5 0 0 1-5 5H9a5 5 0 0 1-5-5 1 1 0 0 1 1-1Z"
        />
      </svg>
      <p class="dropzone-text">
        <strong>Arrastra tus fotografías aquí</strong>
        <span>o haz clic para seleccionarlas desde tu ordenador</span>
      </p>
      <p class="dropzone-hint">Formatos admitidos: JPG, JPEG, PNG, WebP</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="visually-hidden"
        @change="onInputChange"
      />
    </div>

    <ul v-if="errors.length" class="uploader-errors" role="alert">
      <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.dropzone:hover,
.dropzone--active {
  border-color: var(--color-primary);
  background: var(--color-surface-muted);
}

.dropzone-icon {
  color: var(--color-primary);
}

.dropzone-text {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dropzone-text span {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.dropzone-hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.uploader-errors {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-bg);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  list-style: disc;
}
</style>
