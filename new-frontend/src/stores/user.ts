// src/stores/user.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  username: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false)
  const user = ref<User | null>(null)

  function login(userData: User) {
    loggedIn.value = true
    user.value = userData
  }

  function logout() {
    loggedIn.value = false
    user.value = null
    // Clear tokens when logging out
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  return {
    loggedIn,
    user,
    login,
    logout
  }
})