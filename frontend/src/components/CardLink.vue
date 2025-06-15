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
  text-align:left;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  max-width: 320px;
  width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 20px 24px;
}


.link { display:flex;align-items:center;gap:8px;text-decoration:none; }
.icon{width:18px;height:18px;color:#3b82f6;flex-shrink:0;}

.favicon { width: 20px; height: 20px; }
.title { font-size: 1.25rem; font-weight: 600; color: #2563eb; }

.description { font-size: 0.85rem; color: #555; margin-top: 6px; }
</style>
