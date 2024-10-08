<!-- App.vue -->
<template>
  <div id="app">
    <h1>User with ID 2</h1>
    <UserDisplay :userId="2" />
  </div>
</template>

<script setup lang="ts">
import UserDisplay from './components/UserDisplay.vue'
</script>

<style>
/* Your global styles can go here */
</style>
