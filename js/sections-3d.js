// Sections 3D Backgrounds (About, Projects, Skills, Contact)
// Single fixed renderer that swaps light scenes per section.
// Designed to complement the existing hero Three.js scene without overlapping heaviness.

(function () {
  if (typeof THREE === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  if (reducedMotion) return; // Respect reduced motion for background scenes

  const sectionIds = ['about', 'projects', 'skills', 'contact'];
  const sections = sectionIds
    .map((id) => ({ id, el: document.getElementById(id) }))
    .filter((s) => s.el);
  if (!sections.length) return;

  // Canvas setup
  const canvas = document.createElement('canvas');
  canvas.className = 'webgl-sections-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  // Core
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  // Separate scenes per section
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 65);

  const clock = new THREE.Clock();
  let activeIdx = -1;

  const scenes = {};
  const updaters = {};
  const trails = {}; // neon trail per scene

  // Postprocessing (composer shared across scenes)
  let composer = null, renderPass = null, bloomPass = null, vignettePass = null;
  if (
    typeof THREE.EffectComposer !== 'undefined' &&
    typeof THREE.RenderPass !== 'undefined' &&
    typeof THREE.UnrealBloomPass !== 'undefined' &&
    typeof THREE.ShaderPass !== 'undefined'
  ) {
    composer = new THREE.EffectComposer(renderer);
    renderPass = new THREE.RenderPass(new THREE.Scene(), camera);
    composer.addPass(renderPass);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), isMobile ? 0.55 : 0.95, 0.7, 0.2);
    composer.addPass(bloomPass);
    // Vignette shader for focus
    const VignetteShader = {
      uniforms: { tDiffuse: { value: null }, offset: { value: 1.05 }, darkness: { value: 1.15 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float offset; uniform float darkness; varying vec2 vUv; void main(){ vec4 texel=texture2D(tDiffuse, vUv); vec2 uv=(vUv-0.5)*vec2(offset); float v=smoothstep(0.85,0.0,dot(uv,uv)); gl_FragColor=vec4(texel.rgb*mix(1.0,v,darkness*0.35),texel.a); }`
    };
    vignettePass = new THREE.ShaderPass(VignetteShader);
    composer.addPass(vignettePass);
  }

  // Helpers
  const tmpVec3 = new THREE.Vector3();
  const mouse = new THREE.Vector2(0, 0);
  let targetCam = new THREE.Vector3(0, 0, 65);

  function commonLights(scene) {
    scene.add(new THREE.AmbientLight(0x6c5ce7, 0.4));
    const key = new THREE.DirectionalLight(0xa29bfe, 0.8);
    key.position.set(6, 10, 10);
    scene.add(key);
  }

  function initTrailForScene(id, scene) {
    const group = new THREE.Group();
    scene.add(group);
    trails[id] = { group, particles: [] };
  }

  function spawnTrailParticle(id, worldPos, color = 0x6c5ce7, scale = 0.9, life = 0.9) {
    const t = trails[id];
    if (!t) return;
    const geo = new THREE.SphereGeometry(0.6, 10, 10);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(worldPos);
    m.scale.setScalar(scale * (isMobile ? 0.6 : 1));
    t.group.add(m);
    t.particles.push({ m, life, maxLife: life, drift: new THREE.Vector3((Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4, (Math.random()-0.5)*0.2) });
    if (t.particles.length > 250) { const old = t.particles.shift(); t.group.remove(old.m); old.m.geometry.dispose(); old.m.material.dispose(); }
  }

  // Scene: About (low-poly waving grid + points)
  (function createAbout() {
    const id = 'about';
    const scene = new THREE.Scene();
    commonLights(scene);
    // Grid surface
    const w = 120, h = 80, segX = isMobile ? 30 : 60, segY = isMobile ? 20 : 40;
    const geo = new THREE.PlaneGeometry(w, h, segX, segY);
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1b22, wireframe: true, transparent: true, opacity: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 3.2;
    mesh.position.set(0, -18, -10);
    scene.add(mesh);

    // Floating points above
    const count = isMobile ? 400 : 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * w * 0.9;
      positions[i3 + 1] = Math.random() * 30 - 10;
      positions[i3 + 2] = Math.random() * -120;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ size: 1.6, color: 0x6c5ce7, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    // Neon centerpiece for wow factor
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(8, 0.8, 220, 18),
      new THREE.MeshStandardMaterial({ color: 0x6c5ce7, emissive: 0x6c5ce7, emissiveIntensity: 1.4, metalness: 0.2, roughness: 0.25, transparent: true, opacity: 0.85 })
    );
    knot.position.set(0, 6, -20);
    scene.add(knot);

    scenes[id] = scene;
    updaters[id] = (t, dt) => {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ix = i % (segX + 1);
        const iy = Math.floor(i / (segX + 1));
        const offset = (ix / segX) * Math.PI * 2 + (iy / segY) * Math.PI;
        pos.setZ(i, Math.sin(t * 0.8 + offset) * 1.2);
      }
      pos.needsUpdate = true;

      mesh.rotation.z = Math.sin(t * 0.15) * 0.05;
      pts.rotation.y += 0.02 * dt;
      knot.rotation.x += 0.2 * dt; knot.rotation.y += 0.35 * dt;
      if (bloomPass) bloomPass.strength = (isMobile ? 0.45 : 0.75) + 0.15 * Math.sin(t * 0.8);
    };
    initTrailForScene(id, scene);
  })();

  // Scene: Projects (rotating wireframe cubes + parallax grid)
  (function createProjects() {
    const id = 'projects';
    const scene = new THREE.Scene();
    commonLights(scene);

    // Floor grid
    const grid = new THREE.GridHelper(240, 40, 0x6c5ce7, 0x2a2b33);
    grid.position.y = -28;
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    scene.add(grid);

    // Wire cubes
    const group = new THREE.Group();
    const cubeCount = isMobile ? 12 : 22;
    for (let i = 0; i < cubeCount; i++) {
      const size = 3 + Math.random() * 6;
      const geo = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x6c5ce7 : 0xa29bfe, wireframe: true, transparent: true, opacity: 0.7 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((Math.random() - 0.5) * 120, (Math.random() - 0.4) * 60, (Math.random() - 0.5) * -160);
      m.userData = { rx: Math.random() * 0.3 + 0.05, ry: Math.random() * 0.3 + 0.05 };
      group.add(m);
    }
    scene.add(group);

    // Stylized arc of translucent planes with wireframe edges
    const arc = new THREE.Group();
    const planes = isMobile ? 6 : 10;
    for (let i = 0; i < planes; i++) {
      const g = new THREE.PlaneGeometry(14, 9);
      const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 });
      const p = new THREE.Mesh(g, m);
      const angle = (i / planes) * Math.PI * 1.2 - Math.PI * 0.6;
      p.position.set(Math.sin(angle) * 50, 5 + Math.cos(i) * 3, -30 + Math.cos(angle) * 10);
      p.lookAt(0, 0, -60);
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(14.2, 9.2), new THREE.MeshBasicMaterial({ color: (i % 2 ? 0x6c5ce7 : 0xa29bfe), wireframe: true, transparent: true, opacity: 0.6 }));
      edge.position.copy(p.position);
      edge.quaternion.copy(p.quaternion);
      arc.add(p); arc.add(edge);
    }
    scene.add(arc);

    scenes[id] = scene;
    updaters[id] = (t, dt) => {
      group.children.forEach((m, i) => {
        m.rotation.x += m.userData.rx * dt * 2;
        m.rotation.y += m.userData.ry * dt * 2;
      });
      grid.position.z = -30 + Math.sin(t * 0.4) * 10;
      arc.rotation.y = Math.sin(t * 0.25) * 0.25;
      if (bloomPass) bloomPass.strength = (isMobile ? 0.5 : 0.85) + 0.1 * Math.sin(t * 0.6 + 1.5);
    };
    initTrailForScene(id, scene);
  })();

  // Scene: Skills (instanced bars rising + orbiting spheres)
  (function createSkills() {
    const id = 'skills';
    const scene = new THREE.Scene();
    commonLights(scene);

    // Instanced bars
    const cols = isMobile ? 14 : 24;
    const rows = isMobile ? 6 : 10;
    const total = cols * rows;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, metalness: 0.4, roughness: 0.3, emissive: 0x3f2bd1, emissiveIntensity: 0.2 });
    const inst = new THREE.InstancedMesh(geo, mat, total);
    const dummy = new THREE.Object3D();
    const spacing = 3.2;
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dummy.position.set((x - cols / 2) * spacing, (y - rows / 2) * spacing - 6, -30);
        dummy.scale.set(1, 1 + Math.random() * 8, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(i++, dummy.matrix);
      }
    }
    scene.add(inst);

    // Orbiting spheres
    const spheres = [];
    const sphCount = isMobile ? 6 : 10;
    for (let s = 0; s < sphCount; s++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xa29bfe, emissive: 0x6c5ce7, emissiveIntensity: 0.6 }));
      m.userData = { r: 22 + Math.random() * 10, sp: 0.5 + Math.random() * 0.8, tilt: Math.random() * Math.PI, ph: Math.random() * Math.PI * 2 };
      spheres.push(m);
      scene.add(m);
    }

    // Sweeping laser scan across bars
    const laser = new THREE.Mesh(new THREE.PlaneGeometry(260, 3), new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }));
    laser.rotation.x = -Math.PI * 0.05;
    laser.position.set(0, -6, -25);
    scene.add(laser);

    scenes[id] = scene;
    updaters[id] = (t, dt) => {
      for (let idx = 0; idx < total; idx++) {
        inst.getMatrixAt(idx, dummy.matrix);
        dummy.position.setFromMatrixPosition(dummy.matrix);
        const base = Math.sin(t * 1.2 + dummy.position.x * 0.25 + dummy.position.y * 0.15) * 4 + 6;
        dummy.scale.set(1, Math.max(0.8, base), 1);
        dummy.updateMatrix();
        inst.setMatrixAt(idx, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;

      spheres.forEach((m) => {
        const u = m.userData; const a = t * u.sp + u.ph; const r = u.r;
        m.position.set(Math.cos(u.tilt) * r * Math.cos(a), Math.sin(u.tilt) * r * Math.sin(a), Math.sin(a * 0.8) * 8 - 10);
      });
      laser.position.y = -14 + Math.sin(t * 0.8) * 18;
      if (bloomPass) bloomPass.strength = (isMobile ? 0.45 : 0.8) + 0.1 * Math.sin(t * 0.9 + 0.6);
    };
    initTrailForScene(id, scene);
  })();

  // Scene: Contact (constellation that connects to mouse)
  (function createContact() {
    const id = 'contact';
    const scene = new THREE.Scene();
    commonLights(scene);

    const count = isMobile ? 120 : 240;
    const pts = [];
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 150;
      pos[i3 + 1] = (Math.random() - 0.5) * 90;
      pos[i3 + 2] = (Math.random() - 0.5) * -140;
      pts.push(new THREE.Vector3(pos[i3], pos[i3 + 1], pos[i3 + 2]));
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 1.8, color: 0xa29bfe, transparent: true, opacity: 0.9 });
    const pointCloud = new THREE.Points(geom, mat);
    scene.add(pointCloud);

    const lineGeom = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.5 });
    const line = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(line);

    scenes[id] = scene;
    updaters[id] = (t, dt) => {
      // Gentle float
      const arr = geom.getAttribute('position');
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        arr.array[i3 + 1] += Math.sin(t * 0.8 + i) * 0.005;
      }
      arr.needsUpdate = true;

      // Rebuild connection lines for near pairs and mouse
      const pts2d = [];
      const maxDist = isMobile ? 18 : 26;
      for (let i = 0; i < count; i++) pts2d[i] = new THREE.Vector3(arr.array[i * 3], arr.array[i * 3 + 1], arr.array[i * 3 + 2]);
      const lines = [];
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          if (lines.length > 600) break;
          const d = pts2d[i].distanceTo(pts2d[j]);
          if (d < maxDist) { lines.push(pts2d[i].x, pts2d[i].y, pts2d[i].z, pts2d[j].x, pts2d[j].y, pts2d[j].z); }
        }
      }
      // Connect to mouse projected point
      const mWorld = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
      for (let i = 0; i < count; i++) {
        if (mWorld.distanceTo(pts2d[i]) < (isMobile ? 28 : 36)) {
          lines.push(mWorld.x, mWorld.y, mWorld.z, pts2d[i].x, pts2d[i].y, pts2d[i].z);
        }
      }
      lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(lines), 3));
      lineGeom.setDrawRange(0, lines.length / 3);
      if (bloomPass) bloomPass.strength = (isMobile ? 0.5 : 0.9) + 0.12 * Math.sin(t * 0.7 + 2.1);
    };
    initTrailForScene(id, scene);
  })();

  // Section detection
  const observer = new IntersectionObserver(
    (entries) => {
      // Pick the most visible section
      let top = 0; let idx = activeIdx;
      entries.forEach((e) => {
        const i = sectionIds.indexOf(e.target.id);
        if (i !== -1 && e.intersectionRatio > top) { top = e.intersectionRatio; idx = i; }
      });
      // Pause when hero is dominant in viewport
      const hero = document.getElementById('home');
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const heroDominant = heroRect ? heroRect.top < window.innerHeight * 0.6 && heroRect.bottom > window.innerHeight * 0.4 : false;
      if (heroDominant) idx = -1;
      activeIdx = idx;
      canvas.style.opacity = activeIdx === -1 ? '0' : '1';
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  sections.forEach((s) => observer.observe(s.el));

  // Mouse parallax
  function onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.set(x, y);
  }
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    const x = (t.clientX / window.innerWidth) * 2 - 1;
    const y = -(t.clientY / window.innerHeight) * 2 + 1;
    mouse.set(x, y);
  }, { passive: true });

  // Resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Utility: project client coords to world space
  function toWorldFromClient(cx, cy, depth = 0.35) {
    const x = (cx / window.innerWidth) * 2 - 1;
    const y = -(cy / window.innerHeight) * 2 + 1;
    return new THREE.Vector3(x, y, depth).unproject(camera);
  }

  // Burst particles when hovering project cards
  document.addEventListener('mouseenter', (e) => {
    const el = e.target.closest && e.target.closest('.project-card');
    if (!el) return;
    if (activeIdx < 0) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const world = toWorldFromClient(cx, cy, 0.4);
    const id = sectionIds[activeIdx];
    for (let i = 0; i < (isMobile ? 10 : 18); i++) {
      const wp = world.clone().add(new THREE.Vector3((Math.random()-0.5)*6, (Math.random()-0.5)*4, (Math.random()-0.5)*3));
      spawnTrailParticle(id, wp, i % 2 ? 0xa29bfe : 0x6c5ce7, 1.2, 0.9 + Math.random()*0.6);
    }
  }, true);

  let lastTrailTime = 0;

  // Render loop
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.033);
    const t = clock.elapsedTime;

    // Camera gentle parallax
    targetCam.set(mouse.x * 6, mouse.y * 4, 65);
    camera.position.lerp(targetCam, 0.06);
    camera.lookAt(0, 0, 0);

    if (activeIdx >= 0) {
      const id = sectionIds[activeIdx];
      const scene = scenes[id];
      const update = updaters[id];
      if (update) update(t, dt);

      // Neon mouse trail
      if (t - lastTrailTime > (isMobile ? 0.09 : 0.05)) {
        const world = new THREE.Vector3(mouse.x, mouse.y, 0.45).unproject(camera);
        spawnTrailParticle(id, world, Math.random() > 0.5 ? 0x6c5ce7 : 0xa29bfe, 0.8, 0.7 + Math.random()*0.4);
        lastTrailTime = t;
      }
      // Update and fade trail particles
      const tr = trails[id];
      if (tr) {
        for (let i = tr.particles.length - 1; i >= 0; i--) {
          const p = tr.particles[i];
          p.life -= dt;
          p.m.position.addScaledVector(p.drift, dt * 10);
          const alpha = Math.max(0, p.life / p.maxLife);
          p.m.material.opacity = alpha * 0.9;
          p.m.scale.multiplyScalar(1 + dt * 0.8);
          if (p.life <= 0) {
            tr.group.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose();
            tr.particles.splice(i, 1);
          }
        }
      }

      if (composer) { renderPass.scene = scene; composer.render(); }
      else if (scene) renderer.render(scene, camera);
    } else {
      // Clear when inactive to avoid blending over hero
      renderer.clear(true, true, true);
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
