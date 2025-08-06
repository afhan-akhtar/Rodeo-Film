import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)
  
  // Configure GSAP defaults
  gsap.defaults({
    duration: 0.6,
    ease: "power2.out"
  })
  
  // Configure ScrollTrigger defaults
  ScrollTrigger.defaults({
    scroller: "body"
  })
  
  // Make GSAP available globally
  return {
    provide: {
      gsap,
      ScrollTrigger
    }
  }
})