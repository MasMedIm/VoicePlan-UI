<template>
  <div class="card progress-card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    
    <div class="progress-content">
      <div class="progress-header">
        <span class="progress-label">{{ card.progressLabel || 'Progress' }}</span>
        <span class="progress-percentage">{{ Math.round(progressPercentage) }}%</span>
      </div>
      
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      
      <div v-if="card.steps" class="progress-steps">
        <div class="steps-info">
          <span class="steps-current">{{ completedSteps }}</span>
          <span class="steps-divider">/</span>
          <span class="steps-total">{{ card.steps.length }}</span>
          <span class="steps-label">tasks completed</span>
        </div>
      </div>
    </div>
    
    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <div v-if="card.dueDate" class="due-date">
      <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>Due {{ formatDate(card.dueDate) }}</span>
    </div>
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

const progressPercentage = computed(() => {
  if (props.card.progress !== undefined) {
    return Math.max(0, Math.min(100, props.card.progress));
  }
  if (props.card.steps) {
    const completed = props.card.steps.filter(step => step.completed).length;
    return (completed / props.card.steps.length) * 100;
  }
  return 0;
});

const completedSteps = computed(() => {
  if (!props.card.steps) return 0;
  return props.card.steps.filter(step => step.completed).length;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.progress-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.progress-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.progress-card > * {
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

.progress-content {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffffff, #f0f9ff);
  border-radius: 4px;
  transition: width 0.6s ease;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
}

.progress-steps {
  display: flex;
  justify-content: center;
}

.steps-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.steps-current {
  font-weight: 700;
  font-size: 1rem;
}

.steps-divider {
  opacity: 0.7;
}

.steps-total {
  opacity: 0.8;
}

.steps-label {
  margin-left: 4px;
  opacity: 0.7;
  font-size: 0.8rem;
}

.description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.calendar-icon {
  width: 14px;
  height: 14px;
}

/* Dark mode adjustments */
.dark .progress-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style> 