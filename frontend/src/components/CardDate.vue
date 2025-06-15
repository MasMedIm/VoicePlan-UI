<template>
  <div class="card date-card" :class="urgencyClass" @click="open">
    <div class="date-backdrop"></div>
    
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
    
    <div class="date-glow" :class="urgencyClass"></div>
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
  height: fit-content;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  background: var(--card-bg);
  padding: 0.5rem;
  text-align: left;
  color: var(--text-color);
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: fit-content;
}

.date-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.date-card.urgent::before {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.date-card.soon::before {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.date-card.today::before {
  background: linear-gradient(135deg, #10b981, #059669);
}

.date-card.future::before {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.date-card.past::before {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.date-card:hover::before {
  opacity: 0.1;
}

.date-card:hover {
  transform: translateY(-1px) scale(1.005);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.date-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.date-card:hover .date-backdrop {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.icon-wrapper {
  padding: 0.2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.icon-wrapper.urgent {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.icon-wrapper.soon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.icon-wrapper.today {
  background: linear-gradient(135deg, #10b981, #059669);
}

.icon-wrapper.future {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.icon-wrapper.past {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.date-card:hover .icon-wrapper {
  transform: rotate(10deg) scale(1.1);
}

.icon {
  width: 0.8rem;
  height: 0.8rem;
  color: white;
  stroke-width: 2.5;
}

.title {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: linear-gradient(135deg, 
    var(--text-color) 0%, 
    color-mix(in srgb, var(--text-color) 85%, #3b82f6 15%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.countdown-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
}

.countdown-main {
  flex: 1;
}

.countdown-number {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  margin-bottom: 0.2rem;
}

.number {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  transition: all 0.3s ease;
}

.countdown-number.urgent .number {
  color: #ef4444;
}

.countdown-number.soon .number {
  color: #f59e0b;
}

.countdown-number.today .number {
  color: #10b981;
}

.countdown-number.future .number {
  color: #3b82f6;
}

.countdown-number.past .number {
  color: #6b7280;
}

.unit {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.7;
}

.countdown-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.progress-ring {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.progress-circle {
  transform: rotate(-90deg);
  transition: stroke-dashoffset 0.5s ease;
}

.progress-stroke {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-color);
}

.description {
  font-size: 0.65rem;
  color: var(--text-color);
  opacity: 0.85;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  position: relative;
  z-index: 2;
}

.date-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 14px;
  opacity: 0;
  z-index: -1;
  filter: blur(8px);
  transition: opacity 0.3s ease;
}

.date-glow.urgent {
  background: linear-gradient(45deg, #ef4444, #f87171);
}

.date-glow.soon {
  background: linear-gradient(45deg, #f59e0b, #fbbf24);
}

.date-glow.today {
  background: linear-gradient(45deg, #10b981, #34d399);
}

.date-glow.future {
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
}

.date-glow.past {
  background: linear-gradient(45deg, #6b7280, #9ca3af);
}

.date-card:hover .date-glow {
  opacity: 0.3;
}

/* ===== Micro Size Optimizations ===== */
.mosaic-item-micro .date-card {
  padding: 0.35rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.25rem;
}

.mosaic-item-micro .countdown-container {
  margin-bottom: 0.25rem;
}

.mosaic-item-micro .title {
  font-size: 0.7rem;
}

.mosaic-item-micro .number {
  font-size: 1rem;
}

.mosaic-item-micro .unit {
  font-size: 0.6rem;
}

.mosaic-item-micro .countdown-label {
  font-size: 0.55rem;
}

.mosaic-item-micro .description {
  font-size: 0.55rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .progress-ring {
  width: 35px;
  height: 35px;
}

.mosaic-item-micro .progress-text {
  font-size: 0.5rem;
}

.mosaic-item-micro .icon-wrapper {
  padding: 0.15rem;
}

.mosaic-item-micro .icon {
  width: 0.7rem;
  height: 0.7rem;
}

/* ===== Tiny Size Optimizations ===== */
.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .number {
  font-size: 1.1rem;
}

.mosaic-item-tiny .description {
  font-size: 0.6rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .progress-ring {
  width: 40px;
  height: 40px;
}

.mosaic-item-tiny .progress-text {
  font-size: 0.6rem;
}

/* ===== Enhanced Large Size Support ===== */
.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 0.9rem;
}

.mosaic-item-large .number,
.mosaic-item-xl .number {
  font-size: 1.6rem;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.75rem;
  -webkit-line-clamp: 2;
}

.mosaic-item-large .progress-ring,
.mosaic-item-xl .progress-ring {
  width: 60px;
  height: 60px;
}

.mosaic-item-large .progress-text,
.mosaic-item-xl .progress-text {
  font-size: 0.7rem;
}
</style>
