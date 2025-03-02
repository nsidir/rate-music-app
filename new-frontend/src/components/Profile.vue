<template>
    <HeaderBar v-model:modelValue="searchQuery" />
    <div class="profile-container">
      <h1>User Profile</h1>
      <div v-if="loading">Loading profile...</div>
      <div v-else>
        <section class="user-info">
          <h2>{{ profile.user.username }}</h2>
          <p>Email: {{ profile.user.email }}</p>
        </section>
  
        <section class="favorites" v-if="profile.favorites && profile.favorites.length">
          <h3>Favorites</h3>
          <ul>
            <li v-for="fav in profile.favorites" :key="fav.album_id">
              {{ fav.album_name }}
            </li>
          </ul>
        </section>
  
        <section class="ratings" v-if="profile.ratings && profile.ratings.length">
          <h3>Ratings</h3>
          <ul>
            <li v-for="rating in profile.ratings" :key="rating.album_id">
              {{ rating.album_name }}: {{ rating.rating }}
            </li>
          </ul>
        </section>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '../stores/user'
  import type { User } from '../stores/user'
  import HeaderBar from './HeaderBar.vue'

  const searchQuery = ref('')
  
  // Extending the User interface from the store for profile data
  interface UserProfile {
    user: User;
    favorites: { album_id: number; album_name: string }[];
    ratings: { album_id: number; album_name: string; rating: number }[];
  }
  
  const profile = ref<UserProfile>({
    user: { id: 0, username: '', email: '' },
    favorites: [],
    ratings: []
  })
  const loading = ref(false)
  const error = ref('')
  const router = useRouter()
  
  // user data from the store
  const userStore = useUserStore()
  const userId = userStore.user?.id
  
  // If user is not logged in, redirect to login
  if (!userId) {
    router.push('/login')
  }
  
  onMounted(async () => {
    loading.value = true
    error.value = ''
    // Retrieve JWT token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/user/profile/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        error.value = 'Failed to fetch profile data'
        return
      }
      const data = await response.json()
      profile.value = data
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching profile data'
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #191b28;
    border-radius: 8px;
    color: #fff;
  }
  
  .user-info {
    margin-bottom: 20px;
  }
  
  .favorites, .ratings {
    margin-bottom: 20px;
  }
  
  .error {
    color: red;
  }
  </style>