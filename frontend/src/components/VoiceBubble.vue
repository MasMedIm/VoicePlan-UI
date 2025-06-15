<template>
  <div class="voice-bubble-container">
    <div 
      class="voice-bubble"
      :class="bubbleClass"
      :style="{ transform: `scale(${bubbleScale})` }"
    >
      <IridescentBubble
        :color="dynamicColor"
        :speed="dynamicSpeed"
        :amplitude="dynamicAmplitude"
        :audio-level="safeAudioLevel"
        :size="size"
        class="bubble-effect"
      />
      
      <!-- Subtle glow background for active states -->
      <div 
        v-if="voiceState === 'listening' || voiceState === 'speaking'"
        class="glow-background"
        :class="voiceState"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IridescentBubble from './IridescentBubble.vue'
import { useVoiceDetection } from '../composables/useVoiceDetection.js'

const props = defineProps({
  voiceState: {
    type: String,
    default: 'idle' // idle, connecting, live, listening, speaking
  },
  size: {
    type: Number,
    default: 40
  },
  externalAudioLevel: {
    type: Number,
    default: 0
  }
})

// Use voice detection for real audio levels when in listening state
const { audioLevel: detectedAudioLevel } = useVoiceDetection({
  sensitivity: 0.05,
  smoothing: 0.9
})

// Compute safe audio level with bounds checking
const safeAudioLevel = computed(() => {
  const level = props.voiceState === 'listening' 
    ? Math.max(props.externalAudioLevel, detectedAudioLevel.value)
    : props.externalAudioLevel
  return Math.max(0, Math.min(1, level || 0))
})

// Dynamic color based on voice state - Maximum brightness and saturation
const dynamicColor = computed(() => {
  switch (props.voiceState) {
    case 'listening':
      return [0.0, 0.3, 1.0] // Brilliant blue for user speaking
    case 'speaking':
      return [1.0, 0.1, 0.5] // Brilliant pink for AI speaking
    case 'connecting':
      return [1.0, 0.5, 0.0] // Brilliant orange for connecting
    case 'live':
      return [0.0, 1.0, 0.2] // Brilliant green for connected
    default:
      return [0.9, 0.9, 0.9] // Bright white-gray for idle
  }
})

// Enhanced dynamic properties
const dynamicSpeed = computed(() => {
  const baseSpeed = {
    idle: 0.3,
    connecting: 1.0,
    live: 0.5,
    listening: 0.8,
    speaking: 1.2
  }[props.voiceState] || 0.5
  
  return baseSpeed + safeAudioLevel.value * 2.0
})

const dynamicAmplitude = computed(() => {
  const baseAmplitude = {
    idle: 0.05,
    connecting: 0.15,
    live: 0.08,
    listening: 0.12,
    speaking: 0.18
  }[props.voiceState] || 0.1
  
  return baseAmplitude + safeAudioLevel.value * 0.4
})

const bubbleScale = computed(() => {
  const baseScale = {
    idle: 1.0,
    connecting: 1.05,
    live: 1.02,
    listening: 1.08,
    speaking: 1.12
  }[props.voiceState] || 1.0
  
  return baseScale + safeAudioLevel.value * 0.15
})

const bubbleClass = computed(() => {
  return [
    'voice-state-' + props.voiceState,
    {
      'voice-active': safeAudioLevel.value > 0.1,
      'voice-intense': safeAudioLevel.value > 0.5
    }
  ]
})
</script>

<style scoped>
.voice-bubble-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-bubble {
  position: relative;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.bubble-effect {
  position: relative;
  z-index: 1;
}

.glow-background {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(8px);
  opacity: 0.6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glow-background.listening {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%);
}

.glow-background.speaking {
  background: radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 100%);
}

/* Voice state specific styles */
.voice-state-idle {
  opacity: 0.7;
}

.voice-state-connecting {
  animation: connecting-pulse 1.5s ease-in-out infinite;
}

.voice-state-live {
  opacity: 0.9;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.voice-state-listening {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  animation: listening-glow 2s ease-in-out infinite;
}

.voice-state-speaking {
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
  animation: speaking-glow 1.8s ease-in-out infinite;
}

.voice-active {
  filter: brightness(1.1) saturate(1.2);
}

.voice-intense {
  filter: brightness(1.2) saturate(1.4);
}

/* Animations */
@keyframes connecting-pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes listening-glow {
  0%, 100% { 
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  }
  50% { 
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.7);
  }
}

@keyframes speaking-glow {
  0%, 100% { 
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
  }
  50% { 
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.7);
  }
}
</style> 