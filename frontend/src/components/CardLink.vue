<template>
  <div class="card link-card">
    <a :href="card.url" target="_blank" rel="noopener" class="link">
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
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 12px 14px;
}

.link { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.favicon { width: 20px; height: 20px; }
.title { font-size: 1rem; font-weight: 600; color: #2563eb; }
.description { font-size: 0.85rem; color: #555; margin-top: 6px; }
</style>
