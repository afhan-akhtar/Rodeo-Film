import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default defineNuxtPlugin(() => {
  // Create global Lenis instance for the app
  let lenis = null

  const initLenis = () => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
      syncTouch: true,
      touchInertiaMultiplier: 35,
      wheelMultiplier: 1,
    })

    // Start the animation loop
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return lenis
  }

  // Initialize on client-side
  if (process.client) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLenis)
    } else {
      initLenis()
    }
  }

  return {
    provide: {
      lenis: () => lenis,
      initLenis,
      scrollTo: (target, options = {}) => {
        if (lenis) {
          lenis.scrollTo(target, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            ...options
          })
        }
      },
      scrollToTop: () => {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.5 })
        }
      }
    }
  }
})