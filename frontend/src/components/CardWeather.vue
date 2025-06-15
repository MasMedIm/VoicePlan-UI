<template>
  <div class="card weather-card" @click="open">
    <!-- Glassmorphism overlay -->
    <div class="glass-overlay"></div>
    
    <!-- Animated glow effect -->
    <div class="glow-effect"></div>
    
    <!-- Decorative elements -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    
    <header class="card-header">
      <div class="header-left">
        <div class="icon-wrapper">
          <Sun class="icon" />
        </div>
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
          <Droplets class="detail-icon" />
          <span>{{ card.details.humidity }}%</span>
        </div>
        
        <div class="detail-item" v-if="card.details.windSpeed">
          <Wind class="detail-icon" />
          <span>{{ card.details.windSpeed }} km/h</span>
        </div>
        
        <div class="detail-item" v-if="card.details.visibility">
          <Eye class="detail-icon" />
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
    
    <!-- Action indicator -->
    <div class="action-indicator">
      <ChevronRight class="chevron" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Sun, Droplets, Wind, Eye, ChevronRight } from 'lucide-vue-next';

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
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  min-height: fit-content;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.weather-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(116, 185, 255, 0.03) 0%, 
    rgba(9, 132, 227, 0.03) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(116, 185, 255, 0.08) 0%, 
    rgba(9, 132, 227, 0.05) 100%
  );
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 1;
}

.glow-effect {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(116, 185, 255, 0.4) 0%,
    rgba(9, 132, 227, 0.3) 50%,
    rgba(116, 185, 255, 0.4) 100%
  );
  border-radius: 18px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  filter: blur(12px);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.circle-1 {
  width: 5rem;
  height: 5rem;
  top: -2.5rem;
  right: -2.5rem;
  background: rgba(116, 185, 255, 0.1);
}

.circle-2 {
  width: 7rem;
  height: 7rem;
  bottom: -3.5rem;
  left: -3.5rem;
  background: rgba(9, 132, 227, 0.1);
}

.weather-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(116, 185, 255, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(116, 185, 255, 0.3);
}

.weather-card:hover::before {
  opacity: 1;
}

.weather-card:hover .glass-overlay {
  opacity: 1;
}

.weather-card:hover .glow-effect {
  opacity: 0.6;
}

.weather-card:hover .action-indicator {
  opacity: 1;
  transform: translateX(0);
}

.weather-card:hover .icon-wrapper {
  transform: rotate(8deg) scale(1.15);
  box-shadow: 0 4px 12px rgba(116, 185, 255, 0.3);
}

.weather-card:hover .circle-1,
.weather-card:hover .circle-2 {
  transform: scale(1.3);
  opacity: 0.9;
}

.weather-card:active {
  transform: translateY(-4px) scale(1.01);
  transition: transform 0.15s ease-out;
}

.card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: 16px;
  padding: 0.75rem;
  color: var(--text-color);
  position: relative;
  z-index: 2;
  min-height: 0;
}

.card-header {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.icon-wrapper {
  padding: 0.35rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(116, 185, 255, 0.3);
}

.icon { 
  width: 1rem; 
  height: 1rem; 
  color: white;
  stroke-width: 2.5;
}

.title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  background: linear-gradient(135deg, 
    var(--text-color) 0%, 
    color-mix(in srgb, var(--text-color) 80%, #74b9ff 20%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.location {
  font-size: 0.7rem;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  opacity: 0.9;
}

.weather-content {
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
}

.current-weather {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.temperature {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.temp-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-color);
  text-shadow: 0 2px 8px rgba(116, 185, 255, 0.3);
  transition: all 0.3s ease;
}

.weather-card:hover .temp-value {
  transform: scale(1.05);
  text-shadow: 0 4px 12px rgba(116, 185, 255, 0.4);
}

.temp-unit {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
  font-weight: 600;
}

.weather-info {
  text-align: right;
}

.condition {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
  opacity: 0.95;
}

.feels-like {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
}

.weather-details {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.375rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  font-weight: 600;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.detail-icon {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.8;
}

.forecast {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.forecast-title {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.forecast-items {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.forecast-item {
  text-align: center;
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.forecast-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.forecast-day {
  font-size: 0.65rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
}

.forecast-temps {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.forecast-high {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-color);
}

.forecast-low {
  font-size: 0.7rem;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 600;
}

.description {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.4;
  text-align: center;
  position: relative;
  z-index: 2;
}

.action-indicator {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.3s ease;
  z-index: 3;
}

.chevron {
  width: 1rem;
  height: 1rem;
  color: rgba(116, 185, 255, 0.6);
  animation: float 2s ease-in-out infinite;
}

/* Animations */
@keyframes gentle-pulse {
  0%, 100% { 
    opacity: 0;
    transform: scale(0.95);
  }
  50% { 
    opacity: 0.3;
    transform: scale(1.02);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

/* Size optimizations */
.mosaic-item-micro .card {
  padding: 0.5rem;
}

.mosaic-item-micro .card-header {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .weather-content {
  margin-bottom: 0.5rem;
}

.mosaic-item-micro .title {
  font-size: 0.75rem;
  -webkit-line-clamp: 1;
}

.mosaic-item-micro .temp-value {
  font-size: 1.5rem;
}

.mosaic-item-micro .temp-unit {
  font-size: 0.8rem;
}

.mosaic-item-micro .condition {
  font-size: 0.75rem;
}

.mosaic-item-micro .feels-like {
  font-size: 0.65rem;
}

.mosaic-item-micro .detail-item {
  font-size: 0.65rem;
  padding: 0.25rem 0.375rem;
}

.mosaic-item-micro .forecast {
  padding: 0.5rem;
}

.mosaic-item-micro .forecast-title {
  font-size: 0.65rem;
}

.mosaic-item-micro .forecast-item {
  padding: 0.375rem;
}

/* Enhanced dark mode */
.dark .weather-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .weather-card:hover {
  box-shadow: 
    0 12px 32px rgba(116, 185, 255, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dark .glass-overlay {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(168, 85, 247, 0.08) 100%
  );
}
</style> 