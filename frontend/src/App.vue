<!-- App.vue -->
<template>
  <div id="app">
    <!-- <h1>User with ID 2</h1>
    <UserDisplay :userId="2" /> -->
<<<<<<< HEAD
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/signup">Signup</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <div style="margin-top: 20px;"></div>
      <StarRating />

    <main>
      <RouterView /> <!-- This is where the matched route component will be rendered -->
=======
      <div style="margin-top: 20px;"></div>
      <AlbumCarousel />

    <main>
      <RouterView />
>>>>>>> origin/main
    </main>
  </div>
</template>

<script setup lang="ts">
// import UserDisplay from './components/UserDisplay.vue'; // Import UserDisplay component
<<<<<<< HEAD
import StarRating from './components/StarRating.vue';
=======
import AlbumCarousel from './components/AlbumCarousel.vue'; // Import CarouselTest component
import { RouterView } from 'vue-router'; // Import RouterView component
>>>>>>> origin/main
</script>

<style>
/* Your global styles can go here */
</style>
