<!-- App.vue -->
<template>
  <div id="app">
    <!-- <h1>User with ID 2</h1>
    <UserDisplay :userId="2" /> -->
      <div style="margin-top: 20px;"></div>
      <AlbumCarousel />

    <main>
      <RouterView /> <!-- This is where the matched route component will be rendered -->
    </main>
  </div>
</template>

<script setup lang="ts">
// import UserDisplay from './components/UserDisplay.vue'; // Import UserDisplay component
import AlbumCarousel from './components/AlbumCarousel.vue'; // Import CarouselTest component
</script>

<style>
/* Your global styles can go here */
</style>
