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

    // --- Animal Faces (Cat Constellations) ---
    const textureLoader = new THREE.TextureLoader();
    const catTexture = textureLoader.load('cat.png');
    const cats = [];
    const numCats = 8; // Number of random cats
    
    for (let i = 0; i < numCats; i++) {
        const catMaterial = new THREE.SpriteMaterial({ 
            map: catTexture, 
            color: 0x00f0ff, // match neon blue accent
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const catSprite = new THREE.Sprite(catMaterial);
        
        // Random scale for variation
        const scale = 100 + Math.random() * 100;
        catSprite.scale.set(scale, scale, 1);
        
        scene.add(catSprite);
        
        cats.push({
            sprite: catSprite,
            material: catMaterial,
            // Randomize the glowing cycle for each cat
            period: 8 + Math.random() * 10, // each cat has a different cycle length
            offset: Math.random() * 10, // random start time
            baseScale: scale
        });
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

        // Subtle parallax effect on mouse move + Scroll reaction for camera
        targetX = mouseX * 0.1;
        targetY = mouseY * 0.1;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - (scrollY * 0.15) - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // 2. Random Cats Glowing
        cats.forEach(cat => {
            // Calculate time in cycle based on each cat's unique offset and period
            const timeInPeriod = (elapsedTime + cat.offset) % cat.period;
            
            // Each cat glows for the last 4 seconds of its period
            const glowDuration = 4;
            const threshold = cat.period - glowDuration;

            if (timeInPeriod > threshold) {
                // Fade in and out
                const fadeProgress = (timeInPeriod - threshold) / glowDuration; // 0 to 1
                cat.material.opacity = Math.sin(fadeProgress * Math.PI) * 0.7; // Max opacity 0.7
                
                // Subtle floating animation
                cat.sprite.position.y += Math.sin(elapsedTime * 2 + cat.offset) * 0.1;
                
                // Slight pulsing effect on scale
                const pulse = 1 + Math.sin(fadeProgress * Math.PI) * 0.1;
                cat.sprite.scale.set(cat.baseScale * pulse, cat.baseScale * pulse, 1);
            } else {
                cat.material.opacity = 0;
                
                // Reposition randomly when invisible so it pops up in different places
                if (timeInPeriod < 0.1) {
                    // Spawn it generally in front of the current camera position
                    cat.sprite.position.x = camera.position.x + (Math.random() - 0.5) * 800;
                    cat.sprite.position.y = camera.position.y + (Math.random() - 0.5) * 600;
                    // keep z in front of camera (between 100 and 500 units away)
                    cat.sprite.position.z = camera.position.z - 100 - Math.random() * 400; 
                }
            }
        });

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

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows immediately
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with slight delay using animate for smoothness
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

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

// Trigger once on load for elements already in viewport
setTimeout(() => {
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight) {
            el.classList.add('active');
        }
    });
}, 100);
