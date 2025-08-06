<template>
  <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="navClass">
    <div class="container mx-auto px-4 lg:px-6">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <svg><use xlink:href="#icon-logo"></use></svg>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-8">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/work" class="nav-link">Work</NuxtLink>
          <NuxtLink to="/directors" class="nav-link">Directors</NuxtLink>
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </div>

        <!-- CTA Button -->
        <div class="hidden lg:block">
          <NuxtLink to="/contact" class="btn-primary">
            Start a Project
          </NuxtLink>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="lg:hidden p-2 text-white hover:text-accent-500 transition-colors"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="lg:hidden bg-primary-950/95 backdrop-blur-md border-t border-primary-800">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col space-y-4">
            <NuxtLink to="/" class="nav-link text-lg" @click="closeMobileMenu">Home</NuxtLink>
            <NuxtLink to="/work" class="nav-link text-lg" @click="closeMobileMenu">Work</NuxtLink>
            <NuxtLink to="/directors" class="nav-link text-lg" @click="closeMobileMenu">Directors</NuxtLink>
            <NuxtLink to="/about" class="nav-link text-lg" @click="closeMobileMenu">About</NuxtLink>
            <NuxtLink to="/contact" class="nav-link text-lg" @click="closeMobileMenu">Contact</NuxtLink>
            <div class="pt-4">
              <NuxtLink to="/contact" class="btn-primary block text-center" @click="closeMobileMenu">
                Start a Project
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const mobileMenuOpen = ref(false)
const scrollY = ref(0)

const navClass = computed(() => {
  return scrollY.value > 50 
    ? 'bg-primary-950/90 backdrop-blur-md border-b border-primary-800/50 shadow-xl' 
    : 'bg-transparent'
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const updateScrollY = () => {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollY)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollY)
})

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.router-link-active {
  @apply text-white;
}

.router-link-active::after {
  @apply w-full;
}
</style> 