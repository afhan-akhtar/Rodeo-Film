<template>
  <div data-scroll-container class="layout-container">
    <slot />
  </div>
</template>

<script setup>
// Layout with Locomotive Scroll container
onMounted(() => {
  // Emit event when layout is ready for Locomotive Scroll
  nextTick(() => {
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('locomotive-scroll-ready'))
    }, 200)
  })
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: #000;
}

/* Locomotive Scroll styles */
[data-scroll-container] {
  height: 100vh;
  overflow: hidden;
  will-change: transform; /* Optimize for animations */
}

/* Hide scrollbar while maintaining functionality */
[data-scroll-container]::-webkit-scrollbar {
  display: none;
}

[data-scroll-container] {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth animations for revealed elements */
.is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Performance optimizations */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Improve hardware acceleration for scroll elements */
[data-scroll] {
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Optimize touch interactions */
[data-scroll-container] {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}
</style> 