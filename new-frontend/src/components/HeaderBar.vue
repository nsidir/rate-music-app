<!-- src/components/HeaderBar.vue -->
<template>
    <header class="header">
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
  
  // Emit updated value as the user types.
  function onInput(event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
  }

  function onKeyUp(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    console.log('Enter pressed. Current value:', props.modelValue)
    // Emit a custom event:
    // emit('enterPressed', props.modelValue)
    }
  }

  
  // Simulated authentication state.
  const router = useRouter()
  
  function login() {
    console.log("Login clicked")
    userStore.login()
  }
  
  const signup = () => {
    console.log("Signup clicked")
    router.push('/signup')
  }
  
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
  
  .middle {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    margin-right: 10px;
  }
  
  .right {
    display: flex;
    gap: 10px;
  }
  
  input[type="text"] {
    width: 300px;
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
  