import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export const useGallery = () => {
  // Register GSAP plugins
  if (process.client) {
    gsap.registerPlugin(ScrollTrigger)
  }

  // Reactive state
  const scrollX = ref(0)
  const scrollY = ref(0)
  const velocity = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const isInertiaActive = ref(false)
  const smoothScrollContainer = ref(null)
  const lenisInstance = ref(null)
  
  // Optimized smooth scrolling configuration for performance
  const config = {
    smoothness: 0.15,    // Faster, more responsive interpolation
    trackpadMultiplier: 1.2, // Reduced sensitivity for smoother control
    touchMultiplier: 1.5, // Reduced touch sensitivity for better performance
    maxVelocity: 80,    // Lower speed limit to reduce jerky movement
    directControl: true, // Enable direct speed control
    boundaries: {
      minX: -20000,
      maxX: 20000,
      minY: -20000,
      maxY: 20000
    },
    mobile: {
      smoothness: 0.18,    // Faster for mobile
      touchMultiplier: 1.8, // Reduced touch sensitivity
    },
    lenis: {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.2,
      smoothTouch: true,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
      syncTouch: true,
      touchInertiaMultiplier: 35,
      wheelMultiplier: 1.2,
      normalizeWheel: true,
    }
  }

  // Internal state
  let targetX = 0
  let targetY = 0
  let lastMouseX = 0
  let lastMouseY = 0
  let lastTouchX = 0
  let lastTouchY = 0
  let animationFrame = null
  let inertiaTimeout = null
  let gsapTween = null

  // Ultra-smooth scrolling animation loop
  const updateSmoothScroll = () => {
    // Detect if we're on mobile for config selection
    const isMobile = window.innerWidth < 768
    const currentConfig = isMobile ? config.mobile : config
    
    // Ultra-smooth interpolation
    const deltaX = (targetX - scrollX.value) * currentConfig.smoothness
    const deltaY = (targetY - scrollY.value) * currentConfig.smoothness

    scrollX.value += deltaX
    scrollY.value += deltaY

    // No boundaries - allow infinite scrolling in all directions
    // Remove all boundary restrictions for truly endless content

    // Continue animation only if significant movement
    if (Math.abs(deltaX) > 0.001 || Math.abs(deltaY) > 0.001) {
      animationFrame = requestAnimationFrame(updateSmoothScroll)
    }
  }

  // Initialize Lenis smooth scrolling
  const initializeLenis = () => {
    if (!process.client) return

    try {
      lenisInstance.value = new Lenis({
        ...config.lenis,
        wrapper: document.body,
        content: document.documentElement,
      })

      // Connect Lenis with GSAP ScrollTrigger
      if (lenisInstance.value) {
        lenisInstance.value.on('scroll', ScrollTrigger.update)
      }
      
      // Add Lenis to GSAP ticker for perfect sync
      gsap.ticker.add((time) => {
        if (lenisInstance.value) {
          lenisInstance.value.raf(time * 1000)
        }
      })
      
      // Disable lag smoothing for better performance
      gsap.ticker.lagSmoothing(0)

      return lenisInstance.value
    } catch (error) {
      console.warn('Failed to initialize Lenis:', error)
      lenisInstance.value = null
      return null
    }
  }

  // Start smooth scrolling animation
  const startSmoothScroll = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
    animationFrame = requestAnimationFrame(updateSmoothScroll)
  }



  // Trackpad velocity tracking for smooth scrolling
  let trackpadVelocity = { x: 0, y: 0 }
  
  // No mouse movement scrolling - only trackpad/touch allowed
  const handleMouseMovement = (event) => {
    // Disabled - no auto-scroll on mouse movement
    // Only trackpad two-finger scrolling is allowed
    return
  }

  // Ultra-smooth trackpad scrolling
  let currentTrackpadSpeed = { x: 0, y: 0 }
  let lastTrackpadTime = 0
  let onScrollStartCallback = null
  
  const handleWheel = (event) => {
    event.preventDefault()
    
    // Trigger scroll start callback immediately on any wheel event
    if (onScrollStartCallback) {
      onScrollStartCallback()
    }
    
    // Simplified wheel handling for better performance
    const isTrackpad = Math.abs(event.deltaY) < 50 && Math.abs(event.deltaX) < 50
    const isMobile = window.innerWidth < 768
    const sensitivity = isTrackpad ? config.trackpadMultiplier : config.trackpadMultiplier * 0.6
    const adjustedSensitivity = sensitivity * (isMobile ? 1.0 : 1.0)
    
    // Direct movement without complex calculations
    const deltaX = event.deltaX * adjustedSensitivity
    const deltaY = event.deltaY * adjustedSensitivity

    // Apply movement with velocity limiting
    const maxDelta = config.maxVelocity
    targetX -= Math.max(-maxDelta, Math.min(maxDelta, deltaX))
    targetY -= Math.max(-maxDelta, Math.min(maxDelta, deltaY))

    startSmoothScroll()
    
    // Minimal inertia
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      applyTrackpadInertia()
    }, 100)
  }

  // Minimal smooth inertia for natural feel
  const applyTrackpadInertia = () => {
    const velocityMagnitude = Math.sqrt(currentTrackpadSpeed.x * currentTrackpadSpeed.x + currentTrackpadSpeed.y * currentTrackpadSpeed.y)
    
    if (velocityMagnitude > 0.2) {
      isInertiaActive.value = true
      
      gsapTween = gsap.to(currentTrackpadSpeed, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          const sensitivity = config.trackpadMultiplier * 100
          targetX += currentTrackpadSpeed.x * sensitivity * 0.2
          targetY += currentTrackpadSpeed.y * sensitivity * 0.2
        },
        onComplete: () => {
          isInertiaActive.value = false
          gsapTween = null
        }
      })
    }
  }
  
  // Drag-specific inertia (for backwards compatibility)
  const applyMinimalInertia = () => {
    if (Math.abs(velocity.value.x) > 2 || Math.abs(velocity.value.y) > 2) {
      isInertiaActive.value = true
      
      gsapTween = gsap.to(velocity.value, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          targetX += velocity.value.x * 2
          targetY += velocity.value.y * 2
        },
        onComplete: () => {
          isInertiaActive.value = false
          gsapTween = null
        }
      })
    }
  }

  // Mouse drag controls with enhanced momentum
  const handleMouseDown = (event) => {
    if (event.button === 0) {
      // Trigger scroll start callback on first interaction
      if (onScrollStartCallback) {
        onScrollStartCallback()
      }
      
      isDragging.value = true
      lastMouseX = event.clientX
      lastMouseY = event.clientY
      
      // Clear any existing inertia
      if (gsapTween) {
        gsapTween.kill()
        isInertiaActive.value = false
      }
      
      event.preventDefault()
    }
  }

  const handleMouseMove = (event) => {
    // Only handle dragging - no auto mouse movement scrolling
    if (isDragging.value) {
      const deltaX = event.clientX - lastMouseX
      const deltaY = event.clientY - lastMouseY
      
      // Smooth drag control with speed-based multiplier
      const dragSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const speedMultiplier = Math.min(dragSpeed / 15, 1.5) // Cap at 1.5x
      const dragMultiplier = config.trackpadMultiplier * 3 * (1 + speedMultiplier * 0.2)
      
      targetX += deltaX * dragMultiplier
      targetY += deltaY * dragMultiplier
      
      // Update velocity for smooth compatibility
      velocity.value.x = deltaX * 0.8
      velocity.value.y = deltaY * 0.8
      
      lastMouseX = event.clientX
      lastMouseY = event.clientY
      
      startSmoothScroll()
    }
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false
      // No inertia for direct control - stop immediately
      if (gsapTween) {
        gsapTween.kill()
        isInertiaActive.value = false
      }
    }
  }

  // Touch controls with enhanced momentum
  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      // Trigger scroll start callback on first touch interaction
      if (onScrollStartCallback) {
        onScrollStartCallback()
      }
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      
      // Clear any existing inertia
      if (gsapTween) {
        gsapTween.kill()
        isInertiaActive.value = false
      }
    }
  }

  // Ultra-smooth mobile touch controls
  let currentTouchSpeed = { x: 0, y: 0 }
  let lastTouchTime = 0
  
  const handleTouchMove = (event) => {
    event.preventDefault()
    if (event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - lastTouchX
      const deltaY = event.touches[0].clientY - lastTouchY
      
      // Simplified touch movement for better performance
      const touchMultiplier = config.touchMultiplier
      const maxDelta = config.maxVelocity
      
      targetX += Math.max(-maxDelta, Math.min(maxDelta, deltaX * touchMultiplier))
      targetY += Math.max(-maxDelta, Math.min(maxDelta, deltaY * touchMultiplier))
      
      startSmoothScroll()
      
      // Update position
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
    }
  }

  const handleTouchEnd = () => {
    // Apply minimal smooth inertia for touch
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      applyTouchInertia()
    }, 50)
  }
  
  // Minimal smooth inertia for touch
  const applyTouchInertia = () => {
    const velocityMagnitude = Math.sqrt(currentTouchSpeed.x * currentTouchSpeed.x + currentTouchSpeed.y * currentTouchSpeed.y)
    
    if (velocityMagnitude > 0.3) {
      isInertiaActive.value = true
      
      gsapTween = gsap.to(currentTouchSpeed, {
        x: 0,
        y: 0,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
          const sensitivity = config.touchMultiplier * 80
          targetX += currentTouchSpeed.x * sensitivity * 0.15
          targetY += currentTouchSpeed.y * sensitivity * 0.15
        },
        onComplete: () => {
          isInertiaActive.value = false
          gsapTween = null
        }
      })
    }
  }

  // Rodeo Film-style WebGL gallery functionality for images with 3D overlap
  const expandImage = (project, event) => {
    if (!project || !event) return
    
    const clickedElement = event.currentTarget
    const rect = clickedElement.getBoundingClientRect()
    
    // Get all images from the project
    const images = project.mediaType === 'video' 
      ? [project.poster] 
      : (project.images && project.images.length > 0) 
        ? project.images 
        : [project.image || project.poster]
    
    // Create Rodeo Film-style gallery overlay
    const overlay = document.createElement('div')
    overlay.className = 'rodeo-gallery-overlay'
    overlay.style.cssText = `
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
    `
    
    // Create gallery container with 3D perspective
    const container = document.createElement('div')
    container.className = 'rodeo-gallery-container'
    container.style.cssText = `
      position: relative;
      width: 800px;
      height: 600px;
      perspective: 1000px;
      transform-style: preserve-3d;
    `
    
    // Create and position images with 3D overlap
    images.forEach((imageSrc, index) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'rodeo-image-wrapper'
      wrapper.style.cssText = `
        position: absolute;
        width: 350px;
        height: 250px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
        transition: all 0.4s cubic-bezier(0.43, 0.01, 0.36, 1.27);
        will-change: transform, z-index;
        cursor: pointer;
        z-index: ${index + 1};
        transform-style: preserve-3d;
      `
      
      // Position images with 3D overlap - create a stack effect
      const baseX = 200 + (index * 40)
      const baseY = 150 + (index * 25)
      const baseZ = index * -20 // Negative Z for depth
      
      wrapper.style.transform = `translate3d(${baseX}px, ${baseY}px, ${baseZ}px) rotateY(${index * 5}deg)`
      
      const img = document.createElement('img')
      img.src = imageSrc
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
        transition: transform 0.3s ease;
      `
      
      wrapper.appendChild(img)
      container.appendChild(wrapper)
      
      // Enhanced 3D hover effects
      wrapper.addEventListener('mouseenter', () => {
        // Bring to front with 3D lift
        wrapper.style.zIndex = '999'
        gsap.to(wrapper, {
          scale: 1.15,
          z: 100,
          rotationY: 0,
          duration: 0.4,
          ease: "power2.out"
        })
        
        // Add subtle glow effect
        wrapper.style.boxShadow = '0 30px 100px rgba(255, 255, 255, 0.2), 0 25px 80px rgba(0, 0, 0, 0.6)'
      })
      
      wrapper.addEventListener('mouseleave', () => {
        // Return to original position
        gsap.to(wrapper, {
          scale: 1,
          z: baseZ,
          rotationY: index * 5,
          duration: 0.4,
          ease: "power2.out"
        })
        
        // Reset z-index and shadow
        wrapper.style.zIndex = index + 1
        wrapper.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.6)'
      })
      
      // Add click to bring to center
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        
        // Animate to center
        gsap.to(wrapper, {
          x: 225, // Center X
          y: 175, // Center Y
          z: 200,
          scale: 1.3,
          rotationY: 0,
          duration: 0.6,
          ease: "back.out(1.7)"
        })
        
        // Return others to stack
        container.querySelectorAll('.rodeo-image-wrapper').forEach((otherWrapper, otherIndex) => {
          if (otherWrapper !== wrapper) {
            const otherBaseX = 200 + (otherIndex * 40)
            const otherBaseY = 150 + (otherIndex * 25)
            const otherBaseZ = otherIndex * -20
            
            gsap.to(otherWrapper, {
              x: otherBaseX,
              y: otherBaseY,
              z: otherBaseZ,
              scale: 1,
              rotationY: otherIndex * 5,
              duration: 0.6,
              ease: "power2.out"
            })
          }
        })
      })
    })
    
    overlay.appendChild(container)
    document.body.appendChild(overlay)
    
    // Animate entrance with 3D effect
    gsap.set(container, { opacity: 0, scale: 0.8, rotationY: -30 })
    gsap.to(container, {
      opacity: 1,
      scale: 1,
      rotationY: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        gsap.to(overlay, {
          opacity: 0,
          scale: 0.9,
          rotationY: 30,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            document.body.removeChild(overlay)
          }
        })
      }
    })
    
    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        gsap.to(overlay, {
          opacity: 0,
          scale: 0.9,
          rotationY: 30,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            document.body.removeChild(overlay)
            document.removeEventListener('keydown', handleEscape)
          }
        })
      }
    }
    document.addEventListener('keydown', handleEscape)
  }
  
  // Helper function to get current image source
  const getCurrentImageSrc = (project) => {
    if (project.mediaType === 'video') {
      return project.poster
    }
    if (project.images && project.images.length > 0) {
      return project.images[0] // Return first image for now
    }
    return project.image || project.poster
  }
  
  // Enhanced keyboard navigation for large hexagons
  const handleKeyDown = (event, clientWidth, clientHeight) => {
    const scale = Math.min(clientWidth / 1920, clientHeight / 1080, 1) * 1.2
    const baseWidth = 350  // Large hexagon size
    const itemWidth = baseWidth * scale
    
    const horizontalSpeed = itemWidth * 0.75
    const verticalSpeed = itemWidth * 0.866
    
    let newTargetX = targetX
    let newTargetY = targetY
    
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        newTargetY += verticalSpeed
        break
      case 'ArrowDown':
      case 'KeyS':
        newTargetY -= verticalSpeed
        break
      case 'ArrowLeft':
      case 'KeyA':
        newTargetX += horizontalSpeed
        break
      case 'ArrowRight':
      case 'KeyD':
        newTargetX -= horizontalSpeed
        break
      case 'Space':
        newTargetX = 0
        newTargetY = 0
        break
      default:
        return
    }
    
    // Animate to new position with GSAP
    gsap.to({ x: targetX, y: targetY }, {
      x: newTargetX,
      y: newTargetY,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: function() {
        targetX = this.targets()[0].x
        targetY = this.targets()[0].y
        startSmoothScroll()
      }
    })
    
    event.preventDefault()
  }

  // Animate grid item on hover
  const animateItemHover = (element, project) => {
    if (!element) return
    
    const tl = gsap.timeline()
    
    // Scale and shadow animation
    tl.to(element, {
      scale: 1.05,
      rotationY: 5,
      z: 50,
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
      duration: 0.3,
      ease: "power2.out"
    })
    
    // Animate content inside
    const content = element.querySelector('.grid-content')
    if (content) {
      tl.to(content, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.3")
    }
    
    return tl
  }

  // Animate grid item on leave
  const animateItemLeave = (element) => {
    if (!element) return
    
    const tl = gsap.timeline()
    
    tl.to(element, {
      scale: 1,
      rotationY: 0,
      z: 0,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      duration: 0.3,
      ease: "power2.out"
    })
    
    const content = element.querySelector('.grid-content')
    if (content) {
      tl.to(content, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.3")
    }
    
    return tl
  }

  // Lenis scroll methods
  const scrollTo = (target, options = {}) => {
    if (lenisInstance.value) {
      lenisInstance.value.scrollTo(target, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options
      })
    }
  }

  const scrollToTop = () => {
    scrollTo(0, { duration: 1.5 })
  }

  const scrollToElement = (element, offset = 0) => {
    if (element) {
      scrollTo(element, { offset, duration: 1.2 })
    }
  }

  // No scroll-triggered animations - immediate display
  const createScrollTriggerAnimations = () => {
    if (!process.client) return
    
    // Configure ScrollTrigger to work with Lenis (keep for other functionality)
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenisInstance.value?.scrollTo(value, { immediate: true })
        }
        return lenisInstance.value?.scroll ?? 0
      },
      scrollLeft(value) {
        if (arguments.length) {
          // Handle horizontal scrolling if needed
        }
        return 0
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    })
    
    // Ensure all items are immediately visible without animations
    gsap.set('.project-grid-item', {
      opacity: 1,
      scale: 1,
      rotationY: 0,
      y: 0
    })
    
    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh()
  }

  // Parallax effect for background elements
  const createParallaxEffect = () => {
    if (!process.client) return
    
    gsap.to('.showcase-wrapper', {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: '.showcase-container',
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    })
  }

  // Rodeo Film-style professional entrance animation
  const animatePageEnter = () => {
    // Set initial state - professional hide
    gsap.set('.showcase-container', { 
      opacity: 0,
      scale: 0.98,
      filter: 'blur(10px)'
    })
    gsap.set('.project-grid-item', { 
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'none'
    })
    
    // Create professional timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Start mouse movement tracking after animation
        startSmoothScroll()
        
        // Clear any filters for performance
        gsap.set('.showcase-container', { filter: 'none' })
        gsap.set('.project-grid-item', { filter: 'none' })
      }
    })
    
    // Professional container entrance
    tl.to('.showcase-container', {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.5,
      ease: "power3.out"
    })
    
    // Grid items are already visible - just ensure smooth appearance
    .to('.project-grid-item', {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'none',
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.5") // Quick appearance
    
    return tl
  }

  // Reset position to center
  const resetPosition = () => {
    gsap.to({ x: targetX, y: targetY }, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power2.out",
      onUpdate: function() {
        targetX = this.targets()[0].x
        targetY = this.targets()[0].y
        startSmoothScroll()
      }
    })
  }

  // Cleanup function
  const cleanup = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
    if (inertiaTimeout) {
      clearTimeout(inertiaTimeout)
    }
    if (gsapTween) {
      gsapTween.kill()
    }
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    
    // Cleanup Lenis
    if (lenisInstance.value) {
      try {
        lenisInstance.value.destroy()
      } catch (error) {
        console.warn('Error destroying Lenis instance:', error)
      }
      lenisInstance.value = null
    }
    
    // Remove from GSAP ticker and restore lag smoothing
    gsap.ticker.lagSmoothing(250, 16)
  }

  // Initialize on mount
  const initializeGallery = async () => {
    if (!process.client) return
    
    await nextTick()
    
    // Initialize Lenis first
    initializeLenis()
    
    // Set initial positions
    targetX = 0
    targetY = 0
    scrollX.value = 0
    scrollY.value = 0
    
    // Start the animation loop
    startSmoothScroll()
    
    // Create scroll-triggered animations with Lenis integration
    createScrollTriggerAnimations()
    
    // Create parallax effects
    createParallaxEffect()
    
    // Note: animatePageEnter is called manually from onLoadingComplete for immediate response
  }

  // Set callback function for scroll start detection
  const setScrollStartCallback = (callback) => {
    onScrollStartCallback = callback
  }

  return {
    // Reactive state
    scrollX,
    scrollY,
    velocity,
    isDragging,
    isInertiaActive,
    smoothScrollContainer,
    lenisInstance,
    
    // Event handlers
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
    
    // Animation functions
    animateItemHover,
    animateItemLeave,
    expandImage,
    createScrollTriggerAnimations,
    createParallaxEffect,
    animatePageEnter,
    resetPosition,
    
    // Lenis methods
    scrollTo,
    scrollToTop,
    scrollToElement,
    
    // Callback setters
    setScrollStartCallback,
    
    // Lifecycle
    initializeGallery,
    cleanup
  }
}