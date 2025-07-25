<!-- src/components/HeaderBar.vue -->
<template>
  <header class="header">
    <!-- Left Section: Home -->
    <div class="left">
      <router-link to="/">
        <img src="/favicon.ico" alt="Rate Your Music" class="home-logo" />
      </router-link>
    </div>
    <!-- Middle Section: Search Bar -->
    <div class="middle">
      <input
        type="text"
        :value="modelValue"
        @input="onInput"
        @keyup="onKeyUp"
        placeholder="Search albums..."
      />
    </div>
    <!-- Right Section: Authentication buttons -->
    <div class="right">
      <template v-if="!userStore.loggedIn">
        <button class="login" @click="login">Login</button>
        <button class="signup" @click="signup">Signup</button>
      </template>
      <template v-else>
        <button class="profile" @click="goToProfile">Profile</button>
        <button class="logout" @click="userStore.logout">Logout</button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// Define a prop for the search query (v-model).
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    console.log('Enter pressed. Current value:', props.modelValue)
    // Optionally, emit a custom event:
    // emit('enterPressed', props.modelValue)
  }
}

const router = useRouter()

// When clicking "Login", navigate to the login page.
function login() {
  router.push('/login')
}

// When clicking "Signup", navigate to the signup page.
const signup = () => {
  router.push('/signup')
}

// When clicking "Profile", navigate to the profile page.
const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  padding: 10px 20px;
  color: #fff;
}

.home-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.5s ease-out;
}

.home-logo:hover {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.middle {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  margin-right: 20px;
  margin-left: 20px;
}

.right {
  display: flex;
  gap: 10px;
}

input[type="text"] {
  width: 100%;
  max-width: 300px;
  min-width: 120px;
  padding: 8px;
  border: none;
  border-radius: 4px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #555;
  color: #fff;
  transition: background-color 0.2s ease-in-out;
}

button:hover {
  background-color: #777;
}
</style>
