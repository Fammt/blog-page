<template>
  <div class="auth-form">
    <h2 class="auth-title">{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</h2>

    <div class="auth-tabs">
      <button :class="['tab', { active: mode === 'login' }]" @click="mode = 'login'">Login</button>
      <button :class="['tab', { active: mode === 'signup' }]" @click="mode = 'signup'">Sign up</button>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="field">
        <label class="field-label">Username</label>
        <input
          v-model="form.username"
          type="text"
          class="field-input"
          placeholder="your_username"
          autocomplete="username"
          required
        />
      </div>

      <div class="field">
        <label class="field-label">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="field-input"
          placeholder="••••••••"
          autocomplete="current-password"
          required
        />
      </div>

      <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>
      <div v-if="success" class="alert alert-success" role="status">{{ success }}</div>

      <button type="submit" :disabled="loading" class="submit-btn">
        <span v-if="loading" class="loading-dots">Processing</span>
        <span v-else>{{ mode === 'login' ? 'Login' : 'Create account' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['auth-success'])

const mode = ref('login')
const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const success = ref('')

async function handleSubmit() {
  error.value = ''
  success.value = ''
  loading.value = true

  const url = mode.value === 'login'
    ? 'http://localhost:3000/login'
    : 'http://localhost:3000/signup'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.value.username,
        password: form.value.password
      })
    })

    if (mode.value === 'login') {
      if (!response.ok) {
        error.value = await response.text() || 'Login failed'
        return
      }
      const data = await response.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', form.value.username)
        success.value = 'Login successful!'
        setTimeout(() => emit('auth-success'), 800)
      } else {
        error.value = 'Login failed. No token received.'
      }
    } else {
      if (response.ok) {
        success.value = 'Account created! Please log in.'
        mode.value = 'login'
        form.value = { username: '', password: '' }
      } else {
        error.value = await response.text() || 'Signup failed'
      }
    }
  } catch {
    error.value = 'Network error. Is the backend running?'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  padding: 4px 0;
}

.auth-title {
  font-family: var(--font-sans);
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.auth-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  transition: color 0.15s, border-color 0.15s;
  font-family: var(--font-ui);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  font-weight: 500;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: var(--font-ui);
  background: var(--color-bg);
  color: var(--color-text-primary);
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(44, 110, 73, 0.1);
}

.alert {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.alert-error {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border: 1px solid rgba(192, 57, 43, 0.2);
}

.alert-success {
  background: var(--color-accent-light);
  color: var(--color-accent);
  border: 1px solid rgba(44, 110, 73, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 11px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.95rem;
  font-family: var(--font-ui);
  font-weight: 500;
  transition: background 0.15s, opacity 0.15s;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
