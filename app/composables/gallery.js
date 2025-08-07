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
  
  // Ultra-fluid smooth scrolling configuration
  const config = {
    smoothness: 0.08,    // More fluid interpolation
    trackpadMultiplier: 2.0, // Increased trackpad sensitivity
    touchMultiplier: 2.5, // Increased touch sensitivity for mobile
    maxVelocity: 150,    // Higher speed limit for smoother movement
    directControl: true, // Enable direct speed control
    boundaries: {
      minX: -30000,
      maxX: 30000,
      minY: -30000,
      maxY: 30000
    },
    mobile: {
      smoothness: 0.12,    // More fluid for mobile
      touchMultiplier: 3.0, // Increased touch sensitivity
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

    // Ultra-fluid boundary handling with smoother elasticity
    if (scrollX.value < config.boundaries.minX) {
      const overflow = config.boundaries.minX - scrollX.value
      scrollX.value += overflow * 0.12
      targetX += overflow * 0.06
    }
    if (scrollX.value > config.boundaries.maxX) {
      const overflow = scrollX.value - config.boundaries.maxX
      scrollX.value -= overflow * 0.12
      targetX -= overflow * 0.06
    }
    if (scrollY.value < config.boundaries.minY) {
      const overflow = config.boundaries.minY - scrollY.value
      scrollY.value += overflow * 0.12
      targetY += overflow * 0.06
    }
    if (scrollY.value > config.boundaries.maxY) {
      const overflow = scrollY.value - config.boundaries.maxY
      scrollY.value -= overflow * 0.12
      targetY -= overflow * 0.06
    }

    // Always continue animation for ultra-fluid movement
    if (Math.abs(deltaX) > 0.0005 || Math.abs(deltaY) > 0.0005) {
      animationFrame = requestAnimationFrame(updateSmoothScroll)
    }
  }

  // Initialize Lenis smooth scrolling
  const initializeLenis = () => {
    if (!process.client) return

    lenisInstance.value = new Lenis({
      ...config.lenis,
      wrapper: document.body,
      content: document.documentElement,
    })

    // Connect Lenis with GSAP ScrollTrigger
    lenisInstance.value.on('scroll', ScrollTrigger.update)
    
    // Add Lenis to GSAP ticker for perfect sync
    gsap.ticker.add((time) => {
      lenisInstance.value.raf(time * 1000)
    })
    
    // Disable lag smoothing for better performance
    gsap.ticker.lagSmoothing(0)

    return lenisInstance.value
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
  
  const handleWheel = (event) => {
    event.preventDefault()
    
    // Allow both trackpad and mouse wheel for more fluid scrolling
    const isTrackpad = Math.abs(event.deltaY) < 50 && Math.abs(event.deltaX) < 50
    const isMouseWheel = !isTrackpad
    
    const currentTime = performance.now()
    const isMobile = window.innerWidth < 768
    const sensitivity = isTrackpad ? config.trackpadMultiplier : config.trackpadMultiplier * 0.8
    const adjustedSensitivity = sensitivity * (isMobile ? 1.2 : 1.0)
    
    // Calculate smooth speed based on delta magnitude and time
    const timeDelta = currentTime - lastTrackpadTime
    
    if (timeDelta > 0) {
      // Smooth speed calculation - higher delta = faster movement
      const speedX = Math.abs(event.deltaX) / (timeDelta + 1)
      const speedY = Math.abs(event.deltaY) / (timeDelta + 1)
      
      // Update current speed with smoothing
      currentTrackpadSpeed.x = currentTrackpadSpeed.x * 0.8 + speedX * 0.2
      currentTrackpadSpeed.y = currentTrackpadSpeed.y * 0.8 + speedY * 0.2
      
      // Calculate speed multiplier based on movement velocity
      const speedMultiplier = Math.min((currentTrackpadSpeed.x + currentTrackpadSpeed.y) / 2, 1.5)
      
      // Apply smooth movement with speed-based multiplier
      const deltaX = event.deltaX * adjustedSensitivity * (1 + speedMultiplier * 0.2)
      const deltaY = event.deltaY * adjustedSensitivity * (1 + speedMultiplier * 0.2)

      // Smooth movement
      targetX -= deltaX
      targetY -= deltaY

      startSmoothScroll()
    }
    
    lastTrackpadTime = currentTime
    
    // Apply minimal smooth inertia
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      applyTrackpadInertia()
    }, 80)
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
      const currentTime = performance.now()
      const deltaX = event.touches[0].clientX - lastTouchX
      const deltaY = event.touches[0].clientY - lastTouchY
      
      // Calculate smooth touch speed
      const timeDelta = currentTime - lastTouchTime
      
      if (timeDelta > 0 && lastTouchTime > 0) {
        // Smooth speed calculation based on movement
        const speedX = Math.abs(deltaX) / (timeDelta + 1)
        const speedY = Math.abs(deltaY) / (timeDelta + 1)
        
        // Update current speed with smoothing
        currentTouchSpeed.x = currentTouchSpeed.x * 0.8 + speedX * 0.2
        currentTouchSpeed.y = currentTouchSpeed.y * 0.8 + speedY * 0.2
        
        // Calculate speed multiplier based on touch velocity
        const speedMultiplier = Math.min((currentTouchSpeed.x + currentTouchSpeed.y) / 2, 1.8) // Cap at 1.8x for touch
        
        // Apply smooth movement with speed-based multiplier
        const touchMultiplier = config.touchMultiplier * (1 + speedMultiplier * 0.2)
        
        targetX += deltaX * touchMultiplier
        targetY += deltaY * touchMultiplier
        
        startSmoothScroll()
      }
      
      // Update for drag compatibility
      velocity.value.x = deltaX * 0.6
      velocity.value.y = deltaY * 0.6
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      lastTouchTime = currentTime
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
      lenisInstance.value.destroy()
      lenisInstance.value = null
    }
    
    // Remove from GSAP ticker
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
    createScrollTriggerAnimations,
    createParallaxEffect,
    animatePageEnter,
    resetPosition,
    
    // Lenis methods
    scrollTo,
    scrollToTop,
    scrollToElement,
    
    // Lifecycle
    initializeGallery,
    cleanup
  }
}