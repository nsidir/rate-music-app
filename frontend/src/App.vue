<!-- src/App.vue -->
<template>
  <div id="app-container">
    <Aurora
    :amplitude="2.0"
    :intensity="1.5" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import Aurora from './components/Aurora.vue';
</script>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background-color: #0a1527;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app, #app-container {
  width: 100%;
  height: 100%;
}

#app-container {
  position: relative;
  z-index: 1;
  overflow-y: auto;
  height: 100vh;
}
</style>