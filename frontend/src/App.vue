<template>
  <div class="app-container">
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
      <!-- Connect / Disconnect button -->
      <button
        class="connect-btn"
        @click="toggleConnection"
        :disabled="rtcStatus === 'connecting'"
      >
        <template v-if="rtcStatus === 'connecting'">Connecting…</template>
        <template v-else-if="talking === 'user'">You’re speaking…</template>
        <template v-else-if="talking === 'assistant'">Assistant speaking…</template>
        <template v-else-if="rtcStatus === 'live'">Disconnect</template>
        <template v-else>Connect</template>
      </button>

    <!-- --------------------------------------------- -->
    <!-- Board (cards rendered from UI events)          -->
    <!-- --------------------------------------------- -->

    <section v-if="cardList.length">
      <h2>Your Planning Board</h2>
      <div class="cards-stack">
        <Card
          v-for="c in cardList"
          :key="c.id"
          :card="c"
        />
      </div>
    </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRealtime } from "./composables/useRealtime.js";
import { useUiStore } from "./composables/useUiStore.js";
import Card from "./components/Card.vue";
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

// Reactive list of cards (updated by realtime hook)
const { cardList } = useUiStore();

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
  background: #f5f5f5;
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

.connect-btn {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 1000;
  min-width: 200px;
  transition: background-color 0.2s;
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
