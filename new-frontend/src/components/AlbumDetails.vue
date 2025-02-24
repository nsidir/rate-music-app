<template>
  <div class="album-details" v-if="album">
    <img :src="albumCovers[album.title] || album.cover" :alt="album.title" class="album-cover" />
    <h1>{{ album.title }}</h1>
    <h2>{{ album.artist }}</h2>
    <p><strong>Year:</strong> {{ album.year }}</p>
    <p><strong>Genre:</strong> {{ album.genre }}</p>
    <p>{{ album.description }}</p>
    <div class="rating">
      <template v-if="userStore.loggedIn">
        <StarRating @rating-selected="handleRating" />
      </template>
    </div>
  </div>
  <div v-else class="not-found">
    <p>Album not found.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import albumsData from '../assets/albums.json'
import { albumCovers } from '../AlbumCovers'
import StarRating from './StarRating.vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

interface Album {
  id: string
  title: string
  artist: string
  cover?: string
  year: number
  genre: string
  description: string
}

const albums = albumsData as Album[]

const route = useRoute()

const album = computed(() => albums.find(a => a.id === route.params.id))

const handleRating = (rating: number) => {
  console.log('Rating received:', rating)
  // Rating Logic
}
</script>

<style scoped>
.album-details {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: #191b28;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
.rating {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
