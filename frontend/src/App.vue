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
          :class="['mosaic-item', `mosaic-item-${determineCardSize(it.props)}`]"
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
// Logo selection based on theme
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

// ====== Dynamic Mosaic Sizing - Ultra-Aggressive for Tight Packing ======
const determineCardSize = (card) => {
  const cardType = card.kind ? card.kind.split('.')[1] : 'basic';
  
  // Content analysis
  const itemCount = card.items?.length || 0;
  const hasImage = !!card.image_url;
  const descLength = (card.description || '').length;
  const titleLength = (card.title || '').length;
  
  // More aggressive content thresholds for ultra-tight packing
  const isMinimalContent = descLength <= 30 && titleLength <= 25 && itemCount <= 1;
  const isLightContent = descLength <= 60 && titleLength <= 40 && itemCount <= 3;
  const isMediumContent = descLength <= 120 && titleLength <= 60 && itemCount <= 6;
  
  // Ultra-aggressive sizing - bias heavily toward micro/tiny for dense layout
  switch(cardType) {
    case 'metric':
      // Metrics are always micro for maximum density
      return 'micro';
    
    case 'date':
      // Dates are micro unless they have descriptions
      return descLength > 0 ? 'tiny' : 'micro';
    
    case 'link':
      // Links stay minimal for tight packing
      return isMinimalContent ? 'micro' : 'tiny';
    
    case 'basic':
      // Basic cards - be extremely conservative
      if (isMinimalContent) return 'micro';
      if (isLightContent) return 'tiny';
      if (isMediumContent) return 'small';
      return 'medium'; // Only for substantial content
    
    case 'image':
      // Images can be slightly larger but still controlled
      if (!hasImage) return 'micro';
      if (isMinimalContent) return 'tiny';
      if (isLightContent) return 'small';
      return 'medium'; // Max size for images
    
    case 'checklist':
    case 'progress':
      // Checklists sized by item count
      if (itemCount <= 1) return 'micro';
      if (itemCount <= 2) return 'tiny';
      if (itemCount <= 4) return 'small';
      if (itemCount <= 7) return 'medium';
      return 'tall'; // Only for very long lists
    
    case 'weather':
      // Weather cards stay compact
      return isMediumContent ? 'medium' : 'small';
    
    case 'map':
      // Maps need some width but keep controlled
      return isMediumContent ? 'wide' : 'medium';
    
    default:
      // Default to micro for unknown types
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

/* ===== Ultra-Tight Mosaic Grid Layout ===== */
.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(20, 1fr); /* Increased to 20 columns for ultra-fine control */
  gap: 0.075rem; /* Even tighter spacing */
  grid-auto-rows: minmax(45px, auto); /* Dynamic row sizing based on content */
  grid-auto-flow: row dense; /* Dense packing fills gaps automatically */
  align-items: stretch;
  justify-items: stretch;
  width: 100%;
  position: relative;
  padding: 0.25rem;
  /* Ensure smooth layout transitions */
  transition: all 0.3s ease;
}

.mosaic-item {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px; /* Smaller radius for tighter look */
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  /* Content-based height */
  height: fit-content;
  align-self: start;
}

.mosaic-item:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  z-index: 10;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Child component styling - remove default padding */
.mosaic-item > * {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
}

/* ===== Refined Content-Aware Size System (20-column grid) ===== */
/* Micro - For tiny metrics and indicators */
.mosaic-item-micro {
  grid-column: span 2;
  grid-row: span 1;
}

/* Tiny - Perfect for metrics, quick info */
.mosaic-item-tiny {
  grid-column: span 3;
  grid-row: span 1;
}

/* Small - Basic cards, links */
.mosaic-item-small {
  grid-column: span 4;
  grid-row: span 1;
}

/* Medium - Standard content cards */
.mosaic-item-medium {
  grid-column: span 6;
  grid-row: span 2;
}

/* Large - Featured content */
.mosaic-item-large {
  grid-column: span 8;
  grid-row: span 2;
}

/* Wide - Horizontal content like weather, maps */
.mosaic-item-wide {
  grid-column: span 10;
  grid-row: span 1;
}

/* Tall - Vertical content like checklists */
.mosaic-item-tall {
  grid-column: span 4;
  grid-row: span 3;
}

/* Extra Large - Hero cards */
.mosaic-item-xl {
  grid-column: span 10;
  grid-row: span 2;
}

/* Square - Balanced proportions */
.mosaic-item-square {
  grid-column: span 6;
  grid-row: span 2;
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
    rgba(59, 130, 246, 0.015) 25%,
    rgba(139, 92, 246, 0.015) 50%,
    rgba(236, 72, 153, 0.015) 75%,
    transparent 100%
  );
  border-radius: 16px;
  pointer-events: none;
  z-index: -1;
  opacity: 0.8;
}

/* Faster, smoother card entrance animation */
.mosaic-item {
  animation: mosaicFadeIn 0.2s ease-out;
  animation-fill-mode: both;
}

/* Optimized staggered animation timing */
.mosaic-item:nth-child(1) { animation-delay: 0ms; }
.mosaic-item:nth-child(2) { animation-delay: 15ms; }
.mosaic-item:nth-child(3) { animation-delay: 30ms; }
.mosaic-item:nth-child(4) { animation-delay: 45ms; }
.mosaic-item:nth-child(5) { animation-delay: 60ms; }
.mosaic-item:nth-child(6) { animation-delay: 75ms; }
.mosaic-item:nth-child(7) { animation-delay: 90ms; }
.mosaic-item:nth-child(8) { animation-delay: 105ms; }
.mosaic-item:nth-child(n+9) { animation-delay: 120ms; }

@keyframes mosaicFadeIn {
  from {
    opacity: 0;
    transform: translateY(3px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Micro-interactions */
.mosaic-item:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.08s ease-out;
}

/* Progressive enhancement for different sizes */
.mosaic-item-micro {
  border-width: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.mosaic-item-tiny, .mosaic-item-small {
  border-width: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.mosaic-item-medium, .mosaic-item-square {
  border-width: 1px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.mosaic-item-large, .mosaic-item-wide, .mosaic-item-tall {
  border-width: 1px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.mosaic-item-xl {
  border-width: 2px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

/* Enhanced hover effects */
.mosaic-item-xl:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* Grid visualization on hover (optional) */
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
  background-size: calc(100% / 20) 45px;
  pointer-events: none;
  z-index: -1;
  opacity: 0;
  animation: gridReveal 0.2s ease-out forwards;
}

@keyframes gridReveal {
  to { opacity: 1; }
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
