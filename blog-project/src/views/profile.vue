<template>
  <div class="profile-view">
    <div class="page-header">
      <h1>My Profile</h1>
    </div>

    <!-- User Info -->
    <section class="profile-card">
      <div v-if="isLoggedIn" class="user-info">
        <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
        <div class="user-details">
          <p class="user-name">{{ username }}</p>
          <p class="user-label">Member</p>
        </div>
        <div class="user-actions">
          <button @click="logout" class="btn btn-outline">Logout</button>
          <button @click="deleteAccount" class="btn btn-danger">Delete account</button>
        </div>
      </div>
      <div v-else class="not-logged-in">
        <p>Please log in to view your profile.</p>
        <router-link to="/posts" class="btn btn-primary">Browse posts</router-link>
      </div>
    </section>

    <!-- My Posts -->
    <section v-if="isLoggedIn" class="my-posts">
      <h2 class="section-title">My posts</h2>
      <div v-if="myPosts.length === 0" class="state-message">
        You haven't written any posts yet.
      </div>
      <postcard
        v-else
        v-for="post in myPosts"
        :key="post._id"
        :post="post"
        :currentUsername="username"
        :canEdit="true"
        @edit="editPost"
        @delete="deletePost"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import postcard from '@/components/postcard.vue'

const router = useRouter()
const username = ref('')
const isLoggedIn = ref(false)
const myPosts = ref([])

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  username.value = ''
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/')
}

function loadUserInfo() {
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
    username.value = localStorage.getItem('username') || 'User'
  }
}

async function loadMyPosts() {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const res = await fetch('http://localhost:3000/my-posts', {
      headers: { Authorization: token }
    })
    if (res.ok) myPosts.value = await res.json()
    else console.error('Failed to load posts')
  } catch (err) {
    console.error('Error loading posts:', err)
  }
}

function editPost(post) {
  localStorage.setItem('editingPost', JSON.stringify(post))
  router.push('/posts')
}

async function deletePost(id) {
  const token = localStorage.getItem('token')
  if (!confirm('Delete this post?')) return

  try {
    const res = await fetch(`http://localhost:3000/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    })
    if (res.ok) loadMyPosts()
    else alert('Failed to delete post')
  } catch (err) {
    console.error('Error deleting post:', err)
  }
}

async function deleteAccount() {
  if (!confirm('This will permanently delete your account, all posts, and favourites. This cannot be undone. Are you sure?')) return

  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/delete-account', {
      method: 'DELETE',
      headers: { Authorization: token }
    })
    if (res.ok) {
      alert('Account deleted.')
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
    } else {
      alert(`Failed: ${await res.text()}`)
    }
  } catch {
    alert('Network error. Please try again.')
  }
}

onMounted(() => {
  loadUserInfo()
  loadMyPosts()
})
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 2rem;
}

.profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 32px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 500;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.user-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.not-logged-in {
  text-align: center;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--color-text-secondary);
}

.section-title {
  font-family: var(--font-sans);
  font-size: 1.3rem;
  margin-bottom: 16px;
  color: var(--color-text-secondary);
}

.my-posts {
  margin-top: 8px;
}

.state-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  font-family: var(--font-ui);
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-block;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-outline {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.btn-outline:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border-color: var(--color-border-hover);
}

.btn-danger {
  background: transparent;
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger-light);
}

@media (max-width: 480px) {
  .profile-card {
    padding: 16px;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-actions {
    width: 100%;
  }

  .btn {
    flex: 1;
    text-align: center;
  }
}
</style>
