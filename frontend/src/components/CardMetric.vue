<template>
  <div class="card metric-card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    
    <div class="metric-content">
      <div class="metric-value">
        <span class="number">{{ formatNumber(card.value) }}</span>
        <span class="unit">{{ card.unit }}</span>
      </div>
      <div v-if="card.change" class="metric-change" :class="changeClass">
        <svg class="change-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline v-if="card.change > 0" points="17,11 21,7 17,3"/>
          <polyline v-else points="17,13 21,17 17,21"/>
          <path v-if="card.change > 0" d="M21,7L3,7"/>
          <path v-else d="M21,17L3,17"/>
        </svg>
        <span>{{ Math.abs(card.change) }}%</span>
      </div>
    </div>
    
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const statusClass = computed(() => {
  const s = (props.card.status || '').toLowerCase();
  return {
    todo: 'status-todo',
    in_progress: 'status-in-progress', 
    done: 'status-done',
  }[s] || 'status-generic';
});

const changeClass = computed(() => {
  if (!props.card.change) return '';
  return props.card.change > 0 ? 'change-positive' : 'change-negative';
});

const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat().format(num);
};

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.metric-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.metric-card > * {
  position: relative;
  z-index: 1;
}

.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid var(--card-border-color);
  border-radius: 12px;
  padding: 0.75rem;
  background: var(--card-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: var(--text-color);
}

.card-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: rgba(255, 255, 255, 0.9); 
  flex-shrink: 0; 
}

.title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  flex-shrink: 0;
}

.metric-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  flex-grow: 1;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  justify-content: center;
}

.number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.unit {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  margin-top: 0.25rem;
}

.change-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.change-positive {
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.change-negative {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.3;
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

.mosaic-item-tiny .number {
  font-size: 1.25rem;
}

.mosaic-item-tiny .unit {
  font-size: 0.625rem;
}

.mosaic-item-tiny .metric-change {
  font-size: 0.625rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .number,
.mosaic-item-xl .number {
  font-size: 2rem;
}

.mosaic-item-large .unit,
.mosaic-item-xl .unit {
  font-size: 0.875rem;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.875rem;
  -webkit-line-clamp: 3;
}

/* Dark mode adjustments */
.dark .metric-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style> 