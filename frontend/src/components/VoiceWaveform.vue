<!-- VoiceWaveform Component -->
<template>
  <div class="voice-waveform" :class="{ active: isActive, speaking: isSpeaking }">
    <div class="waveform-container">
      <svg 
        class="waveform-svg" 
        viewBox="0 0 320 80" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect 
          v-for="(bar, index) in waveBars" 
          :key="index"
          :x="index * 10 + 5"
          :y="40 - bar.height / 2"
          width="6"
          :height="bar.height"
          fill="url(#waveGradient)"
          :style="{ 
            animationDelay: `${index * 15}ms`,
            filter: isActive ? 'url(#glow)' : 'none'
          }"
          class="wave-bar"
          :class="{ active: isActive, speaking: isSpeaking }"
        />
      </svg>
    </div>
    
    <div class="status-indicator" :class="statusClass">
      <div class="status-dot"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  isListening: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  audioLevel: {
    type: Number,
    default: 0
  }
});

const waveBars = ref([]);
const animationFrame = ref(null);
const isActive = computed(() => props.isListening || props.isSpeaking);

// Initialize wave bars
onMounted(() => {
  initializeWaveBars();
  startAnimation();
});

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});

// Watch for prop changes to update animation patterns
watch([() => props.isListening, () => props.isSpeaking, () => props.audioLevel], () => {
  updateWavePattern();
});

const statusClass = computed(() => {
  if (props.isSpeaking) return 'speaking';
  if (props.isListening) return 'listening';
  return 'idle';
});

const statusText = computed(() => {
  if (props.isSpeaking) return 'AI Speaking';
  if (props.isListening) return 'Listening';
  return 'Ready';
});

function initializeWaveBars() {
  waveBars.value = Array.from({ length: 32 }, (_, i) => ({
    height: 8 + Math.random() * 4,
    baseHeight: 8 + Math.random() * 4,
    targetHeight: 8 + Math.random() * 4,
    speed: 0.02 + Math.random() * 0.03,
    phase: i * 0.2
  }));
}

function updateWavePattern() {
  waveBars.value.forEach((bar, i) => {
    if (props.isSpeaking) {
      // AI speaking pattern - rhythmic waves
      bar.targetHeight = 15 + Math.sin(Date.now() * 0.005 + i * 0.3) * 20;
    } else if (props.isListening) {
      // Listening pattern - respond to audio level
      const audioMultiplier = Math.max(0.3, props.audioLevel);
      bar.targetHeight = bar.baseHeight + (Math.random() * 25 * audioMultiplier);
    } else {
      // Idle pattern - gentle ambient wave
      bar.targetHeight = bar.baseHeight + Math.sin(Date.now() * 0.001 + i * 0.1) * 3;
    }
  });
}

function startAnimation() {
  function animate() {
    waveBars.value.forEach(bar => {
      const diff = bar.targetHeight - bar.height;
      bar.height += diff * bar.speed;
    });
    
    updateWavePattern();
    animationFrame.value = requestAnimationFrame(animate);
  }
  animate();
}
</script>

<style scoped>
.voice-waveform {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.voice-waveform.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 
    0 8px 32px rgba(59, 130, 246, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.voice-waveform.speaking {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.waveform-container {
  width: 100%;
  max-width: 320px;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.1);
}

.waveform-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.wave-bar {
  transition: all 0.1s ease-out;
  opacity: 0.7;
}

.wave-bar.active {
  opacity: 1;
  animation: wave-pulse 0.6s ease-in-out infinite alternate;
}

.wave-bar.speaking {
  animation: speaking-wave 0.4s ease-in-out infinite alternate;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.status-indicator.idle {
  background: rgba(107, 114, 128, 0.1);
  border-color: rgba(107, 114, 128, 0.2);
}

.status-indicator.listening {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.status-indicator.speaking {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.idle .status-dot {
  background: #6b7280;
}

.status-indicator.listening .status-dot {
  background: #3b82f6;
  animation: pulse-blue 1.5s ease-in-out infinite;
}

.status-indicator.speaking .status-dot {
  background: #8b5cf6;
  animation: pulse-purple 1s ease-in-out infinite;
}

.status-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Animations */
@keyframes wave-pulse {
  0% { opacity: 0.7; transform: scaleY(1); }
  100% { opacity: 1; transform: scaleY(1.2); }
}

@keyframes speaking-wave {
  0% { opacity: 0.8; transform: scaleY(1); }
  100% { opacity: 1; transform: scaleY(1.4); }
}

@keyframes pulse-blue {
  0%, 100% { 
    background: #3b82f6;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% { 
    background: #60a5fa;
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

@keyframes pulse-purple {
  0%, 100% { 
    background: #8b5cf6;
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  50% { 
    background: #a78bfa;
    box-shadow: 0 0 0 8px rgba(139, 92, 246, 0);
  }
}

/* Dark mode enhancements */
.dark .voice-waveform {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .voice-waveform.active {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(59, 130, 246, 0.3);
}

.dark .waveform-container {
  background: rgba(0, 0, 0, 0.2);
}
</style>
