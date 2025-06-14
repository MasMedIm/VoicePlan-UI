<template>
  <div class="card image-card">
    <img :src="card.image_url" :alt="card.title || 'image'" class="thumb" />
    <header class="card-header">
      <h3 class="title">{{ card.title }}</h3>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  card: { type: Object, required: true },
});

import { computed } from 'vue';

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
.card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 0 12px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.thumb {
  width: 100%;
  display: block;
  object-fit: cover;
  height: 180px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  margin-top: 8px;
}

.title { font-size: 1rem; font-weight: 600; margin: 0; }
.status { font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; color: #fff; }
.status-todo { background: #737373; }
.status-in-progress { background: #3b82f6; }
.status-done { background: #16a34a; }
.status-generic { background: #52525b; }

.description {
  font-size: 0.875rem;
  color: #555;
  margin: 6px 12px 0;
  white-space: pre-wrap;
}
</style>
