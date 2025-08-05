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
      <button class="top-albums" @click="goToTopAlbums">Top Albums</button>
    </div>
    <!-- Right Section: Authentication buttons -->
    <div class="right">
      <template v-if="!isLoggedIn">
        <button class="login" @click="login">Login</button>
        <button class="signup" @click="signup">Signup</button>
      </template>
      <template v-else>
        <button v-if="isAdmin" @click="openInsertModal" class="insert-album">Insert Info</button>
        <button class="profile" @click="goToProfile">Profile</button>
        <button class="logout" @click="userStore.logout">Logout</button>
      </template>
    </div>
  </header>
  
  <!-- Insert Album Modal Component -->
  <InsertAlbumModal 
    v-model:show="showInsertModal" 
    @album-inserted="onAlbumInserted"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ref, computed } from 'vue'
import InsertAlbumModal from './InsertAlbumModal.vue'

const userStore = useUserStore()
const router = useRouter()

const isLoggedIn = computed(() => userStore.loggedIn)
const isAdmin = computed(() => userStore.user?.role_name === 'admin')

// Search input handling
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue', 'album-inserted'])

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    console.log('Enter pressed. Current value:', props.modelValue)
    // Implement search logic here if needed
  }
}

// Modal state
const showInsertModal = ref(false)

const openInsertModal = () => {
  showInsertModal.value = true
}

const onAlbumInserted = () => {
  // Forward the event to parent components if needed
  emit('album-inserted')
}

// Navigation
function login() {
  router.push('/login')
}

const signup = () => {
  router.push('/signup')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToTopAlbums = () => {
  router.push('/top')
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

button:disabled {
  background-color: #333;
  cursor: not-allowed;
  opacity: 0.6;
}

button.top-albums {
  background: linear-gradient(135deg, #f77a48, #f0a500);
  color: #fff;
  padding: 8px 16px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(247, 201, 72, 0.4);
  margin-left: 10px;
}

button.top-albums:hover {
  background: linear-gradient(135deg, #f99a48, #f4b200);
  box-shadow: 0 3px 10px rgba(247, 201, 72, 0.5);
}

button.insert-album {
  background: linear-gradient(135deg, #48c774, #00d1b2);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(72, 199, 116, 0.4);
}

button.insert-album:hover {
  background: linear-gradient(135deg, #5dd085, #00e6cc);
  box-shadow: 0 3px 10px rgba(72, 199, 116, 0.5);
}
</style>