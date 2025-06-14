<template>
  <div class="app-container">
    <div class="split-screen">
      <!-- Left Side -->
      <div class="left-side">
        <div class="title-container">
          <div class="icon">🎙️</div>
          <h1>gullieGo</h1>
          <p class="tagline">make life happen</p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="right-side">
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
    <div v-else>
      <section>
        <h2>Backend Status</h2>
        <p v-if="loading">Checking...</p>
        <p v-else>
          <strong :class="statusClass">{{ statusText }}</strong>
        </p>
      </section>

      <section>
        <h2>Realtime Demo</h2>
        <button
          class="connect-btn"
          @click="onConnect"
          :disabled="rtc.status === 'connecting' || rtc.status === 'live'"
        >
          {{ rtc.status === 'live' ? 'Connected' : 'Connect' }}
        </button>
        <button v-if="rtc.status === 'live'" @click="rtc.disconnect">Disconnect</button>
        <p>Status: {{ rtc.status }}</p>

        <pre class="log" v-if="rtc.messages.length">{{ rtc.messages }}</pre>
      </section>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRealtime } from "./composables/useRealtime.js";
import { fetchHealth, loginUser } from "./lib/api.js";

const loading = ref(true);
const status = ref(null);
const email = ref('');
const password = ref('');
const error = ref('');
const isAuthenticated = ref(!!localStorage.getItem('access_token'));

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const data = await fetchHealth();
      status.value = data;
    } catch (err) {
      status.value = { app: "error", db: "error" };
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});

const statusText = computed(() => {
  if (!status.value) return "Unknown";
  return status.value.app === "ok" && status.value.db === "ok" ? "Healthy" : "Unhealthy";
});

const statusClass = computed(() => {
  return statusText.value === "Healthy" ? "healthy" : "unhealthy";
});

// ---------------------------------------------------------------------------
// Realtime WebRTC hook
// ---------------------------------------------------------------------------

const rtc = useRealtime();

function onConnect() {
  rtc.connect();
}

async function onLogin() {
  error.value = '';
  try {
    const resp = await loginUser({ email: email.value, password: password.value });
    localStorage.setItem('access_token', resp.access_token);
    localStorage.setItem('token_type', resp.token_type);
    isAuthenticated.value = true;
    loading.value = true;
    const data = await fetchHealth();
    status.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.split-screen {
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Left Side */
.left-side {
  flex: 1 1 50%;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f0f0f0;
  padding: 2rem;
  margin: 0;
  position: relative;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}

.left-side::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(200, 200, 200, 0.02) 0%, transparent 50%);
  z-index: 1;
}

.title-container {
  text-align: center;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-container .icon {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  line-height: 1;
  opacity: 0.9;
  transform: translateY(5px);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(5px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(5px); }
}

.title-container h1 {
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -2px;
  margin: 0.5rem 0 0;
  line-height: 1;
  color: #ffffff;
  text-transform: none;
  font-family: 'Inter', -apple-system, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  display: inline-block;
}

.title-container h1::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

.tagline {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 1rem;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: lowercase;
  font-style: italic;
}

/* Right Side */
.right-side {
  flex: 1 1 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 0;
  background-color: #f5f5f5;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
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

/* Responsive Design */
@media (max-width: 768px) {
  .split-screen {
    flex-direction: column;
  }
  
  .left-side, .right-side {
    flex: none;
    height: 50%;
  }
  
  .kali-container h1 {
    font-size: 4rem;
  }
}

/* Existing styles that might be used elsewhere */
.healthy {
  color: #2ecc71;
}

.unhealthy {
  color: #e74c3c;
}

.log {
  background: #f9f9f9;
  padding: 1rem;
  max-height: 300px;
  overflow: auto;
  text-align: left;
  font-family: monospace;
  font-size: 0.875rem;
  border-radius: 4px;
  margin-top: 1rem;
}

section {
  margin-bottom: 2rem;
}

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

.connect-btn:hover {
  background-color: #333;
}

.connect-btn:disabled {
  background-color: #b3b3b3;
  cursor: not-allowed;
}
</style>
