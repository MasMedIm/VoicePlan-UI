<template>
  <div class="card link-card" @click="open">
    <a :href="card.url" target="_blank" rel="noopener" class="link">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"/><path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"/></svg>
      <img v-if="favicon" :src="favicon" class="favicon" />
      <span class="title">{{ card.title || card.url }}</span>
    </a>
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const favicon = computed(() => {
  try {
    const url = new URL(props.card.url);
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${url.origin}`;
  } catch (_) {
    return null;
  }
});

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  color: var(--text-color);
}

.link { 
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none; 
  margin-bottom: 0.5rem;
}

.icon{
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.favicon { 
  width: 1rem; 
  height: 1rem; 
  border-radius: 2px;
}

.title { 
  font-size: 0.875rem; 
  font-weight: 600; 
  color: #2563eb; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
}

.description { 
  font-size: 0.75rem; 
  color: var(--text-color); 
  opacity: 0.8;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex-grow: 1;
}

/* Responsive adjustments */
.mosaic-item-tiny .title {
  font-size: 0.75rem;
}

.mosaic-item-tiny .description {
  font-size: 0.625rem;
  -webkit-line-clamp: 2;
}

.mosaic-item-large .title,
.mosaic-item-xl .title {
  font-size: 1rem;
}

.mosaic-item-large .description,
.mosaic-item-xl .description {
  font-size: 0.875rem;
  -webkit-line-clamp: 4;
}
</style>
