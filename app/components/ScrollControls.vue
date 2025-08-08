<template>
  <div v-if="showControls" class="fixed bottom-6 right-6 z-50 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-3 transition-all duration-300">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-white text-sm font-semibold">Scroll Controls</h3>
      <button @click="toggleControls" class="text-white/60 hover:text-white transition-colors">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
    
    <!-- Speed Control -->
    <div class="space-y-2">
      <label class="text-white/80 text-xs block">Speed: {{ currentSpeed.toFixed(1) }}x</label>
      <input 
        type="range" 
        v-model="currentSpeed" 
        min="0.1" 
        max="3.0" 
        step="0.1"
        @input="updateScrollSpeed"
        class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
    
    <!-- Smoothness Control -->
    <div class="space-y-2">
      <label class="text-white/80 text-xs block">Smoothness: {{ (currentSmoothness * 100).toFixed(0) }}%</label>
      <input 
        type="range" 
        v-model="currentSmoothness" 
        min="0.01" 
        max="0.15" 
        step="0.01"
        @input="updateSmoothness"
        class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
    
    <!-- Preset Buttons -->
    <div class="flex space-x-2">
      <button @click="setPreset('slow')" class="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded transition-colors">
        Slow
      </button>
      <button @click="setPreset('normal')" class="px-3 py-1 bg-green-600/50 hover:bg-green-600 text-white text-xs rounded transition-colors">
        Normal
      </button>
      <button @click="setPreset('fast')" class="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white text-xs rounded transition-colors">
        Fast
      </button>
    </div>
    
    <!-- Toggle Scroll -->
    <div class="flex space-x-2">
      <button @click="pauseScroll" :disabled="isPaused" class="px-3 py-1 bg-orange-600/50 hover:bg-orange-600 disabled:opacity-50 text-white text-xs rounded transition-colors">
        Pause
      </button>
      <button @click="resumeScroll" :disabled="!isPaused" class="px-3 py-1 bg-green-600/50 hover:bg-green-600 disabled:opacity-50 text-white text-xs rounded transition-colors">
        Resume
      </button>
    </div>
  </div>
  
  <!-- Floating Toggle Button -->
  <button 
    v-else
    @click="toggleControls" 
    class="fixed bottom-6 right-6 z-50 w-12 h-12 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300"
    title="Show Scroll Controls"
  >
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { $setScrollSpeed, $setSmoothness, $pauseScroll, $resumeScroll } = useNuxtApp()

const showControls = ref(false)
const currentSpeed = ref(0.8)
const currentSmoothness = ref(0.05)
const isPaused = ref(false)

const toggleControls = () => {
  showControls.value = !showControls.value
}

const updateScrollSpeed = () => {
  if ($setScrollSpeed) {
    $setScrollSpeed(parseFloat(currentSpeed.value))
  }
}

const updateSmoothness = () => {
  if ($setSmoothness) {
    $setSmoothness(parseFloat(currentSmoothness.value))
  }
}

const setPreset = (preset) => {
  switch (preset) {
    case 'slow':
      currentSpeed.value = 0.4
      currentSmoothness.value = 0.03
      break
    case 'normal':
      currentSpeed.value = 0.8
      currentSmoothness.value = 0.05
      break
    case 'fast':
      currentSpeed.value = 1.5
      currentSmoothness.value = 0.08
      break
  }
  updateScrollSpeed()
  updateSmoothness()
}

const pauseScroll = () => {
  if ($pauseScroll) {
    $pauseScroll()
    isPaused.value = true
  }
}

const resumeScroll = () => {
  if ($resumeScroll) {
    $resumeScroll()
    isPaused.value = false
  }
}

// Hide controls when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const controlsElement = e.target.closest('.fixed')
    if (!controlsElement && showControls.value) {
      // Small delay to allow button clicks to register
      setTimeout(() => {
        if (!e.target.closest('.fixed')) {
          showControls.value = false
        }
      }, 100)
    }
  })
})
</script>

<style scoped>
/* Custom slider styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.slider::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}
</style>
