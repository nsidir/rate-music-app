<!-- src/components/Home.vue -->
<template>
  <div>
    <!-- Bind the searchQuery using v-model -->
    <HeaderBar v-model:modelValue="searchQuery" />
    <AlbumWall :searchQuery="searchQuery" :albums="albums" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HeaderBar from './HeaderBar.vue'
import AlbumWall from './AlbumWall.vue'

const apiUrl = import.meta.env.VITE_API_URL

// Define the Album interface to match the API response.
interface Album {
  album_id: number
  album_name: string
  artist_name: string
  cover_url: string
}

// Create a reactive reference for the album data.
const albums = ref<Album[]>([])

onMounted(async () => {
  try {
    const response = await fetch(`${apiUrl}/album-stats`)
    if (response.ok) {
      albums.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching albums:', error)
  }
})

// Shared reactive search query.
const searchQuery = ref('')
</script>
