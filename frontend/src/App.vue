<!-- App.vue -->
<script setup lang="ts">
import TopBar from './components/Header.vue'
import AlbumWall from './components/AlbumWall.vue'
import StarRating from './components/StarRating.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <!-- <h1>User with ID 2</h1>
    <UserDisplay :userId="2" /> -->
      <TopBar/>
      <div class ="links-container">
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/signup">Signup</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
      
      <div style="margin-top: 20px;"></div>
      <!--<StarRating />-->
    </div>
    <main>
      <RouterView /> <!-- This is where the matched route component will be rendered -->
    </main>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Variables for light and dark themes */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --border: 240 5.9% 90%;
  --muted-foreground: 240 3.8% 46.1%;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
}

/* Global styles */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 45vh;
  }

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
}

.links-container {
  display: flex;
  justify-content: center; 
  gap: 20px; 
  margin-top: 20px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

/* Base styles for active RouterLink */
.router-link-active {
  font-weight: bold;
}
</style>
