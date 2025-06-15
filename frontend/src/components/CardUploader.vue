<template>
  <div class="card uploader-card" @click="open">
    <!-- Card header -->
    <header class="card-header">
      <div class="header-left">
        <FileUp class="icon" />
        <h3 class="title">{{ card.title || 'Upload Documents' }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>

    <!-- File input & preview -->
    <div class="content" @click.stop>
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="accepted"
        class="file-input"
        @change="onFilesSelected"
      />
      <button class="select-btn" @click.prevent="triggerFileDialog">
        Select Files
      </button>

      <ul v-if="files.length" class="file-list">
        <li v-for="(f, idx) in files" :key="idx">{{ f.name }}</li>
      </ul>

      <button
        v-if="files.length"
        class="upload-btn"
        :disabled="uploading"
        @click.prevent="upload"
      >
        {{ uploading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>

    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { FileUp } from 'lucide-vue-next';

const props = defineProps({
  card: {
    type: Object,
    required: true,
    // Expected fields: title, description, status, accept (string)
  },
});

// Emits: open (card clicked), upload (files selected & user confirmed)
const emit = defineEmits(['open', 'upload']);

const files = ref([]);
const uploading = ref(false);
const fileInput = ref(null);

const accepted = computed(() => props.card.accept || 'image/*,application/pdf');

function triggerFileDialog() {
  fileInput.value?.click();
}

function onFilesSelected(e) {
  files.value = Array.from(e.target.files || []);
}

async function upload() {
  if (!files.value.length || uploading.value) return;
  uploading.value = true;
  try {
    // Emit files; parent component handles actual upload.
    emit('upload', files.value);
    // After emit, optionally clear list.
    files.value = [];
    fileInput.value.value = '';
  } finally {
    uploading.value = false;
  }
}

function open() {
  emit('open');
}

const statusClass = computed(() => {
  const s = (props.card.status || '').toLowerCase();
  return {
    todo: 'status-todo',
    in_progress: 'status-in-progress',
    done: 'status-done',
  }[s] || 'status-generic';
});
</script>

<style scoped>
.uploader-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: var(--text-color);
}

.status {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  color: #fff;
  flex-shrink: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Status classes (reuse from CardBasic) */
.status-todo { background: #6b7280; }
.status-in-progress { background: #3b82f6; }
.status-done { background: #10b981; }
.status-generic { background: #6b7280; }

.content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-input {
  display: none;
}

.select-btn,
.upload-btn {
  align-self: flex-start;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.select-btn:hover,
.upload-btn:hover {
  background: #2563eb;
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-color);
  max-height: 6rem;
  overflow-y: auto;
}

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
}

/* Dark mode adjustments */
.dark .uploader-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .icon {
  color: #93c5fd;
}

.select-btn,
.upload-btn {
  background: #3b82f6;
}

.dark .select-btn,
.dark .upload-btn {
  background: #2563eb;
}
</style>
