/* ══════════════════════════════════════════
   ClinRAG – script.js
══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  hamburger && hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    navLinks.style.display = open ? '' : 'flex';
    if (!open) {
      Object.assign(navLinks.style, {
        display: 'flex', flexDirection: 'column',
        position: 'absolute', top: '70px', left: '0', right: '0',
        background: 'rgba(248,250,252,0.97)',
        backdropFilter: 'blur(16px)',
        padding: '16px 24px 24px',
        borderBottom: '1px solid rgba(148,163,184,0.18)',
        gap: '4px', zIndex: '999'
      });
    } else {
      navLinks.removeAttribute('style');
    }
  });

  /* ── Intersection Observer for scroll animations ── */
  const animEls = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  animEls.forEach(el => observer.observe(el));

  /* ── Animated stat counters ── */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1600;
      const start  = performance.now();
      const tick   = (now) => {
        const t   = Math.min((now - start) / dur, 1);
        const val = Math.round(easeOut(t) * target);
        el.textContent = val;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ── Hero AI chat animation ── */
  const typingDots  = document.getElementById('typingDots');
  const aiResponse  = document.getElementById('aiResponse');
  const papers      = document.getElementById('retrievedPapers');

  if (typingDots && aiResponse && papers) {
    // After 2.4s show response, after 3.5s show papers
    setTimeout(() => {
      typingDots.style.display  = 'none';
      aiResponse.style.display  = 'inline';
    }, 2400);

    setTimeout(() => {
      papers.style.opacity = '1';
    }, 3600);

    // Restart loop every 10s for effect
    setInterval(() => {
      typingDots.style.display  = 'flex';
      aiResponse.style.display  = 'none';
      papers.style.opacity      = '0';

      setTimeout(() => {
        typingDots.style.display  = 'none';
        aiResponse.style.display  = 'inline';
      }, 2400);
      setTimeout(() => {
        papers.style.opacity = '1';
      }, 3600);
    }, 10000);
  }

  /* ── Dashboard send button interaction ── */
  const dashSendBtn = document.getElementById('dashSendBtn');
  const dashInput   = document.getElementById('dashInput');

  if (dashSendBtn && dashInput) {
    const sendAction = () => {
      const q = dashInput.value.trim();
      if (!q) return;
      dashInput.value = '';
      dashInput.placeholder = 'Processing your query…';
      dashSendBtn.style.opacity = '0.5';
      setTimeout(() => {
        dashInput.placeholder = 'Ask a clinical question…';
        dashSendBtn.style.opacity = '1';
      }, 2000);
    };
    dashSendBtn.addEventListener('click', sendAction);
    dashInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendAction();
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      if (navLinks && navLinks.style.display === 'flex' && window.innerWidth < 768) {
        navLinks.removeAttribute('style');
        hamburger && hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ── Feature card tilt effect ── */
  document.querySelectorAll('.feature-card,.pricing-card,.testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Pricing card hover glow ring ── */
  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 20px 60px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '';
    });
  });

  /* ── Steps progress animation ── */
  const stepsGrid = document.querySelector('.steps-grid');
  if (stepsGrid) {
    const stepsObs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const steps = stepsGrid.querySelectorAll('.step-card');
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.style.borderColor = ['rgba(37,99,235,0.35)','rgba(124,58,237,0.35)','rgba(20,184,166,0.35)','rgba(37,99,235,0.35)'][i] || '';
        }, i * 200 + 400);
      });
      stepsObs.unobserve(stepsGrid);
    }, { threshold: 0.3 });
    stepsObs.observe(stepsGrid);
  }

  /* ── Cursor glow effect on hero ── */
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hero.style.setProperty('--mx', `${x}px`);
      hero.style.setProperty('--my', `${y}px`);
    });
  }

  /* ── Node SVG line animation ── */
  document.querySelectorAll('.node-lines path').forEach((path, i) => {
    const len = path.getTotalLength ? path.getTotalLength() : 100;
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    path.style.transition = `stroke-dashoffset 1.2s ease ${i * 0.3}s`;

    const nodeObs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      setTimeout(() => { path.style.strokeDashoffset = '0'; }, 300);
      nodeObs.unobserve(path);
    }, { threshold: 0.5 });
    nodeObs.observe(path);
  });

  console.log('🩺 ClinRAG – AI Research Assistant loaded.');
})();
