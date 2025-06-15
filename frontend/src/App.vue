<template>
  <div class="app-container" :class="{ dark: isDark }">
    <img class="app-logo" :src="logoSrc" alt="Gullie logo" />
    <!-- Optional auth stub (kept for future) -->
    <div v-if="!isAuthenticated" class="login-container">
          <h2>Welcome Back</h2>
          <form @submit.prevent="onLogin" class="login-form">
            <div class="form-group">
              <input 
                id="email" 
                type="email" 
                v-model="email" 
                placeholder="Email address" 
                required 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input 
                id="password" 
                type="password" 
                v-model="password" 
                placeholder="Password" 
                required 
                class="form-input"
              />
            </div>
            <button type="submit" class="login-button">Log In</button>
            <p class="error" v-if="error">{{ error }}</p>
          </form>
        </div>
    <div v-else class="main-content">
    <!-- Clean empty space - content will appear when voice creates cards -->
    <section v-if="items.length" class="board-section">
      <div class="board-header">
        <h2 class="board-title">Travel Planning Board</h2>
        <div class="board-stats">
          <span class="stat">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      <!-- Mic container with button, state pill, and orb overlay -->
      <div class="mic-container" :class="btnState">
        <button
          :class="['connect-btn', btnState]"
          @click="toggleConnection"
          :disabled="rtcStatus === 'connecting'"
        >
          <Mic class="mic-icon" />
          <div v-if="btnState === 'state-user'" class="orb-overlay"></div>
        </button>
        <span class="state-pill" :class="btnState">{{ stateLabel }}</span>
      </div>
      <div class="mosaic-grid">
        <component
          v-for="(it, index) in items"
          :key="it.id"
          :is="componentMap[it.kind] || 'div'"
          :card="it.props"
          :class="['mosaic-item', `mosaic-item-${determineCardSize(it.props)}`]"
          @open="openItem(it)"
        />
      </div>
    </section>

    <!-- Enhanced Focus Modal -->
    <Transition name="focus-modal-fade">
      <div v-if="selected" class="focus-modal-overlay" @click.self="closeModal" aria-modal="true" role="dialog" aria-label="Focused Card Modal">
        <div class="focus-modal" :class="{ 'chat-active': isFocusChatMode }">
          <!-- Glassmorphism background -->
          <div class="modal-glass-bg"></div>
          
          <!-- Decorative elements -->
          <div class="modal-decorative-circle circle-1"></div>
          <div class="modal-decorative-circle circle-2"></div>
          
          <!-- Modal Header -->
          <header class="modal-header">
            <div class="header-content">
              <div class="focus-indicator">
                <Target class="focus-icon" />
                <span class="focus-label">Focused Mode</span>
              </div>
              <h2 class="modal-title">{{ selected?.props?.title || 'Card Details' }}</h2>
            </div>
            
            <div class="header-actions">
              <button @click="toggleFocusChatMode" class="chat-toggle-btn" :class="{ active: isFocusChatMode }" aria-label="Toggle chat panel">
                <MessageSquare class="icon" />
                <span>{{ isFocusChatMode ? 'Hide Chat' : 'Edit Card' }}</span>
              </button>
              <button @click="closeModal" class="close-btn" aria-label="Close focus modal">
                <X class="icon" />
              </button>
              <button @click="copyCardLink" class="copy-link-btn" aria-label="Copy card link"><Link class="icon" /></button>
              <button @click="closeModal" class="back-btn" aria-label="Back to board"><ArrowLeft class="icon" /></button>
            </div>
          </header>
          
          <!-- Main Content Area -->
          <div class="modal-content">
            <!-- Left Side: Enhanced Card View -->
            <div class="card-container" :class="{ condensed: isFocusChatMode }">
              <div class="enhanced-card-wrapper">
                <component 
                  :is="componentMap[selected.kind]" 
                  :card="focusedCard" 
                  class="focused-card"
                />
                
                <!-- Real-time update indicator -->
                <div v-if="isFocusUpdating" class="update-indicator">
                  <div class="update-pulse"></div>
                  <span class="update-text">Updating...</span>
                </div>
              </div>
              
              <!-- Card Metadata -->
              <div class="card-metadata">
                <div class="metadata-item">
                  <Calendar class="metadata-icon" />
                  <span>{{ formatDate(selected?.props?.created_at) }}</span>
                </div>
                <div class="metadata-item">
                  <Hash class="metadata-icon" />
                  <span>{{ selected?.kind?.replace('card.', '') || 'basic' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Right Side: Interactive Chat -->
            <Transition name="chat-slide">
              <div v-if="isFocusChatMode" class="chat-container">
                <div class="chat-header">
                  <div class="chat-title">
                    <Bot class="chat-icon" />
                    <span>Chat with this card</span>
                  </div>
                  <div class="chat-status" :class="focusChatStatus">
                    <div class="status-dot"></div>
                    <span>{{ focusChatStatusText }}</span>
                  </div>
                </div>
                
                <!-- Chat Messages -->
                <div class="chat-messages" ref="focusChatMessages">
                  <div v-for="message in focusChatHistory" :key="message.id" class="chat-message" :class="message.type">
                    <div class="message-content">
                      <div class="message-text">{{ message.text }}</div>
                      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                    </div>
                  </div>
                  
                  <!-- Typing indicator -->
                  <div v-if="isAssistantTyping" class="chat-message assistant typing">
                    <div class="message-content">
                      <div class="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Voice Interaction Area -->
                <div class="voice-interaction">
                  <VoiceWaveform 
                    :isListening="isFocusListening"
                    :isSpeaking="isFocusSpeaking"
                    :audioLevel="audioLevel"
                    class="focus-waveform"
                  />
                  
                  <div class="interaction-controls">
                    <button 
                      @click="toggleFocusVoice" 
                      class="voice-btn"
                      :class="{ active: isFocusListening, speaking: isFocusSpeaking }"
                      :disabled="rtcStatus === 'connecting'"
                    >
                      <Mic class="icon" />
                      <span>{{ focusVoiceButtonText }}</span>
                    </button>
                    
                    <div class="quick-actions">
                      <button @click="addFocusQuickAction('edit')" class="quick-action">
                        <Edit3 class="icon" />
                        <span>Edit</span>
                      </button>
                      <button @click="addFocusQuickAction('duplicate')" class="quick-action">
                        <Copy class="icon" />
                        <span>Duplicate</span>
                      </button>
                      <button @click="addFocusQuickAction('delete')" class="quick-action delete">
                        <Trash2 class="icon" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Text Input -->
                <div class="text-input-container">
                  <input 
                    ref="focusChatInput"
                    v-model="focusTextInput"
                    @keyup.enter="sendFocusTextMessage"
                    placeholder="Type a message or voice command..."
                    class="text-input"
                    :disabled="isFocusProcessing"
                    aria-label="Chat input for focused card"
                  />
                  <button 
                    @click="sendFocusTextMessage"
                    class="send-btn"
                    :disabled="!focusTextInput.trim() || isFocusProcessing"
                  >
                    <Send class="icon" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>



    </div>

    <!-- Bottom Pill Navigation -->
    <BottomPillNav 
      :isDark="isDark"
      :voiceState="voiceNavState"
      :isConnecting="rtcStatus === 'connecting'"
      :chatBubbleColor="chatBubbleColor"
      :currentTheme="currentTheme"
      :selectedVoice="selectedVoice"
      :audioLevel="audioLevel"
      @toggle-theme="toggleTheme"
      @color-change="onColorChange"
      @theme-change="onThemeChange"
      @toggle-voice="toggleConnection"
      @voice-change="onVoiceChange"
      @settings-open="onSettingsOpen"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick, onUnmounted } from "vue";
import logoBlack from "../assets/gullie-black-logo.png";
import logoWhite from "../assets/gullie-white-logo.png";
import { useRealtime } from "./composables/useRealtime.js";
import { useUiStore } from "./composables/useUiStore.js";
import CardBasic from "./components/CardBasic.vue";
import CardImage from "./components/CardImage.vue";
import CardChecklist from "./components/CardChecklist.vue";
import CardDate from "./components/CardDate.vue";
import CardLink from "./components/CardLink.vue";
import CardMetric from "./components/CardMetric.vue";
import CardProgress from "./components/CardProgress.vue";
import CardWeather from "./components/CardWeather.vue";
import CardMap from "./components/CardMap.vue";
import CardGoal from "./components/CardGoal.vue";
import CardCountdown from "./components/CardCountdown.vue";
import BottomPillNav from "./components/BottomPillNav.vue";
import { useVoiceDetection } from "./composables/useVoiceDetection.js";
import { loginUser } from "./lib/api.js";

import { 
  Mic, Target, MessageSquare, X, Calendar, Hash, Bot, 
  Edit3, Copy, Trash2, Send, Link, ArrowLeft 
} from 'lucide-vue-next';

const email = ref('');
const password = ref('');
const error = ref('');
// Always treat user as authenticated to show main page without login
const isAuthenticated = ref(true);

// ---------------------------------------------------------------------------
// Realtime WebRTC hook
// ---------------------------------------------------------------------------

const rtc = useRealtime();
const rtcStatus = rtc.status; // Ref – easier binding in template
const talking = rtc.talking;

// ---------------------------------------------------------------------------
// Voice detection for audio levels
// ---------------------------------------------------------------------------
const { audioLevel } = useVoiceDetection({
  sensitivity: 0.05,
  smoothing: 0.9
});

// ---------------------------------------------------------------------------
// Logo selection based on theme
// ---------------------------------------------------------------------------
const logoSrc = computed(() => isDark.value ? logoWhite : logoBlack);

const btnState = computed(() => {
  if (rtcStatus.value === 'connecting') return 'state-connecting';
  if (rtcStatus.value === 'live') {
    if (talking.value === 'user') return 'state-user';
    if (talking.value === 'assistant') return 'state-assistant';
    return 'state-live';
  }
  return 'state-idle';
});

const stateLabel = computed(() => {
  const labelMap = {
    'state-idle': 'Tap to Talk',
    'state-connecting': 'Connecting...',
    'state-live': 'Connected',
    'state-user': 'Listening...',
    'state-assistant': 'Speaking...'
  };
  return labelMap[btnState.value] || 'Voice Assistant';
});

const stateTitle = computed(() => {
  const state = btnState.value;
  return {
    'state-idle': 'Voice Assistant',
    'state-connecting': 'Connecting...',
    'state-live': 'Connected',
    'state-user': 'Listening',
    'state-assistant': 'Speaking'
  }[state] || 'Voice Assistant';
});

// ---------------------------------------------------------------------------
// Voice state for navigation component
// ---------------------------------------------------------------------------
const voiceNavState = computed(() => {
  if (rtcStatus.value === 'connecting') return 'connecting';
  if (rtcStatus.value === 'live') {
    if (talking.value === 'user') return 'listening';
    if (talking.value === 'assistant') return 'speaking';
    return 'live';
  }
  return 'idle';
});

// ====== Tightly Packed Mosaic Sizing - Smart & Compact ======
const determineCardSize = (card) => {
  const cardType = card.kind ? card.kind.split('.')[1] : 'basic';
  
  // Enhanced content analysis
  const itemCount = card.items?.length || 0;
  const hasImage = !!card.image_url;
  const descLength = (card.description || '').length;
  const titleLength = (card.title || '').length;
  const hasSubtitle = !!(card.subtitle || card.location || card.date);
  const hasMetrics = !!(card.value || card.percentage || card.number);
  
  // Compact content scoring system (biased toward smaller sizes)
  const contentScore = (
    Math.min(descLength / 150, 1) * 25 +  // Reduced weight for descriptions
    Math.min(titleLength / 60, 1) * 15 +   // Reduced title weight  
    Math.min(itemCount / 8, 1) * 30 +      // Items are main size factor
    (hasImage ? 15 : 0) +                  // Reduced image bonus
    (hasSubtitle ? 8 : 0) +                // Reduced subtitle bonus
    (hasMetrics ? 12 : 0)                  // Reduced metrics bonus
  );
  
  // Tightly packed sizing - bias heavily toward micro/tiny/small
  switch(cardType) {
    case 'metric':
      // Keep metrics compact
      if (hasMetrics && descLength > 50) return 'small';
      return itemCount <= 1 ? 'micro' : 'tiny';
    
    case 'date':
    case 'countdown':
      // Most dates should be tiny unless complex
      if (contentScore > 60) return 'small';
      if (contentScore > 30) return 'tiny';
      return 'micro';
    
    case 'progress':
      // Progress cards sized conservatively
      if (itemCount > 12) return 'tall';
      if (itemCount > 8) return 'medium';
      if (itemCount > 4) return 'small';
      return 'tiny';
    
    case 'checklist':
      // Checklists sized by item count but kept compact
      if (itemCount > 15) return 'tall';
      if (itemCount > 10) return 'medium';
      if (itemCount > 6) return 'small';
      if (itemCount > 3) return 'tiny';
      return 'micro';
    
    case 'weather':
      // Weather cards should be standard size, not too big
      return contentScore > 70 ? 'medium' : 'small';
    
    case 'map':
      // Maps need width but keep reasonable
      if (contentScore > 80) return 'large';
      if (contentScore > 40) return 'wide';
      return 'medium';
      
    case 'image':
      // Images sized conservatively
      if (!hasImage) return 'tiny';
      if (contentScore > 80) return 'large';
      if (contentScore > 50) return 'medium';
      if (contentScore > 25) return 'small';
      return 'tiny';
    
    case 'link':
      // Links stay very compact
      if (contentScore > 60) return 'small';
      if (contentScore > 30) return 'tiny';
      return 'micro';
    
    case 'basic':
    default:
      // Basic cards - heavily biased toward smaller sizes
      if (contentScore > 85) return 'medium';  // Raised threshold
      if (contentScore > 60) return 'small';   // Raised threshold
      if (contentScore > 35) return 'tiny';    // Raised threshold
      if (contentScore > 15) return 'micro';   // Most will be micro
      return 'micro';
  }
};

// Registry of component kinds → Vue component
const componentMap = {
  'card.basic': CardBasic,
  'card.image': CardImage,
  'card.checklist': CardChecklist,
  'card.date': CardDate,
  'card.link': CardLink,
  'card.metric': CardMetric,
  'card.progress': CardProgress,
  'card.weather': CardWeather,
  'card.map': CardMap,
  'card.goal': CardGoal,
  'card.countdown': CardCountdown,
};

// Modal for enlarging a card (currently checklist only)
const selected = ref(null); // holds ui item

// Focus Modal State
const isFocusChatMode = ref(false);
const isFocusUpdating = ref(false);
const focusedCard = ref(null);

// Focus Chat State
const focusChatHistory = ref([]);
const focusTextInput = ref('');
const isAssistantTyping = ref(false);
const isFocusProcessing = ref(false);
const focusChatMessages = ref(null);
const focusChatInput = ref(null); // NEW: ref for chat input

// Focus Voice State
const isFocusListening = ref(false);
const isFocusSpeaking = ref(false);

const focusChatStatus = computed(() => {
  if (rtcStatus.value === 'connecting') return 'connecting';
  if (isFocusSpeaking.value) return 'speaking';
  if (isFocusListening.value) return 'listening';
  return 'ready';
});

const focusChatStatusText = computed(() => {
  const statusMap = {
    connecting: 'Connecting...',
    speaking: 'AI Speaking',
    listening: 'Listening...',
    ready: 'Ready to chat'
  };
  return statusMap[focusChatStatus.value];
});

const focusVoiceButtonText = computed(() => {
  if (rtcStatus.value === 'connecting') return 'Connecting...';
  if (isFocusSpeaking.value) return 'Speaking...';
  if (isFocusListening.value) return 'Listening...';
  return 'Start Voice';
});

// Sound effect helper
function playSound(name) {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = 0.18;
  audio.play();
}

// Persistent chat history helpers
function getCardChatHistory(cardId) {
  try {
    const raw = localStorage.getItem('vpui-chat-' + cardId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setCardChatHistory(cardId, history) {
  try {
    localStorage.setItem('vpui-chat-' + cardId, JSON.stringify(history));
  } catch {}
}

function openItem(item) {
  selected.value = item;
  focusedCard.value = { ...item.props };
  // Restore chat history if exists
  const saved = getCardChatHistory(item.id);
  if (saved && Array.isArray(saved) && saved.length) {
    focusChatHistory.value = saved;
  } else {
    focusChatHistory.value = [
      {
        id: Date.now(),
        type: 'assistant',
        text: `Hi! I'm now focused on your "${item.props.title || 'card'}" ${item.kind?.replace('card.', '') || 'card'}. I can help you modify it through voice or text commands.`,
        timestamp: Date.now()
      }
    ];
  }
  
  // Reset focus state
  isFocusChatMode.value = false;
  isFocusUpdating.value = false;
  focusTextInput.value = '';
  isAssistantTyping.value = false;
  isFocusProcessing.value = false;
  isFocusListening.value = false;
  isFocusSpeaking.value = false;
  playSound('modal-open');
}

function closeModal() {
  selected.value = null;
  focusedCard.value = null;
  focusChatHistory.value = [];
  isFocusChatMode.value = false;
  playSound('modal-close');
}

// Focus Modal Functions
function toggleFocusChatMode() {
  isFocusChatMode.value = !isFocusChatMode.value;
  
  if (isFocusChatMode.value && focusChatHistory.value.length === 1) {
    addFocusChatMessage('assistant', `Perfect! Now I'm focused on your "${focusedCard.value.title}" card. What would you like to change?`);
  }
  // Auto-focus chat input when chat opens
  nextTick(() => {
    if (isFocusChatMode.value && focusChatInput.value) {
      focusChatInput.value.focus();
    }
  });
}

function toggleFocusVoice() {
  if (isFocusListening.value) {
    stopFocusListening();
  } else {
    startFocusListening();
  }
}

function startFocusListening() {
  isFocusListening.value = true;
  addFocusChatMessage('user', 'Started voice input...');
  
  // In real implementation, this would integrate with the actual voice system
  // and set context to focus on this specific card
  if (rtc.status.value === 'live') {
    // Redirect voice context to focused card
    console.log('Voice focus set to card:', focusedCard.value.title);
  }
}

function stopFocusListening() {
  isFocusListening.value = false;
  addFocusChatMessage('assistant', 'Voice input stopped. Processing your request...');
  simulateFocusCardUpdate();
}

function sendFocusTextMessage() {
  if (!focusTextInput.value.trim() || isFocusProcessing.value) return;
  
  const message = focusTextInput.value.trim();
  addFocusChatMessage('user', message);
  focusTextInput.value = '';
  playSound('chat-send');
  
  processFocusUserMessage(message);
}

function addFocusChatMessage(type, text) {
  focusChatHistory.value.push({
    id: Date.now() + Math.random(),
    type,
    text,
    timestamp: Date.now()
  });
  
  // Auto-scroll chat
  nextTick(() => {
    if (focusChatMessages.value) {
      focusChatMessages.value.scrollTop = focusChatMessages.value.scrollHeight;
    }
  });
}

function processFocusUserMessage(message) {
  isFocusProcessing.value = true;
  isAssistantTyping.value = true;
  
  setTimeout(() => {
    isAssistantTyping.value = false;
    
    const updates = analyzeFocusMessage(message);
    
    if (updates) {
      applyFocusCardUpdates(updates);
      addFocusChatMessage('assistant', `Got it! I've updated your card based on your request.`);
    } else {
      addFocusChatMessage('assistant', `I understand you want to "${message}". Let me help you with that. What specific changes would you like me to make?`);
    }
    
    isFocusProcessing.value = false;
  }, 1000 + Math.random() * 1000);
}

function analyzeFocusMessage(message) {
  const msg = message.toLowerCase();
  
  // Simple message analysis - in real app this would use AI
  if (msg.includes('title') || msg.includes('name')) {
    const match = message.match(/(?:title|name).*?['""]([^'""]+)['""]/) || 
                  message.match(/(?:title|name).*?(?:to|is)\s+(.+?)(?:\.|$)/);
    if (match) {
      return { title: match[1].trim() };
    }
  }
  
  if (msg.includes('description')) {
    const match = message.match(/description.*?['""]([^'""]+)['""]/) || 
                  message.match(/description.*?(?:to|is)\s+(.+?)(?:\.|$)/);
    if (match) {
      return { description: match[1].trim() };
    }
  }
  
  if (msg.includes('add') && msg.includes('item')) {
    const match = message.match(/add.*?['""]([^'""]+)['""]/) || 
                  message.match(/add.*?item\s+(.+?)(?:\.|$)/);
    if (match) {
      return { addItem: match[1].trim() };
    }
  }
  
  return null;
}

function applyFocusCardUpdates(updates) {
  isFocusUpdating.value = true;
  
  Object.keys(updates).forEach(key => {
    if (key === 'addItem' && focusedCard.value.items) {
      focusedCard.value.items.push({
        text: updates[key],
        checked: false
      });
    } else {
      focusedCard.value[key] = updates[key];
    }
  });
  
  // Update the original item in the items array
  const originalItem = items.value.find(item => item.id === selected.value.id);
  if (originalItem) {
    Object.assign(originalItem.props, focusedCard.value);
  }
  playSound('card-update');
  setTimeout(() => {
    isFocusUpdating.value = false;
  }, 500);
}

function simulateFocusCardUpdate() {
  isFocusProcessing.value = true;
  
  setTimeout(() => {
    const randomUpdates = [
      'Added new checklist item',
      'Updated card description', 
      'Modified card title',
      'Changed card priority'
    ];
    
    const update = randomUpdates[Math.floor(Math.random() * randomUpdates.length)];
    addFocusChatMessage('assistant', `${update} based on your voice input.`);
    
    // Simulate actual card change
    simulateRealFocusUpdate();
    
    isFocusProcessing.value = false;
  }, 2000);
}

function simulateRealFocusUpdate() {
  isFocusUpdating.value = true;
  
  // Make a small change to demonstrate reactivity
  if (focusedCard.value.items && Math.random() > 0.5) {
    focusedCard.value.items.push({
      text: `New item ${Date.now()}`,
      checked: false
    });
  } else {
    focusedCard.value.description = `Updated: ${new Date().toLocaleTimeString()}`;
  }
  
  // Update the original item
  const originalItem = items.value.find(item => item.id === selected.value.id);
  if (originalItem) {
    Object.assign(originalItem.props, focusedCard.value);
  }
  
  setTimeout(() => {
    isFocusUpdating.value = false;
  }, 500);
}

function addFocusQuickAction(action) {
  const actionMessages = {
    edit: "I'd like to edit this card",
    duplicate: "Please duplicate this card",
    delete: "Delete this card"
  };
  
  if (action === 'delete') {
    addFocusChatMessage('user', actionMessages[action]);
    addFocusChatMessage('assistant', "Are you sure you want to delete this card? This action cannot be undone.");
  } else {
    processFocusUserMessage(actionMessages[action]);
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Reactive list of cards (updated by realtime hook)
const { items } = useUiStore();

// ---------------------------------------------------------------------------
// Theme toggle (dark / light)
// ---------------------------------------------------------------------------
const isDark = ref(false);
const chatBubbleColor = ref('#3b82f6');
const selectedVoice = ref('alloy'); // Default OpenAI voice
const currentTheme = ref('Ocean Blue');
const backgroundTheme = ref({
  name: 'Ocean Blue', 
  primary: '#0f172a', 
  secondary: '#1e293b',
  accent: '#3b82f6',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
});


onMounted(() => {
  // Initialize theme from localStorage
  const savedDarkMode = localStorage.getItem('theme') === 'dark';
  isDark.value = savedDarkMode;
  
  // Initialize colors and voice
  chatBubbleColor.value = localStorage.getItem('chatBubbleColor') || '#3b82f6';
  selectedVoice.value = localStorage.getItem('selectedVoice') || 'alloy';
  
  // Initialize background theme
  const savedTheme = localStorage.getItem('backgroundTheme');
  if (savedTheme) {
    try {
      backgroundTheme.value = JSON.parse(savedTheme);
      currentTheme.value = backgroundTheme.value.name;
    } catch (e) {
      console.warn('Failed to parse saved theme, using default');
      // Reset to default Ocean Blue theme
      backgroundTheme.value = {
        name: 'Ocean Blue', 
        primary: '#0f172a', 
        secondary: '#1e293b',
        accent: '#3b82f6',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      };
      currentTheme.value = 'Ocean Blue';
    }
  } else {
    // No saved theme, ensure default Ocean Blue is set
    currentTheme.value = 'Ocean Blue';
  }
  
  // Apply theme immediately after setup
  setTimeout(() => {
    applyBackgroundTheme();
  }, 100);
  
  // Add event listeners
  window.addEventListener('keydown', handleFocusModalKeydown);
  window.addEventListener('resize', scrollFocusChatToLatest);
  window.addEventListener('keydown', trapFocusInModal);
});

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleFocusModalKeydown);
  window.removeEventListener('resize', scrollFocusChatToLatest);
  window.removeEventListener('keydown', trapFocusInModal);
});

watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light');
  applyBackgroundTheme(); // Apply theme when dark mode changes
});

function toggleTheme() {
  isDark.value = !isDark.value;
}

function onColorChange(color) {
  chatBubbleColor.value = color;
  localStorage.setItem('chatBubbleColor', color);
}

function onThemeChange(theme) {
  backgroundTheme.value = theme;
  currentTheme.value = theme.name;
  localStorage.setItem('backgroundTheme', JSON.stringify(theme));
  applyBackgroundTheme();
}

function applyBackgroundTheme() {
  const root = document.documentElement;
  
  // Apply theme colors as CSS custom properties
  root.style.setProperty('--bg-gradient', backgroundTheme.value.gradient);
  root.style.setProperty('--theme-primary', backgroundTheme.value.primary);
  root.style.setProperty('--theme-secondary', backgroundTheme.value.secondary);
  root.style.setProperty('--theme-accent', backgroundTheme.value.accent);
  
  // Apply the gradient directly to the app container
  root.style.setProperty('--dynamic-bg', backgroundTheme.value.gradient);
  
  // Helper function to convert hex to rgba
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Update card colors based on theme using compatible CSS
  if (isDark.value) {
    root.style.setProperty('--bg-color', backgroundTheme.value.primary);
    root.style.setProperty('--card-bg', hexToRgba(backgroundTheme.value.secondary, 0.8));
    root.style.setProperty('--card-border-color', hexToRgba(backgroundTheme.value.accent, 0.3));
  } else {
    // Light mode adjustments
    root.style.setProperty('--bg-color', '#f8fafc');
    root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
    root.style.setProperty('--card-border-color', 'rgba(226, 232, 240, 0.8)');
  }
}

function onVoiceChange(voice) {
  selectedVoice.value = voice.id;
  localStorage.setItem('selectedVoice', voice.id);
  
  // If currently connected, reconnect with new voice
  if (rtcStatus.value === 'live') {
    rtc.disconnect();
    setTimeout(() => {
      rtc.connect({ voice: voice.id });
    }, 500);
  }
}

function onSettingsOpen() {
  console.log('Settings opened - Current voice:', selectedVoice.value);
}

function toggleConnection() {
  if (rtcStatus.value === 'live') {
    rtc.disconnect();
  } else if (rtcStatus.value === 'idle') {
    rtc.connect();
  }
}

async function onLogin() {
  error.value = '';
  try {
    const resp = await loginUser({ email: email.value, password: password.value });
    localStorage.setItem('access_token', resp.access_token);
    localStorage.setItem('token_type', resp.token_type);
    isAuthenticated.value = true;
    // Logged in – nothing else to fetch for now.
  } catch (err) {
    error.value = err.message;
  } finally {
    /* nothing */
  }
}



// Keyboard navigation for modal
function handleFocusModalKeydown(e) {
  if (!selected.value) return;
  if (e.key === 'Escape') {
    closeModal();
  } else if (isFocusChatMode.value && e.key === 'Enter' && document.activeElement === focusChatInput.value) {
    sendFocusTextMessage();
  } else if (e.key === 'Tab') {
    // Trap focus within modal controls (simple version)
    const focusable = Array.from(document.querySelectorAll('.focus-modal button, .focus-modal input'));
    const idx = focusable.indexOf(document.activeElement);
    let nextIdx = e.shiftKey ? idx - 1 : idx + 1;
    if (nextIdx < 0) nextIdx = focusable.length - 1;
    if (nextIdx >= focusable.length) nextIdx = 0;
    focusable[nextIdx]?.focus();
    e.preventDefault();
  }
}

function scrollFocusChatToLatest() {
  nextTick(() => {
    if (focusChatMessages.value) {
      focusChatMessages.value.scrollTop = focusChatMessages.value.scrollHeight;
    }
  });
}

// Also call scrollFocusChatToLatest after sending/receiving messages
watch(focusChatHistory, scrollFocusChatToLatest, { deep: true });

// Focus trap for modal accessibility
function trapFocusInModal(e) {
  if (!selected.value) return;
  const focusable = Array.from(document.querySelectorAll('.focus-modal button, .focus-modal input'));
  if (focusable.length === 0) return;
  if (e.key !== 'Tab') return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

// Save chat history on every message
watch(focusChatHistory, (val) => {
  if (selected.value && selected.value.id) {
    setCardChatHistory(selected.value.id, val);
  }
}, { deep: true });

const ariaLiveText = ref('');
const ariaLiveRegion = ref(null);
// Watch for assistant chat messages and card updates
watch(focusChatHistory, (val) => {
  const last = val[val.length - 1];
  if (last && last.type === 'assistant') {
    ariaLiveText.value = last.text;
  }
}, { deep: true });
watch(focusedCard, (val) => {
  if (val && selected.value) {
    ariaLiveText.value = `Card updated: ${val.title || 'Card'}`;
  }
}, { deep: true });

const copyTooltip = ref('Copy link');
function copyCardLink() {
  if (!selected.value) return;
  const url = `${window.location.origin}${window.location.pathname}#card-${selected.value.id}`;
  navigator.clipboard.writeText(url);
  copyTooltip.value = 'Copied!';
  setTimeout(() => { copyTooltip.value = 'Copy link'; }, 1200);
}
</script>

<style scoped>
/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.app-logo {
  position: fixed;
  top: 1rem;
  left: 1rem;
  width: 100px;
  height: auto;
  z-index: 1200;
  pointer-events: none;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--dynamic-bg, var(--bg-gradient, var(--bg-color)));
  color: var(--text-color);
  position: relative;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--dynamic-bg, var(--bg-gradient, var(--bg-color)));
  z-index: 0;
  transition: background 0.5s ease;
}

.app-container > * {
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1rem;
  padding-top: 5rem; /* Proper spacing below fixed logo */
  padding-bottom: 8rem; /* Extra padding for bottom navigation */
}

/* ===== Board Section ===== */
.board-section {
  flex: 1;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.board-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.board-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
  background: var(--card-bg);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--card-border-color);
}

/* ===== Mic Container & Voice Controls ===== */
.mic-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 1200;
}

.connect-btn {
  position: relative;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.connect-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.15);
}

.connect-btn.state-idle {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.connect-btn.state-connecting {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
  animation: pulse 2s infinite;
}

.connect-btn.state-live {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.connect-btn.state-user {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
  animation: listening 2s infinite;
}

.connect-btn.state-assistant {
  background: rgba(236, 72, 153, 0.3);
  border-color: rgba(236, 72, 153, 0.5);
  animation: speaking 1.5s infinite;
}

.mic-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
  z-index: 2;
}

.orb-overlay {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  animation: orb-pulse 2s infinite;
  z-index: 1;
}

.state-pill {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-align: center;
  min-width: 120px; /* Increased to fit longest label */
  max-width: 120px;
  width: 120px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
}

.state-pill.state-idle {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.state-pill.state-connecting {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fcd34d;
}

.state-pill.state-live {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.state-pill.state-user {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.3);
  color: #c4b5fd;
}

.state-pill.state-assistant {
  background: rgba(236, 72, 153, 0.2);
  border-color: rgba(236, 72, 153, 0.3);
  color: #f9a8d4;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes listening {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(139, 92, 246, 0);
  }
}

@keyframes speaking {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(236, 72, 153, 0);
  }
}

@keyframes orb-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* ===== Enhanced Mosaic Grid Layout - Tightly Packed ===== */
.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr); /* Reduced from 16 to 8 columns for tighter packing */
  gap: 0.75rem; /* Reduced gap for closer cards */
  grid-auto-rows: minmax(80px, auto); /* Flexible row sizing */
  grid-auto-flow: row dense; /* Dense packing to fill gaps */
  align-items: start;
  justify-items: stretch;
  width: 100%;
  position: relative;
  padding: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mosaic-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--card-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  align-self: start;
  backdrop-filter: blur(8px);
}

.mosaic-item:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 10;
  border-color: var(--theme-accent, rgba(59, 130, 246, 0.5));
}

/* Child component styling */
.mosaic-item > * {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
}

/* ===== Tightly Packed Size System (8-column grid) ===== */
/* Micro - Smallest indicators (1 column) */
.mosaic-item-micro {
  grid-column: span 1;
  grid-row: span 1;
  min-height: 80px;
}

/* Tiny - Small cards (2 columns) */
.mosaic-item-tiny {
  grid-column: span 2;
  grid-row: span 1;
  min-height: 100px;
}

/* Small - Compact cards (2 columns, 2 rows) */
.mosaic-item-small {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 160px;
}

/* Medium - Standard cards (3 columns, 2 rows) */
.mosaic-item-medium {
  grid-column: span 3;
  grid-row: span 2;
  min-height: 180px;
}

/* Wide - Horizontal cards (4 columns, 1 row) */
.mosaic-item-wide {
  grid-column: span 4;
  grid-row: span 1;
  min-height: 120px;
}

/* Square - Balanced cards (3 columns, 3 rows) */
.mosaic-item-square {
  grid-column: span 3;
  grid-row: span 3;
  min-height: 240px;
}

/* Tall - Vertical cards (2 columns, 3 rows) */
.mosaic-item-tall {
  grid-column: span 2;
  grid-row: span 3;
  min-height: 260px;
}

/* Large - Feature cards (4 columns, 2 rows) */
.mosaic-item-large {
  grid-column: span 4;
  grid-row: span 2;
  min-height: 200px;
}

/* Extra Large - Hero cards (4 columns, 3 rows) */
.mosaic-item-xl {
  grid-column: span 4;
  grid-row: span 3;
  min-height: 280px;
}

/* ===== Ultra-Responsive Design ===== */

/* Large screens - Full 20-column grid */
@media (min-width: 1400px) {
  .mosaic-grid {
    grid-template-columns: repeat(20, 1fr);
    gap: 0.1rem;
    grid-auto-rows: minmax(50px, auto);
  }
}

/* Standard screens - 16-column grid */
@media (max-width: 1399px) and (min-width: 1024px) {
  .mosaic-grid {
    grid-template-columns: repeat(16, 1fr);
    gap: 0.075rem;
    grid-auto-rows: minmax(45px, auto);
  }
  
  .mosaic-item-micro { grid-column: span 2; }
  .mosaic-item-tiny { grid-column: span 2; }
  .mosaic-item-small { grid-column: span 3; }
  .mosaic-item-medium { grid-column: span 5; }
  .mosaic-item-large { grid-column: span 6; }
  .mosaic-item-wide { grid-column: span 8; }
  .mosaic-item-tall { grid-column: span 3; grid-row: span 3; }
  .mosaic-item-xl { grid-column: span 8; }
  .mosaic-item-square { grid-column: span 5; }
}

/* Medium screens - 12-column grid */
@media (max-width: 1023px) and (min-width: 768px) {
  .mosaic-grid {
    grid-template-columns: repeat(12, 1fr);
    gap: 0.1rem;
    grid-auto-rows: minmax(50px, auto);
  }
  
  .mosaic-item-micro { grid-column: span 2; }
  .mosaic-item-tiny { grid-column: span 2; }
  .mosaic-item-small { grid-column: span 3; }
  .mosaic-item-medium { grid-column: span 4; }
  .mosaic-item-large { grid-column: span 6; }
  .mosaic-item-wide { grid-column: span 8; }
  .mosaic-item-tall { grid-column: span 3; grid-row: span 3; }
  .mosaic-item-xl { grid-column: span 8; }
  .mosaic-item-square { grid-column: span 4; }
}

/* Small screens - 8-column grid */
@media (max-width: 767px) {
  .mosaic-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 0.05rem;
    grid-auto-rows: minmax(45px, auto);
    padding: 0.125rem;
  }
  
  .mosaic-item-micro { grid-column: span 2; }
  .mosaic-item-tiny { grid-column: span 2; }
  .mosaic-item-small { grid-column: span 2; }
  .mosaic-item-medium { grid-column: span 4; }
  .mosaic-item-large { grid-column: span 6; }
  .mosaic-item-wide { grid-column: span 6; }
  .mosaic-item-tall { grid-column: span 2; grid-row: span 2; }
  .mosaic-item-xl { grid-column: span 8; }
  .mosaic-item-square { grid-column: span 4; }
}

/* Extra small screens - 6-column grid */
@media (max-width: 480px) {
  .mosaic-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.025rem;
    grid-auto-rows: minmax(40px, auto);
    padding: 0.1rem;
  }
  
  .mosaic-item-micro { grid-column: span 2; }
  .mosaic-item-tiny { grid-column: span 2; }
  .mosaic-item-small { grid-column: span 3; }
  .mosaic-item-medium { grid-column: span 3; }
  .mosaic-item-large { grid-column: span 6; }
  .mosaic-item-wide { grid-column: span 6; }
  .mosaic-item-tall { grid-column: span 3; grid-row: span 2; }
  .mosaic-item-xl { grid-column: span 6; }
  .mosaic-item-square { grid-column: span 3; }
}

/* ===== Enhanced Visual Polish ===== */

/* Improved backdrop for visual cohesion */
.mosaic-grid::before {
  content: '';
  position: absolute;
  top: -0.5rem;
  left: -0.5rem;
  right: -0.5rem;
  bottom: -0.5rem;
  background: linear-gradient(
    135deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.02) 25%,
    rgba(139, 92, 246, 0.02) 50%,
    rgba(236, 72, 153, 0.02) 75%,
    transparent 100%
  );
  border-radius: 16px;
  pointer-events: none;
  z-index: -1;
  opacity: 0.8;
}

/* Faster, smoother card entrance animation */
.mosaic-item {
  animation: mosaicFadeIn 0.3s ease-out;
  animation-fill-mode: both;
}

/* Optimized staggered animation timing */
.mosaic-item:nth-child(1) { animation-delay: 0ms; }
.mosaic-item:nth-child(2) { animation-delay: 50ms; }
.mosaic-item:nth-child(3) { animation-delay: 100ms; }
.mosaic-item:nth-child(4) { animation-delay: 150ms; }
.mosaic-item:nth-child(5) { animation-delay: 200ms; }
.mosaic-item:nth-child(6) { animation-delay: 250ms; }
.mosaic-item:nth-child(7) { animation-delay: 300ms; }
.mosaic-item:nth-child(8) { animation-delay: 350ms; }
.mosaic-item:nth-child(n+9) { animation-delay: 400ms; }

@keyframes mosaicFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Micro-interactions */
.mosaic-item:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease-out;
}

/* Progressive enhancement for different sizes */
.mosaic-item-micro {
  border-width: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.mosaic-item-tiny, .mosaic-item-small {
  border-width: 1px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.mosaic-item-medium, .mosaic-item-square {
  border-width: 1px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.mosaic-item-large, .mosaic-item-wide, .mosaic-item-tall, .mosaic-item-xl {
  border-width: 1px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Responsive Design - Mobile First */
@media screen and (max-width: 768px) {
  .mosaic-grid {
    grid-template-columns: repeat(4, 1fr); /* Fewer columns on mobile */
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  /* Adjust sizes for mobile */
  .mosaic-item-wide,
  .mosaic-item-large,
  .mosaic-item-xl {
    grid-column: span 4; /* Full width on mobile */
  }
  
  .mosaic-item-medium {
    grid-column: span 3;
  }
  
  .mosaic-item-small,
  .mosaic-item-square,
  .mosaic-item-tall {
    grid-column: span 2;
  }
}

@media screen and (max-width: 480px) {
  .mosaic-grid {
    grid-template-columns: repeat(2, 1fr); /* Even simpler on small mobile */
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .mosaic-item-wide,
  .mosaic-item-large,
  .mosaic-item-xl,
  .mosaic-item-medium {
    grid-column: span 2; /* Full width */
    grid-row: span 1; /* Single row to avoid too much height */
  }
  
  .mosaic-item-tall {
    grid-row: span 2; /* Limit tall cards */
  }
}

/* ===== Enhanced Focus Modal System ===== */
.focus-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.focus-modal {
  position: relative;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 20px 48px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.focus-modal.chat-active {
  max-width: 1400px;
}

.modal-glass-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.08) 0%, 
    rgba(139, 92, 246, 0.05) 50%,
    rgba(236, 72, 153, 0.08) 100%
  );
  z-index: 1;
}

.modal-decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
}

.modal-decorative-circle.circle-1 {
  width: 8rem;
  height: 8rem;
  top: -4rem;
  right: -4rem;
  background: rgba(59, 130, 246, 0.1);
}

.modal-decorative-circle.circle-2 {
  width: 12rem;
  height: 12rem;
  bottom: -6rem;
  left: -6rem;
  background: rgba(139, 92, 246, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.focus-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(8px);
}

.focus-icon {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

.focus-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-size: 0.875rem;
  font-weight: 600;
}

.chat-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.chat-toggle-btn.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.modal-content {
  display: flex;
  height: calc(90vh - 5rem);
  position: relative;
  z-index: 2;
}

.card-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  transition: all 0.4s ease;
}

.card-container.condensed {
  flex: 0.6;
}

.enhanced-card-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.focused-card {
  transform: scale(1.1);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.update-indicator {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 600;
}

.update-pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-green 1s ease-in-out infinite;
}

.card-metadata {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}

.metadata-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.chat-container {
  flex: 0.4;
  min-width: 400px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(16px);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.chat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #8b5cf6;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.8;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
}

.chat-status.listening .status-dot {
  background: #3b82f6;
  animation: pulse-blue 1s ease-in-out infinite;
}

.chat-status.speaking .status-dot {
  background: #8b5cf6;
  animation: pulse-purple 1s ease-in-out infinite;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-message {
  display: flex;
  max-width: 80%;
}

.chat-message.user {
  align-self: flex-end;
}

.chat-message.assistant {
  align-self: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-message.user .message-content {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.chat-message.assistant .message-content {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.2);
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
  color: var(--text-color);
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-color);
  border-radius: 50%;
  opacity: 0.4;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

.voice-interaction {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.focus-waveform {
  margin-bottom: 1rem;
  transform: scale(0.8);
}

.interaction-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-weight: 600;
}

.voice-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.voice-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  animation: pulse-voice 2s ease-in-out infinite;
}

.voice-btn.speaking {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #8b5cf6;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-size: 0.8rem;
}

.quick-action:hover {
  background: rgba(255, 255, 255, 0.08);
}

.quick-action.delete {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.quick-action.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.text-input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.text-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-color);
  font-size: 0.875rem;
  outline: none;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.text-input:focus {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.text-input::placeholder {
  color: var(--text-color);
  opacity: 0.5;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.send-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Focus Modal Animations */
@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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

@keyframes pulse-voice {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Dark mode enhancements */
.dark .focus-modal {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .chat-container {
  background: rgba(0, 0, 0, 0.3);
}

/* Modal responsive design */
@media (max-width: 768px) {
  .focus-modal {
    margin: 1rem;
    max-height: 95vh;
  }
  
  .modal-content {
    flex-direction: column;
  }
  
  .chat-container {
    min-width: auto;
    flex: 1;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .card-container.condensed {
    flex: 1;
  }
}

/* ===== Voice Components Styling ===== */

/* Voice Waveform Display */
.voice-waveform-display {
  position: fixed;
  top: 6rem;
  left: 1rem;
  width: 300px;
  z-index: 1100;
  transition: all 0.4s ease;
}

.voice-waveform-display.minimized {
  width: 200px;
  opacity: 0.8;
}

/* Voice Hints Display */
.voice-hints-display {
  position: fixed;
  top: 6rem;
  right: 1rem;
  z-index: 1100;
}

/* Responsive positioning for voice components */
@media (max-width: 1200px) {
  .voice-waveform-display {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .voice-waveform-display {
    position: fixed;
    bottom: 8rem;
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: none;
  }
  
  .voice-hints-display {
    top: auto;
    bottom: 6rem;
    left: 1rem;
    right: 1rem;
    width: auto;
  }
}

/* Hide voice components when modal is open */
.focus-modal-overlay ~ .voice-waveform-display,
.focus-modal-overlay ~ .voice-hints-display {
  opacity: 0.3;
  pointer-events: none;
}

/* ===== Enhanced Focus Modal System ===== */
.focus-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.focus-modal {
  position: relative;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 20px 48px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.focus-modal.chat-active {
  max-width: 1400px;
}

.modal-glass-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.08) 0%, 
    rgba(139, 92, 246, 0.05) 50%,
    rgba(236, 72, 153, 0.08) 100%
  );
  z-index: 1;
}

.modal-decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
}

.modal-decorative-circle.circle-1 {
  width: 8rem;
  height: 8rem;
  top: -4rem;
  right: -4rem;
  background: rgba(59, 130, 246, 0.1);
}

.modal-decorative-circle.circle-2 {
  width: 12rem;
  height: 12rem;
  bottom: -6rem;
  left: -6rem;
  background: rgba(139, 92, 246, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.focus-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(8px);
}

.focus-icon {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

.focus-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-size: 0.875rem;
  font-weight: 600;
}

.chat-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.chat-toggle-btn.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.modal-content {
  display: flex;
  height: calc(90vh - 5rem);
  position: relative;
  z-index: 2;
}

.card-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  transition: all 0.4s ease;
}

.card-container.condensed {
  flex: 0.6;
}

.enhanced-card-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.focused-card {
  transform: scale(1.1);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.update-indicator {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 600;
}

.update-pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-green 1s ease-in-out infinite;
}

.card-metadata {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}

.metadata-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.chat-container {
  flex: 0.4;
  min-width: 400px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(16px);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.chat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #8b5cf6;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.8;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
}

.chat-status.listening .status-dot {
  background: #3b82f6;
  animation: pulse-blue 1s ease-in-out infinite;
}

.chat-status.speaking .status-dot {
  background: #8b5cf6;
  animation: pulse-purple 1s ease-in-out infinite;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-message {
  display: flex;
  max-width: 80%;
}

.chat-message.user {
  align-self: flex-end;
}

.chat-message.assistant {
  align-self: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-message.user .message-content {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.chat-message.assistant .message-content {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.2);
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
  color: var(--text-color);
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-color);
  border-radius: 50%;
  opacity: 0.4;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

.voice-interaction {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.focus-waveform {
  margin-bottom: 1rem;
  transform: scale(0.8);
}

.interaction-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-weight: 600;
}

.voice-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.voice-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  animation: pulse-voice 2s ease-in-out infinite;
}

.voice-btn.speaking {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #8b5cf6;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  font-size: 0.8rem;
}

.quick-action:hover {
  background: rgba(255, 255, 255, 0.08);
}

.quick-action.delete {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.quick-action.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.text-input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.text-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-color);
  font-size: 0.875rem;
  outline: none;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.text-input:focus {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.text-input::placeholder {
  color: var(--text-color);
  opacity: 0.5;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.send-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Focus Modal Animations */
@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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

@keyframes pulse-voice {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Dark mode enhancements for focus modal */
.dark .focus-modal {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .chat-container {
  background: rgba(0, 0, 0, 0.3);
}

/* Modal responsive design */
@media (max-width: 768px) {
  .focus-modal {
    margin: 1rem;
    max-height: 95vh;
  }
  
  .modal-content {
    flex-direction: column;
  }
  
  .chat-container {
    min-width: auto;
    flex: 1;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .card-container.condensed {
    flex: 1;
  }
}

/* Animations for voice components */
.voice-waveform-display,
.voice-hints-display {
  animation: slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Enhanced integration with main layout */
.main-content {
  position: relative;
}

.main-content.has-voice-components {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 1400px) {
  .main-content.has-voice-components {
    padding-left: 18rem; /* Make room for waveform */
    padding-right: 22rem; /* Make room for hints */
  }
}

@media (max-width: 1399px) and (min-width: 1024px) {
  .main-content.has-voice-components {
    padding-left: 16rem;
    padding-right: 20rem;
  }
}

@media (max-width: 1023px) {
  .main-content.has-voice-components {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 12rem; /* Extra space for mobile voice components */
  }
}

.sr-only { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

.copy-link-btn, .back-btn { background: none; border: none; color: var(--text-color); cursor: pointer; margin-right: 0.5rem; position: relative; }
.copy-link-btn .icon, .back-btn .icon { width: 1.1rem; height: 1.1rem; }
.copy-link-btn:hover::after { content: attr(data-tooltip); position: absolute; top: -1.5rem; left: 50%; transform: translateX(-50%); background: #222; color: #fff; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0.95; }
</style>

<style>
:root {
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-color: #1e293b;
  --card-border-color: #e2e8f0;
}

.dark {
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --text-color: #f1f5f9;
  --card-border-color: #334155;
}

.dark .card {
  background: var(--card-bg) !important;
  border-color: var(--card-border-color) !important;
  color: var(--text-color) !important;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-color);
  border: none;
}
</style>
