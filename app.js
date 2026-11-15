/* Kjötmarkaðurinn v4 (Halcyon system). Halcyon's motion is .3s/.5s ease transitions; no scroll engine, no theme switch. */
(() => {
  const html = document.documentElement, body = document.body;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const B = body.dataset.base || '';
  const CUTS = window.KM_CUTS || [];
  const byS = s => CUTS.find(c => c.s === s) || { n: s, img: '' };
  const hdr = $('[data-hdr]');

  /* header: transparent over a hero, white once scrolled */
  if (body.classList.contains('hdr-over')) { const u = () => hdr.classList.toggle('solid', scrollY > 24); addEventListener('scroll', u, { passive: true }); u(); }

  /* mega menu: hover on fine pointers, click/Enter everywhere; Esc closes; pointer opens onto the panel */
  const megaBtn = $('[data-mega]'), mega = $('[data-mega-panel]');
  let megaT;
  const setMega = (open, viaKey) => {
    clearTimeout(megaT);
    megaBtn.setAttribute('aria-expanded', open); hdr.classList.toggle('mega-open', open);
    if (open) { mega.hidden = false; requestAnimationFrame(() => mega.classList.add('open')); if (viaKey) mega.querySelector('a').focus(); }
    else { mega.classList.remove('open'); megaT = setTimeout(() => { if (!mega.classList.contains('open')) mega.hidden = true; }, 300); }
  };
  if (megaBtn) {
    megaBtn.addEventListener('click', e => setMega(megaBtn.getAttribute('aria-expanded') !== 'true', e.detail === 0));
    if (matchMedia('(hover: hover)').matches) {
      let leaveT;
      [megaBtn, mega].forEach(el => { el.addEventListener('mouseenter', () => { clearTimeout(leaveT); setMega(true); }); el.addEventListener('mouseleave', () => { leaveT = setTimeout(() => setMega(false), 180); }); });
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && megaBtn.getAttribute('aria-expanded') === 'true') { setMega(false); megaBtn.focus(); } });
    document.addEventListener('click', e => { if (!hdr.contains(e.target) && megaBtn.getAttribute('aria-expanded') === 'true') setMega(false); });
  }

  /* phone menu */
  const burger = $('[data-burger]'), mnav = $('#simavalmynd');
  let mT;
  const setMenu = (open, e) => {
    clearTimeout(mT); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Loka valmynd' : 'Opna valmynd');
    hdr.classList.toggle('menu-open', open); html.classList.toggle('lock', open);
    if (open) { mnav.hidden = false; requestAnimationFrame(() => mnav.classList.add('open')); ((e && e.detail === 0) ? mnav.querySelector('a') : mnav).focus({ preventScroll: true }); }
    else { mnav.classList.remove('open'); mT = setTimeout(() => { if (!mnav.classList.contains('open')) mnav.hidden = true; }, 300); }
  };
  burger.addEventListener('click', e => setMenu(burger.getAttribute('aria-expanded') !== 'true', e));
  mnav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });

  /* order list (Halcyon "project") */
  const store = { get() { try { return JSON.parse(localStorage.getItem('km-listi') || '[]'); } catch { return []; } }, set(v) { try { localStorage.setItem('km-listi', JSON.stringify(v)); } catch {} } };
  let list = store.get();
  const lists = [[$('[data-litems]'), $('[data-lempty]')], [$('[data-litems-page]'), $('[data-lempty-page]')]].filter(([u]) => u);
  const unitTxt = x => x.u === 'kassi' ? (x.q === 1 ? 'kassi' : 'kassar') : 'kg';
  function render() {
    $$('[data-count-n]').forEach(n => { n.textContent = list.length; });
    lists.forEach(([ul, empty]) => {
      ul.innerHTML = list.map((x, i) => { const c = byS(x.s); return `<li class="litem"><img src="${B}img/cuts/${c.img}.webp" alt=""><div><b>${c.n}</b><small>${x.a}</small></div>
        <div class="step" role="group" aria-label="Magn ${c.n}"><button type="button" data-li="${i}" data-d="-1" aria-label="Minnka">−</button><output>${x.q}</output><span class="mono">${unitTxt(x)}</span><button type="button" data-li="${i}" data-d="1" aria-label="Auka">+</button></div>
        <button type="button" class="lrm" data-rm="${i}" aria-label="Fjarlægja ${c.n}">✕</button></li>`; }).join('');
      empty.hidden = list.length > 0;
    });
  }
  function add(s, a, u, q) {
    const hit = list.find(x => x.s === s && x.a === a && x.u === u);
    if (hit) hit.q += q; else list.push({ s, a, u, q });
    store.set(list); render();
    $$('.hdr-box').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  }
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-li]'), r = e.target.closest('[data-rm]'), q = e.target.closest('[data-quick]');
    if (s) { const x = list[+s.dataset.li]; x.q = Math.max(1, x.q + +s.dataset.d); store.set(list); render(); }
    if (r) { list.splice(+r.dataset.rm, 1); store.set(list); render(); const d = r.closest('[data-drawer]'); if (d) d.focus({ preventScroll: true }); }
    if (q) { add(q.dataset.quick, 'Ferskt', 'kg', 10); const t = q.textContent; q.classList.add('done'); q.textContent = 'Komið ✓'; setTimeout(() => { q.classList.remove('done'); q.textContent = t; }, 1400); }
  });
  addEventListener('storage', e => { if (e.key === 'km-listi') { list = store.get(); render(); } });
  render();

  /* drawer */
  const drawer = $('[data-drawer]'), scrim = $('[data-scrim]');
  let last = null, cT;
  const open = e => {
    clearTimeout(cT); last = e.currentTarget; if (megaBtn) setMega(false);
    drawer.hidden = false; scrim.hidden = false; html.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => { drawer.classList.add('open'); scrim.classList.add('on'); }));
    ((e.detail === 0) ? drawer.querySelector('button, a[href]') : drawer).focus({ preventScroll: true });
  };
  const close = () => {
    if (drawer.hidden) return;
    drawer.classList.remove('open'); scrim.classList.remove('on'); html.classList.remove('lock');
    cT = setTimeout(() => { if (!drawer.classList.contains('open')) { drawer.hidden = true; scrim.hidden = true; } }, 400);
    last && last.focus({ preventScroll: true });
  };
  $$('[data-open-list]').forEach(b => b.addEventListener('click', open));
  $$('[data-close]').forEach(b => b.addEventListener('click', close));
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (drawer.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') { const f = $$('button, a[href]', drawer).filter(x => x.offsetParent !== null); const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === drawer)) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });

  /* home: tabs + feature image follows the hovered/focused row */
  $$('[role=tab]').forEach(t => t.addEventListener('click', () => {
    $$('[role=tab]').forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); $('#' + x.getAttribute('aria-controls')).hidden = !on; });
  }));
  const fImg = $('[data-feature-img]');
  if (fImg && !(window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)) $$('[data-rows-feature] .row').forEach(r => { const sw = () => { if (fImg.getAttribute('src') === r.dataset.img) return; fImg.style.opacity = 0; setTimeout(() => { fImg.src = r.dataset.img; fImg.style.opacity = 1; }, 180); }; r.addEventListener('mouseenter', sw); r.addEventListener('focusin', sw); });

  /* collection: filter + grid/list + deep links #lamb / #naut */
  const grid = $('[data-grid]');
  if (grid) {
    const cards = $$('.card', grid), nEl = $('[data-n]');
    const apply = f => { $$('.fb').forEach(b => b.setAttribute('aria-pressed', b.dataset.filter === f)); let n = 0; cards.forEach(c => { const on = f === 'allt' || c.dataset.k === f; c.hidden = !on; if (on) n++; }); nEl.textContent = n + ' bitar'; };
    $$('.fb').forEach(b => b.addEventListener('click', () => { apply(b.dataset.filter); history.replaceState(null, '', b.dataset.filter === 'allt' ? location.pathname : '#' + b.dataset.filter); }));
    $$('.vt').forEach(b => b.addEventListener('click', () => { $$('.vt').forEach(x => x.setAttribute('aria-pressed', x === b)); grid.classList.toggle('as-list', b.dataset.view === 'list'); }));
    const h = location.hash.slice(1); if (h === 'lamb' || h === 'naut') apply(h);
    addEventListener('hashchange', () => { const k = location.hash.slice(1); if (k === 'lamb' || k === 'naut') apply(k); });
  }

  /* product configurator (Halcyon: finish / module / qty / Add to project) */
  const buy = $('form[data-buy]');
  if (buy) {
    let q = 10; const out = $('[data-qty]', buy), unit = $('[data-unit]', buy), btn = $('button[type=submit]', buy); let t;
    const sync = () => { const u = $('input[name=u]:checked', buy).value; unit.textContent = u === 'kassi' ? (q === 1 ? 'kassi' : 'kassar') : 'kg'; out.textContent = q; };
    $$('input[name=u]', buy).forEach(r => r.addEventListener('change', () => { q = r.value === 'kassi' ? 1 : 10; sync(); }));
    $$('[data-d]', buy).forEach(b => b.addEventListener('click', () => { const u = $('input[name=u]:checked', buy).value; q = Math.max(1, q + (+b.dataset.d) * (u === 'kassi' ? 1 : 5)); sync(); }));
    buy.addEventListener('submit', e => { e.preventDefault(); add(buy.dataset.buy, $('input[name=a]:checked', buy).value, $('input[name=u]:checked', buy).value, q); btn.classList.add('added'); clearTimeout(t); t = setTimeout(() => btn.classList.remove('added'), 1600); });
    sync();
  }

  /* order form (prototype: nothing is sent) */
  const form = $('[data-order-form]');
  if (form) {
    const msg = $('[data-order-msg]'); const d = new Date(); d.setDate(d.getDate() + 1); $('#o-dag').min = d.toISOString().slice(0, 10);
    form.addEventListener('submit', e => {
      e.preventDefault(); let bad = null;
      $$('[required]', form).forEach(i => { const ok = !!i.value.trim(); i.closest('.field').classList.toggle('bad', !ok); i.setAttribute('aria-invalid', String(!ok)); if (!ok && !bad) bad = i; });
      const em = $('#o-net'); if (em.value && !/.+@.+\..+/.test(em.value)) { em.closest('.field').classList.add('bad'); bad = bad || em; }
      if (bad) { msg.textContent = 'Fylltu út reitina sem eru merktir með stjörnu.'; bad.focus(); return; }
      msg.textContent = `Takk. Þetta er frumgerð, svo engin pöntun var send${list.length ? ` (${list.length} ${list.length === 1 ? 'vara' : 'vörur'} á lista)` : ''}. Í tilbúnum vef fer pöntunin beint til Kjötmarkaðarins og þú færð staðfestingu.`;
    });
  }
})();
