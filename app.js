// Apex Scale Interactive Application Engine
document.addEventListener('DOMContentLoaded', () => {
  initMultiplierCanvas();
  initRoiPredictor();
  initCaseStudies();
  initFaqAccordion();
  initQualificationModal();
  initLiveToasts();
});

// 1. The Apex Multiplier Protocol Canvas Visualizer
function initMultiplierCanvas() {
  const canvas = document.getElementById('multiplier-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationFrameId;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.width * 0.48 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const hoursSlider = document.getElementById('filming-hours-slider');
  const hoursDisplay = document.getElementById('hours-display');
  const chipsClips = document.getElementById('chips-clips');
  const chipsAccounts = document.getElementById('chips-accounts');
  const chipsPosts = document.getElementById('chips-posts');
  const pulseBtn = document.getElementById('pulse-animation-btn');

  let filmingHours = 2;
  let subAccountNodes = [];
  let particles = [];
  let masterNode = { x: 0, y: 0, r: 24, label: 'Master 2hr Pillar' };
  let clusterNodes = [];
  let funnelNode = { x: 0, y: 0, r: 22, label: 'Authority & Pipeline' };

  const platforms = [
    { name: 'TikTok', color: '#FE2C55' },
    { name: 'Reels', color: '#E1306C' },
    { name: 'Shorts', color: '#FF0000' },
    { name: 'X / Twitter', color: '#1DA1F2' },
    { name: 'LinkedIn', color: '#0A66C2' }
  ];

  function rebuildNodes() {
    const w = canvas.getBoundingClientRect().width;
    const h = w * 0.48;

    masterNode.x = w * 0.16;
    masterNode.y = h * 0.5;
    masterNode.label = 'Master ' + filmingHours + 'hr Pillar';

    clusterNodes = [
      { x: w * 0.38, y: h * 0.32, r: 16, label: 'Hook Engineering Core' },
      { x: w * 0.38, y: h * 0.68, r: 16, label: 'Dual-Layer QC Studio' }
    ];

    funnelNode.x = w * 0.88;
    funnelNode.y = h * 0.5;

    subAccountNodes = [];
    const count = Math.min(42, Math.max(16, filmingHours * 7));
    const startX = w * 0.58;
    const endX = w * 0.74;

    for (let i = 0; i < count; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const rows = Math.ceil(count / 3);
      const plat = platforms[i % platforms.length];

      const x = startX + (col * ((endX - startX) / 2)) + (Math.sin(i * 1.5) * 12);
      const y = (h * 0.14) + (row * ((h * 0.72) / Math.max(1, rows - 1))) + (Math.cos(i * 1.2) * 8);

      subAccountNodes.push({
        x: x,
        y: y,
        r: 6,
        plat: plat.name,
        color: plat.color,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    particles = [];
    for (let i = 0; i < 48; i++) {
      spawnParticle();
    }
  }

  function spawnParticle() {
    if (subAccountNodes.length === 0) return;
    const targetSub = subAccountNodes[Math.floor(Math.random() * subAccountNodes.length)];
    const cluster = clusterNodes[Math.floor(Math.random() * clusterNodes.length)];
    particles.push({
      phase: 0,
      t: Math.random(),
      speed: 0.006 + Math.random() * 0.008,
      cluster: cluster,
      sub: targetSub,
      color: targetSub.color
    });
  }

  rebuildNodes();

  if (hoursSlider) {
    hoursSlider.addEventListener('input', (e) => {
      filmingHours = parseInt(e.target.value);
      if (hoursDisplay) hoursDisplay.textContent = filmingHours + ' Hours';
      if (chipsClips) chipsClips.textContent = (filmingHours * 60) + ' Core Clips';
      if (chipsAccounts) chipsAccounts.textContent = (filmingHours * 15) + ' Accounts';
      if (chipsPosts) chipsPosts.textContent = (filmingHours * 900).toLocaleString() + ' Dispatched';
      rebuildNodes();
    });
  }

  if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
      for (let i = 0; i < 80; i++) {
        spawnParticle();
      }
    });
  }

  let time = 0;
  function animate() {
    time += 0.03;
    const w = canvas.getBoundingClientRect().width;
    const h = w * 0.48;

    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Connections: Master to Clusters
    clusterNodes.forEach(c => {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(masterNode.x, masterNode.y);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();

      // Clusters to Sub-Accounts
      subAccountNodes.forEach(s => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      });
    });

    // Sub-Accounts to Funnel Node
    subAccountNodes.forEach(s => {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(funnelNode.x, funnelNode.y);
      ctx.stroke();
    });

    // Update & Draw Flow Particles
    particles.forEach(p => {
      p.t += p.speed;
      let px, py;
      if (p.t < 0.35) {
        const segT = p.t / 0.35;
        px = masterNode.x + (p.cluster.x - masterNode.x) * segT;
        py = masterNode.y + (p.cluster.y - masterNode.y) * segT;
      } else if (p.t < 0.75) {
        const segT = (p.t - 0.35) / 0.4;
        px = p.cluster.x + (p.sub.x - p.cluster.x) * segT;
        py = p.cluster.y + (p.sub.y - p.cluster.y) * segT;
      } else if (p.t < 1.0) {
        const segT = (p.t - 0.75) / 0.25;
        px = p.sub.x + (funnelNode.x - p.sub.x) * segT;
        py = p.sub.y + (funnelNode.y - p.sub.y) * segT;
      } else {
        p.t = 0;
        px = masterNode.x;
        py = masterNode.y;
      }

      ctx.fillStyle = p.color || '#F5D061';
      ctx.shadowColor = p.color || '#F5D061';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Sub-Account Nodes
    subAccountNodes.forEach(s => {
      const pulse = Math.sin(time * 2 + s.pulseOffset) * 1.5;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Cluster Nodes
    clusterNodes.forEach(c => {
      ctx.fillStyle = '#1E1B4B';
      ctx.strokeStyle = '#818CF8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#6366F1';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#A5B4FC';
      ctx.font = '600 10px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x, c.y + c.r + 14);
    });

    // Draw Master Node
    const masterPulse = Math.sin(time * 1.8) * 3;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.beginPath();
    ctx.arc(masterNode.x, masterNode.y, masterNode.r + 14 + masterPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D4AF37';
    ctx.shadowColor = '#F5D061';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(masterNode.x, masterNode.y, masterNode.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000000';
    ctx.font = '800 11px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('PILLAR', masterNode.x, masterNode.y + 4);

    ctx.fillStyle = '#F5D061';
    ctx.font = '700 12px Plus Jakarta Sans';
    ctx.fillText(masterNode.label, masterNode.x, masterNode.y + masterNode.r + 18);

    // Draw Funnel Node
    const funnelPulse = Math.sin(time * 2.2) * 2;
    ctx.fillStyle = '#064E3B';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(funnelNode.x, funnelNode.y, funnelNode.r + funnelPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#34D399';
    ctx.font = '700 11px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('CONVERSION', funnelNode.x, funnelNode.y + 4);
    ctx.fillText(funnelNode.label, funnelNode.x, funnelNode.y + funnelNode.r + 18);

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

// 2. Dynamic ROI & Scale Predictor Engine
function initRoiPredictor() {
  const revSlider = document.getElementById('rev-slider');
  const viewsSlider = document.getElementById('current-views-slider');
  const tierSlider = document.getElementById('target-tier-slider');

  const revVal = document.getElementById('rev-val');
  const viewsVal = document.getElementById('views-val');
  const targetVal = document.getElementById('target-val');

  const resSavings = document.getElementById('res-ad-savings');
  const resFollowers = document.getElementById('res-followers');
  const resAccounts = document.getElementById('res-accounts');
  const resPosts = document.getElementById('res-posts');
  const resInbound = document.getElementById('res-inbound');
  const calcCta = document.getElementById('calc-cta-btn');

  const tiers = [
    { label: '25M Views Guaranteed', views: 25000000, savings: '$712,500', followers: '+36,000', accounts: '20 Accounts', posts: '1,200 Posts', inbound: '60-120 / mo', name: 'APEX GROWTH: 25M GUARANTEE' },
    { label: '100M Views Guaranteed', views: 100000000, savings: '$2,850,000', followers: '+145,000', accounts: '35 Accounts', posts: '1,850 Posts', inbound: '180-320 / mo', name: 'APEX SCALE: 100M GUARANTEE' },
    { label: '250M Views Guaranteed', views: 250000000, savings: '$7,125,000', followers: '+362,000', accounts: '42 Accounts', posts: '2,200 Posts', inbound: '450-800 / mo', name: 'APEX OMNI: 250M GUARANTEE' },
    { label: '500M Views Guaranteed', views: 500000000, savings: '$14,250,000', followers: '+725,000', accounts: '50 Accounts', posts: '2,600 Posts', inbound: '1,000-1,800 / mo', name: 'APEX TITAN: 500M GUARANTEE' }
  ];

  function updateCalculations() {
    if (revSlider && revVal) {
      revVal.textContent = '$' + revSlider.value + ',000,000 / yr';
    }
    if (viewsSlider && viewsVal) {
      viewsVal.textContent = parseInt(viewsSlider.value).toLocaleString() + ',000 views / mo';
    }

    if (tierSlider) {
      const idx = parseInt(tierSlider.value) - 1;
      const tier = tiers[idx] || tiers[1];

      if (targetVal) targetVal.textContent = tier.label;
      if (resSavings) resSavings.textContent = tier.savings;
      if (resFollowers) resFollowers.textContent = tier.followers;
      if (resAccounts) resAccounts.textContent = tier.accounts;
      if (resPosts) resPosts.textContent = tier.posts;
      if (resInbound) resInbound.textContent = tier.inbound;

      const matchedTierName = document.getElementById('matched-tier-name');
      if (matchedTierName) matchedTierName.textContent = tier.name;
    }
  }

  [revSlider, viewsSlider, tierSlider].forEach(slider => {
    if (slider) slider.addEventListener('input', updateCalculations);
  });

  if (calcCta) {
    calcCta.addEventListener('click', () => {
      openQualificationModal();
    });
  }

  updateCalculations();
}

// 3. Case Studies Filter & Audit Modal
function initCaseStudies() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.case-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const caseDetails = {
    gunderson: {
      name: 'Garrett Gunderson - 10X Bestselling Author',
      growth: 'From 1,041 views/post to 25.4M monthly views in 90 days',
      cpm: '$0.22 effective CPM vs $34.00 Meta ad average',
      accounts: '25 Branded Sub-Accounts - TikTok, IG Reels, YouTube Shorts',
      notes: 'Customer Acquisition Cost dropped by 81%. Generated over 105,000 new verified email subscribers via SMS lead magnets embedded in sub-account bio funnels.'
    },
    bilzerian: {
      name: 'Sigma Society - Dan Bilzerian Team',
      growth: '230M+ verified organic views across 40 synchronized accounts',
      cpm: '$0.19 effective CPM across global lifestyle audience',
      accounts: '40 Dedicated Managed Accounts with 1,900+ monthly dispatches',
      notes: 'Dual-layer review team ensured 100% brand safety and compliance while capturing top search ranking for creator clipping keywords.'
    },
    lynch: {
      name: 'Shawn Lynch - Founder, SuccessRX',
      growth: '300M+ views in 7 months, scaling initial 12.4k audience to 63.8k',
      cpm: '32x return on pipeline investment',
      accounts: '32 Sub-Accounts targeting healthcare and executive performance',
      notes: 'Inbound high-ticket discovery calls increased by 240% within the first 60 days of sub-account swarm activation.'
    },
    silva: {
      name: 'Patrick Silva - Patrick Silva Law Group',
      growth: '15.4M organic views from 0 in 90 days with 2 hours filming/mo',
      cpm: 'Acquisition cost for $10k+ retained legal cases decreased 74%',
      accounts: '20 Sub-Accounts focused on legal rights and consumer advice',
      notes: 'Turned routine founder filming into an automated lead machine without founder involvement in day-to-day posting.'
    }
  };

  const caseModal = document.getElementById('case-modal');
  const caseModalClose = document.getElementById('case-modal-close-btn');
  const caseModalContent = document.getElementById('case-modal-content');

  document.querySelectorAll('.view-breakdown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-case');
      const data = caseDetails[key];
      if (!data || !caseModalContent || !caseModal) return;

      caseModalContent.textContent = '';
      const wrap = document.createElement('div');
      wrap.style.padding = '30px';

      const badge = document.createElement('span');
      badge.className = 'badge-pulsing';
      badge.style.marginBottom = '12px';
      badge.textContent = '✓ AUDITED VERIFICATION';

      const title = document.createElement('h3');
      title.style.fontSize = '1.6rem';
      title.style.fontWeight = '800';
      title.style.margin = '10px 0 16px';
      title.textContent = data.name;

      const card = document.createElement('div');
      card.style.background = 'rgba(0,0,0,0.4)';
      card.style.border = '1px solid var(--border-gold)';
      card.style.borderRadius = '12px';
      card.style.padding = '20px';
      card.style.marginBottom = '20px';

      const p1 = document.createElement('p');
      p1.style.marginBottom = '8px';
      p1.innerHTML = '<strong>Growth Trajectory:</strong> ' + data.growth;

      const p2 = document.createElement('p');
      p2.style.marginBottom = '8px';
      p2.innerHTML = '<strong>Arbitrage CPM:</strong> ' + data.cpm;

      const p3 = document.createElement('p');
      p3.style.marginBottom = '8px';
      p3.innerHTML = '<strong>Distribution Infrastructure:</strong> ' + data.accounts;

      const p4 = document.createElement('p');
      p4.style.color = 'var(--text-secondary)';
      p4.style.marginTop = '12px';
      p4.textContent = data.notes;

      card.appendChild(p1);
      card.appendChild(p2);
      card.appendChild(p3);
      card.appendChild(p4);

      const actionBtn = document.createElement('button');
      actionBtn.className = 'btn btn-gold btn-block';
      actionBtn.textContent = 'Request Similar Growth Blueprint →';
      actionBtn.onclick = () => {
        caseModal.classList.remove('active');
        openQualificationModal();
      };

      wrap.appendChild(badge);
      wrap.appendChild(title);
      wrap.appendChild(card);
      wrap.appendChild(actionBtn);

      caseModalContent.appendChild(wrap);
      caseModal.classList.add('active');
    });
  });

  if (caseModalClose) {
    caseModalClose.addEventListener('click', () => {
      if (caseModal) caseModal.classList.remove('active');
    });
  }
}

// 4. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

// 5. Interactive 4-Step Qualification Funnel
let currentStep = 1;
function openQualificationModal() {
  const modal = document.getElementById('qualification-modal');
  if (modal) {
    modal.classList.add('active');
    setStep(1);
  }
}

function setStep(stepNum) {
  currentStep = stepNum;
  const stepBar = document.getElementById('step-bar');
  const stepCounter = document.getElementById('current-step-num');
  const modalTitle = document.getElementById('modal-title');
  const backBtn = document.getElementById('modal-back-btn');
  const nextBtn = document.getElementById('modal-next-btn');

  const titles = [
    'What is your company revenue range?',
    'How much content do you currently produce?',
    'What is your primary commercial objective?',
    'Your Custom Guarantee Tier is Ready'
  ];

  if (stepBar) stepBar.style.width = (currentStep * 25) + '%';
  if (stepCounter) stepCounter.textContent = currentStep;
  if (modalTitle) modalTitle.textContent = titles[currentStep - 1];

  document.querySelectorAll('.step-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', idx + 1 === currentStep);
  });

  if (backBtn) backBtn.style.visibility = (currentStep === 1) ? 'hidden' : 'visible';
  if (nextBtn) nextBtn.style.display = (currentStep === 4) ? 'none' : 'inline-flex';
}

function initQualificationModal() {
  const modal = document.getElementById('qualification-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const backBtn = document.getElementById('modal-back-btn');
  const nextBtn = document.getElementById('modal-next-btn');
  const leadForm = document.getElementById('lead-capture-form');

  const triggers = [
    'announcement-cta',
    'header-cta-btn',
    'header-roi-btn',
    'hero-primary-cta',
    'final-cta-btn'
  ];

  triggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => {
      e.preventDefault();
      openQualificationModal();
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  document.querySelectorAll('.step-pane .opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
      }
      btn.classList.add('selected');
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep !== 4) setStep(currentStep + 1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentStep !== 1) setStep(currentStep - 1);
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('lead-name').value;
      const email = document.getElementById('lead-email').value;
      const phone = document.getElementById('lead-phone').value;
      const company = document.getElementById('lead-company').value;

      // --- CRM capture (Neon Postgres via /api/leads) ---
      // Fire-and-forget: the success screen shows instantly; the lead is
      // saved in the background. If the backend or DB is missing, it logs
      // and the visitor still gets a normal thank-you.
      (async () => {
        try {
          const selected = (sel) => {
            const el = document.querySelector(sel + ' .opt-btn.selected');
            return el ? el.getAttribute('data-val') : '';
          };
          const matchedTierEl = document.getElementById('matched-tier-name');
          await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: name,
              email: email,
              phone: phone,
              company: company,
              revenue_tier: selected('#step-1'),
              media_readiness: selected('#step-2'),
              objective: selected('#step-3'),
              matched_tier: matchedTierEl ? matchedTierEl.textContent : ''
            })
          });
        } catch (err) {
          console.warn('[lead] could not reach /api/leads:', err && err.message);
        }
      })();

      const modalBody = document.querySelector('.modal-body');
      const modalHeader = document.querySelector('.modal-header');
      const modalFooter = document.querySelector('.modal-footer');

      if (modalHeader) modalHeader.style.display = 'none';
      if (modalFooter) modalFooter.style.display = 'none';

      if (modalBody) {
        modalBody.textContent = '';
        const box = document.createElement('div');
        box.style.textAlign = 'center';
        box.style.padding = '40px 10px';

        const icon = document.createElement('div');
        icon.style.fontSize = '3.5rem';
        icon.style.marginBottom = '16px';
        icon.textContent = '⚡';

        const h = document.createElement('h3');
        h.className = 'text-gradient-gold';
        h.style.fontSize = '1.8rem';
        h.style.fontWeight = '800';
        h.style.marginBottom = '12px';
        h.textContent = 'Growth Blueprint Reserved!';

        const pDesc = document.createElement('p');
        pDesc.style.color = 'var(--text-secondary)';
        pDesc.style.maxWidth = '480px';
        pDesc.style.margin = '0 auto 24px';
        pDesc.style.fontSize = '1.05rem';
        pDesc.innerHTML = 'Thank you, <strong>' + name + '</strong>. Your custom SLA Guarantee for <strong>' + company + '</strong> has been dispatched to <strong>' + email + '</strong>.';

        const notice = document.createElement('div');
        notice.style.background = 'rgba(212, 175, 55, 0.08)';
        notice.style.border = '1px solid var(--border-gold)';
        notice.style.borderRadius = '12px';
        notice.style.padding = '20px';
        notice.style.marginBottom = '28px';

        const n1 = document.createElement('p');
        n1.style.fontWeight = '700';
        n1.style.color = '#FFF';
        n1.textContent = 'Our Senior Strategist is reviewing your account footprint.';

        const n2 = document.createElement('p');
        n2.style.fontSize = '0.85rem';
        n2.style.color = 'var(--text-secondary)';
        n2.style.marginTop = '6px';
        n2.textContent = 'You will receive an SMS confirmation within 15 minutes to confirm your private briefing time.';

        notice.appendChild(n1);
        notice.appendChild(n2);

        const retBtn = document.createElement('button');
        retBtn.className = 'btn btn-gold btn-lg';
        retBtn.textContent = 'Return to Apex Scale';
        retBtn.onclick = () => {
          modal.classList.remove('active');
          location.reload();
        };

        box.appendChild(icon);
        box.appendChild(h);
        box.appendChild(pDesc);
        box.appendChild(notice);
        box.appendChild(retBtn);

        modalBody.appendChild(box);
      }
    });
  }
}

// 6. Live Social Proof Toast Engine
function initLiveToasts() {
  const toast = document.getElementById('live-toast');
  const brandEl = document.getElementById('toast-brand');
  if (!toast || !brandEl) return;

  const events = [
    { brand: 'SaaS Founder in Miami, FL', text: 'Claimed a 100M View Guarantee tier' },
    { brand: 'Bestselling Author in Austin, TX', text: 'Deployed 35 Branded Sub-Accounts' },
    { brand: 'Healthcare CEO in Los Angeles, CA', text: 'Reserved Q4 Capacity slot' },
    { brand: 'Top 10 Business Podcast in NYC', text: 'Scaled past 150M organic views' }
  ];

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % events.length;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';

    setTimeout(() => {
      brandEl.textContent = events[idx].brand;
      const span = toast.querySelector('span');
      if (span) span.textContent = events[idx].text;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 400);
  }, 7500);
}
