<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="logo">
        <router-link to="/">AnonBlog</router-link>
      </div>

      <div class="nav-links">
        <router-link to="/posts">Posts</router-link>
        <router-link to="/favourites">Favourites</router-link>
        <router-link to="/profile">Profile</router-link>
      </div>

      <div class="auth-status">
        <span v-if="isLoggedIn" class="username">{{ username }}</span>
        <button v-if="isLoggedIn" @click="handleLogout" class="btn btn-logout">Logout</button>
        <button v-else @click="showAuthModal = true" class="btn btn-login">Sign in</button>
      </div>
    </div>

    <div v-if="showAuthModal" class="modal-backdrop" @click.self="showAuthModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showAuthModal = false" aria-label="Close">&times;</button>
        <AuthForm @auth-success="onAuthSuccess" />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthForm from './authform.vue'

const router = useRouter()
const isLoggedIn = ref(false)
const username = ref('')
const showAuthModal = ref(false)

function checkAuthStatus() {
  const token = localStorage.getItem('token')
  const storedUsername = localStorage.getItem('username')
  if (token && storedUsername) {
    isLoggedIn.value = true
    username.value = storedUsername
  } else {
    isLoggedIn.value = false
    username.value = ''
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  checkAuthStatus()
  router.push('/')
}

function onAuthSuccess() {
  showAuthModal.value = false
  checkAuthStatus()
  // Notify other components (e.g. profile, favourites) that auth changed
  window.dispatchEvent(new Event('auth-changed'))
}

// Keep in sync if user logs in/out in another tab
function onStorageChange(e) {
  if (e.key === 'token' || e.key === 'username') {
    checkAuthStatus()
  }
}

onMounted(() => {
  checkAuthStatus()
  window.addEventListener('storage', onStorageChange)
  // Also listen for our own auth-changed event (same tab)
  window.addEventListener('auth-changed', checkAuthStatus)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorageChange)
  window.removeEventListener('auth-changed', checkAuthStatus)
})
</script>

<style scoped>
.navbar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo a {
  font-family: var(--font-sans);
  font-size: 1.25rem;
  color: var(--color-text-primary);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  transition: color 0.15s, background 0.15s;
}

.nav-links a:hover {
  color: var(--color-text-primary);
  background: var(--color-bg);
}

.nav-links a.router-link-active {
  color: var(--color-text-primary);
  background: var(--color-bg);
  font-weight: 500;
}

.auth-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.btn {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: var(--font-ui);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.btn-login {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.btn-login:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.btn-logout {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.btn-logout:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 400px;
  max-width: calc(100vw - 32px);
  position: relative;
  box-shadow: var(--shadow-md);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--color-text-muted);
  line-height: 1;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
}

.modal-close:hover {
  color: var(--color-text-primary);
  background: var(--color-bg);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
    flex-wrap: wrap;
    height: auto;
    padding-top: 12px;
    padding-bottom: 12px;
    gap: 10px;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .username {
    display: none;
  }

  .nav-links a {
    padding: 5px 8px;
    font-size: 0.8rem;
  }
}
</style>
