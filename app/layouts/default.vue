<template>
  <div class="layout-container">
    <Transition 
      name="page"
      mode="out-in"
      @enter="onPageEnter"
      @leave="onPageLeave"
    >
      <slot />
    </Transition>
  </div>
</template>

<script setup>
import { gsap } from 'gsap'

const onPageEnter = (el, done) => {
  gsap.fromTo(el, 
    { 
      opacity: 0, 
      scale: 1.05,
      filter: "blur(10px)"
    },
    { 
      opacity: 1, 
      scale: 1,
      filter: "blur(0px)",
      duration: 0.6, 
      ease: "power2.out",
      onComplete: done
    }
  )
}

const onPageLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    scale: 0.95,
    filter: "blur(5px)",
    duration: 0.4,
    ease: "power2.in",
    onComplete: done
  })
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: #000;
}

/* Page transition styles */
.page-enter-active,
.page-leave-active {
  transition: none; /* Let GSAP handle transitions */
}
</style> 