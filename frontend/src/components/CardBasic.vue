<template>
  <div class="card basic-card" @click="open">
    <!-- Glassmorphism overlay -->
    <div class="glass-overlay"></div>
    
    <!-- Animated glow effect -->
    <div class="glow-effect"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper">
          <Book class="icon" />
        </div>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    <p v-if="card.description" class="description">{{ card.description }}</p>
    
    <!-- Action indicator -->
    <div class="action-indicator">
      <ChevronRight class="chevron" />
    </div>
  </div>
</template>

<script setup>
import { Book, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

import { computed } from 'vue';

const statusClass = computed(() => {
  const s = (props.card.status || '').toLowerCase();
  return {
    todo: 'status-todo',
    in_progress: 'status-in-progress',
    done: 'status-done',
  }[s] || 'status-generic';
});

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.basic-card {
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

.basic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.03) 0%, 
    rgba(139, 92, 246, 0.03) 50%,
    rgba(236, 72, 153, 0.03) 100%
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
    rgba(59, 130, 246, 0.08) 0%, 
    rgba(139, 92, 246, 0.05) 100%
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
    rgba(59, 130, 246, 0.4) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(236, 72, 153, 0.4) 100%
  );
  border-radius: 18px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  filter: blur(12px);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.basic-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(59, 130, 246, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.basic-card:hover::before {
  opacity: 1;
}

.basic-card:hover .glass-overlay {
  opacity: 1;
}

.basic-card:hover .glow-effect {
  opacity: 0.6;
}

.basic-card:hover .action-indicator {
  opacity: 1;
  transform: translateX(0);
}

.basic-card:hover .icon-wrapper {
  transform: rotate(8deg) scale(1.15);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.basic-card:active {
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
  align-items: flex-start;
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
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
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
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.status-done { 
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.status-generic { 
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  color: rgba(59, 130, 246, 0.6);
  animation: float 2s ease-in-out infinite;
}

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

/* Size optimizations remain the same but with updated padding */
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

.mosaic-item-micro .status {
  font-size: 0.6rem;
  padding: 0.2rem 0.35rem;
}

/* Enhanced dark mode */
.dark .basic-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .basic-card:hover {
  box-shadow: 
    0 12px 32px rgba(59, 130, 246, 0.2),
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
