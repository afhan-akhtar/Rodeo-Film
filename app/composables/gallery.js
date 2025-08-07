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
  
  // Fast and responsive scrolling configuration
  const config = {
    smoothness: 0.15,   // Much faster response
    damping: 0.75,      // Reduced damping for quicker movement
    maxVelocity: 200,   // Higher velocity for responsive feel
    inertiaDelay: 100,  // Slightly more delay to prevent excessive calculations
    mouseMultiplier: 2.5, // Much higher sensitivity for direct control
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

  // Fast and lightweight scrolling animation loop
  const updateSmoothScroll = () => {
    // Fast interpolation for immediate response
    const deltaX = (targetX - scrollX.value) * config.smoothness
    const deltaY = (targetY - scrollY.value) * config.smoothness

    scrollX.value += deltaX
    scrollY.value += deltaY

    // Simplified boundary check (less computation)
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

    // Continue animation with lower threshold for better performance
    if (Math.abs(deltaX) > 0.2 || Math.abs(deltaY) > 0.2 || isInertiaActive.value) {
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



  // Fast and responsive wheel scrolling
  const handleWheel = (event) => {
    event.preventDefault()
    
    // Direct and responsive sensitivity
    const sensitivity = config.mouseMultiplier
    let deltaX = event.deltaX * sensitivity
    let deltaY = event.deltaY * sensitivity

    // Simple omnidirectional scrolling
    if (event.shiftKey) {
      // Pure horizontal scrolling
      deltaX += event.deltaY * sensitivity
      deltaY = 0
    }

    // Direct position update for immediate response
    targetX -= deltaX
    targetY -= deltaY

    // Update velocity for simple inertia
    velocity.value.x = -deltaX * 0.3
    velocity.value.y = -deltaY * 0.3

    // Clear any existing inertia animations
    if (gsapTween) {
      gsapTween.kill()
      isInertiaActive.value = false
    }

    startSmoothScroll()

    // Simple inertia with timeout
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      applySimpleInertia()
    }, config.inertiaDelay)
  }

  // Simple and fast inertia
  const applySimpleInertia = () => {
    const velMagnitude = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)
    
    if (velMagnitude > 1) {
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
    if (isDragging.value) {
      const deltaX = event.clientX - lastMouseX
      const deltaY = event.clientY - lastMouseY
      
      // Direct and responsive drag
      const dragMultiplier = config.mouseMultiplier * 2
      targetX += deltaX * dragMultiplier
      targetY += deltaY * dragMultiplier
      
      // Simple velocity update
      velocity.value.x = deltaX * 0.5
      velocity.value.y = deltaY * 0.5
      
      lastMouseX = event.clientX
      lastMouseY = event.clientY
      
      startSmoothScroll()
    }
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false
      // Apply simple inertia
      applySimpleInertia()
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
      
      // Simple touch sensitivity
      const touchMultiplier = config.mouseMultiplier * 1.5
      targetX += deltaX * touchMultiplier
      targetY += deltaY * touchMultiplier
      
      // Simple velocity update
      velocity.value.x = deltaX * 0.4
      velocity.value.y = deltaY * 0.4
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      
      startSmoothScroll()
    }
  }

  const handleTouchEnd = () => {
    // Apply simple inertia after touch release
    applySimpleInertia()
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