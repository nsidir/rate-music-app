<!-- src/components/Signup.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <router-link to="/" class="logo-link">
          <img src="/favicon.ico" alt="Rate Your Music" class="logo" />
        </router-link>
        <h1>Create an Account</h1>
        <p>Join our community of music enthusiasts</p>
      </div>
      
      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group" :class="{ 'error': usernameError }">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="Username"
            required
            @focus="usernameError = ''"
          />
          <span v-if="usernameError" class="error-message">{{ usernameError }}</span>
        </div>

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
              placeholder="Create a password"
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
          <div class="password-strength" v-if="password">
            <div class="strength-meter">
              <div 
                class="strength-bar" 
                :style="{ width: `${passwordStrengthPercent}%` }"
                :class="passwordStrengthClass"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
          </div>
        </div>
        
        <div class="form-group terms-group">
          <div class="checkbox-wrapper">
            <input type="checkbox" id="terms" v-model="termsAgreed" required />
            <label for="terms">
              I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a>
            </label>
          </div>
          <span v-if="termsError" class="error-message">{{ termsError }}</span>
        </div>
        
        <button 
          type="submit" 
          class="auth-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const apiUrl = import.meta.env.VITE_API_URL;

const router = useRouter()

// Form state – using single username field
const username = ref('')
const email = ref('')
const password = ref('')
const termsAgreed = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

// Form validation errors
const usernameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const termsError = ref('')

// Password strength calculation
const passwordStrengthPercent = computed(() => {
  if (!password.value) return 0
  let strength = 0
  if (password.value.length >= 8) strength += 25
  if (/[A-Z]/.test(password.value)) strength += 25
  if (/[0-9]/.test(password.value)) strength += 25
  if (/[^A-Za-z0-9]/.test(password.value)) strength += 25
  return strength
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrengthPercent.value
  if (strength < 25) return 'weak'
  if (strength < 50) return 'fair'
  if (strength < 75) return 'good'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrengthClass.value
  if (strength === 'weak') return 'Weak'
  if (strength === 'fair') return 'Fair'
  if (strength === 'good') return 'Good'
  return 'Strong'
})

// Use username instead of firstName/lastName in form validity
const isFormValid = computed(() => {
  return username.value &&
         email.value && 
         password.value && 
         termsAgreed.value &&
         passwordStrengthPercent.value >= 50
})

// Form submission: call the signup endpoint on your backend
const handleSignup = async () => {
  usernameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  termsError.value = ''
  
  let hasErrors = false
  
  if (!username.value.trim()) {
    usernameError.value = 'Username is required'
    hasErrors = true
  }
  
  if (!email.value) {
    emailError.value = 'Email is required'
    hasErrors = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    hasErrors = true
  }
  
  if (!password.value) {
    passwordError.value = 'Password is required'
    hasErrors = true
  } else if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    hasErrors = true
  } else if (passwordStrengthPercent.value < 50) {
    passwordError.value = 'Password is too weak. Try adding numbers or special characters.'
    hasErrors = true
  }
  
  if (!termsAgreed.value) {
    termsError.value = 'You must agree to the terms to continue'
    hasErrors = true
  }
  
  if (hasErrors) return
  
  try {
    isLoading.value = true
    const response = await fetch(`${apiUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
    })
    const data = await response.json()
    if (!response.ok) {
      emailError.value = data.error || 'Signup failed'
      return
    }
    // Navigate to login page
    router.push('/login')
  } catch (error) {
    console.error('Registration failed:', error)
    emailError.value = 'An error occurred during registration'
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
/* CSS styles remain unchanged */
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
  max-width: 500px;
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

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
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

.password-strength {
  margin-top: 10px;
}

.strength-meter {
  height: 4px;
  background-color: #2a2e3b;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-bar.weak {
  background-color: #ff4757;
}

.strength-bar.fair {
  background-color: #ffa502;
}

.strength-bar.good {
  background-color: #2ed573;
}

.strength-bar.strong {
  background-color: #1e90ff;
}

.strength-text {
  font-size: 14px;
}

.strength-text.weak {
  color: #ff4757;
}

.strength-text.fair {
  color: #ffa502;
}

.strength-text.good {
  color: #2ed573;
}

.strength-text.strong {
  color: #1e90ff;
}

.terms-group {
  margin-bottom: 30px;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
}

.checkbox-wrapper input {
  width: auto;
  margin-right: 10px;
  margin-top: 3px;
}

.terms-link {
  color: #606ff2;
  text-decoration: none;
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

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .auth-card {
    padding: 30px 20px;
  }
}
</style>
