/* Kjötmarkaðurinn prototype — H7 Brand shelf (Góa/Katla motion vocabulary). Nothing fades; everything rises out of a mask. */
(() => {
  const html = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DESK = () => innerWidth > 991;
  if (RM) html.classList.add('rm');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EASE = 'cubic-bezier(.17,.17,0,1)';

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
  const GROUNDS = ['var(--el1)', 'var(--el2)', 'var(--el3)', 'var(--el2)'];

  /* ---------- letter cascade on buttons and nav ---------- */
  $$('.cas').forEach(el => {
    const txt = el.textContent;
    const line = hidden => `<span class="cl"${hidden ? ' aria-hidden="true"' : ''}>${[...txt].map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('')}</span>`;
    el.innerHTML = `<span class="cas-w">${line(false)}${line(true)}</span>`;
  });

  /* ---------- render shelf + ledger ---------- */
  const tiles = $('[data-tiles]');
  tiles.innerHTML = CUTS.map((c, i) => `<li class="tile"><button type="button" data-cut="${c.id}" aria-haspopup="dialog" aria-controls="biti">
      <span class="tile-g" style="--g:${GROUNDS[i]}"><span class="tile-img"><img src="${c.img}" alt="${c.n}" loading="lazy"></span><span class="tile-plus" aria-hidden="true">+</span></span>
      <span class="tile-meta"><b>${c.n}</b><span>Ferskt · Frosið</span></span></button></li>`).join('');
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
  function renderCount() {
    const n = list.length;
    countEls.forEach(b => { b.querySelector('[data-count-n]').textContent = n; b.setAttribute('aria-label', `${n} ${n === 1 ? 'vara' : 'vörur'} á lista`); });
  }
  function bump() {
    renderCount();
    if (RM || !window.gsap) return;
    countEls.forEach(b => { gsap.fromTo(b, { scale: 1 }, { scale: 1.18, duration: .17, yoyo: true, repeat: 1, ease: 'power2.out' }); gsap.fromTo(b.firstElementChild, { yPercent: 100 }, { yPercent: 0, duration: .45, ease: EASE }); });
  }
  const litems = $('[data-litems]'), lempty = $('[data-lempty]');
  function renderList() {
    litems.innerHTML = list.map((x, i) => `<li class="litem"><div><b>${nameOf(x.id)}</b><small>${x.a}</small></div>
      <div class="step" role="group" aria-label="Magn ${nameOf(x.id)}"><button type="button" data-li="${i}" data-d="-5" aria-label="Minnka">−</button><output>${x.kg} kg</output><button type="button" data-li="${i}" data-d="5" aria-label="Auka">+</button></div>
      <button type="button" class="lrm" data-rm="${i}" aria-label="Fjarlægja ${nameOf(x.id)}">✕</button></li>`).join('');
    lempty.hidden = list.length > 0;
    renderCount();
  }
  litems.addEventListener('click', e => {
    const s = e.target.closest('[data-li]'), r = e.target.closest('[data-rm]');
    if (s) { const x = list[+s.dataset.li]; x.kg = Math.max(5, x.kg + +s.dataset.d); store.set(list); s.parentElement.querySelector('output').textContent = x.kg + ' kg'; }
    if (r) {
      const li = r.closest('.litem'), i = +r.dataset.rm;
      const done = () => { list.splice(i, 1); store.set(list); renderList(); $('[data-drawer]').focus({ preventScroll: true }); };
      if (RM || !window.gsap) done(); else gsap.to(li, { height: 0, paddingTop: 0, paddingBottom: 0, duration: .4, ease: EASE, onComplete: done });
    }
  });
  renderList();

  /* ---------- overlays: sheet + drawer (focus trap, pointer opens onto the panel) ---------- */
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
      const f = $$('button:not([disabled]), input, textarea, a[href], output[tabindex]', openEl).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === openEl)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  $$('[data-close]').forEach(b => b.addEventListener('click', () => closePanel()));
  $('[data-close-go]').addEventListener('click', () => closePanel(true));

  // cut sheet
  const sheet = $('[data-sheet]');
  let cur = null, qty = 10;
  const qtyOut = $('[data-qty]', sheet), addBtn = $('[data-add]', sheet);
  tiles.addEventListener('click', e => {
    const b = e.target.closest('[data-cut]'); if (!b) return;
    cur = CUTS.find(c => c.id === b.dataset.cut); qty = 10;
    $('[data-sheet-img]', sheet).src = cur.img; $('[data-sheet-img]', sheet).alt = cur.n;
    $('[data-sheet-kind]', sheet).textContent = KIND[cur.k];
    $('[data-sheet-h]', sheet).textContent = cur.n; $('[data-sheet-txt]', sheet).textContent = cur.t;
    $('input[value="Ferskt"]', sheet).checked = true; qtyOut.textContent = qty + ' kg'; addBtn.classList.remove('added');
    openPanel(sheet, { currentTarget: b, detail: e.detail });
  });
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

  // drawer
  const drawer = $('[data-drawer]');
  $$('[data-open-list]').forEach(b => b.addEventListener('click', e => {
    renderList(); openPanel(drawer, e);
    if (!RM && window.gsap) gsap.from($$('.litem', drawer), { yPercent: 60, duration: .7, stagger: .05, ease: EASE, delay: .15, clearProps: 'transform' });
  }));
  $('[data-close-go]').addEventListener('click', () => { const t = $('#vorur'); lenisRef.l ? lenisRef.l.scrollTo(t, { offset: -70 }) : t.scrollIntoView(); });

  // forms (prototype: nothing is sent)
  function wireForm(form, msgEl, okText) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let bad = null;
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

  /* ---------- motion ---------- */
  function revealAllStatic() { $$('.ln>span,.m>span').forEach(s => s.classList.add('up')); $$('.tile-g').forEach(t => t.classList.add('up')); }
  if (RM || !window.gsap) { revealAllStatic(); setupRoadStatic(); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Lenis: fine pointers only, never touch
  if (FINE && window.Lenis) {
    const lenis = new Lenis({ duration: 1.4 });
    lenisRef.l = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = a.getAttribute('href'); if (t.length > 1 && $(t)) { e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.6 }); } }));
  }

  const rise = (els, o = {}) => gsap.to(els, { yPercent: 0, y: 0, duration: o.d || 1, stagger: o.s || 0, delay: o.delay || 0, ease: EASE, overwrite: true, onComplete() { gsap.utils.toArray(els).forEach(x => x.classList.add('up')); } });
  // initial states owned by GSAP from here on
  gsap.set('.ln>span', { yPercent: 125 }); gsap.set('.m>span', { yPercent: 105 });

  // header solid state
  const hdr = $('[data-hdr]');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => hdr.classList.toggle('solid', s.scroll() > 40) });

  // hero arrival (after intro)
  const heroCut = $('.hero-cut-img'), heroTag = $('.hero-cut .tag');
  gsap.set(heroCut, { yPercent: 30, rotate: -8 }); gsap.set(heroTag, { clipPath: 'inset(0 100% 0 0)' });
  const navLabels = $$('.hdr-nav .cas-w, .hdr-end > *, .hdr-logo');
  gsap.set(navLabels, { yPercent: -140 });
  function heroIn() {
    const tl = gsap.timeline();
    tl.to(navLabels, { yPercent: 0, duration: .8, stagger: .04, ease: EASE, clearProps: 'transform' }, 0)
      .add(rise($$('.hero .ln>span'), { d: 1.1, s: .09 }), 0)
      .add(rise($$('.hero .m>span'), { d: 1, s: .08 }), .25)
      .to(heroCut, { yPercent: 0, rotate: -3, duration: 1.3, ease: EASE }, .1)
      .to(heroTag, { clipPath: 'inset(0 0% 0 0)', duration: .8, ease: EASE }, .8);
    // scroll scrub on the leg (desktop)
    if (DESK()) tl.add(() => gsap.fromTo(heroCut, { y: 0, rotate: -3 }, { y: () => -innerHeight * .12, rotate: 4, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
  }
  // intro: red panel rises with the mark, holds, leaves; never blocks input after ~1.6s
  const intro = $('.intro');
  let introDone = false;
  const finishIntro = () => { if (introDone) return; introDone = true; intro.style.display = 'none'; heroIn(); };
  if (html.classList.contains('no-intro') || !intro) { finishIntro(); }
  else {
    try { sessionStorage.setItem('km-intro', '1'); } catch {}
    const it = gsap.timeline();
    intro.style.animation = 'none';
    it.fromTo('.intro-mark img', { yPercent: 110 }, { yPercent: 0, duration: .7, ease: EASE }, .05)
      .to('.intro-mark img', { yPercent: -110, duration: .45, ease: 'power3.in' }, .95)
      .to(intro, { yPercent: -100, duration: .65, ease: 'power3.inOut' }, 1.1);
    it.add(() => heroIn(), 1.25); it.eventCallback('onComplete', () => { introDone = true; intro.style.display = 'none'; });
    setTimeout(() => { if (!introDone) { it.progress(1); } }, 6000);
    addEventListener('pageshow', e => { if (e.persisted) it.progress(1); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && !introDone) it.progress(1); });
  }

  // scroll reveals: everything outside the hero rises in its mask
  const mobile = !DESK();
  const groups = $$('main > section:not(.hero), .ftr');
  groups.forEach(sec => {
    const heads = $$('.ln>span', sec).filter(x => !x.closest('.bpanel') || mobile);
    const ms = $$('.m>span', sec);
    if (mobile) {
      [...heads, ...ms].forEach(el => ScrollTrigger.create({ trigger: el.parentElement, start: 'top 92%', once: true, onEnter: () => rise(el) }));
    } else {
      const byParent = new Map();
      heads.forEach(h => { const p = h.closest('h1,h2,h3'); byParent.set(p, [...(byParent.get(p) || []), h]); });
      byParent.forEach((els, p) => ScrollTrigger.create({ trigger: p, start: 'top 85%', once: true, onEnter: () => rise(els, { d: 1.1, s: .09 }) }));
      ScrollTrigger.batch(ms.map(m => m.parentElement), { start: 'top 88%', once: true, onEnter: b => rise(b.map(x => x.firstElementChild), { s: .07 }) });
    }
  });

  // shelf tiles: clip rise, cut-out rises inside
  $$('.tile').forEach((t, i) => {
    const g = $('.tile-g', t), img = $('.tile-img', t), meta = $('.tile-meta', t);
    gsap.set(img, { yPercent: 20 }); gsap.set(meta, { yPercent: 40, clipPath: 'inset(0 0 100% 0)' });
    ScrollTrigger.create({ trigger: t, start: 'top 90%', once: true, onEnter: () => {
      const d = mobile ? 0 : (i % 4) * .08;
      g.style.transitionDelay = d + 's'; g.classList.add('up');
      gsap.to(img, { yPercent: 0, duration: 1.2, delay: d + .1, ease: EASE, clearProps: 'transform' });
      gsap.to(meta, { yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: .9, delay: d + .25, ease: EASE });
    } });
  });

  // ledger rows rise in, filter with collapse/expand
  const rowEls = $$('.row');
  gsap.set($$('.row-in'), { yPercent: 100 });
  ScrollTrigger.batch(rowEls, { start: 'top 95%', once: true, onEnter: b => gsap.to(b.map(r => r.firstElementChild), { yPercent: 0, duration: .8, stagger: .03, ease: EASE }) });
  let filterTl;
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    $$('.chip').forEach(x => x.setAttribute('aria-pressed', x === c));
    const f = c.dataset.filter;
    filterTl && filterTl.progress(1);
    const show = rowEls.filter(r => f === 'allt' || r.dataset.k === f), hide = rowEls.filter(r => !show.includes(r));
    filterTl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
    filterTl.to(hide.filter(r => !r.hidden), { height: 0, duration: .45, ease: EASE, onComplete() { hide.forEach(r => { r.hidden = true; r.style.height = ''; }); } }, 0);
    const entering = show.filter(r => r.hidden);
    entering.forEach(r => { r.hidden = false; });
    if (entering.length) filterTl.fromTo(entering, { height: 0 }, { height: 'auto', duration: .45, ease: EASE, clearProps: 'height' }, .2)
      .fromTo(entering.map(r => r.firstElementChild), { yPercent: 100 }, { yPercent: 0, duration: .6, stagger: .03, ease: EASE }, .25);
  }));

  // supply road: draw on scroll (signature)
  function setupRoadStatic() { $$('.road-line').forEach(p => { p.style.strokeDasharray = 'none'; }); $('.stops').style.setProperty('--prog', '100%'); }
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

  // buyers: pinned horizontal carousel (desktop), stacked on phone
  if (DESK()) {
    const track = $('[data-track]');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '[data-pin]', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: .5, invalidateOnRefresh: true } });
    $$('.bpanel').forEach(p => {
      const h = $$('.ln>span', p);
      gsap.set($$('p, img, .btn', p), { yPercent: 30, clipPath: 'inset(0 0 100% 0)' });
      ScrollTrigger.create({ trigger: p, containerAnimation: tween, start: 'left 95%', once: true, onEnter: () => {
        rise(h, { d: 1.1 });
        gsap.to($$('p, img, .btn', p), { yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 1, stagger: .08, ease: EASE, delay: .1 });
      } });
    });
  }

  // footer curtain
  const ftrIn = $('[data-ftr]');
  if (!mobile) gsap.fromTo(ftrIn, { yPercent: -20 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: 'main', start: 'bottom bottom', end: () => '+=' + $('.ftr').offsetHeight, scrub: true } });
  ScrollTrigger.create({ trigger: '.ftr', start: 'top 60%', onToggle: s => ftrIn.classList.toggle('in-view', s.isActive) });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
