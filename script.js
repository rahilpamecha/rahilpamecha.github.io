/**
 * ====================================================================
 * Rahil Pamecha - Interactive Portfolio Script
 * ====================================================================
 * Modern, accessible, vanilla JavaScript for interactive UI components:
 * particle canvas system, typewriter, 3D tilt, magnetic cursor,
 * animated counters, mouse glow cards, and responsive navigation.
 * ====================================================================
 */

'use strict';

/* ====================================================================
 * 1. Particle System (Canvas)
 * Visual ambient particle and constellation network with mouse repel
 * ==================================================================== */
class ParticleSystem {
    constructor(canvas, reducedMotion = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reducedMotion = reducedMotion;
        this.particles = [];
        this.animationFrameId = null;
        this.mouse = { x: -1000, y: -1000, radius: 120 };
        this.colors = ['rgba(59,130,246,', 'rgba(139,92,246,', 'rgba(34,211,238,'];
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            if (this.reducedMotion) this.drawParticleField();
        }, { passive: true });

        if (!this.reducedMotion) {
            window.addEventListener('mousemove', (e) => this.handleMouse(e), { passive: true });
            window.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            }, { passive: true });
            this.animate();
        } else {
            this.drawParticleField();
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const count = Math.min(80, Math.floor(window.innerWidth / 15));
        this.particles = [];

        for (let i = 0; i < count; i++) {
            const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            const opacity = 0.1 + Math.random() * 0.4; // 0.1 - 0.5
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0.5 + Math.random() * 1.5,       // 0.5 - 2px
                vx: (Math.random() - 0.5) * 0.6,          // -0.3 to 0.3
                vy: (Math.random() - 0.5) * 0.6,          // -0.3 to 0.3
                color: `${baseColor}${opacity.toFixed(2)})`
            });
        }
    }

    handleMouse(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
    }

    drawConnections() {
        const maxDist = 100;
        const len = this.particles.length;

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.08;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(59,130,246,${alpha.toFixed(4)})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.stroke();
                }
            }
        }
    }

    update() {
        const repelRadius = this.mouse.radius;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Bounce on canvas boundaries
            if (p.x < 0) { p.x = 0; p.vx *= -1; }
            else if (p.x > this.canvas.width) { p.x = this.canvas.width; p.vx *= -1; }
            if (p.y < 0) { p.y = 0; p.vy *= -1; }
            else if (p.y > this.canvas.height) { p.y = this.canvas.height; p.vy *= -1; }

            // Mouse repel physics
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < repelRadius && dist > 0) {
                const force = (repelRadius - dist) / repelRadius;
                const angle = Math.atan2(dy, dx);
                p.x += Math.cos(angle) * force * 2.5;
                p.y += Math.sin(angle) * force * 2.5;
            }
        }
    }

    drawParticleField() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawConnections();
        for (let i = 0; i < this.particles.length; i++) {
            this.drawParticle(this.particles[i]);
        }
    }

    animate() {
        this.update();
        this.drawParticleField();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

function initParticles(prefersReducedMotion) {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    new ParticleSystem(canvas, prefersReducedMotion);
}

/* ====================================================================
 * 2. Typewriter Effect
 * Cycles through hero titles: Software Engineer, Problem Solver, etc.
 * ==================================================================== */
function initTypewriter(prefersReducedMotion) {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const strings = ['Software Engineer', 'Problem Solver', 'Tech Enthusiast', 'Full-Stack Developer'];
    if (prefersReducedMotion) {
        el.textContent = strings[0];
        return;
    }

    let stringIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function tick() {
        const currentStr = strings[stringIdx];
        charIdx += isDeleting ? -1 : 1;
        el.textContent = currentStr.substring(0, charIdx);

        let delay = isDeleting ? 40 : 80; // 40ms delete, 80ms type

        if (!isDeleting && charIdx === currentStr.length) {
            delay = 2000; // 2000ms pause at full string
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            stringIdx = (stringIdx + 1) % strings.length;
            delay = 500;  // 500ms pause between strings
        }

        setTimeout(tick, delay);
    }

    tick();
}

/* ====================================================================
 * 3. 3D Tilt Cards
 * Calculates 3D perspective rotation on cursor move (max ±5 degrees)
 * ==================================================================== */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.15s ease-out';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (((centerY - (e.clientY - rect.top)) / centerY) * 5).toFixed(2);
            const rotateY = ((((e.clientX - rect.left) - centerX) / centerX) * 5).toFixed(2);
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.4s ease-out';
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
            setTimeout(() => { card.style.transition = 'transform 0.15s ease-out'; }, 400);
        });
    });
}

/* ====================================================================
 * 4. Magnetic Cursor
 * Subtle cursor attraction for interactive elements (max ±15px)
 * ==================================================================== */
function initMagneticCursor() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const elements = document.querySelectorAll('.magnetic');
    elements.forEach(el => {
        el.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const moveX = Math.max(-15, Math.min(15, (e.clientX - centerX) * 0.3));
            const moveY = Math.max(-15, Math.min(15, (e.clientY - centerY) * 0.3));
            el.style.transform = `translate(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            el.style.transform = 'translate(0px, 0px)';
            setTimeout(() => { el.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'; }, 400);
        });
    });
}

/* ====================================================================
 * 5. Counter Animation
 * Animates numbers from 0 to data-target over 2 seconds with easing
 * ==================================================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const easeOutQuad = (t) => t * (2 - t);
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            obs.unobserve(el);

            const targetVal = parseInt(el.dataset.target, 10);
            if (isNaN(targetVal)) return;

            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            let startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const current = Math.floor(easeOutQuad(progress) * targetVal);

                if (progress < 1) {
                    el.textContent = `${current}`;
                    requestAnimationFrame(step);
                } else {
                    el.textContent = `${targetVal}${suffix}`;
                }
            }

            requestAnimationFrame(step);
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

/* ====================================================================
 * 6. Mouse Glow Cards
 * Sets --glow-x and --glow-y for radial gradient following cursor
 * ==================================================================== */
function initGlowCards() {
    const cards = document.querySelectorAll('.glow-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
        });
    });
}

/* ====================================================================
 * 7. Mobile Navigation
 * Hamburger toggle with aria-expanded and link click auto-close
 * ==================================================================== */
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (!hamburgerBtn || !navLinks) return;

    function toggleMenu(isOpen) {
        const active = isOpen !== undefined ? isOpen : !navLinks.classList.contains('active');
        hamburgerBtn.classList.toggle('active', active);
        navLinks.classList.toggle('active', active);
        hamburgerBtn.setAttribute('aria-expanded', active ? 'true' : 'false');
    }

    hamburgerBtn.addEventListener('click', () => toggleMenu());

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) toggleMenu(false);
        });
    });

    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            toggleMenu(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu(false);
            hamburgerBtn.focus();
        }
    });
}

/* ====================================================================
 * 8. Navbar Scroll State
 * Adds .nav-scrolled to #navbar when scrolled > 50px (rAF throttled)
 * ==================================================================== */
function initNavScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let isTicking = false;
    function checkScroll() {
        navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
        isTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            requestAnimationFrame(checkScroll);
            isTicking = true;
        }
    }, { passive: true });

    checkScroll();
}

/* ====================================================================
 * 9. Active Nav Link Highlighting
 * Observes sections and highlights active matching anchor in #navLinks
 * ==================================================================== */
function initActiveNavHighlight() {
    const sectionIds = ['home', 'about', 'experience', 'skills', 'certifications', 'education', 'contact'];
    const navLinks = document.querySelectorAll('#navLinks a');
    if (!navLinks.length) return;

    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(sec => observer.observe(sec));
}

/* ====================================================================
 * 10. Scroll Reveal Fallback
 * IntersectionObserver fallback for browsers lacking animation-timeline
 * ==================================================================== */
function initScrollRevealFallback() {
    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline', 'view()')) {
        return; // Native CSS scroll-driven animation supported
    }

    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.style.getPropertyValue('--reveal-delay') ||
                              getComputedStyle(el).getPropertyValue('--reveal-delay');
                if (delay) el.style.transitionDelay = delay.trim();
                el.classList.add('in-view');
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
}

/* ====================================================================
 * 11. Master Initialization
 * ==================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Always init:
    initMobileNav();
    initNavScroll();
    initActiveNavHighlight();

    // Conditional on motion preference:
    initParticles(prefersReducedMotion);
    initTypewriter(prefersReducedMotion);
    initCounterAnimation();
    initGlowCards();

    if (!prefersReducedMotion) {
        initTiltCards();
        initMagneticCursor();
        initScrollRevealFallback();
    }
});
