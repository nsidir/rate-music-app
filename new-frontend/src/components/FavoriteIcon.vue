<template>
    <div class="favorite-icon" @click="onClick">
      <svg viewBox="0 0 24 24" :class="{ active: isActive }" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3
                 c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3
                 C19.58 3 22 5.42 22 8.5
                 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>
  </template>
  
  <script setup lang="ts">
  
  const props = defineProps<{
    isActive: boolean
  }>()
  
  const emits = defineEmits<{
    (e: 'toggle'): void;
  }>()
  
  const onClick = () => {
    emits('toggle')
  }
  </script>
  
  <style scoped>
  .favorite-icon {
    cursor: pointer;
    display: inline-block;
  }
  svg {
    width: 48px; /* Adjust size as needed */
    height: 48px;
    fill: transparent;
    stroke: black;
    stroke-width: 2px;
    transition: all 0.5s;
  }
  svg.active {
    animation: like 0.5s 1;
    fill: red;
    stroke: none;
  }
  @keyframes like {
    0%   { transform: scale(1); }
    90%  { transform: scale(1.2); }
    100% { transform: scale(1.1); }
  }
  </style>
  