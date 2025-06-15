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
    color-mix(in srgb, var(--card-bg) 96%, #3b82f6 4%) 100%
  );
  border: 1px solid var(--card-border-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  min-height: fit-content;
}

.basic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.015) 0%, 
    rgba(139, 92, 246, 0.015) 50%,
    rgba(236, 72, 153, 0.015) 100%
  );
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.basic-card:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: rgba(59, 130, 246, 0.4);
}

.basic-card:hover .card-glow {
  opacity: 1;
}

.basic-card:active {
  transform: translateY(0) scale(0.99);
  transition: transform 0.1s ease-out;
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
  border-radius: 6px;
  padding: 0.5rem;
  color: var(--text-color);
  position: relative;
  z-index: 1;
  min-height: 0;
}

.card-header {
  margin-bottom: 0.5rem;
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
  gap: 0.375rem;
  min-width: 0;
  flex: 1;
}

.icon-wrapper {
  padding: 0.2rem;
  border-radius: 5px;
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
  font-size: 0.6rem;
  padding: 0.2rem 0.4rem;
  border-radius: 5px;
  color: #fff;
  flex-shrink: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.status:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
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
  font-size: 0.7rem;
  color: var(--text-color);
  opacity: 0.85;
  margin: 0;
  line-height: 1.3;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  position: relative;
  z-index: 2;
}

/* ===== Micro Size Optimizations ===== */
.mosaic-item-micro .card {
  padding: 0.35rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.25rem;
}

.mosaic-item-micro .header-left {
  gap: 0.25rem;
}

.mosaic-item-micro .icon-wrapper {
  padding: 0.15rem;
}

.mosaic-item-micro .icon {
  width: 0.7rem;
  height: 0.7rem;
}

.mosaic-item-micro .title {
  font-size: 0.7rem;
  -webkit-line-clamp: 1;
  line-height: 1.2;
}

.mosaic-item-micro .description {
  font-size: 0.6rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .status {
  font-size: 0.55rem;
  padding: 0.15rem 0.3rem;
}

/* ===== Tiny Size Optimizations ===== */
.mosaic-item-tiny .card {
  padding: 0.4rem;
}

.mosaic-item-tiny .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .description {
  font-size: 0.65rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .icon {
  width: 0.75rem;
  height: 0.75rem;
}

/* ===== Large Size Enhancements ===== */
.mosaic-item-large .card,
.mosaic-item-xl .card {
  padding: 0.75rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 0.95rem;
  -webkit-line-clamp: 3;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.8rem;
  -webkit-line-clamp: 4;
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
