<template>
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        error: null
      };
    },
    methods: {
      async login() {
        try {
          const response = await axios.post('http://localhost:3000/login', {
            username: this.username,
            password: this.password
          });
          localStorage.setItem('token', response.data.token);
          this.$router.push('/dashboard'); // Redirect to dashboard or protected route
        } catch (error) {
          this.error = error.response.data.error || 'An error occurred';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login {
    max-width: 300px;
    margin: 0 auto;
  }
  .error {
    color: red;
  }
  </style>