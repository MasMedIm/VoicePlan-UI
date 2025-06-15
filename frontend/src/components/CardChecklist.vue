<template>
  <div class="card checklist-card" @click="open">
    <div class="card-backdrop"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper" :class="progressClass">
          <ListTodo class="icon" />
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <div class="progress-indicator">
        <div class="progress-circle" :class="progressClass">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="rgba(59, 130, 246, 0.2)"
              stroke-width="3"
              fill="none"
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              :stroke="progressColor"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-dasharray="75.4"
              :stroke-dashoffset="progressOffset"
              class="progress-stroke"
            />
          </svg>
          <span class="progress-text">{{ progressText }}</span>
        </div>
      </div>
    </header>

    <div class="items-container">
      <ul class="items">
        <li v-for="(it, idx) in localItems" :key="idx" class="item" :class="{ completed: it.checked }">
          <div class="checkbox-container">
            <input 
              type="checkbox" 
              v-model="it.checked" 
              :id="`item-${idx}`"
              class="checkbox-input"
              @change="onItemToggle"
            />
            <label :for="`item-${idx}`" class="checkbox-custom">
              <div class="checkbox-checkmark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
            </label>
          </div>
          <span class="item-text" :class="{ completed: it.checked }">{{ it.text }}</span>
        </li>
      </ul>
    </div>

    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <div class="completion-glow" :class="{ active: isCompleted }"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

// Clone items locally so we can mutate without mutating props directly
const localItems = ref(props.card.items ? props.card.items.map(it => ({ ...it })) : []);

const counts = computed(() => {
  const total = localItems.value.length;
  const done = localItems.value.filter(i => i.checked).length;
  return { total, done };
});

const progressText = computed(() => {
  if (!counts.value.total) return '0';
  return `${counts.value.done}/${counts.value.total}`;
});

const progressPercentage = computed(() => {
  if (!counts.value.total) return 0;
  return (counts.value.done / counts.value.total) * 100;
});

const progressOffset = computed(() => {
  const circumference = 75.4; // 2 * π * 12
  return circumference - (progressPercentage.value / 100) * circumference;
});

const progressClass = computed(() => {
  const percentage = progressPercentage.value;
  if (percentage === 100) return 'completed';
  if (percentage >= 75) return 'almost-done';
  if (percentage >= 50) return 'halfway';
  if (percentage >= 25) return 'started';
  return 'not-started';
});

const progressColor = computed(() => {
  const percentage = progressPercentage.value;
  if (percentage === 100) return '#10b981';
  if (percentage >= 75) return '#3b82f6';
  if (percentage >= 50) return '#8b5cf6';
  if (percentage >= 25) return '#f59e0b';
  return '#6b7280';
});

const isCompleted = computed(() => {
  return counts.value.total > 0 && counts.value.done === counts.value.total;
});

const onItemToggle = () => {
  // Add a small delay for animation
  setTimeout(() => {
    if (isCompleted.value) {
      // Trigger completion celebration
      const card = document.querySelector('.checklist-card');
      card?.classList.add('celebration');
      setTimeout(() => {
        card?.classList.remove('celebration');
      }, 600);
    }
  }, 100);
};

const emit = defineEmits(['open']);

function open() {
  emit('open');
}
</script>

<style scoped>
.checklist-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border-color);
  border-radius: 12px;
  background: var(--card-bg);
  padding: 0.75rem;
  color: var(--text-color);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.checklist-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.02) 0%, 
    rgba(139, 92, 246, 0.02) 50%,
    rgba(16, 185, 129, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.checklist-card:hover::before {
  opacity: 1;
}

.checklist-card:hover {
  transform: translateY(-1px) scale(1.005);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.card-backdrop {
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

.checklist-card:hover .card-backdrop {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  min-width: 0;
}

.icon-wrapper {
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.icon-wrapper.not-started {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.icon-wrapper.started {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.icon-wrapper.halfway {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.icon-wrapper.almost-done {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.icon-wrapper.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.checklist-card:hover .icon-wrapper {
  transform: rotate(5deg) scale(1.1);
}

.icon { 
  width: 0.875rem; 
  height: 0.875rem; 
  color: white;
  stroke-width: 2.5;
}

.title { 
  font-size: 0.875rem; 
  font-weight: 600; 
  margin: 0; 
  line-height: 1.3;
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

.progress-indicator {
  flex-shrink: 0;
}

.progress-circle {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle svg {
  transform: rotate(-90deg);
  position: absolute;
}

.progress-stroke {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-text {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-color);
  position: relative;
  z-index: 1;
}

.items-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: rgba(59, 130, 246, 0.02);
  border: 1px solid transparent;
}

.item:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.1);
  transform: translateX(2px);
}

.item.completed {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.1);
}

.checkbox-container {
  position: relative;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.checkbox-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--card-bg);
}

.checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  transform: scale(1.05);
}

.checkbox-checkmark {
  width: 0.75rem;
  height: 0.75rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.checkbox-checkmark svg {
  width: 100%;
  height: 100%;
  color: white;
}

.checkbox-input:checked + .checkbox-custom .checkbox-checkmark {
  opacity: 1;
  transform: scale(1);
}

.item-text {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text-color);
  transition: all 0.3s ease;
  flex-grow: 1;
}

.item-text.completed { 
  text-decoration: line-through; 
  opacity: 0.6;
  color: #10b981;
}

.description { 
  font-size: 0.75rem; 
  color: var(--text-color); 
  opacity: 0.8;
  margin: 0; 
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  position: relative;
  z-index: 2;
}

.completion-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #10b981, #34d399);
  border-radius: 14px;
  opacity: 0;
  z-index: -1;
  filter: blur(8px);
  transition: opacity 0.3s ease;
}

.completion-glow.active {
  opacity: 0.4;
}

/* Celebration animation */
.checklist-card.celebration {
  animation: celebrate 0.6s ease-out;
}

@keyframes celebrate {
  0%, 100% { transform: translateY(-1px) scale(1.005); }
  25% { transform: translateY(-3px) scale(1.02); }
  50% { transform: translateY(-1px) scale(1.01); }
  75% { transform: translateY(-2px) scale(1.015); }
}

/* Enhanced responsive adjustments */
.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .item-text {
  font-size: 0.625rem;
}

.mosaic-item-tiny .progress-circle {
  width: 24px;
  height: 24px;
}

.mosaic-item-tiny .progress-text {
  font-size: 0.5rem;
}

.mosaic-item-tiny .checkbox-custom {
  width: 1rem;
  height: 1rem;
}

.mosaic-item-tiny .checkbox-checkmark {
  width: 0.625rem;
  height: 0.625rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .item-text,
.mosaic-item-xl .item-text {
  font-size: 0.875rem;
}

.mosaic-item-large .progress-circle,
.mosaic-item-xl .progress-circle {
  width: 40px;
  height: 40px;
}

.mosaic-item-large .progress-text,
.mosaic-item-xl .progress-text {
  font-size: 0.75rem;
}
</style>
