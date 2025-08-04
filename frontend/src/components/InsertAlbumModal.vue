<!-- src/components/InsertAlbumModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Insert New Album</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="submitAlbum" class="modal-form">
          <div class="form-group">
            <label for="title">Title *</label>
            <input 
              id="title"
              v-model="albumForm.album_name" 
              placeholder="Album title" 
              required 
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="artist">Artist *</label>
            <input 
              id="artist"
              v-model="albumForm.artist_name" 
              placeholder="Artist name" 
              required 
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="cover">Cover URL *</label>
            <input 
              id="cover"
              v-model="albumForm.cover_url" 
              placeholder="Cover image URL" 
              required 
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="year">Year *</label>
            <input 
              id="year"
              type="number"
              v-model.number="albumForm.year" 
              placeholder="Release year" 
              min="1890" 
              :max="currentYear" 
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="genre">Genre *</label>
            <input 
              id="genre"
              v-model="albumForm.genre" 
              placeholder="Genre" 
              :disabled="isSubmitting"
            />
          </div>
          <div class="modal-actions">
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
            <button type="button" @click="closeModal" :disabled="isSubmitting" class="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useUserStore } from '../stores/user'

const apiUrl = import.meta.env.VITE_API_URL

const userStore = useUserStore()

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'album-inserted': []
}>()

const isSubmitting = ref(false)

interface AlbumForm {
  album_name: string
  artist_name: string
  cover_url: string
  year: number
  genre: string
}

const albumForm = reactive<AlbumForm>({
  album_name: '',
  artist_name: '',
  cover_url: '',
  year: 1969,
  genre: ''
})

const currentYear = new Date().getFullYear()
const isAdmin = computed(() => userStore.user?.role_name === 'admin')

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('update:show', false)
    resetForm()
  }
}

const handleOverlayClick = () => {
  closeModal()
}

const resetForm = () => {
  Object.assign(albumForm, {
    album_name: '',
    artist_name: '',
    cover_url: '',
    year: 1969,
    genre: ''
  })
}

// Reset form when modal is closed
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// Fetch or create artist before inserting album
const getOrCreateArtist = async (artistName: string) => {
  const encodedName = encodeURIComponent(artistName.trim())
  const res = await fetch(`${apiUrl}/artists/exists/${encodedName}`)

  if (!res.ok) {
    throw new Error(`Failed to check or create artist: ${res.statusText}`)
  }

  const result = await res.json()
  return result.artist.artist_id
}

const submitAlbum = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (!userStore.loggedIn || !isAdmin.value) {
      alert('Only admins can insert albums.')
      return
    }

    const { album_name, artist_name, cover_url, year, genre } = albumForm

    if (!album_name.trim() || !artist_name.trim() || !cover_url.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    // Step 1: Ensure artist exists and get artist_id
    const artistId = await getOrCreateArtist(artist_name)

    // Step 2: Submit album
    const response = await fetch(`${apiUrl}/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        album_name: album_name.trim(),
        artist_id: artistId,
        cover_url: cover_url.trim(),
        year: year,
        genre: genre.trim() || 'Unknown'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `Server error: ${response.status}`)
    }

    alert('Album inserted successfully!')
    emit('update:show', false)
    emit('album-inserted')
    resetForm()

  } catch (err) {
    console.error('Failed to insert album:', err)
    alert(`Failed to insert album: ${err instanceof Error ? err.message : 'Unknown error'}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal {
  background: #0a1527;
  border-radius: 12px;
  padding: 0;
  min-width: 400px;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #404040;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #404040;
  color: #fff;
}

.modal-form {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #ccc;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #555;
  border-radius: 6px;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 14px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #48c774;
  box-shadow: 0 0 0 2px rgba(72, 199, 116, 0.1);
}

.form-group input:disabled {
  background-color: #333;
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #404040;
}

.submit-btn {
  background: linear-gradient(135deg, #48c774, #00d1b2);
  color: #fff;
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(72, 199, 116, 0.3);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5dd085, #00e6cc);
  box-shadow: 0 3px 10px rgba(72, 199, 116, 0.4);
}

.submit-btn:disabled {
  background-color: #333;
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-btn {
  background-color: #555;
  color: #fff;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #666;
}

.cancel-btn:disabled {
  background-color: #333;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>