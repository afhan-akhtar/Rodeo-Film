<template>
  <div data-scroll-container class="layout-container">
    <ScrollProgress />
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

/* Enhanced scroll container with better performance */
[data-scroll-container] {
  /* Improved performance with hardware acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  
  /* Smooth scrolling experience */
  scroll-behavior: smooth;
  
  /* Better touch handling */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

/* Optimize scroll elements for better performance */
[data-scroll] {
  /* Hardware acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  
  /* Smooth transitions */
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Enhanced reveal animations */
[data-scroll].is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1) translateZ(0);
}

/* Parallax elements optimization */
[data-scroll-speed] {
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Scale elements optimization */
[data-scroll-scale] {
  will-change: transform;
  transform-origin: center center;
  backface-visibility: hidden;
}

/* Smooth momentum scrolling */
[data-scroll-container] {
  /* Enhanced momentum */
  scroll-behavior: smooth;
  
  /* Better performance */
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Optimize for reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  [data-scroll] {
    transition: none !important;
  }
  
  [data-scroll-container] {
    scroll-behavior: auto;
  }
}
</style> 