<template>
    <div class="signup">
      <h2>Sign Up</h2>
      <form @submit.prevent="signup">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        error: null,
        success: null
      };
    },
    methods: {
      async signup() {
        try {
          const response = await axios.post('http://localhost:3000/signup', {
            username: this.username,
            password: this.password
          });
          this.success = 'Account created successfully. Please log in.';
          this.error = null;
          // Optionally redirect to login page after a delay
          setTimeout(() => this.$router.push('/login'), 2000);
        } catch (error) {
          this.error = error.response.data.error || 'An error occurred';
          this.success = null;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .signup {
    max-width: 300px;
    margin: 0 auto;
  }
  .error {
    color: red;
  }
  .success {
    color: green;
  }
  </style>