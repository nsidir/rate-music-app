<template>
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            v-model="username"
            type="text"
            id="username"
            placeholder="Enter username"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            v-model="password"
            type="password"
            id="password"
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p>
        Don't have an account?
        <a href="#" @click.prevent="$emit('switch-to-signup')">Sign up</a>
      </p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useAuth } from '../../@/services/AuthService';
  
  export default defineComponent({
    name: 'LoginComponent',
    emits: ['switch-to-signup', 'login-success'],
    setup(_, { emit }) {
      const { login, isAuthenticated, getToken } = useAuth();
      const username = ref('');
      const password = ref('');
      const error = ref('');
      const isLoading = ref(false);
  
      const handleLogin = async () => {
        isLoading.value = true;
        error.value = '';
        try {
          const success = await login(username.value, password.value);
          if (success) {
            emit('login-success');
          } else {
            error.value = 'Login failed. Please check your credentials.';
          }
        } catch (err) {
          console.error('Login error:', err);
          error.value = 'An error occurred during login. Please try again.';
        } finally {
          isLoading.value = false;
        }
      };
  
      return {
        username,
        password,
        handleLogin,
        error,
        isLoading,
        isAuthenticated,
        getToken,
      };
    },
  });
  </script>
  
  <style scoped>
  .login-container {
    max-width: 300px;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    color: red;
    margin-top: 10px;
  }
  </style>