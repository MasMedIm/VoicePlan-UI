<template>
  <div class="card metric-card" @click="open" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <!-- Glassmorphism background -->
    <div class="glass-bg"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    
    <!-- Gradient overlay -->
    <div class="gradient-overlay"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
          </svg>
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    
    <div class="metric-content">
      <div class="metric-value">
        <span class="number">{{ formatNumber(animatedValue) }}</span>
        <span class="unit">{{ card.unit }}</span>
      </div>
      <div v-if="card.change" class="metric-change" :class="changeClass">
        <svg class="change-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline v-if="card.change > 0" points="17,11 21,7 17,3"/>
          <polyline v-else points="17,13 21,17 17,21"/>
        </svg>
        <span>{{ Math.abs(card.change) }}%</span>
      </div>
    </div>
    
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const isHovered = ref(false);
const animatedValue = ref(0);

// Animate the value when component mounts
onMounted(() => {
  if (props.card.value) {
    animateValue(0, props.card.value, 1500);
  }
});

// Watch for value changes
watch(() => props.card.value, (newValue) => {
  if (newValue) {
    animateValue(animatedValue.value, newValue, 1000);
  }
});

function animateValue(start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smoother animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    animatedValue.value = Math.floor(start + (end - start) * easeOutQuart);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

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
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.glass-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(2px);
  z-index: 1;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  filter: blur(40px);
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.circle-1 {
  width: 6rem;
  height: 6rem;
  top: -3rem;
  right: -3rem;
  background: rgba(59, 130, 246, 0.08);
}

.circle-2 {
  width: 8rem;
  height: 8rem;
  bottom: -4rem;
  left: -4rem;
  background: rgba(139, 92, 246, 0.08);
}

.metric-card:hover .circle-1 {
  transform: scale(1.3);
  opacity: 0.9;
}

.metric-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.08) 50%,
    rgba(236, 72, 153, 0.06) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.metric-card:hover {
  transform: translateY(-12px) scale(1.03);
  box-shadow: 
    0 20px 48px rgba(59, 130, 246, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border-color: rgba(59, 130, 246, 0.25);
}

.metric-card:hover .gradient-overlay {
  opacity: 1;
}

.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: 20px;
  padding: 1.5rem;
  color: white;
  position: relative;
  z-index: 2;
}

.card-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  min-width: 0;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.metric-card:hover .icon-wrapper {
  background: rgba(59, 130, 246, 0.25);
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.icon { 
  width: 1.25rem; 
  height: 1.25rem; 
  color: rgba(255, 255, 255, 0.9); 
  flex-shrink: 0; 
}

.title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.02em;
}

.status {
  font-size: 0.65rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  flex-shrink: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.status:hover {
  transform: translateY(-1px) scale(1.05);
}

.status-todo { 
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}
.status-in-progress { 
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}
.status-done { 
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}
.status-generic { 
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}

.metric-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.number {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;
  transition: all 0.3s ease;
}

.metric-card:hover .number {
  transform: scale(1.05);
  text-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.unit {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.metric-change:hover {
  transform: translateY(-2px);
}

.change-icon {
  width: 1rem;
  height: 1rem;
}

.change-positive {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.change-negative {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  text-align: center;
  opacity: 0.9;
}

/* Responsive adjustments */
.mosaic-item-tiny .number {
  font-size: 1.75rem;
}

.mosaic-item-tiny .unit {
  font-size: 0.75rem;
}

.mosaic-item-tiny .metric-change {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.mosaic-item-large .number,
.mosaic-item-xl .number {
  font-size: 3rem;
}

.mosaic-item-large .unit,
.mosaic-item-xl .unit {
  font-size: 1.25rem;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.9rem;
}

/* Dark mode adjustments */
.dark .metric-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.dark .metric-card:hover {
  box-shadow: 
    0 20px 48px rgba(59, 130, 246, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.dark .glass-bg {
  background: rgba(0, 0, 0, 0.3);
}

.dark .decorative-circle {
  background: rgba(99, 102, 241, 0.08);
}

.dark .circle-2 {
  background: rgba(168, 85, 247, 0.08);
}
</style> 