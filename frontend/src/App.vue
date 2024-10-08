<!-- App.vue -->
<template>
  <div id="app">
    <!-- <h1>All Users</h1>
    <UserDisplay /> -->
    
    <h1>User with ID 2</h1>
    <UserDisplay :userId="2" />
  </div>
</template>

<script setup>
import UserDisplay from './components/UserDisplay.vue'
</script>

<style>
/* Your global styles can go here */
</style>