<template>
  <div class="card checklist-card" @click="open">
    <!-- Glassmorphism overlay -->
    <div class="glass-overlay"></div>
    
    <!-- Animated glow effect -->
    <div class="glow-effect"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    
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
              stroke="rgba(255, 255, 255, 0.2)"
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
    
    <!-- Action indicator -->
    <div class="action-indicator">
      <ChevronRight class="chevron" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ListTodo, ChevronRight } from 'lucide-vue-next';

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

.checklist-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.03) 0%, 
    rgba(34, 197, 94, 0.03) 50%,
    rgba(59, 130, 246, 0.03) 100%
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
    rgba(16, 185, 129, 0.08) 0%, 
    rgba(34, 197, 94, 0.05) 100%
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
    rgba(16, 185, 129, 0.4) 0%,
    rgba(34, 197, 94, 0.3) 50%,
    rgba(59, 130, 246, 0.4) 100%
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
  background: rgba(16, 185, 129, 0.1);
  filter: blur(40px);
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.circle-1 {
  width: 5rem;
  height: 5rem;
  top: -2.5rem;
  right: -2.5rem;
  background: rgba(16, 185, 129, 0.08);
}

.circle-2 {
  width: 7rem;
  height: 7rem;
  bottom: -3.5rem;
  left: -3.5rem;
  background: rgba(34, 197, 94, 0.08);
}

.checklist-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(16, 185, 129, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
}

.checklist-card:hover::before {
  opacity: 1;
}

.checklist-card:hover .glass-overlay {
  opacity: 1;
}

.checklist-card:hover .glow-effect {
  opacity: 0.6;
}

.checklist-card:hover .action-indicator {
  opacity: 1;
  transform: translateX(0);
}

.checklist-card:hover .icon-wrapper {
  transform: rotate(8deg) scale(1.15);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.checklist-card:hover .circle-1,
.checklist-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
}

.checklist-card:active {
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
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
  animation: completed-glow 2s ease-in-out infinite;
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
    color-mix(in srgb, var(--text-color) 80%, #10b981 20%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
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
  transition: all 0.3s ease;
}

.progress-circle svg {
  transform: rotate(-90deg);
  position: absolute;
}

.progress-stroke {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 4px currentColor);
}

.progress-text {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-color);
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.items-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
  max-height: 150px;
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
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
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
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
}

.checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.checkbox-checkmark {
  width: 0.75rem;
  height: 0.75rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
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
  opacity: 0.9;
}

.item-text.completed { 
  text-decoration: line-through; 
  opacity: 0.7;
  color: #10b981;
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
  color: rgba(16, 185, 129, 0.6);
  animation: float 2s ease-in-out infinite;
}

.completion-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, 
    rgba(16, 185, 129, 0.4) 0%,
    rgba(34, 197, 94, 0.3) 50%,
    rgba(59, 130, 246, 0.4) 100%
  );
  border-radius: 20px;
  opacity: 0;
  z-index: -1;
  filter: blur(12px);
  transition: opacity 0.4s ease;
}

.completion-glow.active {
  opacity: 0.8;
  animation: completion-pulse 2s ease-in-out infinite;
}

/* Celebration animation */
.checklist-card.celebration {
  animation: celebrate 0.6s ease-out;
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

@keyframes completed-glow {
  0%, 100% { 
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  }
  50% { 
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  }
}

@keyframes completion-pulse {
  0%, 100% { 
    opacity: 0.8;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes celebrate {
  0%, 100% { transform: translateY(-8px) scale(1.02); }
  25% { transform: translateY(-12px) scale(1.04); }
  50% { transform: translateY(-8px) scale(1.03); }
  75% { transform: translateY(-10px) scale(1.035); }
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

.mosaic-item-micro .progress-circle {
  width: 24px;
  height: 24px;
}

.mosaic-item-micro .progress-text {
  font-size: 0.55rem;
}

.mosaic-item-micro .checkbox-custom {
  width: 1rem;
  height: 1rem;
}

.mosaic-item-micro .checkbox-checkmark {
  width: 0.625rem;
  height: 0.625rem;
}

.mosaic-item-micro .item-text {
  font-size: 0.65rem;
}

.mosaic-item-micro .items {
  gap: 0.25rem;
}

/* Enhanced dark mode */
.dark .checklist-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .checklist-card:hover {
  box-shadow: 
    0 12px 32px rgba(16, 185, 129, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dark .glass-overlay {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.1) 0%, 
    rgba(16, 185, 129, 0.08) 100%
  );
}
</style>
