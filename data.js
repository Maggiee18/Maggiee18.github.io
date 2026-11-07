/* Everything the site shows about my skills and projects lives here.
 * Add a project to PROJECTS and it appears in the hero tour and the work list.
 * `short` is the label on the skill chips.
 */
(function () {
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
      name: 'LeadScout',
      what: 'An AI lead qualifier for real estate agents. It reads a property inquiry, scores the lead Hot, Warm or Cold with every point explained, and drafts the first reply. The AI only extracts the facts, so scores stay deterministic and auditable.',
      proof: '77 tests on SQLite and PostgreSQL with CI on every push, accounts with secure sessions and password reset, a rules fallback when the AI hits its rate limit, and an interactive 3D landing page. Deployed live.',
      stack: 'Python, FastAPI, Groq, PostgreSQL, JavaScript, Three.js, Docker',
      skills: ['agents', 'backend', 'reliability', 'frontend'],
      links: [
        { label: 'Try it', href: 'https://leadscout-3588.onrender.com' },
        { label: 'Code', href: 'https://github.com/Maggiee18/leadscout' },
      ],
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

  const SHORT = {
    agents: 'AI agents', ml: 'Machine learning', backend: 'Backend', reliability: 'Testing',
    frontend: 'Frontend', speech: 'Speech', finance: 'Finance', algorithms: 'Algorithms',
  };
  SKILLS.forEach((s) => { s.short = SHORT[s.id] || s.name; });

  window.PORTFOLIO = { SKILLS, PROJECTS };
})();
