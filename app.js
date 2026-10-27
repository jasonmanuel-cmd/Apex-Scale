/* ==========================================================================
   Apex Scale — interaction layer
   Editorial motion only: no glow, no bounce, no noise.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const state = {
    plan: '',
    planPrice: '',
    revenue: '1m-3m',
    media: 'podcast',
    objective: 'omnipresence',
    step: 1
  };

  /* ----------------------------------------------------------------------
     1. Masthead, drawer, section highlighting
     ---------------------------------------------------------------------- */
  function initChrome() {
    const masthead = $('#masthead');
    const burger = $('#burger');
    const drawer = $('#drawer');
    const links = $$('.nav a');

    const onScroll = () => {
      if (masthead) masthead.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const closeDrawer = () => {
      document.body.classList.remove('nav-open');
      document.body.classList.remove('is-locked');
      if (burger) burger.setAttribute('aria-expanded', 'false');
      if (drawer) drawer.setAttribute('inert', '');
    };

    if (burger && drawer) {
      burger.addEventListener('click', () => {
        const open = !document.body.classList.contains('nav-open');
        document.body.classList.toggle('nav-open', open);
        document.body.classList.toggle('is-locked', open);
        burger.setAttribute('aria-expanded', String(open));
        if (open) drawer.removeAttribute('inert');
        else drawer.setAttribute('inert', '');
      });
      $$('a', drawer).forEach((a) => a.addEventListener('click', closeDrawer));
    }

    // Highlight the section in view
    const sections = links
      .map((a) => {
        const id = a.getAttribute('href');
        return id && id.startsWith('#') ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => navObserver.observe(s));
    }

    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------------------------------
     2. Hero film — sound toggle
     ---------------------------------------------------------------------- */
  function initHeroFilm() {
    const video = $('#hero-video');
    const toggle = $('#sound-toggle');
    const label = $('#sound-label');
    if (!video || !toggle) return;

    // Some browsers refuse autoplay until a gesture; retry quietly.
    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    play();

    toggle.addEventListener('click', () => {
      const willUnmute = video.muted;
      video.muted = !willUnmute;
      if (willUnmute) {
        video.volume = 0.55;
        play();
      }
      toggle.setAttribute('aria-pressed', String(willUnmute));
      if (label) label.textContent = willUnmute ? 'Film · sound on' : 'Film · sound off';
    });
  }

  /* ----------------------------------------------------------------------
     3. Count-up figures
     ---------------------------------------------------------------------- */
  function initCounters() {
    const counters = $$('.count');
    if (!counters.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.to || '0');
      const dec = parseInt(el.dataset.dec || '0', 10);
      if (reduceMotion) {
        el.textContent = target.toFixed(dec);
        return;
      }
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const p = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((c) => io.observe(c));
  }

  /* ----------------------------------------------------------------------
     4. Reveal on scroll
     ---------------------------------------------------------------------- */
  function initReveal() {
    const targets = $$('[data-reveal]');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((t) => io.observe(t));
  }

  /* ----------------------------------------------------------------------
     5. Range input fill (CSS custom property)
     ---------------------------------------------------------------------- */
  function paintRange(input) {
    if (!input) return;
    const min = parseFloat(input.min || '0');
    const max = parseFloat(input.max || '100');
    const val = parseFloat(input.value || '0');
    const p = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--p', p + '%');
  }

  /* ----------------------------------------------------------------------
     6. Distribution simulator (canvas)
     ---------------------------------------------------------------------- */
  function initSimulator() {
    const canvas = $('#multiplier-canvas');
    const slider = $('#hours');
    if (!canvas) return;
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;

    const hoursValue = $('#hours-value');
    const clipsOut = $('#sim-clips');
    const accountsOut = $('#sim-accounts');
    const postsOut = $('#sim-posts');
    const replay = $('#sim-replay');

    let width = 0;
    let height = 0;
    let nodes = [];
    let particles = [];
    let raf = null;
    let inView = false;
    let t = 0;

    const BONE = '242, 238, 230';
    const GOLD = '201, 169, 110';
    const TEAL = '46, 196, 182';

    function metrics() {
      const hours = parseInt(slider ? slider.value : '2', 10);
      return {
        hours: hours,
        accounts: Math.min(40, hours * 20),
        clips: hours * 60,
        posts: Math.min(40, hours * 20) * 60
      };
    }

    function label(text, x, y, color, align) {
      ctx.save();
      ctx.fillStyle = color || 'rgba(' + BONE + ', 0.42)';
      ctx.font = '300 9px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = align || 'center';
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function layout() {
      const m = metrics();
      const padX = Math.max(28, width * 0.035);
      const master = { x: padX + 18, y: height / 2 };
      const core = { x: width * 0.33, y: height / 2 };
      const funnel = { x: width - padX - 16, y: height / 2 };

      const cols = width < 640 ? 2 : 3;
      const count = m.accounts;
      const rows = Math.ceil(count / cols);
      const startX = width * 0.47;
      const endX = width * 0.8;
      const top = height * 0.13;
      const bottom = height * 0.87;

      const subs = [];
      for (let i = 0; i < count; i += 1) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = cols === 1 ? (startX + endX) / 2 : startX + (col * (endX - startX)) / (cols - 1);
        const y = top + (row * (bottom - top)) / Math.max(1, rows - 1);
        subs.push({ x: x, y: y, seed: Math.random() * Math.PI * 2 });
      }

      nodes = { master: master, core: core, funnel: funnel, subs: subs, cols: cols };

      if (particles.length === 0) {
        for (let i = 0; i < 60; i += 1) particles.push(newParticle(subs));
      } else {
        particles.forEach((p) => { p.sub = subs[Math.floor(Math.random() * subs.length)] || subs[0]; });
      }
    }

    function newParticle(subs) {
      return {
        t: Math.random(),
        speed: 0.0022 + Math.random() * 0.0032,
        sub: subs[Math.floor(Math.random() * subs.length)] || subs[0],
        r: Math.random() < 0.82 ? 1.1 : 1.7
      };
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, rect.width);
      height = Math.max(200, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      if (reduceMotion) draw(false);
    }

    function bezier(p0, p1, p2, tPos) {
      const inv = 1 - tPos;
      return {
        x: inv * inv * p0.x + 2 * inv * tPos * p1.x + tPos * tPos * p2.x,
        y: inv * inv * p0.y + 2 * inv * tPos * p1.y + tPos * tPos * p2.y
      };
    }

    function draw(animate) {
      if (!nodes.subs) return;
      const { master, core, funnel, subs } = nodes;

      ctx.clearRect(0, 0, width, height);

      const ctrlA = { x: (master.x + core.x) / 2, y: master.y };
      const ctrlB = { x: (core.x + funnel.x) / 2, y: funnel.y };

      // Master → core spine
      ctx.strokeStyle = 'rgba(' + GOLD + ', 0.34)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(master.x, master.y);
      ctx.quadraticCurveTo(ctrlA.x, ctrlA.y, core.x, core.y);
      ctx.stroke();

      // Core → sub-accounts
      subs.forEach((s) => {
        const midX = (core.x + s.x) / 2;
        ctx.strokeStyle = 'rgba(' + BONE + ', 0.1)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(core.x, core.y);
        ctx.quadraticCurveTo(midX, s.y, s.x, s.y);
        ctx.stroke();
      });

      // Sub-accounts → funnel
      subs.forEach((s) => {
        ctx.strokeStyle = 'rgba(' + TEAL + ', 0.09)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo((s.x + funnel.x) / 2, s.y, funnel.x, funnel.y);
        ctx.stroke();
      });

      // Particles
      particles.forEach((p) => {
        if (animate) p.t += p.speed;
        if (p.t > 1) p.t = 0;
        if (!p.sub) return;

        let px;
        let py;
        if (p.t < 0.3) {
          const pt = bezier(master, ctrlA, core, p.t / 0.3);
          px = pt.x; py = pt.y;
        } else if (p.t < 0.66) {
          const q = (p.t - 0.3) / 0.36;
          const midX = (core.x + p.sub.x) / 2;
          const pt = bezier(core, { x: midX, y: p.sub.y }, p.sub, q);
          px = pt.x; py = pt.y;
        } else {
          const q = (p.t - 0.66) / 0.34;
          const pt = bezier(p.sub, { x: (p.sub.x + funnel.x) / 2, y: p.sub.y }, funnel, q);
          px = pt.x; py = pt.y;
        }

        ctx.fillStyle = p.t > 0.66 ? 'rgba(' + TEAL + ', 0.9)' : 'rgba(' + GOLD + ', 0.95)';
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sub-account marks
      subs.forEach((s) => {
        ctx.strokeStyle = 'rgba(' + BONE + ', 0.34)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(s.x - 2.6, s.y);
        ctx.lineTo(s.x + 2.6, s.y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(' + BONE + ', 0.6)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Core diamond
      ctx.strokeStyle = 'rgba(' + BONE + ', 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(core.x, core.y - 8);
      ctx.lineTo(core.x + 8, core.y);
      ctx.lineTo(core.x, core.y + 8);
      ctx.lineTo(core.x - 8, core.y);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(' + GOLD + ', 0.9)';
      ctx.beginPath();
      ctx.arc(core.x, core.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Master ring
      ctx.strokeStyle = 'rgba(' + GOLD + ', 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(master.x, master.y, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(' + GOLD + ', 0.95)';
      ctx.beginPath();
      ctx.arc(master.x, master.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Funnel ring
      ctx.strokeStyle = 'rgba(' + TEAL + ', 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(funnel.x, funnel.y, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(' + TEAL + ', 0.9)';
      ctx.beginPath();
      ctx.arc(funnel.x, funnel.y, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      label('MASTER', master.x, master.y + 34, 'rgba(' + GOLD + ', 0.7)');
      label('EDITORIAL CORE', core.x, core.y + 30);
      label('SUB-ACCOUNTS', (width * 0.47 + width * 0.8) / 2, height - 12);
      label('INBOUND', funnel.x, funnel.y + 30, 'rgba(' + TEAL + ', 0.7)');

      if (animate) t += 1;
    }

    function loop() {
      if (!inView || document.hidden) {
        raf = null;
        return;
      }
      draw(true);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf || reduceMotion) return;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    const sync = () => {
      const m = metrics();
      if (hoursValue) hoursValue.textContent = String(m.hours);
      if (clipsOut) clipsOut.textContent = m.clips.toLocaleString('en-US');
      if (accountsOut) accountsOut.textContent = String(m.accounts);
      if (postsOut) postsOut.textContent = m.posts.toLocaleString('en-US');
      if (slider) paintRange(slider);
    };

    if (slider) {
      slider.addEventListener('input', () => {
        sync();
        layout();
        if (reduceMotion) draw(false);
      });
    }

    if (replay) {
      replay.addEventListener('click', () => {
        particles.forEach((p) => { p.t = Math.random(); });
        if (reduceMotion) draw(false);
        else start();
      });
    }

    resize();
    sync();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 140);
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView) start();
          else stop();
        });
      }, { threshold: 0.15 });
      io.observe(canvas);
    } else {
      inView = true;
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (inView) start();
    });

    if (reduceMotion) draw(false);
  }

  /* ----------------------------------------------------------------------
     7. ROI model
     ---------------------------------------------------------------------- */
  function initModel() {
    const revenue = $('#revenue');
    const reach = $('#reach');
    const target = $('#target');
    if (!revenue || !reach || !target) return;

    const revenueOut = $('#revenue-out');
    const reachOut = $('#reach-out');
    const targetOut = $('#target-out');
    const savings = $('#out-savings');
    const followers = $('#out-followers');
    const accounts = $('#out-accounts');
    const posts = $('#out-posts');
    const inbound = $('#out-inbound');

    const targets = [25e6, 100e6, 250e6, 500e6];
    const CPM = 30;
    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const num = new Intl.NumberFormat('en-US');

    function update() {
      const rev = parseInt(revenue.value, 10);
      const rch = parseInt(reach.value, 10);
      const tier = parseInt(target.value, 10);
      const views = targets[clamp(tier - 1, 0, 3)];

      const saved = (views / 1000) * CPM;
      const followerGain = Math.round(views * 0.00115 + rch * 1000 * 0.04);
      const accountsByTier = [25, 40, 60, 80];
      const accountCount = accountsByTier[clamp(tier - 1, 0, 3)];
      const postCount = accountCount * 60;

      // Inbound scales with revenue tier, guaranteed reach, and current base
      const base = (views / 1e6) * (0.9 + rev * 0.14) + rch / 30;
      const low = Math.max(12, Math.round(base * 0.72));
      const high = Math.max(low + 8, Math.round(base * 1.34));

      revenueOut.textContent = money.format(rev * 1e6);
      reachOut.textContent = num.format(rch * 1000);
      targetOut.textContent = num.format(views / 1e6) + 'M';
      savings.textContent = money.format(saved);
      followers.textContent = '+' + num.format(followerGain);
      accounts.textContent = String(accountCount);
      posts.textContent = num.format(postCount);
      inbound.textContent = low + '–' + high;

      paintRange(revenue);
      paintRange(reach);
      paintRange(target);
    }

    [revenue, reach, target].forEach((input) => input.addEventListener('input', update));
    update();
  }

  /* ----------------------------------------------------------------------
     8. Billing toggle
     ---------------------------------------------------------------------- */
  function initBilling() {
    const toggle = $('#billing-toggle');
    if (!toggle) return;
    const prices = $$('[data-monthly]');

    const set = (annual) => {
      toggle.setAttribute('aria-checked', String(annual));
      prices.forEach((el) => {
        el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
      });
      $$('[data-plan]').forEach((btn) => {
        const el = btn.closest('.tier');
        const span = el && el.querySelector('[data-monthly]');
        if (span) btn.dataset.planPrice = annual ? span.dataset.annual : span.dataset.monthly;
      });
    };

    toggle.addEventListener('click', () => {
      set(toggle.getAttribute('aria-checked') !== 'true');
    });
  }

  /* ----------------------------------------------------------------------
     9. Proof filters
     ---------------------------------------------------------------------- */
  function initFilters() {
    const buttons = $$('.filter-btn');
    const cases = $$('.case');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
        cases.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     10. FAQ accordion
     ---------------------------------------------------------------------- */
  function initFaq() {
    const items = $$('.faq__item');
    items.forEach((item) => {
      const btn = $('.faq__q', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          const b = $('.faq__q', other);
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     11. Modals
     ---------------------------------------------------------------------- */
  const focusable = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastFocus = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.removeAttribute('inert');
    document.body.classList.add('is-locked');
    const first = modal.querySelector('input, button:not(.modal__close)');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('inert', '');
    if (!document.querySelector('.modal.is-open')) document.body.classList.remove('is-locked');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
  }

  function initModalChrome() {
    $$('.modal').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
      $$('[data-close-modal]', modal).forEach((btn) => {
        btn.addEventListener('click', () => closeModal(modal));
      });
    });

    document.addEventListener('keydown', (e) => {
      const open = document.querySelector('.modal.is-open');
      if (!open) return;
      if (e.key === 'Escape') {
        closeModal(open);
        return;
      }
      if (e.key === 'Tab') {
        const items = $$(focusable, open).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  const TIERS = {
    '': { name: 'Apex Scale — 100M view guarantee', detail: '40 branded sub-accounts · 2,400 micro-films monthly · editor-in-chief · SLA-backed' },
    Signal: { name: 'Signal — 5M view guarantee', detail: '10 branded sub-accounts · 300 micro-films monthly · shared creative pod · 12-month term' },
    Multiplier: { name: 'Multiplier — 25M view guarantee', detail: '25 branded sub-accounts · 1,200 micro-films monthly · dedicated pod · quarterly board reporting' },
    Sovereign: { name: 'Sovereign — 100M view guarantee', detail: '40 branded sub-accounts · 2,400 micro-films monthly · editor-in-chief · multi-market and multi-language arms' }
  };

  function setQualifierTier(plan) {
    const tier = TIERS[plan] || TIERS[''];
    const name = $('#matched-tier');
    const detail = $('#matched-detail');
    if (name) name.textContent = tier.name;
    if (detail) detail.textContent = tier.detail;
  }

  function setStep(n) {
    state.step = clamp(n, 1, 4);
    const titles = [
      'What is your company’s annual revenue?',
      'What long-form media do you already have?',
      'What is the primary commercial objective?',
      'Your guarantee tier is ready.'
    ];

    $$('.step').forEach((pane) => {
      pane.classList.toggle('is-active', Number(pane.dataset.step) === state.step);
    });

    const stepLabel = $('#modal-step');
    const title = $('#qualifier-title');
    const fill = $('#progress-fill');
    const back = $('#modal-back');
    const next = $('#modal-next');

    if (stepLabel) stepLabel.textContent = 'Step ' + state.step + ' of 4';
    if (title) title.textContent = titles[state.step - 1];
    if (fill) fill.style.transform = 'scaleX(' + state.step / 4 + ')';
    if (back) back.style.visibility = state.step === 1 ? 'hidden' : 'visible';
    if (next) next.style.display = state.step === 4 ? 'none' : 'inline-flex';
  }

  function initQualifier() {
    const modal = $('#qualifier');
    if (!modal) return;

    $$('[data-open-qualifier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        const drawerEl = $('#drawer');
        if (drawerEl) drawerEl.setAttribute('inert', '');
        state.plan = '';
        state.planPrice = '';
        resetQualifier(modal);
        setQualifierTier('');
        setStep(1);
        openModal('qualifier');
      });
    });

    $$('[data-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.plan = btn.dataset.plan || '';
        state.planPrice = btn.dataset.planPrice || '';
        resetQualifier(modal);
        setQualifierTier(state.plan);
        setStep(1);
        openModal('qualifier');
      });
    });

    $$('.option').forEach((option) => {
      option.addEventListener('click', () => {
        const field = option.dataset.field;
        const group = option.parentElement;
        if (group) $$('.option', group).forEach((o) => o.classList.remove('is-selected'));
        option.classList.add('is-selected');
        if (field) state[field] = option.dataset.value;
      });
    });

    const back = $('#modal-back');
    const next = $('#modal-next');
    if (back) back.addEventListener('click', () => setStep(state.step - 1));
    if (next) next.addEventListener('click', () => setStep(state.step + 1));

    const form = $('#qualifier-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        const status = $('#qualifier-status');
        const btn = form.querySelector('button[type="submit"]');
        const data = {
          full_name: $('#q-name').value.trim(),
          email: $('#q-email').value.trim(),
          phone: $('#q-phone').value.trim(),
          company: $('#q-company').value.trim(),
          revenue_tier: state.revenue,
          media_readiness: state.media,
          objective: state.objective,
          matched_tier: state.plan || 'Modelled — 100M tier',
          website: ($('#q-website') || {}).value || '',
          plan: state.plan,
          plan_price: state.planPrice,
          source: 'qualifier'
        };

        if (status) status.textContent = 'Sending…';
        if (btn) btn.disabled = true;

        sendLead(data)
          .then(() => {
            showQualifierThanks(modal, data);
          })
          .catch(() => {
            if (status) status.textContent = 'Could not send. Email partnerships@apexscale.com and we will reply directly.';
            if (btn) btn.disabled = false;
          });
      });
    }

    setQualifierTier('');
    setStep(1);
  }

  function resetQualifier(modal) {
    const head = $('.modal__head', modal);
    const steps = $('.steps', modal);
    const foot = $('.modal__foot', modal);
    const thanks = $('.thanks', modal);
    if (thanks) thanks.remove();
    if (head) head.style.display = '';
    if (steps) steps.style.display = '';
    if (foot) foot.style.display = '';
    $$('.field input', modal).forEach((input) => {
      input.value = '';
      input.style.borderColor = '';
    });
    const status = $('#qualifier-status');
    if (status) status.textContent = '';
    const btn = modal.querySelector('button[type="submit"]');
    if (btn) btn.disabled = false;
  }

  function showQualifierThanks(modal, data) {
    const head = $('.modal__head', modal);
    const steps = $('.steps', modal);
    const foot = $('.modal__foot', modal);
    if (head) head.style.display = 'none';
    if (steps) steps.style.display = 'none';
    if (foot) foot.style.display = 'none';

    const dialog = $('.modal__dialog', modal);
    if (!dialog) return;

    const wrap = document.createElement('div');
    wrap.className = 'thanks';

    const mark = document.createElement('div');
    mark.className = 'thanks__mark';

    const title = document.createElement('h3');
    title.textContent = 'Blueprint requested.';

    const body = document.createElement('p');
    body.innerHTML = 'Thank you, <strong>' + escapeHtml(data.full_name) + '</strong>. A senior strategist is reviewing the ' +
      escapeHtml(data.company) + ' footprint and will reply to <strong>' + escapeHtml(data.email) + '</strong> within one business day.';

    const box = document.createElement('div');
    box.className = 'thanks__box';
    const line1 = document.createElement('span');
    line1.innerHTML = '<b>Interest:</b> ' + escapeHtml(state.plan || 'Modelled 100M tier');
    const line2 = document.createElement('span');
    line2.innerHTML = '<b>Next:</b> a five-minute call, then your guarantee in writing.';
    box.appendChild(line1);
    box.appendChild(line2);

    const close = document.createElement('button');
    close.className = 'btn btn--solid';
    close.style.marginTop = '24px';
    close.textContent = 'Close';
    close.addEventListener('click', () => closeModal(modal));

    wrap.appendChild(mark);
    wrap.appendChild(title);
    wrap.appendChild(body);
    wrap.appendChild(box);
    wrap.appendChild(close);
    dialog.appendChild(wrap);
  }

  /* ----------------------------------------------------------------------
     12. Case studies
     ---------------------------------------------------------------------- */
  const CASES = {
    gunderson: {
      name: 'Garrett Gunderson',
      role: '10X bestselling author & investor',
      badge: 'Case 01 — Finance',
      rows: [
        ['Starting position', '1,041 average views per post; a single under-published flagship account.'],
        ['Intervention', '25 branded sub-accounts across finance, family office and wealth-psychology angles, publishing 1,500 clips monthly.'],
        ['Growth', '25M+ monthly views within 90 days; +105.2K followers across the portfolio.'],
        ['Arbitrage CPM', '$0.22 effective, against a $30 benchmark for comparable paid reach.'],
        ['Ownership', 'All 25 accounts and derivative media held by the client from inception.']
      ],
      note: 'Figures reported from platform-native analytics dashboards over the first 90 days of engagement.'
    },
    sigma: {
      name: 'Sigma Society',
      role: 'Dan Bilzerian — global lifestyle enterprise',
      badge: 'Case 02 — Media',
      rows: [
        ['Starting position', 'A single high-reach profile with no secondary distribution.'],
        ['Intervention', '40 branded sub-accounts across lifestyle, travel, luxury and motivation verticals, publishing 1,900+ posts monthly.'],
        ['Growth', '230M+ cumulative views across the portfolio.'],
        ['Infrastructure', 'Dedicated real-device network, per-account creative variation, monthly policy audit.'],
        ['Ownership', 'Full credential handover to the client team.']
      ],
      note: 'Portfolio totals aggregated across all managed accounts for the engagement period.'
    },
    lynch: {
      name: 'Shawn Lynch',
      role: 'Founder, SuccessRX',
      badge: 'Case 03 — B2B SaaS',
      rows: [
        ['Starting position', '12.4K followers, stalled growth, rising acquisition costs.'],
        ['Intervention', '32 sub-accounts across operator, sales and founder-productivity angles, routed to a lead-magnet gateway.'],
        ['Growth', '300M+ views in seven months; 51.4K new organic leads captured.'],
        ['Commercial effect', 'Blended acquisition cost down 78%; 32× pipeline ROI against retainer.'],
        ['Reporting', 'Weekly pipeline attribution by account, reviewed in a monthly commercial call.']
      ],
      note: 'Lead volume counted from first-party CRM intake; ROI measured against closed-won pipeline.'
    },
    silva: {
      name: 'Patrick Silva',
      role: 'Patrick Silva Law Group',
      badge: 'Case 04 — Legal',
      rows: [
        ['Starting position', 'No consistent content cadence; a high-ticket practice dependent on referral.'],
        ['Intervention', '20 sub-accounts across family, estate and business-law topics; two hours of guided filming monthly.'],
        ['Growth', '15.4M views and 23,000 YouTube subscribers in 90 days.'],
        ['Commercial effect', 'Consistent $10k+ retained-client bookings attributed to organic inbound.'],
        ['Ownership', 'Accounts and media library retained by the practice.']
      ],
      note: 'Bookings attributed via intake self-report and CRM source tagging.'
    }
  };

  function openCase(key) {
    const data = CASES[key];
    const body = $('#case-modal-body');
    if (!data || !body) return;

    body.innerHTML = '';
    const badge = document.createElement('span');
    badge.className = 'case-modal__badge';
    badge.textContent = data.badge;

    const title = document.createElement('h2');
    title.className = 'case-modal__title';
    title.id = 'case-modal-title';
    title.textContent = data.name;

    const meta = document.createElement('span');
    meta.className = 'case-modal__meta';
    meta.textContent = data.role;

    const wrap = document.createElement('div');
    wrap.className = 'case-modal__body';

    data.rows.forEach((row) => {
      const line = document.createElement('div');
      line.className = 'case-modal__row';
      const dt = document.createElement('dt');
      dt.textContent = row[0];
      const dd = document.createElement('dd');
      dd.textContent = row[1];
      line.appendChild(dt);
      line.appendChild(dd);
      wrap.appendChild(line);
    });

    const fine = document.createElement('p');
    fine.className = 'case-modal__fine';
    fine.textContent = data.note;

    const cta = document.createElement('button');
    cta.className = 'btn btn--solid';
    cta.style.marginTop = '24px';
    cta.textContent = 'Request a similar blueprint';
    cta.addEventListener('click', () => {
      closeModal($('#case-modal'));
      setTimeout(() => {
        setQualifierTier('');
        setStep(1);
        openModal('qualifier');
      }, 180);
    });

    body.appendChild(badge);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(wrap);
    body.appendChild(fine);
    body.appendChild(cta);

    openModal('case-modal');
  }

  function initCases() {
    $$('[data-case]').forEach((btn) => {
      btn.addEventListener('click', () => openCase(btn.dataset.case));
    });
  }

  /* ----------------------------------------------------------------------
     13. Inline invitation form
     ---------------------------------------------------------------------- */
  function initInvite() {
    const form = $('#invite-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(form)) return;

      const status = $('#invite-status');
      const btn = form.querySelector('button[type="submit"]');
      const data = {
        full_name: $('#invite-name').value.trim(),
        email: $('#invite-email').value.trim(),
        company: $('#invite-company').value.trim(),
        phone: '',
        revenue_tier: '',
        media_readiness: '',
        objective: '',
        matched_tier: 'Invitation request',
        website: ($('#invite-website') || {}).value || '',
        plan: '',
        source: 'invitation'
      };

      if (status) status.textContent = 'Sending…';
      if (btn) btn.disabled = true;

      sendLead(data)
        .then(() => {
          const parent = form.parentElement;
          const anchor = parent ? parent.querySelector('.invitation__meta') : null;
          const box = document.createElement('div');
          box.className = 'thanks';
          const mark = document.createElement('div');
          mark.className = 'thanks__mark';
          const h = document.createElement('h3');
          h.textContent = 'Received.';
          const p = document.createElement('p');
          p.innerHTML = 'Thank you, <strong>' + escapeHtml(data.full_name) + '</strong>. We will reply to <strong>' +
            escapeHtml(data.email) + '</strong> within one business day with two call times.';
          box.appendChild(mark);
          box.appendChild(h);
          box.appendChild(p);
          if (parent) parent.insertBefore(box, anchor);
          form.remove();
        })
        .catch(() => {
          if (status) status.textContent = 'Could not send. Please email partnerships@apexscale.com.';
          if (btn) btn.disabled = false;
        });
    });
  }

  /* ----------------------------------------------------------------------
     14. Helpers
     ---------------------------------------------------------------------- */
  function validate(form) {
    let ok = true;
    $$('input[required]', form).forEach((input) => {
      const valid = input.type === 'email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())
        : input.value.trim().length > 1;
      if (!valid) {
        ok = false;
        input.style.borderColor = 'rgba(220, 120, 100, 0.6)';
        input.addEventListener('input', function reset() {
          input.style.borderColor = '';
          input.removeEventListener('input', reset);
        });
      }
    });
    if (ok) return true;
    const firstBad = form.querySelector('input[required]');
    if (firstBad) firstBad.focus({ preventScroll: false });
    return false;
  }

  function sendLead(payload) {
    return fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((res) => {
      if (!res.ok && res.status !== 202) throw new Error('Lead API responded ' + res.status);
      return res.json().catch(() => ({}));
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initChrome();
    initHeroFilm();
    initCounters();
    initReveal();
    initSimulator();
    initModel();
    initBilling();
    initFilters();
    initFaq();
    initModalChrome();
    initQualifier();
    initCases();
    initInvite();
  });
})();
