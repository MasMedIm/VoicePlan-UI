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
      <!-- Mic container with button, state pill, and orb overlay -->
      <div class="mic-container" :class="btnState">
        <button
          :class="['connect-btn', btnState]"
          @click="toggleConnection"
          :disabled="rtcStatus === 'connecting'"
        >
          <span class="mic-icon">🎙️</span>
          <div v-if="btnState === 'state-user'" class="orb-overlay"></div>
        </button>
        <span class="state-pill" :class="btnState">{{ stateLabel }}</span>
      </div>
      <!-- Theme toggle -->
      <button class="theme-toggle" @click="toggleTheme">
        {{ isDark ? '🌞' : '🌙' }}
      </button>

    <!-- --------------------------------------------- -->
    <!-- Board (cards rendered from UI events)          -->
    <!-- --------------------------------------------- -->

    <section v-if="items.length">
      <div class="cards-stack">
        <component
          v-for="it in items"
          :key="it.id"
          :is="componentMap[it.kind] || 'div'"
          :card="it.props"
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
import logoBlack from "../assets/gullie-black-logo.png";
import logoWhite from "../assets/gullie-white-logo.png";
import { useRealtime } from "./composables/useRealtime.js";
import { useUiStore } from "./composables/useUiStore.js";
import CardBasic from "./components/CardBasic.vue";
import CardImage from "./components/CardImage.vue";
import CardChecklist from "./components/CardChecklist.vue";
import CardDate from "./components/CardDate.vue";
import CardLink from "./components/CardLink.vue";
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
// Human-readable status text for pill
// ---------------------------------------------------------------------------
const logoSrc = computed(() => isDark.value ? logoWhite : logoBlack);

const stateLabel = computed(() => {
  switch (btnState.value) {
    case 'state-connecting':
      return 'Connecting';
    case 'state-live':
      return 'Connected';
    case 'state-user':
      return 'You';
    case 'state-assistant':
      return 'Assistant';
    default:
      return 'Disconnected';
  }
});

// Registry of component kinds → Vue component
const componentMap = {
  'card.basic': CardBasic,
  'card.image': CardImage,
  'card.checklist': CardChecklist,
  'card.date': CardDate,
  'card.link': CardLink,
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
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 1rem 5rem; /* bottom space for button */
  overflow-y: auto;
}

/* connect button retains simple styling */

.mic-container {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 1100;
}

.connect-btn {
  position: relative;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  padding: 0;
  background-color: transparent;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.2s;
}

.connect-btn:hover {
  filter: brightness(1.1);
}

/* -------------------- Connect button states -------------------- */

/* Ensure container never shows colored background */
.mic-container.state-idle,
.mic-container.state-connecting,
.mic-container.state-live,
.mic-container.state-user,
.mic-container.state-assistant {
  background: transparent;
}

/* Color / animation on button instead */
.state-idle .connect-btn {
  background-color: #ff8800;
}
.state-connecting .connect-btn {
  background-color: #eab308;
  animation: pulse 1.2s infinite;
}
.state-live .connect-btn {
  background-color: #22c55e;
}
.state-user .connect-btn {
  background: transparent;
}
.state-user .mic-icon { display:none; }
.state-assistant .connect-btn {
  background: #3b82f6;
  animation: wave 1.4s infinite ease-in-out;
}

.state-idle { background: transparent; }

.state-live { background: transparent; }

.state-connecting { background: transparent; }

.state-user {
  background: transparent;
}
.state-user .mic-icon { display:none; }


.orb-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #3ef1ff, #0062ff, #fd3fe3);
  box-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 60px rgba(123,0,255,0.5);
  animation: spin 6s linear infinite;
  pointer-events:none;
  z-index: 0;
}
.orb-overlay::before,
.orb-overlay::after {
  content:'';
  position:absolute;
  inset:0;
  border-radius:50%;
  mix-blend-mode:screen;
  opacity:0.6;
}
.orb-overlay::before {
  background: radial-gradient(circle at 30% 30%, #00eaff, transparent 70%);
  animation: pulseA 4s ease-in-out infinite;
}
.orb-overlay::after {
  background: radial-gradient(circle at 70% 70%, #ff00ff, transparent 70%);
  animation: pulseB 5s ease-in-out infinite reverse;
}

.state-pill {
  margin-top: 2px;
  padding: 4px 14px;
  text-align: center;
  border-radius: 9999px;
  min-width: auto;
  background: rgba(0,0,0,0.04); /* lighter translucent gray */
  color: #111;
  font-size: 0.75rem;
}
.dark .state-pill {
  background: var(--card-bg, #1f2937);
  color: #f9fafb;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulseA {
  0%,100% { transform: scale(1); opacity:0.6; }
  50% { transform: scale(1.1); opacity:0.8; }
}
@keyframes pulseB {
  0%,100% { transform: scale(1); opacity:0.6; }
  50% { transform: scale(1.08); opacity:0.8; }
}
@keyframes pulse2 {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.state-assistant {
  background: radial-gradient(circle at center, #3b82f6 0%, #2563eb 60%, #1e3a8a 100%);
  animation: wave 1.4s infinite ease-in-out;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.3); }
  70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
}

@keyframes wave {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
  

.connect-btn:disabled {
  background-color: #6b7280; /* gray-500 */
  cursor: not-allowed;
}

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

/* Responsive: center cards on small screens */
@media (max-width: 480px) {
  .cards-stack {
    align-items: stretch;
  }
}

.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1rem;
  align-items: center;
}

.cards-stack .card { cursor: pointer; }

.modal-card .card { cursor: default; }

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  transform: scale(1.2);
  cursor: default;
}

section {
  margin-bottom: 2rem;
}

/* duplicate connect-btn definitions removed */
</style>

<style>
:root {
  --bg-color: #f5f5f5;
  --card-bg: #ffffff;
  --text-color: #1a1a1a;
  --card-border-color: #dddddd;
}

.dark {
  --bg-color: #121212;
  --card-bg: #1e1e1e;
  --text-color: #f5f5f5;
  --card-border-color: #333333;
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

.theme-toggle {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  background: rgba(0,0,0,0.15);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  z-index: 1050;
}

.dark .theme-toggle {
  background: rgba(255,255,255,0.15);
}
</style>
