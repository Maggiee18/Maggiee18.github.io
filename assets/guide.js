/* The guide: the speech bubble for the 3D me in the hero (assets/hero.js).
 *
 * She speaks in typed speech bubbles. "Read aloud" uses the browser's own voice
 * (an Indian English female voice when the device has one). While she types or
 * reads, this file sends `guide:talk` so her 3D mouth moves, and `guide:wave`
 * when she says hello. Edit what she says in LINES below.
 */
(function () {
  'use strict';

  // ---- what she says (edit freely) ----
  const LINES = [
    "Hey!! I'm Sai Meghana Annepu.",
    "I'm a final year CSE student at SRM University AP, specialising in AI and ML.",
    'I love building things people can trust: AI that shows its reasoning, models that explain their predictions, and backends that keep working when things go wrong.',
    'See the shapes floating around me? Each one is a skill. Tap one to see where I used it, or drag to spin them.',
    'Scroll down for my projects, and my resume is one click away. Thanks for stopping by!',
  ];
  const SHORT = {
    agents: 'AI agents', ml: 'Machine learning', backend: 'Backend', reliability: 'Testing',
    frontend: 'Frontend', speech: 'Speech and audio', finance: 'Finance', algorithms: 'Algorithms',
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host = document.getElementById('guide');
  if (!host) return;

  host.innerHTML = `
    <div class="bubble" role="status" aria-live="polite">
      <p class="bubble-text"></p>
      <div class="bubble-ctrl">
        <button type="button" class="b-play" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg><span>Read aloud</span></button>
        <button type="button" class="b-next">Next</button>
        <button type="button" class="b-skip" aria-label="Hide the speech bubble">Skip</button>
      </div>
      <span class="bubble-steps" aria-hidden="true"></span>
    </div>
    <button type="button" class="guide-dock" aria-label="Say hi again" hidden><span>Hi!</span></button>`;

  const bubble = host.querySelector('.bubble');
  const textEl = host.querySelector('.bubble-text');
  const steps = host.querySelector('.bubble-steps');
  const nextBtn = host.querySelector('.b-next');
  const skipBtn = host.querySelector('.b-skip');
  const playBtn = host.querySelector('.b-play');
  const dock = host.querySelector('.guide-dock');
  steps.innerHTML = LINES.map(() => '<i></i>').join('');

  let line = -1, typer = 0, auto = 0, typing = false;
  let muted = false, tour = null, tourId = 0, spVoice = null;   // skill panel state (set up further down)

  // ---- tell the 3D character when to move her mouth ----
  let talkingNow = false;
  function talk(on) {
    if (on === talkingNow) return;
    talkingNow = on;
    document.dispatchEvent(new CustomEvent('guide:talk', { detail: { on } }));
  }
  const syncTalk = () => { bubble.classList.toggle('typing', typing); talk(typing || speaking); };

  function say(text) {
    clearInterval(typer);
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
    if (reduce) { textEl.textContent = text; typing = false; syncTalk(); return; }
    textEl.textContent = '';
    let i = 0;
    typing = true; syncTalk();
    typer = setInterval(() => {
      i += 2;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(typer); typing = false; syncTalk(); }
    }, 28);
  }

  function show(i) {
    line = i;
    say(LINES[i]);
    nextBtn.textContent = i < LINES.length - 1 ? 'Next' : 'Start again';
    [...steps.children].forEach((d, k) => d.classList.toggle('on', k === i));
    if (i === 0) document.dispatchEvent(new CustomEvent('guide:wave'));
  }

  function next() {
    stopAudio();
    clearTimeout(auto);
    show(line < LINES.length - 1 ? line + 1 : 0);
  }

  function autoplay() {
    clearTimeout(auto);
    if (reduce || reading) return;
    auto = setTimeout(() => {
      if (line < LINES.length - 1 && !host.classList.contains('docked') && !host.classList.contains('hidden-guide')) { show(line + 1); autoplay(); }
    }, Math.max(3800, LINES[line].length * 55));
  }

  nextBtn.addEventListener('click', () => { closePanel(false); next(); });
  skipBtn.addEventListener('click', () => {
    closePanel(false);
    stopAudio(); clearTimeout(auto); clearInterval(typer); typing = false; syncTalk();
    host.classList.add('hidden-guide');
    dock.hidden = false;
  });
  dock.addEventListener('click', () => {
    const wasDocked = host.classList.contains('docked');
    host.classList.remove('hidden-guide', 'docked');
    dock.hidden = true;
    if (wasDocked) document.querySelector('.hero')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    show(0); autoplay();
  });

  // ---- read aloud with the browser's voice ----
  const synth = window.speechSynthesis;
  let voice = null, speaking = false, reading = false;

  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices();
    if (!vs.length) return;
    const female = /female|neerja|aditi|veena|raveena|heera|kalpana|zira|aria|jenny|sonia|libby|samantha|karen|moira|tessa|google uk english female|google us english/i;
    voice =
      vs.find((v) => /en-IN/i.test(v.lang) && /neerja/i.test(v.name)) ||
      vs.find((v) => /en-IN/i.test(v.lang) && /natural|online/i.test(v.name) && female.test(v.name)) ||
      vs.find((v) => /en-IN/i.test(v.lang) && female.test(v.name)) ||
      vs.find((v) => /^en/i.test(v.lang) && /natural/i.test(v.name) && female.test(v.name)) ||
      vs.find((v) => /^en/i.test(v.lang) && female.test(v.name)) ||
      null;
    playBtn.hidden = !voice;
    refreshVoiceBtn();
  }
  if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }

  function stopAudio() {
    if (tour) endTour();
    reading = false;
    if (synth) synth.cancel();
    speaking = false; syncTalk();
    host.classList.remove('speaking');
    playBtn.querySelector('span').textContent = 'Read aloud';
  }

  function readFrom(i) {
    if (!reading || i >= LINES.length) { stopAudio(); return; }
    show(i);
    clearInterval(typer); textEl.textContent = LINES[i]; typing = false;
    const u = new SpeechSynthesisUtterance(LINES[i].replace('Hey!!', 'Hey!'));
    u.voice = voice; u.lang = voice.lang; u.rate = 1.02; u.pitch = 1.08;
    u.onstart = () => { speaking = true; syncTalk(); };
    u.onend = () => { speaking = false; syncTalk(); setTimeout(() => readFrom(i + 1), 350); };
    u.onerror = () => stopAudio();
    synth.speak(u);
  }

  playBtn.addEventListener('click', () => {
    if (reading) { stopAudio(); return; }
    if (!voice) return;
    clearTimeout(auto);
    synth.cancel();
    reading = true;
    host.classList.add('speaking');
    playBtn.querySelector('span').textContent = 'Stop';
    readFrom(line < 0 ? 0 : line);
  });

  // ---- reacts when a skill is picked (in 3D or in the list) ----
  // ---- tap a skill in 3D: a panel opens and she talks through every project that uses it ----
  const COLORS = {
    agents: '#3b4bdb', ml: '#8b7cf6', backend: '#22a6b3', reliability: '#2fb67c',
    frontend: '#f07167', speech: '#ff9f43', finance: '#f2b134', algorithms: '#5ab0f0',
  };
  const stage = document.querySelector('.stage') || host;
  const panel = document.createElement('section');
  panel.className = 'skill-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Projects for the skill you picked');
  panel.innerHTML = `
    <header class="sp-head">
      <span class="sp-dot" aria-hidden="true"></span>
      <div><h3 class="sp-title"></h3><p class="sp-count"></p></div>
      <button type="button" class="sp-close" aria-label="Close">&times;</button>
    </header>
    <ol class="sp-list"></ol>
    <div class="sp-ctrl">
      <button type="button" class="sp-voice"></button>
      <a class="sp-more" href="#work">See full details</a>
    </div>`;
  stage.append(panel);
  const spTitle = panel.querySelector('.sp-title');
  const spCount = panel.querySelector('.sp-count');
  const spList = panel.querySelector('.sp-list');
  spVoice = panel.querySelector('.sp-voice');

  const firstSentence = (t) => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();
  function markNow(i) {
    [...spList.children].forEach((li, k) => li.classList.toggle('now', k === i));
    const cur = spList.children[i];
    if (cur) cur.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }
  function endTour() {
    if (tour) clearTimeout(tour.timer);
    tour = null;
    markNow(-1);
  }
  function step(id) {
    if (!tour || tour.id !== id) return;
    const st = tour.steps[tour.i];
    if (!st) { endTour(); return; }
    markNow(st.li);
    say(st.text);
    const advance = () => { if (!tour || tour.id !== id) return; tour.i++; tour.timer = setTimeout(() => step(id), 380); };
    if (voice && !muted && synth) {
      const u = new SpeechSynthesisUtterance(st.text);
      u.voice = voice; u.lang = voice.lang; u.rate = 1.03; u.pitch = 1.08;
      u.onstart = () => { speaking = true; syncTalk(); };
      u.onend = () => { speaking = false; syncTalk(); advance(); };
      u.onerror = () => { speaking = false; syncTalk(); if (tour && tour.id === id) tour.timer = setTimeout(advance, 1500); };
      synth.speak(u);
    } else {
      tour.timer = setTimeout(advance, Math.max(3400, st.text.length * 58));
    }
  }
  function refreshVoiceBtn() {
    if (!spVoice) return;
    spVoice.hidden = !voice;
    spVoice.textContent = muted ? 'Unmute voice' : 'Mute voice';
    spVoice.classList.toggle('off', muted);
  }

  function openPanel(id) {
    const P = window.Portfolio;
    const skill = P.SKILLS.find((x) => x.id === id);
    const list = P.PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => p.skills.includes(id));
    stopAudio(); clearTimeout(auto);
    panel.style.setProperty('--c', COLORS[id] || '#3b4bdb');
    spTitle.textContent = skill ? skill.name : (SHORT[id] || id);
    spCount.textContent = `${list.length} project${list.length === 1 ? '' : 's'}`;
    spList.innerHTML = '';
    list.forEach(({ p, i }) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<strong></strong><span></span>`;
      b.querySelector('strong').textContent = p.name;
      b.querySelector('span').textContent = firstSentence(p.what);
      b.addEventListener('click', () => { closePanel(false); P.showProject(i); });
      li.append(b);
      spList.append(li);
    });
    refreshVoiceBtn();
    panel.hidden = false;
    panel.classList.remove('open'); void panel.offsetWidth; panel.classList.add('open');
    stage.classList.add('panel-open');
    const name = SHORT[id] || id;
    const steps = [{ text: `${name}! I've used it in ${list.length} project${list.length === 1 ? '' : 's'}. Here's a quick tour.`, li: -1 }];
    list.forEach(({ p }, k) => steps.push({ text: `${p.name}. ${firstSentence(p.what)}`, li: k }));
    steps.push({ text: 'Tap any project for the full story, or tap another shape!', li: -1 });
    endTour();
    tour = { id: ++tourId, steps, i: 0, timer: 0 };
    step(tour.id);
  }
  function closePanel(reset) {
    if (panel.hidden) return;
    endTour(); stopAudio();
    panel.hidden = true;
    stage.classList.remove('panel-open');
    if (reset && window.Portfolio) window.Portfolio.select(null, 'panel');
  }
  panel.querySelector('.sp-close').addEventListener('click', () => closePanel(true));
  panel.querySelector('.sp-more').addEventListener('click', () => closePanel(false));
  spVoice.addEventListener('click', () => {
    muted = !muted;
    refreshVoiceBtn();
    if (muted && synth) synth.cancel();
  });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(true); });

  document.addEventListener('portfolio:select', (e) => {
    const P = window.Portfolio;
    if (!P || host.classList.contains('hidden-guide') || host.classList.contains('docked')) return;
    const id = e.detail.id;
    if (id && e.detail.from === 'hero') { openPanel(id); return; }
    if (e.detail.from === 'panel') { say('Everything is back. Tap another shape whenever you like!'); return; }
    closePanel(false);
    stopAudio(); clearTimeout(auto);
    if (!id) { say('Everything is back. Pick another skill whenever you like!'); return; }
    const n = P.PROJECTS.filter((p) => p.skills.includes(id)).length;
    const name = SHORT[id] || id;
    say(`${name}? That's ${n} of my project${n === 1 ? '' : 's'}. They're lit up below!`);
  });

  // ---- step aside into a small corner button once the hero scrolls away ----
  const hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(([e]) => {
      if (host.classList.contains('hidden-guide')) return;
      const away = !e.isIntersecting;
      host.classList.toggle('docked', away);
      dock.hidden = !away;
      if (away) { closePanel(false); clearTimeout(auto); stopAudio(); clearInterval(typer); typing = false; syncTalk(); }
    }, { threshold: 0.15 }).observe(hero);
  }

  // first hello once she has popped in
  setTimeout(() => { show(0); autoplay(); }, reduce ? 0 : 900);
})();
