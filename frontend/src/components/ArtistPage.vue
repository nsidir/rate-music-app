<template>
  <HeaderBar v-model:modelValue="searchQuery" />
  <div class="artist-page" v-if="artist">
    <h1 class="artist-title">{{ artist.artist_name }}</h1>
    <AlbumWall :albums="artist.albums" :searchQuery="searchQuery" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import AlbumWall from "./AlbumWall.vue";
import HeaderBar from "./HeaderBar.vue";

defineOptions({
  inheritAttrs: false
})

const route = useRoute();
const artist = ref<any>(null);
const searchQuery = ref('')

const apiUrl = import.meta.env.VITE_API_URL

onMounted(async () => {
  const artistSlug = route.params.artistSlug;
  const response = await fetch(`${apiUrl}/artists/${artistSlug}/discography`);
  if (response.ok) {
    const data = await response.json();
    artist.value = data;
  } else {
    // Optional: handle error, e.g. artist not found
    artist.value = null;
  }
});
</script>

<style scoped>
.artist-title {
  text-align: center;
  font-size: 2.2em;
  font-weight: bold;
  color: white;
  margin-bottom: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 6px;
  max-width: 300px;
  margin: 0 auto;
}



.album-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.album-row {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #191d22;
  border-radius: 8px;
  padding: 10px 18px;
  box-shadow: 0 1px 6px #111a;
}

.album-cover {
  width: 62px;
  height: 62px;
  border-radius: 7px;
  object-fit: cover;
  box-shadow: 0 1px 8px #2224;
  background: #444;
}

.album-title {
  font-size: 1.13em;
  font-weight: 500;
  color: #60aaff;
}


</style>
