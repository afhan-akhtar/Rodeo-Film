<template>
  <div class="min-h-screen bg-black text-white overflow-hidden relative">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 p-6 lg:p-8">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <svg width="160" height="53" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-white">
          <circle cx="20" cy="20" r="15" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="20" cy="20" r="8" fill="currentColor"/>
          <rect x="30" y="12" width="4" height="16" fill="currentColor"/>
          <rect x="36" y="8" width="4" height="24" fill="currentColor"/>
          <rect x="42" y="10" width="4" height="20" fill="currentColor"/>
          <text x="52" y="16" fill="currentColor" font-family="serif" font-size="12" font-weight="bold">RODEO</text>
          <text x="52" y="28" fill="currentColor" font-family="serif" font-size="8" opacity="0.8">FILM</text>
        </svg>
        
        <!-- Hamburger Menu -->
        <button v-if="!projectsOpen && !currentPlayingProject && !awardsOpen && !playlistOpen && !aboutOpen" class="hamburger-menu p-2" @click="toggleMenu">
          <div class="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
          <div class="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
          <div class="w-6 h-0.5 bg-white transition-all duration-300"></div>
        </button>
      </div>
    </nav>

    <!-- Grid Project Showcase -->
    <div 
      class="showcase-container"
      @wheel="handleWheel" 
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart" 
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        class="showcase-wrapper" 
        :style="{ 
          transform: `translate3d(${scrollX}px, ${scrollY}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
      >
        <!-- Grid Project Showcases -->
        <div 
          v-for="project in gridProjects" 
          :key="`showcase-${project.id}-${project.gridX}-${project.gridY}`"
          class="project-grid-item"
          :style="getGridPosition(project.gridX, project.gridY)"
          @mouseenter="handleGridVideoHover($event, project)"
          @mouseleave="handleGridVideoLeave($event)"
        >
          <!-- Background Image/Video -->
          <div class="relative w-full h-full overflow-hidden group hexagon-content">
            <!-- Conditional rendering for video or image -->
            <video
              v-if="project.mediaType === 'video'"
              :poster="project.poster"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              loop
              playsinline
            >
              <source :src="project.video" type="video/mp4">
              <!-- Fallback to poster image if video fails -->
              <img :src="project.poster" :alt="project.showcase_title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </video>
            <img
              v-else
              :src="project.image"
              :alt="project.showcase_title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            
          </div>
          
          <!-- Bottom Text Overlay (like real site) -->
          <div class="absolute bottom-8 right-8 text-right text-white">
           
          </div>
        </div>
      </div>
    </div>

    <!-- Side Menu Overlay -->
    <Transition name="menu">
      <div v-if="menuOpen" class="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
        <!-- Logo in Menu -->
        <div class="absolute top-6 left-6 lg:top-8 lg:left-8">
          <svg width="160" height="53" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-white">
            <circle cx="20" cy="20" r="15" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="20" cy="20" r="8" fill="currentColor"/>
            <rect x="30" y="12" width="4" height="16" fill="currentColor"/>
            <rect x="36" y="8" width="4" height="24" fill="currentColor"/>
            <rect x="42" y="10" width="4" height="20" fill="currentColor"/>
            <text x="52" y="16" fill="currentColor" font-family="serif" font-size="12" font-weight="bold">RODEO</text>
            <text x="52" y="28" fill="currentColor" font-family="serif" font-size="8" opacity="0.8">FILM</text>
          </svg>
        </div>
        
        <div class="flex flex-col items-center justify-center h-full space-y-8">
                      <nav class="text-center space-y-4">
              <button @click="toggleProjects" class="block w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-bold tracking-wider text-white hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer hover-glow backdrop-blur-sm" style="font-size: 12px;">PROJECTS</button>
              <button @click="toggleAwards" class="block w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-bold tracking-wider text-white hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer hover-glow backdrop-blur-sm" style="font-size: 12px;">AWARDS</button>
              <a href="#" class="block w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-bold tracking-wider text-white hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105 transition-all duration-300 hover-glow backdrop-blur-sm" style="font-size: 12px;">GALLERY</a>
              <button @click="togglePlaylist" class="block w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-bold tracking-wider text-white hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer hover-glow backdrop-blur-sm" style="font-size: 12px;">PLAYLIST</button>
              <button @click="toggleAbout" class="block w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-bold tracking-wider text-white hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer hover-glow backdrop-blur-sm" style="font-size: 12px;">ABOUT</button>
            </nav>
        </div>
        
        <!-- Close Button -->
        <button @click="toggleMenu"  class="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 z-50 hover:scale-110 transition-transform duration-200">
          <div class="relative w-6 h-6">
            <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform rotate-45 -translate-y-0.5"></div>
            <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform -rotate-45 -translate-y-0.5"></div>
          </div>
        </button>
      </div>
    </Transition>

   <!-- Projects Gallery -->
<!-- Projects Gallery -->
<Transition name="projects">
  <div v-if="projectsOpen" class="fixed inset-0 z-40 bg-black">
    
    <!-- Full Background Video -->
    <div class="absolute inset-0">
      <video 
        v-if="currentHoveredProject"
        :key="currentHoveredProject.id"
        playsinline 
        loop 
        muted 
        :poster="currentHoveredProject.poster"
        class="projects-bg-video absolute inset-0 w-full h-full object-cover"
      >
        <source :src="currentHoveredProject.video" type="video/mp4">
      </video>

      <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Project Links Overlay -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full p-12">
      <div class="text-center max-w-4xl w-full">
        <h2 class="font-bold tracking-wider text-white mb-8 hover:text-red-100 transition-colors duration-300" style="font-size: 16px;">
          PROJECTS
        </h2>
        
        <div class="space-y-4">
          <div 
            v-for="project in projectVideos" 
            :key="project.id"
            class="project-link group cursor-pointer"
            @mouseenter="handleProjectHover(project)"
            @mouseleave="handleProjectLeave"
            @click="handleProjectClick(project)"
          >
            <div class="border-b border-white/30 pb-3 group-hover:border-red-400/60 transition-all duration-300">
              <h3 class="font-bold tracking-wider text-white group-hover:text-red-300 hover:scale-105 transition-all duration-300 mb-1" style="font-size: 14px;">
                {{ project.title }}
              </h3>
              <div class="flex justify-between items-center">
                <p class="text-white/80 font-medium" style="font-size: 11px;">{{ project.client }}</p>
                <p class="text-white/60" style="font-size: 11px;">{{ project.director }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</Transition>


<!-- ✅ Close Button: only shows when projectsOpen OR video is playing -->
<button 
  v-if="projectsOpen"
  @click="closeProjects" 
  class="fixed top-6 right-6 lg:top-8 lg:right-8 p-2 z-50 hover:scale-110 transition-transform duration-200"
>
  <div class="relative w-6 h-6">
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform rotate-45 -translate-y-0.5"></div>
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform -rotate-45 -translate-y-0.5"></div>
  </div>
</button>





    <!-- Awards Gallery -->
  <!-- Awards Gallery -->
<Transition name="awards">
  <div v-if="awardsOpen" class="fixed inset-0 z-40 bg-black">
    
    <!-- Full Background Video -->
    <div class="absolute inset-0">
      <video 
        v-if="currentHoveredAward"
        :key="currentHoveredAward.id"
        playsinline 
        loop 
        muted 
        :poster="currentHoveredAward.poster"
        class="awards-bg-video absolute inset-0 w-full h-full object-cover"
      >
        <source :src="currentHoveredAward.video" type="video/mp4">
      </video>

      <div v-else class="absolute inset-0 bg-gradient-to-br from-amber-900 to-black"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Award Links Overlay -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full p-12">
      <div class="text-center max-w-4xl w-full">
        <h2 class="font-bold tracking-wider text-white mb-8 hover:text-red-100 transition-colors duration-300" style="font-size: 16px;">
          AWARDS
        </h2>
        
        <div class="space-y-4">
          <div 
            v-for="award in awardVideos" 
            :key="award.id"
            class="award-link group cursor-pointer"
            @mouseenter="handleAwardHover(award)"
            @mouseleave="handleAwardLeave"
            @click="handleAwardClick(award)"
          >
            <div class="border-b border-white/30 pb-3 group-hover:border-red-400/60 transition-all duration-300">
              <h3 class="font-bold tracking-wider text-white group-hover:text-red-300 hover:scale-105 transition-all duration-300 mb-1" style="font-size: 14px;">
                {{ award.title }}
              </h3>
              <div class="flex justify-between items-center">
                <p class="text-white/80 font-medium" style="font-size: 11px;">{{ award.award }}</p>
                <p class="text-white/60" style="font-size: 11px;">{{ award.category }} • {{ award.year }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</Transition>

<!-- ✅ Close Button: only shows when awardsOpen is true -->
<button 
  v-if="awardsOpen"
  @click="closeAwards" 
  class="fixed top-6 right-6 lg:top-8 lg:right-8 p-2 z-50 hover:scale-110 transition-transform duration-200"
>
  <div class="relative w-6 h-6">
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform rotate-45 -translate-y-0.5"></div>
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform -rotate-45 -translate-y-0.5"></div>
  </div>
</button>


    <!-- Playlist Gallery -->
 <!-- Playlist Gallery -->
<Transition name="playlist">
  <div v-if="playlistOpen" class="fixed inset-0 z-40 bg-black">
    
    <!-- Full Background Video -->
    <div class="absolute inset-0">
      <video 
        v-if="currentHoveredPlaylist"
        :key="currentHoveredPlaylist.id"
        playsinline 
        loop 
        muted 
        autoplay
        :poster="currentHoveredPlaylist.poster"
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source :src="currentHoveredPlaylist.video" type="video/mp4">
      </video>

      <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Playlist Links Overlay -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full p-12">
      <div class="text-center max-w-4xl w-full">
        <h2 class="font-bold tracking-wider text-white mb-8 hover:text-red-100 transition-colors duration-300" style="font-size: 16px;">
          PLAYLIST
        </h2>
        
        <div class="space-y-4">
          <a 
            v-for="playlist in playlists" 
            :key="playlist.id"
            :href="playlist.url"
            target="_blank"
            rel="noopener"
            class="playlist-link group cursor-pointer block"
            @mouseenter="handlePlaylistHover(playlist)"
            @mouseleave="handlePlaylistLeave"
          >
            <div class="border-b border-white/30 pb-3 group-hover:border-red-400/60 transition-all duration-300">
              <div class="flex justify-between items-center">
                <div class="text-left">
                  <h3 class="font-bold tracking-wider text-white group-hover:text-red-300 hover:scale-105 transition-all duration-300 mb-1" style="font-size: 14px;">
                    {{ playlist.title }}
                  </h3>
                  <p class="text-white/60" style="font-size: 11px;">{{ playlist.subtitle }}</p>
                </div>
                <div class="text-right">
                  <p class="text-white/80 uppercase tracking-wider font-semibold group-hover:text-red-400 transition-colors duration-300" style="font-size: 11px;">
                    LISTEN
                  </p>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>

  </div>
</Transition>

<!-- ✅ Close Button -->
<button 
  v-if="playlistOpen"
  @click="closePlaylist" 
  class="fixed top-6 right-6 lg:top-8 lg:right-8 p-2 z-50 hover:scale-110 transition-transform duration-200"
>
  <div class="relative w-6 h-6">
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform rotate-45 -translate-y-0.5"></div>
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform -rotate-45 -translate-y-0.5"></div>
  </div>
</button>


    <!-- About Section -->
  <!-- About Section -->
<Transition name="about">
  <div v-if="aboutOpen" class="fixed inset-0 z-40 bg-black">
    
    <!-- Full Background Video or Fallback -->
    <div class="absolute inset-0">
      <video 
        v-if="currentHoveredAbout"
        :key="currentHoveredAbout.id"
        playsinline 
        loop 
        muted 
        autoplay
        :poster="currentHoveredAbout.poster"
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source :src="currentHoveredAbout.video" type="video/mp4">
      </video>

      <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- About Content Overlay -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full p-12">
      <div class="text-center max-w-4xl w-full">
        <h2 class="font-bold tracking-wider text-white mb-8 hover:text-red-100 transition-colors duration-300" style="font-size: 16px;">
          ABOUT
        </h2>

        <div class="space-y-6">
          <!-- About Text -->
          <div class="text-center">
            <p class="font-light tracking-wide text-white/90 leading-relaxed mb-6" style="font-size: 13px;">
              Rodeo Film is a collective based on the association of diverse talents. Comprising directors, photographers, editors, designers, and composers, we believe in the power of compelling visual stories that touch the heart and leave a lasting impression. We believe that every ordinary life holds an extraordinary story. We are convinced that the simplest moments can be transformed into captivating narratives, uncovering beauty in everyday life and revealing the exceptional in the ordinary.
            </p>
          </div>

          <!-- Contact Link -->
          <div class="border-t border-white/30 pt-4">
            <a 
              href="mailto:hugo@rodeo.film"
              class="contact-link group cursor-pointer inline-block"
            >
              <div class="group-hover:text-red-300 transition-colors duration-300 hover:scale-105 transform transition-transform">
                <p class="font-bold tracking-wider text-white uppercase" style="font-size: 14px;">
                  Contact Us
                </p>
                <p class="text-white/60 mt-1" style="font-size: 12px;">hugo@rodeo.film</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

  </div>
</Transition>

<!-- ✅ Close Button -->
<button 
  v-if="aboutOpen"
  @click="closeAbout" 
  class="fixed top-6 right-6 lg:top-8 lg:right-8 p-2 z-50 hover:scale-110 transition-transform duration-200"
>
  <div class="relative w-6 h-6">
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform rotate-45 -translate-y-0.5"></div>
    <div class="absolute top-1/2 left-0 w-6 h-0.5 bg-white transform -rotate-45 -translate-y-0.5"></div>
  </div>
</button>


    <!-- Full Video Player -->
    <Transition name="video">
      <div v-if="currentPlayingProject || currentPlayingAward" class="fixed inset-0 z-40 bg-black">
        <div class="flex items-center justify-center h-full">
          <!-- Project Video -->
          <video 
            v-if="currentPlayingProject"
            :key="currentPlayingProject.id"
            playsinline 
            controls
            autoplay
            :poster="currentPlayingProject.poster"
            class="max-w-full max-h-full"
          >
            <source :src="currentPlayingProject.video" type="video/mp4">
          </video>
          
          <!-- Award Video -->
          <video 
            v-if="currentPlayingAward"
            :key="currentPlayingAward.id"
            playsinline 
            controls
            autoplay
            :poster="currentPlayingAward.poster"
            :data-archives="currentPlayingAward.archiveId"
            class="max-w-full max-h-full"
          >
            <source :src="currentPlayingAward.video" type="video/mp4">
          </video>
        </div>
        
        <!-- Close Button -->
        <button @click="closeFullVideo" class="absolute top-6 right-6 lg:top-8 lg:right-8 p-2">
          <div class="w-6 h-0.5 bg-white transform rotate-45 absolute"></div>
          <div class="w-6 h-0.5 bg-white transform -rotate-45"></div>
        </button>
        
        <!-- Project Video Info Overlay -->
        <div v-if="currentPlayingProject" class="absolute bottom-8 left-8 text-white">
          <h3 class="text-4xl font-light tracking-wider">{{ currentPlayingProject.title }}</h3>
          <p class="text-xl text-white/80 mt-2">{{ currentPlayingProject.client }}</p>
          <p class="text-lg text-white/60 mt-1">Directed by {{ currentPlayingProject.director }}</p>
        </div>
        
        <!-- Award Video Info Overlay -->
        <div v-if="currentPlayingAward" class="absolute bottom-8 left-8 text-white">
          <h3 class="text-4xl font-light tracking-wider">{{ currentPlayingAward.title }}</h3>
          <p class="text-xl text-white/80 mt-2">{{ currentPlayingAward.award }}</p>
          <p class="text-lg text-white/60 mt-1">{{ currentPlayingAward.category }} • {{ currentPlayingAward.year }}</p>
        </div>
      </div>
    </Transition>

    <!-- Navigation Instructions -->
    <!-- <div class="fixed bottom-6 left-6 z-40 text-white/50 text-sm font-medium tracking-wide">
      Drag or scroll to explore
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'

const menuOpen = ref(false)
const projectsOpen = ref(false)
const awardsOpen = ref(false)
const playlistOpen = ref(false)
const aboutOpen = ref(false)
const currentHoveredProject = ref(null)
const currentPlayingProject = ref(null)
const currentHoveredAward = ref(null)
const currentPlayingAward = ref(null)
const scrollX = ref(0)
const scrollY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)
const lastTouchX = ref(0)
const lastTouchY = ref(0)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const toggleProjects = () => {
  projectsOpen.value = !projectsOpen.value
  menuOpen.value = false // Close main menu when opening projects
}

const toggleAwards = () => {
  awardsOpen.value = !awardsOpen.value
  menuOpen.value = false // Close main menu when opening awards
}

const togglePlaylist = () => {
  playlistOpen.value = !playlistOpen.value
  menuOpen.value = false // Close main menu when opening playlist
}

const toggleAbout = () => {
  aboutOpen.value = !aboutOpen.value
  menuOpen.value = false // Close main menu when opening about
}

const closeProjects = () => {
  projectsOpen.value = false
  currentHoveredProject.value = null
  currentPlayingProject.value = null
}

const closeAwards = () => {
  awardsOpen.value = false
  currentHoveredAward.value = null
  currentPlayingAward.value = null
}

const closePlaylist = () => {
  playlistOpen.value = false
}

const closeAbout = () => {
  aboutOpen.value = false
}

const handleProjectHover = async (project) => {
  currentHoveredProject.value = project
  // Wait for video element to be created and then play it
  await nextTick()
  const videoElement = document.querySelector('.projects-bg-video')
  if (videoElement) {
    try {
      await videoElement.play()
    } catch (error) {
      console.log('Video play failed:', error)
    }
  }
}

const handleProjectLeave = () => {
  const videoElement = document.querySelector('.projects-bg-video')
  if (videoElement) {
    videoElement.pause()
    videoElement.currentTime = 0
  }
  currentHoveredProject.value = null
}

const handleProjectClick = (project) => {
  currentPlayingProject.value = project
}

const handleAwardHover = async (award) => {
  currentHoveredAward.value = award
  // Wait for video element to be created and then play it
  await nextTick()
  const videoElement = document.querySelector('.awards-bg-video')
  if (videoElement) {
    try {
      await videoElement.play()
    } catch (error) {
      console.log('Video play failed:', error)
    }
  }
}

const handleAwardLeave = () => {
  const videoElement = document.querySelector('.awards-bg-video')
  if (videoElement) {
    videoElement.pause()
    videoElement.currentTime = 0
  }
  currentHoveredAward.value = null
}

const handleAwardClick = (award) => {
  currentPlayingAward.value = award
}

const closeFullVideo = () => {
  currentPlayingProject.value = null
  currentPlayingAward.value = null
}

// Grid video hover functions
const handleGridVideoHover = (event, project) => {
  if (project.mediaType === 'video') {
    const videoElement = event.currentTarget.querySelector('video')
    if (videoElement) {
      videoElement.play().catch(error => {
        console.log('Grid video play failed:', error)
      })
    }
  }
}

const handleGridVideoLeave = (event) => {
  const videoElement = event.currentTarget.querySelector('video')
  if (videoElement) {
    videoElement.pause()
    videoElement.currentTime = 0
  }
}

// Enhanced wheel scrolling for grid navigation
const handleWheel = (event) => {
  event.preventDefault()
  
  const sensitivity = 1.5 // Reduced sensitivity for grid navigation
  
  // Allow scrolling in all directions
  scrollX.value += event.deltaX * sensitivity
  scrollY.value += event.deltaY * sensitivity
  
  // Also allow horizontal scrolling with shift
  if (event.shiftKey) {
    scrollX.value += event.deltaY * sensitivity
  }
}

// Mouse drag controls
const handleMouseDown = (event) => {
  if (event.button === 0) {
    isDragging.value = true
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
    event.preventDefault()
  }
}

const handleMouseMove = (event) => {
  if (isDragging.value) {
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value
    
    scrollX.value += deltaX * 2
    scrollY.value += deltaY * 2
    
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// Touch controls
const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    lastTouchX.value = event.touches[0].clientX
    lastTouchY.value = event.touches[0].clientY
  }
}

const handleTouchMove = (event) => {
  event.preventDefault()
  if (event.touches.length === 1) {
    const deltaX = event.touches[0].clientX - lastTouchX.value
    const deltaY = event.touches[0].clientY - lastTouchY.value
    
    scrollX.value += deltaX * 2
    scrollY.value += deltaY * 2
    
    lastTouchX.value = event.touches[0].clientX
    lastTouchY.value = event.touches[0].clientY
  }
}

const handleTouchEnd = () => {
  // Touch ended
}

// Client-side dimensions to prevent hydration mismatch
const clientWidth = ref(1920)
const clientHeight = ref(1080)

// Position each grid item in hexagonal honeycomb pattern
const getGridPosition = (gridX, gridY) => {
  // Responsive sizing based on viewport
  const baseWidth = 280
  const baseHeight = 240 // Slightly taller for hexagon shape
  const gap = 10 // Reduced gap for tighter hexagon pattern
  
  // Scale items based on viewport size
  const scale = Math.min(clientWidth.value / 1920, 1) * 1.2
  const itemWidth = baseWidth * scale
  const itemHeight = baseHeight * scale
  const scaledGap = gap * scale
  
  // Hexagonal positioning: offset every other row
  const isOddRow = gridY % 2 === 1
  const offsetX = isOddRow ? (itemWidth + scaledGap) * 0.5 : 0
  
  // Vertical spacing adjusted for hexagon overlap
  const verticalSpacing = (itemHeight + scaledGap) * 0.75
  
  return {
    position: 'absolute',
    left: `${gridX * (itemWidth + scaledGap) + offsetX}px`,
    top: `${gridY * verticalSpacing}px`,
    width: `${itemWidth}px`,
    height: `${itemHeight}px`
  }
}

// Project data matching real rodeo.film style
const projects = [
  {
    id: 1,
    showcase_title: 'BENOIT',
    client: 'Netflix',
    category: 'Series',
    director: 'Gabriel Dugué',
    mediaType: 'video',
    video: 'https://rodeo.film/media/site/f0bdc32d47-1717166278/ap.mp4',
    poster: 'https://rodeo.film/media/site/ac2caafa79-1670507066/13.jpg'
  },
  {
    id: 2,
    showcase_title: 'BOU',
    client: 'Arte',
    category: 'Documentary',
    director: 'Hugo Kerr',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1920&h=1080&fit=crop&q=90'
  },
  {
    id: 3,
    showcase_title: 'LA CIBLE',
    client: 'Canal+',
    category: 'Series',
    director: 'Gabriel Dugué',
    mediaType: 'video',
    video: 'https://rodeo.film/media/site/3ed14dabac-1717424859/wheels.mp4',
    poster: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1920&h=1080&fit=crop&q=90'
  },
  {
    id: 4,
    showcase_title: 'NEON',
    client: 'Nike',
    category: 'Commercial',
    director: 'Hugo Kerr',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90'
  },
  {
    id: 5,
    showcase_title: 'VISION',
    client: 'Apple',
    category: 'Product Film',
    director: 'Claire Martin',
    mediaType: 'video',
    video: 'https://rodeo.film/media/site/9640d12f12-1718114663/boucle3.mp4',
    poster: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=1920&h=1080&fit=crop&q=90'
  },
  {
    id: 6,
    showcase_title: 'ECHOES',
    client: 'Spotify',
    category: 'Music Video',
    director: 'Antoine Blossier',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90'
  },
  {
    id: 7,
    showcase_title: 'MOMENTUM',
    client: 'Adidas',
    category: 'Sports Film',
    director: 'Sofia Chen',
    mediaType: 'video',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=90'
  },
  {
    id: 8,
    showcase_title: 'LUMIÈRE',
    client: 'Mercedes',
    category: 'Automotive',
    director: 'Jean-Baptiste Roy',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&q=90'
  }
]

// Project video data for gallery
const projectVideos = [
  {
    id: 1,
    title: 'BENOIT',
    client: 'Netflix Series',
    director: 'Gabriel Dugué',
    poster: 'https://rodeo.film/media/site/ac2caafa79-1670507066/13.jpg',
    video: 'https://rodeo.film/media/site/f0bdc32d47-1717166278/ap.mp4'
  },
  {
    id: 2,
    title: 'WHEELS',
    client: 'Arte Documentary', 
    director: 'Hugo Kerr',
    poster: 'https://rodeo.film/media/site/7cdf400bcc-1670503600/glasgow_5.jpg',
    video: 'https://rodeo.film/media/site/3ed14dabac-1717424859/wheels.mp4'
  },
  {
    id: 3,
    title: 'CHARLIE',
    client: 'Canal+ Series',
    director: 'Antoine Blossier',
    poster: 'https://rodeo.film/media/site/9ad64d3d60-1717165064/charlie-3.jpg',
    video: 'https://rodeo.film/media/site/9640d12f12-1718114663/boucle3.mp4'
  }
]

// Award video data for gallery
const awardVideos = [
  {
    id: 1,
    title: 'BENOIT',
    award: 'Cannes Lions Gold',
    category: 'Film Craft',
    year: '2024',
    poster: 'https://rodeo.film/media/site/3389e7c5bd-1670502543/benoit_3.jpg',
    video: 'https://rodeo.film/media/site/77663f7dc9-1717172886/benoit.mp4',
    archiveId: 'video-0'
  },
  {
    id: 2,
    title: 'BOUCAN',
    award: 'D&AD Pencil',
    category: 'Direction',
    year: '2024',
    poster: 'https://rodeo.film/media/site/8061eff27c-1670345386/affiche_boucan_-copie.jpg',
    video: 'https://rodeo.film/media/site/1752ed6232-1717423146/boucan_1.mp4',
    archiveId: 'video-1'
  },
  {
    id: 3,
    title: 'BOUCAN SPECIAL',
    award: 'Creative Circle Award',
    category: 'Best Film',
    year: '2024',
    poster: 'https://rodeo.film/media/site/8061eff27c-1670345386/affiche_boucan_-copie.jpg',
    video: 'https://rodeo.film/media/site/1752ed6232-1717423146/boucan_1.mp4',
    archiveId: 'video-2'
  },
  {
    id: 4,
    title: 'SWEET',
    award: 'AICP Awards',
    category: 'Commercial',
    year: '2023',
    poster: 'https://rodeo.film/media/site/8abc968a13-1670504153/boucan_1_6.jpg',
    video: 'https://rodeo.film/media/site/0207051adb-1717407391/sweet.mp4',
    archiveId: 'video-3'
  },
  {
    id: 5,
    title: 'SWEET DELUXE',
    award: 'LIA Awards',
    category: 'Cinematography',
    year: '2023',
    poster: 'https://rodeo.film/media/site/8abc968a13-1670504153/boucan_1_6.jpg',
    video: 'https://rodeo.film/media/site/0207051adb-1717407391/sweet.mp4',
    archiveId: 'video-4'
  },
  {
    id: 6,
    title: 'SWEET EDITION',
    award: 'Clio Awards',
    category: 'Music & Sound',
    year: '2023',
    poster: 'https://rodeo.film/media/site/8abc968a13-1670504153/boucan_1_6.jpg',
    video: 'https://rodeo.film/media/site/0207051adb-1717407391/sweet.mp4',
    archiveId: 'video-5'
  }
]

// Spotify Playlist data
const playlists = [
  {
    id: 1,
    title: 'RODEO RAP',
    subtitle: '58 TITRES',
    url: 'https://open.spotify.com/playlist/5TziFPuKVssPCxmqWH6Kcd?si=c025c759d2f34511&nd=1&dlsi=557e3440a61a4f89'
  },
  {
    id: 2,
    title: 'RODEO SWEET',
    subtitle: '65 TITRES',
    url: 'https://open.spotify.com/playlist/7s3lpPFm1yoOdGK4k1n9A9?si=3e13890cf5ac4524'
  },
  {
    id: 3,
    title: 'RODEO CHILL',
    subtitle: '160 TITRES',
    url: 'https://open.spotify.com/playlist/6JMxSqIjFuDQseX2IwGEAj?si=8091693003064cf1&nd=1&dlsi=324996e88fb24b1f'
  }
]

// Create infinite grid of small project showcases
const gridProjects = computed(() => {
  const grid = []
  const gridSize = 6 // 6x6 sections for more content
  const itemsPerRow = 6 // 6 items per row for smaller grid
  
  for (let x = -gridSize; x <= gridSize; x++) {
    for (let y = -gridSize; y <= gridSize; y++) {
      projects.forEach((project, index) => {
        grid.push({
          ...project,
          gridX: x * itemsPerRow + (index % itemsPerRow),
          gridY: y * Math.ceil(projects.length / itemsPerRow) + Math.floor(index / itemsPerRow),
          id: `${project.id}-${x}-${y}`
        })
      })
    }
  }
  
  return grid
})

// Keyboard controls for hexagonal grid navigation
const handleKeyDown = (event) => {
  // Calculate responsive spacing for hexagonal layout
  const scale = Math.min(clientWidth.value / 1920, 1) * 1.2
  const baseWidth = 280
  const baseHeight = 240
  const gap = 10
  const itemWidth = baseWidth * scale
  const itemHeight = baseHeight * scale
  const scaledGap = gap * scale
  
  const horizontalSpeed = itemWidth + scaledGap
  const verticalSpeed = (itemHeight + scaledGap) * 0.75 // Adjusted for hexagon spacing
  
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      scrollY.value += verticalSpeed
      event.preventDefault()
      break
    case 'ArrowDown':
    case 'KeyS':
      scrollY.value -= verticalSpeed
      event.preventDefault()
      break
    case 'ArrowLeft':
    case 'KeyA':
      scrollX.value += horizontalSpeed
      event.preventDefault()
      break
    case 'ArrowRight':
    case 'KeyD':
      scrollX.value -= horizontalSpeed
      event.preventDefault()
      break
    case 'Space':
      scrollX.value = 0
      scrollY.value = 0
      event.preventDefault()
      break
  }
}

onMounted(() => {
  if (process.client) {
    // Update client dimensions to actual viewport size
    clientWidth.value = window.innerWidth
    clientHeight.value = window.innerHeight
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown)
    
    // Handle window resize
    const handleResize = () => {
      clientWidth.value = window.innerWidth
      clientHeight.value = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    
    // Store resize handler for cleanup
    window._resizeHandler = handleResize
  }
  
  // Center the view on mount
  scrollX.value = 0
  scrollY.value = 0
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeyDown)
    if (window._resizeHandler) {
      window.removeEventListener('resize', window._resizeHandler)
      delete window._resizeHandler
    }
  }
})
</script>

<style scoped>
.showcase-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

.showcase-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: transform 0.1s linear;
}

.project-grid-item {
  display: block;
  background: #000;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.project-grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.hexagon-content {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.hexagon-content video,
.hexagon-content img {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .project-grid-item h3 {
    font-size: 0.875rem;
  }
  
  .project-grid-item .text-sm {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .project-grid-item h3 {
    font-size: 0.75rem;
  }
  
  .project-grid-item .text-sm {
    font-size: 0.625rem;
  }
}

/* Menu Transitions */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.4s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Projects Transitions */
.projects-enter-active,
.projects-leave-active {
  transition: all 0.4s ease;
}

.projects-enter-from,
.projects-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Awards Transitions */
.awards-enter-active,
.awards-leave-active {
  transition: all 0.4s ease;
}

.awards-enter-from,
.awards-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Playlist Transitions */
.playlist-enter-active,
.playlist-leave-active {
  transition: all 0.4s ease;
}

.playlist-enter-from,
.playlist-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* About Transitions */
.about-enter-active,
.about-leave-active {
  transition: all 0.4s ease;
}

.about-enter-from,
.about-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Video Player Transitions */
.video-enter-active,
.video-leave-active {
  transition: all 0.3s ease;
}

.video-enter-from,
.video-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Disable text selection during drag */
.showcase-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hardware acceleration */
.showcase-wrapper {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Hide scrollbars */
::-webkit-scrollbar {
  display: none;
}

/* Typography styles */
h1 {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-weight: 900;
  line-height: 0.8;
}
</style> 