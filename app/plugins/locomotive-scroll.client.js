import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/dist/locomotive-scroll.css'

export default defineNuxtPlugin(() => {
  let locomotiveScroll = null

  const initLocomotiveScroll = () => {
    // Ensure the DOM is ready and the scroll container exists
    const scrollContainer = document.querySelector('[data-scroll-container]')
    if (!scrollContainer) {
      console.warn('Locomotive Scroll: No scroll container found. Make sure to add data-scroll-container to your main element.')
      return null
    }

    locomotiveScroll = new LocomotiveScroll({
      el: scrollContainer,
      smooth: true,
      multiplier: 0.8, // Reduced for smoother control
      class: 'is-revealed',
      scrollbarContainer: false,
      scrollFromAnywhere: false,
      lerp: 0.05, // Lower value for more fluid movement (0.01-0.1)
      reloadOnContextChange: true,
      touchMultiplier: 2.5, // Increased for better mobile touch response
      firefoxMultiplier: 50, // Better Firefox support
      gestureDirection: 'vertical',
      tablet: {
        smooth: true,
        direction: 'vertical',
        horizontalGesture: false,
        touchMultiplier: 2.8, // Enhanced tablet touch
        breakpoint: 1024,
      },
      smartphone: {
        smooth: true,
        direction: 'vertical',
        horizontalGesture: false,
        touchMultiplier: 3.2, // Better mobile touch sensitivity
        breakpoint: 768,
      }
    })

    // Update GSAP ScrollTrigger when Locomotive Scroll updates
    locomotiveScroll.on('scroll', ({ scroll }) => {
      // Update GSAP ScrollTrigger
      if (window.ScrollTrigger) {
        window.ScrollTrigger.update()
      }
    })

    // Listen for scroll position updates
    locomotiveScroll.on('scroll', (instance) => {
      // Emit scroll event for components that need it
      document.dispatchEvent(new CustomEvent('locomotive-scroll', {
        detail: {
          scroll: instance.scroll,
          direction: instance.direction,
          speed: instance.speed
        }
      }))
    })

    // Add mouse wheel event listener for better control
    let isMouseWheelScrolling = false
    scrollContainer.addEventListener('wheel', (e) => {
      isMouseWheelScrolling = true
      // Prevent default to avoid double scrolling
      e.preventDefault()
      
      // Calculate scroll delta with improved sensitivity
      const delta = e.deltaY * 0.5 // Reduce sensitivity for smoother control
      const currentScroll = locomotiveScroll.scroll.instance.scroll.y || 0
      
      // Apply smooth scroll with the calculated delta
      locomotiveScroll.scrollTo(currentScroll + delta, {
        duration: 0,
        disableLerp: false
      })
      
      // Reset flag after a short delay
      setTimeout(() => {
        isMouseWheelScrolling = false
      }, 100)
    }, { passive: false })

    // Enhanced touch handling for mobile devices
    let touchStartY = 0
    let touchCurrentY = 0
    let touchVelocity = 0
    let lastTouchTime = 0

    scrollContainer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY
      touchCurrentY = touchStartY
      lastTouchTime = Date.now()
      touchVelocity = 0
    }, { passive: true })

    scrollContainer.addEventListener('touchmove', (e) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTouchTime
      const newY = e.touches[0].clientY
      const deltaY = newY - touchCurrentY
      
      // Calculate velocity for momentum
      if (deltaTime > 0) {
        touchVelocity = deltaY / deltaTime
      }
      
      touchCurrentY = newY
      lastTouchTime = currentTime
    }, { passive: true })

    scrollContainer.addEventListener('touchend', (e) => {
      // Apply momentum based on touch velocity
      if (Math.abs(touchVelocity) > 0.1) {
        const momentum = touchVelocity * 200 // Adjust momentum factor
        const currentScroll = locomotiveScroll.scroll.instance.scroll.y || 0
        
        locomotiveScroll.scrollTo(currentScroll - momentum, {
          duration: Math.abs(momentum) * 2, // Duration based on momentum
          easing: [0.25, 0.46, 0.45, 0.94] // Smooth easing
        })
      }
    }, { passive: true })

    // Refresh when the page is fully loaded
    window.addEventListener('load', () => {
      locomotiveScroll.update()
    })

    return locomotiveScroll
  }

  const destroyLocomotiveScroll = () => {
    if (locomotiveScroll) {
      locomotiveScroll.destroy()
      locomotiveScroll = null
    }
  }

  // Initialize on client-side only
  if (process.client) {
    // Listen for the custom event from layout
    document.addEventListener('locomotive-scroll-ready', () => {
      setTimeout(() => {
        initLocomotiveScroll()
      }, 100)
    })

    // Also initialize when DOM is ready as fallback
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          initLocomotiveScroll()
        }, 300)
      })
    } else {
      setTimeout(() => {
        initLocomotiveScroll()
      }, 300)
    }

    // Cleanup when page unloads
    window.addEventListener('beforeunload', () => {
      destroyLocomotiveScroll()
    })
  }

  return {
    provide: {
      locomotiveScroll: () => locomotiveScroll,
      initLocomotiveScroll,
      destroyLocomotiveScroll,
      scrollTo: (target, options = {}) => {
        if (locomotiveScroll) {
          locomotiveScroll.scrollTo(target, {
            duration: 800, // Faster for better responsiveness
            easing: [0.25, 0.46, 0.45, 0.94], // Smoother easing
            disableLerp: false,
            ...options
          })
        }
      },
      scrollToTop: () => {
        if (locomotiveScroll) {
          locomotiveScroll.scrollTo(0, { 
            duration: 1000, // Faster scroll to top
            easing: [0.25, 0.46, 0.45, 0.94]
          })
        }
      },
      updateLocomotiveScroll: () => {
        if (locomotiveScroll) {
          locomotiveScroll.update()
        }
      },
      setScrollSpeed: (speed) => {
        if (locomotiveScroll && speed >= 0.1 && speed <= 3.0) {
          // Dynamically adjust scroll multiplier
          locomotiveScroll.options.multiplier = speed
          locomotiveScroll.options.touchMultiplier = speed * 2.5
          locomotiveScroll.update()
        }
      },
      setSmoothness: (lerp) => {
        if (locomotiveScroll && lerp >= 0.01 && lerp <= 0.2) {
          // Adjust smoothness (lerp value)
          locomotiveScroll.options.lerp = lerp
        }
      },
      pauseScroll: () => {
        if (locomotiveScroll) {
          locomotiveScroll.stop()
        }
      },
      resumeScroll: () => {
        if (locomotiveScroll) {
          locomotiveScroll.start()
        }
      }
    }
  }
})
