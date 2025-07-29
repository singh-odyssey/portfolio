// Three.js Animation for Hero Section - Enhanced Ultra-Realistic 3D
document.addEventListener('DOMContentLoaded', function() {
    // Check if the canvas exists
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Initialize Three.js scene
    let scene, camera, renderer, geometry;
    let mouseX = 0, mouseY = 0;
    let particleSystem, nebula;
    let clock;
    let isMouseMoving = false;
    let mouseTimeout;
    let composer, renderPass, bloomPass;
    
    // Set up window dimensions
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    // Initialize the 3D scene
    function init() {
        // Create scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0f0f13, 0.0008);
        
        // Set up camera with wider field of view for better coverage
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;
        
        // Initialize clock
        clock = new THREE.Clock();
        
        // Create enhanced particle geometry
        geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const velocities = [];
        const phases = [];
        const color = new THREE.Color();
        const sizes = [];
        
        // Calculate particle count based on screen size for better performance
        const isMobile = window.innerWidth < 768;
        const numParticles = isMobile ? 2000 : 5000; // More particles for desktop
        
        // Adjust spread based on screen size to ensure full coverage
        const spreadX = window.innerWidth * 1.5;
        const spreadY = window.innerHeight * 1.5;
        const spreadZ = 1500;
        
        for (let i = 0; i < numParticles; i++) {
            // Position particles to cover the entire screen area
            const x = (Math.random() - 0.5) * spreadX;
            const y = (Math.random() - 0.5) * spreadY;
            const z = (Math.random() - 0.5) * spreadZ;
            
            vertices.push(x, y, z);
            
            // Add velocities for organic movement
            velocities.push(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            );
            
            // Add phase for wave-like motion
            phases.push(Math.random() * Math.PI * 2);
            
            // Enhanced size variation
            sizes.push(Math.random() * 6 + 1);
            
            // Create a more vibrant color palette with depth
            const distance = Math.sqrt(x * x + y * y + z * z);
            const normalizedDistance = Math.min(distance / (spreadX * 0.5), 1);
            
            const hue = 0.55 + Math.random() * 0.3 + normalizedDistance * 0.1; // Blue to purple range
            const saturation = 0.8 + Math.random() * 0.2;
            const lightness = 0.4 + Math.random() * 0.4 + (1 - normalizedDistance) * 0.2;
            
            color.setHSL(hue, saturation, lightness);
            colors.push(color.r, color.g, color.b);
        }
        
        // Set attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
        
        // Store original positions for reference
        geometry.userData = {
            originalPositions: [...vertices],
            originalColors: [...colors]
        };
        
        // Create enhanced point material with custom shader
        const particleMaterial = new THREE.PointsMaterial({
            size: 4,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            alphaTest: 0.001
        });
        
        // Create particles system
        particleSystem = new THREE.Points(geometry, particleMaterial);
        scene.add(particleSystem);
        
        // Add nebula/cosmic dust effect
        createNebula();
        
        // Add ambient lighting effects
        createLighting();
        
        // Set up renderer with enhanced settings
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        
        // Add event listeners
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('touchmove', onDocumentTouchMove);
        window.addEventListener('resize', onWindowResize);
    }
    
    function createNebula() {
        // Create a nebula-like background effect
        const nebulaGeometry = new THREE.PlaneGeometry(window.innerWidth * 3, window.innerHeight * 3);
        const nebulaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                varying vec2 vUv;
                
                float noise(vec2 p) {
                    return sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453;
                }
                
                void main() {
                    vec2 uv = vUv;
                    vec2 center = vec2(0.5);
                    float dist = distance(uv, center);
                    
                    float n1 = sin(time * 0.5 + uv.x * 3.0) * 0.5 + 0.5;
                    float n2 = sin(time * 0.3 + uv.y * 4.0) * 0.5 + 0.5;
                    float n3 = sin(time * 0.7 + dist * 8.0) * 0.5 + 0.5;
                    
                    vec3 color1 = vec3(0.42, 0.36, 0.91); // Primary color
                    vec3 color2 = vec3(0.64, 0.61, 0.996); // Secondary color
                    vec3 color3 = vec3(0.99, 0.47, 0.66); // Accent color
                    
                    vec3 finalColor = mix(color1, color2, n1);
                    finalColor = mix(finalColor, color3, n2 * 0.3);
                    
                    float alpha = (1.0 - dist) * 0.1 * n3;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        nebula.position.z = -1500;
        scene.add(nebula);
    }
    
    function createLighting() {
        // Enhanced ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        // Dynamic point lights
        const light1 = new THREE.PointLight(0x6c5ce7, 2, 2000);
        light1.position.set(500, 500, 500);
        scene.add(light1);
        
        const light2 = new THREE.PointLight(0xfd79a8, 1.5, 2000);
        light2.position.set(-500, -500, 500);
        scene.add(light2);
        
        const light3 = new THREE.PointLight(0xa29bfe, 1, 2000);
        light3.position.set(0, 0, -500);
        scene.add(light3);
        
        // Store lights for animation
        scene.userData.lights = [light1, light2, light3];
    }
    
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update nebula size
        if (nebula) {
            nebula.geometry.dispose();
            nebula.geometry = new THREE.PlaneGeometry(window.innerWidth * 3, window.innerHeight * 3);
        }
    }
    
    function onDocumentMouseMove(event) {
        // Update mouse position with smoother interpolation
        const targetMouseX = (event.clientX - windowHalfX) * 0.2;
        const targetMouseY = (event.clientY - windowHalfY) * 0.2;
        
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        // Enhanced mouse interaction with particles
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Apply magnetic effects to particles
        if (particleSystem) {
            const positions = particleSystem.geometry.attributes.position.array;
            const originalPositions = particleSystem.geometry.userData.originalPositions;
            const mouseForce = 80;
            const mouseRange = 300;
            
            for (let i = 0; i < positions.length; i += 3) {
                const originalX = originalPositions[i];
                const originalY = originalPositions[i + 1];
                
                // Convert mouse to world coordinates
                const mouseWorldX = mouse.x * window.innerWidth * 0.75;
                const mouseWorldY = mouse.y * window.innerHeight * 0.75;
                
                // Calculate distance to mouse
                const dx = originalX - mouseWorldX;
                const dy = originalY - mouseWorldY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Apply attractive/repulsive force
                if (distance < mouseRange) {
                    const force = (mouseRange - distance) / mouseRange;
                    const angle = Math.atan2(dy, dx);
                    
                    // Repulsive force
                    positions[i] = originalX + Math.cos(angle) * force * mouseForce;
                    positions[i + 1] = originalY + Math.sin(angle) * force * mouseForce;
                }
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Set mouse moving state
        isMouseMoving = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 2000);
    }
    
    function onDocumentTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            onDocumentMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }
    
    function animate() {
        requestAnimationFrame(animate);
        render();
    }
    
    function render() {
        const time = clock.getElapsedTime();
        
        // Smooth camera movement based on mouse position
        camera.position.x += (mouseX - camera.position.x) * 0.01;
        camera.position.y += (-mouseY - camera.position.y) * 0.01;
        camera.lookAt(scene.position);
        
        // Enhanced particle system animation
        if (particleSystem) {
            // Gentle rotation
            particleSystem.rotation.y = time * 0.01;
            particleSystem.rotation.x = Math.sin(time * 0.005) * 0.05;
            
            // Enhanced organic movement
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.geometry.attributes.velocity.array;
            const phases = particleSystem.geometry.attributes.phase.array;
            const originalPositions = particleSystem.geometry.userData.originalPositions;
            const colors = particleSystem.geometry.attributes.color.array;
            const originalColors = particleSystem.geometry.userData.originalColors;
            
            if (originalPositions) {
                for (let i = 0; i < positions.length; i += 3) {
                    const idx = i / 3;
                    
                    // Wave-like motion
                    const waveX = Math.sin(time * 0.3 + phases[idx]) * 15;
                    const waveY = Math.cos(time * 0.4 + phases[idx] * 1.5) * 15;
                    const waveZ = Math.sin(time * 0.2 + phases[idx] * 0.8) * 20;
                    
                    // Brownian motion
                    velocities[i] += (Math.random() - 0.5) * 0.01;
                    velocities[i + 1] += (Math.random() - 0.5) * 0.01;
                    velocities[i + 2] += (Math.random() - 0.5) * 0.01;
                    
                    // Damping
                    velocities[i] *= 0.98;
                    velocities[i + 1] *= 0.98;
                    velocities[i + 2] *= 0.98;
                    
                    // Apply movement
                    positions[i] = originalPositions[i] + waveX + velocities[i] * 50;
                    positions[i + 1] = originalPositions[i + 1] + waveY + velocities[i + 1] * 50;
                    positions[i + 2] = originalPositions[i + 2] + waveZ + velocities[i + 2] * 50;
                    
                    // Dynamic color shifting
                    const colorPhase = time * 0.5 + phases[idx];
                    const colorShift = Math.sin(colorPhase) * 0.1;
                    colors[i] = originalColors[i] + colorShift;
                    colors[i + 1] = originalColors[i + 1] + colorShift;
                    colors[i + 2] = originalColors[i + 2] + colorShift;
                }
                
                particleSystem.geometry.attributes.position.needsUpdate = true;
                particleSystem.geometry.attributes.color.needsUpdate = true;
            }
        }
        
        // Animate nebula
        if (nebula) {
            nebula.material.uniforms.time.value = time;
            nebula.rotation.z = time * 0.002;
        }
        
        // Animate lights
        if (scene.userData.lights) {
            scene.userData.lights.forEach((light, index) => {
                const lightTime = time + index * Math.PI * 0.6;
                light.intensity = 1 + Math.sin(lightTime * 0.5) * 0.5;
                light.position.x += Math.sin(lightTime * 0.1) * 2;
                light.position.y += Math.cos(lightTime * 0.15) * 2;
            });
        }
        
        renderer.render(scene, camera);
    }
    
    // Initialize and start animation
    init();
    animate();
});
