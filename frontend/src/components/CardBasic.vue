<template>
  <div class="card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <Book class="icon" />
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
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

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  color: var(--text-color);
}

.card-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 0.375rem;
  min-width: 0;
}

.icon { 
  width: 1rem; 
  height: 1rem; 
  color: #3b82f6; 
  flex-shrink: 0; 
}

.title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.status {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  color: #fff;
  flex-shrink: 0;
  font-weight: 500;
}

.status-todo { background: #737373; }
.status-in-progress { background: #3b82f6; }
.status-done { background: #16a34a; }
.status-generic { background: #52525b; }

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.3;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Responsive adjustments for different mosaic sizes */
.mosaic-item-tiny .card {
  padding: 0.5rem;
}

.mosaic-item-tiny .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .description {
  font-size: 0.625rem;
  -webkit-line-clamp: 2;
}

.mosaic-item-large .card,
.mosaic-item-xl .card {
  padding: 1rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.875rem;
  -webkit-line-clamp: 4;
}
</style>
