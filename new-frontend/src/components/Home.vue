<!-- src/views/Home.vue -->
<template>
  <div>
    <!-- Bind the searchQuery using v-model -->
    <HeaderBar v-model:modelValue="searchQuery" />
    <AlbumWall :searchQuery="searchQuery" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderBar from '../components/HeaderBar.vue'
import AlbumWall from '../components/AlbumWall.vue'

// Shared reactive search query.
const searchQuery = ref('')
</script>
