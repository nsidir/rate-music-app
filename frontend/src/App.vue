<!-- App.vue -->
<script setup lang="ts">
import AlbumWall from './components/AlbumWall.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <h1 class="text-xl font-bold">Album Collection</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto py-6">
      <!-- Album Wall -->
      <section>
        <AlbumWall />
      </section>

      <!-- Router View for Other Content -->
      <section class="mt-8">
        <RouterView />
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t py-6 mt-auto">
      <div class="container flex h-14 items-center">
        <p class="text-sm text-muted-foreground">
          © {{ new Date().getFullYear() }} Album Collection
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}

/* Ensure the app takes up at least the full viewport height */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Smooth scrolling for the whole app */
html {
  scroll-behavior: smooth;
}

/* Remove default margin/padding */
body {
  margin: 0;
  padding: 0;
}

/* Ensure proper box sizing */
*, *::before, *::after {
  box-sizing: border-box;
}
</style>