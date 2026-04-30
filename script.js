/* ========================================
   CYBER FORTRESS — PORTFOLIO SCRIPTS
   ======================================== */

// ========================
// BOOT SEQUENCE
// ========================
(function bootSequence() {
    const bootEl = document.getElementById('boot-sequence');
    const lines = bootEl.querySelectorAll('.boot-line');

    lines.forEach((line) => {
        const delay = parseInt(line.getAttribute('data-delay'));
        setTimeout(() => {
            line.classList.add('visible');
        }, delay);
    });

    setTimeout(() => {
        bootEl.classList.add('hidden');
        initHeroAnimations();
        ScrollTrigger.refresh();
    }, 1500);
})();

// ========================
// CUSTOM CURSOR
// ========================
(function customCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let dx = 0, dy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
    });

    function animateRing() {
        dx += (mx - dx) * 0.15;
        dy += (my - dy) * 0.15;
        ring.style.left = dx + 'px';
        ring.style.top = dy + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-module, .decor-card, .social-link');
    hoverTargets.forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
})();

// ========================
// THREE.JS — HERO 3D SCENE
// ========================
(function initThreeScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = isMobile ? 7 : 5.5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ---- Particle System ----
    const particleCount = isMobile ? 600 : 1500;
    const radius = 2.5;
    const pPositions = new Float32Array(particleCount * 3);
    const pOriginal = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius + (Math.random() - 0.5) * 0.4;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        pPositions[i * 3] = x;
        pPositions[i * 3 + 1] = y;
        pPositions[i * 3 + 2] = z;
        pOriginal[i * 3] = x;
        pOriginal[i * 3 + 1] = y;
        pOriginal[i * 3 + 2] = z;
    }

    const pGeometry = new THREE.BufferGeometry();
    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    // Create circular particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(0, 240, 255, 1)');
    grad.addColorStop(0.4, 'rgba(0, 240, 255, 0.6)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const pMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.06 : 0.04,
        map: pTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);

    // ---- Wireframe Icosahedron (outer) ----
    const icoGeo = new THREE.IcosahedronGeometry(radius * 0.92, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    scene.add(icosahedron);

    // ---- Wireframe Dodecahedron (inner) ----
    const dodGeo = new THREE.DodecahedronGeometry(radius * 0.45, 0);
    const dodMat = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
    });
    const dodecahedron = new THREE.Mesh(dodGeo, dodMat);
    scene.add(dodecahedron);

    // ---- Orbital Rings ----
    const ringGeo = new THREE.TorusGeometry(radius * 1.3, 0.008, 8, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.12 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    // scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(radius * 1.5, 0.006, 8, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.06 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 5;
    // scene.add(ring2);

    // ---- Mouse Tracking ----
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ---- Scroll Opacity ----
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    // ---- Animation Loop ----
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // Smooth mouse follow
        targetRotX += (mouseY * 0.3 - targetRotX) * 0.05;
        targetRotY += (mouseX * 0.3 - targetRotY) * 0.05;

        // Rotate main structures
        particles.rotation.y = t * 0.15 + targetRotY;
        particles.rotation.x = t * 0.08 + targetRotX;

        icosahedron.rotation.y = t * 0.12 + targetRotY;
        icosahedron.rotation.x = t * 0.06 + targetRotX;

        dodecahedron.rotation.y = -t * 0.2 + targetRotY * 0.5;
        dodecahedron.rotation.z = t * 0.15;

        ring1.rotation.z = t * 0.1;
        ring2.rotation.z = -t * 0.08;

        // Particle breathing effect
        const positions = pGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const ox = pOriginal[i * 3];
            const oy = pOriginal[i * 3 + 1];
            const oz = pOriginal[i * 3 + 2];
            const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
            const breathe = 1 + Math.sin(t * 0.8 + dist * 2) * 0.03;
            positions[i * 3] = ox * breathe;
            positions[i * 3 + 1] = oy * breathe;
            positions[i * 3 + 2] = oz * breathe;
        }
        pGeometry.attributes.position.needsUpdate = true;

        // Fade based on scroll
        const heroH = window.innerHeight;
        const fadeFactor = Math.max(0, 1 - scrollY / (heroH * 0.7));
        pMaterial.opacity = 0.8 * fadeFactor;
        icoMat.opacity = 0.08 * fadeFactor;
        dodMat.opacity = 0.06 * fadeFactor;
        ringMat1.opacity = 0.12 * fadeFactor;
        ringMat2.opacity = 0.06 * fadeFactor;

        renderer.render(scene, camera);
    }
    animate();

    // ---- Resize ----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// ========================
// HERO ENTRANCE ANIMATIONS
// ========================
function initHeroAnimations() {
    const tl = gsap.timeline();

    tl.to('.hero-badge', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
    })
        .to('.glitch', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
        }, '-=0.3')
        .to('.hero-titles', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
        }, '-=0.4')
        .to('.hero-buttons', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
        }, '-=0.3')
        .to('.hero-status', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
        }, '-=0.3')
        .to('.scroll-indicator', {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
        }, '-=0.2');
}

// ========================
// GSAP SCROLL ANIMATIONS
// ========================
gsap.registerPlugin(ScrollTrigger);

// ---- Section Headers ----
document.querySelectorAll('.section-header').forEach((header) => {
    gsap.from(header.querySelectorAll('.section-num, .section-line, .section-title'), {
        scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out',
    });
});

// ---- About Section ----
gsap.from('.terminal-window', {
    scrollTrigger: {
        trigger: '#about',
        start: 'top 75%',
    },
    opacity: 0,
    x: -50,
    duration: 0.8,
    ease: 'power2.out',
});

gsap.from('.decor-card', {
    scrollTrigger: {
        trigger: '.about-decor',
        start: 'top 85%',
        toggleActions: 'play none none none',
    },
    autoAlpha: 0,
    y: 30,
    stagger: 0.12,
    duration: 0.6,
    ease: 'power2.out',
});

// ---- Timeline ----
gsap.from('.timeline-item', {
    scrollTrigger: {
        trigger: '.timeline',
        start: 'top 85%',
        toggleActions: 'play none none none',
    },
    autoAlpha: 0,
    x: -40,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
});

// ---- Project Cards ----
gsap.from('.project-card', {
    scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
    },
    autoAlpha: 0,
    y: 50,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power2.out',
});

// ---- Skill Modules ----
gsap.from('.skill-module', {
    scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
    },
    autoAlpha: 0,
    y: 40,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power2.out',
});

// ---- Education ----
gsap.from('.edu-degree', {
    scrollTrigger: {
        trigger: '#education',
        start: 'top 75%',
    },
    opacity: 0,
    scale: 0.9,
    duration: 0.7,
    ease: 'power2.out',
});

gsap.from('.edu-certs, .edu-volunteer, .edu-langs', {
    scrollTrigger: {
        trigger: '.edu-certs',
        start: 'top 85%',
    },
    opacity: 0,
    y: 30,
    stagger: 0.12,
    duration: 0.5,
    ease: 'power2.out',
});

// ---- Courses ----
gsap.from('.courses-terminal', {
    scrollTrigger: {
        trigger: '#courses',
        start: 'top 75%',
    },
    opacity: 0,
    y: 40,
    duration: 0.7,
    ease: 'power2.out',
});

// ---- Contact ----
gsap.from('.contact-container', {
    scrollTrigger: {
        trigger: '#contact',
        start: 'top 75%',
    },
    opacity: 0,
    y: 40,
    duration: 0.7,
    ease: 'power2.out',
});

// ========================
// PROJECT CARD TILT EFFECT (Fixed with GSAP)
// ========================
document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -8;
        const rotY = ((x - cx) / cx) * 8;

        gsap.to(card, {
            rotationX: rotX,
            rotationY: rotY,
            scale: 1.02,
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
            transformPerspective: 1000
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
        });
    });
});

// ========================
// NAVIGATION
// ========================
(function initNav() {
    const nav = document.getElementById('main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
            toggle.classList.remove('active');
            links.classList.remove('open');
        }
    });
})();

// ========================
// ACTIVE NAV LINK TRACKING
// ========================
(function activeNavLinkTracking() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    sections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            end: 'bottom 40%',
            onToggle: (self) => {
                if (self.isActive) {
                    const id = section.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            },
        });
    });
})();

// ========================
// SMOOTH SCROLL FOR ANCHORS
// ========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            const offset = 60;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ========================
// PARALLAX ON HERO CONTENT
// ========================
window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    const scrollY = window.scrollY;
    if (heroContent && scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.6);
    }
});

// ========================
// SKILL TAG HOVER MICRO-ANIMATION
// ========================
document.querySelectorAll('.module-tags span').forEach((tag) => {
    tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'translateY(-2px) scale(1.05)';
        tag.style.transition = 'transform 0.2s ease';
    });
    tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'translateY(0) scale(1)';
    });
});

// ========================
// DYNAMIC YEAR IN FOOTER
// ========================
const footerYear = document.querySelector('#footer p');
if (footerYear) {
    const year = new Date().getFullYear();
    footerYear.innerHTML = footerYear.innerHTML.replace('2025', year);
}

// ========================
// KONAMI CODE EASTER EGG
// ========================
(function konamiEasterEgg() {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                activateEasterEgg();
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 100000;
            background: rgba(0, 240, 255, 0.1);
            display: flex; align-items: center; justify-content: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 24px; color: #00f0ff;
            text-align: center; padding: 20px;
            animation: eeFade 3s ease forwards;
        `;
        overlay.innerHTML = '&#9760; SECURITY PROTOCOL OVERRIDE &#9760;<br><small style="font-size:14px;color:#ff0044;margin-top:8px;display:block;">You found the backdoor. Respect.</small>';
        document.body.appendChild(overlay);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes eeFade {
                0% { opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; pointer-events: none; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            overlay.remove();
            style.remove();
        }, 3200);
    }
})();

// ========================
// TYPING ANIMATION FOR TERMINAL
// ========================
(function terminalTyping() {
    const termText = document.querySelector('.term-text');
    const terminalBody = document.querySelector('.terminal-body');
    if (!termText || !terminalBody) return;

    const originalText = termText.textContent;
    termText.textContent = '';
    termText.style.visibility = 'visible';

    let hasTyped = false;

    ScrollTrigger.create({
        trigger: '#about',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (hasTyped) return;
            hasTyped = true;

            // Measure the "ghost" height by temporarily putting the text back
            termText.textContent = originalText;
            const fullHeight = terminalBody.scrollHeight;
            terminalBody.style.minHeight = `${fullHeight}px`;
            termText.textContent = ''; // Clear again to start typing

            let i = 0;
            function typeChar() {
                if (i < originalText.length) {
                    termText.textContent += originalText[i];
                    i++;
                    setTimeout(typeChar, 12);
                } else {
                    terminalBody.style.minHeight = 'auto';
                }
            }
            typeChar();
        },
    });
})();

// ========================
// COURSE ENTRIES STAGGER REVEAL
// ========================
document.querySelectorAll('.course-entry, .course-detail').forEach((el) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: 'top 90%',
        },
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: 'power1.out',
    });
    /* ========================================
       CYBER FORTRESS — PORTFOLIO SCRIPTS
       ======================================== */

    // ========================
    // BOOT SEQUENCE
    // ========================
    (function bootSequence() {
        const bootEl = document.getElementById('boot-sequence');
        const lines = bootEl.querySelectorAll('.boot-line');

        lines.forEach((line) => {
            const delay = parseInt(line.getAttribute('data-delay'));
            setTimeout(() => {
                line.classList.add('visible');
            }, delay);
        });

        setTimeout(() => {
            bootEl.classList.add('hidden');
            initHeroAnimations();
            ScrollTrigger.refresh();
        }, 1500);
    })();

    // ========================
    // CUSTOM CURSOR
    // ========================
    (function customCursor() {
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        let mx = 0, my = 0;
        let dx = 0, dy = 0;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        });

        function animateRing() {
            dx += (mx - dx) * 0.15;
            dy += (my - dy) * 0.15;
            ring.style.left = dx + 'px';
            ring.style.top = dy + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effect on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-module, .decor-card, .social-link');
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    })();

    // ========================
    // THREE.JS — HERO 3D SCENE
    // ========================
    (function initThreeScene() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const isMobile = window.innerWidth < 768;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = isMobile ? 7 : 5.5;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // ---- Particle System ----
        const particleCount = isMobile ? 600 : 1500;
        const radius = 2.5;
        const pPositions = new Float32Array(particleCount * 3);
        const pOriginal = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius + (Math.random() - 0.5) * 0.4;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            pPositions[i * 3] = x;
            pPositions[i * 3 + 1] = y;
            pPositions[i * 3 + 2] = z;
            pOriginal[i * 3] = x;
            pOriginal[i * 3 + 1] = y;
            pOriginal[i * 3 + 2] = z;
        }

        const pGeometry = new THREE.BufferGeometry();
        pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

        // Create circular particle texture
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 32;
        pCanvas.height = 32;
        const pCtx = pCanvas.getContext('2d');
        const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(0, 240, 255, 1)');
        grad.addColorStop(0.4, 'rgba(0, 240, 255, 0.6)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, 32, 32);
        const pTexture = new THREE.CanvasTexture(pCanvas);

        const pMaterial = new THREE.PointsMaterial({
            size: isMobile ? 0.06 : 0.04,
            map: pTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(pGeometry, pMaterial);
        scene.add(particles);

        // ---- Wireframe Icosahedron (outer) ----
        const icoGeo = new THREE.IcosahedronGeometry(radius * 0.92, 1);
        const icoMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
        });
        const icosahedron = new THREE.Mesh(icoGeo, icoMat);
        scene.add(icosahedron);

        // ---- Wireframe Dodecahedron (inner) ----
        const dodGeo = new THREE.DodecahedronGeometry(radius * 0.45, 0);
        const dodMat = new THREE.MeshBasicMaterial({
            color: 0xff0044,
            wireframe: true,
            transparent: true,
            opacity: 0.06,
        });
        const dodecahedron = new THREE.Mesh(dodGeo, dodMat);
        scene.add(dodecahedron);

        // ---- Orbital Rings ----
        const ringGeo = new THREE.TorusGeometry(radius * 1.3, 0.008, 8, 120);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.12 });
        const ring1 = new THREE.Mesh(ringGeo, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        // scene.add(ring1);

        const ringGeo2 = new THREE.TorusGeometry(radius * 1.5, 0.006, 8, 120);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.06 });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.y = Math.PI / 5;
        // scene.add(ring2);

        // ---- Mouse Tracking ----
        let mouseX = 0, mouseY = 0;
        let targetRotX = 0, targetRotY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // ---- Scroll Opacity ----
        let scrollY = 0;
        window.addEventListener('scroll', () => { scrollY = window.scrollY; });

        // ---- Animation Loop ----
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const t = clock.getElapsedTime();

            // Smooth mouse follow
            targetRotX += (mouseY * 0.3 - targetRotX) * 0.05;
            targetRotY += (mouseX * 0.3 - targetRotY) * 0.05;

            // Rotate main structures
            particles.rotation.y = t * 0.15 + targetRotY;
            particles.rotation.x = t * 0.08 + targetRotX;

            icosahedron.rotation.y = t * 0.12 + targetRotY;
            icosahedron.rotation.x = t * 0.06 + targetRotX;

            dodecahedron.rotation.y = -t * 0.2 + targetRotY * 0.5;
            dodecahedron.rotation.z = t * 0.15;

            ring1.rotation.z = t * 0.1;
            ring2.rotation.z = -t * 0.08;

            // Particle breathing effect
            const positions = pGeometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const ox = pOriginal[i * 3];
                const oy = pOriginal[i * 3 + 1];
                const oz = pOriginal[i * 3 + 2];
                const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
                const breathe = 1 + Math.sin(t * 0.8 + dist * 2) * 0.03;
                positions[i * 3] = ox * breathe;
                positions[i * 3 + 1] = oy * breathe;
                positions[i * 3 + 2] = oz * breathe;
            }
            pGeometry.attributes.position.needsUpdate = true;

            // Fade based on scroll
            const heroH = window.innerHeight;
            const fadeFactor = Math.max(0, 1 - scrollY / (heroH * 0.7));
            pMaterial.opacity = 0.8 * fadeFactor;
            icoMat.opacity = 0.08 * fadeFactor;
            dodMat.opacity = 0.06 * fadeFactor;
            ringMat1.opacity = 0.12 * fadeFactor;
            ringMat2.opacity = 0.06 * fadeFactor;

            renderer.render(scene, camera);
        }
        animate();

        // ---- Resize ----
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    })();

    // ========================
    // HERO ENTRANCE ANIMATIONS
    // ========================
    function initHeroAnimations() {
        const tl = gsap.timeline();

        tl.to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
        })
            .to('.glitch', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
            }, '-=0.3')
            .to('.hero-titles', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, '-=0.4')
            .to('.hero-buttons', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, '-=0.3')
            .to('.hero-status', {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
            }, '-=0.3')
            .to('.scroll-indicator', {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
            }, '-=0.2');
    }

    // ========================
    // GSAP SCROLL ANIMATIONS
    // ========================
    gsap.registerPlugin(ScrollTrigger);

    // ---- Section Headers ----
    document.querySelectorAll('.section-header').forEach((header) => {
        gsap.from(header.querySelectorAll('.section-num, .section-line, .section-title'), {
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power2.out',
        });
    });

    // ---- About Section ----
    gsap.from('.terminal-window', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 75%',
        },
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: 'power2.out',
    });

    gsap.from('.decor-card', {
        scrollTrigger: {
            trigger: '.about-decor',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        autoAlpha: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power2.out',
    });

    // ---- Timeline ----
    gsap.from('.timeline-item', {
        scrollTrigger: {
            trigger: '.timeline',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        autoAlpha: 0,
        x: -40,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out',
    });

    // ---- Project Cards ----
    gsap.from('.project-card', {
        scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        autoAlpha: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power2.out',
    });

    // ---- Skill Modules ----
    gsap.from('.skill-module', {
        scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        autoAlpha: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
    });

    // ---- Education ----
    gsap.from('.edu-degree', {
        scrollTrigger: {
            trigger: '#education',
            start: 'top 75%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.7,
        ease: 'power2.out',
    });

    gsap.from('.edu-certs, .edu-volunteer, .edu-langs', {
        scrollTrigger: {
            trigger: '.edu-certs',
            start: 'top 85%',
        },
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.5,
        ease: 'power2.out',
    });

    // ---- Courses ----
    gsap.from('.courses-terminal', {
        scrollTrigger: {
            trigger: '#courses',
            start: 'top 75%',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power2.out',
    });

    // ---- Contact ----
    gsap.from('.contact-container', {
        scrollTrigger: {
            trigger: '#contact',
            start: 'top 75%',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power2.out',
    });

    // ========================
    // PROJECT CARD TILT EFFECT (Fixed with GSAP)
    // ========================
    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -8;
            const rotY = ((x - cx) / cx) * 8;

            gsap.to(card, {
                rotationX: rotX,
                rotationY: rotY,
                scale: 1.02,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: 'auto',
                transformPerspective: 1000
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    });

    // ========================
    // NAVIGATION
    // ========================
    (function initNav() {
        const nav = document.getElementById('main-nav');
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');

        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

        // Mobile toggle
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            links.classList.toggle('open');
        });

        // Close on link click
        links.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                toggle.classList.remove('active');
                links.classList.remove('open');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target)) {
                toggle.classList.remove('active');
                links.classList.remove('open');
            }
        });
    })();

    // ========================
    // ACTIVE NAV LINK TRACKING
    // ========================
    (function activeNavLinkTracking() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        sections.forEach((section) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 40%',
                end: 'bottom 40%',
                onToggle: (self) => {
                    if (self.isActive) {
                        const id = section.getAttribute('id');
                        navLinks.forEach((link) => {
                            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                        });
                    }
                },
            });
        });
    })();

    // ========================
    // SMOOTH SCROLL FOR ANCHORS
    // ========================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 60;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========================
    // PARALLAX ON HERO CONTENT
    // ========================
    window.addEventListener('scroll', () => {
        const heroContent = document.querySelector('.hero-content');
        const scrollY = window.scrollY;
        if (heroContent && scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.6);
        }
    });

    // ========================
    // SKILL TAG HOVER MICRO-ANIMATION
    // ========================
    document.querySelectorAll('.module-tags span').forEach((tag) => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-2px) scale(1.05)';
            tag.style.transition = 'transform 0.2s ease';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0) scale(1)';
        });
    });

    // ========================
    // DYNAMIC YEAR IN FOOTER
    // ========================
    const footerYear = document.querySelector('#footer p');
    if (footerYear) {
        const year = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace('2025', year);
    }

    // ========================
    // KONAMI CODE EASTER EGG
    // ========================
    (function konamiEasterEgg() {
        const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.keyCode === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    konamiIndex = 0;
                    activateEasterEgg();
                }
            } else {
                konamiIndex = 0;
            }
        });

        function activateEasterEgg() {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 100000;
            background: rgba(0, 240, 255, 0.1);
            display: flex; align-items: center; justify-content: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 24px; color: #00f0ff;
            text-align: center; padding: 20px;
            animation: eeFade 3s ease forwards;
        `;
            overlay.innerHTML = '&#9760; SECURITY PROTOCOL OVERRIDE &#9760;<br><small style="font-size:14px;color:#ff0044;margin-top:8px;display:block;">You found the backdoor. Respect.</small>';
            document.body.appendChild(overlay);

            const style = document.createElement('style');
            style.textContent = `
            @keyframes eeFade {
                0% { opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; pointer-events: none; }
            }
        `;
            document.head.appendChild(style);

            setTimeout(() => {
                overlay.remove();
                style.remove();
            }, 3200);
        }
    })();

    // ========================
    // TYPING ANIMATION FOR TERMINAL
    // ========================
    (function terminalTyping() {
        const termText = document.querySelector('.term-text');
        const terminalBody = document.querySelector('.terminal-body');
        if (!termText || !terminalBody) return;

        const originalText = termText.textContent;
        termText.textContent = '';
        termText.style.visibility = 'visible';

        let hasTyped = false;

        ScrollTrigger.create({
            trigger: '#about',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                if (hasTyped) return;
                hasTyped = true;

                // Measure the "ghost" height by temporarily putting the text back
                termText.textContent = originalText;
                const fullHeight = terminalBody.scrollHeight;
                terminalBody.style.minHeight = `${fullHeight}px`;
                termText.textContent = ''; // Clear again to start typing

                let i = 0;
                function typeChar() {
                    if (i < originalText.length) {
                        termText.textContent += originalText[i];
                        i++;
                        setTimeout(typeChar, 12);
                    } else {
                        terminalBody.style.minHeight = 'auto';
                    }
                }
                typeChar();
            },
        });
    })();

    // ========================
    // COURSE ENTRIES STAGGER REVEAL
    // ========================
    document.querySelectorAll('.course-entry, .course-detail').forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
            },
            opacity: 0,
            x: -20,
            duration: 0.4,
            ease: 'power1.out',
        });
    });
});