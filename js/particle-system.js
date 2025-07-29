// Enhanced Particle Animation System
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particleCount = 50;
        this.init();
    }

    init() {
        this.createParticleContainer();
        this.createParticles();
        this.createStars();
        this.createGlowOrbs();
        this.animate();
    }

    createParticleContainer() {
        const container = document.getElementById('particleContainer');
        if (!container) return;
        
        // Set initial particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createFloatingParticle(container);
        }
    }

    createFloatingParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        // Random size and opacity
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.opacity = 0.3 + Math.random() * 0.4;
        
        container.appendChild(particle);
        
        // Remove and recreate after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                this.createFloatingParticle(container);
            }
        }, 25000);
    }

    createStars() {
        const starFields = document.querySelectorAll('.star-field');
        starFields.forEach(field => {
            for (let i = 0; i < 20; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                field.appendChild(star);
            }
        });
    }

    createGlowOrbs() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (section.querySelector('.section-bg-particles')) {
                for (let i = 0; i < 3; i++) {
                    const orb = document.createElement('div');
                    orb.className = 'glow-orb';
                    orb.style.width = (50 + Math.random() * 100) + 'px';
                    orb.style.height = orb.style.width;
                    orb.style.left = Math.random() * 100 + '%';
                    orb.style.top = Math.random() * 100 + '%';
                    orb.style.animationDelay = Math.random() * 4 + 's';
                    section.appendChild(orb);
                }
            }
        });
    }

    animate() {
        // Continuous animation loop for dynamic effects
        requestAnimationFrame(() => {
            this.updateParticles();
            this.animate();
        });
    }

    updateParticles() {
        // Mouse interaction with particles
        document.addEventListener('mousemove', (e) => {
            const particles = document.querySelectorAll('.floating-particle');
            particles.forEach(particle => {
                const rect = particle.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(e.clientX - (rect.left + rect.width/2), 2) + 
                    Math.pow(e.clientY - (rect.top + rect.height/2), 2)
                );
                
                if (distance < 100) {
                    particle.style.transform = `scale(1.5)`;
                    particle.style.opacity = '1';
                } else {
                    particle.style.transform = `scale(1)`;
                    particle.style.opacity = '0.6';
                }
            });
        });
    }
}

// Enhanced Loading Animation
class LoadingEnhancer {
    constructor() {
        this.init();
    }

    init() {
        const loader = document.querySelector('.loader');
        if (loader) {
            // Add particle effect to loader
            this.addLoaderParticles();
        }
    }

    addLoaderParticles() {
        const loaderWrapper = document.querySelector('.loader-wrapper');
        if (!loaderWrapper) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.background = `hsl(${250 + Math.random() * 40}, 70%, 60%)`;
            particle.style.borderRadius = '50%';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = 'translate(-50%, -50%)';
            particle.style.animation = `loaderParticle ${2 + Math.random() * 2}s linear infinite`;
            particle.style.animationDelay = Math.random() * 2 + 's';
            loaderWrapper.appendChild(particle);
        }

        // Add keyframes for loader particles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes loaderParticle {
                0% {
                    transform: translate(-50%, -50%) rotate(0deg) translateX(0px) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) rotate(360deg) translateX(60px) rotate(-360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Enhanced Contact Form Animation
class ContactEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.addFormParticles();
        this.enhanceFormInteractions();
    }

    addFormParticles() {
        const contactSection = document.getElementById('contact');
        if (!contactSection) return;

        // Add floating particles around form
        const formContainer = contactSection.querySelector('.contact-form');
        if (formContainer) {
            formContainer.style.position = 'relative';
            formContainer.style.overflow = 'hidden';

            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))';
                particle.style.borderRadius = '50%';
                particle.style.opacity = '0.4';
                particle.style.animation = `formParticle ${8 + Math.random() * 4}s linear infinite`;
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = '100%';
                formContainer.appendChild(particle);
            }
        }

        // Add keyframes for form particles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes formParticle {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.4;
                }
                90% {
                    opacity: 0.4;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    enhanceFormInteractions() {
        const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Add glow effect on focus
                input.style.boxShadow = '0 0 20px rgba(108, 92, 231, 0.4)';
                input.style.transform = 'translateZ(5px)';
            });
            
            input.addEventListener('blur', () => {
                input.style.boxShadow = '';
                input.style.transform = '';
            });
        });
    }
}

// Initialize all enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const particleSystem = new ParticleSystem();
    
    // Initialize loading enhancements
    const loadingEnhancer = new LoadingEnhancer();
    
    // Initialize contact enhancements
    const contactEnhancer = new ContactEnhancer();
    
    // Add scroll-based particle effects
    window.addEventListener('scroll', () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const particles = document.querySelectorAll('.floating-particle');
        
        particles.forEach((particle, index) => {
            const speed = 1 + (index % 3) * 0.5;
            particle.style.transform = `translateX(${scrollPercent * speed * 50}px)`;
        });
    });
    
    // Enhanced coming soon animations
    const comingSoonContainer = document.querySelector('.coming-soon-container');
    if (comingSoonContainer) {
        // Add interactive hover effects
        comingSoonContainer.addEventListener('mouseenter', () => {
            const icons = comingSoonContainer.querySelectorAll('i');
            icons.forEach((icon, index) => {
                setTimeout(() => {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                    icon.style.textShadow = '0 0 20px currentColor';
                }, index * 100);
            });
        });
        
        comingSoonContainer.addEventListener('mouseleave', () => {
            const icons = comingSoonContainer.querySelectorAll('i');
            icons.forEach(icon => {
                icon.style.transform = '';
                icon.style.textShadow = '';
            });
        });
    }
});

// Performance optimization for mobile
if (window.innerWidth <= 768) {
    // Reduce particle count on mobile
    document.documentElement.style.setProperty('--particle-count', '20');
    
    // Disable some animations on mobile for better performance
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .floating-particle:nth-child(n+21) {
                display: none;
            }
            .glow-orb {
                animation-duration: 6s;
            }
        }
    `;
    document.head.appendChild(style);
}
