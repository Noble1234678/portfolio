// --- Initialize Three.js 3D Starfield Background ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('vanta-canvas');
    if (!container) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 4000; // lots of small stars
    const posArray = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        // Spread stars out in a large sphere or box
        posArray[i] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starMesh = new THREE.Points(starGeometry, starMaterial);
    scene.add(starMesh);

    // --- Warp Speed State ---
    let warpSpeed = 0;
    let isWarping = false;
    let warpTimeout = null;

    // Listen for button clicks to trigger warp
    const warpTriggers = document.querySelectorAll('.btn, .nav-links a, .project-link');
    warpTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            isWarping = true;
            if (warpTimeout) clearTimeout(warpTimeout);
            
            // Stop warping after 800ms
            warpTimeout = setTimeout(() => {
                isWarping = false;
            }, 800);
        });
    });

    // --- Floating Elements (Names & Cat Faces) ---
    function createTextTexture(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        context.font = 'Bold 80px "Space Grotesk"';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = '#00f0ff';
        context.shadowBlur = 20;
        context.fillStyle = '#ffffff';
        context.fillText(text, 256, 128);
        
        return new THREE.CanvasTexture(canvas);
    }

    const textureLoader = new THREE.TextureLoader();
    const catTexture = textureLoader.load('cat.png');
    const floatingElements = [];
    
    // Create Name Sprites
    const names = ['Christ', 'Noble', 'Christ', 'Noble'];
    names.forEach((name) => {
        const texture = createTextTexture(name);
        const material = new THREE.SpriteMaterial({ 
            map: texture, color: 0x00f0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        const scale = 150 + Math.random() * 100;
        sprite.scale.set(scale, scale / 2, 1);
        scene.add(sprite);
        floatingElements.push({ sprite, material, period: 6 + Math.random() * 6, offset: Math.random() * 10, baseScale: scale, isText: true });
    });

    // Create Cat Sprites
    for (let i = 0; i < 4; i++) {
        const material = new THREE.SpriteMaterial({ 
            map: catTexture, color: 0x00f0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        const scale = 80 + Math.random() * 80;
        sprite.scale.set(scale, scale, 1);
        scene.add(sprite);
        floatingElements.push({ sprite, material, period: 8 + Math.random() * 10, offset: Math.random() * 10, baseScale: scale, isText: false });
    }

    camera.position.z = 400;

    // Animation Loop & Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = window.scrollY;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // 1. Scroll & Time Reaction: Rotate starfield
        starMesh.rotation.y = elapsedTime * 0.05 + scrollY * 0.0005;
        starMesh.rotation.x = elapsedTime * 0.02 + scrollY * 0.0005;

        // Camera Logic
        targetX = mouseX * 0.1;
        targetY = mouseY * 0.1;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - (scrollY * 0.15) - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // 2. Elements Glowing & Floating
        floatingElements.forEach(item => {
            const timeInPeriod = (elapsedTime + item.offset) % item.period;
            const glowDuration = 4;
            const threshold = item.period - glowDuration;

            if (timeInPeriod > threshold) {
                const fadeProgress = (timeInPeriod - threshold) / glowDuration; 
                item.material.opacity = Math.sin(fadeProgress * Math.PI) * 0.7;
                
                // Floating animation
                item.sprite.position.y += Math.sin(elapsedTime * 1.5 + item.offset) * 0.15;
                item.sprite.position.x += Math.cos(elapsedTime * 0.5 + item.offset) * 0.1;
                
                const pulse = 1 + Math.sin(fadeProgress * Math.PI) * 0.1;
                if (item.isText) {
                    item.sprite.scale.set(item.baseScale * pulse, (item.baseScale / 2) * pulse, 1);
                } else {
                    item.sprite.scale.set(item.baseScale * pulse, item.baseScale * pulse, 1);
                }
            } else {
                item.material.opacity = 0;
                if (timeInPeriod < 0.1) {
                    item.sprite.position.x = camera.position.x + (Math.random() - 0.5) * 1200;
                    item.sprite.position.y = camera.position.y + (Math.random() - 0.5) * 800;
                    item.sprite.position.z = camera.position.z - 100 - Math.random() * 500; 
                }
            }
        });

        // 3. Warp Speed Effect
        if (isWarping) {
            warpSpeed += (30 - warpSpeed) * 0.1;
            camera.fov += (120 - camera.fov) * 0.1;
        } else {
            warpSpeed += (0 - warpSpeed) * 0.05;
            camera.fov += (75 - camera.fov) * 0.05;
        }
        camera.updateProjectionMatrix();

        if (warpSpeed > 0.1) {
            const positions = starGeometry.attributes.position.array;
            for (let i = 0; i < starCount; i++) {
                // Move stars towards camera
                positions[i * 3 + 2] += warpSpeed;
                
                // If star passes camera, reset it far back
                if (positions[i * 3 + 2] > 500) {
                    positions[i * 3 + 2] = -1500;
                }
            }
            starGeometry.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

// --- Custom Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

const moveCursor = (posX, posY) => {
    // Dot follows immediately
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with slight delay using animate for smoothness
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
};

window.addEventListener('mousemove', (e) => {
    moveCursor(e.clientX, e.clientY);
});

window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    moveCursor(touch.clientX, touch.clientY);
}, { passive: true });

window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    moveCursor(touch.clientX, touch.clientY);
}, { passive: true });

// Add hover effect to interactive elements
const interactables = document.querySelectorAll('a, .btn, .skill-tag');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.width = '60px';
        cursorOutline.style.height = '60px';
        cursorOutline.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursorOutline.style.width = '40px';
        cursorOutline.style.height = '40px';
        cursorOutline.style.backgroundColor = 'transparent';
    });
});


// --- Vanilla 3D Tilt Effect ---
const tiltCards = document.querySelectorAll('.tilt-card');

tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation based on mouse position relative to card center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Move the glow effect to follow mouse
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.left = `${x - 100}px`; // Center the 200px glow
            glow.style.top = `${y - 100}px`;
        }
    });
    
    card.addEventListener('mouseleave', () => {
        // Reset rotation on mouse leave
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        card.style.transition = `transform 0.5s ease`;
        
        setTimeout(() => {
            card.style.transition = ''; // Remove transition after reset so mousemove is snappy
        }, 500);
    });
});


// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: stop observing once revealed
            // observer.unobserve(entry.target); 
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// --- Mobile Menu Toggle ---
const menuToggle = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li a');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('is-active');
        navLinks.classList.toggle('active');
    });
}

// Close menu when a link is clicked
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        navLinks.classList.remove('active');
    });
});

// Trigger once on load for elements already in viewport
setTimeout(() => {
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight) {
            el.classList.add('active');
        }
    });
}, 100);
