<template>
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard!</p>
      <button @click="logout">Logout</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    }
  }
  </script>