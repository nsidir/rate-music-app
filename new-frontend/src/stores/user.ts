// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const loggedIn = ref(false)

  // Actions
  function login() {
    loggedIn.value = true
  }

  function logout() {
    loggedIn.value = false
  }

  return {
    loggedIn,
    login,
    logout
  }
})
