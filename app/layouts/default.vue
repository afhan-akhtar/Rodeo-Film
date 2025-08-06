<template>
  <div class="layout-container">
    <slot />
  </div>
</template>

<script setup>
// Simple layout without complex transitions to avoid Vue warnings
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: #000;
}
</style> 