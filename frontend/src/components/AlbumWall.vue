<!-- AlbumWall.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AlbumDisplay from './AlbumDisplay.vue'

interface Album {
  album_id: number
  album_name: string
  artist_name: string
  cover_url: string
}

const albums = ref<Album[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchAlbums = async () => {
  try {
    isLoading.value = true
    const response = await fetch('http://localhost:3000/api/albums')
    const data = await response.json()
    albums.value = data
  } catch (e) {
    error.value = 'Failed to load albums'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const handleAlbumClick = (albumId: number) => {
  console.log('Album clicked:', albumId)
  // Handle album selection/navigation
}

onMounted(() => {
  fetchAlbums()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="error" class="text-center text-red-500">
      {{ error }}
    </div>
    
    <div 
      v-else 
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <AlbumDisplay
        v-for="album in albums"
        :key="album.album_id"
        :album="{
          id: album.album_id,
          name: album.album_name,
          artist: album.artist_name,
          coverUrl: album.cover_url
        }"
        @click="handleAlbumClick"
      />
    </div>
  </div>
</template>