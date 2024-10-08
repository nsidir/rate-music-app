<!-- UserDisplay.vue -->
<template>
  <div class="user-display">
    <div v-if="displayUsers && displayUsers.length">
      <div v-for="(user, index) in displayUsers" :key="index" ref="userElement">
        <h1>User ID: {{ user.user_id }}</h1>
        <h1>Username: {{ user.username }}</h1>
        <h1>Email: {{ user.email }}</h1>
        <h1>Password: {{ user.password }}</h1>
        <hr />
      </div>
    </div>
    <h1 v-else>Loading...</h1>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  userId: {
    type: Number,
    default: null
  }
})

const userData = ref([])

const displayUsers = computed(() => {
  if (props.userId !== null) {
    return userData.value.filter(user => user.user_id === props.userId)
  }
  return userData.value
})

const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/users')
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    userData.value = json
    console.log(json)
  } catch (error) {
    console.error(error.message)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Your CSS styles can go here */
</style>