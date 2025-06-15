<!-- CardGoal Vue Component -->

<template>
  <div class="card goal-card">
    <div class="card-header">
      <h3 class="card-title">{{ card.title || 'Goal' }}</h3>
    </div>
    <div class="card-content">
      <div v-if="card.description" class="goal-description">
        {{ card.description }}
      </div>
      <div v-if="card.target" class="goal-target">
        <span class="goal-label">Target:</span>
        <span class="goal-value">{{ card.target }}</span>
      </div>
      <div v-if="card.progress !== undefined" class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${Math.min(card.progress, 100)}%` }"></div>
        </div>
        <span class="progress-text">{{ card.progress }}% Complete</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.goal-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.goal-description {
  margin-bottom: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
}

.goal-target {
  margin-bottom: 0.75rem;
}

.goal-label {
  font-weight: 500;
  color: #475569;
  margin-right: 0.5rem;
}

.goal-value {
  color: #1e293b;
  font-weight: 600;
}

.goal-progress {
  margin-top: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Dark mode support */
.dark .goal-card {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .card-title {
  color: #f1f5f9;
}

.dark .goal-description {
  color: #cbd5e1;
}

.dark .goal-label {
  color: #e2e8f0;
}

.dark .goal-value {
  color: #f1f5f9;
}

.dark .progress-text {
  color: #cbd5e1;
}
</style>
