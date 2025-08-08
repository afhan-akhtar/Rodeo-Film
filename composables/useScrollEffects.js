export const useScrollEffects = () => {
  const { $locomotiveScroll } = useNuxtApp()
  
  // Scroll to element with smooth animation
  const scrollToElement = (element, offset = 0) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.scrollToElement(element, offset)
      } else {
        // Fallback for regular scroll
        const rect = element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetScroll = scrollTop + rect.top + offset
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        })
      }
    }
  }

  // Add parallax effect to element
  const addParallaxEffect = (element, speed = 0.5) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addParallaxEffect(element, speed)
      } else {
        element.setAttribute('data-scroll-speed', speed)
      }
    }
  }

  // Add scale effect to element
  const addScaleEffect = (element, scale = 1.2) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addScaleEffect(element, scale)
      } else {
        element.setAttribute('data-scroll-scale', scale)
      }
    }
  }

  // Add rotation effect to element
  const addRotationEffect = (element, rotation = 360) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addRotationEffect(element, rotation)
      } else {
        element.setAttribute('data-scroll-rotate', rotation)
      }
    }
  }

  // Add skew effect to element
  const addSkewEffect = (element, skew = 10) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addSkewEffect(element, skew)
      } else {
        element.setAttribute('data-scroll-skew', skew)
      }
    }
  }

  // Add blur effect to element
  const addBlurEffect = (element, blur = 10) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addBlurEffect(element, blur)
      } else {
        element.setAttribute('data-scroll-blur', blur)
      }
    }
  }

  // Add opacity effect to element
  const addOpacityEffect = (element, opacity = 0.3) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addOpacityEffect(element, opacity)
      } else {
        element.setAttribute('data-scroll-opacity', opacity)
      }
    }
  }

  // Add color shift effect to element
  const addColorShiftEffect = (element) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addColorShiftEffect(element)
      } else {
        element.setAttribute('data-scroll-color', 'true')
      }
    }
  }

  // Add 3D transform effect to element
  const add3DTransformEffect = (element) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.add3DTransformEffect(element)
      } else {
        element.setAttribute('data-scroll-3d', 'true')
      }
    }
  }

  // Add morphing effect to element
  const addMorphingEffect = (element) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addMorphingEffect(element)
      } else {
        element.setAttribute('data-scroll-morph', 'true')
      }
    }
  }

  // Add glitch effect to element
  const addGlitchEffect = (element) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addGlitchEffect(element)
      } else {
        element.setAttribute('data-scroll-glitch', 'true')
      }
    }
  }

  // Add wave effect to element
  const addWaveEffect = (element) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addWaveEffect(element)
      } else {
        element.setAttribute('data-scroll-wave', 'true')
      }
    }
  }

  // Add particle effect to element
  const addParticleEffect = (element) => {
    if (process.client && element) {
      if ($locomotiveScroll) {
        $locomotiveScroll.addParticleEffect(element)
      } else {
        element.setAttribute('data-scroll-particles', 'true')
      }
    }
  }

  // Scroll to top with smooth animation
  const scrollToTop = () => {
    if (process.client) {
      if ($locomotiveScroll) {
        $locomotiveScroll.scrollToTop()
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }
  }

  // Set scroll speed
  const setScrollSpeed = (speed) => {
    if (process.client && $locomotiveScroll) {
      $locomotiveScroll.setScrollSpeed(speed)
    }
  }

  // Set smoothness (lerp value)
  const setSmoothness = (lerp) => {
    if (process.client && $locomotiveScroll) {
      $locomotiveScroll.setSmoothness(lerp)
    }
  }

  // Pause scroll
  const pauseScroll = () => {
    if (process.client && $locomotiveScroll) {
      $locomotiveScroll.pauseScroll()
    }
  }

  // Resume scroll
  const resumeScroll = () => {
    if (process.client && $locomotiveScroll) {
      $locomotiveScroll.resumeScroll()
    }
  }

  // Add reveal animation to element
  const addRevealAnimation = (element, type = 'fade-up', delay = 0) => {
    if (process.client && element) {
      const classes = {
        'fade-up': 'reveal-fade-up',
        'fade-left': 'reveal-fade-left',
        'fade-right': 'reveal-fade-right',
        'scale': 'reveal-scale'
      }
      
      const className = classes[type] || 'reveal-fade-up'
      element.classList.add(className)
      
      if (delay > 0) {
        element.style.transitionDelay = `${delay}s`
      }

      // Create intersection observer for reveal
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      })

      observer.observe(element)
    }
  }

  // Add stagger animation to multiple elements
  const addStaggerAnimation = (elements, type = 'fade-up', staggerDelay = 0.1) => {
    if (process.client && elements.length > 0) {
      elements.forEach((element, index) => {
        addRevealAnimation(element, type, index * staggerDelay)
      })
    }
  }

  // Add magnetic effect to element
  const addMagneticEffect = (element, strength = 0.3) => {
    if (process.client && element) {
      element.classList.add('magnetic-element')
      
      const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const deltaX = (e.clientX - centerX) * strength
        const deltaY = (e.clientY - centerY) * strength
        
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      }

      const handleMouseLeave = () => {
        element.style.transform = 'translate(0px, 0px)'
      }

      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseleave', handleMouseLeave)

      // Cleanup function
      return () => {
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }

  // Add floating animation
  const addFloatingAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('float-animation')
    }
  }

  // Add glow effect
  const addGlowEffect = (element) => {
    if (process.client && element) {
      element.classList.add('glow-effect')
    }
  }

  // Add hover lift effect
  const addHoverLiftEffect = (element) => {
    if (process.client && element) {
      element.classList.add('hover-lift')
    }
  }

  // Add morphing animation
  const addMorphingAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('morph-animation')
    }
  }

  // Add color shift animation
  const addColorShiftAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('color-shift-animation')
    }
  }

  // Add 3D flip animation
  const add3DFlipAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('flip-3d')
    }
  }

  // Add pulse animation
  const addPulseAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('pulse-animation')
    }
  }

  // Add bounce animation
  const addBounceAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('bounce-animation')
    }
  }

  // Add shake animation
  const addShakeAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('shake-animation')
    }
  }

  // Add rotate animation
  const addRotateAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('rotate-animation')
    }
  }

  // Add zoom animation
  const addZoomAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('zoom-animation')
    }
  }

  // Get scroll progress
  const getScrollProgress = () => {
    if (process.client) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      return scrollHeight > 0 ? scrollTop / scrollHeight : 0
    }
    return 0
  }

  // Watch scroll progress
  const watchScrollProgress = (callback) => {
    if (process.client) {
      const handleScroll = () => {
        const progress = getScrollProgress()
        callback(progress)
      }

      window.addEventListener('scroll', handleScroll)
      document.addEventListener('locomotive-scroll', (event) => {
        callback(event.detail.progress)
      })

      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }

  // Add enhanced card effect
  const addEnhancedCardEffect = (element) => {
    if (process.client && element) {
      element.classList.add('enhanced-card')
    }
  }

  // Add gradient text animation
  const addGradientTextAnimation = (element) => {
    if (process.client && element) {
      element.classList.add('gradient-text-animated')
    }
  }

  // Add glitch element class
  const addGlitchElement = (element) => {
    if (process.client && element) {
      element.classList.add('glitch-element')
    }
  }

  // Add wave element class
  const addWaveElement = (element) => {
    if (process.client && element) {
      element.classList.add('wave-element')
    }
  }

  // Add particle element class
  const addParticleElement = (element) => {
    if (process.client && element) {
      element.classList.add('particle-element')
    }
  }

  return {
    scrollToElement,
    addParallaxEffect,
    addScaleEffect,
    addRotationEffect,
    addSkewEffect,
    addBlurEffect,
    addOpacityEffect,
    addColorShiftEffect,
    add3DTransformEffect,
    addMorphingEffect,
    addGlitchEffect,
    addWaveEffect,
    addParticleEffect,
    scrollToTop,
    setScrollSpeed,
    setSmoothness,
    pauseScroll,
    resumeScroll,
    addRevealAnimation,
    addStaggerAnimation,
    addMagneticEffect,
    addFloatingAnimation,
    addGlowEffect,
    addHoverLiftEffect,
    addMorphingAnimation,
    addColorShiftAnimation,
    add3DFlipAnimation,
    addPulseAnimation,
    addBounceAnimation,
    addShakeAnimation,
    addRotateAnimation,
    addZoomAnimation,
    getScrollProgress,
    watchScrollProgress,
    addEnhancedCardEffect,
    addGradientTextAnimation,
    addGlitchElement,
    addWaveElement,
    addParticleElement
  }
}
