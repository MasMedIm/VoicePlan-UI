<template>
  <div class="app-container" :class="{ dark: isDark }">
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
      
      <!-- Voice Control Container -->
      <div class="voice-control-container">
        <div class="voice-status-panel" :class="btnState">
          <div class="status-indicator">
            <div class="status-icon" :class="btnState">
              <span v-if="btnState !== 'state-user'" class="mic-icon">🎙️</span>
            </div>
            <div v-if="btnState === 'state-user'" class="listening-orb" />
          </div>
          <div class="status-text">
            <h3 class="status-title">{{ stateTitle }}</h3>
            <p class="status-subtitle">{{ stateLabel }}</p>
          </div>
          <button
            :class="['voice-toggle-btn', btnState]"
            @click="toggleConnection"
            :disabled="rtcStatus === 'connecting'"
          >
            {{ toggleButtonText }}
          </button>
        </div>
      </div>

      <!-- Theme toggle -->
      <button class="theme-toggle" @click="toggleTheme">
        {{ isDark ? '🌞' : '🌙' }}
      </button>

    <!-- --------------------------------------------- -->
    <!-- Mosaic Board (cards rendered from UI events) -->
    <!-- --------------------------------------------- -->

    <section v-if="items.length" class="board-section">
      <div class="board-header">
        <h2 class="board-title">Travel Planning Board</h2>
        <div class="board-stats">
          <span class="stat">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      <div class="mosaic-grid">
        <component
          v-for="(it, index) in items"
          :key="it.id"
          :is="componentMap[it.kind] || 'div'"
          :card="it.props"
          :class="['mosaic-item', `mosaic-item-${getMosaicSize(index)}`]"
          @open="openItem(it)"
        />
      </div>
    </section>

    <!-- Modal overlay -->
    <div v-if="selected" class="modal" @click.self="closeModal">
      <component :is="componentMap[selected.kind]" :card="selected.props" class="modal-card" />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
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
// Connect button visual state
// ---------------------------------------------------------------------------
const btnState = computed(() => {
  if (rtcStatus.value === 'connecting') return 'state-connecting';
  if (rtcStatus.value === 'live') {
    if (talking.value === 'user') return 'state-user';
    if (talking.value === 'assistant') return 'state-assistant';
    return 'state-live';
  }
  return 'state-idle';
});

// ---------------------------------------------------------------------------
// Voice Status Labels
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

// ---------------------------------------------------------------------------
// Mosaic Layout Logic
// ---------------------------------------------------------------------------
const getMosaicSize = (index) => {
  // Create a varied mosaic pattern
  const patterns = ['small', 'medium', 'large', 'wide', 'tall'];
  return patterns[index % patterns.length];
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

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark';
});

watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light');
});

function toggleTheme() {
  isDark.value = !isDark.value;
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
  padding-bottom: 2rem;
}

/* ===== Voice Control Container ===== */
.voice-control-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-color);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--card-border-color);
  margin: -1rem -1rem 2rem -1rem;
  padding: 1.5rem;
}

.voice-status-panel {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--card-bg);
  border: 2px solid var(--card-border-color);
  border-radius: 20px;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.voice-status-panel.state-connecting {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
}

.voice-status-panel.state-live {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
}

.voice-status-panel.state-user {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
  animation: listening-pulse 2s ease-in-out infinite;
}

.voice-status-panel.state-assistant {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08));
}

.status-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.status-icon.state-idle {
  background: linear-gradient(135deg, #ff8800, #ff6b00);
  color: white;
}

.status-icon.state-connecting {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  animation: pulse 1.5s infinite;
}

.status-icon.state-live {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-icon.state-assistant {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  animation: assistant-glow 1.8s ease-in-out infinite;
}

.listening-orb {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #3ef1ff, #0062ff, #fd3fe3);
  position: relative;
  animation: listening-orb 2s linear infinite;
}

.listening-orb::before,
.listening-orb::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3ef1ff, #0062ff, #fd3fe3, #3ef1ff);
  animation: listening-ring 3s linear infinite;
  z-index: -1;
  filter: blur(8px);
  opacity: 0.7;
}

.listening-orb::after {
  animation-direction: reverse;
  animation-duration: 2s;
  filter: blur(4px);
}

.status-text {
  flex: 1;
  text-align: left;
}

.status-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: var(--text-color);
}

.status-subtitle {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
}

.voice-toggle-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.voice-toggle-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.voice-toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.voice-toggle-btn.state-live,
.voice-toggle-btn.state-user,
.voice-toggle-btn.state-assistant {
  background: linear-gradient(135deg, #ef4444, #dc2626);
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

/* ===== Mosaic Grid Layout ===== */
.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  grid-auto-rows: minmax(120px, auto);
}

.mosaic-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mosaic-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Mosaic size variations */
.mosaic-item-small {
  grid-row: span 1;
}

.mosaic-item-medium {
  grid-row: span 2;
}

.mosaic-item-large {
  grid-row: span 3;
  grid-column: span 1;
}

.mosaic-item-wide {
  grid-column: span 2;
  grid-row: span 1;
}

.mosaic-item-tall {
  grid-row: span 4;
}

@media (max-width: 768px) {
  .mosaic-grid {
    grid-template-columns: 1fr;
  }
  
  .mosaic-item-wide,
  .mosaic-item-large {
    grid-column: span 1;
  }
  
  .voice-status-panel {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .status-text {
    text-align: center;
  }
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

/* ===== Theme Toggle ===== */
.theme-toggle {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  background: var(--card-bg);
  border: 2px solid var(--card-border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1050;
}

.theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
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
