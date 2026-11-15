/* Kjötmarkaðurinn v4.1 motion layer. Spec: _docs/kjotmarkadurinn-2026-11-14/halcyon/MOTION.md.
   Halcyon parts are rebuilt from its own code (footer line field, pinned origin slides, sticky FAQ, header hide);
   reveals and smooth scroll are added on Sindri's request. Everything is skipped under reduced motion. */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DESK = () => innerWidth > 900;

  /* button label roll: two copies of the label in a one-line mask (works without GSAP) */
  $$('.btn').forEach(b => {
    if (b.querySelector('.btn-l, .swap')) { const l = b.querySelector('.btn-l'); if (l && l.children.length === 0) { const t = l.textContent; l.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`; } return; }
    const t = b.textContent.trim(); b.innerHTML = `<span class="btn-l"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  });
  $$('.btn-l').forEach(l => { if (l.children.length === 0) { const t = l.textContent; l.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`; } });

  /* footer line field: Halcyon footerAnim.js algorithm (grid 80px / 60px, 2px #eee strokes toward the pointer,
     length round((10 + dist) / 16), background tint by pointer y). Runs only while the pointer is in the footer. */
  const ftr = $('[data-ftr]'), cv = $('[data-ftr-canvas]');
  if (ftr && cv) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, pts = [], dpr = 1, px = -9999, py = -9999, running = false;
    const START = [255, 255, 255], END = [244, 234, 223];
    const size = () => {
      dpr = devicePixelRatio || 1; W = ftr.offsetWidth; H = ftr.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = innerWidth <= 768 ? 60 : 80; pts = [];
      for (let x = 0; x < W / step + 1; x++) for (let y = 0; y < H / step + 1; y++) pts.push([x * step, y * step]);
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = innerWidth <= 768 ? '#ddd' : '#eee';
      const mx = px === -9999 ? W * .7 : px, my = py === -9999 ? -H * .3 : py;
      for (const [x, y] of pts) {
        const dx = x - mx, dy = y - my, h = (10 + Math.sqrt(dx * dx + dy * dy)) / 4, len = Math.max(1, Math.round(h / 4));
        ctx.save(); ctx.translate(Math.round(x) + .5, Math.round(y) + .5); ctx.rotate(Math.atan2(dy, dx)); ctx.fillRect(0, 0, -len, 2); ctx.restore();
      }
      if (running) requestAnimationFrame(draw);
    };
    const move = e => {
      const r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; px = p.clientX - r.left; py = p.clientY - r.top;
      const t = Math.max(0, Math.min(1, py / H)); ftr.style.backgroundColor = `rgb(${START.map((s, i) => Math.round(s + (END[i] - s) * t)).join(',')})`;
    };
    size(); draw();
    addEventListener('resize', () => { size(); draw(); });
    if (!RM) {
      ftr.addEventListener('mouseenter', () => { if (!running) { running = true; draw(); } });
      ftr.addEventListener('mouseleave', () => { running = false; ftr.style.backgroundColor = ''; });
      ftr.addEventListener('mousemove', move); ftr.addEventListener('touchmove', move, { passive: true });
    }
  }

  if (RM || !window.gsap) return;
  html.classList.add('mo');
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  const EASE = 'power3.out';

  /* smooth scroll (fine pointers only; native on touch) */
  let lenis = null;
  if (FINE && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h.length > 1 && $(h)) { e.preventDefault(); lenis.scrollTo(h, { offset: -60 }); } }));
    const lock = new MutationObserver(() => html.classList.contains('lock') ? lenis.stop() : lenis.start());
    lock.observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  /* header hides on scroll down, returns on scroll up */
  const hdr = $('[data-hdr]'); let lastY = scrollY;
  hdr.addEventListener('focusin', () => hdr.classList.remove('hide')); // keyboard users always see where focus is
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const y = s.scroll(); if (y > 200 && y > lastY + 4) hdr.classList.add('hide'); else if (y < lastY - 4 || y < 200) hdr.classList.remove('hide'); lastY = y; } });

  /* split headings into masked lines */
  const splitLines = el => { const sp = SplitText.create(el, { type: 'lines', linesClass: 'split-line', mask: 'lines' }); return sp.lines; };
  const heroH = $('.hero-h');
  $$('.h-sec, .h-feature, .h-coll, .p-code').forEach(h => {
    if (h.closest('.hero') || h.closest('.pin')) return;
    const lines = splitLines(h); gsap.set(lines, { yPercent: 110 });
    ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1, stagger: .08, ease: EASE }) });
  });

  /* hero arrival + scroll */
  if (heroH) {
    heroH.style.animation = 'none'; const foot = $('.hero-foot'); if (foot) foot.style.animation = 'none';
    const lines = splitLines(heroH); const img = $('.hero-img');
    gsap.set(lines, { yPercent: 110 }); gsap.set(foot, { y: 16, autoAlpha: 0 });
    gsap.timeline({ delay: .1 })
      .fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
      .to(lines, { yPercent: 0, duration: 1, stagger: .08, ease: EASE }, .15)
      .to(foot, { y: 0, autoAlpha: 1, duration: .8, ease: 'power2.out' }, .5);
    gsap.to(img, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (DESK()) gsap.to(heroH, { y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* generic blocks */
  ScrollTrigger.batch('[data-rv]', { start: 'top 90%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'power2.out', overwrite: true }) });

  /* rows (feature + list views) */
  const rows = $$('.rows .row');
  if (rows.length) { gsap.set(rows, { y: 28, autoAlpha: 0 }); ScrollTrigger.batch(rows, { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { y: 0, autoAlpha: 1, duration: .8, stagger: .07, ease: 'power2.out' }) }); }

  /* product cards: tile wipes up, cut settles, meta rises */
  const cardIn = cards => {
    const tl = gsap.timeline();
    cards.forEach((c, i) => {
      const tile = $('.card-tile', c), im = $('.card-tile img', c), meta = $('.card-meta', c);
      tl.to(tile, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power3.inOut' }, i * .07)
        .fromTo(im, { scale: 1.15 }, { scale: 1, duration: 1.2, ease: EASE, clearProps: 'transform' }, i * .07 + .1)
        .to(meta, { opacity: 1, y: 0, duration: .7, ease: 'power2.out' }, i * .07 + .35);
    });
  };
  ScrollTrigger.batch('.card', { start: 'top 92%', once: true, onEnter: cardIn });

  /* parallax inner images */
  if (DESK()) $$('[data-px], .story-img img').forEach(im => {
    gsap.set(im, { scale: 1.12 });
    gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* feature image crossfade on row hover/focus (overrides app.js swap) */
  const fImg = $('[data-feature-img]');
  if (fImg) {
    let cur = fImg.getAttribute('src'), tw;
    $$('[data-rows-feature] .row').forEach(r => {
      const go = () => { const src = r.dataset.img; if (src === cur) return; cur = src; tw && tw.kill();
        tw = gsap.timeline().to(fImg, { autoAlpha: 0, scale: .96, duration: .18, ease: 'power2.in' }).add(() => { fImg.src = src; }).to(fImg, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power2.out' }); };
      r.addEventListener('mouseenter', go, true); r.addEventListener('focusin', go, true);
    });
  }

  /* cut page arrival */
  const pBig = $('.p-big');
  if (pBig) {
    const chars = SplitText.create(pBig, { type: 'chars' }).chars;
    gsap.timeline({ delay: .05 })
      .from(chars, { yPercent: 60, autoAlpha: 0, duration: 1, stagger: .025, ease: EASE }, 0)
      .from('.p-hero-img', { y: 40, scale: .94, autoAlpha: 0, duration: 1.1, ease: EASE }, .15)
      .from('.p-strip li', { y: 20, autoAlpha: 0, duration: .6, stagger: .04, ease: 'power2.out' }, .4);
    gsap.to(pBig, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.p-gallery img', { scale: 1.08, duration: 1.2, ease: EASE, scrollTrigger: { trigger: '.p-conf', start: 'top 85%', once: true } });
  }

  /* Uppruni: Halcyon pinned slides (4 × 100vh), crossfade with counter */
  const pin = $('[data-pin]');
  if (pin) {
    const slides = $$('[data-slide]', pin), nEl = $('[data-pin-n]'), bar = $('[data-pin-bar]');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      let idx = 0;
      slides.forEach((s, i) => gsap.set(s, { autoAlpha: i ? 0 : 1 }));
      const show = i => {
        if (i === idx) return; const prev = slides[idx], next = slides[i]; idx = i;
        prev.classList.remove('is-on'); next.classList.add('is-on');
        gsap.to(prev, { autoAlpha: 0, duration: .5, ease: 'power2.out', overwrite: true });
        gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, ease: 'power2.out', overwrite: true });
        gsap.fromTo($('.pin-img img', next), { scale: 1.08 }, { scale: 1, duration: 1.2, ease: EASE });
        gsap.fromTo($$('.pin-copy > *', next), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .07, ease: 'power2.out' });
        nEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      };
      const st = ScrollTrigger.create({ trigger: pin, start: 'top top', end: () => '+=' + innerHeight * slides.length, pin: '[data-pin-wrap]', pinSpacing: true,
        onToggle: s => hdr.classList.toggle('hide', s.isActive),
        onUpdate: s => { const i = Math.min(slides.length - 1, Math.floor(s.progress * slides.length)); show(i); gsap.set(bar, { scaleX: (i + 1) / slides.length }); } });
      return () => { st.kill(); slides.forEach(s => gsap.set(s, { clearProps: 'all' })); };
    });
  }

  /* FAQ title sticks while answers scroll (Halcyon .faq-main__left--sticky) */
  const faqHead = $('.faq-head');
  if (faqHead && DESK()) ScrollTrigger.create({ trigger: '.faq', start: 'top 80px', end: 'bottom 60%', pin: faqHead, pinSpacing: false });

  /* collection filter: Flip the grid */
  const grid = $('[data-grid]');
  if (grid) {
    // runs after app.js has applied the filter (bubble phase): the visible cards rise in, staggered
    let ftw;
    $$('.fb, .vt').forEach(b => b.addEventListener('click', () => {
      const vis = $$('.card', grid).filter(c => !c.hidden);
      ftw && ftw.progress(1);
      vis.forEach(c => { gsap.set($('.card-tile', c), { clipPath: 'inset(0% 0 0 0)' }); gsap.set($('.card-meta', c), { opacity: 1, y: 0 }); });
      ftw = gsap.fromTo(vis, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .04, ease: EASE, clearProps: 'transform,opacity,visibility', onComplete: () => ScrollTrigger.refresh() });
    }));
  }

  /* panels: stagger their items when they open */
  // opacity only (never visibility): focus moves onto these links as the panel opens
  const stagger = (sel, root) => gsap.fromTo($$(sel, root), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .03, ease: 'power2.out', overwrite: true, clearProps: 'transform,opacity' });
  const mega = $('[data-mega-panel]'), mnav = $('#simavalmynd'), drawer = $('[data-drawer]');
  const watch = (el, sel) => el && new MutationObserver(() => { if (el.classList.contains('open')) stagger(sel, el); }).observe(el, { attributes: true, attributeFilter: ['class'] });
  watch(mega, '.mega-col li, .mega-feat'); watch(mnav, 'a, .mnav-h'); watch(drawer, '.litem, .lempty, .drawer-foot');

  /* footer content */
  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
