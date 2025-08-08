<template>
  <div class="advanced-demo-page">
    <!-- Hero Section with Advanced Effects -->
    <section class="hero-section">
      <div class="hero-background" data-scroll-speed="0.3" data-scroll-color="true"></div>
      <div class="hero-content">
        <h1 class="text-hero gradient-text-animated" data-scroll>
          Advanced UI Animations
        </h1>
        <p class="text-xl text-white/80 mt-6" data-scroll>
          Experience the most attractive and fluid scrolling with advanced effects
        </p>
        <button 
          @click="scrollToNextSection" 
          class="btn-primary mt-8 glow-effect pulse-animation"
          data-scroll
        >
          Explore Advanced Effects
        </button>
      </div>
    </section>

    <!-- Rotation Effects Section -->
    <section class="rotation-section" ref="rotationSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Rotation Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in rotationItems" 
          :key="index"
          class="effect-card"
          :data-scroll-rotate="item.rotation"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Skew Effects Section -->
    <section class="skew-section" ref="skewSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Skew Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in skewItems" 
          :key="index"
          class="effect-card"
          :data-scroll-skew="item.skew"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Blur Effects Section -->
    <section class="blur-section" ref="blurSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Blur Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in blurItems" 
          :key="index"
          class="effect-card"
          :data-scroll-blur="item.blur"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3D Transform Section -->
    <section class="transform-3d-section" ref="transform3dSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        3D Transform Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in transform3dItems" 
          :key="index"
          class="effect-card transform-3d-element"
          :data-scroll-3d="true"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Morphing Effects Section -->
    <section class="morphing-section" ref="morphingSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Morphing Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in morphingItems" 
          :key="index"
          class="effect-card"
          :data-scroll-morph="true"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Glitch Effects Section -->
    <section class="glitch-section" ref="glitchSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Glitch Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in glitchItems" 
          :key="index"
          class="effect-card glitch-element"
          :data-scroll-glitch="true"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Wave Effects Section -->
    <section class="wave-section" ref="waveSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Wave Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in waveItems" 
          :key="index"
          class="effect-card wave-element"
          :data-scroll-wave="true"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Particle Effects Section -->
    <section class="particle-section" ref="particleSection">
      <h2 class="text-section-title text-center mb-12" data-scroll>
        Particle Effects
      </h2>
      <div class="effects-grid">
        <div 
          v-for="(item, index) in particleItems" 
          :key="index"
          class="effect-card particle-element"
          :data-scroll-particles="true"
          :data-scroll="true"
        >
          <div class="effect-content">
            <div class="effect-icon">{{ item.icon }}</div>
            <h3 class="text-lg font-semibold mt-4">{{ item.title }}</h3>
            <p class="text-white/70 text-sm mt-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Animation Controls -->
    <div class="animation-controls">
      <button @click="scrollToTop" class="control-btn">
        ↑ Top
      </button>
      <button @click="toggleAnimationSpeed" class="control-btn">
        {{ isFastAnimation ? '🐌 Slow' : '⚡ Fast' }}
      </button>
      <button @click="toggleAnimationPause" class="control-btn">
        {{ isPaused ? '▶️ Resume' : '⏸️ Pause' }}
      </button>
      <button @click="toggleGlitchMode" class="control-btn">
        {{ isGlitchMode ? '🔧 Normal' : '👾 Glitch' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { 
  scrollToElement, 
  addRotationEffect,
  addSkewEffect,
  addBlurEffect,
  add3DTransformEffect,
  addMorphingEffect,
  addGlitchEffect,
  addWaveEffect,
  addParticleEffect,
  scrollToTop,
  setScrollSpeed,
  pauseScroll,
  resumeScroll,
  addGlitchElement,
  addWaveElement,
  addParticleElement
} = useScrollEffects()

// Refs for sections
const rotationSection = ref(null)
const skewSection = ref(null)
const blurSection = ref(null)
const transform3dSection = ref(null)
const morphingSection = ref(null)
const glitchSection = ref(null)
const waveSection = ref(null)
const particleSection = ref(null)

// Animation control states
const isFastAnimation = ref(false)
const isPaused = ref(false)
const isGlitchMode = ref(false)

// Data for sections
const rotationItems = ref([
  { icon: '🔄', title: '360° Rotation', description: 'Full rotation effect', rotation: 360 },
  { icon: '⚡', title: '180° Rotation', description: 'Half rotation effect', rotation: 180 },
  { icon: '🌀', title: '90° Rotation', description: 'Quarter rotation effect', rotation: 90 },
  { icon: '💫', title: '45° Rotation', description: 'Small rotation effect', rotation: 45 }
])

const skewItems = ref([
  { icon: '📐', title: 'Skew 10°', description: 'Subtle skew effect', skew: 10 },
  { icon: '🔀', title: 'Skew 20°', description: 'Medium skew effect', skew: 20 },
  { icon: '⚡', title: 'Skew 30°', description: 'Strong skew effect', skew: 30 },
  { icon: '🌀', title: 'Skew 45°', description: 'Maximum skew effect', skew: 45 }
])

const blurItems = ref([
  { icon: '👁️', title: 'Blur 5px', description: 'Light blur effect', blur: 5 },
  { icon: '🔍', title: 'Blur 10px', description: 'Medium blur effect', blur: 10 },
  { icon: '🌫️', title: 'Blur 15px', description: 'Heavy blur effect', blur: 15 },
  { icon: '💨', title: 'Blur 20px', description: 'Maximum blur effect', blur: 20 }
])

const transform3dItems = ref([
  { icon: '🎲', title: '3D Transform', description: '3D perspective effect' },
  { icon: '🎯', title: '3D Rotation', description: '3D rotation effect' },
  { icon: '🌟', title: '3D Scale', description: '3D scaling effect' },
  { icon: '💎', title: '3D Morph', description: '3D morphing effect' }
])

const morphingItems = ref([
  { icon: '🔄', title: 'Shape Morph', description: 'Shape changing effect' },
  { icon: '🌀', title: 'Size Morph', description: 'Size changing effect' },
  { icon: '⚡', title: 'Color Morph', description: 'Color changing effect' },
  { icon: '💫', title: 'Style Morph', description: 'Style changing effect' }
])

const glitchItems = ref([
  { icon: '👾', title: 'Digital Glitch', description: 'Digital distortion effect' },
  { icon: '⚡', title: 'Static Glitch', description: 'Static interference effect' },
  { icon: '🔧', title: 'Hardware Glitch', description: 'Hardware failure effect' },
  { icon: '💻', title: 'Software Glitch', description: 'Software bug effect' }
])

const waveItems = ref([
  { icon: '🌊', title: 'Ocean Wave', description: 'Ocean wave motion' },
  { icon: '🌀', title: 'Spiral Wave', description: 'Spiral wave motion' },
  { icon: '⚡', title: 'Lightning Wave', description: 'Lightning wave motion' },
  { icon: '💫', title: 'Cosmic Wave', description: 'Cosmic wave motion' }
])

const particleItems = ref([
  { icon: '✨', title: 'Sparkle Particles', description: 'Sparkling particle effect' },
  { icon: '🌟', title: 'Star Particles', description: 'Star particle effect' },
  { icon: '💫', title: 'Dust Particles', description: 'Dust particle effect' },
  { icon: '🌌', title: 'Space Particles', description: 'Space particle effect' }
])

// Methods
const scrollToNextSection = () => {
  scrollToElement(rotationSection.value, -100)
}

const toggleAnimationSpeed = () => {
  isFastAnimation.value = !isFastAnimation.value
  setScrollSpeed(isFastAnimation.value ? 1.5 : 0.6)
}

const toggleAnimationPause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    pauseScroll()
  } else {
    resumeScroll()
  }
}

const toggleGlitchMode = () => {
  isGlitchMode.value = !isGlitchMode.value
  const glitchElements = document.querySelectorAll('.glitch-element')
  glitchElements.forEach(element => {
    if (isGlitchMode.value) {
      element.style.animationPlayState = 'running'
    } else {
      element.style.animationPlayState = 'paused'
    }
  })
}

// Initialize effects on mount
onMounted(() => {
  nextTick(() => {
    // Add advanced effects to elements
    const effectCards = document.querySelectorAll('.effect-card')
    effectCards.forEach((card, index) => {
      // Add stagger delay
      card.style.transitionDelay = `${index * 0.1}s`
      
      // Add hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05) translateY(-5px)'
      })
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) translateY(0)'
      })
    })
  })
})
</script>

<style scoped>
.advanced-demo-page {
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

/* Section Styles */
.rotation-section,
.skew-section,
.blur-section,
.transform-3d-section,
.morphing-section,
.glitch-section,
.wave-section,
.particle-section {
  @apply min-h-screen py-20;
}

.rotation-section { @apply bg-gradient-to-b from-primary-950 to-primary-900; }
.skew-section { @apply bg-gradient-to-b from-primary-900 to-primary-800; }
.blur-section { @apply bg-gradient-to-b from-primary-800 to-primary-700; }
.transform-3d-section { @apply bg-gradient-to-b from-primary-700 to-primary-600; }
.morphing-section { @apply bg-gradient-to-b from-primary-600 to-primary-500; }
.glitch-section { @apply bg-gradient-to-b from-primary-500 to-primary-400; }
.wave-section { @apply bg-gradient-to-b from-primary-400 to-primary-300; }
.particle-section { @apply bg-gradient-to-b from-primary-300 to-primary-200; }

/* Effects Grid */
.effects-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12;
}

.effect-card {
  @apply bg-primary-900/50 backdrop-blur-sm rounded-xl p-6 border border-primary-800/50 cursor-pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.effect-card:hover {
  @apply border-accent-500/50;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
}

.effect-content {
  @apply text-center;
}

.effect-icon {
  @apply text-4xl mb-4;
}

/* Animation Controls */
.animation-controls {
  @apply fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-50;
}

.control-btn {
  @apply bg-accent-500/20 backdrop-blur-md border border-accent-500/30 text-accent-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-500/30 hover:border-accent-500/50 transition-all duration-300;
}

/* Animations */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .effects-grid {
    @apply grid-cols-1 gap-6;
  }
  
  .animation-controls {
    @apply bottom-4 gap-2;
  }
  
  .control-btn {
    @apply px-3 py-1 text-xs;
  }
}

/* Enhanced hover effects */
.effect-card:hover {
  @apply transform scale-105;
  box-shadow: 0 25px 50px rgba(139, 92, 246, 0.3);
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

/* Glitch mode styles */
.glitch-mode .glitch-element {
  animation-play-state: running !important;
}

/* Wave mode styles */
.wave-mode .wave-element {
  animation-play-state: running !important;
}

/* Particle mode styles */
.particle-mode .particle-element::before {
  opacity: 0.5 !important;
}
</style>
