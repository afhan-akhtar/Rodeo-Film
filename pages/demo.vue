<template>
  <div class="demo-page">
    <!-- Hero Section with Parallax -->
    <section class="hero-section">
      <div class="hero-background" data-scroll-speed="0.3"></div>
      <div class="hero-content">
        <h1 class="text-hero gradient-text-animated" data-scroll>
          Fluid Scroll Experience
        </h1>
        <p class="text-xl text-white/80 mt-6" data-scroll>
          Experience the most attractive and smooth scrolling
        </p>
        <button 
          @click="scrollToNextSection" 
          class="btn-primary mt-8 glow-effect"
          data-scroll
        >
          Explore Effects
        </button>
      </div>
    </section>

    <!-- Parallax Section -->
    <section class="parallax-section" ref="parallaxSection">
      <div class="parallax-bg" data-scroll-speed="0.5"></div>
      <div class="content-wrapper">
        <h2 class="text-section-title text-center" data-scroll>
          Parallax Effects
        </h2>
        <div class="cards-grid">
          <div 
            v-for="(card, index) in parallaxCards" 
            :key="index"
            class="enhanced-card p-6"
            :data-scroll="true"
            :class="`stagger-${index + 1}`"
          >
            <h3 class="text-xl font-semibold mb-4">{{ card.title }}</h3>
            <p class="text-white/70">{{ card.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Scale Effects Section -->
    <section class="scale-section" ref="scaleSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Scale Animations
      </h2>
      <div class="scale-container">
        <div 
          v-for="(item, index) in scaleItems" 
          :key="index"
          class="scale-item"
          :data-scroll-scale="item.scale"
          :data-scroll="true"
        >
          <div class="scale-content">
            <h3 class="text-lg font-semibold mb-2">{{ item.title }}</h3>
            <p class="text-white/70 text-sm">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Magnetic Effects Section -->
    <section class="magnetic-section" ref="magneticSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Magnetic Interactions
      </h2>
      <div class="magnetic-grid">
        <div 
          v-for="(item, index) in magneticItems" 
          :key="index"
          class="magnetic-card"
          :ref="`magneticCard${index}`"
        >
          <div class="magnetic-content">
            <div class="magnetic-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Floating Elements Section -->
    <section class="floating-section" ref="floatingSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Floating Animations
      </h2>
      <div class="floating-container">
        <div 
          v-for="(item, index) in floatingItems" 
          :key="index"
          class="floating-item"
          :style="{ animationDelay: `${index * 0.5}s` }"
        >
          <div class="floating-content">
            <h3 class="text-lg font-semibold">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Scroll Controls -->
    <div class="scroll-controls">
      <button @click="scrollToTop" class="scroll-control-btn">
        ↑ Top
      </button>
      <button @click="toggleScrollSpeed" class="scroll-control-btn">
        {{ isFastScroll ? '🐌 Slow' : '⚡ Fast' }}
      </button>
      <button @click="toggleScrollPause" class="scroll-control-btn">
        {{ isPaused ? '▶️ Resume' : '⏸️ Pause' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { 
  scrollToElement, 
  addMagneticEffect, 
  addFloatingAnimation,
  scrollToTop,
  setScrollSpeed,
  pauseScroll,
  resumeScroll
} = useScrollEffects()

// Refs for sections
const parallaxSection = ref(null)
const scaleSection = ref(null)
const magneticSection = ref(null)
const floatingSection = ref(null)

// Scroll control states
const isFastScroll = ref(false)
const isPaused = ref(false)

// Data for sections
const parallaxCards = ref([
  { title: 'Smooth Parallax', description: 'Elements move at different speeds creating depth' },
  { title: 'Fluid Motion', description: 'Ultra-smooth scrolling with momentum' },
  { title: 'Performance Optimized', description: 'Hardware accelerated animations' },
  { title: 'Touch Friendly', description: 'Enhanced mobile and tablet experience' },
  { title: 'Keyboard Navigation', description: 'Full keyboard support with arrow keys' },
  { title: 'Accessibility', description: 'Reduced motion support and focus management' }
])

const scaleItems = ref([
  { title: 'Scale 1.1', description: 'Subtle scaling effect', scale: 1.1 },
  { title: 'Scale 1.2', description: 'Medium scaling effect', scale: 1.2 },
  { title: 'Scale 1.3', description: 'Strong scaling effect', scale: 1.3 },
  { title: 'Scale 1.4', description: 'Dramatic scaling effect', scale: 1.4 },
  { title: 'Scale 1.5', description: 'Maximum scaling effect', scale: 1.5 }
])

const magneticItems = ref([
  { icon: '🎯', title: 'Magnetic Effect', description: 'Elements follow your cursor' },
  { icon: '✨', title: 'Glow Effect', description: 'Beautiful glow animations' },
  { icon: '🚀', title: 'Lift Effect', description: 'Elements lift on hover' },
  { icon: '🌈', title: 'Gradient Text', description: 'Animated gradient text' }
])

const floatingItems = ref([
  { title: 'Floating Element 1', description: 'Gentle floating animation' },
  { title: 'Floating Element 2', description: 'Smooth up and down motion' },
  { title: 'Floating Element 3', description: 'Continuous floating effect' },
  { title: 'Floating Element 4', description: 'Relaxing animation pattern' }
])

// Methods
const scrollToNextSection = () => {
  scrollToElement(parallaxSection.value, -100)
}

const toggleScrollSpeed = () => {
  isFastScroll.value = !isFastScroll.value
  setScrollSpeed(isFastScroll.value ? 1.5 : 0.6)
}

const toggleScrollPause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    pauseScroll()
  } else {
    resumeScroll()
  }
}

// Initialize effects on mount
onMounted(() => {
  nextTick(() => {
    // Add magnetic effects
    magneticItems.value.forEach((_, index) => {
      const element = getCurrentInstance()?.refs[`magneticCard${index}`]
      if (element && element[0]) {
        addMagneticEffect(element[0], 0.3)
      }
    })

    // Add floating animations
    const floatingElements = document.querySelectorAll('.floating-item')
    floatingElements.forEach(element => {
      addFloatingAnimation(element)
    })
  })
})
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  @apply relative h-screen flex items-center justify-center overflow-hidden;
}

.hero-background {
  @apply absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900;
  background-size: 400% 400%;
  animation: gradient-shift 8s ease infinite;
}

.hero-content {
  @apply relative z-10 text-center px-4;
}

/* Parallax Section */
.parallax-section {
  @apply relative min-h-screen py-20;
}

.parallax-bg {
  @apply absolute inset-0 bg-gradient-to-b from-primary-800 to-primary-900;
  background-size: 200% 200%;
  animation: gradient-shift 10s ease infinite;
}

.content-wrapper {
  @apply relative z-10 container mx-auto px-4;
}

.cards-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12;
}

/* Scale Section */
.scale-section {
  @apply min-h-screen py-20 bg-primary-950;
}

.scale-container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12;
}

.scale-item {
  @apply bg-primary-900/50 backdrop-blur-sm rounded-xl p-6 border border-primary-800/50;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scale-content {
  @apply text-center;
}

/* Magnetic Section */
.magnetic-section {
  @apply min-h-screen py-20 bg-gradient-to-b from-primary-950 to-primary-900;
}

.magnetic-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12;
}

.magnetic-card {
  @apply bg-primary-900/50 backdrop-blur-sm rounded-xl p-6 border border-primary-800/50 cursor-pointer;
  transition: all 0.3s ease;
}

.magnetic-card:hover {
  @apply border-accent-500/50;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
}

.magnetic-content {
  @apply text-center;
}

.magnetic-icon {
  @apply text-4xl mb-4;
}

/* Floating Section */
.floating-section {
  @apply min-h-screen py-20 bg-primary-900;
}

.floating-container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12;
}

.floating-item {
  @apply bg-primary-800/50 backdrop-blur-sm rounded-xl p-6 border border-primary-700/50;
  animation: float 6s ease-in-out infinite;
}

.floating-content {
  @apply text-center;
}

/* Scroll Controls */
.scroll-controls {
  @apply fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-50;
}

.scroll-control-btn {
  @apply bg-accent-500/20 backdrop-blur-md border border-accent-500/30 text-accent-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-500/30 hover:border-accent-500/50 transition-all duration-300;
}

/* Animations */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cards-grid,
  .scale-container,
  .magnetic-grid,
  .floating-container {
    @apply grid-cols-1 gap-6;
  }
  
  .scroll-controls {
    @apply bottom-4 gap-2;
  }
  
  .scroll-control-btn {
    @apply px-3 py-1 text-xs;
  }
}

/* Enhanced hover effects */
.enhanced-card:hover {
  @apply transform scale-105;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
}

/* Smooth transitions for all elements */
* {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
