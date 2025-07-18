<template>
  <HeaderBar v-model:modelValue="searchQuery" />
  <div class="profile-container">
    <h1>User Profile</h1>
    <div v-if="loading" class="loading-state">Loading profile...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else>
      <section class="user-info">
        <div class="user-avatar">
          <span>{{ profile.user.username.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="user-details">
          <h2>{{ profile.user.username }}</h2>
          <p>Email: {{ profile.user.email }}</p>
        </div>
      </section>

      <hr class="section-divider" />

      <section class="favorites" v-if="profile.favorites && profile.favorites.length">
        <h3>Favorite Albums</h3>
        <div class="album-grid">
          <div v-for="fav in profile.favorites" :key="fav.album_id" class="album-card">
            <router-link :to="`/album/${fav.album_id}`" class="card-link">
              <img :src="fav.cover_url" :alt="fav.album_name" />
              <div class="album-info">
                <h4>{{ fav.album_name }}</h4>
                <p>{{ fav.artist_name }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </section>
      <div v-else class="empty-state">No favorite albums yet.</div>

      <hr class="section-divider" />

      <section class="ratings" v-if="profile.ratings && profile.ratings.length">
        <h3>Rated Albums</h3>
        <div class="album-grid">
          <div v-for="rating in profile.ratings" :key="rating.album_id" class="album-card">
            <router-link :to="`/album/${rating.album_id}`" class="card-link">
            <img :src="rating.cover_url" :alt="rating.album_name" />
            <div class="album-info">
              <h4>{{ rating.album_name }}</h4>
              <p>{{ rating.artist_name }}</p>
              <p class="rating">Rating: {{ rating.rating }} / 5</p>
            </div>
            </router-link>
            </div>
        </div>
      </section>
      <div v-else class="empty-state">No rated albums yet.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import type { User } from '../stores/user'
import HeaderBar from './HeaderBar.vue'

const searchQuery = ref('')

interface AlbumInfo {
  album_id: number;
  album_name: string;
  artist_name: string;
  cover_url: string;
  rating?: number;
}

interface UserProfile {
  user: User;
  favorites: AlbumInfo[];
  ratings: AlbumInfo[];
}

const profile = ref<UserProfile>({
  user: { id: 0, username: '', email: '' },
  favorites: [],
  ratings: []
})
const loading = ref(false)
const error = ref('')
const router = useRouter()

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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
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
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #0a1527;
  border-radius: 8px;
  color: #fff;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a8aeba;
}

.error-state, .error {
  color: #ff4757;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #606ff2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  margin-right: 20px;
}

.user-details h2 {
  margin: 0;
  font-size: 24px;
}

.user-details p {
  margin: 5px 0 0;
  font-size: 16px;
  color: #a8aeba;
}

.section-divider {
  border: 0;
  border-top: 1px solid #2a2e3b;
  margin: 30px 0;
}

.favorites h3, .ratings h3 {
  font-size: 20px;
  margin-bottom: 20px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.album-card {
  background-color: #191b28;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  text-decoration: none;
  transition: transform 0.2s;
}

.album-card:hover {
  transform: translateY(-5px);
}

.album-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.album-info {
  padding: 10px;
}

.album-info h4 {
  margin: 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-info p {
  margin: 5px 0 0;
  font-size: 0.8rem;
  color: #a8aeba;
}

.album-info p.rating {
  font-weight: bold;
  color: #2ed573;
}
</style>