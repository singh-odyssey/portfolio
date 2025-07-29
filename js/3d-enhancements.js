// Enhanced 3D Effects and Interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize 3D Logo
    initLogo3D();
    
    // Initialize Project 3D Canvas
    initProject3D();
    
    // Enhanced 3D Card Effects
    init3DCards();
    
    // Parallax 3D Effects
    initParallax3D();
    
    // Interactive 3D Skill Items
    init3DSkills();
    
    // 3D Contact Form Effects
    init3DContactForm();
});

// 3D Logo Animation
function initLogo3D() {
    const canvas = document.getElementById('logo-canvas');
    if (!canvas) return;
    
    let scene, camera, renderer, logoGroup;
    let mouseX = 0, mouseY = 0;
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(150, 150);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create logo group
    logoGroup = new THREE.Group();
    
    // Create multiple geometric shapes for logo
    const geometries = [
        new THREE.IcosahedronGeometry(0.8, 0),
        new THREE.OctahedronGeometry(0.6, 0),
        new THREE.TetrahedronGeometry(0.5, 0)
    ];
    
    const materials = [
        new THREE.MeshPhongMaterial({ 
            color: 0x6c5ce7, 
            transparent: true, 
            opacity: 0.8,
            wireframe: false,
            shininess: 100
        }),
        new THREE.MeshPhongMaterial({ 
            color: 0xa29bfe, 
            transparent: true, 
            opacity: 0.6,
            wireframe: true
        }),
        new THREE.MeshPhongMaterial({ 
            color: 0xfd79a8, 
            transparent: true, 
            opacity: 0.7,
            wireframe: false,
            shininess: 100
        })
    ];
    
    geometries.forEach((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, materials[index]);
        mesh.position.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        logoGroup.add(mesh);
    });
    
    scene.add(logoGroup);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x6c5ce7, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xfd79a8, 0.8, 100);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);
    
    camera.position.z = 3;
    
    // Mouse interaction
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate logo group
        logoGroup.rotation.x += 0.005;
        logoGroup.rotation.y += 0.01;
        
        // Mouse interaction
        logoGroup.rotation.x += mouseY * 0.001;
        logoGroup.rotation.y += mouseX * 0.001;
        
        // Individual mesh rotations
        logoGroup.children.forEach((mesh, index) => {
            mesh.rotation.x += 0.01 * (index + 1);
            mesh.rotation.y += 0.005 * (index + 1);
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(150, 150);
    });
}

// 3D Project Canvas
function initProject3D() {
    const canvas = document.getElementById('project-canvas');
    if (!canvas) return;
    
    let scene, camera, renderer, codeGroup;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 400 / 200, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(400, 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create floating code blocks
    codeGroup = new THREE.Group();
    
    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0x6c5ce7 : 0xa29bfe,
            transparent: true,
            opacity: 0.7
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );
        
        cube.userData = {
            originalY: cube.position.y,
            speed: Math.random() * 0.02 + 0.01
        };
        
        codeGroup.add(cube);
    }
    
    scene.add(codeGroup);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x6c5ce7, 1, 100);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    camera.position.z = 3;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        codeGroup.rotation.y += 0.005;
        
        codeGroup.children.forEach((cube) => {
            cube.rotation.x += cube.userData.speed;
            cube.rotation.y += cube.userData.speed * 0.5;
            cube.position.y = cube.userData.originalY + Math.sin(Date.now() * cube.userData.speed) * 0.2;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Enhanced 3D Card Effects
function init3DCards() {
    const cards = document.querySelectorAll('.skill-item, .contact-item, .project-card');
    
    cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.3s ease';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'rotateX(10deg) rotateY(10deg) translateZ(20px)';
            card.style.boxShadow = '0 20px 40px rgba(108, 92, 231, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
            card.style.boxShadow = 'none';
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
    });
}

// Parallax 3D Effects
function initParallax3D() {
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        sections.forEach((section, index) => {
            const rate = scrollTop * -0.5;
            const yPos = -(rate / (index + 1));
            
            // Apply parallax to background elements
            const bgElements = section.querySelectorAll('.section-header, .about-image, .skills-category h3');
            bgElements.forEach(el => {
                el.style.transform = `translate3d(0, ${yPos * 0.1}px, 0)`;
            });
        });
    });
}

// 3D Skills Animation
function init3DSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        const icon = item.querySelector('.skill-icon');
        if (!icon) return;
        
        // Add 3D rotation effect
        icon.style.transformStyle = 'preserve-3d';
        icon.style.transition = 'transform 0.5s ease';
        
        // Staggered entrance animation
        gsap.from(item, {
            y: 50,
            opacity: 0,
            rotationX: -90,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                rotationY: 360,
                scale: 1.2,
                duration: 0.6,
                ease: 'power2.out'
            });
            
            gsap.to(item, {
                y: -10,
                boxShadow: '0 15px 30px rgba(108, 92, 231, 0.4)',
                duration: 0.3
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                rotationY: 0,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out'
            });
            
            gsap.to(item, {
                y: 0,
                boxShadow: 'none',
                duration: 0.3
            });
        });
    });
}

// 3D Contact Form Effects
function init3DContactForm() {
    const formGroups = document.querySelectorAll('.form-group');
    const contactItems = document.querySelectorAll('.contact-item');
    
    // Floating animation for contact items
    contactItems.forEach((item, index) => {
        gsap.to(item, {
            y: -5,
            duration: 2 + index * 0.5,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1
        });
        
        // 3D tilt effect
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                rotationY: 5,
                rotationX: 5,
                z: 20,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                rotationY: 0,
                rotationX: 0,
                z: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
    
    // Form field 3D effects
    formGroups.forEach((group, index) => {
        const input = group.querySelector('input, textarea');
        
        if (input) {
            input.style.transformStyle = 'preserve-3d';
            
            input.addEventListener('focus', () => {
                gsap.to(group, {
                    rotationX: 2,
                    z: 10,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            input.addEventListener('blur', () => {
                gsap.to(group, {
                    rotationX: 0,
                    z: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        }
    });
}

// Enhanced Button 3D Effects
function init3DButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.style.transformStyle = 'preserve-3d';
        
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                rotationX: -10,
                y: -5,
                z: 10,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                rotationX: 0,
                y: 0,
                z: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        button.addEventListener('mousedown', () => {
            gsap.to(button, {
                scale: 0.95,
                duration: 0.1
            });
        });
        
        button.addEventListener('mouseup', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.1
            });
        });
    });
}

// Initialize button effects
document.addEventListener('DOMContentLoaded', () => {
    init3DButtons();
});

// Performance optimization
function optimizePerformance() {
    // Reduce animation complexity on mobile
    if (window.innerWidth < 768) {
        // Disable some intensive 3D effects on mobile
        const intensiveElements = document.querySelectorAll('.skill-item, .contact-item');
        intensiveElements.forEach(el => {
            el.style.transform = 'none';
        });
    }
}

window.addEventListener('resize', optimizePerformance);
optimizePerformance();
