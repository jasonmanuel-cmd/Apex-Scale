// Apex Scale — Explainer engine (self-contained, no dependencies)
(function () {
  const scenes = Array.from(document.querySelectorAll('.ex-scene'));
  const dotsWrap = document.getElementById('dots');
  const bar = document.getElementById('progress-bar');
  const playBtn = document.getElementById('ex-play');
  const prevBtn = document.getElementById('ex-prev');
  const nextBtn = document.getElementById('ex-next');

  let current = 0;
  let playing = true;
  let elapsed = 0;
  let duration = parseInt(scenes[0].dataset.dur || '5200', 10);
  let lastFrame = performance.now();

  // ---------- Dots ----------
  scenes.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'ex-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to scene ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    current = ((i % scenes.length) + scenes.length) % scenes.length;
    scenes.forEach((s, idx) => s.classList.toggle('active', idx === current));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    duration = parseInt(scenes[current].dataset.dur || '5200', 10);
    elapsed = 0;
    bar.style.width = '0%';
  }

  function togglePlay() {
    playing = !playing;
    playBtn.textContent = playing ? '❚❚' : '▶';
  }

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  });

  // ---------- Canvas (particle field + swarm graph) ----------
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Background dust
  const dust = Array.from({ length: 80 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00035,
    vy: (Math.random() - 0.5) * 0.00035,
    r: Math.random() * 1.7 + 0.4,
    gold: Math.random() < 0.6
  }));

  // Swarm graph elements (scene 4)
  const platforms = [
    { label: 'TikTok', color: '#FF2D55' },
    { label: 'Reels', color: '#E4405F' },
    { label: 'Shorts', color: '#FF4D4D' },
    { label: 'X', color: '#E7E9EA' },
    { label: 'LinkedIn', color: '#0A66C2' }
  ];
  const subDots = Array.from({ length: 36 }, (_, i) => ({
    platform: i % platforms.length,
    angle: Math.random() * Math.PI * 2,
    dist: 26 + Math.random() * 54,
    r: 1.6 + Math.random() * 2.4,
    seed: Math.random() * Math.PI * 2
  }));
  const packets = [];

  function swarmPositions() {
    const cx = W / 2, cy = H * 0.60;
    const R = Math.min(W, H) * 0.30;
    const pts = platforms.map((p, i) => {
      const a = -Math.PI / 2 + (i - (platforms.length - 1) / 2) * 0.42;
      return { x: cx + Math.cos(a) * R, y: cy - Math.sin(a) * Math.abs(R) * 0.72 };
    });
    return { cx, cy, pts };
  }

  function spawnPackets() {
    const { cx, cy, pts } = swarmPositions();
    if (Math.random() < 0.5) {
      packets.push({ x: cx, y: cy, tx: pts[Math.floor(Math.random() * pts.length)].x, ty: pts[Math.floor(Math.random() * pts.length)].y, p: 0, gold: true });
    } else {
      packets.push({ x: cx, y: cy, tx: cx, ty: H * 0.86, p: 0, gold: false });
    }
  }

  function drawSwarm(now) {
    const { cx, cy, pts } = swarmPositions();
    const t = now / 1000;

    // connection lines
    pts.forEach((pt, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = 'rgba(212,175,55,0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // platform nodes
    pts.forEach((pt, i) => {
      const p = platforms[i];
      const pulse = 1 + Math.sin(t * 2 + i) * 0.08;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 9 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '600 10px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, pt.x, pt.y + 24);
    });

    // sub-account dots
    subDots.forEach((d) => {
      const pt = pts[d.platform];
      const x = pt.x + Math.cos(t * 0.6 + d.seed) * d.dist * 0.2 + Math.cos(d.angle) * d.dist;
      const y = pt.y + Math.sin(t * 0.5 + d.seed) * d.dist * 0.2 + Math.sin(d.angle) * d.dist;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212,175,55,0.5)';
      ctx.fill();
    });

    // central pillar
    const cp = 1 + Math.sin(t * 1.6) * 0.1;
    ctx.beginPath();
    ctx.arc(cx, cy, 20 * cp, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
    g.addColorStop(0, '#FFF2A3');
    g.addColorStop(0.5, '#D4AF37');
    g.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.fillStyle = g;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // funnel node
    ctx.beginPath();
    ctx.arc(cx, H * 0.86, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '600 10px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('INBOUND PIPELINE', cx, H * 0.86 + 28);

    // packets
    if (packets.length < 40) spawnPackets();
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i];
      pk.p += 0.012;
      if (pk.p >= 1) { packets.splice(i, 1); continue; }
      const x = pk.x + (pk.tx - pk.x) * pk.p;
      const y = pk.y + (pk.ty - pk.y) * pk.p;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = pk.gold ? 'rgba(245,208,97,0.9)' : 'rgba(16,185,129,0.9)';
      ctx.fill();
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    const t = now / 1000;
    dust.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; else if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; else if (p.y > 1) p.y = 0;
      const a = 0.18 + 0.18 * Math.sin(t + p.x * 12);
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold ? 'rgba(212,175,55,' + a + ')' : 'rgba(16,185,129,' + a + ')';
      ctx.fill();
    });
    if (current === 3) drawSwarm(now);
  }

  // ---------- Main loop ----------
  function frame(now) {
    const dt = now - lastFrame;
    lastFrame = now;
    if (playing) {
      elapsed += dt;
      if (elapsed >= duration) {
        goTo(current + 1);
      } else {
        bar.style.width = (elapsed / duration) * 100 + '%';
      }
    }
    draw(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
