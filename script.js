// --- Initialize Vanta.js 3D Background ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if Vanta is loaded
    if (window.VANTA) {
        window.VANTA.NET({
            el: "#vanta-canvas",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x00f0ff,     // Neon Blue accent
            backgroundColor: 0x050505, // Dark background
            points: 10.00,
            maxDistance: 22.00,
            spacing: 18.00
        });
    }
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
