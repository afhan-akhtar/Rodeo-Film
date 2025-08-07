<template>
  <div v-if="isVisible" class="loading-overlay">
    <div class="loading-content">
      <!-- Animated Logo -->
      <div class="loading-logo">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-white">
          <circle 
            cx="20" 
            cy="20" 
            r="15" 
            stroke="currentColor" 
            stroke-width="2" 
            fill="none"
            class="logo-circle"
          />
          <circle 
            cx="20" 
            cy="20" 
            r="8" 
            fill="currentColor"
            class="logo-dot"
          />
          <rect x="30" y="12" width="4" height="16" fill="currentColor" class="logo-bar-1"/>
          <rect x="36" y="8" width="4" height="24" fill="currentColor" class="logo-bar-2"/>
          <rect x="42" y="10" width="4" height="20" fill="currentColor" class="logo-bar-3"/>
          <text x="52" y="16" fill="currentColor" font-family="serif" font-size="12" font-weight="bold" class="logo-text-1">RODEO</text>
          <text x="52" y="28" fill="currentColor" font-family="serif" font-size="8" opacity="0.8" class="logo-text-2">FILM</text>
        </svg>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
      
      <!-- Loading Text -->
      <div class="loading-text">
        <span class="loading-word">{{ currentWord }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['complete'])

const progress = ref(0)
const currentWord = ref('LOADING')

const loadingWords = [
  'LOADING',
  'PREPARING',
  'CRAFTING',
  'CREATING',
  'ALMOST READY',
  'WELCOME'
]

let wordIndex = 0
let progressTween = null
let wordInterval = null

const animateEntry = () => {
  const tl = gsap.timeline()
  
  // Fade in overlay
  tl.fromTo('.loading-overlay', 
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: "power2.out" }
  )
  
  // Animate logo elements
  tl.fromTo('.logo-circle',
    { scale: 0, rotation: -180 },
    { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" },
    "-=0.3"
  )
  .fromTo('.logo-dot',
    { scale: 0 },
    { scale: 1, duration: 0.3, ease: "back.out(1.7)" },
    "-=0.4"
  )
  .fromTo('.logo-bar-1, .logo-bar-2, .logo-bar-3',
    { scaleY: 0, transformOrigin: "bottom" },
    { scaleY: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 },
    "-=0.5"
  )
  .fromTo('.logo-text-1, .logo-text-2',
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 },
    "-=0.4"
  )
  
  // Animate progress container
  tl.fromTo('.progress-container',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    "-=0.3"
  )
  
  // Animate loading text
  tl.fromTo('.loading-text',
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
    "-=0.2"
  )
}

const animateProgress = () => {
  progressTween = gsap.to(progress, {
    value: 100,
    duration: props.duration / 1000,
    ease: "power2.inOut",
    onUpdate: () => {
      // Trigger word changes at specific progress points
      const currentProgress = progress.value
      const wordChangeInterval = 100 / loadingWords.length
      const newWordIndex = Math.min(
        Math.floor(currentProgress / wordChangeInterval),
        loadingWords.length - 1
      )
      
      if (newWordIndex !== wordIndex) {
        changeWord(newWordIndex)
      }
    },
    onComplete: () => {
      // Remove delay for immediate transition to showcase
      animateExit()
    }
  })
}

const changeWord = (newIndex) => {
  if (newIndex >= loadingWords.length) return
  
  wordIndex = newIndex
  
  // Animate word change
  gsap.timeline()
    .to('.loading-word', {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: "power2.in"
    })
    .call(() => {
      currentWord.value = loadingWords[wordIndex]
    })
    .to('.loading-word', {
      opacity: 1,
      y: 0,
      duration: 0.2,
      ease: "power2.out"
    })
}

const animateExit = () => {
  const tl = gsap.timeline()
  
  // Animate logo exit
  tl.to('.loading-logo', {
    scale: 0.8,
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  })
  
  // Animate progress exit
  tl.to('.progress-container, .loading-text', {
    opacity: 0,
    y: 20,
    duration: 0.3,
    ease: "power2.in",
    stagger: 0.1
  }, "-=0.3")
  
  // Fade out overlay faster for immediate showcase transition
  tl.to('.loading-overlay', {
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      emit('complete')
    }
  }, "-=0.1")
}

const startLoading = () => {
  if (props.isVisible) {
    animateEntry()
    setTimeout(() => {
      animateProgress()
    }, 1000)
  }
}

watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    startLoading()
  }
})

onMounted(() => {
  if (props.isVisible) {
    startLoading()
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.loading-logo {
  transform: scale(1.5);
}

.logo-circle {
  stroke-dasharray: 94.2;
  stroke-dashoffset: 94.2;
  animation: draw-circle 2s ease-in-out infinite alternate;
}

.logo-dot {
  animation: pulse-dot 2s ease-in-out infinite;
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ffa500);
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

.progress-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.loading-text {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.loading-word {
  display: inline-block;
}

@keyframes draw-circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .loading-logo {
    transform: scale(1.2);
  }
  
  .progress-container {
    min-width: 150px;
  }
  
  .loading-text {
    font-size: 1rem;
  }
}
</style>