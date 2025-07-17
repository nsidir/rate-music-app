<template>
  <div>
    <HeaderBar v-model:modelValue="searchQuery" />
    <div class="album-details" v-if="album">
      <img :src="albumCovers[album.title] || album.cover" :alt="album.title" class="album-cover" />
      <h1>{{ album.title }}</h1>
      <h2>{{ album.artist }}</h2>
      <p><strong>Year:</strong> {{ album.year }}</p>
      <p><strong>Genre:</strong> {{ album.genre }}</p>
      <div class="user-actions">
        <template v-if="userStore.loggedIn">
          <StarRating @rating-selected="handleRating" />
          <FavoriteIcon :isActive="isFavorite" @toggle="toggleFavorite" />
        </template>
      </div>
    </div>
    <div v-else class="not-found">
      <p>Album not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import albumsData from '../assets/albums.json'
import { albumCovers } from '../AlbumCovers'
import StarRating from './StarRating.vue'
import FavoriteIcon from './FavoriteIcon.vue'
import { useUserStore } from '../stores/user'
import HeaderBar from './HeaderBar.vue'

const searchQuery = ref('')

interface Album {
  id: string
  title: string
  artist: string
  cover?: string
  year: number
  genre: string
}

const userStore = useUserStore()
const albums = albumsData as Album[]
const route = useRoute()
const album = computed(() => albums.find(a => a.id === route.params.id))

// Reactive state for rating and favorite
const rating = ref<number>(0)  // 0 means "no rating"
const isFavorite = ref(false)

// Custom debounce updater
function createDebouncedUpdater(fn: () => void, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const updater = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn()
      timeoutId = null
    }, delay)
  }

  updater.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      fn()
      timeoutId = null
    }
  }

  return updater
}

// Updater that reads the final rating state.
const updateRating = () => {
  if (rating.value === 0) {
    console.log("Final rating cleared (no rating).")
  } else {
    console.log("Final rating updated:", rating.value)
  }
}

// Updater for favorite state.
const updateFavorite = () => {
  console.log("Final favorite toggled:", isFavorite.value)
}

// Create debounced updaters with a 1-second delay.
const debouncedUpdateRating = createDebouncedUpdater(updateRating, 1000)
const debouncedUpdateFavorite = createDebouncedUpdater(updateFavorite, 1000)

// Handler for rating events from StarRating.
const handleRating = (selectedRating: number) => {
  rating.value = selectedRating
  console.log("Rating received:", selectedRating)
  debouncedUpdateRating()
}

// Handler for toggling favorite.
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  console.log("Favorite toggled:", isFavorite.value)
  debouncedUpdateFavorite()
}

// Flush any pending debounced calls on component unmount.
onBeforeUnmount(() => {
  debouncedUpdateRating.flush()
  debouncedUpdateFavorite.flush()
})
</script>

<style scoped>
.album-details {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: #191b28;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  text-align: center;
  color: aliceblue;
}
.album-cover {
  max-width: 100%;
  border-radius: 4px;
  margin-bottom: 20px;
}
.not-found {
  text-align: center;
  margin: 40px auto;
  font-size: 1.2em;
  color: #777;
}
.user-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
</style>
