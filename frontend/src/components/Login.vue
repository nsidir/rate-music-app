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
        <div class="form-group" :class="{ 'error': usernameError }">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="Enter your username"
            required
            @focus="usernameError = ''"
          />
          <span v-if="usernameError" class="error-message">{{ usernameError }}</span>
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

const apiUrl = import.meta.env.VITE_API_URL

const userStore = useUserStore()
const router = useRouter()

// Form state
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

// Validation errors
const usernameError = ref('')
const passwordError = ref('')

// Login handler using your backend JWT endpoint
const handleLogin = async () => {
  usernameError.value = ''
  passwordError.value = ''

  if (!username.value.trim()) {
    usernameError.value = 'Username is required'
    return
  }
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  try {
    isLoading.value = true
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await response.json()
    if (!response.ok) {
      usernameError.value = data.error || 'Login failed'
      return
    }
    // Save the token in storage based on rememberMe
    if (rememberMe.value) {
      localStorage.setItem('token', data.token)
    } else {
      sessionStorage.setItem('token', data.token)
    }
    // Update user store with the returned user info
    userStore.login({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role_name: data.user.role_name,
    })
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
    passwordError.value = 'An error occurred during login'
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
  background-color: transparent;
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
  max-width: 400px;
  margin: 0 auto;
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
  right: 10px;
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
