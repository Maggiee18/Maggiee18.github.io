/* Portfolio: a skill to project map.
 * Picking a skill highlights the projects that use it and draws wires between them.
 * Everything is plain JavaScript so the page loads fast and works on GitHub Pages.
 */
(function () {
  'use strict';

  const SKILLS = [
    { id: 'agents', name: 'AI agents and LLMs' },
    { id: 'ml', name: 'Machine learning' },
    { id: 'backend', name: 'Backend and APIs' },
    { id: 'reliability', name: 'Testing and reliability' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'speech', name: 'Speech and audio' },
    { id: 'finance', name: 'Finance and payments' },
    { id: 'algorithms', name: 'Algorithms' },
  ];

  const PROJECTS = [
    {
      name: 'Agentic Fraud Investigation Agent',
      what: 'An AI agent that investigates card fraud on real IEEE-CIS transaction data. It queries a knowledge graph through 10 tools, decides when it needs more evidence, and recommends an action, while the fraud rules stay deterministic and auditable.',
      proof: 'Ran all 20 benchmark cases end to end on a live graph, through both a direct and an MCP server backend.',
      stack: 'Python, LangGraph, MCP, TigerGraph, Anthropic, Gemini',
      skills: ['agents', 'finance', 'backend'],
      links: [{ label: 'Code', href: 'https://github.com/Maggiee18/hhgoa-fraud-agent' }],
    },
    {
      name: 'SecureBank',
      what: 'A banking API and web app built around the hard parts of moving money: atomic transfers that roll back on failure, optimistic locking for simultaneous withdrawals, and idempotency keys so a retried payment never goes through twice.',
      proof: '84 tests, including parallel withdrawals and a forced failure halfway through a transfer. CI on every push and deployed live.',
      stack: 'Java 17, Spring Boot, PostgreSQL, React, TypeScript, Docker',
      skills: ['backend', 'finance', 'reliability', 'frontend'],
      links: [
        { label: 'Try it', href: 'https://securebank-web-mi3f.onrender.com' },
        { label: 'Code', href: 'https://github.com/Maggiee18/SecureBank' },
      ],
    },
    {
      name: 'PitchMirror',
      what: 'A live coach for presentations, vivas and interviews. It reads your slides, listens to you speak, tracks eye contact on your own device, flags where your words and slides disagree, and asks follow up questions out loud.',
      proof: 'Several specialized LLM agents with schema checks and rule based fallbacks, so it still works offline. Deployed with a public demo.',
      stack: 'Python, FastAPI, WebSockets, Gemini, Whisper, MediaPipe, React',
      skills: ['agents', 'speech', 'backend', 'frontend'],
      links: [
        { label: 'Try it', href: 'https://pitchmirror-bmug.onrender.com' },
        { label: 'Code', href: 'https://github.com/Maggiee18/pitchmirror-ai' },
      ],
    },
    {
      name: 'Maintenix AI',
      what: 'Predicts which machines will fail in the next 48 hours from sensor data, explains each prediction, and turns it into alerts and work orders for the people who fix them.',
      proof: 'Models trained on NASA turbofan data and chosen by validation PR-AUC, a versioned model registry, and 120 backend, ML, frontend and end to end tests.',
      stack: 'Python, scikit-learn, XGBoost, SHAP, FastAPI, React, Docker',
      skills: ['ml', 'backend', 'reliability', 'frontend'],
      links: [{ label: 'Code', href: 'https://github.com/Maggiee18/maintenix-ai' }],
    },
    {
      name: 'Noise robust speech recognition',
      what: 'A speech recognition model built from scratch and tested against real background noise, to measure how much each training technique helps when audio gets messy.',
      proof: 'Baseline CNN-BiLSTM trained on 100 hours of audio: 20.1% word error rate on clean speech, 69.9% in heavy noise. Noise augmented models are training now.',
      stack: 'Python, PyTorch, LibriSpeech, MUSAN',
      skills: ['ml', 'speech'],
      status: 'In progress',
      links: [],
    },
    {
      name: 'Lenny Growth Assistant',
      what: "Answers product and growth questions from Lenny's Podcast transcripts, always with sources, and says so plainly when the transcripts don't support an answer.",
      proof: 'An evaluation harness caught a search bug that silently returned nothing. I traced it through query plans to an over tuned index, fixed it, and wrote it up.',
      stack: 'Python, FastAPI, PostgreSQL, pgvector, Ollama, Anthropic, Next.js',
      skills: ['agents', 'backend', 'reliability'],
      links: [{ label: 'Code', href: 'https://github.com/Maggiee18/lenny-growth-assistant' }],
    },
    {
      name: 'Gem Cascade',
      what: 'A match-3 puzzle game in plain JavaScript with chain reactions, swipe controls and gems that stay readable for color blind players.',
      proof: 'Union-find detects L and T shaped matches, breadth first search resolves chained blasts, and a bot simulator tuned each level by win rate.',
      stack: 'JavaScript, HTML, CSS',
      skills: ['algorithms', 'frontend', 'reliability'],
      links: [
        { label: 'Play it', href: 'https://maggiee18.github.io/gem-cascade/' },
        { label: 'Code', href: 'https://github.com/Maggiee18/gem-cascade' },
      ],
    },
    {
      name: 'Smart Crowd Management',
      what: 'Event check-ins by QR code with live crowd counts and overcrowding alerts pushed to organisers in real time.',
      proof: 'Real time updates over Socket.io rooms, duplicate entry prevention, and email tickets.',
      stack: 'MongoDB, Express, React, Node.js, Socket.io',
      skills: ['backend', 'frontend'],
      links: [{ label: 'Code', href: 'https://github.com/Maggiee18/smart-crowd-management-event-safety-system' }],
    },
    {
      name: 'FinPilot AI',
      what: 'An Android app for tracking spending, budgets and reports, with money stored as whole paise so totals never drift.',
      proof: 'MVVM with StateFlow and type safe navigation, with the money logic unit tested on its own.',
      stack: 'Kotlin, Jetpack Compose, Material 3',
      skills: ['finance', 'frontend'],
      status: 'In progress',
      links: [{ label: 'Code', href: 'https://github.com/Maggiee18/FinPilot-AI' }],
    },
  ];

  const skillList = document.getElementById('skills');
  const projectList = document.getElementById('projects');
  const svg = document.getElementById('wires');
  const map = document.getElementById('map');
  const hint = document.getElementById('hint');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let active = null; // currently selected skill id

  /* ---------- render ---------- */

  SKILLS.forEach((s) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'skill';
    btn.dataset.skill = s.id;
    btn.setAttribute('aria-pressed', 'false');
    const count = PROJECTS.filter((p) => p.skills.includes(s.id)).length;
    btn.innerHTML = `<span class="skill-name">${s.name}</span><span class="skill-count">${count}</span>`;
    btn.addEventListener('click', () => select(active === s.id ? null : s.id));
    btn.addEventListener('mouseenter', () => preview(s.id));
    btn.addEventListener('mouseleave', () => preview(null));
    li.appendChild(btn);
    skillList.appendChild(li);
  });

  PROJECTS.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'project';
    li.id = 'p' + i;
    li.dataset.skills = p.skills.join(' ');
    const links = p.links
      .map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`)
      .join('');
    li.innerHTML = `
      <h3>${p.name}${p.status ? ` <span class="status">${p.status}</span>` : ''}</h3>
      <p class="what">${p.what}</p>
      <p class="proof">${p.proof}</p>
      <p class="stack">${p.stack}</p>
      ${links ? `<p class="plinks">${links}</p>` : ''}`;
    projectList.appendChild(li);
  });

  /* ---------- wires ---------- */

  function anchors(el) {
    const m = map.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x1: r.right - m.left, x2: r.left - m.left, y: r.top - m.top + Math.min(r.height / 2, 22) };
  }

  function drawWires(skillId, animate) {
    svg.innerHTML = '';
    const m = map.getBoundingClientRect();
    svg.setAttribute('width', m.width);
    svg.setAttribute('height', m.height);
    svg.setAttribute('viewBox', `0 0 ${m.width} ${m.height}`);
    if (!wiresVisible()) return;

    const pairs = [];
    PROJECTS.forEach((p, i) => {
      p.skills.forEach((sid) => {
        if (skillId && sid !== skillId) return;
        pairs.push([sid, i]);
      });
    });

    pairs.forEach(([sid, i], n) => {
      const sBtn = skillList.querySelector(`[data-skill="${sid}"]`);
      const pEl = document.getElementById('p' + i);
      const a = anchors(sBtn);
      const b = anchors(pEl.querySelector('h3'));
      const midX = (a.x1 + b.x2) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${a.x1} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x2 - 6} ${b.y}`);
      path.setAttribute('class', skillId ? 'wire on' : 'wire');
      svg.appendChild(path);
      if (animate && !reduceMotion) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.getBoundingClientRect();
        path.style.transition = `stroke-dashoffset 900ms cubic-bezier(.5,0,.2,1) ${n * 35}ms`;
        path.style.strokeDashoffset = '0';
      }
    });
  }

  function wiresVisible() {
    return window.matchMedia('(min-width: 900px)').matches;
  }

  /* ---------- selection ---------- */

  function apply(skillId) {
    skillList.querySelectorAll('.skill').forEach((b) => {
      b.classList.toggle('lit', b.dataset.skill === skillId);
    });
    projectList.querySelectorAll('.project').forEach((li) => {
      const match = !skillId || li.dataset.skills.split(' ').includes(skillId);
      li.classList.toggle('dim', !match);
    });
  }

  function select(skillId) {
    active = skillId;
    skillList.querySelectorAll('.skill').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.skill === skillId));
    });
    apply(skillId);
    drawWires(skillId, true);
    const s = SKILLS.find((x) => x.id === skillId);
    const n = skillId ? PROJECTS.filter((p) => p.skills.includes(skillId)).length : 0;
    hint.textContent = skillId
      ? `${n} projects use ${s.name.toLowerCase()}. Pick it again to see everything.`
      : "Pick a skill to see where I've used it.";
  }

  function preview(skillId) {
    if (active || !wiresVisible()) return;
    apply(skillId);
    drawWires(skillId, false);
  }

  // The skill list stays pinned while the projects scroll, so redraw the wires to follow it.
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || !wiresVisible()) return;
    ticking = true;
    requestAnimationFrame(() => {
      drawWires(active, false);
      ticking = false;
    });
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawWires(active, false), 120);
  });

  // One orchestrated moment on load: every connection draws in once.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => drawWires(null, true));
  else window.addEventListener('load', () => drawWires(null, true));
})();
