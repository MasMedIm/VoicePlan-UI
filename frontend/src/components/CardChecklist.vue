<template>
  <div class="card checklist-card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <polyline points="9 11 12 14 22 4" />
        </svg>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="progressText" class="progress">{{ progressText }}</span>
    </header>

    <ul class="items">
      <li v-for="(it, idx) in localItems" :key="idx">
        <input type="checkbox" v-model="it.checked" />
        <span :class="{ done: it.checked }">{{ it.text }}</span>
      </li>
    </ul>

    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

// Clone items locally so we can mutate without mutating props directly
const localItems = ref(props.card.items ? props.card.items.map(it => ({ ...it })) : []);

const counts = computed(() => {
  const total = localItems.value.length;
  const done = localItems.value.filter(i => i.checked).length;
  return { total, done };
});

const progressText = computed(() => {
  if (!counts.value.total) return '';
  return `${counts.value.done}/${counts.value.total}`;
});

const emit = defineEmits(['open']);

function open() {
  emit('open');
}
</script>

<style scoped>
.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  color: var(--text-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.title { 
  font-size: 0.875rem; 
  font-weight: 600; 
  margin: 0; 
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress { 
  font-size: 0.625rem; 
  color: var(--text-color); 
  opacity: 0.7;
  background: var(--card-border-color);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  flex-shrink: 0;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.items li {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  line-height: 1.3;
}

.items li + li { margin-top: 0.25rem; }

.items .done { 
  text-decoration: line-through; 
  color: var(--text-color); 
  opacity: 0.6; 
}

.description { 
  font-size: 0.75rem; 
  color: var(--text-color); 
  opacity: 0.8;
  margin: 0.5rem 0 0; 
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

/* Responsive adjustments */
.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .items li {
  font-size: 0.625rem;
}

.mosaic-item-tiny .progress {
  font-size: 0.5rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .items li,
.mosaic-item-xl .items li {
  font-size: 0.875rem;
}
</style>
