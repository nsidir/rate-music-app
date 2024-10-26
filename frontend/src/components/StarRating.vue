<template>
    <div class="rating_wrapper">
      <div class="rating_stars" @mouseleave="resetHoveredRating" @click="handleStarsClick">
        <div
          class="star"
          v-for="n in 5"
          :key="n"
          :class="{'hovered': n <= hoveredRating || n <= clickedRating}"
          @mouseover="hoverRating(n)"
          @click.stop="clickRating(n)"
        ></div>
      </div>
      <!-- Display the rating to the right, showing "-/5" when no rating is selected -->
      <div class="rating_display">
        {{ clickedRating > 0 ? clickedRating : '-' }} / 5
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    name: 'StarRating',
    setup() {
      const hoveredRating = ref(0);
      const clickedRating = ref(0);
  
      const hoverRating = (rating: number) => {
        hoveredRating.value = rating;
      };
  
      const clickRating = (rating: number) => {
        clickedRating.value = rating;
      };
  
      const resetHoveredRating = () => {
        hoveredRating.value = 0;
      };
  
      const handleStarsClick = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
          clickedRating.value = 0;
          hoveredRating.value = 0;
        }
      };
  
      return {
        hoveredRating,
        clickedRating,
        hoverRating,
        clickRating,
        resetHoveredRating,
        handleStarsClick,
      };
    },
  });
  </script>
  
  <style scoped>
  .rating_wrapper {
    display: flex;
    align-items: center;
  }
  .rating_stars {
    display: flex;
    border: 1px solid #a8aeba;
    padding: 10px;
    border-radius: 5px;
    transition: all 0.3s ease;
  }
  .star {
    width: 18px;
    height: 16px;
    background: url('https://e.snmc.io/2.5/img/star_sprite_4.png') no-repeat top left;
    margin-right: 2px;
    margin-top: 5px;
    cursor: pointer;
  }

  .star.hovered:nth-child(1) {
    background-position: 0 -198px;
  }

  .star.hovered:nth-child(2) {
    background-position: 0 -330px;
  }

  .star.hovered:nth-child(3) {
    background-position: 0 -462px;
  }

  .star.hovered:nth-child(4) {
    background-position: 0 -594px;
  }

  .star.hovered:nth-child(5) {
    background-position: 0 -66px;
  }

  .rating_display {
    margin-left: 10px;
    font-size: 16px;
    color: #a8aeba;
  }
</style>
