<template>
  <div class="bottom-nav-container">
    <!-- Collapsed state - only voice bubble -->
    <div v-if="isCollapsed" class="collapsed-nav">
      <button 
        class="voice-bubble-only" 
        :class="voiceState"
        :disabled="isConnecting"
        @click="handleVoiceBubbleClick"
      >
        <VoiceBubble 
          :voice-state="voiceState"
          :external-audio-level="audioLevel"
          :size="64"
        />
        <span class="sr-only">{{ voiceStatusLabel }}</span>
      </button>
      
      <!-- Expand button with chevron icon -->
      <button class="expand-btn" @click="toggleCollapse" title="Click to expand full navigation">
        <ChevronUp class="expand-icon" />
      </button>
    </div>

    <!-- Expanded state - full navigation -->
    <div v-else class="pill-nav">
      <!-- Collapse button with chevron icon -->
      <button class="nav-button collapse-btn" @click="toggleCollapse" title="Collapse navigation">
        <div class="icon-container">
          <ChevronDown class="collapse-icon" />
        </div>
        <span class="nav-label">Collapse</span>
      </button>

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
            <div class="color-section">
              <div class="color-picker-title">Background Themes</div>
              <div class="theme-grid">
                <button
                  v-for="theme in backgroundThemes"
                  :key="theme.name"
                  class="theme-button"
                  :class="{ selected: props.currentTheme === theme.name }"
                  :style="{ background: theme.gradient }"
                  @click="setBackgroundTheme(theme)"
                  :title="theme.name"
                >
                  <span class="theme-name">{{ theme.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Voice Status Indicator with Integrated Bubble -->
      <button 
        class="nav-button voice-indicator-bubble" 
        :class="voiceState"
        :disabled="isConnecting"
        @click="toggleVoice"
      >
        <div class="voice-bubble-container">
          <VoiceBubble 
            :voice-state="voiceState"
            :external-audio-level="audioLevel"
            :size="58"
          />
        </div>
        <span class="nav-label">{{ voiceStatusLabel }}</span>
      </button>

      <!-- Settings -->
      <button class="nav-button" @click="openSettings">
        <div class="icon-container">⚙️</div>
        <span class="nav-label">Settings</span>
      </button>
    </div>

    <!-- Settings Modal -->
    <Teleport to="body">
      <Transition name="settings-modal">
        <div v-if="showSettings" class="settings-overlay" @click="closeSettings">
          <div class="settings-modal" @click.stop>
            <div class="settings-header">
              <h3 class="settings-title">Settings</h3>
              <button class="close-button" @click="closeSettings">
                <X class="close-icon" />
              </button>
            </div>

            <div class="settings-content">
              <!-- Voice Selection Section -->
              <div class="settings-section">
                <h4 class="section-title">Voice Selection</h4>
                <p class="section-description">Choose your preferred AI voice for conversations</p>
                
                <div class="voice-grid">
                  <div 
                    v-for="voice in voiceOptions" 
                    :key="voice.id"
                    class="voice-option"
                    :class="{ selected: props.selectedVoice === voice.id }"
                    @click="selectVoice(voice)"
                  >
                    <div class="voice-header">
                      <div class="voice-name">{{ voice.name }}</div>
                      <div class="voice-gender">{{ voice.gender }}</div>
                    </div>
                    <div class="voice-description">{{ voice.description }}</div>
                    <div class="voice-accent">{{ voice.accent }} Accent</div>
                    
                    <!-- Play button for voice preview -->
                    <button class="voice-preview-btn" @click.stop="previewVoice(voice)">
                      <Play class="preview-icon" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- App Information Section -->
              <div class="settings-section">
                <h4 class="section-title">About</h4>
                <div class="app-info">
                  <div class="info-item">
                    <span class="info-label">Version:</span>
                    <span class="info-value">1.0.0</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Voice Engine:</span>
                    <span class="info-value">OpenAI TTS</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Cards Available:</span>
                    <span class="info-value">12+ Types</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VoiceBubble from './VoiceBubble.vue'
import { X, Play, ChevronUp, ChevronDown } from 'lucide-vue-next'

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
  },
  currentTheme: String,
  selectedVoice: String
})

const emit = defineEmits(['toggle-theme', 'color-change', 'toggle-voice', 'theme-change', 'voice-change', 'settings-open'])

const showColorPicker = ref(false)
const showSettings = ref(false)
const isCollapsed = ref(false) // Start expanded so user can see collapse button
const isSpacePressed = ref(false)

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

const backgroundThemes = [
  { 
    name: 'Ocean Blue', 
    primary: '#0f172a', 
    secondary: '#1e293b',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
  },
  { 
    name: 'Forest Green', 
    primary: '#064e3b', 
    secondary: '#065f46',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
  },
  { 
    name: 'Sunset Orange', 
    primary: '#7c2d12', 
    secondary: '#9a3412',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)'
  },
  { 
    name: 'Royal Purple', 
    primary: '#3730a3', 
    secondary: '#4338ca',
    accent: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #3730a3 0%, #4338ca 50%, #6366f1 100%)'
  },
  { 
    name: 'Rose Pink', 
    primary: '#881337', 
    secondary: '#9f1239',
    accent: '#ec4899',
    gradient: 'linear-gradient(135deg, #881337 0%, #9f1239 50%, #be185d 100%)'
  },
  { 
    name: 'Midnight', 
    primary: '#111827', 
    secondary: '#1f2937',
    accent: '#6b7280',
    gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)'
  }
]

const voiceOptions = [
  { 
    id: 'alloy', 
    name: 'Alloy', 
    description: 'Neutral & Balanced',
    gender: 'Neutral',
    accent: 'Universal'
  },
  { 
    id: 'echo', 
    name: 'Echo', 
    description: 'Clear Male Voice',
    gender: 'Male',
    accent: 'American'
  },
  { 
    id: 'fable', 
    name: 'Fable', 
    description: 'Expressive Male',
    gender: 'Male',
    accent: 'British'
  },
  { 
    id: 'onyx', 
    name: 'Onyx', 
    description: 'Deep Male Voice',
    gender: 'Male',
    accent: 'American'
  },
  { 
    id: 'nova', 
    name: 'Nova', 
    description: 'Young Female Voice',
    gender: 'Female',
    accent: 'American'
  },
  { 
    id: 'shimmer', 
    name: 'Shimmer', 
    description: 'Warm Female Voice',
    gender: 'Female',
    accent: 'American'
  }
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

function setBackgroundTheme(theme) {
  emit('theme-change', theme)
  showColorPicker.value = false
}

function toggleVoice() {
  emit('toggle-voice')
}

function openSettings() {
  showSettings.value = true
  emit('settings-open')
}

function closeSettings() {
  showSettings.value = false
}

function selectVoice(voice) {
  console.log('🎤 Selecting voice:', voice.name, voice.id)
  emit('voice-change', voice)
  
  // Add brief visual feedback before closing
  setTimeout(() => {
    closeSettings()
  }, 150)
}

async function previewVoice(voice) {
  console.log(`🎤 Previewing voice ${voice.name}`)
  
  // Sample text for preview
  const sampleText = `Hello! I'm ${voice.name}. This is how I sound when speaking.`
  
  try {
    // Note: In a real implementation, this would call your TTS API
    // For now, we'll use the browser's built-in speech synthesis as a fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sampleText)
      utterance.rate = 0.9
      utterance.pitch = voice.gender === 'Female' ? 1.2 : 0.8
      utterance.volume = 0.7
      
      // Try to find a voice that matches the gender
      const voices = speechSynthesis.getVoices()
      const matchingVoice = voices.find(v => 
        (voice.gender === 'Female' && v.name.toLowerCase().includes('female')) ||
        (voice.gender === 'Male' && v.name.toLowerCase().includes('male')) ||
        (voice.accent === 'British' && v.lang.includes('GB'))
      ) || voices[0]
      
      if (matchingVoice) utterance.voice = matchingVoice
      
      speechSynthesis.speak(utterance)
    } else {
      console.log('🎤 Speech synthesis not supported, would call OpenAI TTS API here')
    }
  } catch (error) {
    console.error('Error previewing voice:', error)
  }
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleVoiceBubbleClick() {
  // In collapsed mode, clicking the voice bubble can:
  // 1. Start a conversation if idle
  // 2. Stop if already active
  toggleVoice()
}

// Add spacebar support
function handleKeyDown(event) {
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault()
    if (!isSpacePressed.value) {
      isSpacePressed.value = true
      toggleVoice()
    }
  }
}

function handleKeyUp(event) {
  if (event.code === 'Space') {
    event.preventDefault()
    if (isSpacePressed.value) {
      isSpacePressed.value = false
      // Could add hold-to-talk functionality here if needed
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
})
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
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  padding: 0.75rem 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-height: 72px;
  width: fit-content;
  max-width: 500px;
  margin: 0 auto;
}

/* Dark mode override */
.dark .pill-nav {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Collapsed Navigation Styles */
.collapsed-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.voice-bubble-only {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.dark .voice-bubble-only {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.voice-bubble-only:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.voice-bubble-only:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-bubble-only.connecting {
  animation: pulse 1.5s infinite;
}

.voice-bubble-only.listening {
  box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  animation: listening 2s infinite;
}

.voice-bubble-only.speaking {
  box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  animation: speaking 1.5s infinite;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  animation: expand-pulse 2s infinite;
}

.dark .expand-btn {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.4);
}

.expand-btn:hover {
  transform: scale(1.15) translateY(-3px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  animation: none; /* Stop pulsing on hover */
}

.expand-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.collapse-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

@keyframes expand-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
}

.collapse-btn {
  order: -1; /* Show collapse button first */
}

.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.375rem;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #334155;
  opacity: 0.7;
  position: relative;
}

/* Dark mode button colors */
.dark .nav-button {
  color: #f1f5f9;
}

.nav-button:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.dark .nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  opacity: 1;
  background: rgba(59, 130, 246, 0.1);
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
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
  min-width: 55px;
  max-width: 55px;
  width: 55px;
  text-align: center;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Voice Indicator with Bubble */
.voice-indicator-bubble {
  position: relative;
  padding: 0.5rem 0.75rem !important;
  min-width: 70px;
}

.voice-indicator-bubble:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-indicator-bubble .voice-bubble-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.voice-indicator-bubble:hover .voice-bubble-container {
  transform: scale(0.85);
}

.voice-indicator-bubble.connecting .voice-bubble-container {
  animation: pulse 1.5s infinite;
}

.voice-indicator-bubble .nav-label {
  font-size: 0.6rem;
  margin-top: 0.125rem;
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
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  min-width: 250px;
  z-index: 1001;
}

/* Dark mode for color picker */
.dark .color-picker-dropdown {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.color-section {
  margin-bottom: 1rem;
}

.color-picker-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
  opacity: 0.7;
  margin-bottom: 0.75rem;
  text-align: center;
}

.dark .color-picker-title {
  color: #f1f5f9;
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
  border-color: #3b82f6;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px #3b82f6;
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

/* Responsive Design */
@media (max-width: 768px) {
  .pill-nav {
    padding: 0.5rem 0.375rem;
    gap: 0.125rem;
    max-width: 400px;
  }
  
  .nav-button {
    padding: 0.375rem 0.25rem;
  }
  
  .nav-label {
    font-size: 0.55rem;
    min-width: 40px;
    max-width: 40px;
    width: 40px;
  }
  
  .voice-indicator-bubble {
    padding: 0.375rem 0.5rem !important;
    min-width: 65px;
  }
  
  .voice-indicator-bubble .voice-bubble-container {
    transform: scale(0.75);
  }
  
  .voice-indicator-bubble:hover .voice-bubble-container {
    transform: scale(0.8);
  }
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.theme-button {
  position: relative;
  height: 3rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-button:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.theme-button.selected {
  border-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 0 0 2px #3b82f6;
}

.theme-name {
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* Settings Modal */
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50000;
  padding: 2rem;
  box-sizing: border-box;
  overflow-y: auto;
}

.settings-modal {
  background: rgba(30, 41, 59, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  margin: auto;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateZ(0);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(135deg, white 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.25rem;
  backdrop-filter: blur(8px);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.section-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.voice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.875rem;
  max-height: 60vh;
  overflow-y: auto;
}

.voice-option {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  user-select: none;
}

.voice-option:active {
  transform: translateY(-2px) scale(0.98);
  transition: all 0.1s ease;
}

.voice-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.voice-option:hover {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.voice-option:hover::before {
  opacity: 1;
}

.voice-option.selected {
  border-color: rgba(59, 130, 246, 0.7);
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 
    0 0 0 2px rgba(59, 130, 246, 0.4),
    0 8px 24px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px) scale(1.02);
}

.voice-option.selected::before {
  opacity: 1;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.2) 0%, 
    rgba(139, 92, 246, 0.2) 100%
  );
}

.voice-option.selected .voice-name::after {
  content: ' ✓';
  color: rgba(59, 130, 246, 0.8);
  font-weight: bold;
}

.voice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.voice-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.voice-gender {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.voice-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.voice-accent {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.voice-preview-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.voice-preview-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.preview-icon {
  width: 1rem;
  height: 1rem;
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.info-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.info-value {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* Settings Modal Transitions */
.settings-modal-enter-active,
.settings-modal-leave-active {
  transition: all 0.4s ease;
}

.settings-modal-enter-from,
.settings-modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Dark mode adjustments */
.dark .settings-modal {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .settings-section {
  background: rgba(0, 0, 0, 0.3);
}

/* Modal Responsive Design */
@media (max-width: 768px) {
  .settings-overlay {
    padding: 1rem 0.5rem;
    padding-top: 5vh;
  }
  
  .settings-modal {
    padding: 1.5rem;
    max-height: 90vh;
    max-width: 95%;
    border-radius: 16px;
  }
  
  .settings-header {
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
  }
  
  .settings-title {
    font-size: 1.3rem;
  }
  
  .settings-content {
    gap: 1.25rem;
  }
  
  .settings-section {
    padding: 1rem;
  }
  
  .voice-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    max-height: 50vh;
  }
  
  .voice-option {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .settings-overlay {
    padding: 0.5rem 0.25rem;
    padding-top: 2vh;
  }
  
  .settings-modal {
    padding: 1.25rem;
    max-height: 95vh;
    max-width: 98%;
    border-radius: 12px;
  }
  
  .settings-title {
    font-size: 1.2rem;
  }
  
  .close-button {
    width: 2rem;
    height: 2rem;
  }
  
  .settings-content {
    gap: 1rem;
  }
  
  .settings-section {
    padding: 0.875rem;
  }
  
  .voice-option {
    padding: 0.875rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .section-description {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .voice-grid {
    max-height: 40vh;
  }
}
</style> 