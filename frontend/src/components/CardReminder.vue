<template>
  <div class="card reminder-card" @click="open" :class="{ urgent: isUrgent, overdue: isOverdue }">
    <!-- Glassmorphism background -->
    <div class="glass-bg"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    
    <!-- Urgency glow effect -->
    <div class="urgency-glow" :class="{ active: isUrgent || isOverdue }"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper" :class="{ ringing: isUrgent, overdue: isOverdue }">
          <Bell class="icon" />
          <div v-if="isUrgent" class="notification-pulse"></div>
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span class="urgency-badge" :class="urgencyClass">{{ urgencyLabel }}</span>
    </header>
    
    <!-- Time Display -->
    <div class="time-section">
      <div class="time-display">
        <div class="time-value">{{ formattedTime }}</div>
        <div class="time-label">{{ timeLabel }}</div>
      </div>
      
      <!-- Countdown -->
      <div v-if="countdown" class="countdown" :class="{ urgent: isUrgent, overdue: isOverdue }">
        <Clock class="countdown-icon" />
        <span class="countdown-text">{{ countdown }}</span>
      </div>
    </div>
    
    <!-- Reminder Actions -->
    <div class="reminder-actions">
      <button 
        v-if="!card.completed" 
        class="action-button snooze-button"
        @click.stop="snoozeReminder"
        :disabled="isOverdue"
      >
        <Clock class="action-icon" />
        <span>Snooze</span>
      </button>
      
      <button 
        class="action-button complete-button"
        @click.stop="toggleComplete"
        :class="{ completed: card.completed }"
      >
        <Check class="action-icon" />
        <span>{{ card.completed ? 'Done' : 'Mark Done' }}</span>
      </button>
    </div>
    
    <!-- Description -->
    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <!-- Alert patterns for different urgency levels -->
    <div v-if="isUrgent" class="alert-pattern">
      <div v-for="i in 4" :key="i" class="alert-ring" :style="{ '--delay': i * 0.5 + 's' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Bell, Clock, Check } from 'lucide-vue-next';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open', 'snooze', 'complete']);

// Time calculations
const now = ref(new Date());
let timeInterval;

onMounted(() => {
  // Update time every minute
  timeInterval = setInterval(() => {
    now.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

const reminderTime = computed(() => {
  return props.card.reminderTime ? new Date(props.card.reminderTime) : null;
});

const timeDifference = computed(() => {
  if (!reminderTime.value) return null;
  return reminderTime.value.getTime() - now.value.getTime();
});

const isOverdue = computed(() => {
  return timeDifference.value !== null && timeDifference.value < 0 && !props.card.completed;
});

const isUrgent = computed(() => {
  // Urgent if within 1 hour and not overdue
  return timeDifference.value !== null && 
         timeDifference.value > 0 && 
         timeDifference.value <= 3600000 && // 1 hour in milliseconds
         !props.card.completed;
});

const formattedTime = computed(() => {
  if (!reminderTime.value) return '--:--';
  return reminderTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

const timeLabel = computed(() => {
  if (!reminderTime.value) return 'No time set';
  
  const today = new Date();
  const reminderDate = reminderTime.value;
  
  if (reminderDate.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (reminderDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  return reminderDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
});

const countdown = computed(() => {
  if (!timeDifference.value || props.card.completed) return null;
  
  const diff = Math.abs(timeDifference.value);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (isOverdue.value) {
    if (hours > 0) return `${hours}h ${minutes}m overdue`;
    return `${minutes}m overdue`;
  }
  
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
});

const urgencyClass = computed(() => {
  if (props.card.completed) return 'urgency-completed';
  if (isOverdue.value) return 'urgency-overdue';
  if (isUrgent.value) return 'urgency-urgent';
  return 'urgency-normal';
});

const urgencyLabel = computed(() => {
  if (props.card.completed) return 'Done';
  if (isOverdue.value) return 'Overdue';
  if (isUrgent.value) return 'Urgent';
  return 'Pending';
});

function open() { 
  emit('open'); 
}

function snoozeReminder() {
  emit('snooze', props.card);
}

function toggleComplete() {
  emit('complete', props.card);
}
</script>

<style scoped>
.reminder-card {
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

.reminder-card.urgent {
  border-color: rgba(251, 191, 36, 0.3);
  box-shadow: 
    0 8px 32px rgba(251, 191, 36, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.reminder-card.overdue {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 
    0 8px 32px rgba(239, 68, 68, 0.25),
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
  background: rgba(251, 191, 36, 0.1);
  filter: blur(40px);
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.circle-1 {
  width: 5rem;
  height: 5rem;
  top: -2.5rem;
  right: -2.5rem;
  background: rgba(251, 191, 36, 0.08);
}

.circle-2 {
  width: 7rem;
  height: 7rem;
  bottom: -3.5rem;
  left: -3.5rem;
  background: rgba(245, 158, 11, 0.08);
}

.reminder-card.overdue .circle-1,
.reminder-card.overdue .circle-2 {
  background: rgba(239, 68, 68, 0.1);
}

.urgency-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, 
    rgba(251, 191, 36, 0.4) 0%,
    rgba(245, 158, 11, 0.3) 50%,
    rgba(251, 191, 36, 0.4) 100%
  );
  border-radius: 24px;
  opacity: 0;
  z-index: -1;
  filter: blur(12px);
  transition: opacity 0.4s ease;
}

.urgency-glow.active {
  opacity: 0.6;
  animation: urgency-pulse 2s ease-in-out infinite;
}

.reminder-card.overdue .urgency-glow {
  background: linear-gradient(45deg, 
    rgba(239, 68, 68, 0.5) 0%,
    rgba(220, 38, 38, 0.4) 50%,
    rgba(239, 68, 68, 0.5) 100%
  );
}

.reminder-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 48px rgba(251, 191, 36, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.reminder-card.overdue:hover {
  box-shadow: 
    0 20px 48px rgba(239, 68, 68, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.reminder-card:hover .circle-1,
.reminder-card:hover .circle-2 {
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.icon-wrapper.ringing {
  animation: bell-ring 0.5s ease-in-out infinite;
}

.icon-wrapper.overdue {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.notification-pulse {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: notification-blink 1s ease-in-out infinite;
}

.reminder-card:hover .icon-wrapper {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
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

.urgency-badge {
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

.urgency-normal { 
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}
.urgency-urgent { 
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}
.urgency-overdue { 
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}
.urgency-completed { 
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

/* Time Section */
.time-section {
  margin-bottom: 1rem;
  text-align: center;
}

.time-display {
  margin-bottom: 0.75rem;
}

.time-value {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 0.85rem;
}

.countdown.urgent {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.countdown.overdue {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.countdown-icon {
  width: 1rem;
  height: 1rem;
}

/* Reminder Actions */
.reminder-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.snooze-button:hover {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.complete-button:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.complete-button.completed {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

.description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  text-align: center;
  opacity: 0.9;
}

/* Alert Pattern */
.alert-pattern {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.alert-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  animation: alert-expand 2s ease-out infinite;
  animation-delay: var(--delay);
}

/* Animations */
@keyframes urgency-pulse {
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes bell-ring {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes notification-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes alert-expand {
  0% {
    width: 60px;
    height: 60px;
    opacity: 0.6;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

/* Responsive adjustments */
.mosaic-item-tiny .time-value {
  font-size: 1.5rem;
}

.mosaic-item-tiny .reminder-actions {
  flex-direction: column;
  gap: 0.5rem;
}

/* Dark mode adjustments */
.dark .reminder-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .glass-bg {
  background: rgba(0, 0, 0, 0.3);
}
</style> 