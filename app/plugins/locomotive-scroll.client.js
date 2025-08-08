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
      multiplier: 0.6, // More fluid and responsive
      class: 'is-revealed',
      scrollbarContainer: false,
      scrollFromAnywhere: false,
      lerp: 0.03, // Ultra-smooth movement (0.01-0.1)
      reloadOnContextChange: true,
      touchMultiplier: 3.0, // Enhanced mobile touch response
      firefoxMultiplier: 60, // Better Firefox support
      gestureDirection: 'vertical',
      // Enhanced momentum scrolling
      momentum: 0.8,
      // Improved easing functions
      easing: [0.25, 0.46, 0.45, 0.94],
      tablet: {
        smooth: true,
        direction: 'vertical',
        horizontalGesture: false,
        touchMultiplier: 3.2,
        breakpoint: 1024,
        lerp: 0.04,
      },
      smartphone: {
        smooth: true,
        direction: 'vertical',
        horizontalGesture: false,
        touchMultiplier: 3.5,
        breakpoint: 768,
        lerp: 0.05,
      }
    })

    // Enhanced scroll event handling with advanced UI animations
    let scrollTimeout
    locomotiveScroll.on('scroll', ({ scroll }) => {
      // Throttle scroll events for better performance
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // Update GSAP ScrollTrigger
        if (window.ScrollTrigger) {
          window.ScrollTrigger.update()
        }

        // Advanced Parallax Effects
        const parallaxElements = document.querySelectorAll('[data-scroll-speed]')
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.getAttribute('data-scroll-speed')) || 0.5
          const y = scroll.y * speed
          const x = scroll.y * speed * 0.5 // Horizontal parallax
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`
        })

        // Advanced Scale Effects with rotation
        const scaleElements = document.querySelectorAll('[data-scroll-scale]')
        scaleElements.forEach(el => {
          const scale = parseFloat(el.getAttribute('data-scroll-scale')) || 1
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const currentScale = 1 + (scale - 1) * progress
          const rotation = progress * 10 // Subtle rotation
          el.style.transform = `scale(${currentScale}) rotate(${rotation}deg)`
        })

        // Rotation Effects
        const rotateElements = document.querySelectorAll('[data-scroll-rotate]')
        rotateElements.forEach(el => {
          const rotation = parseFloat(el.getAttribute('data-scroll-rotate')) || 360
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const currentRotation = progress * rotation
          el.style.transform = `rotate(${currentRotation}deg)`
        })

        // Skew Effects
        const skewElements = document.querySelectorAll('[data-scroll-skew]')
        skewElements.forEach(el => {
          const skew = parseFloat(el.getAttribute('data-scroll-skew')) || 10
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const currentSkew = progress * skew
          el.style.transform = `skewY(${currentSkew}deg)`
        })

        // Blur Effects
        const blurElements = document.querySelectorAll('[data-scroll-blur]')
        blurElements.forEach(el => {
          const blur = parseFloat(el.getAttribute('data-scroll-blur')) || 10
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const currentBlur = progress * blur
          el.style.filter = `blur(${currentBlur}px)`
        })

        // Opacity Effects
        const opacityElements = document.querySelectorAll('[data-scroll-opacity]')
        opacityElements.forEach(el => {
          const opacity = parseFloat(el.getAttribute('data-scroll-opacity')) || 1
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const currentOpacity = 1 - (progress * (1 - opacity))
          el.style.opacity = currentOpacity
        })

        // Color Shift Effects
        const colorElements = document.querySelectorAll('[data-scroll-color]')
        colorElements.forEach(el => {
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const hue = progress * 360
          el.style.filter = `hue-rotate(${hue}deg)`
        })

        // 3D Transform Effects
        const transform3DElements = document.querySelectorAll('[data-scroll-3d]')
        transform3DElements.forEach(el => {
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const rotateX = progress * 45
          const rotateY = progress * 45
          const translateZ = progress * 100
          el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`
        })

        // Morphing Effects
        const morphElements = document.querySelectorAll('[data-scroll-morph]')
        morphElements.forEach(el => {
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const borderRadius = progress * 50
          const scaleX = 1 + progress * 0.2
          const scaleY = 1 - progress * 0.1
          el.style.borderRadius = `${borderRadius}%`
          el.style.transform = `scale(${scaleX}, ${scaleY})`
        })

        // Glitch Effects
        const glitchElements = document.querySelectorAll('[data-scroll-glitch]')
        glitchElements.forEach(el => {
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          if (progress > 0.5) {
            const glitchIntensity = (progress - 0.5) * 20
            el.style.transform = `translateX(${Math.sin(Date.now() * 0.01) * glitchIntensity}px)`
            el.style.filter = `hue-rotate(${Math.sin(Date.now() * 0.005) * 30}deg)`
          }
        })

        // Wave Effects
        const waveElements = document.querySelectorAll('[data-scroll-wave]')
        waveElements.forEach((el, index) => {
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const waveOffset = index * 0.2
          const waveAmplitude = 20
          const waveFrequency = 0.02
          const y = Math.sin((scroll.y + waveOffset) * waveFrequency) * waveAmplitude
          el.style.transform = `translateY(${y}px)`
        })

        // Particle Effects
        const particleElements = document.querySelectorAll('[data-scroll-particles]')
        particleElements.forEach(el => {
          const progress = Math.min(scroll.y / window.innerHeight, 1)
          const particleCount = Math.floor(progress * 20)
          el.style.setProperty('--particle-count', particleCount)
        })

        // Emit enhanced scroll event
        document.dispatchEvent(new CustomEvent('locomotive-scroll', {
          detail: {
            scroll: scroll,
            direction: locomotiveScroll.direction,
            speed: locomotiveScroll.speed,
            progress: scroll.y / (document.body.scrollHeight - window.innerHeight)
          }
        }))
      }, 16) // ~60fps
    })

    // Enhanced mouse wheel handling with momentum
    let wheelVelocity = 0
    let lastWheelTime = 0
    let isMouseWheelScrolling = false

    scrollContainer.addEventListener('wheel', (e) => {
      e.preventDefault()
      isMouseWheelScrolling = true
      
      const currentTime = Date.now()
      const deltaTime = currentTime - lastWheelTime
      const delta = e.deltaY * 0.3 // Reduced for smoother control
      
      // Calculate velocity for momentum
      if (deltaTime > 0) {
        wheelVelocity = delta / deltaTime
      }
      
      const currentScroll = locomotiveScroll.scroll.instance.scroll.y || 0
      
      // Apply smooth scroll with momentum
      locomotiveScroll.scrollTo(currentScroll + delta, {
        duration: 0,
        disableLerp: false
      })
      
      lastWheelTime = currentTime
      
      // Reset flag after delay
      setTimeout(() => {
        isMouseWheelScrolling = false
        wheelVelocity = 0
      }, 150)
    }, { passive: false })

    // Enhanced touch handling with improved momentum
    let touchStartY = 0
    let touchCurrentY = 0
    let touchVelocity = 0
    let lastTouchTime = 0
    let touchMomentum = null

    scrollContainer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY
      touchCurrentY = touchStartY
      lastTouchTime = Date.now()
      touchVelocity = 0
      
      // Clear any existing momentum
      if (touchMomentum) {
        clearTimeout(touchMomentum)
        touchMomentum = null
      }
    }, { passive: true })

    scrollContainer.addEventListener('touchmove', (e) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTouchTime
      const newY = e.touches[0].clientY
      const deltaY = newY - touchCurrentY
      
      if (deltaTime > 0) {
        touchVelocity = deltaY / deltaTime
      }
      
      touchCurrentY = newY
      lastTouchTime = currentTime
    }, { passive: true })

    scrollContainer.addEventListener('touchend', (e) => {
      // Apply enhanced momentum based on touch velocity
      if (Math.abs(touchVelocity) > 0.05) {
        const momentum = touchVelocity * 300 // Increased momentum
        const currentScroll = locomotiveScroll.scroll.instance.scroll.y || 0
        
        locomotiveScroll.scrollTo(currentScroll - momentum, {
          duration: Math.abs(momentum) * 3,
          easing: [0.25, 0.46, 0.45, 0.94]
        })
      }
    }, { passive: true })

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        const currentScroll = locomotiveScroll.scroll.instance.scroll.y || 0
        locomotiveScroll.scrollTo(currentScroll + window.innerHeight * 0.8, {
          duration: 1000,
          easing: [0.25, 0.46, 0.45, 0.94]
        })
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        const currentScroll = locomotiveScroll.scroll.instance.scroll.y || 0
        locomotiveScroll.scrollTo(currentScroll - window.innerHeight * 0.8, {
          duration: 1000,
          easing: [0.25, 0.46, 0.45, 0.94]
        })
      } else if (e.key === 'Home') {
        e.preventDefault()
        locomotiveScroll.scrollTo(0, { duration: 1200 })
      } else if (e.key === 'End') {
        e.preventDefault()
        const maxScroll = document.body.scrollHeight - window.innerHeight
        locomotiveScroll.scrollTo(maxScroll, { duration: 1200 })
      }
    })

    // Refresh when the page is fully loaded
    window.addEventListener('load', () => {
      locomotiveScroll.update()
    })

    // Handle resize events
    let resizeTimeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        locomotiveScroll.update()
      }, 250)
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
            duration: 1200,
            easing: [0.25, 0.46, 0.45, 0.94],
            disableLerp: false,
            ...options
          })
        }
      },
      scrollToTop: () => {
        if (locomotiveScroll) {
          locomotiveScroll.scrollTo(0, { 
            duration: 1500,
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
          locomotiveScroll.options.multiplier = speed
          locomotiveScroll.options.touchMultiplier = speed * 3.0
          locomotiveScroll.update()
        }
      },
      setSmoothness: (lerp) => {
        if (locomotiveScroll && lerp >= 0.01 && lerp <= 0.2) {
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
      },
      // Enhanced methods for advanced UI animations
      addParallaxEffect: (element, speed = 0.5) => {
        if (element) {
          element.setAttribute('data-scroll-speed', speed)
        }
      },
      addScaleEffect: (element, scale = 1.2) => {
        if (element) {
          element.setAttribute('data-scroll-scale', scale)
        }
      },
      addRotationEffect: (element, rotation = 360) => {
        if (element) {
          element.setAttribute('data-scroll-rotate', rotation)
        }
      },
      addSkewEffect: (element, skew = 10) => {
        if (element) {
          element.setAttribute('data-scroll-skew', skew)
        }
      },
      addBlurEffect: (element, blur = 10) => {
        if (element) {
          element.setAttribute('data-scroll-blur', blur)
        }
      },
      addOpacityEffect: (element, opacity = 0.3) => {
        if (element) {
          element.setAttribute('data-scroll-opacity', opacity)
        }
      },
      addColorShiftEffect: (element) => {
        if (element) {
          element.setAttribute('data-scroll-color', 'true')
        }
      },
      add3DTransformEffect: (element) => {
        if (element) {
          element.setAttribute('data-scroll-3d', 'true')
        }
      },
      addMorphingEffect: (element) => {
        if (element) {
          element.setAttribute('data-scroll-morph', 'true')
        }
      },
      addGlitchEffect: (element) => {
        if (element) {
          element.setAttribute('data-scroll-glitch', 'true')
        }
      },
      addWaveEffect: (element) => {
        if (element) {
          element.setAttribute('data-scroll-wave', 'true')
        }
      },
      addParticleEffect: (element) => {
        if (element) {
          element.setAttribute('data-scroll-particles', 'true')
        }
      },
      scrollToElement: (element, offset = 0) => {
        if (locomotiveScroll && element) {
          const rect = element.getBoundingClientRect()
          const scrollTop = locomotiveScroll.scroll.instance.scroll.y
          const targetScroll = scrollTop + rect.top + offset
          
          locomotiveScroll.scrollTo(targetScroll, {
            duration: 1000,
            easing: [0.25, 0.46, 0.45, 0.94]
          })
        }
      }
    }
  }
})
