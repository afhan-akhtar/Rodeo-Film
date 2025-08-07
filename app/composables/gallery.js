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
  
  // Direct speed-controlled scrolling configuration
  const config = {
    smoothness: 0.15,    // Faster response for direct control
    trackpadMultiplier: 2.5, // Direct trackpad sensitivity
    touchMultiplier: 3.0, // Enhanced touch sensitivity for mobile
    maxVelocity: 200,    // Higher speed limit for direct control
    directControl: true, // Enable direct speed control
    boundaries: {
      minX: -25000,
      maxX: 25000,
      minY: -25000,
      maxY: 25000
    },
    mobile: {
      smoothness: 0.2,     // Faster for mobile direct control
      touchMultiplier: 3.5, // Higher touch sensitivity
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

  // Direct speed-controlled scrolling animation loop
  const updateSmoothScroll = () => {
    // Detect if we're on mobile for config selection
    const isMobile = window.innerWidth < 768
    const currentConfig = isMobile ? config.mobile : config
    
    // Direct speed control interpolation
    const deltaX = (targetX - scrollX.value) * currentConfig.smoothness
    const deltaY = (targetY - scrollY.value) * currentConfig.smoothness

    scrollX.value += deltaX
    scrollY.value += deltaY

    // Simple boundary handling for direct control
    if (scrollX.value < config.boundaries.minX) {
      scrollX.value = config.boundaries.minX
      targetX = config.boundaries.minX
    }
    if (scrollX.value > config.boundaries.maxX) {
      scrollX.value = config.boundaries.maxX
      targetX = config.boundaries.maxX
    }
    if (scrollY.value < config.boundaries.minY) {
      scrollY.value = config.boundaries.minY
      targetY = config.boundaries.minY
    }
    if (scrollY.value > config.boundaries.maxY) {
      scrollY.value = config.boundaries.maxY
      targetY = config.boundaries.maxY
    }

    // Continue animation for direct control
    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
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

  // Direct speed-controlled trackpad scrolling
  let currentTrackpadSpeed = { x: 0, y: 0 }
  let lastTrackpadTime = 0
  
  const handleWheel = (event) => {
    event.preventDefault()
    
    // Detect trackpad vs mouse wheel (trackpad has smaller, more frequent deltas)
    const isTrackpad = Math.abs(event.deltaY) < 50 && Math.abs(event.deltaX) < 50
    
    // Only allow trackpad scrolling (two-finger), block mouse wheel
    if (!isTrackpad) {
      return // Block single mouse wheel scrolling
    }
    
    const currentTime = performance.now()
    const isMobile = window.innerWidth < 768
    const sensitivity = config.trackpadMultiplier * (isMobile ? 1.2 : 1.0)
    
    // Calculate real-time speed based on delta magnitude and time
    const timeDelta = currentTime - lastTrackpadTime
    
    if (timeDelta > 0) {
      // Direct speed calculation - higher delta = faster movement
      const speedX = Math.abs(event.deltaX) / (timeDelta + 1) // Add 1 to prevent division by 0
      const speedY = Math.abs(event.deltaY) / (timeDelta + 1)
      
      // Update current speed for direct control
      currentTrackpadSpeed.x = speedX
      currentTrackpadSpeed.y = speedY
      
      // Calculate speed multiplier based on movement velocity
      const speedMultiplier = Math.min((speedX + speedY) / 5, 3) // Cap at 3x
      
      // Apply direct movement with speed-based multiplier
      const deltaX = event.deltaX * sensitivity * (1 + speedMultiplier * 0.5)
      const deltaY = event.deltaY * sensitivity * (1 + speedMultiplier * 0.5)

      // Direct movement - no momentum
      targetX -= deltaX
      targetY -= deltaY

      startSmoothScroll()
    }
    
    lastTrackpadTime = currentTime
    
    // Clear any existing momentum - we want direct control only
    clearTimeout(inertiaTimeout)
    if (gsapTween) {
      gsapTween.kill()
      isInertiaActive.value = false
    }
  }

  // No inertia - direct control only
  const applyTrackpadInertia = () => {
    // Disabled for direct speed control
    // Movement stops immediately when input stops
    return
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
      
      // Direct drag control with speed-based multiplier
      const dragSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const speedMultiplier = Math.min(dragSpeed / 10, 2) // Cap at 2x
      const dragMultiplier = config.trackpadMultiplier * 4 * (1 + speedMultiplier * 0.3)
      
      targetX += deltaX * dragMultiplier
      targetY += deltaY * dragMultiplier
      
      // Update velocity for minimal compatibility
      velocity.value.x = deltaX * 1.0
      velocity.value.y = deltaY * 1.0
      
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

  // Direct speed-controlled mobile touch controls
  let currentTouchSpeed = { x: 0, y: 0 }
  let lastTouchTime = 0
  
  const handleTouchMove = (event) => {
    event.preventDefault()
    if (event.touches.length === 1) {
      const currentTime = performance.now()
      const deltaX = event.touches[0].clientX - lastTouchX
      const deltaY = event.touches[0].clientY - lastTouchY
      
      // Calculate direct touch speed
      const timeDelta = currentTime - lastTouchTime
      
      if (timeDelta > 0 && lastTouchTime > 0) {
        // Direct speed calculation based on movement
        const speedX = Math.abs(deltaX) / (timeDelta + 1)
        const speedY = Math.abs(deltaY) / (timeDelta + 1)
        
        // Update current speed for direct control
        currentTouchSpeed.x = speedX
        currentTouchSpeed.y = speedY
        
        // Calculate speed multiplier based on touch velocity
        const speedMultiplier = Math.min((speedX + speedY) / 3, 2.5) // Cap at 2.5x for touch
        
        // Apply direct movement with speed-based multiplier
        const touchMultiplier = config.touchMultiplier * (1 + speedMultiplier * 0.3)
        
        targetX += deltaX * touchMultiplier
        targetY += deltaY * touchMultiplier
        
        startSmoothScroll()
      }
      
      // Update for drag compatibility
      velocity.value.x = deltaX * 0.8
      velocity.value.y = deltaY * 0.8
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      lastTouchTime = currentTime
    }
  }

  const handleTouchEnd = () => {
    // No inertia for direct control - stop immediately
    // Clear any existing momentum
    if (gsapTween) {
      gsapTween.kill()
      isInertiaActive.value = false
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
      opacity: 0,
      scale: 0.95,
      y: 20,
      filter: 'blur(5px)'
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
    
    // Staggered grid items animation - Rodeo Film style
    .to('.project-grid-item', {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.2,
      stagger: {
        amount: 2.0,
        from: "center",
        grid: "auto",
        ease: "power2.inOut"
      },
      ease: "power3.out"
    }, "-=1.0") // Start 1s before container finishes
    
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