<template>
  <div class="not-found" style="text-align:center; padding:2rem;">
    <div class="text-container">
      <h1>404 — Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <img
        alt="404 Not Found"
        src="https://http.cat/404"
        style="max-width:80%; height:auto; margin-top:1rem;"
      />
      <div style="margin-top:1rem;">
        <router-link to="/">Go back home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.text-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
  display: inline-block;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

p {
  color: #34495e;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

a:hover {
  color: #2980b9;
  text-decoration: underline;
}
</style>