<template>
  <div class="card progress-card" @click="open">
    <!-- Glassmorphism overlay -->
    <div class="glass-overlay"></div>
    
    <!-- Animated glow effect -->
    <div class="glow-effect"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper">
          <TrendingUp class="icon" />
        </div>
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
        <div class="progress-glow" :style="{ width: progressPercentage + '%' }"></div>
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
      <Calendar class="calendar-icon" />
      <span>Due {{ formatDate(card.dueDate) }}</span>
    </div>
    
    <!-- Action indicator -->
    <div class="action-indicator">
      <ChevronRight class="chevron" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TrendingUp, Calendar, ChevronRight } from 'lucide-vue-next';

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
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  min-height: fit-content;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.progress-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.03) 0%, 
    rgba(0, 242, 254, 0.03) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.08) 0%, 
    rgba(0, 242, 254, 0.05) 100%
  );
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 1;
}

.glow-effect {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(79, 172, 254, 0.4) 0%,
    rgba(0, 242, 254, 0.3) 50%,
    rgba(79, 172, 254, 0.4) 100%
  );
  border-radius: 18px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  filter: blur(12px);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.circle-1 {
  width: 5rem;
  height: 5rem;
  top: -2.5rem;
  right: -2.5rem;
  background: rgba(79, 172, 254, 0.1);
}

.circle-2 {
  width: 7rem;
  height: 7rem;
  bottom: -3.5rem;
  left: -3.5rem;
  background: rgba(0, 242, 254, 0.1);
}

.progress-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(79, 172, 254, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(79, 172, 254, 0.3);
}

.progress-card:hover::before {
  opacity: 1;
}

.progress-card:hover .glass-overlay {
  opacity: 1;
}

.progress-card:hover .glow-effect {
  opacity: 0.6;
}

.progress-card:hover .action-indicator {
  opacity: 1;
  transform: translateX(0);
}

.progress-card:hover .icon-wrapper {
  transform: rotate(8deg) scale(1.15);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.progress-card:hover .circle-1,
.progress-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
}

.progress-card:active {
  transform: translateY(-4px) scale(1.01);
  transition: transform 0.15s ease-out;
}

.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: 16px;
  padding: 0.75rem;
  color: var(--text-color);
  position: relative;
  z-index: 2;
  min-height: 0;
}

.card-header {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.icon-wrapper {
  padding: 0.35rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.icon { 
  width: 1rem; 
  height: 1rem; 
  color: white;
  stroke-width: 2.5;
}

.title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  background: linear-gradient(135deg, 
    var(--text-color) 0%, 
    color-mix(in srgb, var(--text-color) 80%, #4facfe 20%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.status {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  color: #fff;
  flex-shrink: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.status:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-todo { 
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}
.status-in-progress { 
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}
.status-done { 
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.status-generic { 
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.progress-content {
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-color);
  text-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
  transition: all 0.3s ease;
}

.progress-card:hover .progress-percentage {
  transform: scale(1.05);
  text-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.progress-bar-container {
  position: relative;
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(79, 172, 254, 0.9) 0%, 
    rgba(0, 242, 254, 0.9) 100%
  );
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(79, 172, 254, 0.6) 0%, 
    rgba(0, 242, 254, 0.6) 100%
  );
  border-radius: 6px;
  filter: blur(4px);
  z-index: 1;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-steps {
  display: flex;
  justify-content: center;
}

.steps-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.steps-current {
  font-weight: 800;
  font-size: 0.875rem;
  color: #4facfe;
  text-shadow: 0 1px 2px rgba(79, 172, 254, 0.3);
}

.steps-divider {
  opacity: 0.7;
  font-weight: 600;
}

.steps-total {
  opacity: 0.8;
  font-weight: 600;
}

.steps-label {
  margin-left: 0.25rem;
  opacity: 0.7;
  font-weight: 500;
}

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  text-align: center;
  position: relative;
  z-index: 2;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  opacity: 0.9;
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.due-date:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.calendar-icon {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.8;
}

.action-indicator {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.3s ease;
  z-index: 3;
}

.chevron {
  width: 1rem;
  height: 1rem;
  color: rgba(79, 172, 254, 0.6);
  animation: float 2s ease-in-out infinite;
}

/* Animations */
@keyframes gentle-pulse {
  0%, 100% { 
    opacity: 0;
    transform: scale(0.95);
  }
  50% { 
    opacity: 0.3;
    transform: scale(1.02);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

/* Size optimizations */
.mosaic-item-micro .card {
  padding: 0.5rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .progress-content {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .progress-percentage {
  font-size: 1rem;
}

.mosaic-item-micro .progress-bar-container {
  height: 8px;
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .steps-info {
  font-size: 0.65rem;
  padding: 0.375rem 0.5rem;
}

.mosaic-item-micro .description {
  font-size: 0.65rem;
}

.mosaic-item-micro .due-date {
  font-size: 0.65rem;
  padding: 0.375rem 0.5rem;
}

/* Enhanced dark mode */
.dark .progress-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .progress-card:hover {
  box-shadow: 
    0 12px 32px rgba(79, 172, 254, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dark .glass-overlay {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(168, 85, 247, 0.08) 100%
  );
}
</style> 