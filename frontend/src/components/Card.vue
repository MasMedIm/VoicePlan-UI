<template>
  <div class="card">
    <header class="card-header">
      <h3 class="title">{{ card.title }}</h3>
      <span class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    <p class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
// Simple presentational component for a planning card.
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
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px 14px;
  background: #fff;
  max-width: 300px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.card + .card {
  margin-top: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.status {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}

.status-todo {
  background: #737373;
}
.status-in-progress {
  background: #3b82f6;
}
.status-done {
  background: #16a34a;
}
.status-generic {
  background: #52525b;
}

.description {
  font-size: 0.875rem;
  color: #555;
  margin: 0;
  white-space: pre-wrap;
}
</style>
