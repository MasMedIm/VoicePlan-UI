<template>
  <div class="card meeting-card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <CalendarPlus class="icon" />
        <h3 class="title">{{ card.title }}</h3>
      </div>
    </header>

    <div class="content">
      <div class="relative max-w-sm w-full">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
          <CalendarDays class="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          v-model="localDate"
          datepicker
          id="meeting-datepicker"
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-accent focus:border-accent block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Select date"
          @click.stop
        />
      </div>
      <button class="book-btn" :disabled="!localDate" @click.stop="book">
        Book Meeting
      </button>
    </div>

    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CalendarPlus, CalendarDays } from 'lucide-vue-next';

const props = defineProps({
  card: { type: Object, required: true },
});

const localDate = ref(props.card.meetingDate || '');

const emit = defineEmits(['book', 'open']);

function book() {
  emit('book', localDate.value);
}

function open() {
  emit('open');
}
</script>

<style scoped>
.card {
  text-align: left;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px 24px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  width: 18px;
  height: 18px;
  color: #ff8800;
  flex-shrink: 0;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.label {
  font-size: 0.85rem;
  color: #555;
}

.book-btn {
  align-self: flex-start;
  background: #ff8800;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
}

.book-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.description {
  font-size: 0.85rem;
  color: #555;
  margin-top: 6px;
}
</style>
