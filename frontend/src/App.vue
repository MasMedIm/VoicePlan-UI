<template>
  <div class="container">
    <h1>VoicePlan MoveOS</h1>

    <div v-if="!isAuthenticated">
      <h2>Login</h2>
      <form @submit.prevent="onLogin">
        <div>
          <label for="email">Email:</label>
          <input id="email" type="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input id="password" type="password" v-model="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p class="error" v-if="error">{{ error }}</p>
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
.container {
  font-family: Arial, Helvetica, sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.error {
  color: red;
  margin-top: 1rem;
}

.healthy {
  color: green;
}

.unhealthy {
  color: red;
}
.log {
  background: #f9f9f9;
  padding: 1rem;
  max-height: 300px;
  overflow: auto;
  text-align: left;
}

section {
  margin-bottom: 2rem;
}
.container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}
.connect-btn {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.25rem;
  padding: 1rem 2rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
  min-width: 200px;
}
.connect-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
