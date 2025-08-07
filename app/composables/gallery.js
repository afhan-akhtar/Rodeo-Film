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
  
  // Rodeo Film style ultra-smooth scrolling configuration
  const config = {
    smoothness: 0.045,  // Ultra-smooth like Rodeo Film
    damping: 0.92,      // High damping for refined motion
    maxVelocity: 120,   // Higher velocity for responsive feel
    inertiaDelay: 30,   // Immediate response
    mouseMultiplier: 0.8, // Mouse sensitivity multiplier
    boundaries: {
      minX: -25000,    // Infinite-feeling boundaries
      maxX: 25000,
      minY: -25000,
      maxY: 25000
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

  // Rodeo Film style ultra-smooth scrolling animation loop
  const updateSmoothScroll = () => {
    // Ultra-smooth interpolation with Rodeo Film precision
    const deltaX = (targetX - scrollX.value) * config.smoothness
    const deltaY = (targetY - scrollY.value) * config.smoothness

    scrollX.value += deltaX
    scrollY.value += deltaY

    // Apply boundaries with elastic effect (softer than before)
    if (scrollX.value < config.boundaries.minX) {
      const overflow = config.boundaries.minX - scrollX.value
      scrollX.value += overflow * 0.05
      targetX += overflow * 0.05
    }
    if (scrollX.value > config.boundaries.maxX) {
      const overflow = scrollX.value - config.boundaries.maxX
      scrollX.value -= overflow * 0.05
      targetX -= overflow * 0.05
    }
    if (scrollY.value < config.boundaries.minY) {
      const overflow = config.boundaries.minY - scrollY.value
      scrollY.value += overflow * 0.05
      targetY += overflow * 0.05
    }
    if (scrollY.value > config.boundaries.maxY) {
      const overflow = scrollY.value - config.boundaries.maxY
      scrollY.value -= overflow * 0.05
      targetY -= overflow * 0.05
    }

    // Continue animation with higher precision threshold
    if (Math.abs(deltaX) > 0.05 || Math.abs(deltaY) > 0.05 || isInertiaActive.value) {
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



  // Rodeo Film style ultra-smooth wheel scrolling with physics-based momentum
  const handleWheel = (event) => {
    event.preventDefault()
    
    // Rodeo Film style sensitivity with refined control
    const sensitivity = config.mouseMultiplier * 1.8
    let deltaX = event.deltaX * sensitivity
    let deltaY = event.deltaY * sensitivity

    // Smooth omnidirectional scrolling with natural physics
    if (event.shiftKey) {
      // Pure horizontal scrolling
      deltaX += event.deltaY * sensitivity
      deltaY = 0
    } else {
      // Natural diagonal movement for engaging exploration
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        deltaX += event.deltaY * 0.25 // Subtle diagonal bias
      }
    }

    // Apply Rodeo Film style smooth momentum with physics
    const currentVelX = velocity.value.x
    const currentVelY = velocity.value.y
    
    // Add acceleration instead of direct position change
    velocity.value.x = currentVelX * 0.85 + (-deltaX * 0.12)
    velocity.value.y = currentVelY * 0.85 + (-deltaY * 0.12)
    
    // Update target positions with momentum
    targetX += velocity.value.x * 8
    targetY += velocity.value.y * 8

    // Clear any existing inertia animations
    if (gsapTween) {
      gsapTween.kill()
      isInertiaActive.value = false
    }

    startSmoothScroll()

    // Rodeo Film style continuous momentum decay
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      applyPhysicsBasedInertia()
    }, config.inertiaDelay)
  }

  // Physics-based inertia similar to Rodeo Film
  const applyPhysicsBasedInertia = () => {
    const velMagnitude = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)
    
    if (velMagnitude > 0.5) {
      isInertiaActive.value = true
      
      gsapTween = gsap.to(velocity.value, {
        x: 0,
        y: 0,
        duration: 2.5,
        ease: "power3.out",
        onUpdate: () => {
          targetX += velocity.value.x * 6
          targetY += velocity.value.y * 6
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
    if (isDragging.value) {
      const deltaX = event.clientX - lastMouseX
      const deltaY = event.clientY - lastMouseY
      
      // Rodeo Film style refined drag sensitivity
      const dragMultiplier = config.mouseMultiplier * 4
      targetX += deltaX * dragMultiplier
      targetY += deltaY * dragMultiplier
      
      // Smooth velocity update for natural momentum
      velocity.value.x = deltaX * 1.2
      velocity.value.y = deltaY * 1.2
      
      lastMouseX = event.clientX
      lastMouseY = event.clientY
      
      startSmoothScroll()
    }
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false
      // Apply Rodeo Film style physics-based inertia
      applyPhysicsBasedInertia()
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

  const handleTouchMove = (event) => {
    event.preventDefault()
    if (event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - lastTouchX
      const deltaY = event.touches[0].clientY - lastTouchY
      
      // Rodeo Film style touch sensitivity
      const touchMultiplier = config.mouseMultiplier * 3
      targetX += deltaX * touchMultiplier
      targetY += deltaY * touchMultiplier
      
      // Update velocity for physics-based momentum
      velocity.value.x = deltaX * 0.8
      velocity.value.y = deltaY * 0.8
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      
      startSmoothScroll()
    }
  }

  const handleTouchEnd = () => {
    // Apply Rodeo Film style inertia after touch release
    applyPhysicsBasedInertia()
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

  // No page entrance animations - immediate display
  const animatePageEnter = () => {
    // Immediately show all content without animations
    gsap.set('.showcase-container', { opacity: 1, y: 0 })
    gsap.set('.project-grid-item', { opacity: 1, y: 0 })
    
    // Return empty timeline for compatibility
    return gsap.timeline()
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