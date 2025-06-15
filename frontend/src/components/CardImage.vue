<template>
  <div class="card image-card">
    <img :src="card.image_url" :alt="card.title || 'image'" class="thumb" />
    <header class="card-header"><div class="header-left"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <h3 class="title">{{ card.title }}</h3></div>
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
  text-align:left;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 0 20px;
  background: #fff;
  max-width: 320px;
  width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.thumb {
  width: 100%;
  display: block;
  object-fit: cover;
  height: 180px;
}

.header-left{display:flex;align-items:center;gap:6px;}
.icon{width:18px;height:18px;color:#3b82f6;flex-shrink:0;}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  margin-top: 12px;
}

.title { font-size: 1.25rem; font-weight: 600; margin: 0; }
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
