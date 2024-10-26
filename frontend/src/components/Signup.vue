<template>
<<<<<<< HEAD
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
=======
    <div class="signup-container">
      <h2>Sign Up</h2>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            v-model="username"
            type="text"
            id="username"
            placeholder="Choose a username"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            v-model="password"
            type="password"
            id="password"
            placeholder="Choose a password"
            required
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" :disabled="isLoading || !isFormValid">
          {{ isLoading ? 'Signing up...' : 'Sign Up' }}
        </button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p>
        Already have an account?
        <a href="#" @click.prevent="$emit('switch-to-login')">Login</a>
      </p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { useAuth } from '../../@/services/AuthService';
  
  export default defineComponent({
    name: 'SignupComponent',
    emits: ['switch-to-login', 'signup-success'],
    setup(_, { emit }) {
      const { signup, isAuthenticated, getToken } = useAuth();
      const username = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const error = ref('');
      const isLoading = ref(false);
  
      const isFormValid = computed(() => {
        return (
          username.value.length > 0 &&
          password.value.length > 0 &&
          password.value === confirmPassword.value
        );
      });
  
      const handleSignup = async () => {
        if (!isFormValid.value) {
          error.value = 'Please make sure all fields are filled and passwords match.';
          return;
        }
  
        isLoading.value = true;
        error.value = '';
        try {
          const success = await signup(username.value, password.value);
          if (success) {
            emit('signup-success');
          } else {
            error.value = 'Signup failed. Please try again.';
          }
        } catch (err) {
          console.error('Signup error:', err);
          error.value = 'An error occurred during signup. Please try again.';
        } finally {
          isLoading.value = false;
        }
      };
  
      return {
        username,
        password,
        confirmPassword,
        handleSignup,
        error,
        isLoading,
        isFormValid,
        isAuthenticated,
        getToken,
      };
    },
  });
  </script>
  
  <style scoped>
  .signup-container {
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
    background-color: #28a745;
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
>>>>>>> origin/main
  }
  </style>