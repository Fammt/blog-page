<template>
  <div class="favourites-view">
    <div class="page-header">
      <h1>Saved posts</h1>
    </div>

    <div v-if="!isLoggedIn" class="state-card">
      <p>Log in to see your saved posts.</p>
      <router-link to="/posts" class="btn btn-primary">Browse posts</router-link>
    </div>

    <div v-else-if="loading" class="state-card">
      <p class="muted">Loading…</p>
    </div>

    <div v-else-if="favoritePosts.length === 0" class="state-card">
      <p>You haven't saved any posts yet.</p>
      <p class="muted small">Tap the ♡ button on any post to save it here.</p>
      <router-link to="/posts" class="btn btn-primary">Browse posts</router-link>
    </div>

    <div v-else class="favourites-list">
      <postcard
        v-for="post in favoritePosts"
        :key="post._id"
        :post="post"
        :currentUsername="username"
        :showAuthor="true"
        @favorite-toggled="onFavoriteToggled"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import postcard from '@/components/postcard.vue'

const favoritePosts = ref([])
const loading = ref(false)
const isLoggedIn = ref(false)
const username = ref('')

async function loadFavorites() {
  const token = localStorage.getItem('token')
  if (!token) {
    isLoggedIn.value = false
    return
  }

  isLoggedIn.value = true
  username.value = localStorage.getItem('username') || ''
  loading.value = true

  try {
    const res = await fetch('https://blog-backend-0mb0.onrender.com/favorites', {
      headers: { Authorization: token }
    })
    if (res.ok) favoritePosts.value = await res.json()
    else console.error('Failed to load favourites')
  } catch (err) {
    console.error('Error loading favourites:', err)
  } finally {
    loading.value = false
  }
}

// Optimistically remove post from list when unfavorited instead of doing a full refetch
function onFavoriteToggled(postId, isFavorited) {
  if (!isFavorited) {
    favoritePosts.value = favoritePosts.value.filter(p => p._id !== postId)
  }
}

onMounted(loadFavorites)
</script>

<style scoped>
.favourites-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 2rem;
}

.state-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
}

.muted {
  color: var(--color-text-muted);
}

.small {
  font-size: 0.875rem;
}

.btn {
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: var(--font-ui);
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s;
  margin-top: 4px;
  display: inline-block;
}

.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.favourites-list {
  margin-top: 4px;
}

@media (max-width: 480px) {
  .state-card {
    padding: 32px 16px;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
