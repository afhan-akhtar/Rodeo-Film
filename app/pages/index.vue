<template>
  <div class="min-h-screen bg-black text-white overflow-hidden relative">
    <!-- Loading Screen -->
    <LoadingSpinner 
      :is-visible="showLoading" 
      :duration="2500"
      @complete="onLoadingComplete"
    />
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
      @wheel="gallery.handleWheel" 
      @mousedown="gallery.handleMouseDown"
      @mousemove="gallery.handleMouseMove"
      @mouseup="gallery.handleMouseUp"
      @mouseleave="gallery.handleMouseUp"
      @touchstart="gallery.handleTouchStart" 
      @touchmove="gallery.handleTouchMove"
      @touchend="gallery.handleTouchEnd"
    >
      <div 
        class="showcase-wrapper" 
        :style="{ 
          transform: `translate3d(${scrollX}px, ${scrollY}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
      >
        <!-- Grid Project Showcases - Only render items with actual media content -->
        <div 
          v-for="project in gridProjects" 
          v-show="project.image || project.video || project.poster"
          :key="`showcase-${project.id}-${project.gridX}-${project.gridY}`"
          class="project-grid-item cursor-pointer"
          :style="getGridPosition(project.gridX, project.gridY)"
          @mouseenter="handleEnhancedHover($event, project)"
          @mouseleave="handleEnhancedLeave($event, project)"
          @click="handleProjectClick($event, project)"
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
              :ref="el => setVideoRef(el, project)"
            >
              <source :src="project.video" type="video/mp4">
              <!-- Fallback to poster image if video fails -->
              <img :src="project.poster" :alt="project.showcase_title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </video>
            <img
              v-else
              :src="getCurrentImageSrc(project)"
              :alt="project.showcase_title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
          </div>
          
          <!-- Award Badge -->
          <div v-if="project.isAward" class="absolute top-4 right-4 bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full opacity-90">
            AWARD
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

    <!-- Enhanced Fullscreen Video Modal for Grid Projects -->
    <Transition name="video-modal">
      <div v-if="fullscreenVideo" class="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <!-- Video Container -->
        <div class="relative w-full h-full flex items-center justify-center">
          <video
            :key="fullscreenVideo.id"
            playsinline 
            controls
            autoplay
            muted
            loop
            :poster="fullscreenVideo.poster"
            class="max-w-full max-h-full"
          >
            <source :src="fullscreenVideo.video" type="video/mp4">
          </video>
        </div>
        
        <!-- Close Button -->
        <button @click="closeFullscreenVideo" class="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 hover:scale-110 transition-transform">
          <div class="w-6 h-0.5 bg-white transform rotate-45 absolute"></div>
          <div class="w-6 h-0.5 bg-white transform -rotate-45"></div>
        </button>
        
        <!-- Project Info Overlay -->
        <div class="absolute bottom-8 left-8 text-white">
          <h3 class="text-4xl font-light tracking-wider">{{ fullscreenVideo.showcase_title }}</h3>
          <p class="text-xl text-white/80 mt-2">{{ fullscreenVideo.client }}</p>
          <p class="text-lg text-white/60 mt-1">{{ fullscreenVideo.category }} • Directed by {{ fullscreenVideo.director }}</p>
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
import { useGallery } from '~/composables/gallery'

// Initialize GSAP Gallery functionality
const gallery = useGallery()

// Loading state
const showLoading = ref(true)

const menuOpen = ref(false)
const projectsOpen = ref(false)
const awardsOpen = ref(false)
const playlistOpen = ref(false)
const aboutOpen = ref(false)
const currentHoveredProject = ref(null)
const currentPlayingProject = ref(null)
const currentHoveredAward = ref(null)
const currentPlayingAward = ref(null)

// Use gallery's reactive scroll values instead of local ones
const { scrollX, scrollY, isDragging } = gallery

// Enhanced hover states for videos and images
const hoveredProjects = ref(new Map()) // Track hovered projects and their animation states
const fullscreenVideo = ref(null) // For fullscreen video modal
const imageAnimations = ref(new Map()) // Track image animation intervals
const currentHoveredPlaylist = ref(null)
const currentHoveredAbout = ref(null)

// Loading completion handler
const onLoadingComplete = () => {
  showLoading.value = false
  // Trigger entrance animations for the main content
  gallery.animatePageEnter()
}

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
  // Use the same fullscreen logic as projects
  if (award && award.video) {
    fullscreenVideo.value = {
      ...award,
      mediaType: 'video',
      showcase_title: award.title,
      client: award.award,
      category: award.category,
      director: award.year
    }
  }
}

const closeFullVideo = () => {
  currentPlayingProject.value = null
  currentPlayingAward.value = null
}

// Enhanced hover functions for videos and images
const videoRefs = new Map()

const setVideoRef = (el, project) => {
  if (el) {
    videoRefs.set(`${project.id}-${project.gridX}-${project.gridY}`, el)
  }
}

const handleEnhancedHover = (event, project) => {
  const projectKey = `${project.id}-${project.gridX}-${project.gridY}`
  
  // Apply GSAP hover animation
  gallery.animateItemHover(event.currentTarget, project)
  
  if (project.mediaType === 'video') {
    // Handle video hover - play in background immediately
    const videoElement = videoRefs.get(projectKey)
    if (videoElement) {
      videoElement.muted = true // Ensure it's muted for autoplay
      videoElement.currentTime = 0 // Start from beginning
      videoElement.play().catch(error => {
        console.log('Grid video play failed:', error)
      })
    }
  } else if (project.mediaType === 'image' && project.images && project.images.length > 1) {
    // Handle image hover - start animation cycling through images
    const currentState = hoveredProjects.value.get(projectKey) || { currentImageIndex: 0 }
    hoveredProjects.value.set(projectKey, { ...currentState, isHovered: true })
    
    // Clear any existing animation for this project
    if (imageAnimations.value.has(projectKey)) {
      clearInterval(imageAnimations.value.get(projectKey))
    }
    
    // Start image cycling animation
    const interval = setInterval(() => {
      const state = hoveredProjects.value.get(projectKey)
      if (state && state.isHovered) {
        const newIndex = (state.currentImageIndex + 1) % project.images.length
        hoveredProjects.value.set(projectKey, { ...state, currentImageIndex: newIndex })
      }
    }, 300) // Change image every 300ms
    
    imageAnimations.value.set(projectKey, interval)
  }
}

const handleEnhancedLeave = (event, project) => {
  const projectKey = `${project.id}-${project.gridX}-${project.gridY}`
  
  // Apply GSAP leave animation
  gallery.animateItemLeave(event.currentTarget)
  
  if (project.mediaType === 'video') {
    // Handle video leave - pause and reset
    const videoElement = videoRefs.get(projectKey)
    if (videoElement) {
      videoElement.pause()
      videoElement.currentTime = 0
    }
  } else if (project.mediaType === 'image' && project.images && project.images.length > 1) {
    // Handle image leave - stop animation and reset to first image
    const currentState = hoveredProjects.value.get(projectKey)
    if (currentState) {
      hoveredProjects.value.set(projectKey, { ...currentState, isHovered: false, currentImageIndex: 0 })
    }
    
    // Clear animation interval
    if (imageAnimations.value.has(projectKey)) {
      clearInterval(imageAnimations.value.get(projectKey))
      imageAnimations.value.delete(projectKey)
    }
  }
}

const getCurrentImageSrc = (project) => {
  const projectKey = `${project.id}-${project.gridX}-${project.gridY}`
  const state = hoveredProjects.value.get(projectKey)
  
  if (project.images && project.images.length > 1 && state) {
    return project.images[state.currentImageIndex] || project.image
  }
  
  return project.image
}

const handleProjectClick = (eventOrProject, project) => {
  // Handle both calling patterns:
  // 1. From grid: handleProjectClick($event, project)
  // 2. From gallery: handleProjectClick(project)
  let actualEvent = null
  let actualProject = null
  
  if (project) {
    // Called with (event, project)
    actualEvent = eventOrProject
    actualProject = project
  } else {
    // Called with just (project)
    actualProject = eventOrProject
  }
  
  if (actualProject && actualProject.mediaType === 'video') {
    // Open video in fullscreen modal
    fullscreenVideo.value = actualProject
    if (actualEvent) {
      actualEvent.stopPropagation()
    }
  } else if (actualProject && actualProject.video) {
    // For gallery projects that might not have mediaType but have video
    fullscreenVideo.value = {
      ...actualProject,
      mediaType: 'video',
      showcase_title: actualProject.title,
      client: actualProject.client,
      category: 'Video',
      director: actualProject.director
    }
    if (actualEvent) {
      actualEvent.stopPropagation()
    }
  }
}

const closeFullscreenVideo = () => {
  fullscreenVideo.value = null
}

// Playlist hover handlers
const handlePlaylistHover = (playlist) => {
  currentHoveredPlaylist.value = playlist
}

const handlePlaylistLeave = () => {
  currentHoveredPlaylist.value = null
}

// Client-side dimensions to prevent hydration mismatch
const clientWidth = ref(1920)
const clientHeight = ref(1080)

// Position each grid item in proper hexagonal honeycomb pattern
const getGridPosition = (gridX, gridY) => {
  // Responsive sizing based on viewport
  const baseWidth = 280
  const baseHeight = Math.round(baseWidth / 1.154) // Perfect hexagon height ratio
  
  // Scale items based on viewport size
  const scale = Math.min(clientWidth.value / 1920, 1) * 1.2
  const itemWidth = baseWidth * scale
  const itemHeight = baseHeight * scale
  
  // Perfect hexagonal tessellation calculations
  // For a regular hexagon with width W, the horizontal spacing is W * 3/4
  // and the vertical spacing is W * sqrt(3)/2 ≈ W * 0.866
  const horizontalSpacing = itemWidth * 0.75
  const verticalSpacing = itemWidth * 0.866 // Using width for perfect hexagon ratio
  
  // Hexagonal positioning: offset every other row by half horizontal spacing
  const isOddRow = gridY % 2 === 1
  const offsetX = isOddRow ? horizontalSpacing * 0.5 : 0
  
  return {
    position: 'absolute',
    left: `${gridX * horizontalSpacing + offsetX}px`,
    top: `${gridY * verticalSpacing}px`,
    width: `${itemWidth}px`,
    height: `${itemHeight}px`,
    zIndex: 1
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
    image: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=1920&h=1080&fit=crop&q=90'
    ]
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
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=90'
    ]
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
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90'
    ]
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
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1920&h=1080&fit=crop&q=90'
    ]
  },
  // Award videos in the grid
  {
    id: 9,
    showcase_title: 'BENOIT',
    client: 'Cannes Lions Gold',
    category: 'Film Craft',
    director: '2024',
    mediaType: 'video',
    video: 'https://rodeo.film/media/site/77663f7dc9-1717172886/benoit.mp4',
    poster: 'https://rodeo.film/media/site/3389e7c5bd-1670502543/benoit_3.jpg',
    isAward: true
  },
  {
    id: 10,
    showcase_title: 'BOUCAN',
    client: 'D&AD Pencil',
    category: 'Direction',
    director: '2024',
    mediaType: 'video',
    video: 'https://rodeo.film/media/site/1752ed6232-1717423146/boucan_1.mp4',
    poster: 'https://rodeo.film/media/site/8061eff27c-1670345386/affiche_boucan_-copie.jpg',
    isAward: true
  },
  {
    id: 11,
    showcase_title: 'SWEET',
    client: 'AICP Awards',
    category: 'Commercial',
    director: '2023',
    mediaType: 'video',
    video: 'https://rodeo.film/media/site/0207051adb-1717407391/sweet.mp4',
    poster: 'https://rodeo.film/media/site/8abc968a13-1670504153/boucan_1_6.jpg',
    isAward: true
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

// Create infinite grid of small project showcases with dynamic viewport-based generation
const gridProjects = computed(() => {
  const grid = []
  
  // Calculate viewport bounds in grid coordinates using proper hexagon math
  const scale = Math.min(clientWidth.value / 1920, 1) * 1.2
  const itemWidth = 280 * scale
  const itemHeight = 240 * scale
  const horizontalSpacing = itemWidth * 0.75
  const verticalSpacing = itemWidth * 0.866 // Perfect hexagon ratio
  
  // Calculate visible range with extra buffer for smooth scrolling
  const bufferMultiplier = 3
  const visibleColumns = Math.ceil(clientWidth.value / horizontalSpacing) * bufferMultiplier
  const visibleRows = Math.ceil(clientHeight.value / verticalSpacing) * bufferMultiplier
  
  // Calculate grid offset based on current scroll position
  const gridOffsetX = Math.floor(-scrollX.value / horizontalSpacing) - Math.floor(visibleColumns / 2)
  const gridOffsetY = Math.floor(-scrollY.value / verticalSpacing) - Math.floor(visibleRows / 2)
  
  // Generate grid items in visible area plus buffer - only show actual projects
  for (let x = gridOffsetX; x < gridOffsetX + visibleColumns; x++) {
    for (let y = gridOffsetY; y < gridOffsetY + visibleRows; y++) {
      // Use modulo to cycle through projects infinitely
      const projectIndex = ((Math.abs(x) + Math.abs(y)) % projects.length)
      const project = projects[projectIndex]
      
      // Only add hexagons that have actual content (image or video)
      if (project && (project.image || project.video || project.poster)) {
        grid.push({
          ...project,
          gridX: x,
          gridY: y,
          id: `${project.id}-${x}-${y}`
        })
      }
    }
  }
  
  return grid
})

// Enhanced keyboard controls using gallery
const handleKeyDown = (event) => {
  gallery.handleKeyDown(event, clientWidth.value, clientHeight.value)
}

onMounted(async () => {
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
    
    // Initialize GSAP gallery functionality
    await gallery.initializeGallery()
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeyDown)
    if (window._resizeHandler) {
      window.removeEventListener('resize', window._resizeHandler)
      delete window._resizeHandler
    }
    
    // Clear all image animation intervals
    imageAnimations.value.forEach(interval => clearInterval(interval))
    imageAnimations.value.clear()
    hoveredProjects.value.clear()
    
    // Cleanup GSAP gallery
    gallery.cleanup()
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
  background: transparent;
  overflow: hidden;
  /* Perfect hexagon shape using CSS clip-path */
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  /* Ensure no margin or border that could create gaps */
  margin: 0;
  border: none;
  /* Use transform3d for better performance with GSAP */
  transform: translate3d(0, 0, 0);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  /* Ensure proper aspect ratio for hexagon */
  aspect-ratio: 1.154;
  /* Enhanced properties for GSAP animations */
  will-change: transform, opacity;
  perspective: 1000px;
}

/* GSAP handles all hover animations - no CSS hover needed */

.hexagon-content {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.hexagon-content video,
.hexagon-content img {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
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

/* Video Modal Transitions */
.video-modal-enter-active,
.video-modal-leave-active {
  transition: all 0.3s ease;
}

.video-modal-enter-from,
.video-modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
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

/* Enhanced hardware acceleration for GSAP */
.showcase-wrapper {
  transform: translateZ(0);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  will-change: transform;
}

/* GSAP animation classes */
.gsap-fade-in {
  opacity: 0;
}

.gsap-scale-up {
  transform: scale(0.8);
}

.gsap-slide-up {
  transform: translateY(50px);
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