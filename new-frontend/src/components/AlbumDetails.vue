<!-- src/components/AlbumDetails.vue -->
<template>
    <div class="album-details" v-if="album">
      <img :src="albumCovers[album.title] || album.cover" :alt="album.title" class="album-cover" />
      <h1>{{ album.title }}</h1>
      <h2>{{ album.artist }}</h2>
      <p><strong>Year:</strong> {{ album.year }}</p>
      <p><strong>Genre:</strong> {{ album.genre }}</p>
      <p>{{ album.description }}</p>
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
  
  // Define the Album interface.
  interface Album {
    id: string
    title: string
    artist: string
    cover?: string
    year: number
    genre: string
    description: string
  }
  
  // Convert the JSON data to a typed array.
  const albums = albumsData as Album[]
  
  // Get the current route to access the album id.
  const route = useRoute()
  
  // Find the album that matches the current id parameter.
  const album = computed(() => albums.find(a => a.id === route.params.id))
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
  </style>
  