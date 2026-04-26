<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">AnonBlog</h1>
      <p class="hero-subtitle">Share your thoughts, stories, and ideas — anonymously.</p>
      <div class="hero-actions">
        <router-link to="/posts" class="btn btn-primary">Browse posts</router-link>
        <router-link to="/profile" class="btn btn-outline">My profile</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <span class="feature-icon">✎</span>
        <h3>Write posts</h3>
        <p>Create, edit, and manage your blog posts with ease.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">♡</span>
        <h3>Save favourites</h3>
        <p>Bookmark posts you love and revisit them anytime.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">◯</span>
        <h3>Stay anonymous</h3>
        <p>Write freely under a username — no real info required.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// static page, no logic needed
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 60px 20px 56px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 48px;
}

.hero-title {
  font-family: var(--font-sans);
  font-size: 3rem;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  color: var(--color-text-primary);
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: var(--font-ui);
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
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

.btn-outline {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.btn-outline:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border-hover);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding-bottom: 8px;
}

.feature-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: 1.4rem;
  display: block;
  margin-bottom: 12px;
  color: var(--color-accent);
}

.feature-card h3 {
  font-family: var(--font-sans);
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 480px) {
  .hero {
    padding: 40px 12px 36px;
    margin-bottom: 32px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    text-align: center;
  }
}
</style>
