document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            // Close all other accordion items
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.classList.remove('active');
                h.nextElementSibling.style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Smooth Scroll for anchor links (polyfill for older browsers if needed, but CSS scroll-behavior usually handles it)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // Gallery Carousel Logic (Infinite Scroll)
    const carousel = document.querySelector('.gallery-carousel');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');

    if (carousel && prevBtn && nextBtn) {
        const items = Array.from(carousel.children);
        const itemWidth = items[0].offsetWidth;
        const gap = parseInt(getComputedStyle(carousel).gap) || 0;
        const totalItemWidth = itemWidth + gap;

        // Clone items for infinite loop
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-end');
            carousel.appendChild(clone);
        });

        items.slice().reverse().forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-start');
            carousel.prepend(clone);
        });

        // Set initial scroll position to the first original item
        const startScrollPos = items.length * totalItemWidth;
        carousel.scrollLeft = startScrollPos;

        let isScrolling = false;

        // Handle Scroll Loop
        carousel.addEventListener('scroll', () => {
            if (isScrolling) return;

            const maxScroll = carousel.scrollWidth - carousel.clientWidth;

            // If scrolled to the start (clone-start area), jump to original end
            if (carousel.scrollLeft <= 0) {
                isScrolling = true;
                carousel.scrollLeft = items.length * totalItemWidth;
                setTimeout(() => isScrolling = false, 0);
            }
            // If scrolled to the end (clone-end area), jump to original start
            else if (carousel.scrollLeft >= maxScroll - 5) { // -5 buffer
                isScrolling = true;
                carousel.scrollLeft = items.length * totalItemWidth;
                setTimeout(() => isScrolling = false, 0);
            }
        });

        // Navigation Buttons
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: -totalItemWidth,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: totalItemWidth,
                behavior: 'smooth'
            });
        });

        // Auto Scroll Logic
        let autoScrollInterval;
        const startAutoScroll = () => {
            stopAutoScroll(); // Clear existing to be safe
            autoScrollInterval = setInterval(() => {
                nextBtn.click();
            }, 4000);
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        // Start auto-scroll
        startAutoScroll();

        // Pause on interaction (hover or touch)
        const galleryContainer = document.querySelector('.gallery-container');
        if (galleryContainer) {
            galleryContainer.addEventListener('mouseenter', stopAutoScroll);
            galleryContainer.addEventListener('mouseleave', startAutoScroll);
            galleryContainer.addEventListener('touchstart', stopAutoScroll);
            galleryContainer.addEventListener('touchend', startAutoScroll);
        }
    }
});
