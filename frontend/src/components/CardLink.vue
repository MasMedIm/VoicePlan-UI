<template>
  <div class="card link-card" @click="open">
    <div class="card-backdrop"></div>
    
    <div class="link-container">
      <a :href="card.url" target="_blank" rel="noopener" class="link-preview" @click.stop>
        <div class="link-header">
          <div class="icon-favicon-wrapper">
            <div class="icon-wrapper">
              <LinkIcon class="icon" />
            </div>
            <div v-if="favicon" class="favicon-container">
              <img :src="favicon" class="favicon" @error="onFaviconError" />
            </div>
          </div>
          
          <div class="link-info">
            <div class="link-title">{{ card.title || extractDomain(card.url) }}</div>
            <div class="link-url">{{ displayUrl }}</div>
          </div>
          
          <div class="external-indicator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18,13v6a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </div>
        
        <div v-if="card.description" class="link-description">
          {{ card.description }}
        </div>
      </a>
    </div>
    
    <div class="link-glow"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const faviconError = ref(false);

const favicon = computed(() => {
  if (faviconError.value) return null;
  try {
    const url = new URL(props.card.url);
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${url.origin}`;
  } catch (_) {
    return null;
  }
});

const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (_) {
    return url;
  }
};

const displayUrl = computed(() => {
  return extractDomain(props.card.url);
});

const onFaviconError = () => {
  faviconError.value = true;
};

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.link-card {
  height: fit-content;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border-color);
  border-radius: 8px;
  background: var(--card-bg);
  padding: 0.5rem;
  color: var(--text-color);
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: fit-content;
}

.link-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.02) 0%, 
    rgba(139, 92, 246, 0.02) 50%,
    rgba(6, 182, 212, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.link-card:hover::before {
  opacity: 1;
}

.link-card:hover {
  transform: translateY(-1px) scale(1.005);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.link-card:hover .link-glow {
  opacity: 0.3;
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

.link-card:hover .card-backdrop {
  opacity: 1;
}

.link-container {
  flex: 1;
  position: relative;
  z-index: 2;
}

.link-preview { 
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none; 
  color: inherit;
  transition: all 0.2s ease;
}

.link-preview:hover {
  color: inherit;
}

.link-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.icon-favicon-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.icon-wrapper {
  padding: 0.2rem;
  border-radius: 5px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.link-card:hover .icon-wrapper {
  transform: rotate(-5deg) scale(1.1);
}

.icon {
  width: 0.8rem;
  height: 0.8rem;
  color: white;
  stroke-width: 2.5;
}

.favicon-container {
  width: 1rem;
  height: 1rem;
  border-radius: 3px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.link-card:hover .favicon-container {
  transform: scale(1.1);
}

.favicon { 
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title { 
  font-size: 0.8rem;
  font-weight: 600; 
  margin: 0 0 0.2rem 0;
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

.link-url {
  font-size: 0.6rem;
  color: #3b82f6;
  font-weight: 500;
  text-transform: lowercase;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.link-preview:hover .link-url {
  opacity: 1;
}

.external-indicator {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-color);
  opacity: 0.4;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.link-preview:hover .external-indicator {
  opacity: 0.7;
  transform: translate(1px, -1px);
}

.link-description { 
  font-size: 0.65rem;
  color: var(--text-color); 
  opacity: 0.85;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex-grow: 1;
}

.link-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.3) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(6, 182, 212, 0.3) 100%
  );
  border-radius: 14px;
  opacity: 0;
  z-index: -1;
  filter: blur(8px);
  transition: opacity 0.3s ease;
}

/* ===== Micro Size Optimizations ===== */
.mosaic-item-micro .link-card {
  padding: 0.35rem;
}

.mosaic-item-micro .link-header {
  gap: 0.3rem;
  margin-bottom: 0.3rem;
}

.mosaic-item-micro .icon-favicon-wrapper {
  gap: 0.2rem;
}

.mosaic-item-micro .link-title {
  font-size: 0.7rem;
  -webkit-line-clamp: 1;
  margin-bottom: 0.1rem;
}

.mosaic-item-micro .link-description {
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

.mosaic-item-micro .favicon-container {
  width: 0.8rem;
  height: 0.8rem;
}

.mosaic-item-micro .external-indicator {
  width: 0.75rem;
  height: 0.75rem;
}

.mosaic-item-micro .link-url {
  font-size: 0.55rem;
}

/* ===== Tiny Size Optimizations ===== */
.mosaic-item-tiny .link-header {
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.mosaic-item-tiny .link-title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .link-description {
  font-size: 0.6rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-tiny .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.mosaic-item-tiny .favicon-container {
  width: 0.9rem;
  height: 0.9rem;
}

.mosaic-item-tiny .external-indicator {
  width: 0.8rem;
  height: 0.8rem;
}

/* ===== Enhanced Large Size Support ===== */
.mosaic-item-large .link-title,
.mosaic-item-xl .link-title {
  font-size: 0.9rem;
  -webkit-line-clamp: 2;
}

.mosaic-item-large .link-description,
.mosaic-item-xl .link-description {
  font-size: 0.75rem;
  -webkit-line-clamp: 3;
}

.mosaic-item-large .icon,
.mosaic-item-xl .icon {
  width: 1rem;
  height: 1rem;
}

.mosaic-item-large .favicon-container,
.mosaic-item-xl .favicon-container {
  width: 1.25rem;
  height: 1.25rem;
}

.mosaic-item-large .external-indicator,
.mosaic-item-xl .external-indicator {
  width: 1rem;
  height: 1rem;
}

/* Dark mode adjustments */
.dark .favicon-container {
  background: #374151;
}

.dark .link-url {
  color: #60a5fa;
}
</style>
