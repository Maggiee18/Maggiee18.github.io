/* Portfolio behaviour: speech bubble and skill tour, the work list, and the
 * cinematic touches (spotlight dust, parallax, reveals, cursor, nav).
 * Plain JavaScript, no build step. Everything degrades gracefully: with
 * reduced motion the page is still complete, just still.
 */
(function () {
  'use strict';

  const { SKILLS } = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const COLORS = {
    agents: '#8b7cf6', ml: '#c084fc', backend: '#2dd4bf', reliability: '#34d399',
    frontend: '#f87171', speech: '#fb923c', finance: '#f5b942', algorithms: '#60a5fa',
  };
  const hero = $('#top');
  const count = (id) => PROJECTS.filter((p) => p.skills.includes(id)).length;
  const firstSentence = (t) => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();

  /* =========================================================
     Work list
     ========================================================= */
  // Projects live in index.html (so search engines and AI tools can read them);
  // this reads them back into data the tour, assistant and terminal can use.
  const list = $('#projects');
  const PROJECTS = [...list.querySelectorAll('.project')].map((li, i) => {
    const name = li.querySelector('.p-name').childNodes[0].textContent.trim();
    return {
      i, el: li, id: li.id, name,
      status: li.querySelector('.status')?.textContent || '',
      skills: li.dataset.skills.split(' '),
      what: li.querySelector('.p-what').textContent.trim(),
      proof: li.querySelector('.p-proof')?.textContent.trim() || '',
      challenge: li.querySelector('.p-challenge')?.textContent.trim() || '',
      stack: [...li.querySelectorAll('.tags span')].map((t) => t.textContent),
      links: [...li.querySelectorAll('.p-actions a')].map((a) => ({ label: a.childNodes[0].textContent.trim(), href: a.href })),
    };
  });

  // The full story is visible in the HTML (so tools that don't run JavaScript can
  // read it); here it folds away behind "Explore project".
  list.querySelectorAll('.p-more').forEach((m) => { m.hidden = true; });

  // "Explore project" opens the full story in place
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.p-explore');
    if (!btn) return;
    const more = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Show less' : 'Explore project';
    btn.closest('.project').classList.toggle('open', open);
    if (open) { more.hidden = false; requestAnimationFrame(() => more.classList.add('show')); }
    else { more.classList.remove('show'); more.hidden = true; }
  });

  // chips: one row in the hero (opens the tour), one above the work list (filters)
  function makeChip(s, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.skill = s.id;
    b.style.setProperty('--c', COLORS[s.id] || '#f5b942');
    b.setAttribute('aria-pressed', 'false');
    b.textContent = s.short;
    b.addEventListener('click', () => onClick(s.id));
    return b;
  }
  const heroChips = $('#hero-chips');
  const filter = $('#filter');
  const note = $('#filter-note');
  SKILLS.forEach((s) => {
    heroChips.append(makeChip(s, (id) => (active === id ? closeTour(true) : openTour(id))));
    const f = makeChip(s, (id) => setFilter(active === id ? null : id));
    f.textContent = `${s.name} · ${count(s.id)}`;
    filter.append(f);
  });

  let active = null;
  function setFilter(id) {
    active = id;
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.skill === id)));
    list.querySelectorAll('.project').forEach((li) => li.classList.toggle('dim', !!id && !li.dataset.skills.split(' ').includes(id)));
    const s = SKILLS.find((x) => x.id === id);
    note.textContent = id ? `${count(id)} projects use ${s.name.toLowerCase()}. Tap it again to see everything.` : '';
  }

  // marquee
  const track = $('#marquee');
  const words = SKILLS.map((s) => s.name).concat(['Full stack', 'AI applications']);
  [...words, ...words].forEach((w) => { const s = document.createElement('span'); s.textContent = w; track.append(s); });

  /* =========================================================
     Speech bubble + skill tour (text and voice)
     ========================================================= */
  const LINES = [
    "Hey!! I'm Sai Meghana Annepu.",
    "I'm a final year CSE student at SRM University AP, specialising in AI and ML.",
    'I love building AI applications that make everyday life easier, from the interface to the backend.',
    'Tap any skill on the right and I will walk you through the projects where I used it.',
    'Scroll down for all my work, and my resume is one click away. Thanks for stopping by!',
  ];
  const guide = $('#guide');
  const textEl = $('.bubble-text', guide);
  const playBtn = $('.b-play', guide);
  const nextBtn = $('.b-next', guide);
  const skipBtn = $('.b-skip', guide);
  const tour = $('#tour');
  const tourList = $('.tour-list', tour);
  const voiceBtn = $('.tour-voice', tour);
  let line = -1, typer = 0, auto = 0, typing = false, speaking = false, reading = false;
  let muted = false, run = null, runId = 0;

  function syncState() {
    guide.classList.toggle('typing', typing);
    guide.classList.toggle('speaking', speaking);
  }
  function say(text) {
    clearInterval(typer);
    guide.classList.remove('pop'); void guide.offsetWidth; guide.classList.add('pop');
    if (reduce) { textEl.textContent = text; typing = false; syncState(); return; }
    textEl.textContent = '';
    let i = 0;
    typing = true; syncState();
    typer = setInterval(() => {
      i += 2;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(typer); typing = false; syncState(); }
    }, 26);
  }
  function show(i) {
    line = i;
    say(LINES[i]);
    nextBtn.textContent = i < LINES.length - 1 ? 'Next' : 'Start again';
  }
  function autoplay() {
    clearTimeout(auto);
    if (reduce || reading || run) return;
    auto = setTimeout(() => {
      if (line < LINES.length - 1 && !guide.classList.contains('hide')) { show(line + 1); autoplay(); }
    }, Math.max(3800, LINES[line].length * 55));
  }

  // voice
  const synth = window.speechSynthesis;
  let voice = null;
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices();
    if (!vs.length) return;
    const female = /female|neerja|aditi|veena|raveena|heera|kalpana|zira|aria|jenny|sonia|libby|samantha|karen|moira|tessa|google uk english female|google us english/i;
    voice =
      vs.find((v) => /en-IN/i.test(v.lang) && /neerja/i.test(v.name)) ||
      vs.find((v) => /en-IN/i.test(v.lang) && female.test(v.name)) ||
      vs.find((v) => /^en/i.test(v.lang) && /natural/i.test(v.name) && female.test(v.name)) ||
      vs.find((v) => /^en/i.test(v.lang) && female.test(v.name)) ||
      null;
    playBtn.hidden = !voice;
    refreshVoice();
  }
  if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }
  function utter(text, onEnd) {
    const u = new SpeechSynthesisUtterance(text.replace('Hey!!', 'Hey!'));
    u.voice = voice; u.lang = voice.lang; u.rate = 1.03; u.pitch = 1.08;
    u.onstart = () => { speaking = true; syncState(); };
    u.onend = () => { speaking = false; syncState(); onEnd && onEnd(); };
    u.onerror = () => { speaking = false; syncState(); };
    synth.speak(u);
  }
  function stopVoice() {
    reading = false;
    if (synth) synth.cancel();
    speaking = false; syncState();
    $('span', playBtn).textContent = 'Read aloud';
  }
  function readFrom(i) {
    if (!reading || i >= LINES.length) { stopVoice(); return; }
    show(i);
    clearInterval(typer); textEl.textContent = LINES[i]; typing = false; syncState();
    utter(LINES[i], () => setTimeout(() => readFrom(i + 1), 320));
  }
  playBtn.addEventListener('click', () => {
    if (reading) { stopVoice(); return; }
    if (!voice) return;
    endRun(); clearTimeout(auto); synth.cancel();
    reading = true;
    $('span', playBtn).textContent = 'Stop';
    readFrom(line < 0 ? 0 : line);
  });
  nextBtn.addEventListener('click', () => {
    stopVoice(); endRun(); clearTimeout(auto);
    show(line < LINES.length - 1 ? line + 1 : 0);
  });

  // hide the bubble, with a small button to bring her back
  const hi = document.createElement('button');
  hi.type = 'button'; hi.className = 'say-hi'; hi.textContent = 'Hi!'; hi.hidden = true;
  hi.setAttribute('aria-label', 'Show the speech bubble again');
  document.body.append(hi);
  skipBtn.addEventListener('click', () => {
    stopVoice(); endRun(); clearTimeout(auto); clearInterval(typer);
    guide.classList.add('hide'); hi.hidden = false;
  });
  hi.addEventListener('click', () => {
    guide.classList.remove('hide'); hi.hidden = true;
    $('#top').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    show(0); autoplay();
  });

  // the skill tour
  function refreshVoice() {
    voiceBtn.hidden = !voice;
    voiceBtn.textContent = muted ? 'Unmute voice' : 'Mute voice';
  }
  function markNow(k) {
    [...tourList.children].forEach((li, j) => li.classList.toggle('now', j === k));
    const cur = tourList.children[k];
    if (cur) cur.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }
  function endRun() {
    if (run) clearTimeout(run.timer);
    run = null;
    markNow(-1);
  }
  function step(id) {
    if (!run || run.id !== id) return;
    const st = run.steps[run.i];
    if (!st) { endRun(); return; }
    markNow(st.k);
    if (!guide.classList.contains('hide')) say(st.text);
    const advance = () => { if (!run || run.id !== id) return; run.i++; run.timer = setTimeout(() => step(id), 380); };
    if (voice && !muted && synth) utter(st.text, advance);
    else run.timer = setTimeout(advance, Math.max(3400, st.text.length * 58));
  }
  function openTour(id) {
    const skill = SKILLS.find((x) => x.id === id);
    const items = PROJECTS.filter((p) => p.skills.includes(id)).map((p) => ({ p, i: p.i }));
    stopVoice(); endRun(); clearTimeout(auto);
    setFilter(id);
    tour.style.setProperty('--c', COLORS[id] || '#f5b942');
    $('#tour-title').textContent = skill.name;
    $('.tour-count', tour).textContent = `${items.length} project${items.length === 1 ? '' : 's'}`;
    tourList.innerHTML = '';
    items.forEach(({ p, i }, k) => {
      const li = document.createElement('li');
      li.style.setProperty('--k', k);
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<strong></strong><span></span>';
      b.querySelector('strong').textContent = p.name;
      b.querySelector('span').textContent = firstSentence(p.what);
      b.addEventListener('click', () => { closeTour(false); goToProject(i); });
      li.append(b);
      tourList.append(li);
    });
    refreshVoice();
    tour.hidden = false;
    hero.classList.add('touring');
    tour.classList.remove('open'); void tour.offsetWidth; tour.classList.add('open');
    const steps = [{ text: `${skill.short}! I've used it in ${items.length} project${items.length === 1 ? '' : 's'}. Here's a quick tour.`, k: -1 }];
    items.forEach(({ p }, k) => steps.push({ text: `${p.name}. ${firstSentence(p.what)}`, k }));
    steps.push({ text: 'Tap any project for the full story, or pick another skill!', k: -1 });
    run = { id: ++runId, steps, i: 0, timer: 0 };
    step(run.id);
  }
  function closeTour(reset) {
    endRun(); stopVoice();
    tour.hidden = true;
    hero.classList.remove('touring');
    if (reset) { setFilter(null); say('Pick another skill whenever you like!'); }
  }
  function goToProject(i) {
    const p = PROJECTS[i];
    const el = p.el;
    el.classList.add('in');
    const btn = el.querySelector('.p-explore');
    if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  // shared with extras.js (the assistant and terminal mode)
  Object.assign(window.PORTFOLIO, { PROJECTS, goToProject, setFilter, count });
  $('.tour-close', tour).addEventListener('click', () => closeTour(true));
  $('.tour-more', tour).addEventListener('click', () => closeTour(false));
  voiceBtn.addEventListener('click', () => { muted = !muted; refreshVoice(); if (muted && synth) synth.cancel(); });
  tour.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTour(true); });

  // stop talking once the hero is out of view
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { stopVoice(); endRun(); clearTimeout(auto); tour.hidden = true; hero.classList.remove('touring'); }
  }, { threshold: 0.05 }).observe($('#top'));

  setTimeout(() => { show(0); autoplay(); }, reduce ? 0 : 1700);

  /* =========================================================
     Cinematic touches
     ========================================================= */
  const me = $('.me');
  if (!reduce) me.addEventListener('animationend', () => me.classList.add('float'), { once: true });

  // scroll: progress bar, nav, statement scrub
  const bar = $('.progress');
  const nav = $('#nav');
  let lastY = 0, ticking = false;
  const scrub = $('#scrub');
  const goldWords = /^(AI|explains|itself,|working|enjoy)/;
  scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map((w) => `<span class="w${goldWords.test(w) ? ' gold' : ''}">${w}</span>`).join(' ');
  const wordEls = [...scrub.querySelectorAll('.w')];
  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    nav.classList.toggle('solid', y > 40);
    nav.classList.toggle('hide', y > lastY && y > window.innerHeight * 0.6 && !reduce);
    lastY = y;
    const r = scrub.getBoundingClientRect();
    const t = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.35);
    const n = reduce ? wordEls.length : Math.round(Math.max(0, Math.min(1, t)) * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('lit', i < n));
    const tl = $('#timeline');
    if (tl) {
      const tr = tl.getBoundingClientRect();
      const f = reduce ? 1 : Math.max(0, Math.min(1, (window.innerHeight * 0.7 - tr.top) / tr.height));
      tl.style.setProperty('--fill', f.toFixed(3));
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // reveals
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el, i) => { el.style.setProperty('--d', `${(i % 3) * 80}ms`); io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // spotlight dust drifting through the beam
  const canvas = $('.dust');
  const ctx = canvas.getContext && canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, motes = [], dustOn = true, raf = 0;
  function sizeDust() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const n = Math.round(Math.min(110, W / 12));
    motes = Array.from({ length: n }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.5,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.18 + 0.04),
      vx: (Math.random() - 0.5) * 0.12,
      p: Math.random() * Math.PI * 2,
    }));
  }
  function drawDust(t) {
    raf = 0;
    if (!dustOn) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      m.y += m.vy; m.x += m.vx + Math.sin(t / 2000 + m.p) * 0.08;
      if (m.y < -5) { m.y = H + 5; m.x = W / 2 + (Math.random() - 0.5) * W * 0.5; }
      // brighter near the centre of the cone, which widens toward the floor
      const spread = 40 + (m.y / H) * W * 0.22;
      const inBeam = Math.max(0, 1 - Math.abs(m.x - W / 2) / spread);
      const a = inBeam * (0.35 + 0.35 * Math.sin(t / 700 + m.p));
      if (a <= 0.02) continue;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 228, 170, ${a.toFixed(3)})`;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(drawDust);
  }
  if (ctx && !reduce) {
    sizeDust();
    window.addEventListener('resize', sizeDust);
    new IntersectionObserver(([e]) => { dustOn = e.isIntersecting; if (dustOn && !raf) raf = requestAnimationFrame(drawDust); }).observe(hero);
    raf = requestAnimationFrame(drawDust);
  }

  if (reduce || !fine) return;

  // parallax: the name drifts one way, she turns slightly the other
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    hero.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  });
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });

  // cursor ring that grows over anything clickable
  const cur = $('.cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0, curRaf = 0;
  function moveCursor() {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    cur.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
    curRaf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(moveCursor) : 0;
  }
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    cur.classList.add('on');
    cur.classList.toggle('big', !!e.target.closest('a, button'));
    if (!curRaf) curRaf = requestAnimationFrame(moveCursor);
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));

  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // project rows: a soft gold light follows the cursor
  list.addEventListener('pointermove', (e) => {
    const row = e.target.closest('.project');
    if (!row) return;
    const r = row.getBoundingClientRect();
    row.style.setProperty('--x', `${e.clientX - r.left}px`);
    row.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
})();
