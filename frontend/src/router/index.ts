import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../components/Home.vue'
import AlbumDetails from '../components/AlbumDetails.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import Profile from '../components/Profile.vue'
import TopAlbums from '../components/TopAlbums.vue'
import ArtistPage from '../components/ArtistPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/album/:id',
    name: 'AlbumDetails',
    component: AlbumDetails,
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/user/:username',
    name: 'UserProfile',
    component: Profile
  },
  {
    path: '/top',
    name: 'TopAlbums',
    component: TopAlbums
  },
  {
    path: '/artist/:artistSlug',
    name: 'ArtistPage',
    component: ArtistPage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
