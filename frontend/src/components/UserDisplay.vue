<!-- UserDisplay.vue -->
<template>
  <div class="user-display">
    <div v-if="loading">Loading...</div>
    <div v-else-if="displayUsers.length">
      <div v-for="(user, index) in displayUsers" :key="index" ref="userElement">
        <h1>User ID: {{ user.user_id }}</h1>
        <h1>Username: {{ user.username }}</h1>
        <h1>Email: {{ user.email }}</h1>
        <!-- Avoid displaying the password for security reasons -->
        <hr />
      </div>
    </div>
    <div v-else>No users found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  userId: {
    type: Number,
    default: null
  }
})

interface User {
  user_id: number;
  username: string;
  email: string;
  password: string; // Consider removing this if not used
}

const userData = ref<User[]>([])
const loading = ref(true) // Track loading state

const displayUsers = computed(() => {
  if (props.userId !== null) {
    return userData.value.filter(user => user.user_id === props.userId)
  }
  return userData.value
})

const fetchData = async () => {
  loading.value = true // Set loading to true before fetching
  try {
    const response = await fetch('http://localhost:3001/api/users')
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    userData.value = json
    console.log(json)
  } catch (error) {
    console.error((error as Error).message)
  } finally {
    loading.value = false // Set loading to false after fetching
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Your CSS styles can go here */
</style>
