<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/navbar.vue'
</script>

<style>
:root {
  --color-bg: #f7f6f3;
  --color-surface: #ffffff;
  --color-border: #e8e6e0;
  --color-border-hover: #d0cec8;

  --color-text-primary: #1a1917;
  --color-text-secondary: #6b6861;
  --color-text-muted: #9e9b94;

  --color-accent: #2c6e49;
  --color-accent-hover: #235a3b;
  --color-accent-light: #eef4f0;

  --color-danger: #c0392b;
  --color-danger-hover: #a93226;
  --color-danger-light: #fdf0ee;

  --color-warning: #b7791f;
  --color-warning-light: #fef9ee;

  --color-info: #2b5797;
  --color-info-light: #eef2fb;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

  --font-sans: 'Georgia', 'Times New Roman', serif;
  --font-ui: system-ui, -apple-system, sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-ui);
  background: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-sans);
  font-weight: normal;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 16px 12px;
  }

  input, textarea, select {
    font-size: 16px;
  }
}
</style>
