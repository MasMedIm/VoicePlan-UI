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
          :class="['mosaic-item', `mosaic-item-${getMosaicSize(index, it)}`]"
          @open="openItem(it)"
        />
      </div>
    </section>

    <!-- Modal overlay -->
    <div v-if="selected" class="modal" @click.self="closeModal">
      <component :is="componentMap[selected.kind]" :card="selected.props" class="modal-card" />
    </div>
    </div>

    <!-- Bottom Pill Navigation -->
    <BottomPillNav 
      :isDark="isDark"
      :voiceState="voiceNavState"
      :isConnecting="rtcStatus === 'connecting'"
      :chatBubbleColor="chatBubbleColor"
      :audioLevel="audioLevel"
      @toggle-theme="toggleTheme"
      @color-change="onColorChange"
      @toggle-voice="toggleConnection"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
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
import BottomPillNav from "./components/BottomPillNav.vue";
import { useVoiceDetection } from "./composables/useVoiceDetection.js";
import { loginUser } from "./lib/api.js";

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
<<<<<<< HEAD
// Voice Status Labels
=======
// Logo selection based on theme
>>>>>>> main
// ---------------------------------------------------------------------------
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

<<<<<<< HEAD
const stateLabel = computed(() => {
  const state = btnState.value;
  return {
    'state-idle': 'Ready to connect',
    'state-connecting': 'Establishing connection',
    'state-live': 'Ready to listen',
    'state-user': 'Processing your voice',
    'state-assistant': 'AI is responding'
  }[state] || 'Ready';
});

const toggleButtonText = computed(() => {
  const state = btnState.value;
  if (state === 'state-connecting') return 'Connecting...';
  if (state === 'state-live' || state === 'state-user' || state === 'state-assistant') return 'Disconnect';
  return 'Connect';
});

=======
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

>>>>>>> main
// ---------------------------------------------------------------------------
// Conservative Mosaic Layout - Content-first sizing for efficient packing
// ---------------------------------------------------------------------------
const getMosaicSize = (index, item) => {
  if (!item) {
    // Simple, predictable pattern that favors smaller sizes
    const patterns = ['tiny', 'small', 'tiny', 'small', 'medium', 'tiny'];
    return patterns[index % patterns.length];
  }

  const cardType = item.kind?.split('.')[1];
  const hasImage = item.props?.image_url;
  const contentLength = item.props?.description?.length || 0;
  const itemCount = item.props?.items?.length || item.props?.steps?.length || 0;
  const hasTitle = item.props?.title?.length > 0;
  
  // Calculate actual content density
  const isContentHeavy = contentLength > 150 || itemCount > 8;
  const isMediumContent = contentLength > 50 || itemCount > 4;
  const isLightContent = contentLength < 30 && itemCount < 3;
  
  // Content-first sizing - be conservative!
  switch(cardType) {
    case 'weather':
    case 'map':
      // Weather/maps need horizontal space but don't go crazy
      return hasImage ? 'wide' : 'medium';
    
    case 'checklist':
    case 'progress':
      // Size based on actual item count, not assumptions
      if (itemCount <= 3) return 'tiny';
      if (itemCount <= 6) return 'small';  // Like the train snacks example
      if (itemCount <= 10) return 'medium';
      return 'tall'; // Only for truly long lists
    
    case 'metric':
      // Metrics should always be compact
      return 'tiny';
    
    case 'image':
      // Images get more space only if they actually have images
      if (hasImage && isContentHeavy) return 'large';
      if (hasImage) return 'medium';
      return 'small';
    
    case 'date':
      // Dates are always brief
      return 'tiny';
    
    case 'link':
      // Links are minimal
      return 'tiny';
    
    case 'basic':
    default:
      // Basic cards based on actual content amount
      if (isLightContent) return 'tiny';
      if (isMediumContent) return 'small';
      if (isContentHeavy) return 'medium';
      return 'small'; // Default to small, not medium
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
};

// Modal for enlarging a card (currently checklist only)
const selected = ref(null); // holds ui item

function openItem(item) {
  selected.value = item;
}

function closeModal() {
  selected.value = null;
}

// Reactive list of cards (updated by realtime hook)
const { items } = useUiStore();

// ---------------------------------------------------------------------------
// Theme toggle (dark / light)
// ---------------------------------------------------------------------------
const isDark = ref(false);
const chatBubbleColor = ref('#3b82f6');

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark';
  chatBubbleColor.value = localStorage.getItem('chatBubbleColor') || '#3b82f6';
});

watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light');
});

function toggleTheme() {
  isDark.value = !isDark.value;
}

function onColorChange(color) {
  // Update reactive reference and store the selected color
  chatBubbleColor.value = color;
  localStorage.setItem('chatBubbleColor', color);
  console.log('Chat bubble color changed to:', color);
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
  background: var(--bg-color);
  color: var(--text-color);
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

/* ===== Compact Mosaic Grid Layout ===== */
.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12-column precision grid */
  gap: 0.25rem; /* Very tight spacing for true mosaic feel */
  grid-auto-rows: 80px; /* Smaller row height for better packing */
  grid-auto-flow: row; /* Ensure proper left-to-right flow */
  align-items: stretch;
  width: 100%;
  position: relative;
  padding: 0.25rem;
}

.mosaic-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
  background: var(--card-bg);
  border: 1px solid var(--card-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mosaic-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
  border-color: rgba(59, 130, 246, 0.3);
}

/* Child component styling */
.mosaic-item > * {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0; /* Let child components handle their own padding */
}

/* ===== Precision Mosaic Size System ===== */
/* Tiny - Perfect for metrics, quick info */
.mosaic-item-tiny {
  grid-column: span 2;
  grid-row: span 1;
}

/* Small - Basic cards, links */
.mosaic-item-small {
  grid-column: span 3;
  grid-row: span 1;
}

/* Medium - Standard content cards */
.mosaic-item-medium {
  grid-column: span 4;
  grid-row: span 2;
}

/* Large - Featured content */
.mosaic-item-large {
  grid-column: span 6;
  grid-row: span 2;
}

/* Wide - Horizontal content like weather, maps */
.mosaic-item-wide {
  grid-column: span 8;
  grid-row: span 1;
}

/* Tall - Vertical content like checklists */
.mosaic-item-tall {
  grid-column: span 3;
  grid-row: span 3;
}

/* Extra Large - Hero cards */
.mosaic-item-xl {
  grid-column: span 6;
  grid-row: span 3;
}

/* Square - Balanced proportions */
.mosaic-item-square {
  grid-column: span 4;
  grid-row: span 3;
}

/* ===== Responsive Mosaic Design ===== */

/* Large screens - Full 12-column grid */
@media (min-width: 1200px) {
  .mosaic-grid {
    gap: 0.375rem; /* Keep tight spacing even on large screens */
  }
}

/* Medium screens - 8-column grid */
@media (max-width: 1199px) and (min-width: 769px) {
  .mosaic-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .mosaic-item-wide { grid-column: span 6; }
  .mosaic-item-xl { grid-column: span 4; grid-row: span 2; }
  .mosaic-item-large { grid-column: span 4; }
  .mosaic-item-square { grid-column: span 3; grid-row: span 2; }
}

/* Small screens - 6-column grid */
@media (max-width: 768px) {
  .mosaic-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.2rem;
    grid-auto-rows: 70px;
    padding: 0.2rem;
  }
  
  .mosaic-item-tiny { grid-column: span 2; }
  .mosaic-item-small { grid-column: span 2; }
  .mosaic-item-medium { grid-column: span 3; grid-row: span 2; }
  .mosaic-item-large { grid-column: span 4; grid-row: span 2; }
  .mosaic-item-wide { grid-column: span 6; grid-row: span 1; }
  .mosaic-item-tall { grid-column: span 2; grid-row: span 2; }
  .mosaic-item-xl { grid-column: span 6; grid-row: span 2; }
  .mosaic-item-square { grid-column: span 3; grid-row: span 2; }
}

/* Extra small screens - 4-column grid */
@media (max-width: 480px) {
  .mosaic-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.15rem;
    grid-auto-rows: 60px;
    padding: 0.15rem;
  }
  
  .mosaic-item-tiny { grid-column: span 2; }
  .mosaic-item-small { grid-column: span 2; }
  .mosaic-item-medium { grid-column: span 2; grid-row: span 2; }
  .mosaic-item-large { grid-column: span 4; grid-row: span 2; }
  .mosaic-item-wide { grid-column: span 4; grid-row: span 1; }
  .mosaic-item-tall { grid-column: span 2; grid-row: span 2; }
  .mosaic-item-xl { grid-column: span 4; grid-row: span 2; }
  .mosaic-item-square { grid-column: span 2; grid-row: span 2; }
}

/* ===== Visual Polish for Mosaic Layout ===== */

/* Subtle backdrop for visual cohesion */
.mosaic-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.01) 25%,
    rgba(139, 92, 246, 0.01) 50%,
    rgba(236, 72, 153, 0.01) 75%,
    transparent 100%
  );
  border-radius: 16px;
  pointer-events: none;
  z-index: -1;
}

/* Enhanced card entrance animation */
.mosaic-item {
  animation: mosaicEnter 0.3s ease-out;
  animation-fill-mode: both;
}

/* Staggered animation for multiple cards */
.mosaic-item:nth-child(1) { animation-delay: 0ms; }
.mosaic-item:nth-child(2) { animation-delay: 50ms; }
.mosaic-item:nth-child(3) { animation-delay: 100ms; }
.mosaic-item:nth-child(4) { animation-delay: 150ms; }
.mosaic-item:nth-child(5) { animation-delay: 200ms; }
.mosaic-item:nth-child(6) { animation-delay: 250ms; }
.mosaic-item:nth-child(7) { animation-delay: 300ms; }
.mosaic-item:nth-child(8) { animation-delay: 350ms; }
.mosaic-item:nth-child(n+9) { animation-delay: 400ms; }

@keyframes mosaicEnter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Add subtle grid lines effect on hover */
.mosaic-grid:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: calc(100% / 12) 100px;
  pointer-events: none;
  z-index: -1;
  opacity: 0;
  animation: gridReveal 0.5s ease-out forwards;
}

@keyframes gridReveal {
  to { opacity: 1; }
}

/* Micro-interactions for cards */
.mosaic-item:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease-out;
}

/* Special styling for different card types */
.mosaic-item-tiny {
  border-width: 1px;
}

.mosaic-item-xl {
  border-width: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.mosaic-item-xl:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* ===== Animations ===== */
@keyframes listening-pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.6); }
}

@keyframes listening-orb {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes listening-ring {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(360deg) scale(1.1); }
}

@keyframes assistant-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* ===== Login Container (unchanged) ===== */
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.login-container h2 {
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 2rem;
  font-weight: 600;
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6e8efb;
  box-shadow: 0 0 0 3px rgba(110, 142, 251, 0.2);
}

.login-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #1a1a1a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #333;
}

.error {
  color: #e74c3c;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
}

/* ===== Modal ===== */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-card {
  transform: scale(1.1);
  cursor: default;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}


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
