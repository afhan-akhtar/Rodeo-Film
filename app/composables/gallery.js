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
  
  // Rodeo Film-style smooth scrolling configuration
  const config = {
    smoothness: 0.08,    // Ultra-smooth like professional studios
    damping: 0.85,       // Natural momentum decay
    mouseMultiplier: 1.2, // Refined mouse sensitivity
    touchMultiplier: 1.8, // Enhanced touch sensitivity for mobile
    inertiaDecay: 0.92,  // Smooth momentum fade
    maxVelocity: 150,    // Controlled maximum speed
    boundaries: {
      minX: -25000,
      maxX: 25000,
      minY: -25000,
      maxY: 25000
    },
    mobile: {
      smoothness: 0.12,    // Slightly faster for mobile
      touchMultiplier: 2.2, // Higher touch sensitivity
      inertiaDecay: 0.88,   // Faster decay on mobile
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

  // Rodeo Film-style ultra-smooth scrolling animation loop
  const updateSmoothScroll = () => {
    // Detect if we're on mobile for config selection
    const isMobile = window.innerWidth < 768
    const currentConfig = isMobile ? config.mobile : config
    
    // Ultra-smooth interpolation with professional easing
    const deltaX = (targetX - scrollX.value) * currentConfig.smoothness
    const deltaY = (targetY - scrollY.value) * currentConfig.smoothness

    scrollX.value += deltaX
    scrollY.value += deltaY

    // Smooth boundary handling with elastic effect
    if (scrollX.value < config.boundaries.minX) {
      const overflow = config.boundaries.minX - scrollX.value
      scrollX.value += overflow * 0.1
      targetX += overflow * 0.05
    }
    if (scrollX.value > config.boundaries.maxX) {
      const overflow = scrollX.value - config.boundaries.maxX
      scrollX.value -= overflow * 0.1
      targetX -= overflow * 0.05
    }
    if (scrollY.value < config.boundaries.minY) {
      const overflow = config.boundaries.minY - scrollY.value
      scrollY.value += overflow * 0.1
      targetY += overflow * 0.05
    }
    if (scrollY.value > config.boundaries.maxY) {
      const overflow = scrollY.value - config.boundaries.maxY
      scrollY.value -= overflow * 0.1
      targetY -= overflow * 0.05
    }

    // Continue animation with professional-grade precision
    if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01 || isInertiaActive.value) {
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



  // Rodeo Film-style mouse movement controlled scrolling
  let lastMouseMovement = { x: 0, y: 0, time: 0 }
  let mouseVelocity = { x: 0, y: 0 }
  
  const handleMouseMovement = (event) => {
    if (!isDragging.value) {
      const currentTime = performance.now()
      const currentMouse = { x: event.clientX, y: event.clientY }
      
      // Calculate mouse velocity for natural momentum
      if (lastMouseMovement.time > 0) {
        const timeDelta = currentTime - lastMouseMovement.time
        if (timeDelta > 0) {
          const velocityX = (currentMouse.x - lastMouseMovement.x) / timeDelta
          const velocityY = (currentMouse.y - lastMouseMovement.y) / timeDelta
          
          // Smooth velocity calculation with damping
          mouseVelocity.x = mouseVelocity.x * config.damping + velocityX * (1 - config.damping)
          mouseVelocity.y = mouseVelocity.y * config.damping + velocityY * (1 - config.damping)
          
          // Apply professional-grade movement scaling
          const sensitivity = config.mouseMultiplier * 250
          const velocityMultiplier = Math.min(Math.sqrt(velocityX * velocityX + velocityY * velocityY) / 2, 3)
          
          targetX += mouseVelocity.x * sensitivity * (1 + velocityMultiplier * 0.5)
          targetY += mouseVelocity.y * sensitivity * (1 + velocityMultiplier * 0.5)
          
          startSmoothScroll()
        }
      }
      
      // Update tracking
      lastMouseMovement = { x: currentMouse.x, y: currentMouse.y, time: currentTime }
    }
  }

  // Rodeo Film-style wheel/trackpad scrolling
  const handleWheel = (event) => {
    event.preventDefault()
    
    // Professional wheel sensitivity with momentum
    const isMobile = window.innerWidth < 768
    const sensitivity = config.mouseMultiplier * (isMobile ? 1.5 : 1.0)
    
    // Calculate wheel velocity for natural momentum
    const wheelVelocity = Math.sqrt(event.deltaX * event.deltaX + event.deltaY * event.deltaY)
    const velocityMultiplier = Math.min(wheelVelocity / 50, 2) // Cap at 2x
    
    const deltaX = event.deltaX * sensitivity * (1 + velocityMultiplier * 0.3)
    const deltaY = event.deltaY * sensitivity * (1 + velocityMultiplier * 0.3)

    // Apply with smooth momentum
    targetX -= deltaX
    targetY -= deltaY

    // Update mouse velocity for continuity
    mouseVelocity.x = mouseVelocity.x * 0.7 + (-deltaX * 0.1)
    mouseVelocity.y = mouseVelocity.y * 0.7 + (-deltaY * 0.1)

    startSmoothScroll()
    
    // Clear any existing momentum and apply new inertia
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      applyProfessionalInertia()
    }, 50)
  }

  // Professional Rodeo Film-style inertia
  const applyProfessionalInertia = () => {
    const isMobile = window.innerWidth < 768
    const currentConfig = isMobile ? config.mobile : config
    
    const velocityMagnitude = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y)
    
    if (velocityMagnitude > 0.5) {
      isInertiaActive.value = true
      
      gsapTween = gsap.to(mouseVelocity, {
        x: 0,
        y: 0,
        duration: isMobile ? 1.8 : 2.5,
        ease: "power3.out",
        onUpdate: () => {
          const sensitivity = config.mouseMultiplier * 250
          targetX += mouseVelocity.x * sensitivity * 0.5
          targetY += mouseVelocity.y * sensitivity * 0.5
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
    // Handle mouse movement scrolling (primary control)
    handleMouseMovement(event)
    
    // Handle dragging (secondary control)
    if (isDragging.value) {
      const deltaX = event.clientX - lastMouseX
      const deltaY = event.clientY - lastMouseY
      
      // Direct drag with high sensitivity
      const dragMultiplier = config.mouseMultiplier * 3
      targetX += deltaX * dragMultiplier
      targetY += deltaY * dragMultiplier
      
      // Update velocity for minimal inertia
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
      // Apply minimal inertia only for drag
      applyMinimalInertia()
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

  // Enhanced mobile touch controls
  let touchVelocity = { x: 0, y: 0 }
  let lastTouchTime = 0
  
  const handleTouchMove = (event) => {
    event.preventDefault()
    if (event.touches.length === 1) {
      const currentTime = performance.now()
      const deltaX = event.touches[0].clientX - lastTouchX
      const deltaY = event.touches[0].clientY - lastTouchY
      
      // Calculate touch velocity for natural mobile momentum
      if (lastTouchTime > 0) {
        const timeDelta = currentTime - lastTouchTime
        if (timeDelta > 0) {
          const velocityX = deltaX / timeDelta
          const velocityY = deltaY / timeDelta
          
          // Smooth touch velocity with damping
          touchVelocity.x = touchVelocity.x * config.mobile.inertiaDecay + velocityX * (1 - config.mobile.inertiaDecay)
          touchVelocity.y = touchVelocity.y * config.mobile.inertiaDecay + velocityY * (1 - config.mobile.inertiaDecay)
        }
      }
      
      // Professional mobile touch sensitivity
      const touchMultiplier = config.touchMultiplier * 3
      const velocityBoost = Math.min(Math.sqrt(touchVelocity.x * touchVelocity.x + touchVelocity.y * touchVelocity.y) / 5, 2)
      
      targetX += deltaX * touchMultiplier * (1 + velocityBoost * 0.5)
      targetY += deltaY * touchMultiplier * (1 + velocityBoost * 0.5)
      
      // Update for drag compatibility
      velocity.value.x = deltaX * 0.8
      velocity.value.y = deltaY * 0.8
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      lastTouchTime = currentTime
      
      startSmoothScroll()
    }
  }

  const handleTouchEnd = () => {
    // Apply professional mobile inertia
    const velocityMagnitude = Math.sqrt(touchVelocity.x * touchVelocity.x + touchVelocity.y * touchVelocity.y)
    
    if (velocityMagnitude > 1) {
      isInertiaActive.value = true
      
      gsapTween = gsap.to(touchVelocity, {
        x: 0,
        y: 0,
        duration: 2.0,
        ease: "power3.out",
        onUpdate: () => {
          const sensitivity = config.touchMultiplier * 300
          targetX += touchVelocity.x * sensitivity * 0.4
          targetY += touchVelocity.y * sensitivity * 0.4
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