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
    default: 72
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

// Enhanced dynamic properties with more pronounced effects
const dynamicSpeed = computed(() => {
  const baseSpeed = {
    idle: 0.4,
    connecting: 1.5,
    live: 0.7,
    listening: 1.2,
    speaking: 2.0
  }[props.voiceState] || 0.5
  
  return baseSpeed + safeAudioLevel.value * 3.0
})

const dynamicAmplitude = computed(() => {
  const baseAmplitude = {
    idle: 0.06,
    connecting: 0.20,
    live: 0.10,
    listening: 0.18,
    speaking: 0.30
  }[props.voiceState] || 0.1
  
  return baseAmplitude + safeAudioLevel.value * 0.6
})

const bubbleScale = computed(() => {
  const baseScale = {
    idle: 1.0,
    connecting: 1.08,
    live: 1.05,
    listening: 1.15,
    speaking: 1.25
  }[props.voiceState] || 1.0
  
  return baseScale + safeAudioLevel.value * 0.25
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
  box-shadow: 0 0 32px 8px rgba(59,130,246,0.15), 0 0 0 12px rgba(139,92,246,0.10);
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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.7) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
  animation: listening-background-glow 1s ease-in-out infinite;
}

.glow-background.speaking {
  background: radial-gradient(circle, rgba(236, 72, 153, 0.7) 0%, rgba(236, 72, 153, 0.3) 50%, transparent 100%);
  animation: speaking-background-glow 0.8s ease-in-out infinite;
}

/* Voice state specific styles with enhanced effects */
.voice-state-idle {
  opacity: 0.8;
  transform: scale(1);
}

.voice-state-connecting {
  box-shadow: 0 0 48px 12px rgba(251,191,36,0.25), 0 0 0 20px rgba(251,191,36,0.12);
  animation: connecting-pulse-enhanced 1s ease-in-out infinite;
}

.voice-state-live {
  box-shadow: 0 0 48px 12px rgba(16,185,129,0.25), 0 0 0 20px rgba(16,185,129,0.12);
  animation: live-glow 2s ease-in-out infinite;
}

.voice-state-listening {
  box-shadow: 0 0 48px 12px rgba(59,130,246,0.35), 0 0 0 24px rgba(59,130,246,0.15);
  animation: listening-glow-enhanced 1s ease-in-out infinite;
}

.voice-state-speaking {
  box-shadow: 0 0 48px 12px rgba(236,72,153,0.35), 0 0 0 24px rgba(236,72,153,0.15);
  animation: speaking-glow-enhanced 0.8s ease-in-out infinite;
}

.voice-active {
  filter: brightness(1.2) saturate(1.4);
  transform: scale(1.05);
}

.voice-intense {
  filter: brightness(1.4) saturate(1.6);
  transform: scale(1.1);
}

/* Enhanced Animations */
@keyframes connecting-pulse-enhanced {
  0%, 100% { 
    opacity: 0.8; 
    transform: scale(1);
    box-shadow: 0 0 48px 12px rgba(251,191,36,0.25), 0 0 0 20px rgba(251,191,36,0.12);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.08);
    box-shadow: 0 0 64px 16px rgba(251,191,36,0.40), 0 0 0 28px rgba(251,191,36,0.20);
  }
}

@keyframes live-glow {
  0%, 100% { 
    box-shadow: 0 0 48px 12px rgba(16,185,129,0.25), 0 0 0 20px rgba(16,185,129,0.12);
  }
  50% { 
    box-shadow: 0 0 56px 14px rgba(16,185,129,0.35), 0 0 0 24px rgba(16,185,129,0.18);
  }
}

@keyframes listening-glow-enhanced {
  0%, 100% { 
    box-shadow: 0 0 48px 12px rgba(59,130,246,0.35), 0 0 0 24px rgba(59,130,246,0.15);
  }
  50% { 
    box-shadow: 0 0 72px 18px rgba(59,130,246,0.50), 0 0 0 32px rgba(59,130,246,0.25);
  }
}

@keyframes speaking-glow-enhanced {
  0%, 100% { 
    box-shadow: 0 0 48px 12px rgba(236,72,153,0.35), 0 0 0 24px rgba(236,72,153,0.15);
  }
  50% { 
    box-shadow: 0 0 72px 18px rgba(236,72,153,0.50), 0 0 0 32px rgba(236,72,153,0.25);
  }
}

@keyframes listening-background-glow {
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes speaking-background-glow {
  0%, 100% { 
    opacity: 0.7;
    transform: scale(1);
  }
  33% { 
    opacity: 1;
    transform: scale(1.08);
  }
  66% { 
    opacity: 0.9;
    transform: scale(1.12);
  }
}
</style> 