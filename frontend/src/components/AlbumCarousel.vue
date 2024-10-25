<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Card, CardContent } from '../../@/components/ui/card';
import StarRating from './StarRating.vue';
import { albumCovers } from './AlbumCovers'; // album covers dictionary

interface Album {
  album_id: string;
  album_name: string;
  artist_name: string;
  cover_image?: string; // Make it optional for now
}

const albums = ref<Album[]>([]);
const containerRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const fetchAlbums = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/albums');
    const albumsData = await response.json();

    // Assign cover images based on the dictionary
    albumsData.forEach((album: Album) => {
      album.cover_image = albumCovers[album.album_name]; // Set the cover image URL from the dictionary
    });

    albums.value = albumsData; // Update your state with albums including cover images
  } catch (error) {
    console.error('Error fetching albums:', error);
  }
};

const startDragging = (e: MouseEvent | TouchEvent) => {
  if (!containerRef.value) return;
  isDragging.value = true;
  startX.value = 'touches' in e ? e.touches[0].pageX : e.pageX;
  scrollLeft.value = containerRef.value.scrollLeft;
};

const stopDragging = () => {
  isDragging.value = false;
};

const drag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !containerRef.value) return;
  e.preventDefault();
  const x = 'touches' in e ? e.touches[0].pageX : e.pageX;
  const walk = x - startX.value;
  containerRef.value.scrollLeft = scrollLeft.value - walk;
};

onMounted(async () => {
  await fetchAlbums();
});

const containerStyle = computed(() => ({
  cursor: isDragging.value ? 'grabbing' : 'grab'
}));
</script>

<template>
  <div
    ref="containerRef"
    class="album-scroll-container"
    @mousedown="startDragging"
    @mousemove="drag"
    @mouseup="stopDragging"
    @mouseleave="stopDragging"
    @touchstart="startDragging"
    @touchmove="drag"
    @touchend="stopDragging"
    :style="containerStyle"
  >
    <div class="album-list">
      <Card v-for="album in albums" :key="album.album_id" class="album-card">
        <CardContent class="flex flex-col items-center justify-center h-full p-4">
          <img
            :src="album.cover_image"
            alt=""
            class="w-full h-48 object-cover rounded-md mb-4"
            v-if="album.cover_image"
            draggable="false"
          />
          <h3 class="text-xl font-bold mb-2">{{ album.album_name }}</h3>
          <p class="text-sm text-muted-foreground">{{ album.artist_name }}</p>
          <div class="mt-4">
            <StarRating />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.album-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
}

.album-scroll-container::-webkit-scrollbar {
  display: none; /* WebKit */
}

.album-list {
  display: inline-flex;
  transition: transform 0.3s ease;
}

.album-card {
  width: 320px;
  height: 400px;
  flex-shrink: 0;
  margin-right: 16px;
  white-space: normal;
}

.album-card:last-child {
  margin-right: 0;
}
</style>
