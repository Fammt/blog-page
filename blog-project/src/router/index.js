import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import posts from '@/views/posts.vue'
import profile from '@/views/profile.vue'
import favourites from '@/views/favourites.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: home
  }, 
  {
    path: '/posts',
    name: 'posts',
    component: posts
  },
  {
    path: '/profile',
    name: 'profile',
    component: profile
  },
  {
    path: '/favourites',
    name: 'favourites',
    component: favourites
  }
  
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
