<!-- VoiceWaveform Component -->
<template>
  <div class="voice-waveform" :class="{ active: isActive, speaking: isSpeaking }">
    <!-- Waveform Container -->
    <div class="waveform-container">
      <svg class="waveform-svg" viewBox="0 0 200 60" preserveAspectRatio="xMidYMid meet">
        <!-- Background glow effect -->
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="{ stopColor: primaryColor, stopOpacity: 0.8 }" />
            <stop offset="50%" :style="{ stopColor: primaryColor, stopOpacity: 0.6 }" />
            <stop offset="100%" :style="{ stopColor: primaryColor, stopOpacity: 0.3 }" />
          </linearGradient>
          
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Waveform bars -->
        <g class="waveform-bars">
          <rect 
            v-for="(bar, index) in waveformBars" 
            :key="index"
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
            rx="1"
            fill="url(#waveGradient)"
            :filter="isActive ? 'url(#glow)' : ''"
            class="waveform-bar"
            :class="{ 
              active: bar.active,
              peak: bar.isPeak 
            }"
            :style="{ 
              animationDelay: `${index * 50}ms`,
              transform: `scaleY(${bar.scale})`,
              opacity: bar.opacity
            }"
          />
        </g>
        
        <!-- Center line for idle state -->
        <line 
          v-if="!isActive"
          x1="10" 
          y1="30" 
          x2="190" 
          y2="30" 
          stroke="rgba(255, 255, 255, 0.2)" 
          stroke-width="1"
          stroke-dasharray="2,2"
          class="idle-line"
        />
      </svg>
      
      <!-- Voice status indicator -->
      <div class="voice-status" :class="statusClass">
        <div class="status-text">{{ statusText }}</div>
        <div v-if="isActive" class="pulse-indicator"></div>
      </div>
      
      <!-- Frequency visualizer -->
      <div v-if="showFrequencies" class="frequency-display">
        <div 
          v-for="freq in frequencyBars" 
          :key="freq.id"
          class="frequency-bar"
          :style="{ 
            height: `${freq.height}%`,
            backgroundColor: freq.color,
            animationDelay: `${freq.delay}ms`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  voiceState: {
    type: String,
    default: 'idle' // idle, listening, speaking, processing
  },
  audioLevel: {
    type: Number,
    default: 0
  },
  primaryColor: {
    type: String,
    default: '#3b82f6'
  },
  showFrequencies: {
    type: Boolean,
    default: false
  }
});

// Reactive state
const waveformBars = ref([]);
const frequencyBars = ref([]);
const animationFrame = ref(null);
const startTime = ref(Date.now());

// Computed properties
const isActive = computed(() => 
  props.voiceState === 'listening' || props.voiceState === 'speaking'
);

const isSpeaking = computed(() => props.voiceState === 'speaking');

const statusClass = computed(() => ({
  idle: props.voiceState === 'idle',
  listening: props.voiceState === 'listening',
  speaking: props.voiceState === 'speaking',
  processing: props.voiceState === 'processing'
}));

const statusText = computed(() => {
  const statusMap = {
    idle: 'Ready to listen',
    listening: 'Listening...',
    speaking: 'AI Speaking',
    processing: 'Processing...'
  };
  return statusMap[props.voiceState] || 'Ready';
});

// Initialize waveform bars
function initializeWaveform() {
  const barCount = 32;
  const barWidth = 4;
  const spacing = 2;
  const totalWidth = barCount * (barWidth + spacing);
  const startX = (200 - totalWidth) / 2;
  
  waveformBars.value = Array.from({ length: barCount }, (_, index) => ({
    id: index,
    x: startX + index * (barWidth + spacing),
    y: 25,
    width: barWidth,
    height: 10,
    scale: 0.1,
    opacity: 0.3,
    active: false,
    isPeak: false,
    baseHeight: 10,
    maxHeight: 40
  }));
}

// Initialize frequency bars
function initializeFrequencies() {
  if (!props.showFrequencies) return;
  
  const freqCount = 12;
  frequencyBars.value = Array.from({ length: freqCount }, (_, index) => ({
    id: index,
    height: 0,
    color: `hsl(${200 + index * 15}, 80%, 60%)`,
    delay: index * 30
  }));
}

// Update waveform animation
function updateWaveform() {
  if (!waveformBars.value.length) return;
  
  const currentTime = Date.now();
  const elapsed = (currentTime - startTime.value) / 1000;
  
  waveformBars.value.forEach((bar, index) => {
    if (isActive.value) {
      // Active state - animated based on audio level and sine waves
      const audioInfluence = props.audioLevel * 0.7;
      const sineWave = Math.sin(elapsed * 3 + index * 0.3) * 0.3;
      const randomNoise = (Math.random() - 0.5) * 0.2;
      
      const intensity = Math.max(0.1, audioInfluence + sineWave + randomNoise);
      
      bar.scale = intensity * 2;
      bar.opacity = 0.6 + intensity * 0.4;
      bar.active = intensity > 0.5;
      bar.isPeak = intensity > 0.8;
      
      // Speaking vs listening patterns
      if (isSpeaking.value) {
        // More structured pattern for AI speaking
        const speakingPattern = Math.sin(elapsed * 6 + index * 0.1) * 0.5 + 0.5;
        bar.scale = speakingPattern * 1.5;
        bar.opacity = 0.8;
      }
    } else {
      // Idle state - gentle pulse
      const idlePulse = Math.sin(elapsed * 2 + index * 0.1) * 0.1 + 0.1;
      bar.scale = idlePulse;
      bar.opacity = 0.2 + idlePulse * 0.1;
      bar.active = false;
      bar.isPeak = false;
    }
  });
  
  // Update frequency bars if enabled
  if (props.showFrequencies && frequencyBars.value.length) {
    frequencyBars.value.forEach((freq, index) => {
      const freqIntensity = Math.sin(elapsed * 4 + index * 0.5) * 0.5 + 0.5;
      freq.height = (props.audioLevel + freqIntensity) * 100;
    });
  }
  
  animationFrame.value = requestAnimationFrame(updateWaveform);
}

// Watch for voice state changes
watch(
  () => props.voiceState,
  (newState) => {
    if (newState === 'listening' || newState === 'speaking') {
      startTime.value = Date.now();
    }
  }
);

// Lifecycle
onMounted(() => {
  initializeWaveform();
  initializeFrequencies();
  updateWaveform();
});

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});
</script>

<style scoped>
.voice-waveform {
  position: relative;
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  transition: all 0.4s ease;
  overflow: hidden;
}

.voice-waveform::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.03) 0%,
    rgba(139, 92, 246, 0.03) 50%,
    rgba(236, 72, 153, 0.03) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.voice-waveform.active {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
}

.voice-waveform.active::before {
  opacity: 1;
}

.voice-waveform.speaking {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.15);
}

.waveform-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.waveform-svg {
  width: 100%;
  height: 60px;
  margin-bottom: 1rem;
}

.waveform-bar {
  transform-origin: bottom center;
  transition: all 0.15s ease;
}

.waveform-bar.active {
  filter: drop-shadow(0 0 4px currentColor);
}

.waveform-bar.peak {
  filter: drop-shadow(0 0 8px currentColor) brightness(1.2);
}

.idle-line {
  opacity: 0.3;
  animation: idle-pulse 3s ease-in-out infinite;
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.voice-status.listening {
  color: #3b82f6;
}

.voice-status.speaking {
  color: #8b5cf6;
}

.voice-status.processing {
  color: #f59e0b;
}

.status-text {
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.frequency-display {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 2px;
  opacity: 0.6;
}

.frequency-bar {
  width: 3px;
  border-radius: 1px;
  transition: height 0.1s ease;
  animation: frequency-pulse 2s ease-in-out infinite;
}

/* Animations */
@keyframes idle-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

@keyframes pulse-dot {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.3;
    transform: scale(1.2);
  }
}

@keyframes frequency-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Responsive design */
@media (max-width: 768px) {
  .voice-waveform {
    height: 80px;
    padding: 0.75rem;
  }
  
  .waveform-svg {
    height: 40px;
  }
  
  .voice-status {
    font-size: 0.7rem;
  }
}

/* Dark mode adjustments */
.dark .voice-waveform {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.05);
}

.dark .voice-waveform.active {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
}
</style>
