// Three.js Hero Scene: Holographic Orb + Orbiters + Particle Field with Bloom
// Modern, eye-catching, and performant with mobile/reduced-motion fallbacks

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Core
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0d12, 0.001);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 0, 110);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Postprocessing (Unreal Bloom)
  let composer, bloomPass;
  if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.RenderPass !== 'undefined') {
    const renderPass = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.75, 0.2);
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
  }

  // Settings
  const clock = new THREE.Clock();
  const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lights
  scene.add(new THREE.AmbientLight(0x6680ff, 0.55));
  const keyLight = new THREE.DirectionalLight(0x88aaff, 0.9);
  keyLight.position.set(6, 8, 10);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x66ccff, 1.1, 900);
  rimLight.position.set(-120, -90, 70);
  scene.add(rimLight);

  // Holographic Orb (Fresnel shader)
  const orbGroup = new THREE.Group();
  scene.add(orbGroup);

  const orbGeometry = new THREE.IcosahedronGeometry(24, 3);
  const fresnelUniforms = {
    time: { value: 0 },
    color1: { value: new THREE.Color('#6C5CE7') },
    color2: { value: new THREE.Color('#00E5FF') },
    rimPower: { value: 2.2 },
    opacity: { value: 0.95 },
  };
  const orbMaterial = new THREE.ShaderMaterial({
    uniforms: fresnelUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float time; 
      uniform vec3 color1; 
      uniform vec3 color2; 
      uniform float rimPower; 
      uniform float opacity; 
      varying vec3 vNormal; 
      varying vec3 vWorldPosition; 
      void main(){
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), rimPower);
        float glow = 0.35 + 0.65 * rim;
        float pulse = 0.5 + 0.5 * sin(time * 1.5);
        vec3 col = mix(color1, color2, pulse) * glow;
        gl_FragColor = vec4(col, opacity * glow);
      }
    `,
    depthWrite: false
  });
  const orb = new THREE.Mesh(orbGeometry, orbMaterial);
  orbGroup.add(orb);

  // Inner wireframe core
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(15, 1),
    new THREE.MeshBasicMaterial({ color: 0x99ccff, wireframe: true, transparent: true, opacity: 0.25 })
  );
  orbGroup.add(core);

  // Orbiting glow satellites
  const satellites = [];
  const satCount = isMobile ? 6 : 10;
  for (let i = 0; i < satCount; i++) {
    const satMat = new THREE.MeshStandardMaterial({ color: 0x66e6ff, emissive: 0x66e6ff, emissiveIntensity: 1.4, metalness: 0.2, roughness: 0.15 });
    const s = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), satMat);
    s.userData = {
      radius: 32 + Math.random() * 20,
      speed: 0.5 + Math.random() * 0.8,
      tilt: Math.random() * Math.PI,
      phase: Math.random() * Math.PI * 2,
    };
    satellites.push(s);
    orbGroup.add(s);
  }

  // Particle field
  const particleCount = reducedMotion ? 350 : (isMobile ? 900 : 1800);
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const colorA = new THREE.Color('#3F51B5');
  const colorB = new THREE.Color('#00BCD4');
  const spread = { x: 520, y: 420, z: 720 };
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread.x;
    positions[i3 + 1] = (Math.random() - 0.5) * spread.y;
    positions[i3 + 2] = (Math.random() - 0.5) * spread.z - 150;
    velocities[i3] = (Math.random() - 0.5) * 0.05;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
    const t = Math.random();
    const c = colorA.clone().lerp(colorB, t);
    colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particleMaterial = new THREE.PointsMaterial({ size: 2.0, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Nebula plane (soft backdrop)
  const nebula = new THREE.Mesh(
    new THREE.PlaneGeometry(2200, 1300, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0b0d12, transparent: true, opacity: 0.35 })
  );
  nebula.position.set(0, 0, -420);
  scene.add(nebula);

  // Interaction state
  const mouse = new THREE.Vector2(0, 0);
  let targetCamera = new THREE.Vector3(0, 0, 110);
  let scrollY = 0;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.set(x, y);
  }

  function onTouchMove(e) {
    if (!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    const x = (t.clientX / window.innerWidth) * 2 - 1;
    const y = -(t.clientY / window.innerHeight) * 2 + 1;
    mouse.set(x, y);
  }

  function onScroll() { scrollY = window.scrollY || 0; }

  window.addEventListener('resize', onResize);
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Animation loop
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.033);
    const t = clock.elapsedTime;
    fresnelUniforms.time.value = t;

    // Camera parallax + gentle zoom on scroll
    const parallaxX = mouse.x * 10;
    const parallaxY = mouse.y * 6;
    const targetZ = 110 + Math.min(scrollY * 0.05, 50);
    targetCamera.set(parallaxX, parallaxY, targetZ);
    camera.position.lerp(targetCamera, 0.06);
    camera.lookAt(0, 0, 0);

    // Orb subtle motion
    if (!reducedMotion) {
      orbGroup.rotation.y += 0.15 * dt;
      core.rotation.x -= 0.25 * dt;
    }

    // Update satellites
    satellites.forEach((s) => {
      const u = s.userData;
      const angle = t * u.speed + u.phase;
      const r = u.radius;
      s.position.set(
        Math.cos(u.tilt) * r * Math.cos(angle),
        Math.sin(u.tilt) * r * Math.sin(angle),
        Math.sin(angle * 0.75) * 12
      );
    });

    // Particle drift
    const pos = particleGeometry.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      // Soft bounds
      if (positions[i3] > spread.x * 0.5 || positions[i3] < -spread.x * 0.5) velocities[i3] *= -1;
      if (positions[i3 + 1] > spread.y * 0.5 || positions[i3 + 1] < -spread.y * 0.5) velocities[i3 + 1] *= -1;
      if (positions[i3 + 2] > 200 || positions[i3 + 2] < -spread.z) velocities[i3 + 2] *= -1;
    }
    pos.needsUpdate = true;

    // Mouse attractor into scene space
    const attractStrength = isMobile ? 0.02 : 0.04;
    const v = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    particles.position.lerp(v.multiplyScalar(0.05), attractStrength * dt);

    // Bloom tuning on motion/scroll
    if (bloomPass) {
      const motion = Math.abs(mouse.x) + Math.abs(mouse.y) + Math.min(scrollY / 2000, 0.5);
      const base = reducedMotion ? 0.2 : 0.6;
      bloomPass.strength = base + motion * 0.7;
      bloomPass.radius = 0.85;
      bloomPass.threshold = 0.15;
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  // Initial placement
  orbGroup.position.set(0, 0, 0);
  onResize();
  animate();

  // Pause heavy updates when not visible (basic)
  document.addEventListener('visibilitychange', () => {
    // Renderer loop is controlled via requestAnimationFrame; browsers throttle on hidden tabs.
  });
});
