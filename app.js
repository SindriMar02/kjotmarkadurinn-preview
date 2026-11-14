/* Kjötmarkaðurinn v3 (Westholme pattern). Calm by design: CSS transitions and one IntersectionObserver,
   no scroll-driven motion, no animation library. The order list lives in localStorage across the four pages. */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* range (example, to be confirmed by Kjötmarkaðurinn) */
  const RANGE = [
    ['laeri', 'Lambalæri', 'lamb'], ['sneidar', 'Lærissneiðar', 'lamb'], ['skankar', 'Lambaskankar', 'lamb'], ['steikur', 'Lambasteikur', 'lamb'],
    ['hryggur', 'Lambahryggur', 'lamb'], ['kotilettur', 'Lambakótilettur', 'lamb'], ['lfille', 'Lambafille', 'lamb'], ['frampartur', 'Lambaframpartur', 'lamb'],
    ['lhakk', 'Lambahakk', 'lamb'], ['skrokkur', 'Heilir lambaskrokkar', 'lamb'],
    ['lund', 'Nautalundir', 'naut'], ['nfille', 'Nautafille', 'naut'], ['ribeye', 'Ribeye', 'naut'], ['innralaeri', 'Nautainnralæri', 'naut'],
    ['gullas', 'Nautagúllas', 'naut'], ['nhakk', 'Nautahakk', 'naut'],
  ];
  const KIND = { lamb: 'Lambakjöt', naut: 'Nautakjöt' };
  const nameOf = id => (RANGE.find(r => r[0] === id) || [, id])[1];

  /* calm arrival: fade + 24px, once (Westholme fade-in .7s) */
  const rv = $$('.rv');
  if ('IntersectionObserver' in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -5% 0px' });
    rv.forEach(el => io.observe(el));
    setTimeout(() => rv.forEach(el => el.classList.add('in')), 4000); // never leave content hidden
  } else rv.forEach(el => el.classList.add('in'));

  /* header over the hero turns solid after 40px */
  const hdr = $('[data-hdr]');
  if (hdr.classList.contains('hdr-over')) {
    const upd = () => hdr.classList.toggle('solid', scrollY > 40);
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* phone menu: pointer opens onto the panel, keyboard onto the first link (focus-guard rule) */
  const burger = $('[data-burger]'), mnav = $('#simavalmynd');
  let menuT;
  const setMenu = (open, e) => {
    clearTimeout(menuT);
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Loka valmynd' : 'Opna valmynd');
    hdr.classList.toggle('menu-open', open);
    if (open) {
      mnav.hidden = false; requestAnimationFrame(() => mnav.classList.add('open'));
      ((e && e.detail === 0) ? mnav.querySelector('a') : mnav).focus({ preventScroll: true });
    } else { mnav.classList.remove('open'); menuT = setTimeout(() => { if (!mnav.classList.contains('open')) mnav.hidden = true; }, 350); }
  };
  burger.addEventListener('click', e => setMenu(burger.getAttribute('aria-expanded') !== 'true', e));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });

  /* order list */
  const store = { get() { try { return JSON.parse(localStorage.getItem('km-listi') || '[]'); } catch { return []; } }, set(v) { try { localStorage.setItem('km-listi', JSON.stringify(v)); } catch {} } };
  let list = store.get();
  const lists = [[$('[data-litems]'), $('[data-lempty]')], [$('[data-litems-page]'), $('[data-lempty-page]')]].filter(([u]) => u);
  function render() {
    const n = list.length;
    $$('[data-count]').forEach(b => { b.querySelector('[data-count-n]').textContent = n; b.setAttribute('aria-label', `${n} ${n === 1 ? 'vara' : 'vörur'} á lista`); });
    lists.forEach(([ul, empty]) => {
      ul.innerHTML = list.map((x, i) => `<li class="litem"><div><b>${nameOf(x.id)}</b><small>${x.a}</small></div>
        <div class="step" role="group" aria-label="Magn ${nameOf(x.id)}"><button type="button" data-li="${i}" data-d="-5" aria-label="Minnka">−</button><output>${x.kg} kg</output><button type="button" data-li="${i}" data-d="5" aria-label="Auka">+</button></div>
        <button type="button" class="lrm" data-rm="${i}" aria-label="Fjarlægja ${nameOf(x.id)}">✕</button></li>`).join('');
      empty.hidden = n > 0;
    });
  }
  function add(id, a, kg) { const hit = list.find(x => x.id === id && x.a === a); if (hit) hit.kg += kg; else list.push({ id, a, kg }); store.set(list); render(); }
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-li]'), r = e.target.closest('[data-rm]');
    if (s) { const x = list[+s.dataset.li]; x.kg = Math.max(5, x.kg + +s.dataset.d); store.set(list); render(); }
    if (r) { list.splice(+r.dataset.rm, 1); store.set(list); render(); const p = r.closest('[data-drawer]'); if (p) p.focus({ preventScroll: true }); }
  });
  addEventListener('storage', e => { if (e.key === 'km-listi') { list = store.get(); render(); } });
  render();

  /* drawer */
  const drawer = $('[data-drawer]'), scrim = $('[data-scrim]');
  let last = null, closeT;
  const open = e => {
    clearTimeout(closeT); last = e.currentTarget;
    drawer.hidden = false; scrim.hidden = false; html.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => { drawer.classList.add('open'); scrim.classList.add('on'); }));
    ((e.detail === 0) ? drawer.querySelector('button, a[href]') : drawer).focus({ preventScroll: true });
  };
  const close = () => {
    if (drawer.hidden) return;
    drawer.classList.remove('open'); scrim.classList.remove('on'); html.classList.remove('lock');
    closeT = setTimeout(() => { if (!drawer.classList.contains('open')) { drawer.hidden = true; scrim.hidden = true; } }, RM ? 0 : 400);
    last && last.focus({ preventScroll: true });
  };
  $$('[data-open-list]').forEach(b => b.addEventListener('click', open));
  $$('[data-close]').forEach(b => b.addEventListener('click', close));
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (drawer.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const f = $$('button, a[href], input', drawer).filter(x => x.offsetParent !== null);
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === drawer)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* product bands: fresh/frozen + kg + add */
  $$('[data-buy]').forEach(f => {
    let kg = 10; const out = $('output', f), btn = $('button[type=submit]', f); let t;
    $$('[data-d]', f).forEach(b => b.addEventListener('click', () => { kg = Math.max(5, kg + +b.dataset.d); out.textContent = kg + ' kg'; }));
    f.addEventListener('submit', e => {
      e.preventDefault(); add(f.dataset.buy, $('input:checked', f).value, kg);
      btn.classList.add('added'); clearTimeout(t); t = setTimeout(() => btn.classList.remove('added'), 1600);
    });
  });

  /* range list + filter (no animation by design) */
  const rows = $('[data-rows]');
  if (rows) {
    rows.innerHTML = RANGE.map(([id, n, k]) => `<li class="row" data-k="${k}"><div class="row-in"><span class="row-n">${n}</span><span class="row-k">${KIND[k]}</span><span class="row-a">Ferskt · Frosið</span><button type="button" class="row-add" data-quick="${id}" aria-label="Setja ${n} á pöntunarlista">+</button></div></li>`).join('');
    rows.addEventListener('click', e => { const b = e.target.closest('[data-quick]'); if (!b) return; add(b.dataset.quick, 'Ferskt', 10); b.classList.add('done'); b.textContent = '✓'; setTimeout(() => { b.classList.remove('done'); b.textContent = '+'; }, 1400); });
    const applyF = f => { $$('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.filter === f)); $$('.row', rows).forEach(r => { r.hidden = !(f === 'allt' || r.dataset.k === f); }); };
    $$('.chip').forEach(c => c.addEventListener('click', () => applyF(c.dataset.filter)));
    $$('a[href="#urval"]').forEach(a => a.addEventListener('click', () => applyF('naut')));
  }

  /* order form (prototype: nothing is sent) */
  const form = $('[data-order-form]');
  if (form) {
    const msg = $('[data-order-msg]');
    const d = new Date(); d.setDate(d.getDate() + 1); $('#o-dag').min = d.toISOString().slice(0, 10);
    form.addEventListener('submit', e => {
      e.preventDefault(); let bad = null;
      $$('[required]', form).forEach(i => { const ok = !!i.value.trim(); i.closest('.field').classList.toggle('bad', !ok); i.setAttribute('aria-invalid', String(!ok)); if (!ok && !bad) bad = i; });
      const em = $('#o-net'); if (em.value && !/.+@.+\..+/.test(em.value)) { em.closest('.field').classList.add('bad'); bad = bad || em; }
      if (bad) { msg.textContent = 'Fylltu út reitina sem eru merktir.'; bad.focus(); return; }
      msg.textContent = `Takk. Þetta er frumgerð, svo engin pöntun var send${list.length ? ` (${list.length} ${list.length === 1 ? 'vara' : 'vörur'} á lista)` : ''}. Í tilbúnum vef fer pöntunin beint til Kjötmarkaðarins og þú færð staðfestingu.`;
    });
  }
})();
