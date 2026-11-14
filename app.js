/* Kjötmarkaðurinn prototype v2 — King River palette + Agrumea dial + Góa/Katla H7 parts.
   Type rises out of masks (Góa); the dial turns only by hand (arrows, drag, swipe, ← →), never by the page wheel. */
(() => {
  const html = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DESK = () => innerWidth > 991;
  if (RM) html.classList.add('rm');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EASE = 'cubic-bezier(.17,.17,0,1)', EXPO = 'cubic-bezier(.19,1,.22,1)', KRZOOM = 'cubic-bezier(.5,1,.89,1)', KR = 'cubic-bezier(.33,1,.68,1)';
  const G = () => window.gsap && !RM;

  /* ---------- data (example range, to be confirmed by Kjötmarkaðurinn) ---------- */
  const CUTS = [
    { id: 'laeri', n: 'Lambalæri', k: 'lamb', img: 'img/laeri.webp', t: 'Heilt lambalæri með beini. Klassíkin í sunnudagssteikina og á matseðil veitingahúsa allt árið.' },
    { id: 'sneidar', n: 'Lærissneiðar', k: 'lamb', img: 'img/laerissneidar.webp', t: 'Lambalæri skorið í jafnar sneiðar með beini. Tilbúið á pönnu eða grill.' },
    { id: 'skankar', n: 'Lambaskankar', k: 'lamb', img: 'img/skankar.webp', t: 'Skankar til hægeldunar. Vinsælir á veitingahúsum og í mötuneytum.' },
    { id: 'steikur', n: 'Lambasteikur', k: 'lamb', img: 'img/steikur.webp', t: 'Beinlausir lambabitar með fituröndinni, skornir í steikur.' },
  ];
  const RANGE = [
    ...CUTS.map(c => ({ id: c.id, n: c.n, k: 'lamb' })),
    { id: 'hryggur', n: 'Lambahryggur', k: 'lamb' }, { id: 'kotilettur', n: 'Lambakótilettur', k: 'lamb' },
    { id: 'lfille', n: 'Lambafille', k: 'lamb' }, { id: 'frampartur', n: 'Lambaframpartur', k: 'lamb' },
    { id: 'lhakk', n: 'Lambahakk', k: 'lamb' }, { id: 'skrokkur', n: 'Heilir lambaskrokkar', k: 'lamb' },
    { id: 'lund', n: 'Nautalundir', k: 'naut' }, { id: 'nfille', n: 'Nautafille', k: 'naut' },
    { id: 'ribeye', n: 'Ribeye', k: 'naut' }, { id: 'innralaeri', n: 'Nautainnralæri', k: 'naut' },
    { id: 'gullas', n: 'Nautagúllas', k: 'naut' }, { id: 'nhakk', n: 'Nautahakk', k: 'naut' },
  ];
  const KIND = { lamb: 'Lambakjöt', naut: 'Nautakjöt' };

  /* ---------- ledger ---------- */
  const rows = $('[data-rows]');
  rows.innerHTML = RANGE.map(r => `<li class="row" data-k="${r.k}"><div class="row-in"><span class="row-n">${r.n}</span><span class="row-k">${KIND[r.k]}</span><span class="row-a">Ferskt · Frosið</span><button type="button" class="row-add" data-quick="${r.id}" aria-label="Setja ${r.n} á pöntunarlista">+</button></div></li>`).join('');

  /* ---------- order list state ---------- */
  const store = { get() { try { return JSON.parse(localStorage.getItem('km-listi') || '[]'); } catch { return []; } }, set(v) { try { localStorage.setItem('km-listi', JSON.stringify(v)); } catch {} } };
  let list = store.get();
  const nameOf = id => (RANGE.find(r => r.id === id) || {}).n || id;
  function addItem(id, astand, kg) {
    const hit = list.find(x => x.id === id && x.a === astand);
    if (hit) hit.kg += kg; else list.push({ id, a: astand, kg });
    store.set(list); renderList(); bump();
  }
  const countEls = $$('[data-count]');
  function renderCount() { const n = list.length; countEls.forEach(b => { b.querySelector('[data-count-n]').textContent = n; b.setAttribute('aria-label', `${n} ${n === 1 ? 'vara' : 'vörur'} á lista`); }); }
  function bump() {
    renderCount(); if (!G()) return;
    countEls.forEach(b => { gsap.fromTo(b, { scale: 1 }, { scale: 1.18, duration: .17, yoyo: true, repeat: 1, ease: 'power2.out' }); gsap.fromTo(b.firstElementChild, { yPercent: 100 }, { yPercent: 0, duration: .45, ease: EASE }); });
  }
  const litems = $('[data-litems]'), lempty = $('[data-lempty]');
  function renderList() {
    litems.innerHTML = list.map((x, i) => `<li class="litem"><div><b>${nameOf(x.id)}</b><small>${x.a}</small></div>
      <div class="step" role="group" aria-label="Magn ${nameOf(x.id)}"><button type="button" data-li="${i}" data-d="-5" aria-label="Minnka">−</button><output>${x.kg} kg</output><button type="button" data-li="${i}" data-d="5" aria-label="Auka">+</button></div>
      <button type="button" class="lrm" data-rm="${i}" aria-label="Fjarlægja ${nameOf(x.id)}">✕</button></li>`).join('');
    lempty.hidden = list.length > 0; renderCount();
  }
  litems.addEventListener('click', e => {
    const s = e.target.closest('[data-li]'), r = e.target.closest('[data-rm]');
    if (s) { const x = list[+s.dataset.li]; x.kg = Math.max(5, x.kg + +s.dataset.d); store.set(list); s.parentElement.querySelector('output').textContent = x.kg + ' kg'; }
    if (r) {
      const li = r.closest('.litem'), i = +r.dataset.rm;
      const done = () => { list.splice(i, 1); store.set(list); renderList(); $('[data-drawer]').focus({ preventScroll: true }); };
      if (!G()) done(); else gsap.to(li, { height: 0, paddingTop: 0, paddingBottom: 0, duration: .4, ease: EASE, onComplete: done });
    }
  });
  renderList();

  /* ---------- overlays (focus trap; pointer opens onto the panel, keyboard onto the first control) ---------- */
  const scrim = $('[data-scrim]');
  let openEl = null, lastTrigger = null, closeT;
  const lenisRef = { l: null };
  function openPanel(el, e) {
    if (openEl && openEl !== el) closePanel(true);
    clearTimeout(closeT);
    lastTrigger = e && e.currentTarget instanceof HTMLElement ? e.currentTarget : document.activeElement;
    el.hidden = false; scrim.hidden = false;
    html.classList.add('lock'); lenisRef.l && lenisRef.l.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('open'); scrim.classList.add('on'); }));
    openEl = el;
    const viaKey = e && e.detail === 0;
    const first = el.querySelector('button, input, a[href]');
    (viaKey && first ? first : el).focus({ preventScroll: true });
  }
  function closePanel(instant) {
    if (!openEl) return;
    const el = openEl; openEl = null;
    el.classList.remove('open'); scrim.classList.remove('on');
    html.classList.remove('lock'); lenisRef.l && lenisRef.l.start();
    const fin = () => { if (!el.classList.contains('open')) el.hidden = true; if (!openEl) scrim.hidden = true; };
    if (instant || RM) fin(); else closeT = setTimeout(fin, 460);
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  }
  scrim.addEventListener('click', () => closePanel());
  document.addEventListener('keydown', e => {
    if (!openEl) return;
    if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
    if (e.key === 'Tab') {
      const f = $$('button:not([disabled]), input, textarea, a[href]', openEl).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === openEl)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  $$('[data-close]').forEach(b => b.addEventListener('click', () => closePanel()));

  // cut sheet
  const sheet = $('[data-sheet]');
  let cur = null, qty = 10;
  const qtyOut = $('[data-qty]', sheet), addBtn = $('[data-add]', sheet);
  function openCut(c, e) {
    cur = c; qty = 10;
    $('[data-sheet-img]', sheet).src = c.img; $('[data-sheet-img]', sheet).alt = c.n;
    $('[data-sheet-kind]', sheet).textContent = KIND[c.k];
    $('[data-sheet-h]', sheet).textContent = c.n; $('[data-sheet-txt]', sheet).textContent = c.t;
    $('input[value="Ferskt"]', sheet).checked = true; qtyOut.textContent = qty + ' kg'; addBtn.classList.remove('added');
    openPanel(sheet, e);
  }
  $$('[data-step]', sheet).forEach(b => b.addEventListener('click', () => { qty = Math.max(5, qty + +b.dataset.step); qtyOut.textContent = qty + ' kg'; }));
  let addT;
  addBtn.addEventListener('click', () => {
    addItem(cur.id, $('input[name=astand]:checked', sheet).value, qty);
    addBtn.classList.add('added'); clearTimeout(addT); addT = setTimeout(() => addBtn.classList.remove('added'), 1600);
  });
  rows.addEventListener('click', e => {
    const b = e.target.closest('[data-quick]'); if (!b) return;
    addItem(b.dataset.quick, 'Ferskt', 10);
    b.classList.add('done'); b.textContent = '✓'; setTimeout(() => { b.classList.remove('done'); b.textContent = '+'; }, 1400);
  });

  /* ---------- the dial (Agrumea, turned by hand) ---------- */
  const dial = $('[data-dial]'), orbit = $('[data-orbit]'), rim = $('[data-rim]');
  const STEP = 360 / CUTS.length;
  orbit.innerHTML = CUTS.map((c, i) => `<li class="cut" style="--a:${i * STEP}deg" data-i="${i}"><button type="button" tabindex="-1" aria-hidden="true" data-cut="${i}"><img src="${c.img}" alt="" draggable="false"></button></li>`).join('');
  const cutEls = $$('.cut', orbit), nameEl = $('[data-dial-name]'), live = $('[data-dial-live]');
  let idx = 0, rot = 0, rotTween = null;
  const setRot = r => { rot = r; orbit.style.transform = `translateY(var(--lift, 0%)) rotate(${r}deg)`; orbit.style.setProperty('--rot', r + 'deg'); rim.style.transform = `rotate(${r * .5}deg)`; };
  const markTop = () => { cutEls.forEach((el, i) => el.classList.toggle('is-top', i === idx)); };
  function setName(n) {
    if (!G()) { nameEl.textContent = n; return; }
    gsap.timeline().to(nameEl, { yPercent: -110, duration: .22, ease: 'power2.in' }).add(() => { nameEl.textContent = n; }).fromTo(nameEl, { yPercent: 110 }, { yPercent: 0, duration: .45, ease: EXPO });
  }
  function goTo(i, opts = {}) {
    const n = CUTS.length; const ni = ((i % n) + n) % n;
    let target = -i * STEP; // unwrapped so the dial always turns the short way the user asked
    idx = ni; markTop(); setName(CUTS[ni].n); live.textContent = `${CUTS[ni].n}, ${ni + 1} af ${n}`;
    rotTween && rotTween.kill();
    if (!G() || opts.instant) { setRot(target); return; }
    const o = { r: rot }; rotTween = gsap.to(o, { r: target, duration: .95, ease: EXPO, onUpdate: () => setRot(o.r) });
  }
  let virt = 0; // unwrapped index
  const step = d => { virt += d; goTo(virt); };
  $('[data-dial-prev]').addEventListener('click', () => step(-1));
  $('[data-dial-next]').addEventListener('click', () => step(1));
  $('[data-dial-open]').addEventListener('click', e => openCut(CUTS[idx], e));
  orbit.addEventListener('click', e => { const b = e.target.closest('[data-cut]'); if (!b || dragMoved) return; const i = +b.dataset.cut; if (i === idx) openCut(CUTS[i], { currentTarget: $('[data-dial-open]'), detail: 1 }); });
  dial.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } });
  // drag / swipe: horizontal drags turn the dial; vertical swipes stay page scroll (touch-action pan-y)
  let dragX = null, dragRot0 = 0, dragMoved = false, lastX = 0, lastT = 0, vel = 0;
  dial.style.touchAction = 'pan-y';
  dial.addEventListener('pointerdown', e => {
    if (e.target.closest('.dial-ui')) return;
    dragX = e.clientX; dragRot0 = rot; dragMoved = false; lastX = e.clientX; lastT = performance.now(); vel = 0;
    rotTween && rotTween.kill();
  });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    if (!dragMoved && Math.abs(dx) > 6) { dragMoved = true; html.classList.add('dragging'); }
    if (!dragMoved) return;
    const deg = dx / (dial.offsetWidth * .9) * 180;
    setRot(dragRot0 + deg);
    const now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
  });
  const endDrag = () => {
    if (dragX === null) return; dragX = null; html.classList.remove('dragging');
    if (!dragMoved) return;
    const proj = rot + vel * 120; // a flick carries on a little
    virt = Math.round(-proj / STEP); goTo(virt);
    setTimeout(() => { dragMoved = false; }, 0);
  };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  setRot(0); markTop(); live.textContent = `${CUTS[0].n}, 1 af ${CUTS.length}`;

  // drawer
  const drawer = $('[data-drawer]');
  $$('[data-open-list]').forEach(b => b.addEventListener('click', e => {
    renderList(); openPanel(drawer, e);
    if (G()) gsap.from($$('.litem', drawer), { yPercent: 60, duration: .7, stagger: .05, ease: EASE, delay: .15, clearProps: 'transform' });
  }));
  $('[data-close-go]').addEventListener('click', () => { closePanel(true); const t = $('#urval'); lenisRef.l ? lenisRef.l.scrollTo(t, { offset: -70 }) : t.scrollIntoView(); });

  // forms (prototype: nothing is sent)
  function wireForm(form, msgEl, okText) {
    form.addEventListener('submit', e => {
      e.preventDefault(); let bad = null;
      $$('[required]', form).forEach(i => { const ok = i.value.trim() && (i.type !== 'email' || /.+@.+\..+/.test(i.value)); i.closest('.field').classList.toggle('bad', !ok); i.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = i; });
      if (bad) { msgEl.textContent = 'Fylltu út reitina sem eru merktir.'; bad.focus(); return; }
      msgEl.textContent = okText;
    });
  }
  wireForm($('[data-form]'), $('[data-form-msg]'), 'Takk. Þetta er frumgerð, svo ekkert var sent. Í tilbúnum vef fer fyrirspurnin beint á gummig@kjotmarkadurinn.is.');
  wireForm($('[data-list-form]'), $('[data-list-msg]'), 'Takk. Þetta er frumgerð, svo engin pöntun var send. Í tilbúnum vef fer pöntunarlistinn beint til Kjötmarkaðarins og þú færð staðfestingu í tölvupósti.');
  const day = $('#l-dag'); if (day) { const d = new Date(); d.setDate(d.getDate() + 1); day.min = d.toISOString().slice(0, 10); }

  // phone menu
  const burger = $('[data-burger]'), mnav = $('#simavalmynd');
  const setMenu = (open, e) => {
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Loka valmynd' : 'Opna valmynd');
    mnav.classList.toggle('open', open);
    if (open) { const viaKey = e && e.detail === 0; (viaKey ? mnav.querySelector('a') : mnav).focus({ preventScroll: true }); }
  };
  burger.addEventListener('click', e => setMenu(burger.getAttribute('aria-expanded') !== 'true', e));
  mnav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); burger.focus(); } });

  // footer letters
  const wave = $('[data-wave]');
  wave.innerHTML = [...wave.textContent].map((c, i) => `<span class="wl" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');

  /* ---------- filters (shared by chips and the "Sjá …" links) ---------- */
  const rowEls = $$('.row');
  let filterTl;
  function applyFilter(f) {
    $$('.chip').forEach(x => x.setAttribute('aria-pressed', x.dataset.filter === f));
    const show = rowEls.filter(r => f === 'allt' || r.dataset.k === f), hide = rowEls.filter(r => !show.includes(r));
    if (!G()) { rowEls.forEach(r => { r.hidden = !show.includes(r); }); return; }
    filterTl && filterTl.progress(1);
    filterTl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
    filterTl.to(hide.filter(r => !r.hidden), { height: 0, duration: .45, ease: EASE, onComplete() { hide.forEach(r => { r.hidden = true; r.style.height = ''; }); } }, 0);
    const entering = show.filter(r => r.hidden); entering.forEach(r => { r.hidden = false; });
    if (entering.length) filterTl.fromTo(entering, { height: 0 }, { height: 'auto', duration: .45, ease: EASE, clearProps: 'height' }, .2)
      .fromTo(entering.map(r => r.firstElementChild), { yPercent: 100 }, { yPercent: 0, duration: .6, stagger: .03, ease: EASE }, .25);
  }
  $$('.chip').forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.filter)));
  $$('[data-filter-go]').forEach(a => a.addEventListener('click', () => applyFilter(a.dataset.filterGo)));

  /* ---------- motion ---------- */
  if (!G()) { $$('.ln>span,.m>span').forEach(s => s.classList.add('up')); $('.stops').style.setProperty('--prog', '100%'); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (FINE && window.Lenis) {
    const lenis = new Lenis({ duration: 1.4 }); lenisRef.l = lenis;
    lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = a.getAttribute('href'); if (t.length > 1 && $(t)) { e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.6 }); } }));
  }

  const rise = (els, o = {}) => gsap.to(els, { yPercent: 0, y: 0, duration: o.d || 1, stagger: o.s || 0, delay: o.delay || 0, ease: EASE, overwrite: true, onComplete() { gsap.utils.toArray(els).forEach(x => x.classList.add('up')); } });
  gsap.set('.ln>span', { y: 0, yPercent: 125 }); gsap.set('.m>span', { y: 0, yPercent: 105 });

  const hdr = $('[data-hdr]');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => hdr.classList.toggle('solid', s.scroll() > 40) });

  // hero arrival: headline rises, the dial rises out of the bottom edge turning into place (King River hero-zoom curve)
  const body = $('[data-dial-body]'), dialUi = $('.dial-ui');
  gsap.set(dial, { '--lift': '38%' }); gsap.set(dialUi, { autoAlpha: 0, y: 20 }); const spin = { r: 40 }; setRot(40);
  const navEls = $$('.hdr-nav a, .hdr-end > *, .hdr-logo');
  gsap.set(navEls, { yPercent: -160 });
  function heroIn() {
    const tl = gsap.timeline();
    tl.to(navEls, { yPercent: 0, duration: .8, stagger: .04, ease: EASE, clearProps: 'transform' }, 0)
      .add(rise($$('.hero .ln>span'), { d: 1.1, s: .1 }), 0)
      .add(rise($$('.hero .m>span'), { d: 1, s: .08 }), .25)
      .to(dial, { '--lift': '0%', duration: 2.4, ease: KRZOOM }, .1)
      .to(spin, { r: 0, duration: 2.4, ease: KRZOOM, onUpdate: () => { if (!rotTween && dragX === null) setRot(spin.r); } }, .1)
      .to(dialUi, { autoAlpha: 1, y: 0, duration: .8, ease: KR }, 1.2);
  }
  const intro = $('.intro'); let introDone = false;
  if (html.classList.contains('no-intro') || !intro) { introDone = true; heroIn(); }
  else {
    try { sessionStorage.setItem('km-intro', '1'); } catch {}
    intro.style.animation = 'none';
    const it = gsap.timeline();
    it.fromTo('.intro-mark img', { yPercent: 110 }, { yPercent: 0, duration: .7, ease: EXPO }, .05)
      .to('.intro-mark img', { yPercent: -110, duration: .45, ease: 'power3.in' }, .95)
      .to(intro, { yPercent: -105, duration: .8, ease: EXPO }, 1.1)
      .add(() => heroIn(), 1.2);
    it.eventCallback('onComplete', () => { introDone = true; intro.style.display = 'none'; });
    setTimeout(() => { if (!introDone) it.progress(1); }, 6000);
    addEventListener('pageshow', e => { if (e.persisted) it.progress(1); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && !introDone) it.progress(1); });
  }

  // reveals outside the hero
  const mobile = !DESK();
  $$('main > section:not(.hero), .lines > section, .ftr').forEach(sec => {
    const heads = $$('.ln>span', sec), ms = $$('.m>span', sec);
    if (mobile) { [...heads, ...ms].forEach(el => ScrollTrigger.create({ trigger: el.parentElement, start: 'top 92%', once: true, onEnter: () => rise(el) })); return; }
    const byParent = new Map();
    heads.forEach(h => { const p = h.closest('h1,h2,h3'); byParent.set(p, [...(byParent.get(p) || []), h]); });
    byParent.forEach((els, p) => ScrollTrigger.create({ trigger: p, start: 'top 85%', once: true, onEnter: () => rise(els, { d: 1.1, s: .09 }) }));
    ScrollTrigger.batch(ms.map(m => m.parentElement), { start: 'top 88%', once: true, onEnter: b => rise(b.map(x => x.firstElementChild), { s: .07 }) });
  });

  // product-line screens: rule draws (hero-rule), slab wipes up, the cut / photo settles from 1.24 (hero-zoom)
  $$('.line').forEach(l => {
    const rule = $('.rule', l), tex = $('.slab-tex', l), media = $('.slab-cut, .slab-frame img', l);
    gsap.set(rule, { scaleX: 0 }); gsap.set(tex, { clipPath: 'inset(100% 0 0 0)' }); gsap.set(media, { scale: 1.24, yPercent: 8 });
    ScrollTrigger.create({ trigger: l, start: 'top 65%', once: true, onEnter: () => {
      gsap.to(rule, { scaleX: 1, duration: 1.2, delay: .4, ease: KR });
      gsap.to(tex, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: EASE });
      gsap.to(media, { scale: 1, yPercent: 0, duration: 2.4, ease: KRZOOM });
    } });
  });

  // landscape: zoom settles as it arrives, then drifts with scroll (scrub reverses)
  const landImg = $('.land-img img');
  gsap.fromTo(landImg, { scale: 1.24 }, { scale: 1.04, ease: 'none', scrollTrigger: { trigger: '.land', start: 'top bottom', end: 'bottom top', scrub: true } });

  // route draws on scroll (desktop), progress bar on phones
  const lines = $$('.road-line');
  if (DESK()) {
    lines.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    const pins = $$('.stop');
    gsap.set($$('.stop .pin'), { scale: 0 }); gsap.set($$('.stop b, .stop > span:last-child'), { clipPath: 'inset(0 0 100% 0)', y: 14 });
    const st = gsap.timeline({ scrollTrigger: { trigger: '[data-road]', start: 'top 75%', end: 'bottom 55%', scrub: .6 } });
    const showStop = (i, at) => st.to(pins[i].querySelector('.pin'), { scale: 1, duration: .08, ease: 'back.out(2)' }, at).to(pins[i].querySelectorAll('b, span:last-child'), { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .12, stagger: .02, ease: EASE }, at);
    showStop(0, 0); showStop(1, 0);
    st.to(lines[1], { strokeDashoffset: 0, duration: .35, ease: 'none' }, 0).to(lines[0], { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0);
    showStop(2, .45); showStop(3, .9);
  } else {
    $('.stops').style.setProperty('--prog', '0%');
    gsap.to('.stops', { '--prog': '100%', ease: 'none', scrollTrigger: { trigger: '.stops', start: 'top 70%', end: 'bottom 60%', scrub: .4 } });
  }

  // buyer bands + about image: clip wipe, cut-out rises inside
  $$('.band-img, .about-img').forEach(f => {
    const img = $('img', f);
    gsap.set(f, { clipPath: 'inset(100% 0 0 0)' }); gsap.set(img, { yPercent: 18 });
    ScrollTrigger.create({ trigger: f, start: 'top 85%', once: true, onEnter: () => {
      gsap.to(f, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: EASE });
      gsap.to(img, { yPercent: 0, duration: 1.4, ease: EASE, delay: .05, clearProps: 'transform' });
    } });
  });

  // ledger rows rise in
  gsap.set($$('.row-in'), { yPercent: 100 });
  ScrollTrigger.batch(rowEls, { start: 'top 95%', once: true, onEnter: b => gsap.to(b.map(r => r.firstElementChild), { yPercent: 0, duration: .8, stagger: .03, ease: EASE }) });

  // footer curtain
  const ftrIn = $('[data-ftr]');
  if (!mobile) gsap.fromTo(ftrIn, { yPercent: -20 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: 'main', start: 'bottom bottom', end: () => '+=' + $('.ftr').offsetHeight, scrub: true } });
  ScrollTrigger.create({ trigger: '.ftr', start: 'top 60%', onToggle: s => ftrIn.classList.toggle('in-view', s.isActive) });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
