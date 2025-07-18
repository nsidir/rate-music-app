<!-- src/components/AlbumWall.vue -->
<template>
  <div class="album-wall">
    <transition-group name="fade" tag="div">
      <div class="card" v-for="album in filteredAlbums" :key="album.album_id">
        <router-link :to="`/album/${album.album_id}`" class="card-link">
          <div class="card-image">
            <img :src="album.cover_url" :alt="album.album_name" />
          </div>
          <div class="card-info">
            <h3>{{ album.album_name }}</h3>
            <p>{{ album.artist_name }}</p>
          </div>
        </router-link>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Define the Album interface to match the API response.
interface Album {
  album_id: number
  album_name: string
  artist_name: string
  cover_url: string
}

// Accept the search query as a prop.
const props = defineProps<{ searchQuery: string }>()

// Create a reactive reference for the album data.
const albums = ref<Album[]>([])

onMounted(async () => {
  try {
    const response = await fetch('/api/albums')
    if (response.ok) {
      albums.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching albums:', error)
  }
})

// Compute the filtered albums based on the search query.
const filteredAlbums = computed(() => {
  if (!props.searchQuery.trim()) return albums.value
  const query = props.searchQuery.toLowerCase()
  return albums.value.filter(
    album =>
      album.album_name.toLowerCase().includes(query) ||
      album.artist_name.toLowerCase().includes(query)
  )
})
</script>

<style scoped>
.album-wall > div  {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  flex: 1 1 200px;
  max-width: 200px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0a1527;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  height: auto;
  display: block;
  object-fit: cover;
}

.card-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.card:hover .card-info {
  opacity: 1;
}

/* Transition classes for smooth fade in/out */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
