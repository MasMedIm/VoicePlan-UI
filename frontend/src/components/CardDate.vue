<template>
  <div class="card date-card" @click="open">
    <div class="header-left"><CalendarDays class="icon" />
<h3 class="title">{{ card.title }}</h3></div>
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

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  max-width: 320px;
  width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 20px 24px;
  text-align: left;
}

.title { font-size: 1.25rem; font-weight: 600; margin: 0 0 6px; }

.header-left{display:flex;align-items:center;gap:6px;}
.icon{width:18px;height:18px;color:#3b82f6;flex-shrink:0;}

.countdown { font-size: 1.25rem; margin: 0; color: #2563eb; font-weight: 600; }
.countdown.past { color: #c2410c; }

.description { font-size: 0.85rem; color: #555; margin-top: 6px; }
</style>
