<template>
  <div class="card date-card">
    <h3 class="title">{{ card.title }}</h3>
    <p class="countdown" :class="{ past: daysLeft < 0 }">
      <template v-if="daysLeft > 1">{{ daysLeft }} days left</template>
      <template v-else-if="daysLeft === 1">1 day left</template>
      <template v-else-if="daysLeft === 0">Today!</template>
      <template v-else>{{ Math.abs(daysLeft) }} days ago</template>
    </p>
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: { type: Object, required: true },
});

const daysLeft = computed(() => {
  if (!props.card.date) return 0;
  const target = new Date(props.card.date);
  const now = new Date();
  const diffMs = target.setHours(0,0,0,0) - now.setHours(0,0,0,0);
  return Math.round(diffMs / 86400000); // ms in day
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
  text-align: center;
}

.title { font-size: 1rem; font-weight: 600; margin: 0 0 6px; }

.countdown { font-size: 1.25rem; margin: 0; color: #2563eb; font-weight: 600; }
.countdown.past { color: #c2410c; }

.description { font-size: 0.85rem; color: #555; margin-top: 6px; }
</style>
