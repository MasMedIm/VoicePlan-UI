<template>
  <div class="card date-card" :class="urgencyClass" @click="open">
    <!-- Glassmorphism overlay -->
    <div class="glass-overlay" :class="urgencyClass"></div>
    
    <!-- Animated glow effect -->
    <div class="glow-effect" :class="urgencyClass"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1" :class="urgencyClass"></div>
    <div class="decorative-circle circle-2" :class="urgencyClass"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper" :class="urgencyClass">
          <CalendarDays class="icon" />
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
    </header>
    
    <div class="countdown-container">
      <div class="countdown-main">
        <div class="countdown-number" :class="urgencyClass">
          <span class="number">{{ Math.abs(daysLeft) }}</span>
          <span class="unit">{{ daysLeft === 1 || daysLeft === -1 ? 'day' : 'days' }}</span>
        </div>
        <div class="countdown-label">
          <template v-if="daysLeft > 1">remaining</template>
          <template v-else-if="daysLeft === 1">tomorrow!</template>
          <template v-else-if="daysLeft === 0">today!</template>
          <template v-else>ago</template>
        </div>
      </div>
      
      <div class="progress-ring" v-if="showProgress">
        <svg class="progress-circle" width="60" height="60">
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="4"
            fill="none"
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            :stroke="progressColor"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="157"
            :stroke-dashoffset="progressOffset"
            class="progress-stroke"
          />
        </svg>
        <div class="progress-text">
          {{ Math.round(progressPercentage) }}%
        </div>
      </div>
    </div>
    
    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <!-- Urgency pulse effect -->
    <div class="urgency-pulse" :class="urgencyClass"></div>
    
    <!-- Action indicator -->
    <div class="action-indicator">
      <ChevronRight class="chevron" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CalendarDays, ChevronRight } from 'lucide-vue-next';

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

const urgencyClass = computed(() => {
  const days = daysLeft.value;
  if (days < 0) return 'past';
  if (days === 0) return 'today';
  if (days <= 2) return 'urgent';
  if (days <= 7) return 'soon';
  return 'future';
});

const showProgress = computed(() => {
  return props.card.totalDays && props.card.totalDays > 0;
});

const progressPercentage = computed(() => {
  if (!showProgress.value) return 0;
  const elapsed = props.card.totalDays - daysLeft.value;
  return Math.max(0, Math.min(100, (elapsed / props.card.totalDays) * 100));
});

const progressOffset = computed(() => {
  const circumference = 157; // 2 * π * 25
  return circumference - (progressPercentage.value / 100) * circumference;
});

const progressColor = computed(() => {
  const urgency = urgencyClass.value;
  if (urgency === 'urgent') return '#ef4444';
  if (urgency === 'soon') return '#f59e0b';
  if (urgency === 'today') return '#10b981';
  return '#3b82f6';
});

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.date-card {
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

.date-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  z-index: 1;
  transition: opacity 0.4s ease;
}

.date-card.urgent::before {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.03) 0%, 
    rgba(220, 38, 38, 0.03) 100%
  );
}

.date-card.soon::before {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.03) 0%, 
    rgba(217, 119, 6, 0.03) 100%
  );
}

.date-card.today::before {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.03) 0%, 
    rgba(5, 150, 105, 0.03) 100%
  );
}

.date-card.future::before {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.03) 0%, 
    rgba(37, 99, 235, 0.03) 100%
  );
}

.date-card.past::before {
  background: linear-gradient(135deg, 
    rgba(107, 114, 128, 0.03) 0%, 
    rgba(75, 85, 99, 0.03) 100%
  );
}

.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 1;
}

.glass-overlay.urgent {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.08) 0%, 
    rgba(220, 38, 38, 0.05) 100%
  );
}

.glass-overlay.soon {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.08) 0%, 
    rgba(217, 119, 6, 0.05) 100%
  );
}

.glass-overlay.today {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.08) 0%, 
    rgba(5, 150, 105, 0.05) 100%
  );
}

.glass-overlay.future {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.08) 0%, 
    rgba(37, 99, 235, 0.05) 100%
  );
}

.glass-overlay.past {
  background: linear-gradient(135deg, 
    rgba(107, 114, 128, 0.08) 0%, 
    rgba(75, 85, 99, 0.05) 100%
  );
}

.glow-effect {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 18px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  filter: blur(12px);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.glow-effect.urgent {
  background: linear-gradient(45deg, 
    rgba(239, 68, 68, 0.4) 0%,
    rgba(220, 38, 38, 0.3) 50%,
    rgba(239, 68, 68, 0.4) 100%
  );
}

.glow-effect.soon {
  background: linear-gradient(45deg, 
    rgba(245, 158, 11, 0.4) 0%,
    rgba(217, 119, 6, 0.3) 50%,
    rgba(245, 158, 11, 0.4) 100%
  );
}

.glow-effect.today {
  background: linear-gradient(45deg, 
    rgba(16, 185, 129, 0.4) 0%,
    rgba(5, 150, 105, 0.3) 50%,
    rgba(16, 185, 129, 0.4) 100%
  );
}

.glow-effect.future {
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.4) 0%,
    rgba(37, 99, 235, 0.3) 50%,
    rgba(59, 130, 246, 0.4) 100%
  );
}

.glow-effect.past {
  background: linear-gradient(45deg, 
    rgba(107, 114, 128, 0.4) 0%,
    rgba(75, 85, 99, 0.3) 50%,
    rgba(107, 114, 128, 0.4) 100%
  );
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
}

.circle-2 {
  width: 7rem;
  height: 7rem;
  bottom: -3.5rem;
  left: -3.5rem;
}

.circle-1.urgent, .circle-2.urgent {
  background: rgba(239, 68, 68, 0.1);
}

.circle-1.soon, .circle-2.soon {
  background: rgba(245, 158, 11, 0.1);
}

.circle-1.today, .circle-2.today {
  background: rgba(16, 185, 129, 0.1);
}

.circle-1.future, .circle-2.future {
  background: rgba(59, 130, 246, 0.1);
}

.circle-1.past, .circle-2.past {
  background: rgba(107, 114, 128, 0.1);
}

.date-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.date-card.urgent:hover {
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 
    0 12px 32px rgba(239, 68, 68, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.date-card.soon:hover {
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 
    0 12px 32px rgba(245, 158, 11, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.date-card.today:hover {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 
    0 12px 32px rgba(16, 185, 129, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.date-card.future:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 
    0 12px 32px rgba(59, 130, 246, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.date-card.past:hover {
  border-color: rgba(107, 114, 128, 0.3);
  box-shadow: 
    0 12px 32px rgba(107, 114, 128, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.date-card:hover::before {
  opacity: 1;
}

.date-card:hover .glass-overlay {
  opacity: 1;
}

.date-card:hover .glow-effect {
  opacity: 0.6;
}

.date-card:hover .action-indicator {
  opacity: 1;
  transform: translateX(0);
}

.date-card:hover .icon-wrapper {
  transform: rotate(8deg) scale(1.15);
}

.date-card:hover .circle-1,
.date-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
}

.date-card:active {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 3;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-wrapper {
  padding: 0.35rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.icon-wrapper.urgent {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.icon-wrapper.soon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.icon-wrapper.today {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  animation: today-glow 2s ease-in-out infinite;
}

.icon-wrapper.future {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.icon-wrapper.past {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
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
    color-mix(in srgb, var(--text-color) 80%, #3b82f6 20%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.countdown-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
}

.countdown-main {
  flex: 1;
}

.countdown-number {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.number {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  transition: all 0.3s ease;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.countdown-number.urgent .number {
  color: #ef4444;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
}

.countdown-number.soon .number {
  color: #f59e0b;
  text-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
}

.countdown-number.today .number {
  color: #10b981;
  text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  animation: today-pulse 2s ease-in-out infinite;
}

.countdown-number.future .number {
  color: #3b82f6;
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
}

.countdown-number.past .number {
  color: #6b7280;
  text-shadow: 0 0 12px rgba(107, 114, 128, 0.4);
}

.unit {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.8;
}

.countdown-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.progress-circle {
  transform: rotate(-90deg);
  transition: stroke-dashoffset 0.5s ease;
}

.progress-stroke {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 4px currentColor);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-color);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.4;
  text-align: center;
  position: relative;
  z-index: 2;
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
  color: rgba(59, 130, 246, 0.6);
  animation: float 2s ease-in-out infinite;
}

.urgency-pulse {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 20px;
  opacity: 0;
  z-index: -1;
  filter: blur(12px);
  transition: opacity 0.4s ease;
}

.urgency-pulse.urgent {
  background: linear-gradient(45deg, #ef4444, #f87171);
  animation: urgent-pulse 1.5s ease-in-out infinite;
}

.urgency-pulse.today {
  background: linear-gradient(45deg, #10b981, #34d399);
  animation: today-pulse 2s ease-in-out infinite;
}

.date-card:hover .urgency-pulse {
  opacity: 0.4;
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

@keyframes today-glow {
  0%, 100% { 
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  50% { 
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
  }
}

@keyframes today-pulse {
  0%, 100% { 
    transform: scale(1);
    text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }
  50% { 
    transform: scale(1.05);
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
  }
}

@keyframes urgent-pulse {
  0%, 100% { 
    opacity: 0;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.02);
  }
}

/* Size optimizations */
.mosaic-item-micro .card {
  padding: 0.5rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .countdown-container {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .number {
  font-size: 1.1rem;
}

.mosaic-item-micro .unit {
  font-size: 0.65rem;
}

.mosaic-item-micro .countdown-label {
  font-size: 0.6rem;
}

.mosaic-item-micro .description {
  font-size: 0.65rem;
}

.mosaic-item-micro .progress-ring {
  width: 40px;
  height: 40px;
}

.mosaic-item-micro .progress-text {
  font-size: 0.6rem;
}

.mosaic-item-micro .icon-wrapper {
  padding: 0.25rem;
}

.mosaic-item-micro .icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* Enhanced dark mode */
.dark .date-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .date-card:hover {
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
