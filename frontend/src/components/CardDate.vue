<template>
  <div class="card date-card" @click="open">
    <div class="header-left"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
<h3 class="title">{{ card.title }}</h3></div>
    <p class="countdown" :class="{ past: daysLeft < 0 }">
      <template v-if="daysLeft > 1">{{ daysLeft }} days left</template>
      <template v-else-if="daysLeft === 1">1 day left</template>
      <template v-else-if="daysLeft === 0">Today!</template>
      <template v-else>{{ Math.abs(daysLeft) }} days ago</template>
    </p>
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const daysLeft = computed(() => {
  if (!props.card.date) return 0;
  const target = new Date(props.card.date);
  const now = new Date();
  const diffMs = target.setHours(0,0,0,0) - now.setHours(0,0,0,0);
  return Math.round(diffMs / 86400000); // ms in day
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
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  text-align: left;
  color: var(--text-color);
}

.title { 
  font-size: 0.875rem; 
  font-weight: 600; 
  margin: 0 0 0.5rem; 
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-left{
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.icon{
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.countdown { 
  font-size: 1rem; 
  margin: 0; 
  color: #2563eb; 
  font-weight: 600; 
  text-align: center;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown.past { color: #c2410c; }

.description { 
  font-size: 0.75rem; 
  color: var(--text-color); 
  opacity: 0.8;
  margin-top: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Responsive adjustments */
.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .countdown {
  font-size: 0.875rem;
}

.mosaic-item-tiny .description {
  font-size: 0.625rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .countdown,
.mosaic-item-xl .countdown {
  font-size: 1.25rem;
}
</style>
