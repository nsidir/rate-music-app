<!-- AlbumDisplay.vue -->
<script setup lang="ts">
import { Card, CardContent } from '../../@/components/ui/card'
import StarRating from './StarRating.vue';

interface Props {
  album: {
    id: number
    name: string
    // artist: string
    coverUrl: string
  }
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', albumId: number): void
}>()
</script>

<template>
    <Card 
      class="album-card transition-transform hover:scale-105 cursor-pointer" 
      @click="emit('click', album.id)"
    >
      <CardContent class="flex flex-col items-center p-4 gap-3">
        <div class="relative w-full aspect-square overflow-hidden rounded-md">
          <img
            :src="album.coverUrl"
            :alt="album.name"
            class="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
        <div class="text-center w-full">
          <h3 class="font-semibold text-lg line-clamp-1">{{ album.name }}</h3>
        </div>
        <div class="flex justify-center w-full mt-2">
          <StarRating />
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