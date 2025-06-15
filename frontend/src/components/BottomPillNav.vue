<template>
  <div class="bottom-nav-container">
    <div class="pill-nav">

      <!-- Theme Toggle -->
      <button class="nav-button" @click="toggleTheme">
        <div class="icon-container">
          <div class="sun-icon" :class="{ hidden: isDark }">☀️</div>
          <div class="moon-icon" :class="{ hidden: !isDark }">🌙</div>
        </div>
        <span class="nav-label">{{ isDark ? 'Dark' : 'Light' }}</span>
      </button>

      <!-- Color Picker Toggle -->
      <div class="color-picker-container">
        <button 
          class="nav-button" 
          :class="{ active: showColorPicker }"
          @click="showColorPicker = !showColorPicker"
        >
          <div class="icon-container">🎨</div>
          <span class="nav-label">Colors</span>
        </button>

        <!-- Color Picker Dropdown -->
        <Transition name="color-picker">
          <div v-if="showColorPicker" class="color-picker-dropdown">
            <div class="color-picker-title">Chat Bubble Color</div>
            <div class="color-grid">
              <button
                v-for="color in colors"
                :key="color"
                class="color-button"
                :class="{ selected: props.chatBubbleColor === color }"
                :style="{ backgroundColor: color }"
                @click="setChatBubbleColor(color)"
              />
            </div>
          </div>
        </Transition>
      </div>

      <!-- Voice Status Indicator -->
      <button 
        class="nav-button voice-indicator" 
        :class="voiceState"
        :disabled="isConnecting"
        @click="toggleVoice"
      >
        <div class="icon-container">
          <div class="voice-icon" :class="voiceState" :style="{ color: voiceState === 'listening' ? props.chatBubbleColor : undefined }">🎙️</div>
          <div v-if="voiceState === 'listening'" class="listening-pulse" :style="{ borderColor: props.chatBubbleColor }" />
        </div>
        <span class="nav-label">{{ voiceStatusLabel }}</span>
      </button>

      <!-- Settings -->
      <button class="nav-button" @click="openSettings">
        <div class="icon-container">⚙️</div>
        <span class="nav-label">Settings</span>
      </button>

      <!-- Voice Bubble -->
      <div class="voice-bubble-section">
        <VoiceBubble 
          :voice-state="voiceState"
          :external-audio-level="audioLevel"
          :size="48"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VoiceBubble from './VoiceBubble.vue'

const props = defineProps({
  isDark: Boolean,
  voiceState: {
    type: String,
    default: 'idle' // idle, connecting, live, listening, speaking
  },
  isConnecting: Boolean,
  chatBubbleColor: {
    type: String,
    default: '#3b82f6'
  },
  audioLevel: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-theme', 'color-change', 'toggle-voice'])

const showColorPicker = ref(false)

const colors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

const voiceStatusLabel = computed(() => {
  const state = props.voiceState
  if (props.isConnecting) return 'Connecting...'
  return {
    idle: 'Connect',
    connecting: 'Connecting',
    live: 'Disconnect',
    listening: 'Listening',
    speaking: 'Speaking'
  }[state] || 'Voice'
})

function toggleTheme() {
  emit('toggle-theme')
}

function setChatBubbleColor(color) {
  emit('color-change', color)
  showColorPicker.value = false
}

function toggleVoice() {
  emit('toggle-voice')
}

function openSettings() {
  // For now, just log - can be expanded later
  console.log('Settings clicked - ready for implementation')
}
</script>

<style scoped>
.bottom-nav-container {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.pill-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border-color);
  border-radius: 50px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-height: 72px;
}



.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
  opacity: 0.7;
  position: relative;
}

.nav-button:hover {
  opacity: 1;
  background: var(--card-border-color);
  transform: translateY(-1px);
}

.nav-button.active {
  opacity: 1;
  background: var(--card-border-color);
  color: #3b82f6;
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-bottom: 0.25rem;
}

.sun-icon, .moon-icon {
  position: absolute;
  transition: all 0.3s ease;
  transform-origin: center;
}

.sun-icon.hidden {
  opacity: 0;
  transform: rotate(90deg) scale(0);
}

.moon-icon.hidden {
  opacity: 0;
  transform: rotate(-90deg) scale(0);
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Voice Indicator States */
.voice-indicator:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-indicator.connecting .voice-icon {
  animation: pulse 1.5s infinite;
}

.voice-indicator.listening .voice-icon {
  color: #3b82f6;
}

.voice-indicator.speaking .voice-icon {
  color: #8b5cf6;
  animation: speaking-glow 1.8s ease-in-out infinite;
}

.voice-indicator.live .voice-icon {
  color: #10b981;
}

.voice-indicator.idle .voice-icon {
  color: #6b7280;
}

.listening-pulse {
  position: absolute;
  inset: -4px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  animation: listening-ring 2s linear infinite;
}

/* Color Picker */
.color-picker-container {
  position: relative;
}

.color-picker-dropdown {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border-color);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  min-width: 200px;
}

.color-picker-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 0.75rem;
  text-align: center;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.color-button {
  width: 2rem;
  height: 2rem;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  background-clip: padding-box;
}

.color-button:hover {
  transform: scale(1.1);
}

.color-button.selected {
  border-color: var(--text-color);
  transform: scale(1.1);
}

/* Transitions */
.color-picker-enter-active,
.color-picker-leave-active {
  transition: all 0.3s ease;
}

.color-picker-enter-from,
.color-picker-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes speaking-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes listening-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Voice Bubble Section */
.voice-bubble-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--card-border-color);
  min-width: 56px; /* Ensure proper space for larger bubble */
  min-height: 56px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pill-nav {
    padding: 0.5rem 0.75rem;
    gap: 0.25rem;
  }
  
  .nav-button {
    padding: 0.375rem 0.5rem;
  }
  
  .nav-label {
    font-size: 0.625rem;
  }
  
  .voice-bubble-section {
    margin-left: 0.25rem;
    padding-left: 0.25rem;
  }
}
</style> 