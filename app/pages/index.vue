<template>
  <div class="page-wrapper">
    <div class="min-h-screen bg-black text-white overflow-hidden relative">
    <!-- Loading Screen -->
    <LoadingSpinner 
      :is-visible="showLoading" 
      :duration="800"
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
        <button v-if="!projectsOpen && !currentPlayingProject && !awardsOpen && !playlistOpen && !aboutOpen && !galleryOpen" class="hamburger-menu p-2" @click="toggleMenu">
          <div class="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
          <div class="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
          <div class="w-6 h-0.5 bg-white transition-all duration-300"></div>
        </button>
      </div>
    </nav>

    <!-- Full Screen Honeycomb Showcase -->
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
          transform: `translate3d(${scrollX}px, ${scrollY}px, 0) scale(1.1) rotate(3deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
      >
        <!-- Lightweight Viewport-Based Grid (Rodeo.film approach) -->
        <div 
          v-for="project in visibleProjects" 
          :key="`showcase-${project.id}-${project.gridX}-${project.gridY}`"
          class="project-grid-item cursor-pointer"
          :style="getGridPosition(project.gridX, project.gridY)"
          @mouseenter="handleEnhancedHover($event, project)"
          @mouseleave="handleEnhancedLeave($event, project)"
          @mousemove="handleEnhancedHover($event, project)"
          @click="handleProjectClick($event, project)"
        >
          <!-- Optimized Media Loading -->
          <div class="relative w-full h-full overflow-hidden group grid-content">
            <!-- Smart loading for visible projects only -->
            <video
              v-if="project.mediaType === 'video'"
              :poster="project.poster"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              loop
              playsinline
              preload="metadata"
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
              loading="lazy"
              decoding="async"
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
      
      <!-- Simple Title Tooltip -->
      <Teleport to="body">
        <div 
          v-if="hoveredProject"
          class="fixed z-[9999] pointer-events-none"
          :style="{ 
            left: cursorX + 20 + 'px', 
            top: cursorY - 60 + 'px',
            transform: 'translateX(-50%)'
          }"
        >
          <div class="bg-black/90 backdrop-blur-sm px-4 py-3 rounded-none border border-white/20 shadow-2xl" style="background-color: #ff2204;">
            <h3 class="text-white font-light text-sm tracking-wider text-center whitespace-nowrap">{{ hoveredProject.showcase_title }}</h3>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Rodeo Film Style Footer -->
    <footer id="js-footer" class="o-footer">
      <div class="hide-first">
        <div class="copy a-footerText">
          © 2024 Rodeo, all rights reserved.
        </div>
        <div class="legas">
          <a class="a-footerText" href="https://rodeo.film/legals">Legals</a> —
          <a class="a-footerText" href="https://troa.fr" target="_blank">Website by TROA</a>
        </div>
      </div>
    </footer>

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
              <button @click="toggleGallery" class="block w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-bold tracking-wider text-white hover:bg-red-600 hover:border-red-600 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer hover-glow backdrop-blur-sm" style="font-size: 12px;">GALLERY</button>
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

<!-- Gallery Overlay -->
<Transition name="gallery">
  <div v-if="galleryOpen" class="fixed inset-0 z-40 bg-black">
    <!-- Gallery Container -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full p-12">
      <div class="text-center w-full h-full flex flex-col">
        <h2 class="font-bold tracking-wider text-white mb-8 hover:text-red-100 transition-colors duration-300" style="font-size: 16px;">
          GALLERY
        </h2>
        
        <!-- WebGL Style Gallery Container -->
        <div class="flex-1 relative w-full h-full">
          <div class="gallery-webgl-container">
            <div 
              v-for="(image, index) in getAllGalleryImages()" 
              :key="`${image.projectId}-${image.imageIndex || 0}`"
              class="gallery-webgl-item"
              :style="getGalleryItemStyle(index)"
              @mouseenter="handleGalleryItemHover($event, index)"
              @mouseleave="handleGalleryItemLeave($event, index)"
              @click="gallery.expandImage({ 
                mediaType: 'image', 
                images: [image.src], 
                showcase_title: image.title 
              }, $event)"
            >
              <div class="gallery-item-wrapper">
                <img 
                  :src="image.src" 
                  :alt="image.title"
                  class="gallery-item-image"
                />
                <div class="gallery-item-overlay">
                  <div class="gallery-item-title">{{ image.title }}</div>
                  <div class="gallery-item-client">{{ image.client }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Transition>

<!-- ✅ Close Button: only shows when galleryOpen is true -->
<button 
  v-if="galleryOpen"
  @click="closeGallery" 
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

    <!-- Infinite Scroll Indicator -->
    <!-- <div class="fixed bottom-6 left-6 z-40 text-white/50 text-xs font-medium tracking-wide">
      Infinite Grid • Position: {{ Math.round(-scrollX / 100) }}, {{ Math.round(-scrollY / 100) }}
    </div> -->

    <!-- Scroll to Top Button -->
    <Transition name="scroll-button">
      <button 
        v-if="showScrollTop"
        @click="gallery.scrollToTop"
        class="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>
    </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick, watch } from 'vue'
import { useGallery } from '~/composables/gallery'

// Initialize GSAP Gallery functionality
const gallery = useGallery()

// Loading state
const showLoading = ref(true)
const showScrollTop = ref(false)

const menuOpen = ref(false)
const projectsOpen = ref(false)
const awardsOpen = ref(false)
const playlistOpen = ref(false)
const aboutOpen = ref(false)
const galleryOpen = ref(false)
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

// Cursor tracking for tooltip
const cursorX = ref(0)
const cursorY = ref(0)
const hoveredProject = ref(null)

// Video debounce utility to prevent conflicts
const videoDebounceTimers = new Map()

// Loading completion handler - immediate showcase display
const onLoadingComplete = () => {
  showLoading.value = false
  // No animations - immediate display of all content
  nextTick(() => {
    // Ensure all content is immediately visible
    gallery.animatePageEnter() // This now just sets opacity to 1 immediately
  })
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const toggleProjects = () => {
  projectsOpen.value = !projectsOpen.value
  if (projectsOpen.value) {
    awardsOpen.value = false
    playlistOpen.value = false
    aboutOpen.value = false
    galleryOpen.value = false
  }
  menuOpen.value = false // Close main menu when opening projects
}

const toggleAwards = () => {
  awardsOpen.value = !awardsOpen.value
  if (awardsOpen.value) {
    projectsOpen.value = false
    playlistOpen.value = false
    aboutOpen.value = false
    galleryOpen.value = false
  }
  menuOpen.value = false // Close main menu when opening awards
}

const togglePlaylist = () => {
  playlistOpen.value = !playlistOpen.value
  if (playlistOpen.value) {
    projectsOpen.value = false
    awardsOpen.value = false
    aboutOpen.value = false
    galleryOpen.value = false
  }
  menuOpen.value = false // Close main menu when opening playlist
}

const toggleAbout = () => {
  aboutOpen.value = !aboutOpen.value
  if (aboutOpen.value) {
    projectsOpen.value = false
    awardsOpen.value = false
    playlistOpen.value = false
    galleryOpen.value = false
  }
  menuOpen.value = false // Close main menu when opening about
}

const toggleGallery = () => {
  galleryOpen.value = !galleryOpen.value
  menuOpen.value = false // Close main menu when opening gallery
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

const closeGallery = () => {
  galleryOpen.value = false
}

// WebGL-style gallery positioning and hover effects
const getGalleryItemStyle = (index) => {
  const images = getAllGalleryImages()
  const totalImages = images.length
  
  // Calculate 3D positioning similar to individual project galleries
  const baseX = 200 + (index * 60)
  const baseY = 150 + (index * 40)
  const baseZ = index * -30 // Negative Z for depth
  
  // Adjust for viewport size
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Scale positioning based on viewport
  const scaleX = viewportWidth / 1200
  const scaleY = viewportHeight / 800
  
  const adjustedX = baseX * scaleX
  const adjustedY = baseY * scaleY
  
  return {
    position: 'absolute',
    width: '400px',
    height: '300px',
    transform: `translate3d(${adjustedX}px, ${adjustedY}px, ${baseZ}px) rotateY(${index * 3}deg)`,
    zIndex: index + 1,
    transition: 'all 0.4s cubic-bezier(0.43, 0.01, 0.36, 1.27)',
    cursor: 'pointer'
  }
}

const handleGalleryItemHover = (event, index) => {
  const element = event.currentTarget
  const images = getAllGalleryImages()
  
  // Bring to front with 3D lift
  element.style.zIndex = '999'
  gsap.to(element, {
    scale: 1.15,
    z: 100,
    rotationY: 0,
    duration: 0.4,
    ease: "power2.out"
  })
  
  // Add subtle glow effect
  element.style.boxShadow = '0 30px 100px rgba(255, 255, 255, 0.2), 0 25px 80px rgba(0, 0, 0, 0.6)'
}

const handleGalleryItemLeave = (event, index) => {
  const element = event.currentTarget
  const images = getAllGalleryImages()
  
  // Calculate original position
  const baseX = 200 + (index * 60)
  const baseY = 150 + (index * 40)
  const baseZ = index * -30
  
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scaleX = viewportWidth / 1200
  const scaleY = viewportHeight / 800
  
  const adjustedX = baseX * scaleX
  const adjustedY = baseY * scaleY
  
  // Return to original position
  gsap.to(element, {
    scale: 1,
    z: baseZ,
    rotationY: index * 3,
    duration: 0.4,
    ease: "power2.out"
  })
  
  // Reset z-index and shadow
  element.style.zIndex = index + 1
  element.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.6)'
}

// Collect all images from all projects for the gallery
const getAllGalleryImages = () => {
  const allImages = []
  
  projects.forEach(project => {
    if (project.mediaType === 'video') {
      // Add video poster
      allImages.push({
        src: project.poster,
        title: project.showcase_title,
        client: project.client,
        director: project.director,
        category: project.category,
        projectId: project.id
      })
    } else if (project.images && project.images.length > 0) {
      // Add all images from the project
      project.images.forEach((imageSrc, index) => {
        allImages.push({
          src: imageSrc,
          title: `${project.showcase_title} - ${index + 1}`,
          client: project.client,
          director: project.director,
          category: project.category,
          projectId: project.id,
          imageIndex: index
        })
      })
    } else if (project.image) {
      // Add single image
      allImages.push({
        src: project.image,
        title: project.showcase_title,
        client: project.client,
        director: project.director,
        category: project.category,
        projectId: project.id
      })
    }
  })
  
  return allImages
}

const handleProjectHover = async (project) => {
  currentHoveredProject.value = project
  // Wait for video element to be created and then play it
  await nextTick()
  const videoElement = document.querySelector('.projects-bg-video')
  if (videoElement) {
    try {
      videoElement.muted = true
      await videoElement.play()
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Project video play failed:', error.name)
      }
    }
  }
}

const handleProjectLeave = async () => {
  const videoElement = document.querySelector('.projects-bg-video')
  if (videoElement) {
    try {
      if (!videoElement.paused) {
        await videoElement.pause()
      }
      videoElement.currentTime = 0
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Project video pause failed:', error.name)
      }
    }
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
      videoElement.muted = true
      await videoElement.play()
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Award video play failed:', error.name)
      }
    }
  }
}

const handleAwardLeave = async () => {
  const videoElement = document.querySelector('.awards-bg-video')
  if (videoElement) {
    try {
      if (!videoElement.paused) {
        await videoElement.pause()
      }
      videoElement.currentTime = 0
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Award video pause failed:', error.name)
      }
    }
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
  
  // Set hovered project for tooltip
  hoveredProject.value = project
  
  // Update cursor position
  cursorX.value = event.clientX
  cursorY.value = event.clientY
  
  // Apply GSAP hover animation
  gallery.animateItemHover(event.currentTarget, project)
  
  if (project.mediaType === 'video') {
    // Handle video hover - play in background with proper error handling
    const videoElement = videoRefs.get(projectKey)
    if (videoElement) {
      // Reset video state
      videoElement.muted = true
      
      // Debounce video operations to prevent conflicts
      const videoKey = `play-${projectKey}`
      if (videoDebounceTimers.has(videoKey)) {
        clearTimeout(videoDebounceTimers.get(videoKey))
      }
      
      videoDebounceTimers.set(videoKey, setTimeout(async () => {
        try {
          videoElement.currentTime = 0
          await videoElement.play()
        } catch (error) {
          // Silently handle play interruption errors
          if (error.name !== 'AbortError') {
            console.log('Grid video play failed:', error.name)
          }
        }
        videoDebounceTimers.delete(videoKey)
      }, 50))
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
  
  // Clear hovered project for tooltip immediately
  hoveredProject.value = null
  
  // Apply GSAP leave animation
  gallery.animateItemLeave(event.currentTarget)
  
  if (project.mediaType === 'video') {
    // Handle video leave - pause and reset with proper async handling
    const videoElement = videoRefs.get(projectKey)
    if (videoElement) {
      // Debounce video operations to prevent conflicts
      const videoKey = `pause-${projectKey}`
      if (videoDebounceTimers.has(videoKey)) {
        clearTimeout(videoDebounceTimers.get(videoKey))
      }
      
      videoDebounceTimers.set(videoKey, setTimeout(async () => {
        try {
          if (!videoElement.paused) {
            await videoElement.pause()
          }
          videoElement.currentTime = 0
        } catch (error) {
          // Silently handle pause errors
          if (error.name !== 'AbortError') {
            console.log('Grid video pause failed:', error.name)
          }
        }
        videoDebounceTimers.delete(videoKey)
      }, 50))
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
  } else {
    // For images, use the Rodeo Film-style gallery
    if (actualEvent) {
      gallery.expandImage(actualProject, actualEvent)
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

// Function to check if video should be loaded (within viewport + buffer)
const isVideoInViewport = (project) => {
  const scale = Math.min(clientWidth.value / 1920, clientHeight.value / 1080, 1) * 1.2
  const itemWidth = 350 * scale
  const spacing = itemWidth * 0.9
  
  // Calculate project position
  const projectX = project.gridX * spacing + scrollX.value
  const projectY = project.gridY * spacing + scrollY.value
  
  // Define viewport bounds with large buffer to ensure no empty areas
  const buffer = itemWidth * 4  // Large buffer to load videos well before they're needed
  const viewportLeft = -buffer
  const viewportRight = clientWidth.value + buffer
  const viewportTop = -buffer
  const viewportBottom = clientHeight.value + buffer
  
  // Check if project is within extended viewport
  return (
    projectX + itemWidth > viewportLeft &&
    projectX < viewportRight &&
    projectY + itemWidth > viewportTop &&
    projectY < viewportBottom
  )
}

// Position each grid item in square grid pattern across full screen
const getGridPosition = (gridX, gridY) => {
  // Large square cells for clean, modern look
  const baseWidth = 350  // Large cells for better visual impact
  const baseHeight = baseWidth // Square aspect ratio
  
  // Responsive scaling based on viewport
  const scale = Math.min(clientWidth.value / 1920, clientHeight.value / 1080, 1) * 1.2
  const itemWidth = baseWidth * scale
  const itemHeight = baseHeight * scale
  
  // Square grid tessellation calculations
  // For squares, horizontal and vertical spacing are equal to the width
  const spacing = itemWidth * 0.9 // Reasonable spacing for simple grid
  
  return {
    position: 'absolute',
    left: `${gridX * spacing}px`,
    top: `${gridY * spacing}px`,
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
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&q=90'
    ]
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
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920&h=1080&fit=crop&q=90'
    ]
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
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90'
    ]
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
  // More image projects for infinite coverage
  {
    id: 9,
    showcase_title: 'URBAN',
    client: 'Nike Campaign',
    category: 'Photography',
    director: 'Alex Chen',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1920&h=1080&fit=crop&q=90'
    ]
  },
  {
    id: 10,
    showcase_title: 'MOTION',
    client: 'Adidas Sport',
    category: 'Visual',
    director: 'Sofia Martinez',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=1920&h=1080&fit=crop&q=90'
    ]
  },
  {
    id: 11,
    showcase_title: 'TECH',
    client: 'Apple Innovation',
    category: 'Product',
    director: 'David Park',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&h=1080&fit=crop&q=90'
    ]
  },
  {
    id: 12,
    showcase_title: 'FUTURE',
    client: 'Tesla Motors',
    category: 'Automotive',
    director: 'Emma Wilson',
    mediaType: 'image',
    image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=1920&h=1080&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1920&h=1080&fit=crop&q=90',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&h=1080&fit=crop&q=90'
    ]
  },
  // Award videos in the grid - keep limited number
  {
    id: 13,
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
    id: 14,
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

// Lightweight infinite grid - only render what's visible
const visibleProjects = ref([])
const projectDataCache = new Map()

// Generate infinite repeating projects grid
const generateViewportProjects = () => {
  const scale = Math.min(clientWidth.value / 1920, clientHeight.value / 1080, 1) * 1.2
  const itemWidth = 350 * scale
  const spacing = itemWidth * 0.9
  
  // Calculate viewport bounds with large buffer for instant loading
  const buffer = spacing * 8 // Much larger buffer to preload content and prevent delays
  const viewportLeft = -scrollX.value - buffer
  const viewportRight = -scrollX.value + clientWidth.value + buffer
  const viewportTop = -scrollY.value - buffer
  const viewportBottom = -scrollY.value + clientHeight.value + buffer
  
  // Calculate which grid positions are needed (infinite in all directions)
  const startX = Math.floor(viewportLeft / spacing)
  const endX = Math.ceil(viewportRight / spacing)
  const startY = Math.floor(viewportTop / spacing)
  const endY = Math.ceil(viewportBottom / spacing)
  
  const newVisibleProjects = []
  
  // Generate infinite repeating grid - no bounds, endless content
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      const projectKey = `${x}-${y}`
      
      // Check cache first
      if (projectDataCache.has(projectKey)) {
        newVisibleProjects.push(projectDataCache.get(projectKey))
      } else {
        // Create infinite repeating pattern using modulo
        // This ensures the pattern repeats seamlessly in all directions
        const projectIndex = Math.abs((x * 7 + y * 13 + (x * y) * 3) % projects.length)
        const project = projects[projectIndex]
        
        const newProject = {
          ...project,
          gridX: x,
          gridY: y,
          id: `${project.id}-${x}-${y}`,
          shouldLoad: true,
          // Add infinite scroll metadata
          isInfinite: true,
          patternId: `${Math.abs(x % 10)}-${Math.abs(y % 10)}` // 10x10 repeating pattern
        }
        
        // Cache for future use
        projectDataCache.set(projectKey, newProject)
        newVisibleProjects.push(newProject)
      }
    }
  }
  
  console.log(`Rendering ${newVisibleProjects.length} infinite projects at scroll position (${Math.round(-scrollX.value)}, ${Math.round(-scrollY.value)})`)
  visibleProjects.value = newVisibleProjects
}

// Immediate viewport-based generation for instant loading
let updateTimeout = null
const immediateProjectUpdate = () => {
  // For fast scrolling, update immediately without any delay
  if (Math.abs(scrollVelocity.x) > 1000 || Math.abs(scrollVelocity.y) > 1000) {
    generateViewportProjects() // Instant update for fast scrolling
    return
  }
  
  // For slower scrolling, use minimal delay
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  updateTimeout = setTimeout(() => {
    generateViewportProjects()
  }, 8) // 8ms = 120fps updates
}

// Predictive loading based on scroll direction and velocity
let lastScrollTime = 0
let scrollVelocity = { x: 0, y: 0 }
let lastScrollPos = { x: 0, y: 0 }

const updateScrollVelocity = () => {
  const currentTime = Date.now()
  const deltaTime = currentTime - lastScrollTime
  
  if (deltaTime > 0) {
    scrollVelocity.x = (scrollX.value - lastScrollPos.x) / deltaTime * 1000 // pixels per second
    scrollVelocity.y = (scrollY.value - lastScrollPos.y) / deltaTime * 1000
  }
  
  lastScrollTime = currentTime
  lastScrollPos.x = scrollX.value
  lastScrollPos.y = scrollY.value
}

// Intelligent cache cleanup for infinite scrolling
const cleanupCache = () => {
  if (projectDataCache.size > 1200) { // Larger cache for better performance
    // Calculate current viewport center for smart cleanup
    const currentCenterX = Math.round(-scrollX.value / (350 * Math.min(clientWidth.value / 1920, clientHeight.value / 1080, 1) * 1.2 * 0.9))
    const currentCenterY = Math.round(-scrollY.value / (350 * Math.min(clientWidth.value / 1920, clientHeight.value / 1080, 1) * 1.2 * 0.9))
    
    // Keep projects that are close to current position
    const keepDistance = 20 // Keep projects within 20 grid units
    const entriesToKeep = []
    
    projectDataCache.forEach((project, key) => {
      const distance = Math.abs(project.gridX - currentCenterX) + Math.abs(project.gridY - currentCenterY)
      if (distance <= keepDistance) {
        entriesToKeep.push([key, project])
      }
    })
    
    // Clear cache and restore nearby projects
    projectDataCache.clear()
    entriesToKeep.forEach(([key, project]) => {
      projectDataCache.set(key, project)
    })
    
    console.log(`Cache cleaned: kept ${entriesToKeep.length} nearby projects`)
  }
}

// Enhanced keyboard controls using gallery
const handleKeyDown = (event) => {
  gallery.handleKeyDown(event, clientWidth.value, clientHeight.value)
}

onMounted(async () => {
  if (process.client) {
    // Update client dimensions to actual viewport size
    clientWidth.value = window.innerWidth
    clientHeight.value = window.innerHeight
    
    // Generate initial viewport projects
    generateViewportProjects()
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown)
    
    // Handle window resize
    const handleResize = () => {
      clientWidth.value = window.innerWidth
      clientHeight.value = window.innerHeight
      // Regenerate viewport projects for new size
      generateViewportProjects()
    }
    window.addEventListener('resize', handleResize)
    
    // Add scroll listener for scroll-to-top button
    const handleScroll = () => {
      showScrollTop.value = window.scrollY > 500
    }
    window.addEventListener('scroll', handleScroll)
    
    // Add global mouse move handler for cursor tracking
    const handleMouseMove = (event) => {
      cursorX.value = event.clientX
      cursorY.value = event.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // Store handlers for cleanup
    window._resizeHandler = handleResize
    window._scrollHandler = handleScroll
    window._mouseMoveHandler = handleMouseMove
    
    // Set up scroll callback for instant updates during interaction
    gallery.setScrollStartCallback(() => {
      // Immediate update when user starts scrolling
      generateViewportProjects()
    })
    
    // Set up immediate scroll watchers for instant loading
    watch([scrollX, scrollY], () => {
      updateScrollVelocity()
      immediateProjectUpdate()
      
      // Less frequent cache cleanup to avoid performance hits
      if (Math.random() < 0.1) { // Only cleanup 10% of the time
        cleanupCache()
      }
    }, { flush: 'post' })
    
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
    if (window._scrollHandler) {
      window.removeEventListener('scroll', window._scrollHandler)
      delete window._scrollHandler
    }
    if (window._mouseMoveHandler) {
      window.removeEventListener('mousemove', window._mouseMoveHandler)
      delete window._mouseMoveHandler
    }
    
    // Clear all image animation intervals
    imageAnimations.value.forEach(interval => clearInterval(interval))
    imageAnimations.value.clear()
    hoveredProjects.value.clear()
    
    // Clear video debounce timers
    videoDebounceTimers.forEach(timer => clearTimeout(timer))
    videoDebounceTimers.clear()
    
    // Clear projects and cache
    visibleProjects.value = []
    projectDataCache.clear()
    if (updateTimeout) {
      clearTimeout(updateTimeout)
      updateTimeout = null
    }
    
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
  /* Enhanced gradient background for premium feel */
  background: 
    radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%),
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 199, 255, 0.02) 0%, transparent 50%);
  /* Initial state for professional entrance animation */
  opacity: 1;
  /* Optimize for animations and mobile */
  will-change: transform, opacity, filter;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}



.showcase-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: transform 0.1s linear;
  /* Ensure proper coverage to prevent black showing through */
  background: rgba(0, 0, 0, 0.98);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.project-grid-item {
  display: block;
  background: transparent;
  overflow: hidden;
  /* Square shape for clean, modern look */
  clip-path: none;
  /* Always visible squares */
  opacity: 1;
  /* Optimize for animations and mobile performance */
  will-change: transform, opacity, filter;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* Enhanced styling for premium feel */
  position: relative;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* Ensure no margin or border that could create gaps */
  margin: 0;
  border: none;
  /* Use transform3d for better performance with GSAP */
  transform: translate3d(0, 0, 0);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  /* Perfect square aspect ratio for large cells */
  aspect-ratio: 1;
  /* Lightweight performance optimizations */
  will-change: transform;
  contain: layout style paint;
  /* Enhanced border to prevent black showing through */
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.02),
    inset 0 0 20px rgba(255, 255, 255, 0.01);
  /* Enhanced transitions for premium UX */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer !important;
  /* Ensure full coverage to prevent black background showing */
  background: rgba(255, 255, 255, 0.01);
}

  /* Minimal hover effects to prevent gaps */
  .project-grid-item:hover {
    z-index: 10 !important;
  }

/* GSAP handles all hover animations - no CSS hover needed */

.grid-content {
  position: relative;
  width: 100%;
  height: 100%;
  clip-path: none;
  overflow: hidden;
  /* Ensure full coverage to prevent black showing through */
  background: rgba(0, 0, 0, 0.1);
}

/* Add subtle gradient overlay for depth */
.grid-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.1) 0%,
    transparent 30%,
    transparent 70%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-content video,
.grid-content img {
  clip-path: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects for content */
.project-grid-item:hover .grid-content::after {
  opacity: 1;
}

.project-grid-item:hover .grid-content video,
.project-grid-item:hover .grid-content img {
  transform: scale(1.02);
}

/* Hover title animations */
.project-grid-item:hover .absolute.inset-0.flex {
  transform: scale(1);
}

.project-grid-item .absolute.inset-0.flex {
  transform: scale(0.95);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Mobile responsive adjustments for large hexagons and performance */
@media (max-width: 768px) {
  .showcase-container {
    /* Enhanced mobile performance */
    -webkit-overflow-scrolling: touch;
    touch-action: none;
  }
}

/* Rodeo Film Style Footer */
.o-footer {
  position: fixed;
  right: 8rem;
  bottom: 6rem;
  transform: rotate(-90deg) translate(100%);
  transform-origin: bottom right;
  z-index: 100;
  padding: 20px 40px;
  background: transparent;
  pointer-events: none;
}

.o-footer .hide-first {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  pointer-events: auto;
}

.o-footer .copy {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.o-footer .legas {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.o-footer .a-footerText {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.o-footer .a-footerText:hover {
  color: rgba(255, 255, 255, 1);
}

/* Mobile responsive footer */
@media (max-width: 768px) {
  .o-footer {
    padding: 15px 20px;
  }
  
  .o-footer .hide-first {
    gap: 6px;
    text-align: center;
  }
  
  .o-footer .copy,
  .o-footer .legas,
  .o-footer .a-footerText {
    font-size: 11px;
  }
}

/* Mobile responsive adjustments for large hexagons and performance */
@media (max-width: 768px) {
  .showcase-container {
    /* Enhanced mobile performance */
    -webkit-overflow-scrolling: touch;
    touch-action: none;
  }
  
  .project-grid-item {
    border-width: 1.5px;
    /* Mobile performance optimizations */
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  
  .project-grid-item h3 {
    font-size: 0.875rem;
  }
  
  .project-grid-item .text-sm {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .project-grid-item {
    border-width: 1px;
  }
  
  .project-grid-item h3 {
    font-size: 0.75rem;
  }
  
  .project-grid-item .text-sm {
    font-size: 0.625rem;
  }
}

/* Rodeo Film-style Gallery Overlay */
.rodeo-gallery-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: none;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.rodeo-gallery-container {
  position: relative;
  width: 800px;
  height: 600px;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.rodeo-image-wrapper {
  position: absolute;
  width: 350px;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  transition: all 0.4s cubic-bezier(0.43, 0.01, 0.36, 1.27);
  will-change: transform, z-index;
  cursor: pointer;
  transform-style: preserve-3d;
}

.rodeo-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.rodeo-image-wrapper:hover {
  transform: scale(1.15) translateZ(100px) rotateY(0deg) !important;
  box-shadow: 0 30px 100px rgba(255, 255, 255, 0.2), 0 25px 80px rgba(0, 0, 0, 0.6);
  z-index: 999 !important;
}

.rodeo-image-wrapper:hover img {
  transform: scale(1.02);
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

/* Gallery Transitions */
.gallery-enter-active,
.gallery-leave-active {
  transition: all 0.4s ease;
}

.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* WebGL Style Gallery */
.gallery-webgl-container {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 1000px;
  transform-style: preserve-3d;
  overflow: hidden;
}

.gallery-webgl-item {
  position: absolute;
  width: 400px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  transition: all 0.4s cubic-bezier(0.43, 0.01, 0.36, 1.27);
  will-change: transform, z-index;
  cursor: pointer;
  transform-style: preserve-3d;
}

.gallery-item-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
}

.gallery-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.gallery-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-webgl-item:hover .gallery-item-overlay {
  opacity: 1;
}

.gallery-item-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.gallery-item-client {
  font-size: 12px;
  opacity: 0.8;
}

.gallery-webgl-item:hover {
  transform: scale(1.15) translateZ(100px) rotateY(0deg) !important;
  box-shadow: 0 30px 100px rgba(255, 255, 255, 0.2), 0 25px 80px rgba(0, 0, 0, 0.6);
  z-index: 999 !important;
}

.gallery-webgl-item:hover .gallery-item-image {
  transform: scale(1.02);
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

/* Scroll Button Transitions */
.scroll-button-enter-active,
.scroll-button-leave-active {
  transition: all 0.3s ease;
}

.scroll-button-enter-from,
.scroll-button-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
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

/* GSAP animation classes - disabled for immediate display */
.gsap-fade-in {
  opacity: 1; /* Always visible */
}

.gsap-scale-up {
  transform: scale(1); /* No scaling */
}

.gsap-slide-up {
  transform: translateY(0); /* No sliding */
}

/* Hide scrollbars */
::-webkit-scrollbar {
  display: none;
}

/* Lenis smooth scrolling styles */
html.lenis {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}

/* Page wrapper for proper Vue transition support */
.page-wrapper {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  /* Ensure full coverage to prevent black showing through */
  background: #000000;
  overflow: hidden;
}

/* Typography styles */
h1 {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-weight: 900;
  line-height: 0.8;
}

/* Lightweight Grid Optimizations */
.project-grid-item img,
.project-grid-item video {
  /* Optimize media loading */
  image-rendering: optimizeSpeed;
  transform: translateZ(0);
}

/* Reduce motion for better performance */
@media (prefers-reduced-motion: reduce) {
  .project-grid-item {
    transition: none;
  }
}
</style> 