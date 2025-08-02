<!-- src/components/AlbumDetails.vue -->
<template>
  <div>
    <HeaderBar v-model:modelValue="searchQuery" />
    <div class="album-details" v-if="album">
      <div class="main-info">
        <img :src="album.cover_url" :alt="album.album_name" class="album-cover" />
        <div class="text-info">
          <h1>{{ album.album_name }}</h1>
          <!-- Go to artist page -->
          <router-link :to="`/artist/${album.artist_slug}`" class="artist-link">
            <h2>{{ album.artist_name }}</h2>
          </router-link>

          <!-- Album Info Section -->
          <div class="album-info">
            <div class="info-item" v-if="album.year">
              <span class="info-label">Year: </span>
              <span class="info-value">{{ album.year }}</span>
            </div>
            <div class="info-item" v-if="album.genre_name">
              <span class="info-label">Genre: </span>
              <span class="info-value">{{ album.genre_name }}</span>
            </div>
          </div>

          <!-- Community Stats Section -->
          <div class="community-stats">
            <div class="stat-item">
              <span class="stat-value">{{ album.avgRating ?? 'N/A' }}</span>
              <span class="stat-label">Avg Rating</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ album.favoriteCount ?? 0 }}</span>
              <span class="stat-label">Favorites</span>
            </div>
          </div>

          <!-- User Actions Section -->
          <div class="user-actions" v-if="userStore.loggedIn">
            <StarRating :initialRating="userRating" @rating-selected="handleRating" />
            <FavoriteIcon :isActive="isFavorite" @toggle="toggleFavorite" />
          </div>
          <p v-else class="login-prompt">
            <router-link to="/login">Log in</router-link> to rate and favorite this album.
          </p>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <h3>User Reviews</h3>

        <!-- Review Form -->
        <div v-if="userStore.loggedIn" class="review-form">
          <textarea
            v-model="newReview"
            placeholder="Write your review here..."
            rows="4"
            cols="50"
          ></textarea>
          <div class="review-form-buttons">
            <button @click="submitReview" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
            </button>
            <button 
              v-if="userHasReview" 
              @click="deleteReview" 
              :disabled="isDeleting"
              class="delete-button"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Review' }}
            </button>
          </div>
          <p v-if="reviewError" class="error-message">{{ reviewError }}</p>
          <p v-if="reviewSuccess" class="success-message">{{ reviewSuccess }}</p>
        </div>
        <p v-else class="login-prompt">
          <router-link to="/login">Log in</router-link> to write a review.
        </p>

        <!-- Reviews List -->
        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">
            <p>No reviews yet. Be the first to review this album!</p>
          </div>
          <div v-for="review in reviews" :key="review.review_id" class="review">
            <div class="review-header">
              <!-- <strong>{{ review.username }}</strong> -->
              <router-link :to="`/user/${review.username}`">{{ review.username }}</router-link>

              <small>{{ formatDate(review.created_at) }}</small>
            </div>
            <p class="review-text">{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      <p>Loading album or album not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StarRating from './StarRating.vue';
import FavoriteIcon from './FavoriteIcon.vue';
import { useUserStore } from '../stores/user';
import HeaderBar from './HeaderBar.vue';

const apiUrl = import.meta.env.VITE_API_URL

const searchQuery = ref('');

interface Album {
  album_id: number;
  album_name: string;
  artist_name: string;
  cover_url: string;
  avgRating: string | null;
  favoriteCount: number | null;
  artist_slug: string;
  year: number;
  genre_name: string;
}

interface Review {
  review_id: number;
  username: string;
  comment: string;
  created_at: string;
}

const userStore = useUserStore();
const route = useRoute();
const album = ref<Album | null>(null);
const reviews = ref<Review[]>([]);
const newReview = ref('');
const isSubmitting = ref(false);
const isDeleting = ref(false);
const reviewError = ref('');
const reviewSuccess = ref('');

const userRating = ref<number>(0); 
const isFavorite = ref(false);
const userHasReview = ref(false);

// Helper function to fetch/refresh album data
async function fetchAlbumData() {
  try {
    const albumId = Number(route.params.id);
    const response = await fetch(`${apiUrl}/albums/${albumId}`);
    if (response.ok) {
      album.value = await response.json();
    } else {
      console.error('Failed to fetch album details');
      album.value = null;
    }
  } catch (error) {
     console.error('Error fetching album data:', error);
  }
}

// Fetch reviews
async function fetchReviews() {
  try {
    const albumId = Number(route.params.id);
    const response = await fetch(`${apiUrl}/albums/${albumId}/reviews`);
    if (response.ok) {
      reviews.value = await response.json();
    } else {
      console.error('Failed to fetch reviews');
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Clear messages after a timeout
function clearMessages() {
  setTimeout(() => {
    reviewError.value = '';
    reviewSuccess.value = '';
  }, 3000);
}

onMounted(async () => {
  // Cleaned up onMounted logic
  await fetchAlbumData();
  await fetchReviews();

  // If user is logged in, fetch their specific rating and favorite status
  if (userStore.loggedIn && album.value) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const statusResponse = await fetch(`${apiUrl}/user/albums/${album.value.album_id}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        if (data) {
          userRating.value = data.rating || 0;
          isFavorite.value = data.favorite || false;
          // Pre-fill review if user has one
          if (data.review) {
            newReview.value = data.review;
            userHasReview.value = true;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user status for album:', error);
    }
  }
});

// Submit a new review
const submitReview = async () => {
  if (!newReview.value.trim()) {
    reviewError.value = 'Review cannot be empty';
    clearMessages();
    return;
  }

  if (!album.value) return;

  isSubmitting.value = true;
  reviewError.value = '';
  reviewSuccess.value = '';

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${apiUrl}/albums/${album.value.album_id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment: newReview.value.trim() })
    });

    if (response.ok) {
      userHasReview.value = true;
      reviewSuccess.value = 'Review submitted successfully!';
      await fetchReviews(); // Refresh reviews list
      clearMessages();
    } else {
      const errorData = await response.json();
      reviewError.value = errorData.error || 'Failed to submit review';
      clearMessages();
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    reviewError.value = 'Network error. Please try again.';
    clearMessages();
  } finally {
    isSubmitting.value = false;
  }
};

// Delete review by sending empty comment
const deleteReview = async () => {
  if (!album.value) return;

  isDeleting.value = true;
  reviewError.value = '';
  reviewSuccess.value = '';

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${apiUrl}/albums/${album.value.album_id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment: '' }) // Send empty comment to delete
    });

    if (response.ok) {
      newReview.value = '';
      userHasReview.value = false;
      reviewSuccess.value = 'Review deleted successfully!';
      await fetchReviews(); // Refresh reviews list
      clearMessages();
    } else {
      const errorData = await response.json();
      reviewError.value = errorData.error || 'Failed to delete review';
      clearMessages();
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    reviewError.value = 'Network error. Please try again.';
    clearMessages();
  } finally {
    isDeleting.value = false;
  }
};

// Update rating in the database
const updateRating = async () => {
    if (!album.value) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    await fetch(`${apiUrl}/albums/${album.value.album_id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating: userRating.value })
    });
    // Refresh stats after updating
    await fetchAlbumData(); 
}

// Update favorite status in the database
const updateFavorite = async () => {
  if (!album.value) return;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const method = isFavorite.value ? 'POST' : 'DELETE';
  await fetch(`${apiUrl}/albums/${album.value.album_id}/favorites`, {
    method: method,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  await fetchAlbumData(); 
}

// Handler for rating events from StarRating
const handleRating = (selectedRating: number) => {
  userRating.value = selectedRating;
  updateRating();
}

// Handler for toggling favorite
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  updateFavorite();
}
</script>

<style scoped>
.album-details {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: #191b28;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  color: aliceblue;
}

.main-info {
  display: flex;
  flex-direction: row;
  gap: 30px;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  padding-bottom: 10px;
}

.info-item {
  font-size: 1.2em;
}

.album-cover {
  width: 250px;
  height: 250px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.text-info {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.text-info h1 {
  margin: 0 0 5px 0;
  font-size: 2.5em;
}

.text-info h2 {
  margin: 0 0 20px 0;
  font-size: 1.5em;
  font-weight: 400;
  color: #a8aeba;
}

.community-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #0a1527;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 0.9em;
  color: #a8aeba;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: auto;
}

.login-prompt {
  margin-top: auto;
  color: #a8aeba;
}

.login-prompt a {
  color: #606ff2;
  font-weight: bold;
  text-decoration: none;
}

/* Reviews Section Styles */
.reviews-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.reviews-section h3 {
  margin-bottom: 20px;
  font-size: 1.8em;
}

.review-form {
  margin-bottom: 30px;
}

.review-form textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  background-color: #0a1527;
  color: aliceblue;
  border: 1px solid #333;
  resize: vertical;
  font-family: inherit;
}

.review-form-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.review-form button {
  background-color: #606ff2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.review-form button:hover:not(:disabled) {
  background-color: #4b57c5;
}

.review-form button:disabled {
  background-color: #4a56b0;
  cursor: not-allowed;
}

.delete-button {
  background-color: #dc3545 !important;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333 !important;
}

.delete-button:disabled {
  background-color: #6c757d !important;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9em;
  margin-top: 5px;
}

.success-message {
  color: #28a745;
  font-size: 0.9em;
  margin-top: 5px;
}

.reviews-list .review {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #0a1527;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-header strong {
  color: #606ff2;
}

.review-header small {
  color: #a8aeba;
  font-size: 0.85em;
}

.review-text {
  margin: 0;
  line-height: 1.5;
}

.no-reviews {
  text-align: center;
  color: #a8aeba;
  font-style: italic;
  padding: 20px;
}

.not-found {
  text-align: center;
  margin: 40px auto;
  font-size: 1.2em;
  color: #777;
}

@media (max-width: 600px) {
  .main-info {
    flex-direction: column;
    align-items: center;
  }
  .text-info {
    align-items: center;
  }
  .album-cover {
    width: 200px;
    height: 200px;
  }
  .community-stats {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  .user-actions {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  .review-form-buttons {
    flex-direction: column;
  }
}
</style>