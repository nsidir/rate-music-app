<template>
  <div>
    <HeaderBar v-model:modelValue="searchQuery" />
    <div class="album-details" v-if="album">
      <div class="main-info">
        <img :src="album.cover_url" :alt="album.album_name" class="album-cover" />
        <div class="text-info">
          <h1>{{ album.album_name }}</h1>
          <h2>{{ album.artist_name }}</h2>
          
          <!-- Community Stats Section -->
          <div class="community-stats">
            <div class="stat-item">
              <span class="stat-value">{{ album.avgRating ?? 'N/A' }}</span>
              <span class="stat-label">Avg Rating</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ album.favoriteCount ?? 0 }}</span>
              <span class="stat-label">Favorites</span>
            </div>
          </div>

          <!-- User Actions Section -->
          <div class="user-actions" v-if="userStore.loggedIn">
            <StarRating :initialRating="userRating" @rating-selected="handleRating" />
            <FavoriteIcon :isActive="isFavorite" @toggle="toggleFavorite" />
          </div>
          <p v-else class="login-prompt">
            <router-link to="/login">Log in</router-link> to rate and favorite this album.
          </p>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      <p>Loading album or album not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StarRating from './StarRating.vue';
import FavoriteIcon from './FavoriteIcon.vue';
import { useUserStore } from '../stores/user';
import HeaderBar from './HeaderBar.vue';

const searchQuery = ref('');

interface Album {
  album_id: number;
  album_name: string;
  artist_name: string;
  cover_url: string;
  avgRating: string | null;
  favoriteCount: number | null;
}

const userStore = useUserStore();
const route = useRoute();
const album = ref<Album | null>(null);

const userRating = ref<number>(0); 
const isFavorite = ref(false);

// Helper function to fetch/refresh album data
async function fetchAlbumData() {
  try {
    const albumId = Number(route.params.id);
    const response = await fetch(`/api/albums/${albumId}`);
    if (response.ok) {
      album.value = await response.json();
    } else {
      console.error('Failed to fetch album details');
      album.value = null;
    }
  } catch (error) {
     console.error('Error fetching album data:', error);
  }
}

onMounted(async () => {
  // Cleaned up onMounted logic
  await fetchAlbumData();

  // If user is logged in, fetch their specific rating and favorite status
  if (userStore.loggedIn && album.value) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const statusResponse = await fetch(`/api/user/albums/${album.value.album_id}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        if (data) {
          userRating.value = data.rating || 0;
          isFavorite.value = data.favorite || false;
        }
      }
    } catch (error) {
      console.error('Error fetching user status for album:', error);
    }
  }
});

// Update rating in the database
const updateRating = async () => {
    if (!album.value) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    await fetch(`/api/albums/${album.value.album_id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating: userRating.value })
    });
    // Refresh stats after updating
    await fetchAlbumData(); 
}

// Update favorite status in the database
const updateFavorite = async () => {
  if (!album.value) return;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const method = isFavorite.value ? 'POST' : 'DELETE';
  await fetch(`/api/albums/${album.value.album_id}/favorites`, {
    method: method,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  await fetchAlbumData(); 
}

// Handler for rating events from StarRating
const handleRating = (selectedRating: number) => {
  userRating.value = selectedRating;
  updateRating();
}

// Handler for toggling favorite
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  updateFavorite();
}
</script>

<style scoped>
.album-details {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: #191b28;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  color: aliceblue;
}

.main-info {
  display: flex;
  flex-direction: row;
  gap: 30px;
}

.album-cover {
  width: 250px;
  height: 250px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.text-info {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.text-info h1 {
  margin: 0 0 5px 0;
  font-size: 2.5em;
}

.text-info h2 {
  margin: 0 0 20px 0;
  font-size: 1.5em;
  font-weight: 400;
  color: #a8aeba;
}

.community-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #0a1527;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 0.9em;
  color: #a8aeba;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: auto; /* Pushes actions to the bottom */
}

.login-prompt {
  margin-top: auto;
  color: #a8aeba;
}

.login-prompt a {
  color: #606ff2;
  font-weight: bold;
  text-decoration: none;
}

.not-found {
  text-align: center;
  margin: 40px auto;
  font-size: 1.2em;
  color: #777;
}

@media (max-width: 600px) {
  .main-info {
    flex-direction: column;
    align-items: center;
  }
  .text-info {
    align-items: center;
    text-align: center;
  }
  .user-actions {
    justify-content: center;
  }
}
</style>
