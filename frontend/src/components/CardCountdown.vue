<template>
  <div class="card countdown-card" @click="open">
    <!-- Glassmorphism background -->
    <div class="glass-bg"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    
    <!-- Excitement glow effect -->
    <div class="excitement-glow" :class="{ active: isExciting }"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper" :class="{ pulsing: isExciting }">
          <Calendar class="icon" />
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.category" class="category" :class="categoryClass">{{ card.category }}</span>
    </header>
    
    <!-- Countdown Display -->
    <div class="countdown-section">
      <div v-if="!hasExpired" class="countdown-grid">
        <div class="time-unit">
          <div class="time-value">{{ countdown.days }}</div>
          <div class="time-label">Days</div>
        </div>
        <div class="time-unit">
          <div class="time-value">{{ countdown.hours }}</div>
          <div class="time-label">Hours</div>
        </div>
        <div class="time-unit">
          <div class="time-value">{{ countdown.minutes }}</div>
          <div class="time-label">Minutes</div>
        </div>
        <div class="time-unit">
          <div class="time-value">{{ countdown.seconds }}</div>
          <div class="time-label">Seconds</div>
        </div>
      </div>
      
      <!-- Expired State -->
      <div v-else class="expired-state">
        <div class="expired-icon">🎉</div>
        <div class="expired-text">Event Started!</div>
        <div class="expired-subtext">{{ formatDate(eventDate) }}</div>
      </div>
    </div>
    
    <!-- Event Details -->
    <div class="event-details">
      <div class="event-date">
        <Clock class="detail-icon" />
        <span>{{ formatEventDate }}</span>
      </div>
      
      <div v-if="card.location" class="event-location">
        <MapPin class="detail-icon" />
        <span>{{ card.location }}</span>
      </div>
    </div>
    
    <!-- Description -->
    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <!-- Excitement particles for near events -->
    <div v-if="isExciting" class="excitement-particles">
      <div v-for="i in 8" :key="i" class="particle" :style="{ '--delay': i * 0.2 + 's' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Calendar, Clock, MapPin } from 'lucide-vue-next';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open']);

// Current time tracking
const now = ref(new Date());
let timeInterval;

onMounted(() => {
  // Update every second for live countdown
  timeInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

const eventDate = computed(() => {
  return props.card.eventDate ? new Date(props.card.eventDate) : null;
});

const timeDifference = computed(() => {
  if (!eventDate.value) return 0;
  return eventDate.value.getTime() - now.value.getTime();
});

const hasExpired = computed(() => {
  return timeDifference.value <= 0;
});

const isExciting = computed(() => {
  // Exciting if less than 24 hours remaining
  return timeDifference.value > 0 && timeDifference.value <= 24 * 60 * 60 * 1000;
});

const countdown = computed(() => {
  if (hasExpired.value) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const diff = Math.max(0, timeDifference.value);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
});

const formatEventDate = computed(() => {
  if (!eventDate.value) return 'No date set';
  
  return eventDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const categoryClass = computed(() => {
  const c = (props.card.category || '').toLowerCase();
  return {
    flight: 'category-flight',
    hotel: 'category-hotel',
    activity: 'category-activity',
    meeting: 'category-meeting',
    deadline: 'category-deadline',
  }[c] || 'category-general';
});

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function open() { 
  emit('open'); 
}
</script>

<style scoped>
.countdown-card {
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

.excitement-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.4) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(236, 72, 153, 0.4) 100%
  );
  border-radius: 24px;
  opacity: 0;
  z-index: -1;
  filter: blur(12px);
  transition: opacity 0.4s ease;
}

.excitement-glow.active {
  opacity: 0.7;
  animation: excitement-pulse 1.5s ease-in-out infinite;
}

.countdown-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 48px rgba(59, 130, 246, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border-color: rgba(59, 130, 246, 0.25);
}

.countdown-card:hover .circle-1,
.countdown-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
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

.icon-wrapper.pulsing {
  animation: icon-pulse 2s ease-in-out infinite;
}

.countdown-card:hover .icon-wrapper {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.icon { 
  width: 1.25rem; 
  height: 1.25rem; 
  color: rgba(255, 255, 255, 0.9); 
}

.title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.02em;
}

.category {
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

.category-flight { 
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}
.category-hotel { 
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.3);
}
.category-activity { 
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}
.category-meeting { 
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}
.category-deadline { 
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}
.category-general { 
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}

/* Countdown Section */
.countdown-section {
  margin-bottom: 1.5rem;
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  text-align: center;
}

.time-unit {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  transition: all 0.3s ease;
}

.time-unit:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.time-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Expired State */
.expired-state {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(8px);
}

.expired-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: celebration-bounce 1s ease-in-out infinite;
}

.expired-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.25rem;
}

.expired-subtext {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Event Details */
.event-details {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.detail-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.7;
  flex-shrink: 0;
}

.description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  text-align: center;
  opacity: 0.9;
}

/* Excitement Particles */
.excitement-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  animation: float-particle 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(odd) {
  left: 20%;
  animation-name: float-particle-left;
}

.particle:nth-child(even) {
  right: 20%;
  animation-name: float-particle-right;
}

/* Animations */
@keyframes excitement-pulse {
  0%, 100% { 
    opacity: 0.7;
    transform: scale(1);
  }
  50% { 
    opacity: 0.9;
    transform: scale(1.03);
  }
}

@keyframes icon-pulse {
  0%, 100% { 
    background: rgba(59, 130, 246, 0.15);
  }
  50% { 
    background: rgba(59, 130, 246, 0.25);
  }
}

@keyframes celebration-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float-particle {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  10%, 90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@keyframes float-particle-left {
  0% {
    opacity: 0;
    transform: translateY(100%) translateX(-20px);
  }
  10%, 90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100%) translateX(20px);
  }
}

@keyframes float-particle-right {
  0% {
    opacity: 0;
    transform: translateY(100%) translateX(20px);
  }
  10%, 90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100%) translateX(-20px);
  }
}

/* Responsive adjustments */
.mosaic-item-tiny .countdown-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.mosaic-item-tiny .time-value {
  font-size: 1.25rem;
}

.mosaic-item-tiny .time-label {
  font-size: 0.6rem;
}

.mosaic-item-large .countdown-grid,
.mosaic-item-xl .countdown-grid {
  gap: 1rem;
}

.mosaic-item-large .time-value,
.mosaic-item-xl .time-value {
  font-size: 2rem;
}

/* Dark mode adjustments */
.dark .countdown-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .glass-bg {
  background: rgba(0, 0, 0, 0.3);
}
</style>