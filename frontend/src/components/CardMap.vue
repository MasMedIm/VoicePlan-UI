<template>
  <div class="card map-card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        <h3 class="title">{{ card.title }}</h3>
      </div>
      <span v-if="card.status" class="status" :class="statusClass">{{ card.status }}</span>
    </header>
    
    <div class="map-content">
      <div v-if="card.location" class="location-info">
        <div class="location-primary">
          <svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="location-name">{{ card.location.name }}</span>
        </div>
        <div v-if="card.location.address" class="location-address">
          {{ card.location.address }}
        </div>
      </div>
      
      <div v-if="card.route" class="route-info">
        <div class="route-header">
          <svg class="route-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="6" cy="19" r="3"/>
            <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
          </svg>
          <span class="route-label">Route</span>
        </div>
        <div class="route-details">
          <div class="route-item">
            <span class="route-metric">{{ card.route.distance }}</span>
            <span class="route-label-small">distance</span>
          </div>
          <div class="route-divider">•</div>
          <div class="route-item">
            <span class="route-metric">{{ card.route.duration }}</span>
            <span class="route-label-small">travel time</span>
          </div>
          <div v-if="card.route.traffic" class="route-divider">•</div>
          <div v-if="card.route.traffic" class="route-item">
            <span class="route-metric" :class="getTrafficClass(card.route.traffic)">
              {{ card.route.traffic }}
            </span>
            <span class="route-label-small">traffic</span>
          </div>
        </div>
      </div>
      
      <div v-if="card.transportation" class="transportation">
        <div class="transport-options">
          <div 
            v-for="option in card.transportation" 
            :key="option.type"
            class="transport-option"
            :class="{ active: option.recommended }"
          >
            <div class="transport-icon">
              <svg v-if="option.type === 'car'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 9.6a2 2 0 0 0-1.8-1.2H7.4a2 2 0 0 0-1.8 1.2L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
              <svg v-else-if="option.type === 'train'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="6" y="8" width="4" height="4" rx="1"/>
                <rect x="14" y="8" width="4" height="4" rx="1"/>
                <path d="M6 18h12"/>
                <path d="M10 22l-2-2"/>
                <path d="M14 22l2-2"/>
              </svg>
              <svg v-else-if="option.type === 'plane'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="transport-details">
              <div class="transport-type">{{ option.type.charAt(0).toUpperCase() + option.type.slice(1) }}</div>
              <div class="transport-time">{{ option.time }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="card.landmarks" class="landmarks">
        <h4 class="landmarks-title">Nearby</h4>
        <div class="landmarks-list">
          <div 
            v-for="landmark in card.landmarks.slice(0, 3)" 
            :key="landmark.name"
            class="landmark-item"
          >
            <span class="landmark-name">{{ landmark.name }}</span>
            <span class="landmark-distance">{{ landmark.distance }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <p v-if="card.description" class="description">{{ card.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const statusClass = computed(() => {
  const s = (props.card.status || '').toLowerCase();
  return {
    todo: 'status-todo',
    in_progress: 'status-in-progress',
    done: 'status-done',
  }[s] || 'status-generic';
});

const getTrafficClass = (traffic) => {
  const level = traffic.toLowerCase();
  if (level.includes('heavy') || level.includes('congested')) return 'traffic-heavy';
  if (level.includes('moderate') || level.includes('medium')) return 'traffic-moderate';
  return 'traffic-light';
};

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.map-card {
  background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.map-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.map-card > * {
  position: relative;
  z-index: 1;
}

.card {
  text-align: left;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px 24px;
  background: #fff;
  max-width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}

.icon { 
  width: 20px; 
  height: 20px; 
  color: rgba(255, 255, 255, 0.9); 
  flex-shrink: 0; 
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
}

.status {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.map-content {
  margin-bottom: 16px;
}

.location-info {
  margin-bottom: 16px;
}

.location-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.location-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.location-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.location-address {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 24px;
}

.route-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.route-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.route-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.route-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.route-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.route-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.route-metric {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.route-metric.traffic-heavy {
  color: #ff6b6b;
}

.route-metric.traffic-moderate {
  color: #feca57;
}

.route-metric.traffic-light {
  color: #48dbfb;
}

.route-label-small {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
}

.route-divider {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.transportation {
  margin-bottom: 16px;
}

.transport-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.transport-option {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.transport-option.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.transport-icon {
  width: 14px;
  height: 14px;
}

.transport-icon svg {
  width: 100%;
  height: 100%;
}

.transport-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.transport-type {
  font-weight: 600;
  line-height: 1;
}

.transport-time {
  font-size: 0.7rem;
  opacity: 0.8;
  line-height: 1;
}

.landmarks {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.landmarks-title {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.landmarks-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.landmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.landmark-name {
  color: white;
  font-weight: 500;
}

.landmark-distance {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* Dark mode adjustments */
.dark .map-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style> 