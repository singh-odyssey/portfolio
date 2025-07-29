// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    window.addEventListener('load', function() {
        const loaderWrapper = document.querySelector('.loader-wrapper');
        setTimeout(() => {
            loaderWrapper.style.opacity = '0';
            setTimeout(() => {
                loaderWrapper.style.display = 'none';
            }, 500);
        }, 1500);
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', function() {
        // Add scrolled class to navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Highlight active section in navbar
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', function() {
            navLinksContainer.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar')) {
                navLinksContainer.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    const storedTheme = localStorage.getItem('theme');

    if (themeToggle) {
        if (storedTheme) {
            body.classList.add(storedTheme);
            const icon = themeToggle.querySelector('i');
            if (icon && storedTheme === 'light-theme') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        } else {
            body.classList.add('dark-theme');
        }

        themeToggle.addEventListener('click', function() {
            const icon = themeToggle.querySelector('i');
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
                localStorage.setItem('theme', 'light-theme');
            } else {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                if (icon) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
                localStorage.setItem('theme', 'dark-theme');
            }
        });
    }

    // Project filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter projects
            const filter = this.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.classList.add('visible'), 10);
                } else {
                    card.classList.remove('visible');
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    // Initialize project cards as visible
    setTimeout(() => {
        projectCards.forEach(card => {
            card.classList.add('visible');
        });
    }, 100);

    // Initialize GSAP animations with enhanced 3D effects
    if (typeof gsap !== 'undefined') {
        // Register ScrollTrigger plugin
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Hero section entrance animations with enhanced 3D stagger
        const heroTl = gsap.timeline();
        
        heroTl
            .from('.hero h1', {
                y: 100,
                opacity: 0,
                rotationX: -90,
                duration: 1.2,
                ease: 'power3.out'
            })
            .from('.hero .name', {
                y: 100,
                opacity: 0,
                rotationY: 90,
                duration: 1.4,
                ease: 'power3.out'
            }, '-=0.8')
            .from('.hero .title', {
                y: 100,
                opacity: 0,
                rotationX: 45,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.8')
            .from('.cta-buttons .btn', {
                y: 50,
                opacity: 0,
                rotationY: -45,
                duration: 0.8,
                stagger: 0.2,
                ease: 'back.out(1.7)'
            }, '-=0.6')
            .from('.social-icon', {
                scale: 0,
                opacity: 0,
                rotation: 180,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.4');

        // Enhanced navbar animation on scroll
        gsap.to('.navbar', {
            scrollTrigger: {
                trigger: 'body',
                start: 'top -80px',
                end: 'bottom top',
                toggleClass: {
                    targets: '.navbar',
                    className: 'scrolled',
                }
            }
        });

        // About section animations with enhanced 3D effects
        const aboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });

        aboutTl
            .from('.about .section-header h2', {
                y: 50,
                opacity: 0,
                rotationX: -45,
                duration: 0.8,
                ease: 'power3.out'
            })
            .from('.about .underline', {
                width: 0,
                duration: 0.6,
                ease: 'power3.out'
            }, '-=0.4')
            .from('.about-image', {
                x: -100,
                opacity: 0,
                rotationY: -20,
                duration: 1.2,
                ease: 'power3.out'
            }, '-=0.4')
            .from('.about-content h3', {
                x: 100,
                opacity: 0,
                rotationX: 30,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            }, '-=0.8')
            .from('.about-content p', {
                x: 100,
                opacity: 0,
                rotationY: 15,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.6')
            .from('.info-item', {
                x: 50,
                opacity: 0,
                rotationX: -15,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.4')
            .from('.about-content .btn', {
                scale: 0.8,
                opacity: 0,
                rotationZ: 10,
                duration: 0.6,
                ease: 'back.out(1.7)'
            }, '-=0.2');

        // Projects section with enhanced 3D entrance
        const projectsTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.projects',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });

        projectsTl
            .from('.projects .section-header h2', {
                scale: 0.5,
                opacity: 0,
                rotationY: 180,
                duration: 0.8,
                ease: 'back.out(1.7)'
            })
            .from('.projects .underline', {
                width: 0,
                duration: 0.6,
                ease: 'power3.out'
            }, '-=0.4')
            .from('.filter-btn', {
                y: 30,
                opacity: 0,
                rotationX: -30,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.2')
            .from('.coming-soon-container', {
                scale: 0.8,
                opacity: 0,
                rotationY: 20,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.2');

        // Skills section with enhanced dynamic 3D animations
        const skillsTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.skills',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });

        skillsTl
            .from('.skills .section-header h2', {
                rotationX: 90,
                opacity: 0,
                y: -50,
                duration: 0.8,
                ease: 'power3.out'
            })
            .from('.skills .underline', {
                width: 0,
                duration: 0.6,
                ease: 'power3.out'
            }, '-=0.4');

        // Animate skill categories with enhanced 3D effects
        gsap.utils.toArray('.skills-category').forEach((category, index) => {
            const categoryTl = gsap.timeline({
                scrollTrigger: {
                    trigger: category,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });

            categoryTl
                .from(category.querySelector('h3'), {
                    x: index % 2 === 0 ? -100 : 100,
                    opacity: 0,
                    rotationY: index % 2 === 0 ? -45 : 45,
                    duration: 0.8,
                    ease: 'power3.out'
                })
                .from(category.querySelectorAll('.skill-item'), {
                    y: 50,
                    opacity: 0,
                    rotationX: -30,
                    scale: 0.8,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'back.out(1.7)',
                    onComplete: function() {
                        // Animate skill levels after items appear
                        category.querySelectorAll('.skill-level').forEach(skillLevel => {
                            const width = skillLevel.style.width;
                            skillLevel.style.width = '0%';
                            gsap.to(skillLevel, {
                                width: width,
                                duration: 1.5,
                                ease: 'power2.out',
                                delay: Math.random() * 0.5
                            });
                        });
                    }
                }, '-=0.4');
        });

        // Enhanced contact section with floating 3D animation
        const contactTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.contact',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });

        contactTl
            .from('.contact .section-header h2', {
                y: -50,
                opacity: 0,
                rotationX: -60,
                duration: 0.8,
                ease: 'bounce.out'
            })
            .from('.contact .underline', {
                width: 0,
                duration: 0.6,
                ease: 'power3.out'
            }, '-=0.4')
            .from('.contact-item', {
                x: -50,
                opacity: 0,
                rotationY: -20,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            }, '-=0.2')
            .from('.contact-form', {
                y: 50,
                opacity: 0,
                rotationX: 20,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.4');

        // Enhanced parallax effect for hero section
        gsap.to('.hero-content', {
            y: -100,
            rotationX: 5,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Enhanced floating animation for social icons
        gsap.to('.social-icon', {
            y: -10,
            rotationZ: 5,
            duration: 2,
            ease: 'power2.inOut',
            stagger: 0.1,
            yoyo: true,
            repeat: -1
        });

        // Enhanced mouse follower effect for buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    rotationY: 5,
                    z: 20,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    rotationY: 0,
                    z: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Enhanced smooth reveal for coming soon section
        if (document.querySelector('.coming-soon-container')) {
            gsap.fromTo('.coming-soon-container i', 
                {
                    scale: 0,
                    rotation: -180,
                    opacity: 0
                },
                {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: '.coming-soon-container',
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }

        // Enhanced text reveal animation for section headers
        gsap.utils.toArray('.section-header h2').forEach(header => {
            const chars = header.textContent.split('');
            header.innerHTML = chars.map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            
            gsap.from(header.querySelectorAll('.char'), {
                opacity: 0,
                y: 50,
                rotationX: -90,
                duration: 0.6,
                stagger: 0.02,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });

        // Enhanced magnetic effect for interactive elements
        document.querySelectorAll('.btn, .social-icon, .filter-btn').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(element, {
                    x: x * 0.1,
                    y: y * 0.1,
                    rotationX: y * 0.1,
                    rotationY: x * 0.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Enhanced scroll-triggered 3D transformations
        gsap.utils.toArray('section').forEach((section, index) => {
            gsap.to(section, {
                rotationX: 2,
                transformOrigin: 'center bottom',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }

    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (name && email && subject && message) {
                // Here you would normally send the form data to your server
                // For now, let's just show a success message
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    // Create success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success';
                    successMessage.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <p>Your message has been sent successfully!</p>
                    `;
                    contactForm.innerHTML = '';
                    contactForm.appendChild(successMessage);
                    
                    // Reset form after some time
                    setTimeout(() => {
                        contactForm.innerHTML = `
                            <div class="form-group">
                                <input type="text" id="name" name="name" placeholder="Your Name" required>
                                <label for="name">Your Name</label>
                            </div>
                            <div class="form-group">
                                <input type="email" id="email" name="email" placeholder="Your Email" required>
                                <label for="email">Your Email</label>
                            </div>
                            <div class="form-group">
                                <input type="text" id="subject" name="subject" placeholder="Subject" required>
                                <label for="subject">Subject</label>
                            </div>
                            <div class="form-group">
                                <textarea id="message" name="message" placeholder="Your Message" required></textarea>
                                <label for="message">Your Message</label>
                            </div>
                            <button type="submit" class="btn primary-btn">Send Message</button>
                        `;
                    }, 5000);
                }, 1500);
            }
        });
    }
});
