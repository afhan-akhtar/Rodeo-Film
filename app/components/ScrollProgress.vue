<template>
  <div class="scroll-progress">
    <div 
      class="scroll-progress-bar" 
      :style="{ width: `${scrollProgress}%` }"
    ></div>
  </div>
</template>

<script setup>
const scrollProgress = ref(0)

onMounted(() => {
  if (process.client) {
    // Listen for locomotive scroll events
    document.addEventListener('locomotive-scroll', (event) => {
      const { progress } = event.detail
      scrollProgress.value = Math.round(progress * 100)
    })

    // Fallback for regular scroll
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      scrollProgress.value = Math.round((scrollTop / scrollHeight) * 100)
    })
  }
})
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(139, 92, 246, 0.1);
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.scroll-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a855f7, #c084fc);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
  transition: width 0.3s ease-out;
  border-radius: 0 2px 2px 0;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .scroll-progress-bar {
    animation: none;
  }
}
</style>
