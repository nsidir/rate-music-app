<template>
  <div>
    <HeaderBar v-model:modelValue="searchQuery" />
    <div class="top-albums-container">
      <h1>Top Albums</h1>
      <div v-if="loading" class="loading-state">Loading...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>
      <div v-else class="albums-list">
        <div v-for="(album, index) in rankedAlbums" :key="album.album_id" class="album-item">
          <span class="rank">{{ index + 1 }}</span>
          <img :src="album.cover_url" :alt="album.album_name" class="album-cover" />
          <div class="album-info">
            <router-link :to="`/album/${album.album_id}`" class="album-name">{{ album.album_name }}</router-link>
            <p class="artist-name">{{ album.artist_name }}</p>
          </div>
          <div class="album-stats">
            <div class="score-display" v-if="album.avgRating">
              <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 4.968 1.48-8.279L0 9.306l8.332-1.151L12 .587z"/></svg>
              <span class="avg-rating">{{ album.avgRating }}</span>
              <span class="rating-count">/ {{ formatRatingCount(album.ratingCount) }}</span>
            </div>
            <div v-else class="score-display">
              <span class="rating-count">No ratings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import HeaderBar from './HeaderBar.vue';

const searchQuery = ref('');
const apiUrl = import.meta.env.VITE_API_URL;

interface AlbumStats {
  album_id: number;
  album_name: string;
  artist_name: string;
  cover_url: string;
  avgRating: string | null;
  ratingCount: number;
  bayesianAverage: number;
}

const albums = ref<AlbumStats[]>([]);
const loading = ref(false);
const error = ref('');

const rankedAlbums = computed(() => {
  if (!albums.value.length) return [];

  // If rating is null dont include in the ranking
  const Albums = albums.value.filter(album => album.avgRating !== null);
  if (Albums.length === 0) return [];

  const allRatings = Albums.reduce((acc, album) => acc + (album.avgRating ? parseFloat(album.avgRating) * album.ratingCount : 0), 0);
  const totalRatings = Albums.reduce((acc, album) => acc + album.ratingCount, 0);
  const C = totalRatings > 0 ? allRatings / totalRatings : 0; // overall average rating
  const m = 1; // minimum number of ratings

  const albumsWithBayesian = Albums.map(album => {
    const R = album.avgRating ? parseFloat(album.avgRating) : 0;
    const v = album.ratingCount;
    const bayesianAverage = (v / (v + m)) * R + (m / (v + m)) * C;
    return { ...album, bayesianAverage };
  });

  return albumsWithBayesian.sort((a, b) => b.bayesianAverage - a.bayesianAverage);
});

const formatRatingCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toString();
};

onMounted(async () => {
  loading.value = true;
  try {
    const response = await fetch(`${apiUrl}/album-stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch top albums');
    }
    albums.value = await response.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.top-albums-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #0a1527;
  border-radius: 8px;
  color: #fff;
}
.loading-state, .error-state {
  text-align: center;
  padding: 40px 20px;
  color: #a8aeba;
}
.albums-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.album-item {
  display: flex;
  align-items: center;
  background-color: #191b28;
  padding: 10px;
  border-radius: 4px;
}
.rank {
  font-size: 1.5em;
  font-weight: bold;
  margin-right: 15px;
  width: 40px;
  text-align: center;
}
.album-cover {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}
.album-info {
  flex-grow: 1;
}
.album-name {
  font-weight: bold;
  text-decoration: none;
  color: #fff;
}
.album-name:hover {
  text-decoration: underline;
}
.artist-name {
  color: #a8aeba;
  margin: 0;
}
.album-stats {
  min-width: 120px;
  text-align: right;
}
.score-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.star-icon {
  width: 20px;
  height: 20px;
  color: #4a90e2;
}
.avg-rating {
  font-size: 1.5em;
  font-weight: bold;
  color: #fff;
}
.rating-count {
  font-size: 1em;
  color: #a8aeba;
}
</style>