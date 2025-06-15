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
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border-color);
  border-radius: 12px;
  background: var(--card-bg);
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

/* Dynamic height based on mosaic size */
.mosaic-item-tiny .image-container {
  height: 40px;
}

.mosaic-item-small .image-container {
  height: 50px;
}

.mosaic-item-medium .image-container,
.mosaic-item-square .image-container {
  height: 80px;
}

.mosaic-item-large .image-container,
.mosaic-item-wide .image-container,
.mosaic-item-xl .image-container {
  height: 100px;
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
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  position: relative;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
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
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
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
}

/* Enhanced responsive adjustments */
.mosaic-item-tiny .card-content {
  padding: 0.5rem;
}

.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .description {
  font-size: 0.625rem;
  -webkit-line-clamp: 2;
}

.mosaic-item-tiny .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.mosaic-item-large .card-content,
.mosaic-item-xl .card-content {
  padding: 1rem;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
  white-space: normal;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.875rem;
  -webkit-line-clamp: 4;
}

.mosaic-item-large .icon,
.mosaic-item-xl .icon {
  width: 1rem;
  height: 1rem;
}

/* Special handling for wide cards */
.mosaic-item-wide {
  flex-direction: row;
}

.mosaic-item-wide .image-container {
  width: 40%;
  height: 100%;
}

.mosaic-item-wide .card-content {
  width: 60%;
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
