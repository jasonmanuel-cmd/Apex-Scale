// Apex Scale — Luxury interaction layer (additive, non-breaking)
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 1. Cursor spotlight
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  document.body.prepend(spotlight);
  let mx = window.innerWidth / 2, my = window.innerHeight * 0.32;
  let tx = mx, ty = my;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    mx += (tx - mx) * 0.07;
    my += (ty - my) * 0.07;
    spotlight.style.setProperty('--mx', mx + 'px');
    spotlight.style.setProperty('--my', my + 'px');
    requestAnimationFrame(loop);
  })();

  // 2. Scroll reveal (fade-up as sections enter view)
  const revealTargets = document.querySelectorAll(
    '.section-header, .pillar-card, .case-card, .metric-box, .table-responsive, ' +
    '.protocol-interactive-card, .result-highlight-card, .cta-banner-card'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((el) => io.observe(el));

  // 3. Glowing gradient borders on key cards
  document.querySelectorAll('.pillar-card, .case-card, .metric-box, .cta-banner-card, .result-highlight-card')
    .forEach((el) => el.classList.add('glow-border'));

  // 4. Magnetic buttons
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.classList.add('magnetic');
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = 'translate(' + (x * 0.16) + 'px,' + (y * 0.2) + 'px)';
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // 5. Animated counters (hero stats)
  const counters = document.querySelectorAll('.count-up');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      const el = en.target;
      const target = parseFloat(el.dataset.count || '0');
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const dur = 1500;
      const start = performance.now();
      const fmt = (v) => prefix + v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      el.textContent = fmt(0);
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => cio.observe(el));
})();
