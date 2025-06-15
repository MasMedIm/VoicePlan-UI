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
      <!-- Mic container with button, state pill, and orb overlay -->
      <div class="mic-container" :class="btnState">
        <button
          :class="['connect-btn', btnState]"
          @click="toggleConnection"
          :disabled="rtcStatus === 'connecting'"
        >
          <span class="mic-icon">🎙️</span>
        </button>
        <span class="state-pill">{{ stateLabel }}</span>
        <div v-if="btnState === 'state-user'" class="orb-overlay" />
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
        />
      </div>
    </section>
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

// Registry of component kinds → Vue component
const componentMap = {
  'card.basic': CardBasic,
  'card.image': CardImage,
  'card.checklist': CardChecklist,
  'card.date': CardDate,
  'card.link': CardLink,
};

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
  align-items: center;
  gap: 8px;
  z-index: 1100;
}

.connect-btn {
  position: fixed;
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  padding: 0;
  background-color: #ff8800;
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
.state-idle {
  background-color: #ff8800;
}

.state-live {
  background-color: #22c55e;
}

.state-connecting {
  background-color: #eab308;
  animation: pulse 1.2s infinite;
}

.state-user {
  background: transparent;
}
.state-user .mic-icon { display:none; }


.orb-overlay {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #3ef1ff, #0062ff, #fd3fe3);
  box-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 60px rgba(123,0,255,0.5);
  animation: spin 6s linear infinite;
  pointer-events:none;
  z-index: -1;
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
  background: var(--card-bg, #fff);
  color: var(--text-color, #111);
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 9999px;
  box-shadow: 0 0 2px rgba(0,0,0,0.2);
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
