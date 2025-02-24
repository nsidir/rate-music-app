<template>
    <div class="albums-wall">
      <!-- Loop through albums and display each as a card -->
      <div class="album-card" v-for="album in albums" :key="album.album_id">
        <!-- Assuming vue-router is in use -->
        <router-link :to="`/albums/${album.album_id}`" class="card-link">
          <div class="card">
            <img :src="album.cover_url" :alt="album.album_name" class="album-cover" />
            <div class="overlay">
              <h3 class="album-title">{{ album.album_name }}</h3>
              <p class="artist-name">{{ album.artist_name }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  // Create a reactive variable to hold the albums
  const albums = ref([])
  
  onMounted(async () => {
    try {
      const response = await fetch('/api/albums')
      if (!response.ok) {
        throw new Error('Failed to fetch albums')
      }
      albums.value = await response.json()
    } catch (error) {
      console.error('Error fetching albums:', error)
    }
  })
  </script>
  
  <style scoped>
  /* Grid container for the album cards */
  .albums-wall {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  /* Individual album card styles */
  .album-card {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
  }
  
  .album-card:hover {
    transform: scale(1.03);
  }
  
  /* Card content */
  .card {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  /* Album cover image */
  .album-cover {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  }
  
  /* Overlay that appears on hover with minimal info */
  .overlay {
    position: absolute;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    width: 100%;
    padding: 0.5rem;
    color: #fff;
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .album-card:hover .overlay {
    transform: translateY(0);
  }
  
  .card-link {
    text-decoration: none;
    color: inherit;
  }
  
  /* Optional: styling for text in the overlay */
  .album-title {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .artist-name {
    margin: 0;
    font-size: 0.9rem;
  }
  </style>
  