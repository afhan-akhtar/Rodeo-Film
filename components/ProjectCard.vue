<template>
  <div class="project-card group cursor-pointer" @click="openProject">
    <!-- Project Thumbnail/Video -->
    <div class="relative aspect-video overflow-hidden">
      <img
        :src="project.thumbnail"
        :alt="project.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      <!-- Video Preview on Hover -->
      <video
        v-if="project.video"
        ref="videoRef"
        :src="project.video"
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        @mouseenter="playVideo"
        @mouseleave="pauseVideo"
      ></video>
      
      <!-- Play Button Overlay -->
      <div class="video-overlay">
        <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      
      <!-- Category Badge -->
      <div class="absolute top-4 left-4">
        <span class="px-3 py-1 bg-accent-500 text-white text-sm font-medium rounded-full">
          {{ project.category }}
        </span>
      </div>
    </div>
    
    <!-- Project Info -->
    <div class="p-6">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xl font-serif font-semibold text-white group-hover:text-accent-400 transition-colors">
          {{ project.title }}
        </h3>
        <svg class="w-5 h-5 text-white/60 group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
      </div>
      
      <p class="text-white/70 font-medium mb-3">{{ project.client }}</p>
      
      <p v-if="project.description" class="text-white/60 text-sm line-clamp-2">
        {{ project.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const videoRef = ref(null)

const playVideo = async () => {
  if (videoRef.value) {
    try {
      await nextTick()
      await videoRef.value.play()
    } catch (error) {
      console.log('Video autoplay prevented:', error)
    }
  }
}

const pauseVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
}

const openProject = () => {
  // Navigate to project detail page
  navigateTo(`/work/${props.project.id}`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 