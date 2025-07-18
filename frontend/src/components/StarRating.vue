<template>
    <div class="rating_wrapper">
      <div class="rating_stars" @mouseleave="resetHoveredRating" @click="handleStarsClick">
        <div
          class="star"
          v-for="n in 5"
          :key="n"
          :class="{ 'hovered': n <= hoveredRating || n <= clickedRating }"
          @mouseover="hoverRating(n)"
          @click.stop="clickRating(n)"
        ></div>
      </div>
      <div class="rating_display">
        {{ clickedRating > 0 ? clickedRating : '-' }} / 5
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  
  export default defineComponent({
    name: 'StarRating',
    emits: ['rating-selected'],
    props: {
        initialRating: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
      const hoveredRating = ref(0);
      const clickedRating = ref(props.initialRating);

      watch(() => props.initialRating, (newVal) => {
          clickedRating.value = newVal;
      });
  
      const hoverRating = (rating: number) => {
        hoveredRating.value = rating;
      };
  
      const clickRating = (rating: number) => {
        clickedRating.value = rating;
        emit('rating-selected', clickedRating.value);
      };
  
      const resetHoveredRating = () => {
        hoveredRating.value = 0;
      };
  
      const handleStarsClick = (event: MouseEvent) => {
        // If the user clicks on the container (not on a star), clear the rating.
        if (event.target === event.currentTarget) {
          clickedRating.value = 0;
          hoveredRating.value = 0;
          emit('rating-selected', 0); // Emit clear rating event
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
  