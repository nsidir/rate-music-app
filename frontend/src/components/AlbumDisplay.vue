<script setup lang="ts">
import { Card, CardContent } from '../../@/components/ui/card';
import StarRating from './StarRating.vue';
import { defineProps, defineEmits, defineOptions } from 'vue';

interface Props {
  album: {
    id: number;
    name: string;
    artist: string;
    coverUrl: string;
  };
}

defineOptions({
  name: 'AlbumDisplay'
});

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'click', albumId: number): void;
}>();

// Handler function for the rating-selected event
function handleRatingSelected(rating: number) {
  console.log(`I rate ${props.album.name} ${rating} stars`);
}
</script>

<template>
  <Card 
    class="album-card transition-transform hover:scale-105 cursor-pointer" 
    @click="emit('click', props.album.id)"
  >
    <CardContent class="flex flex-col items-center p-4">
      <div class="relative w-full aspect-square overflow-hidden rounded-md">
        <img
          :src="props.album.coverUrl"
          :alt="props.album.name"
          class="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      <div class="text-center w-full">
        <h3 class="text-black font-semibold text-lg line-clamp-1">{{ props.album.name }}</h3>
        <h4 class="text-black text-sm line-clamp-1">{{ props.album.artist }}</h4>
      </div>
      <div class="flex justify-center w-full mt-2">
        <!-- Listen for the rating-selected event -->
        <StarRating @rating-selected="handleRatingSelected" />
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.album-card {
  width: 100%;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}
</style>