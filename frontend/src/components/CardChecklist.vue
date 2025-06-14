<template>
  <div class="card checklist-card">
    <header class="card-header">
      <h3 class="title">{{ card.title }}</h3>
      <span v-if="progressText" class="progress">{{ progressText }}</span>
    </header>

    <ul class="items">
      <li v-for="(it, idx) in card.items" :key="idx">
        <input type="checkbox" :checked="it.checked" disabled />
        <span :class="{ done: it.checked }">{{ it.text }}</span>
      </li>
    </ul>

    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const counts = computed(() => {
  if (!Array.isArray(props.card.items)) return { total: 0, done: 0 };
  const total = props.card.items.length;
  const done = props.card.items.filter((i) => i.checked).length;
  return { total, done };
});

const progressText = computed(() => {
  if (!counts.value.total) return '';
  return `${counts.value.done}/${counts.value.total}`;
});
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 12px 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.title { font-size: 1rem; font-weight: 600; margin: 0; }
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
</style>
