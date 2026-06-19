import {ref} from 'vue'

export function useHomeScroll() {
    const navScrolled = ref(false)
    const showBackToTop = ref(false)
    const heroOpacity = ref(1)

    let ticking = false

    function scrollToTop() {
        window.scrollTo({top: 0, behavior: 'smooth'})
    }

    function onScroll() {
        if (ticking) {
            return
        }

        ticking = true
        window.requestAnimationFrame(() => {
            const scrolled = window.scrollY
            const viewportHeight = window.innerHeight

            navScrolled.value = scrolled > 80
            showBackToTop.value = scrolled > viewportHeight * 0.6

            if (scrolled < viewportHeight) {
                heroOpacity.value = 1 - (scrolled / viewportHeight) * 0.5
            } else if (heroOpacity.value !== 0.5) {
                heroOpacity.value = 0.5
            }

            ticking = false
        })
    }

    return {
        navScrolled,
        showBackToTop,
        heroOpacity,
        scrollToTop,
        onScroll,
    }
}
