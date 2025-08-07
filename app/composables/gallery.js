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
  
  // Configuration
  const config = {
    smoothness: 0.1,
    damping: 0.8,
    maxVelocity: 50,
    inertiaDelay: 100,
    boundaries: {
      minX: -5000,
      maxX: 5000,
      minY: -5000,
      maxY: 5000
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

  // Smooth scrolling animation loop
  const updateSmoothScroll = () => {
    // Apply smooth interpolation
    const deltaX = (targetX - scrollX.value) * config.smoothness
    const deltaY = (targetY - scrollY.value) * config.smoothness

    scrollX.value += deltaX
    scrollY.value += deltaY

    // Update velocity for inertia
    velocity.value.x = deltaX
    velocity.value.y = deltaY

    // Apply boundaries with elastic effect
    if (scrollX.value < config.boundaries.minX) {
      const overflow = config.boundaries.minX - scrollX.value
      scrollX.value += overflow * 0.1
      targetX += overflow * 0.1
    }
    if (scrollX.value > config.boundaries.maxX) {
      const overflow = scrollX.value - config.boundaries.maxX
      scrollX.value -= overflow * 0.1
      targetX -= overflow * 0.1
    }
    if (scrollY.value < config.boundaries.minY) {
      const overflow = config.boundaries.minY - scrollY.value
      scrollY.value += overflow * 0.1
      targetY += overflow * 0.1
    }
    if (scrollY.value > config.boundaries.maxY) {
      const overflow = scrollY.value - config.boundaries.maxY
      scrollY.value -= overflow * 0.1
      targetY -= overflow * 0.1
    }

    // Continue animation if still moving
    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1 || isInertiaActive.value) {
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

  // Apply inertia when dragging stops
  const applyInertia = () => {
    if (Math.abs(velocity.value.x) > 1 || Math.abs(velocity.value.y) > 1) {
      isInertiaActive.value = true
      
      // Use GSAP for smooth inertia animation
      gsapTween = gsap.to(velocity.value, {
        x: 0,
        y: 0,
        duration: 2,
        ease: "power3.out",
        onUpdate: () => {
          targetX += velocity.value.x * 10
          targetY += velocity.value.y * 10
        },
        onComplete: () => {
          isInertiaActive.value = false
          gsapTween = null
        }
      })
    }
  }

  // Enhanced wheel scrolling with Lenis and momentum
  const handleWheel = (event) => {
    // For vertical scrolling, let Lenis handle it
    if (!event.shiftKey && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      // Lenis will handle this automatically
      return
    }

    // Prevent default for horizontal scrolling or when shift is held
    event.preventDefault()
    
    const sensitivity = 1.2
    let deltaX = event.deltaX * sensitivity
    let deltaY = event.deltaY * sensitivity

    // Allow horizontal scrolling with shift key
    if (event.shiftKey) {
      deltaX += event.deltaY * sensitivity
      deltaY = 0
    }

    // Apply momentum for horizontal movement
    targetX -= deltaX
    targetY -= deltaY

    // Clear any existing inertia
    if (gsapTween) {
      gsapTween.kill()
      isInertiaActive.value = false
    }

    startSmoothScroll()

    // Apply slight inertia after wheel stops
    clearTimeout(inertiaTimeout)
    inertiaTimeout = setTimeout(() => {
      velocity.value.x = -deltaX * 0.1
      velocity.value.y = -deltaY * 0.1
      applyInertia()
    }, config.inertiaDelay)
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
      
      targetX += deltaX * 2
      targetY += deltaY * 2
      
      // Update velocity for smooth inertia
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
      // Apply inertia after mouse release
      applyInertia()
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
      
      targetX += deltaX * 2
      targetY += deltaY * 2
      
      // Update velocity for smooth inertia
      velocity.value.x = deltaX * 0.5
      velocity.value.y = deltaY * 0.5
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      
      startSmoothScroll()
    }
  }

  const handleTouchEnd = () => {
    // Apply inertia after touch release
    applyInertia()
  }

  // Keyboard navigation with smooth animations
  const handleKeyDown = (event, clientWidth, clientHeight) => {
    const scale = Math.min(clientWidth / 1920, 1) * 1.2
    const baseWidth = 280
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
    const content = element.querySelector('.hexagon-content')
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
    
    const content = element.querySelector('.hexagon-content')
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

  // Create scroll-triggered animations for grid items with Lenis integration
  const createScrollTriggerAnimations = () => {
    if (!process.client) return
    
    // Configure ScrollTrigger to work with Lenis
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
    
    // Animate items as they come into view
    gsap.utils.toArray('.project-grid-item').forEach((item, index) => {
      gsap.fromTo(item, 
        {
          opacity: 0,
          scale: 0.8,
          rotationY: -15,
          y: 50
        },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: index * 0.05,
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse",
            scroller: document.body
          }
        }
      )
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

  // Page transition animations - immediate top-to-bottom reveal
  const animatePageEnter = () => {
    const tl = gsap.timeline()
    
    // Immediate showcase container reveal from top
    tl.fromTo('.showcase-container', 
      { opacity: 0, y: -100 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
    // Staggered reveal of items from top to bottom
    .fromTo('.project-grid-item',
      { opacity: 0, y: -30 },
      { 
        opacity: 1, 
        y: 0,
        duration: 0.4, 
        ease: "power2.out",
        stagger: {
          amount: 0.8,
          from: "start",
          grid: "auto",
          axis: "y"
        }
      }, "-=0.4"
    )
    
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