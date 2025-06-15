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
  text-align: left;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px 24px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}

.icon { 
  width: 20px; 
  height: 20px; 
  color: rgba(255, 255, 255, 0.9); 
  flex-shrink: 0; 
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
}

.status {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.metric-content {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.unit {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}

.change-icon {
  width: 14px;
  height: 14px;
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
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* Dark mode adjustments */
.dark .metric-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style> 