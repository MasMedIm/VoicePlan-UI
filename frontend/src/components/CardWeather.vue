<template>
  <div class="card weather-card" @click="open">
    <header class="card-header">
      <div class="header-left">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <h3 class="title">{{ card.title || 'Weather' }}</h3>
      </div>
      <span v-if="card.location" class="location">{{ card.location }}</span>
    </header>
    
    <div class="weather-content">
      <div class="current-weather">
        <div class="temperature">
          <span class="temp-value">{{ card.temperature || '--' }}</span>
          <span class="temp-unit">°{{ card.unit || 'C' }}</span>
        </div>
        <div class="weather-info">
          <div class="condition">{{ card.condition || 'Unknown' }}</div>
          <div class="feels-like" v-if="card.feelsLike">
            Feels like {{ card.feelsLike }}°{{ card.unit || 'C' }}
          </div>
        </div>
      </div>
      
      <div v-if="card.details" class="weather-details">
        <div class="detail-item" v-if="card.details.humidity">
          <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
          <span>{{ card.details.humidity }}%</span>
        </div>
        
        <div class="detail-item" v-if="card.details.windSpeed">
          <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 4H3M21 12H3M21 20H3"/>
          </svg>
          <span>{{ card.details.windSpeed }} km/h</span>
        </div>
        
        <div class="detail-item" v-if="card.details.visibility">
          <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>{{ card.details.visibility }} km</span>
        </div>
      </div>
      
      <div v-if="card.forecast" class="forecast">
        <h4 class="forecast-title">{{ card.forecastLabel || '3-Day Forecast' }}</h4>
        <div class="forecast-items">
          <div 
            v-for="day in card.forecast.slice(0, 3)" 
            :key="day.day"
            class="forecast-item"
          >
            <div class="forecast-day">{{ day.day }}</div>
            <div class="forecast-temps">
              <span class="forecast-high">{{ day.high }}°</span>
              <span class="forecast-low">{{ day.low }}°</span>
            </div>
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

const emit = defineEmits(['open']);
function open() { emit('open'); }
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.weather-card::before {
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

.weather-card > * {
  position: relative;
  z-index: 1;
}

.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid var(--card-border-color);
  border-radius: 12px;
  padding: 0.75rem;
  background: var(--card-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: var(--text-color);
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

.location {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
}

.weather-content {
  margin-bottom: 16px;
}

.current-weather {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.temperature {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.temp-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.temp-unit {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Responsive adjustments */
.mosaic-item-tiny .temp-value {
  font-size: 1.5rem;
}

.mosaic-item-tiny .temp-unit {
  font-size: 0.75rem;
}

.mosaic-item-large .temp-value,
.mosaic-item-xl .temp-value {
  font-size: 2.5rem;
}

.mosaic-item-large .temp-unit,
.mosaic-item-xl .temp-unit {
  font-size: 1.25rem;
}

.weather-info {
  text-align: right;
}

.condition {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.feels-like {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.weather-details {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-icon {
  width: 14px;
  height: 14px;
  opacity: 0.8;
}

.forecast {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.forecast-title {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.forecast-items {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.forecast-item {
  text-align: center;
  flex: 1;
}

.forecast-day {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.forecast-temps {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.forecast-high {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.forecast-low {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* Dark mode adjustments */
.dark .weather-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style> 