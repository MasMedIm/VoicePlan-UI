<template>
  <div class="card image-card" @click="open">
    <div class="image-container">
      <img :src="card.image_url" :alt="card.title || 'image'" class="card-image" />
      <div class="image-overlay"></div>
      <div class="image-gradient"></div>
    </div>
    
    <div class="card-content">
      <header class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <ImageIcon class="icon" />
          </div>
          <h3 class="title">{{ card.title }}</h3>
        </div>
        <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
      </header>
      
      <p v-if="card.description" class="description">{{ card.description }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  card: { type: Object, required: true },
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
.image-card {
  height: fit-content;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  background: var(--card-bg);
  overflow: hidden;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: fit-content;
}

.image-card:hover {
  transform: translateY(-2px) scale(1.005);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
}

.image-container {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

/* Dynamic height based on mosaic size - More aggressive sizing */
.mosaic-item-micro .image-container {
  height: 25px;
}

.mosaic-item-tiny .image-container {
  height: 30px;
}

.mosaic-item-small .image-container {
  height: 35px;
}

.mosaic-item-medium .image-container,
.mosaic-item-square .image-container {
  height: 50px;
}

.mosaic-item-large .image-container,
.mosaic-item-wide .image-container,
.mosaic-item-xl .image-container {
  height: 60px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  filter: brightness(1.05) contrast(1.02);
}

.image-card:hover .card-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 0, 0, 0.2) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-gradient {
  opacity: 1;
}

.card-content {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  position: relative;
  min-height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.icon-wrapper {
  padding: 0.2rem;
  border-radius: 5px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.image-card:hover .icon-wrapper {
  transform: rotate(-5deg) scale(1.1);
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
  color: var(--text-color);
  background: linear-gradient(135deg, 
    var(--text-color) 0%, 
    color-mix(in srgb, var(--text-color) 85%, #06b6d4 15%) 100%
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
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
  font-size: 0.65rem;
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
}

/* ===== Micro Size Optimizations ===== */
.mosaic-item-micro .card-content {
  padding: 0.35rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.25rem;
}

.mosaic-item-micro .title {
  font-size: 0.7rem;
}

.mosaic-item-micro .description {
  font-size: 0.55rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .icon {
  width: 0.7rem;
  height: 0.7rem;
}

.mosaic-item-micro .icon-wrapper {
  padding: 0.15rem;
}

.mosaic-item-micro .status {
  font-size: 0.55rem;
  padding: 0.15rem 0.3rem;
}

/* ===== Tiny Size Optimizations ===== */
.mosaic-item-tiny .card-content {
  padding: 0.4rem;
}

.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .description {
  font-size: 0.6rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .icon {
  width: 0.75rem;
  height: 0.75rem;
}

/* ===== Enhanced Large Size Support ===== */
.mosaic-item-large .card-content,
.mosaic-item-xl .card-content {
  padding: 0.75rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 0.9rem;
  white-space: normal;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.75rem;
  -webkit-line-clamp: 3;
}

.mosaic-item-large .icon,
.mosaic-item-xl .icon {
  width: 1rem;
  height: 1rem;
}

/* Special handling for wide cards - Horizontal layout */
.mosaic-item-wide {
  flex-direction: row;
}

.mosaic-item-wide .image-container {
  width: 35%;
  height: 100%;
}

.mosaic-item-wide .card-content {
  width: 65%;
}

/* Dark mode adjustments */
.dark .image-container {
  background: linear-gradient(135deg, #1e293b, #334155);
}

.dark .card-image {
  filter: brightness(0.9) contrast(1.1);
}

.dark .image-card:hover .card-image {
  filter: brightness(1) contrast(1.1);
}
</style>
