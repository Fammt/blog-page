<template>
  <article class="post-card">
    <div class="post-body">
      <h3 class="post-title">{{ post.title }}</h3>
      <p :class="['post-content', { expanded }]">{{ post.content }}</p>
      <button v-if="isLong" @click="expanded = !expanded" class="read-more">
        {{ expanded ? 'Show less ↑' : 'Read more ↓' }}
      </button>
    </div>

    <footer class="post-footer">
      <div class="post-meta" v-if="showAuthor || post.authorUsername">
        <span class="author-tag">{{ post.authorUsername || 'Anonymous' }}</span>
      </div>
      <div class="post-actions">
        <button v-if="isOwner" @click="$emit('edit', post)" class="action-btn btn-edit">Edit</button>
        <button v-if="isOwner" @click="$emit('delete', post._id)" class="action-btn btn-delete">Delete</button>
        <button
          @click="toggleFavorite"
          :class="['action-btn', 'btn-favorite', { active: isFavorited }]"
          :disabled="favoriteLoading"
        >
          {{ favoriteLoading ? '…' : (isFavorited ? '♥ Saved' : '♡ Save') }}
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  showAuthor: { type: Boolean, default: false },
  currentUsername: { type: String, default: null }
})

const emit = defineEmits(['edit', 'delete', 'favorite-toggled'])

const isFavorited = ref(false)
const favoriteLoading = ref(false)
const expanded = ref(false)

const isLong = computed(() => props.post.content?.length > 300)

const isOwner = computed(() => {
  if (!props.currentUsername) return false
  if (props.post.authorUsername) return props.currentUsername === props.post.authorUsername
  return props.canEdit
})

async function checkFavoriteStatus() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await fetch(`https://blog-backend-0mb0.onrender.com/favorites/check/${props.post._id}`, {
      headers: { Authorization: token }
    })
    const data = await res.json()
    isFavorited.value = data.isFavorited
  } catch {}
}

async function toggleFavorite() {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Please log in to save posts')
    return
  }

  favoriteLoading.value = true
  const method = isFavorited.value ? 'DELETE' : 'POST'

  try {
    const res = await fetch(`https://blog-backend-0mb0.onrender.com/favorites/${props.post._id}`, {
      method,
      headers: { Authorization: token }
    })

    if (res.ok) {
      isFavorited.value = !isFavorited.value
      emit('favorite-toggled', props.post._id, isFavorited.value)
    } else {
      alert(await res.text())
    }
  } catch {
    alert('Network error. Please try again.')
  } finally {
    favoriteLoading.value = false
  }
}

onMounted(checkFavoriteStatus)
</script>

<style scoped>
.post-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.post-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.post-body {
  margin-bottom: 16px;
}

.post-title {
  font-family: var(--font-sans);
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: var(--color-text-primary);
  word-break: break-word;
}

.post-content {
  font-size: 0.925rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  line-clamp: 4;
  overflow: hidden;
  transition: all 0.2s ease;
}

.post-content.expanded {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.read-more {
  background: none;
  border: none;
  padding: 4px 0;
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--color-accent);
  cursor: pointer;
  font-family: var(--font-ui);
  transition: opacity 0.15s;
}

.read-more:hover {
  opacity: 0.7;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.author-tag {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.post-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: var(--font-ui);
  background: transparent;
  color: var(--color-text-secondary);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-edit:hover {
  background: var(--color-info-light);
  color: var(--color-info);
  border-color: var(--color-info);
}

.btn-delete:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-favorite {
  color: var(--color-text-muted);
}

.btn-favorite:hover:not(:disabled) {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-favorite.active {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

@media (max-width: 480px) {
  .post-card {
    padding: 16px;
  }

  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
