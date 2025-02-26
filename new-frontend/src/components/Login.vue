<!-- src/components/Login.vue -->
<template>
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/" class="logo-link">
            <img src="/favicon.ico" alt="Rate Your Music" class="logo" />
          </router-link>
          <h1>Welcome Back</h1>
          <p>Sign in to rate and favorite your music</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group" :class="{ 'error': emailError }">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="Enter your email"
              required
              @focus="emailError = ''"
            />
            <span v-if="emailError" class="error-message">{{ emailError }}</span>
          </div>
          
          <div class="form-group" :class="{ 'error': passwordError }">
            <label for="password">Password</label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                placeholder="Enter your password"
                required
                @focus="passwordError = ''"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          </div>
          
          <div class="form-options">
            <div class="remember-me">
              <input type="checkbox" id="remember" v-model="rememberMe" />
              <label for="remember">Remember me</label>
            </div>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            class="auth-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>Sign In</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '../stores/user'
  
  const userStore = useUserStore()
  const router = useRouter()
  
  // Form state
  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const showPassword = ref(false)
  const isLoading = ref(false)
  
  // Form validation
  const emailError = ref('')
  const passwordError = ref('')
  
  // Login handler
  const handleLogin = async () => {
    // Reset errors
    emailError.value = ''
    passwordError.value = ''
    
    // Basic validation
    if (!email.value) {
      emailError.value = 'Email is required'
      return
    }
    
    if (!password.value) {
      passwordError.value = 'Password is required'
      return
    }
    
    try {
      isLoading.value = true
      
      // Simulated login delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Login user with store
      userStore.login()
      
      // Navigate to home page after successful login
      router.push('/')
    } catch (error) {
      // Handle login error (this would connect to your actual auth system)
      console.error('Login failed:', error)
      passwordError.value = 'Invalid email or password'
    } finally {
      isLoading.value = false
    }
  }
  </script>
  
  <style scoped>
  .auth-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #0a1527;
    color: #fff;
  }
  
  .auth-card {
    width: 100%;
    max-width: 450px;
    background-color: #191b28;
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    padding: 40px 30px;
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .logo-link {
    display: inline-block;
    margin-bottom: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
  
  .auth-header h1 {
    font-size: 28px;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .auth-header p {
    color: #a8aeba;
    font-size: 16px;
  }
  
  .auth-form {
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .form-group input {
    width: 100%;
    padding: 12px 15px;
    background-color: #0a1527;
    border: 1px solid #2a2e3b;
    border-radius: 4px;
    color: #fff;
    font-size: 16px;
    transition: border-color 0.3s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #606ff2;
  }
  
  .form-group.error input {
    border-color: #ff4757;
  }
  
  .error-message {
    color: #ff4757;
    font-size: 14px;
    margin-top: 5px;
    display: block;
  }
  
  .password-input {
    position: relative;
  }
  
  .toggle-password {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a8aeba;
    cursor: pointer;
    font-size: 14px;
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }
  
  .remember-me {
    display: flex;
    align-items: center;
  }
  
  .remember-me input {
    margin-right: 8px;
  }
  
  .forgot-password {
    color: #606ff2;
    text-decoration: none;
    font-size: 14px;
  }
  
  .auth-button {
    width: 100%;
    padding: 14px;
    background-color: #606ff2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    position: relative;
  }
  
  .auth-button:hover {
    background-color: #4a5ae3;
  }
  
  .auth-button:disabled {
    background-color: #4a5ae3;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .auth-footer {
    text-align: center;
    color: #a8aeba;
    font-size: 15px;
  }
  
  .auth-footer a {
    color: #606ff2;
    font-weight: 600;
    text-decoration: none;
  }
  </style>