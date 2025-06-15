<template>
  <div class="card meeting-card" @click="open">
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
          <CalendarPlus class="icon" />
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.priority" class="priority" :class="priorityClass">{{ card.priority }}</span>
    </header>

    <div class="content">
      <div class="date-picker-container">
        <div class="date-input-wrapper">
          <CalendarDays class="input-icon" />
          <input
            v-model="localDate"
            type="datetime-local"
            class="date-input"
            placeholder="Select date & time"
            @click.stop
          />
        </div>
      </div>
      
      <div class="meeting-details" v-if="card.duration || card.location">
        <div v-if="card.duration" class="detail-item">
          <Clock class="detail-icon" />
          <span>{{ card.duration }}</span>
        </div>
        <div v-if="card.location" class="detail-item">
          <MapPin class="detail-icon" />
          <span>{{ card.location }}</span>
        </div>
      </div>

      <button 
        class="book-btn" 
        :class="{ disabled: !localDate }"
        :disabled="!localDate" 
        @click.stop="book"
      >
        <Calendar class="btn-icon" />
        <span>{{ localDate ? 'Book Meeting' : 'Select Date First' }}</span>
      </button>
    </div>

    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <!-- Action indicator -->
    <div class="action-indicator">
      <ChevronRight class="chevron" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CalendarPlus, CalendarDays, Clock, MapPin, Calendar, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  card: { type: Object, required: true },
});

const localDate = ref(props.card.meetingDate || '');

const priorityClass = computed(() => {
  const p = (props.card.priority || '').toLowerCase();
  return {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low',
    urgent: 'priority-urgent',
  }[p] || 'priority-normal';
});

const emit = defineEmits(['book', 'open']);

function book() {
  if (!localDate.value) return;
  emit('book', { date: localDate.value, card: props.card });
}

function open() {
  emit('open');
}
</script>

<style scoped>
.meeting-card {
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

.meeting-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(251, 191, 36, 0.03) 0%, 
    rgba(245, 158, 11, 0.03) 50%,
    rgba(217, 119, 6, 0.03) 100%
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
    rgba(251, 191, 36, 0.08) 0%, 
    rgba(245, 158, 11, 0.05) 100%
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
    rgba(251, 191, 36, 0.4) 0%,
    rgba(245, 158, 11, 0.3) 50%,
    rgba(217, 119, 6, 0.4) 100%
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

.meeting-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(251, 191, 36, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(251, 191, 36, 0.3);
}

.meeting-card:hover::before {
  opacity: 1;
}

.meeting-card:hover .glass-overlay {
  opacity: 1;
}

.meeting-card:hover .glow-effect {
  opacity: 0.6;
}

.meeting-card:hover .action-indicator {
  opacity: 1;
  transform: translateX(0);
}

.meeting-card:hover .icon-wrapper {
  transform: rotate(8deg) scale(1.15);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.meeting-card:hover .circle-1,
.meeting-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
}

.meeting-card:active {
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
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
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
    color-mix(in srgb, var(--text-color) 80%, #fbbf24 20%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.priority {
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

.priority-high { 
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.priority-urgent { 
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  animation: urgent-pulse 2s ease-in-out infinite;
}
.priority-medium { 
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}
.priority-low { 
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.priority-normal { 
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
}

.date-picker-container {
  position: relative;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: rgba(251, 191, 36, 0.7);
  z-index: 1;
  pointer-events: none;
}

.date-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: var(--text-color);
  font-size: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.date-input:focus {
  outline: none;
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(251, 191, 36, 0.1);
}

.date-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.meeting-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-icon {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.7;
  flex-shrink: 0;
  color: rgba(251, 191, 36, 0.8);
}

.book-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.book-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.book-btn:active:not(.disabled) {
  transform: translateY(-1px);
}

.book-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.description { 
  font-size: 0.75rem;
  color: var(--text-color); 
  opacity: 0.8;
  margin: 0; 
  line-height: 1.4;
  text-align: center;
  position: relative;
  z-index: 3;
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
  color: rgba(251, 191, 36, 0.6);
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

@keyframes urgent-pulse {
  0%, 100% { 
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  }
  50% { 
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
  }
}

/* Size optimizations */
.mosaic-item-micro .card {
  padding: 0.5rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .header-left {
  gap: 0.375rem;
}

.mosaic-item-micro .icon-wrapper {
  padding: 0.25rem;
}

.mosaic-item-micro .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.mosaic-item-micro .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
  line-height: 1.2;
}

.mosaic-item-micro .description {
  font-size: 0.65rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .priority {
  font-size: 0.6rem;
  padding: 0.2rem 0.35rem;
}

.mosaic-item-micro .date-input {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  font-size: 0.7rem;
}

.mosaic-item-micro .input-icon {
  left: 0.5rem;
  width: 0.875rem;
  height: 0.875rem;
}

.mosaic-item-micro .book-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
}

/* Enhanced dark mode */
.dark .meeting-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .meeting-card:hover {
  box-shadow: 
    0 12px 32px rgba(251, 191, 36, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dark .glass-overlay {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.1) 0%, 
    rgba(251, 191, 36, 0.08) 100%
  );
}

.dark .date-input {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.dark .date-input:focus {
  background: rgba(0, 0, 0, 0.4);
}
</style>
