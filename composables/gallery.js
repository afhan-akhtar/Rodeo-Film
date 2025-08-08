import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  
  // Configuration - Optimized for mobile speed
  const config = {
    smoothness: 0.15, // Increased from 0.1 for faster response
    damping: 0.7, // Reduced from 0.8 for less resistance
    maxVelocity: 80, // Increased from 50 for faster movement
    inertiaDelay: 80, // Reduced from 100 for quicker inertia
    touchMultiplier: 3.0, // Increased from 2.0 for faster touch response
    boundaries: {
      minX: -5000,
      maxX: 5000,
      minY: -5000,
      maxY: 5000
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
  
  // Mobile detection
  const isMobile = () => {
    if (process.client) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
             window.innerWidth <= 768
    }
    return false
  }

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
      
      // Use GSAP for smooth inertia animation with faster decay
      gsapTween = gsap.to(velocity.value, {
        x: 0,
        y: 0,
        duration: 1.5, // Reduced from 2 for faster decay
        ease: "power2.out", // Changed from power3.out for faster response
        onUpdate: () => {
          targetX += velocity.value.x * 15 // Increased from 10 for faster movement
          targetY += velocity.value.y * 15
        },
        onComplete: () => {
          isInertiaActive.value = false
          gsapTween = null
        }
      })
    }
  }

  // Enhanced wheel scrolling with momentum
  const handleWheel = (event) => {
    event.preventDefault()
    
    const sensitivity = 1.5 // Increased from 1.2 for faster wheel scrolling
    let deltaX = event.deltaX * sensitivity
    let deltaY = event.deltaY * sensitivity

    // Allow horizontal scrolling with shift key
    if (event.shiftKey) {
      deltaX += event.deltaY * sensitivity
      deltaY = 0
    }

    // Apply momentum
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
      velocity.value.x = -deltaX * 0.15 // Increased from 0.1
      velocity.value.y = -deltaY * 0.15
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
      
      targetX += deltaX * 2.5 // Increased from 2 for faster mouse dragging
      targetY += deltaY * 2.5
      
      // Update velocity for smooth inertia
      velocity.value.x = deltaX * 0.8 // Increased from 0.5
      velocity.value.y = deltaY * 0.8
      
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

  // Touch controls with enhanced momentum - Optimized for mobile speed
  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      
      // Clear any existing inertia
      if (gsapTween) {
        gsapTween.kill()
        isInertiaActive.value = false
      }
      
      // Prevent default to avoid conflicts
      event.preventDefault()
    }
  }

  const handleTouchMove = (event) => {
    event.preventDefault()
    if (event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - lastTouchX
      const deltaY = event.touches[0].clientY - lastTouchY
      
      // Mobile-specific optimizations
      const mobileMultiplier = isMobile() ? config.touchMultiplier * 1.5 : config.touchMultiplier
      
      // Increased touch sensitivity for faster mobile scrolling
      targetX += deltaX * mobileMultiplier
      targetY += deltaY * mobileMultiplier
      
      // Update velocity for smooth inertia with higher sensitivity
      const velocityMultiplier = isMobile() ? 2.0 : 1.2
      velocity.value.x = deltaX * velocityMultiplier
      velocity.value.y = deltaY * velocityMultiplier
      
      lastTouchX = event.touches[0].clientX
      lastTouchY = event.touches[0].clientY
      
      startSmoothScroll()
    }
  }

  const handleTouchEnd = () => {
    // Apply inertia after touch release with faster response
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

  // Create scroll-triggered animations for grid items
  const createScrollTriggerAnimations = () => {
    if (!process.client) return
    
    // Animate items as they come into view
    gsap.utils.toArray('.project-grid-item').forEach((item, index) => {
      gsap.fromTo(item, 
        {
          opacity: 0,
          scale: 0.8,
          rotationY: -15
        },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse"
          }
        }
      )
    })
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

  // Page transition animations
  const animatePageEnter = () => {
    const tl = gsap.timeline()
    
    tl.fromTo('.showcase-container', 
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
    )
    .fromTo('.project-grid-item',
      { opacity: 0, y: 50, rotationX: -20 },
      { 
        opacity: 1, 
        y: 0, 
        rotationX: 0,
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.1
      }, "-=0.5"
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
  }

  // Initialize on mount
  const initializeGallery = async () => {
    if (!process.client) return
    
    await nextTick()
    
    // Set initial positions
    targetX = 0
    targetY = 0
    scrollX.value = 0
    scrollY.value = 0
    
    // Start the animation loop
    startSmoothScroll()
    
    // Create scroll-triggered animations
    createScrollTriggerAnimations()
    
    // Create parallax effects
    createParallaxEffect()
    
    // Animate page entrance
    animatePageEnter()
  }

  return {
    // Reactive state
    scrollX,
    scrollY,
    velocity,
    isDragging,
    isInertiaActive,
    smoothScrollContainer,
    
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
    
    // Lifecycle
    initializeGallery,
    cleanup
  }
}