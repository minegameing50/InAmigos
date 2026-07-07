/**
 * InAmigos Foundation - Landing Page JavaScript
 * Fix: Animations now trigger reliably for all elements,
 *      including those already visible on page load.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. Preloader
    // ==========================================================================
    const preloader = document.getElementById('preloader');
    function hidePreloader() {
        if (!preloader) return;
        preloader.classList.add('fade-out');
        setTimeout(() => {
            if (preloader.parentNode) preloader.remove();
            // After preloader hides, trigger visible-on-load animations
            triggerInViewAnimations();
        }, 600);
    }
    // Use both load and a timeout fallback so preloader always dismisses
    window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 3500);

    // ==========================================================================
    // 2. Sticky Header + Back-to-Top + Active Nav
    // ==========================================================================
    const header = document.getElementById('siteHeader');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function onScroll() {
        const sy = window.scrollY;

        // Sticky header
        if (header) {
            header.classList.toggle('scrolled', sy > 60);
        }

        // Back to top
        if (backToTop) {
            backToTop.classList.toggle('visible', sy > 400);
        }

        // Active nav link
        let current = '';
        sections.forEach(sec => {
            if (sy + 140 >= sec.offsetTop) current = sec.id;
        });
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${current}`);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ==========================================================================
    // 3. Mobile Navigation
    // ==========================================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openMobileNav() {
        if (!mobileToggle || !navMenu) return;
        mobileToggle.classList.add('active');
        navMenu.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileNav() {
        if (!mobileToggle || !navMenu) return;
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    mobileToggle?.addEventListener('click', () => {
        navMenu?.classList.contains('active') ? closeMobileNav() : openMobileNav();
    });
    mobileOverlay?.addEventListener('click', closeMobileNav);
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMobileNav(); closeLightbox(); closeModal(); } });

    // ==========================================================================
    // 4. Hero Background Slideshow
    // ==========================================================================
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDotsCtr = document.getElementById('heroDots');
    let activeHeroSlide = 0;
    let heroTimer;

    if (heroSlides.length > 1 && heroDotsCtr) {
        heroSlides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => { gotoHeroSlide(i); restartHeroTimer(); });
            heroDotsCtr.appendChild(dot);
        });

        const heroDotEls = heroDotsCtr.querySelectorAll('.hero-dot');

        function gotoHeroSlide(idx) {
            heroSlides[activeHeroSlide].classList.remove('active');
            heroDotEls[activeHeroSlide].classList.remove('active');
            activeHeroSlide = (idx + heroSlides.length) % heroSlides.length;
            heroSlides[activeHeroSlide].classList.add('active');
            heroDotEls[activeHeroSlide].classList.add('active');
        }

        function startHeroTimer() {
            heroTimer = setInterval(() => gotoHeroSlide(activeHeroSlide + 1), 5000);
        }
        function restartHeroTimer() { clearInterval(heroTimer); startHeroTimer(); }
        startHeroTimer();
    }

    // ==========================================================================
    // 5. Typing Effect
    // ==========================================================================
    const typingEl = document.getElementById('typing-text');
    if (typingEl) {
        const words = ['Together', 'For Change', 'With Purpose', 'With Compassion', 'For India'];
        let wi = 0, ci = 0, deleting = false;

        function typeLoop() {
            const word = words[wi];
            typingEl.textContent = deleting
                ? word.substring(0, ci - 1)
                : word.substring(0, ci + 1);

            if (!deleting) {
                ci++;
                if (ci > word.length) {
                    deleting = true;
                    setTimeout(typeLoop, 1800);
                    return;
                }
            } else {
                ci--;
                if (ci < 0) {
                    deleting = false;
                    ci = 0;
                    wi = (wi + 1) % words.length;
                    setTimeout(typeLoop, 500);
                    return;
                }
            }
            setTimeout(typeLoop, deleting ? 55 : 110);
        }
        // Start typing after preloader (~1.5s)
        setTimeout(typeLoop, 1500);
    }

    // ==========================================================================
    // 6. ANIMATIONS — Fade-Up with Intersection Observer
    //    KEY FIX: Use rootMargin: '0px' so elements visible on load also animate.
    //    Elements in the hero section get staggered CSS delays instead.
    // ==========================================================================
    function setupFadeObserver() {
        const fadeEls = document.querySelectorAll('.fade-up');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Small delay per-element using its position in the NodeList
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,       // trigger as soon as 5% visible
            rootMargin: '0px'      // no negative margin — catches viewport items too
        });

        fadeEls.forEach((el, i) => {
            // Give each .fade-up a tiny sequential transition delay (max 0.4s stagger)
            const delay = Math.min(i * 0.08, 0.4);
            el.style.transitionDelay = `${delay}s`;
            observer.observe(el);
        });
    }

    // Trigger any .fade-up elements that are already in the viewport right now
    function triggerInViewAnimations() {
        const fadeEls = document.querySelectorAll('.fade-up:not(.visible)');
        const vph = window.innerHeight;
        fadeEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vph && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }

    setupFadeObserver();
    // Also check immediately at start (for above-fold elements)
    setTimeout(triggerInViewAnimations, 100);

    // ==========================================================================
    // 7. Animated Counters
    //    Both hero .stat-number[data-target] and impact .counter[data-target]
    // ==========================================================================
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        const duration = 2000;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('en-IN');

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString('en-IN');
            }
        }
        requestAnimationFrame(step);
    }

    const counterEls = document.querySelectorAll('[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3, rootMargin: '0px' });

    counterEls.forEach(el => counterObserver.observe(el));

    // ==========================================================================
    // 8. Gallery Lightbox
    // ==========================================================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    let activeGalleryIdx = 0;

    const galleryData = Array.from(galleryItems).map(item => ({
        src: item.querySelector('img')?.src || '',
        alt: item.querySelector('img')?.alt || '',
        title: item.getAttribute('data-title') || ''
    }));

    function showLightbox(idx) {
        if (!lightbox || galleryData.length === 0) return;
        activeGalleryIdx = ((idx % galleryData.length) + galleryData.length) % galleryData.length;
        const d = galleryData[activeGalleryIdx];
        lightboxImg.src = d.src;
        lightboxImg.alt = d.alt;
        lightboxCaption.textContent = d.title;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox?.classList.remove('active');
        document.body.style.overflow = '';
    }

    galleryItems.forEach((item, i) => item.addEventListener('click', () => showLightbox(i)));
    document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev')?.addEventListener('click', e => { e.stopPropagation(); showLightbox(activeGalleryIdx - 1); });
    document.querySelector('.lightbox-next')?.addEventListener('click', e => { e.stopPropagation(); showLightbox(activeGalleryIdx + 1); });
    lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', e => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') showLightbox(activeGalleryIdx - 1);
        if (e.key === 'ArrowRight') showLightbox(activeGalleryIdx + 1);
    });

    // ==========================================================================
    // 9. Project Modals
    // ==========================================================================
    const modalContainer = document.getElementById('modal-container');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal || !modalContainer) return;
        modalContainer.querySelectorAll('.modal').forEach(m => (m.style.display = 'none'));
        modal.style.display = 'block';
        modalContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        modalContainer?.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.open-modal').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.getAttribute('data-modal')));
    });
    modalContainer?.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer?.addEventListener('click', e => { if (e.target === modalContainer) closeModal(); });

    // ==========================================================================
    // 10. Testimonials Slider (auto-play)
    // ==========================================================================
    const sliderTrack = document.getElementById('testimonialsTrack');
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const sliderDotsEl = document.getElementById('sliderDots');
    let activeSlide = 0, sliderTimer2;

    if (sliderTrack && testimonialSlides.length > 0 && sliderDotsEl) {
        testimonialSlides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
            dot.addEventListener('click', () => { gotoSlide(i); resetSlider(); });
            sliderDotsEl.appendChild(dot);
        });
        const dotEls = sliderDotsEl.querySelectorAll('.slider-dot');

        function gotoSlide(idx) {
            activeSlide = ((idx % testimonialSlides.length) + testimonialSlides.length) % testimonialSlides.length;
            sliderTrack.style.transform = `translateX(-${activeSlide * 100}%)`;
            dotEls.forEach((d, i) => d.classList.toggle('active', i === activeSlide));
        }
        function startSlider() { sliderTimer2 = setInterval(() => gotoSlide(activeSlide + 1), 5500); }
        function resetSlider() { clearInterval(sliderTimer2); startSlider(); }

        document.getElementById('prevBtn')?.addEventListener('click', () => { gotoSlide(activeSlide - 1); resetSlider(); });
        document.getElementById('nextBtn')?.addEventListener('click', () => { gotoSlide(activeSlide + 1); resetSlider(); });
        startSlider();
    }

    // ==========================================================================
    // 11. Hero stat card hover parallax (subtle tilt on mouse move)
    // ==========================================================================
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ==========================================================================
    // 12. Smooth section scroll for anchor links
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = header ? header.offsetHeight : 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ==========================================================================
    // 13. Number formatting helper — re-check counters on page visibility change
    // ==========================================================================
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) triggerInViewAnimations();
    });

});
