<!-- src/components/InsertAlbumModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Insert Info</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <!-- Insert Genre Section -->
        <div class="modal-content">
          <div class="insert-genre">
            <h3>Add New Genre</h3>
            <form @submit.prevent="submitGenre" class="modal-form">
              <div class="form-group">
                <label for="genre">Genre Name *</label>
                <input id="genre" v-model="genreForm.name" placeholder="Enter a new genre name" :disabled="isSubmitting" required />
              </div>
              <div class="form-group">
                <label for="description">Description *</label>
                <input id="description" v-model="genreForm.description" placeholder="Enter a genre description" :disabled="isSubmitting" required />
              </div>
              <div class="form-group">
                <label for="imageUrl">Image URL *</label>
                <input id="imageUrl" v-model="genreForm.imageUrl" placeholder="Enter a genre image URL" :disabled="isSubmitting" required />
              </div>
              <div class="modal-actions">
                <button type="submit" :disabled="isSubmitting" class="submit-btn">
                  {{ isSubmitting ? 'Submitting...' : 'Add Genre' }}
                </button>
              </div>
            </form>
          </div>

          <div class="section-divider"></div>

          <!-- Insert Album Section -->
          <div class="insert-album">
            <h3>Insert Album</h3>
            <form @submit.prevent="submitAlbum" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="title">Title *</label>
                  <input id="title" v-model="albumForm.album_name" placeholder="Album title" required :disabled="isSubmitting" />
                </div>
                <div class="form-group">
                  <label for="artist">Artist *</label>
                  <input id="artist" v-model="albumForm.artist_name" placeholder="Artist name" required :disabled="isSubmitting" />
                </div>
              </div>

              <div class="form-group">
                <label for="cover">Cover URL *</label>
                <input id="cover" v-model="albumForm.cover_url" placeholder="Cover image URL" required :disabled="isSubmitting" />
              </div>

              <div class="form-row">
                <div class="form-group form-group-small">
                  <label for="year">Year *</label>
                  <input id="year" type="number" v-model.number="albumForm.year" placeholder="Release year" min="1890" :max="currentYear" :disabled="isSubmitting" />
                </div>

                <div class="form-group form-group-large">
                  <label for="genres">Genres *</label>
                  <div class="genre-buttons">
                    <button
                    v-for="genre in existingGenres"
                    :key="genre.id"
                    type="button"
                    @click="toggleGenre(genre)"
                    :class="['genre-btn', selectedGenres.some(g => g.id === genre.id) ? 'selected' : '']"
                    >
                    {{ genre.name }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" @click="closeModal" :disabled="isSubmitting" class="cancel-btn">
                  Cancel
                </button>
                <button type="submit" :disabled="isSubmitting" class="submit-btn">
                  {{ isSubmitting ? 'Submitting...' : 'Submit Album' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const apiUrl = import.meta.env.VITE_API_URL
const userStore = useUserStore()

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [value: boolean], 'album-inserted': [] }>()

const isSubmitting = ref(false)

interface AlbumForm {
  album_name: string
  artist_name: string
  cover_url: string
  year: number
}
interface GenreForm {
  name: string
  description: string
  imageUrl: string
}

const albumForm = reactive<AlbumForm>({
  album_name: '',
  artist_name: '',
  cover_url: '',
  year: 1969
})

const genreForm = reactive<GenreForm>({
  name: '',
  description: '',
  imageUrl: ''
})

const existingGenres = ref<{ id: number; name: string }[]>([])
const selectedGenres = ref<{ id: number; name: string }[]>([])

const currentYear = new Date().getFullYear()
const isAdmin = computed(() => userStore.user?.role_name === 'admin')

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('update:show', false)
    resetForm()
  }
}
const resetForm = () => {
  Object.assign(albumForm, { album_name: '', artist_name: '', cover_url: '', year: 1969 })
  Object.assign(genreForm, { name: '', description: '', imageUrl: '' })
  selectedGenres.value = []
}
watch(() => props.show, (newValue) => { if (!newValue) resetForm() })

const getAllGenres = async () => {
  try {
    const res = await fetch(`${apiUrl}/genres`)
    if (!res.ok) throw new Error(`Failed to fetch genres: ${res.statusText}`)
    existingGenres.value = await res.json()
  } catch (err) {
    console.error(err)
  }
}
onMounted(getAllGenres)

const toggleGenre = (genre: { id: number; name: string }) => {
  const idx = selectedGenres.value.findIndex(g => g.id === genre.id)
  if (idx >= 0) {
    selectedGenres.value.splice(idx, 1)
  } else {
    selectedGenres.value.push(genre)
  }
}

const getOrCreateArtist = async (artistName: string) => {
  const encodedName = encodeURIComponent(artistName.trim())
  const res = await fetch(`${apiUrl}/artists/exists/${encodedName}`)
  if (!res.ok) throw new Error(`Failed to check or create artist: ${res.statusText}`)
  const result = await res.json()
  return result.artist.artist_id
}

const submitGenre = async () => {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!userStore.loggedIn || !isAdmin.value) {
      alert('Only admins can insert genres.')
      return
    }
    const { name, description, imageUrl } = genreForm
    const response = await fetch(`${apiUrl}/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, imageUrl })
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `Server error: ${response.status}`)
    }
    Object.assign(genreForm, { name: '', description: '', imageUrl: '' })
    await getAllGenres() // refresh genre list
  } catch (err) {
    console.error('Failed to insert genre:', err)
  } finally {
    isSubmitting.value = false
  }
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
    const { album_name, artist_name, cover_url, year } = albumForm
    const genreList = selectedGenres.value.map(g => g.name)
    const artistId = await getOrCreateArtist(artist_name)

    // Insert album
    const response = await fetch(`${apiUrl}/albums`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ album_name: album_name.trim(), artist_id: artistId, cover_url: cover_url.trim(), year })
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `Server error: ${response.status}`)
    }

    // Assign genres
    for (const genreName of genreList) {
      const assignRes = await fetch(`${apiUrl}/genres/assign-album`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ genreName, albumName: album_name.trim() })
      })
      if (!assignRes.ok) {
        const assignErr = await assignRes.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Failed to assign genre "${genreName}": ${assignErr.message}`)
      }
    }

    emit('update:show', false)
    emit('album-inserted')
    resetForm()
  } catch (err) {
    console.error('Failed to insert album:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 20px;
}

.modal {
  background: linear-gradient(135deg, #0a1527 0%, #0f1a2e 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.modal-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #48c774, #00d1b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 20px;
  color: #aaa;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 300;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: scale(1.05);
}

.modal-content {
  max-height: calc(85vh - 80px);
  overflow-y: auto;
  padding: 0;
}

.insert-genre,
.insert-album {
  padding: 28px;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 0 28px;
}

.insert-genre h3,
.insert-album h3 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  font-weight: 600;
  color: #e0e0e0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group-small {
  grid-column: span 1;
}

.form-group-large {
  grid-column: span 1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #b0b0b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  padding: 14px 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
  outline: none;
  border-color: #48c774;
  background-color: rgba(72, 199, 116, 0.1);
  box-shadow:
    0 0 0 3px rgba(72, 199, 116, 0.2),
    0 4px 12px rgba(72, 199, 116, 0.1);
  transform: translateY(-1px);
}

.form-group input:disabled {
  background-color: rgba(255, 255, 255, 0.02);
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.submit-btn,
.cancel-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 100px;
}

.submit-btn {
  background: linear-gradient(135deg, #48c774, #00d1b2);
  color: #fff;
  box-shadow: 0 4px 15px rgba(72, 199, 116, 0.4);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5dd085, #00e6cc);
  box-shadow: 0 6px 20px rgba(72, 199, 116, 0.6);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cancel-btn:disabled {
  background: rgba(255, 255, 255, 0.05);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Responsive design */
@media (max-width: 640px) {
  .modal {
    max-width: 95vw;
    margin: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }

  .modal-header {
    padding: 20px 24px;
  }

  .insert-genre,
  .insert-album {
    padding: 24px;
  }
}

/* Custom scrollbar for modal content */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.genre-buttons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-btn {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.genre-btn.selected {
  background: #48c774;
  border-color: #48c774;
}

.genre-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.form-group .genre-buttons {
  display: flex;
  flex-direction: row;
}

</style>