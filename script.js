/* =========================================================
   MOHAMMAD RAYHAN — PORTFOLIO SCRIPT
   Vanilla JS · No dependencies
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- PRELOADER ---------- */
  const preloader = $('#preloader');
  const preBar = $('#preBar');
  let p = 0;
  const preTick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 22);
    if (preBar) preBar.style.width = p + '%';
    if (p >= 100) { clearInterval(preTick); }
  }, 140);
  window.addEventListener('load', () => {
    setTimeout(() => { preloader && preloader.classList.add('hide'); startHeroReveal(); }, 500);
  });

  /* ---------- CURSOR SPOTLIGHT (throttled via rAF) ---------- */
  const glow = $('#cursorGlow');
  let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my, rafCursor;
  if (glow && matchMedia('(hover:hover)').matches && !reduced) {
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const loop = () => {
      gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;
      glow.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
      rafCursor = requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- NAVBAR ---------- */
  const nav = $('#nav');
  const scrollProgress = $('#scrollProgress');
  const toTop = $('#toTop');
  const navTime = $('#navTime');

  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);
    const h = document.documentElement.scrollHeight - innerHeight;
    scrollProgress.style.width = (y / h * 100) + '%';
    updateActiveLink();
    updateTimeline();
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* Clock */
  const tick = () => {
    if (!navTime) return;
    const d = new Date();
    navTime.textContent =
      String(d.getHours()).padStart(2,'0') + ':' +
      String(d.getMinutes()).padStart(2,'0') + ':' +
      String(d.getSeconds()).padStart(2,'0');
  };
  tick(); setInterval(tick, 1000);

  /* Burger */
  const burger = $('#navBurger'), navLinks = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav__link').forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open'); burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  /* Active link */
  const sections = $$('main section[id]');
  const links = $$('.nav__link');
  function updateActiveLink() {
    let cur = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 200) cur = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  }

  /* Back to top */
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- HERO REVEAL ---------- */
  function startHeroReveal() {
    $$('#hero .reveal, #hero .reveal-line').forEach((el, i) =>
      setTimeout(() => el.classList.add('in'), 120 * i));
  }

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.dataset.counter) animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  const observeReveals = () =>
    $$('.reveal, .reveal-line').forEach(el => { if (!el.closest('#hero')) io.observe(el); });

  /* ---------- COUNTERS ---------- */
  function animateCounter(el) {
    const num = $('.counter__num', el) || el;
    const target = +num.dataset.target, suffix = num.dataset.suffix || '';
    const dur = 1500; let start;
    const step = t => {
      if (!start) start = t;
      const prog = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      num.textContent = Math.round(target * eased) + suffix;
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- SKILL TILT + GLOW ---------- */
  function bindTilt() {
    if (reduced) return;
    $$('.skill').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform =
          `perspective(600px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  function bindMagnetic() {
    if (reduced || !matchMedia('(hover:hover)').matches) return;
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform =
          `translate(${(e.clientX - r.left - r.width/2)*0.25}px,${(e.clientY - r.top - r.height/2)*0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  }

  /* ---------- TIMELINE PROGRESS ---------- */
  const timeline = $('#timeline'), tLine = $('#timelineLine');
  function updateTimeline() {
    if (!timeline) return;
    const r = timeline.getBoundingClientRect();
    const total = r.height;
    const passed = Math.min(Math.max(innerHeight * 0.6 - r.top, 0), total);
    tLine && tLine.style.setProperty('--p', (passed / total * 100) + '%');
  }

  /* =========================================================
     DATA + RENDER
     ========================================================= */

  /* SVG icon factory (simple monoline) */
  const ic = (paths, fill = false) =>
    `<svg viewBox="0 0 24 24" width="100%" height="100%" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'}>${paths}</svg>`;

  /* ---- SKILLS ---- */
  const skills = [
    ['HTML','Markup','#ff6a1a'],['CSS','Styling','#4a90ff'],['JavaScript','Core','#f0d000'],
    ['TypeScript','Typed','#3178c6'],['React','UI Library','#61dafb'],['Next.js','Framework','#fff'],
    ['Node.js','Runtime','#3ddc84'],['Express','Backend','#aaa'],['Python','Scripting','#ffd43b'],
    ['Git','Version','#f05033'],['GitHub','Hosting','#fff'],['Firebase','BaaS','#ffca28'],
    ['Tailwind','Utility CSS','#38bdf8'],['MongoDB','Database','#3ddc84'],['VS Code','Editor','#4a90ff']
  ];
  const skillIcon = ic('<path d="M12 3l7 4v10l-7 4-7-4V7z"/><path d="M12 3v18M5 7l7 4 7-4"/>');
  $('#skillsGrid').innerHTML = skills.map(([n,l,c]) => `
    <div class="skill reveal">
      <div class="skill__icon" style="color:${c}">${skillIcon}</div>
      <div class="skill__name">${n}</div>
      <div class="skill__lvl">${l}</div>
    </div>`).join('');

  /* ---- PROJECTS ---- */
  const projGrad = [
    'linear-gradient(135deg,#ff6a1a,#7a1c00)',
    'linear-gradient(135deg,#4a90ff,#0a1a4a)',
    'linear-gradient(135deg,#a855f7,#2a0a4a)',
    'linear-gradient(135deg,#10b981,#062a20)',
    'linear-gradient(135deg,#f0d000,#4a3a00)',
    'linear-gradient(135deg,#ec4899,#4a0a2a)'
  ];
  const projects = [
    ['Nebula Dashboard','Real-time analytics dashboard with fluid data-viz & dark mode.',['React','TypeScript','Chart.js']],
    ['Aurora Store','Headless e-commerce storefront, blazing-fast & SEO-first.',['Next.js','Node.js','MongoDB']],
    ['Prism UI Kit','A modular glassmorphic component library for designers.',['CSS','JavaScript','Figma']],
    ['Pulse Landing','Award-style animated SaaS landing page.',['HTML','GSAP-free CSS','JS']],
    ['Vault Auth','Secure auth flow with elegant motion & 2FA.',['Firebase','React','TS']],
    ['Motion Folio','Cinematic portfolio template for creatives.',['Next.js','Tailwind','JS']]
  ];
  $('#projectsGrid').innerHTML = projects.map(([t,d,tags],i) => `
    <article class="project reveal">
      <div class="project__media">
        <div class="project__gfx" style="background:${projGrad[i]}"></div>
        <span class="project__num">0${i+1} / Project</span>
      </div>
      <div class="project__body">
        <h3 class="project__title">${t}</h3>
        <p class="project__desc">${d}</p>
        <div class="project__tags">${tags.map(x=>`<span class="project__tag">${x}</span>`).join('')}</div>
        <div class="project__links">
          <a href="https://github.com" target="_blank" rel="noopener" class="btn btn--ghost magnetic">GitHub</a>
          <a href="#" class="btn btn--primary magnetic">Live Demo</a>
        </div>
      </div>
    </article>`).join('');

  /* ---- EXPERIENCE ---- */
  const timelineData = [
    ['2022','The Beginning','Self-taught','Started with HTML, CSS & JavaScript — fell in love with building for the web.'],
    ['2023','Frontend Focus','Freelance','Delivered responsive landing pages & UI systems for clients worldwide.'],
    ['2024','Creative Developer','Independent','Blended motion design + clean engineering into premium web experiences.'],
    ['2025','Levelling Up','Ongoing','Mastering React, Next.js & performance to build world-class products.']
  ];
  const tl = $('#timeline');
  timelineData.forEach(([date,role,org,desc]) => {
    const el = document.createElement('div');
    el.className = 'tl-item reveal';
    el.innerHTML = `<div class="tl-card glass">
      <span class="tl-date">${date}</span>
      <h3 class="tl-role">${role}</h3>
      <p class="tl-org">${org}</p>
      <p class="tl-desc">${desc}</p></div>`;
    tl.appendChild(el);
  });

  /* ---- SERVICES ---- */
  const services = [
    ['Frontend Development','Robust, scalable interfaces built with clean, maintainable code.'],
    ['Responsive Design','Flawless layouts across every device — mobile to ultrawide.'],
    ['Landing Pages','High-converting, award-style pages that tell your story.'],
    ['UI Design','Premium interfaces with rhythm, hierarchy & delight.'],
    ['Performance Optimization','Lightning-fast load times with 95+ Lighthouse scores.'],
    ['Modern Web Interfaces','Cutting-edge, motion-rich experiences that feel alive.']
  ];
  const svcIcon = ic('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>');
  $('#servicesGrid').innerHTML = services.map(([t,d],i)=>`
    <div class="svc reveal">
      <div class="svc__icon">${svcIcon}</div>
      <span class="svc__num">0${i+1}</span>
      <h3 class="svc__title">${t}</h3>
      <p class="svc__desc">${d}</p>
    </div>`).join('');

  /* ---- WHY ---- */
  const why = [
    ['Modern UI','Trend-aware design that never feels dated.'],
    ['Fast Performance','Optimized to the byte for instant loads.'],
    ['Clean Code','Readable, documented, future-proof.'],
    ['Responsive','Pixel-perfect on every screen size.'],
    ['SEO Friendly','Structured, semantic & discoverable.'],
    ['Pixel Perfect','Obsessive attention to every detail.'],
    ['Creative Design','Unique concepts, not templates.'],
    ['Reliable Delivery','On time, every time — no surprises.']
  ];
  const whyIcon = ic('<path d="M20 6L9 17l-5-5"/>');
  $('#whyGrid').innerHTML = why.map(([t,d])=>`
    <div class="why-card reveal">
      <div class="why__icon">${whyIcon}</div>
      <h3 class="why__title">${t}</h3>
      <p class="why__desc">${d}</p>
    </div>`).join('');

  /* ---- TESTIMONIALS ---- */
  const testimonials = [
    ['Rayhan turned our vision into a jaw-dropping product. The attention to motion and detail is next-level.','Sarah Chen','Product Lead, Nova','SC'],
    ['Fastest, cleanest frontend work I have seen. Our Lighthouse score jumped to 98 overnight.','David Okafor','CTO, Aurora','DO'],
    ['Working with Rayhan felt like hiring a whole design + dev team. Truly world-class.','Mia Kowalski','Founder, Prism','MK']
  ];
  const track = $('#testiTrack'), dots = $('#testiDots');
  track.innerHTML = testimonials.map(([q,n,r,a])=>`
    <div class="testi__card"><div class="testi__inner glass">
      <p class="testi__quote">${q}</p>
      <div class="testi__person">
        <div class="testi__ava">${a}</div>
        <div><div class="testi__name">${n}</div><div class="testi__role">${r}</div></div>
      </div>
    </div></div>`).join('');
  dots.innerHTML = testimonials.map((_,i)=>`<span class="testi__dot ${i===0?'active':''}" data-i="${i}"></span>`).join('');
  let ti = 0;
  const setTesti = i => {
    ti = (i + testimonials.length) % testimonials.length;
    track.style.transform = `translateX(-${ti*100}%)`;
    $$('.testi__dot').forEach((d,k)=>d.classList.toggle('active',k===ti));
  };
  $$('.testi__dot').forEach(d=>d.addEventListener('click',()=>setTesti(+d.dataset.i)));
  let testiTimer = setInterval(()=>setTesti(ti+1),5000);
  $('#testi').addEventListener('mouseenter',()=>clearInterval(testiTimer));
  $('#testi').addEventListener('mouseleave',()=>testiTimer=setInterval(()=>setTesti(ti+1),5000));

  /* ---------- INIT DYNAMIC BINDINGS ---------- */
  observeReveals();
  // counters need attribute flag
  $$('.counter').forEach(c => { c.dataset.counter = '1'; io.observe(c); });
  bindTilt();
  bindMagnetic();
  onScroll();

  /* ---------- CONTACT FORM ---------- */
  const form = $('#contactForm'), status = $('#formStatus'), submitBtn = $('#submitBtn');
  form.addEventListener('submit', e => {
    e.preventDefault();
    status.className = 'contact__status';
    const name = $('#cName').value.trim(),
          email = $('#cEmail').value.trim(),
          subject = $('#cSubject').value.trim(),
          msg = $('#cMsg').value.trim();
    if (!name || !email || !subject || !msg) {
      status.textContent = 'Please fill in all fields.';
      status.classList.add('error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.classList.add('error'); return;
    }
    submitBtn.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Sending...';
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('span').textContent = 'Send Message';
      status.textContent = `Thanks ${name}! Your message has been sent. 🚀`;
      form.reset();
    }, 1400);
  });

  /* ---------- DOWNLOAD CV (generates a tiny text CV on the fly) ---------- */
  $('#downloadCV').addEventListener('click', e => {
    e.preventDefault();
    const cv = `MOHAMMAD RAYHAN
Frontend Web Developer · UI Designer · Creative Developer
Bangladesh

SKILLS: HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js,
Express, Python, Git, GitHub, Firebase, Tailwind, MongoDB, VS Code

Contact: hello@mohammadrayhan.dev`;
    const blob = new Blob([cv], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Mohammad-Rayhan-CV.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ---------- FOOTER YEAR ---------- */
  $('#year').textContent = new Date().getFullYear();

})();
