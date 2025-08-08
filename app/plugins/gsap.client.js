import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)
  
  // Configure GSAP defaults
  gsap.defaults({
    duration: 0.8,
    ease: "power2.out"
  })
  
  // Configure ScrollTrigger to work with Locomotive Scroll
  ScrollTrigger.defaults({
    scroller: '[data-scroll-container]'
  })
  
  // Setup GSAP animations for fade-in effects
  const setupFadeInAnimations = () => {
    // Fade in animation for elements with data-scroll attribute
    gsap.set('[data-scroll]', { 
      opacity: 0, 
      y: 100,
      scale: 0.95
    })
    
    // Create scroll-triggered animations
    gsap.utils.toArray('[data-scroll]').forEach((element) => {
      const animationType = element.getAttribute('data-scroll-class') || 'fade-in'
      const delay = element.getAttribute('data-scroll-delay') || 0
      const speed = element.getAttribute('data-scroll-speed') || 1
      
      let animation = {}
      
      switch (animationType) {
        case 'fade-in':
          animation = {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out"
          }
          break
        case 'slide-up':
          animation = {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
          }
          break
        case 'scale-in':
          animation = {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)"
          }
          break
        case 'fade-in-left':
          gsap.set(element, { opacity: 0, x: -100 })
          animation = {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out"
          }
          break
        case 'fade-in-right':
          gsap.set(element, { opacity: 0, x: 100 })
          animation = {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out"
          }
          break
        default:
          animation = {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out"
          }
      }
      
      ScrollTrigger.create({
        trigger: element,
        start: "top 90%", // Earlier trigger for smoother entry
        end: "bottom 10%",
        scroller: '[data-scroll-container]',
        refreshPriority: -1, // Lower priority for smoother performance
        onEnter: () => {
          gsap.to(element, {
            ...animation,
            delay: parseFloat(delay),
            overwrite: true // Prevent conflicting animations
          })
        },
        onLeave: () => {
          // Optional: fade out when leaving viewport
          if (element.hasAttribute('data-scroll-repeat')) {
            gsap.to(element, {
              opacity: 0,
              y: -30, // Reduced movement for smoother exit
              duration: 0.3, // Faster exit
              ease: "power1.in",
              overwrite: true
            })
          }
        },
        onEnterBack: () => {
          if (element.hasAttribute('data-scroll-repeat')) {
            gsap.to(element, {
              ...animation,
              delay: parseFloat(delay) * 0.3, // Faster re-entry
              overwrite: true
            })
          }
        }
      })
    })
  }
  
  // Initialize animations when Locomotive Scroll is ready
  if (process.client) {
    // Listen for locomotive scroll initialization
    document.addEventListener('locomotive-scroll-ready', () => {
      setupFadeInAnimations()
    })
    
    // Fallback initialization after a delay
    setTimeout(setupFadeInAnimations, 1000)
  }
  
  // Make GSAP available globally
  return {
    provide: {
      gsap,
      ScrollTrigger,
      setupFadeInAnimations
    }
  }
})