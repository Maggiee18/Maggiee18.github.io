/* Two extras that read everything from this page, so they never say anything
 * the portfolio doesn't:
 *   1. "Ask me": a small assistant that answers questions about my projects,
 *      skills, experience and certifications. No AI service or key; it matches
 *      the question to the right part of the portfolio.
 *   2. Terminal mode: explore the portfolio with commands (press ` or the >_ button).
 */
(function () {
  'use strict';
  const P = window.PORTFOLIO;
  if (!P || !P.PROJECTS) return;
  const { SKILLS, PROJECTS, goToProject } = P;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- what the page knows ---------------- */
  const cards = [...document.querySelectorAll('.about .card')];
  const cardText = (k) => {
    const c = cards.find((x) => x.querySelector('.card-k')?.textContent.trim().toLowerCase() === k);
    return c ? [...c.querySelectorAll('h3, p:not(.card-k)')].map((e) => e.textContent.trim()) : [];
  };
  const KB = {
    email: $('.mail')?.textContent.trim() || '',
    github: [...document.querySelectorAll('.socials a')].find((a) => /github/i.test(a.textContent))?.href || '',
    linkedin: [...document.querySelectorAll('.socials a')].find((a) => /linkedin/i.test(a.textContent))?.href || '',
    resume: $('.btn-main')?.getAttribute('href') || '',
    education: cardText('education'),
    experience: cardText('experience'),
    wins: [...document.querySelectorAll('.wins li')].map((li) => li.textContent.trim()),
    footer: $('.foot p')?.textContent.trim() || '',
  };
  KB.certs = KB.wins.filter((w) => /certified|associate developer/i.test(w));
  KB.interests = [
    'Building AI applications that solve real problems',
    'Understanding user problems and turning them into products',
    'Full stack development, from sleek interfaces to solid backends',
    'Making machines do cool things',
    'Experimenting with new technologies',
  ];
  const LANGS = ['Python', 'Java', 'JavaScript', 'TypeScript', 'Kotlin'];
  const langsUsed = LANGS.filter((l) => PROJECTS.some((p) => p.stack.some((t) => t.split(' ')[0] === l)));
  const allTech = [...new Set(PROJECTS.flatMap((p) => p.stack))];
  const usedIn = (tech) => PROJECTS.filter((p) => p.stack.some((t) => t.toLowerCase() === tech.toLowerCase() || t.toLowerCase().split(' ')[0] === tech.toLowerCase()));

  // nicknames people might type for each project
  const aliasOf = (p) => {
    const n = p.name.toLowerCase();
    const extra = {
      'agentic fraud investigation agent': ['fraud', 'tigergraph', 'hhgoa'],
      'noise robust speech recognition': ['speech recognition', 'noise', 'asr'],
      'lenny growth assistant': ['lenny', 'podcast'],
      'gem cascade': ['gem', 'match-3', 'match 3', 'game'],
      'smart crowd management': ['crowd management', 'qr', 'check-in', 'check in'],
      'finpilot ai': ['finpilot', 'finance app', 'android'],
      crowdguard: ['crowdguard', 'crowd guard', 'crowd risk', 'stampede'],
      'maintenix ai': ['maintenix', 'predictive maintenance'],
      securebank: ['securebank', 'secure bank', 'banking'],
      pitchmirror: ['pitchmirror', 'pitch mirror', 'interview coach'],
      leadscout: ['leadscout', 'lead scout', 'real estate'],
    }[n] || [];
    return [n, ...extra];
  };
  const findProject = (q) => {
    let best = null, bestLen = 0;
    PROJECTS.forEach((p) => aliasOf(p).forEach((a) => { if (q.includes(a) && a.length > bestLen) { best = p; bestLen = a.length; } }));
    return best;
  };
  const SKILL_WORDS = [
    [/\b(agent|agents|llm|llms|genai|generative)\b/, ['agents']],
    [/\b(ai)\b/, ['agents', 'ml']],
    [/(machine learning|\bml\b|model|computer vision|vision|deep learning|prediction)/, ['ml']],
    [/\b(backend|back end|api|apis|server)\b/, ['backend']],
    [/\b(test|tests|testing|reliab)/, ['reliability']],
    [/\b(frontend|front end|ui|interface|web)\b/, ['frontend']],
    [/\b(speech|audio|voice)\b/, ['speech']],
    [/\b(finance|fintech|bank|banking|payment|payments|money)\b/, ['finance']],
    [/\b(algorithm|algorithms|dsa|game|games)\b/, ['algorithms']],
    [/full ?stack/, ['backend', 'frontend']],
  ];

  /* ---------------- the answer engine ---------------- */
  const projLink = (p) => `<button type="button" class="a-proj" data-i="${p.i}">${esc(p.name)}</button>`;
  const linksOf = (p) => p.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' · ');
  const listProjects = (ps) => `<ul>${ps.map((p) => `<li>${projLink(p)}${p.status ? ` <em>(${esc(p.status.toLowerCase())})</em>` : ''}</li>`).join('')}</ul>`;

  function answer(raw) {
    const q = ' ' + raw.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ') + ' ';
    const has = (re) => re.test(q);

    if (has(/^\s*(hi|hello|hey|hii+|namaste)\b/) && q.trim().split(' ').length <= 3)
      return "Hey!! I'm Sai Meghana, a final year CSE (AI and ML) student at SRM University AP. Ask me about my projects, skills, internship or certifications.";

    const p = findProject(q);
    if (p) {
      if (has(/\b(role|contribut|team|alone|solo)\b/))
        return `<p>${esc(p.name)}: ${esc(p.what)}</p><p>For details about the team and my exact part, the code is the best place to look: ${linksOf(p) || 'ask me directly'}.</p>`;
      return `<p><strong>${esc(p.name)}</strong>${p.status ? ` <em>(${esc(p.status.toLowerCase())})</em>` : ''}</p><p>${esc(p.what)}</p>`
        + (p.proof ? `<p><strong>How I know it works:</strong> ${esc(p.proof)}</p>` : '')
        + (p.challenge ? `<p><strong>Hardest part:</strong> ${esc(p.challenge)}</p>` : '')
        + `<p><strong>Tech:</strong> ${esc(p.stack.join(', '))}</p>`
        + `<p>${linksOf(p)}${p.links.length ? ' · ' : ''}<button type="button" class="a-proj" data-i="${p.i}">See it on the page</button></p>`;
    }
    if (has(/\b(contact|email|mail|reach|hire|hiring|linkedin|connect)\b/))
      return `You can email me at <a href="mailto:${esc(KB.email)}">${esc(KB.email)}</a>, or find me on <a href="${esc(KB.github)}" target="_blank" rel="noopener">GitHub</a> and <a href="${esc(KB.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>. ${esc(KB.footer)}.`;
    if (has(/\b(resume|cv)\b/))
      return `Here you go: <a href="${esc(KB.resume)}" download>download my resume</a>.`;
    if (has(/\b(certif|certified|certificate|certificates|certification|certifications|oracle|mongodb cert)/))
      return `My certifications:<ul>${KB.certs.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
    if (has(/\b(achievement|achievements|award|awards|hackathon|hackathons|sih|recognition|scholar|scholarship|won|finalist)/))
      return `A few things I'm proud of:<ul>${KB.wins.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
    if (has(/\b(intern|internship|experience|worked|job|salesforce|smartbridge)\b/))
      return `<p><strong>${esc(KB.experience[0] || '')}</strong>, ${esc(KB.experience[1] || '')}</p><p>${esc(KB.experience.slice(2).join(' '))}</p>`;
    if (has(/\b(education|college|university|study|studying|degree|btech|b tech|graduat|year)\b/))
      return `${esc(KB.education.join(', '))}.`;
    if (has(/\b(speak|spoken)\b/))
      return "I speak Telugu, Hindi and English.";
    if (has(/\b(language|languages)\b/))
      return `In my projects I've written ${langsUsed.slice(0, -1).join(', ')} and ${langsUsed.slice(-1)}. Ask me about any of them, for example "Which projects use Java?"`;
    if (has(/\b(interest|interests|passion|passionate|love|like to)\b/))
      return `What I love:<ul>${KB.interests.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

    // a specific technology, e.g. "Which projects use React?"
    const tech = allTech
      .map((t) => t.split(' ')[0])
      .filter((t, k, a) => a.indexOf(t) === k)
      .sort((a, b) => b.length - a.length)
      .find((t) => new RegExp(`(^|[^a-z0-9.])${t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(q));
    if (tech) {
      const ps = usedIn(tech);
      if (ps.length) return `I've used ${esc(tech)} in ${ps.length} project${ps.length === 1 ? '' : 's'}:${listProjects(ps)}`;
    }

    // a skill area, e.g. "What AI projects has she built?"
    const ids = new Set();
    SKILL_WORDS.forEach(([re, list]) => { if (re.test(q)) list.forEach((i) => ids.add(i)); });
    if (ids.size) {
      const ps = PROJECTS.filter((p) => p.skills.some((s) => ids.has(s)));
      const names = SKILLS.filter((s) => ids.has(s.id)).map((s) => s.name).join(' or ');
      return `Projects where I used ${esc(names)}:${listProjects(ps)}`;
    }
    if (has(/\b(skill|skills|tech|stack|tools|good at|know)\b/))
      return `My skills, with how many projects use each:<ul>${SKILLS.map((s) => `<li>${esc(s.name)}: ${P.count(s.id)}</li>`).join('')}</ul>Tap any skill at the top of the page for a spoken tour.`;
    if (has(/\b(project|projects|built|build|work|made)\b/))
      return `I've built ${PROJECTS.length} projects so far:${listProjects(PROJECTS)}`;
    if (has(/\b(who|about|yourself|you are|introduce|tell me about her|meghana|sai)\b/))
      return "I'm Sai Meghana Annepu, a final year CSE student at SRM University AP specialising in AI and ML. I love full stack development and turning creative ideas into AI applications that solve real problems.";
    return `I only know what's on this portfolio, so I couldn't find that. Try asking about a project (like CrowdGuard), a technology (like React), my certifications, or how to contact me.`;
  }

  /* ---------------- "Ask me" chat ---------------- */
  const SUGGEST = ['What AI projects have you built?', 'Tell me about CrowdGuard', 'Which languages do you know?', 'What certifications do you have?', 'How can I contact you?'];
  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'ask-fab';
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'ask');
  fab.setAttribute('aria-label', 'Ask me about my work');
  fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span>Ask me</span>';
  const box = document.createElement('section');
  box.className = 'ask';
  box.id = 'ask';
  box.hidden = true;
  box.setAttribute('aria-label', 'Ask me about my work');
  box.innerHTML = `
    <header><div><h2>Ask me anything</h2><p>Answers come straight from this portfolio</p></div>
      <button type="button" class="ask-x" aria-label="Close">&times;</button></header>
    <div class="ask-log" role="log" aria-live="polite"></div>
    <div class="ask-sugg"></div>
    <form class="ask-form"><label class="sr-only" for="ask-in">Your question</label>
      <input id="ask-in" autocomplete="off" placeholder="Ask about my projects, skills..." maxlength="200" />
      <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg></button></form>`;
  document.body.append(box, fab);
  const log = $('.ask-log', box), input = $('#ask-in', box), sugg = $('.ask-sugg', box);
  SUGGEST.forEach((t) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', () => ask(t)); sugg.append(b); });

  function bubble(html, who) {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerHTML = html;
    log.append(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function ask(q) {
    q = q.trim();
    if (!q) return;
    bubble(esc(q), 'you');
    input.value = '';
    const typing = bubble('<span class="dots"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(() => { typing.innerHTML = answer(q); log.scrollTop = log.scrollHeight; }, reduce ? 0 : 450);
  }
  function openAsk(open) {
    box.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    fab.classList.toggle('on', open);
    if (open) {
      if (!log.children.length) bubble("Hey!! Ask me anything about my projects, skills, internship or certifications. I'll answer from this portfolio.", 'bot');
      setTimeout(() => input.focus(), 50);
    }
  }
  fab.addEventListener('click', () => openAsk(box.hidden));
  $('.ask-x', box).addEventListener('click', () => { openAsk(false); fab.focus(); });
  $('.ask-form', box).addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  box.addEventListener('keydown', (e) => { if (e.key === 'Escape') { openAsk(false); fab.focus(); } });
  box.addEventListener('click', (e) => {
    const b = e.target.closest('.a-proj');
    if (!b) return;
    if (window.innerWidth < 700) openAsk(false);
    goToProject(+b.dataset.i);
  });

  /* ---------------- terminal mode ---------------- */
  const term = document.createElement('div');
  term.className = 'term';
  term.hidden = true;
  term.setAttribute('role', 'dialog');
  term.setAttribute('aria-modal', 'true');
  term.setAttribute('aria-label', 'Terminal mode');
  term.innerHTML = `
    <div class="term-win">
      <div class="term-bar"><i></i><i></i><i></i><span>guest@meghana: ~</span><button type="button" class="term-x" aria-label="Close terminal">&times;</button></div>
      <div class="term-out" aria-live="polite"></div>
      <form class="term-line"><label for="term-in" class="prompt">guest@meghana:~$</label>
        <input id="term-in" autocomplete="off" autocapitalize="off" spellcheck="false" /></form>
    </div>`;
  document.body.append(term);
  const out = $('.term-out', term), tin = $('#term-in', term);
  const slug = (p) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const FILES = {
    'about.txt': () => ["Sai Meghana Annepu", 'Final year CSE (AI and ML), SRM University AP, graduating 2027', 'AI engineering, applied AI, product development and product management'],
    'interests.txt': () => KB.interests,
    'contact.txt': () => [`email     ${KB.email}`, `github    ${KB.github}`, `linkedin  ${KB.linkedin}`],
    'certs.txt': () => KB.certs,
    'achievements.txt': () => KB.wins,
    'experience.txt': () => KB.experience,
  };
  const CMDS = {
    help: () => [
      'whoami                 who I am',
      'ls [projects|skills]   list things',
      'cat <file>             read a file, e.g. cat interests.txt',
      'open <project>         read a project, e.g. open crowdguard',
      'skills                 what I work with',
      'ask <question>         ask the portfolio assistant anything',
      'resume                 download my resume',
      'contact                how to reach me',
      'clear                  clear the screen',
      'exit                   back to the website',
      '',
      'tip: Tab completes, arrow keys bring back old commands',
    ],
    whoami: () => ['Sai Meghana Annepu', 'AI engineering | Applied AI | Product development & management', 'Final year CSE, SRM University AP'],
    ls: (a) => {
      if (/^projects\/?$/.test(a)) return PROJECTS.map((p) => slug(p) + '/');
      if (/^skills\/?$/.test(a)) return SKILLS.map((s) => s.id);
      return ['projects/', 'skills/', ...Object.keys(FILES), 'resume.pdf'];
    },
    cat: (a) => {
      if (!a) return ['usage: cat <file>   (try: cat interests.txt)'];
      if (a === 'resume.pdf') return ['binary file. try: resume'];
      return FILES[a] ? FILES[a]() : [`cat: ${a}: no such file. try: ls`];
    },
    open: (a) => {
      const p = PROJECTS.find((x) => slug(x) === a.replace(/\/$/, '')) || findProject(' ' + a.toLowerCase() + ' ');
      if (!p) return [`open: ${a || '?'}: project not found. try: ls projects`];
      return [`# ${p.name}${p.status ? ` (${p.status.toLowerCase()})` : ''}`, '', p.what, '', ...(p.proof ? ['proof: ' + p.proof] : []), ...(p.challenge ? ['hardest part: ' + p.challenge] : []), 'tech: ' + p.stack.join(', '), ...p.links.map((l) => `${l.label.toLowerCase()}: ${l.href}`)];
    },
    skills: () => SKILLS.map((s) => `${s.name.padEnd(26, ' ')}${'■'.repeat(P.count(s.id))} ${P.count(s.id)}`),
    contact: () => FILES['contact.txt'](),
    resume: () => { const a = document.createElement('a'); a.href = KB.resume; a.download = ''; document.body.append(a); a.click(); a.remove(); return ['downloading resume...']; },
    ask: (a) => a ? { html: answer(a) } : ['usage: ask <question>'],
    snooze: () => ['⏰ snoozed for 5 minutes...', 'kidding. my alarm snoozes, my code never does.'],
    sudo: (a) => /hire/.test(a) ? ['[sudo] permission granted ✦', `great choice. email ${KB.email} and let's talk!`] : ['nice try. this incident will be reported to... nobody.'],
    date: () => [new Date().toString()],
    echo: (a) => [a],
    pwd: () => ['/home/meghana'],
    clear: () => { out.innerHTML = ''; return []; },
    exit: () => { closeTerm(); return []; },
  };
  const hist = [];
  let hIdx = 0;
  function print(lines, cls) {
    if (lines && lines.html) { const d = document.createElement('div'); d.className = 'term-html'; d.innerHTML = lines.html; out.append(d); }
    else (lines || []).forEach((l) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = l; out.append(d); });
    out.scrollTop = out.scrollHeight;
  }
  function run(line) {
    print([`guest@meghana:~$ ${line}`], 'cmd');
    const [c, ...rest] = line.trim().split(/\s+/);
    if (!c) return;
    hist.push(line); hIdx = hist.length;
    const f = CMDS[c.toLowerCase()];
    print(f ? f(rest.join(' ')) : [`${c}: command not found. type help`]);
  }
  function openTerm() {
    term.hidden = false;
    document.body.classList.add('term-on');
    if (!out.children.length) print(['Welcome to Meghana\'s terminal ✦', "Type 'help' to see what you can do, or 'exit' to go back.", '']);
    setTimeout(() => tin.focus(), 30);
  }
  function closeTerm() {
    term.hidden = true;
    document.body.classList.remove('term-on');
    $('#term-open')?.focus();
  }
  $('.term-line', term).addEventListener('submit', (e) => { e.preventDefault(); run(tin.value); tin.value = ''; });
  tin.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hIdx > 0) { e.preventDefault(); tin.value = hist[--hIdx]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.min(hist.length, hIdx + 1); tin.value = hist[hIdx] || ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = tin.value.split(' ');
      const last = parts.pop().toLowerCase();
      const pool = parts.length ? [...PROJECTS.map(slug), ...Object.keys(FILES), 'projects', 'skills'] : Object.keys(CMDS);
      const hit = pool.filter((x) => x.startsWith(last));
      if (hit.length === 1) tin.value = [...parts, hit[0]].join(' ') + (parts.length ? '' : ' ');
      else if (hit.length > 1) print(hit.join('   ').split('\n'));
    } else if (e.key === 'Escape') closeTerm();
  });
  term.addEventListener('click', (e) => { if (e.target === term) closeTerm(); else if (!e.target.closest('a, button')) tin.focus(); });
  $('.term-x', term).addEventListener('click', closeTerm);
  $('#term-open')?.addEventListener('click', openTerm);
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' && term.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openTerm(); }
  });
})();
