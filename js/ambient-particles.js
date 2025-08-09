// Lightweight ambient particles with soft lighting across the page
// Canvas 2D implementation. Respects reduced motion.
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  if (reduced) return;

  // Create canvas layer
  const c = document.createElement('canvas');
  c.className = 'ambient-canvas';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const ctx = c.getContext('2d');

  let w = c.width = window.innerWidth;
  let h = c.height = window.innerHeight;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  c.width = w * DPR;
  c.height = h * DPR;
  ctx.scale(DPR, DPR);

  // Config
  const count = isMobile ? 60 : 120;
  const particles = [];
  const palette = ['#6C5CE7', '#A29BFE', '#00E5FF'];
  const light = { x: w * 0.6, y: h * 0.3, r: Math.min(w, h) * 0.7 };

  function rnd(min, max){ return Math.random() * (max - min) + min; }

  function makeParticle(){
    return {
      x: rnd(0, w), y: rnd(0, h),
      vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2),
      sz: rnd(1, 2.5) * (isMobile ? 0.8 : 1),
      hue: palette[Math.floor(Math.random() * palette.length)],
      alpha: rnd(0.35, 0.75)
    };
  }

  for (let i = 0; i < count; i++) particles.push(makeParticle());

  // Resize
  window.addEventListener('resize', () => {
    w = c.width = window.innerWidth; h = c.height = window.innerHeight;
    c.width = w * DPR; c.height = h * DPR; ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR, DPR);
  });

  // Mouse light drift
  const mouse = { x: w * 0.6, y: h * 0.3 };
  document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('touchmove', (e) => { if (!e.touches[0]) return; mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });

  function drawGlow(x, y, r, color, alpha){
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace(')', ', 0.35)').replace('rgb', 'rgba'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
  }

  function hexToRGB(hex){
    const c = hex.replace('#','');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }

  function step(){
    ctx.clearRect(0, 0, w, h);

    // Soft ambient light halo
    const lr = light.r * (isMobile ? 0.7 : 1);
    const lx = mouse.x * 0.1 + light.x * 0.9;
    const ly = mouse.y * 0.1 + light.y * 0.9;
    drawGlow(lx, ly, lr, hexToRGB('#6C5CE7'), 0.8);
    drawGlow(w - lx * 0.9, h - ly * 0.9, lr * 0.8, hexToRGB('#00E5FF'), 0.6);

    // Lines between nearby particles
    ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.strokeStyle = 'rgba(108,92,231,0.5)';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y; const d = Math.hypot(dx, dy);
        if (d < 120) { ctx.globalAlpha = 0.25 * (1 - d/120); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
    }
    ctx.globalAlpha = 1;

    // Particles
    for (let p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
      // light weighting
      const dx = p.x - lx, dy = p.y - ly; const d = Math.hypot(dx, dy);
      const glow = Math.max(0, 1 - d / (lr));
      ctx.fillStyle = hexToRGB(p.hue);
      ctx.globalAlpha = p.alpha * (0.4 + glow * 0.6);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz + glow * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(step);
  }
  step();
})();
