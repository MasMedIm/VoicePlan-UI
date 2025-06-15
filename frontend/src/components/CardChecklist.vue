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
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 20px 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.progress { font-size: 0.75rem; color: #555; }

.items {
  list-style: none;
  padding: 0;
  margin: 0 0 6px;
}

.items li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.items li + li { margin-top: 4px; }

.items .done { text-decoration: line-through; color: #888; }

.description { font-size: 0.85rem; color: #555; margin: 6px 0 0; }
.header-left { display: flex; align-items: center; gap: 6px; }
.icon { width: 18px; height: 18px; color: #3b82f6; flex-shrink: 0; }
</style>
