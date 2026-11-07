/* Small finishing touches: name reveal, scroll progress, cursor glow,
 * magnetic buttons, card spotlights and headings that draw their line in.
 * Everything here is decoration. With reduced motion turned on, only the
 * static parts stay.
 */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ---- the name arrives letter by letter ---- */
  const h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    h1.setAttribute('aria-label', [...h1.querySelectorAll('.h1-line')].map((l) => l.firstChild.textContent.trim()).join(' '));
    let n = 0;
    h1.querySelectorAll('.h1-line').forEach((line) => {
      [...line.childNodes].forEach((node) => {
        if (node.nodeType !== 3) { node.style.setProperty('--i', n++); node.classList.add('ch'); node.setAttribute('aria-hidden', 'true'); return; }
        const frag = document.createDocumentFragment();
        [...node.textContent].forEach((c) => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          s.setAttribute('aria-hidden', 'true');
          s.style.setProperty('--i', n++);
          frag.append(s);
        });
        line.replaceChild(frag, node);
      });
    });
    root.classList.add('split-on');
  }

  /* ---- scroll progress ---- */
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- headings draw their line when they come into view ---- */
  const lines = document.querySelectorAll('.work-head, .more h2');
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('lines-on');
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); }
    }), { threshold: 0.4 });
    lines.forEach((l) => io.observe(l));
  }

  if (reduce || !fine) return;

  /* ---- a soft glow that follows the cursor across the hero ---- */
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
      hero.classList.add('glow');
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('glow'));
  }

  /* ---- buttons lean toward the cursor ---- */
  document.querySelectorAll('.btn, .guide-dock').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.25;
      b.style.transform = `translate(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  /* ---- project cards light up under the cursor ---- */
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.project');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - r.left}px`);
    card.style.setProperty('--y', `${e.clientY - r.top}px`);
  }, { passive: true });
})();
