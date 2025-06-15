<template>
  <div class="card link-card" @click="open">
    <a :href="card.url" target="_blank" rel="noopener" class="link">
      <LinkIcon class="icon" />
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


.link { display:flex;align-items:center;gap:10px;text-decoration:none; }
.icon{width:18px;height:18px;color:#ff8800;flex-shrink:0;}

.favicon { width: 20px; height: 20px; }


.title { font-size: 1.25rem; font-weight: 600; color: #ff8800; margin-top: 6px; }
.description { font-size: 0.85rem; color: #555; margin-top: 6px; }
</style>
