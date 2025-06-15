<template>
  <div class="card basic-card" @click="open">
    <div class="card-backdrop"></div>
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
    <div class="card-glow"></div>
  </div>
</template>

<script setup>
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
  background: linear-gradient(135deg, 
    var(--card-bg) 0%, 
    color-mix(in srgb, var(--card-bg) 95%, #3b82f6 5%) 100%
  );
  border: 1px solid var(--card-border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.basic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.02) 0%, 
    rgba(139, 92, 246, 0.02) 50%,
    rgba(236, 72, 153, 0.02) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.basic-card:hover {
  transform: translateY(-1px) scale(1.005);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.15),
    0 2px 10px rgba(0, 0, 0, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.basic-card:hover .card-glow {
  opacity: 1;
}

.card-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.basic-card:hover .card-backdrop {
  opacity: 1;
}

.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.3) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(236, 72, 153, 0.3) 100%
  );
  border-radius: 10px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  filter: blur(8px);
}

.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-color);
  position: relative;
  z-index: 1;
}

.card-header {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.basic-card:hover .icon-wrapper {
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  background: linear-gradient(135deg, 
    var(--text-color) 0%, 
    color-mix(in srgb, var(--text-color) 85%, #3b82f6 15%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status {
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  color: #fff;
  flex-shrink: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.status:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.status-todo { 
  background: linear-gradient(135deg, #737373, #525252);
}
.status-in-progress { 
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}
.status-done { 
  background: linear-gradient(135deg, #16a34a, #15803d);
}
.status-generic { 
  background: linear-gradient(135deg, #52525b, #3f3f46);
}

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.85;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  position: relative;
  z-index: 2;
}

/* Enhanced responsive adjustments */
.mosaic-item-tiny .card {
  padding: 0.5rem;
}

.mosaic-item-tiny .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .description {
  font-size: 0.625rem;
  -webkit-line-clamp: 2;
}

.mosaic-item-tiny .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.mosaic-item-large .card,
.mosaic-item-xl .card {
  padding: 1rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.875rem;
  -webkit-line-clamp: 5;
}

.mosaic-item-large .icon,
.mosaic-item-xl .icon {
  width: 1rem;
  height: 1rem;
}

/* Dark mode enhancements */
.dark .basic-card {
  background: linear-gradient(135deg, 
    var(--card-bg) 0%, 
    color-mix(in srgb, var(--card-bg) 95%, #6366f1 5%) 100%
  );
}

.dark .basic-card::before {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.03) 0%, 
    rgba(168, 85, 247, 0.03) 50%,
    rgba(236, 72, 153, 0.03) 100%
  );
}
</style>
