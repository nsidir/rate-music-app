// src/stores/user.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'

//env for api URL
const apiUrl = import.meta.env.VITE_API_URL
export interface User {
  id: number
  username: string
  email: string
  role_name: 'admin' | 'user'
}

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false)
  const user = ref<User | null>(null)

  function login(userData: User, token?: string) {
    loggedIn.value = true
    user.value = userData
    
    // Store token if provided
    if (token) {
      localStorage.setItem('token', token)
    }
  }

  function logout() {
    loggedIn.value = false
    user.value = null
    // Clear tokens when logging out
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  async function checkAuth() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    logout();
    return false;
  }
  
  try {
    // Verify token with backend
    const response = await fetch(`${apiUrl}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      logout();
      return false;
    }
    
    const userData = await response.json();
    login(userData.user, token); // Update user data and maintain token
    return true;
  } catch (error) {
    console.error('Auth verification failed:', error);
    logout();
    return false;
  }
}

  async function fetchUserProfile(username: string) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (!token) {
    logout()
    return
  }

  try {
    const response = await fetch(`${apiUrl}/user/profile/username/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        logout()
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const userData = await response.json()
    user.value = userData
    loggedIn.value = true

    console.log('User profile loaded:', userData)
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    logout()
  }
}


  // Initialize auth state when store is created
  async function initialize() {
    await checkAuth()
  }

  return { 
    loggedIn, 
    user, 
    login, 
    logout, 
    checkAuth, 
    fetchUserProfile,
    initialize
    }
})