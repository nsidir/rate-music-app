<template>
  <div>
    <HeaderBar v-model:modelValue="searchQuery" />
    <div class="album-details" v-if="album">
      <img :src="album.cover_url" :alt="album.album_name" class="album-cover" />
      <h1>{{ album.album_name }}</h1>
      <h2>{{ album.artist_name }}</h2>
      <div class="user-actions">
        <template v-if="userStore.loggedIn">
          <StarRating :initialRating="rating" @rating-selected="handleRating" />
          <FavoriteIcon :isActive="isFavorite" @toggle="toggleFavorite" />
        </template>
      </div>
    </div>
    <div v-else class="not-found">
      <p>Loading album or album not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StarRating from './StarRating.vue'
import FavoriteIcon from './FavoriteIcon.vue'
import { useUserStore } from '../stores/user'
import HeaderBar from './HeaderBar.vue'

const searchQuery = ref('')

// Updated Album interface to match API
interface Album {
  album_id: number
  album_name: string
  artist_name: string
  cover_url: string
}

const userStore = useUserStore()
const route = useRoute()
const album = ref<Album | null>(null)

// Reactive state for rating and favorite
const rating = ref<number>(0)
const isFavorite = ref(false)

onMounted(async () => {
  try {
    const albumsResponse = await fetch('/api/albums')
    if (!albumsResponse.ok) {
        throw new Error('Failed to fetch albums');
    }
    const allAlbums: Album[] = await albumsResponse.json()
    
    const currentAlbum = allAlbums.find(a => a.album_id === Number(route.params.id))
    if (!currentAlbum) {
        console.error('Album not found');
        return;
    }
    album.value = currentAlbum;

    if (userStore.loggedIn) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const statusResponse = await fetch(`/api/user/albums/${album.value.album_id}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        if (data) {
          rating.value = data.rating || 0;
          isFavorite.value = data.favorite || false;
        }
      }
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

// Update rating in the database
const updateRating = async () => {
    if (!album.value) return;
    console.log("Rating updated:", rating.value)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    await fetch(`/api/albums/${album.value.album_id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating: rating.value })
    });
}

// Update favorite status in the database
const updateFavorite = async () => {
  if (!album.value) return;
  console.log("Favorite toggled:", isFavorite.value)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const method = isFavorite.value ? 'POST' : 'DELETE';
  await fetch(`/api/albums/${album.value.album_id}/favorites`, {
    method: method,
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Handler for rating events from StarRating
const handleRating = (selectedRating: number) => {
  rating.value = selectedRating
  updateRating()
}

// Handler for toggling favorite
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  updateFavorite()
}
</script>

<style scoped>
.album-details {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: #191b28;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  text-align: center;
  color: aliceblue;
}
.album-cover {
  max-width: 100%;
  border-radius: 4px;
  margin-bottom: 20px;
}
.not-found {
  text-align: center;
  margin: 40px auto;
  font-size: 1.2em;
  color: #777;
}
.user-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
</style>