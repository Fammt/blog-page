<template>
  <div class="posts-view">
    <div class="page-header">
      <h1>Blog Posts</h1>
    </div>

    <!-- Create / Edit Form -->
    <section class="post-form-card">
      <h2 class="form-title">{{ editingId ? 'Edit post' : 'Write a post' }}</h2>
      <div class="form-fields">
        <input
          v-model="form.title"
          class="form-input"
          placeholder="Title"
          autocomplete="off"
        />
        <textarea
          v-model="form.content"
          class="form-textarea"
          placeholder="What's on your mind?"
          rows="6"
        />
      </div>
      <div class="form-actions">
        <button @click="savePost" class="btn-primary">
          {{ editingId ? 'Update' : 'Publish' }}
        </button>
        <button v-if="editingId" @click="cancelEdit" class="btn-secondary">Cancel</button>
      </div>
    </section>

    <!-- Posts list -->
    <div v-if="loading" class="state-message">Loading posts…</div>
    <div v-else-if="posts.length === 0" class="state-message">
      No posts yet. Be the first to write one!
    </div>
    <div v-else class="posts-list">
      <postcard
        v-for="post in posts"
        :key="post._id"
        :post="post"
        :currentUsername="currentUsername"
        :canEdit="true"
        @edit="editPost"
        @delete="deletePost"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import postcard from '@/components/postcard.vue'

const posts = ref([])
const loading = ref(false)
const editingId = ref(null)
const form = ref({ title: '', content: '' })
const currentUsername = ref(localStorage.getItem('username') || null)

async function loadPosts() {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/posts')
    posts.value = await res.json()
  } catch (err) {
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

async function savePost() {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Please log in first')
    return
  }

  const method = editingId.value ? 'PUT' : 'POST'
  const url = editingId.value
    ? `http://localhost:3000/posts/${editingId.value}`
    : 'http://localhost:3000/posts'

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ title: form.value.title, content: form.value.content })
    })

    if (res.ok) {
      form.value = { title: '', content: '' }
      editingId.value = null
      loadPosts()
    } else {
      alert(`Failed to save: ${await res.text()}`)
    }
  } catch (err) {
    console.error('Failed to save post:', err)
  }
}

async function deletePost(id) {
  const token = localStorage.getItem('token')
  if (!token) return
  if (!confirm('Delete this post?')) return

  try {
    const res = await fetch(`http://localhost:3000/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    })
    if (res.ok) loadPosts()
    else alert('Failed to delete post')
  } catch (err) {
    console.error('Failed to delete post:', err)
  }
}

function editPost(post) {
  editingId.value = post._id
  form.value = { title: post.title, content: post.content }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingId.value = null
  form.value = { title: '', content: '' }
}

// Pre-fill from profile page edit action
const editingPost = localStorage.getItem('editingPost')
if (editingPost) {
  const post = JSON.parse(editingPost)
  editingId.value = post._id
  form.value = { title: post.title, content: post.content }
  localStorage.removeItem('editingPost')
}

onMounted(loadPosts)
</script>

<style scoped>
.posts-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 2rem;
}

.post-form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 36px;
}

.form-title {
  font-family: var(--font-sans);
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: var(--font-ui);
  background: var(--color-bg);
  color: var(--color-text-primary);
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(44, 110, 73, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  padding: 9px 20px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: var(--font-ui);
  font-weight: 500;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-secondary {
  padding: 9px 20px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: var(--font-ui);
  transition: background 0.15s, color 0.15s;
}

.btn-secondary:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.state-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.posts-list {
  margin-top: 8px;
}

@media (max-width: 480px) {
  .post-form-card {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
