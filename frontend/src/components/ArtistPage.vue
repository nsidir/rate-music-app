<template>
  <div class="artist-page" v-if="artist">
    <h1 class="artist-title">{{ artist.artist_name }}</h1>
    <div class="album-list">
      <div
        v-for="album in artist.albums"
        :key="album.album_id"
        class="album-row"
      >
        <img :src="album.cover_url" alt="Album cover" class="album-cover" />
        <span class="album-title">{{ album.album_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const artist = ref<any>(null);

onMounted(async () => {
  const artistSlug = route.params.artistSlug;
  const response = await fetch(`http://localhost:4960/artists/${artistSlug}/discography`);
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
  font-size: 2.2em;
  font-weight: bold;
  margin-bottom: 32px;
  color: #fff
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
