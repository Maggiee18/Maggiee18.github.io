/* The skill list. Projects live in index.html (the "Selected work" list):
 * each project's data-skills attribute uses these ids, and the hero tour,
 * the filters, the assistant and terminal mode all read from there.
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

  const SHORT = {
    agents: 'AI agents', ml: 'Machine learning', backend: 'Backend', reliability: 'Testing',
    frontend: 'Frontend', speech: 'Speech', finance: 'Finance', algorithms: 'Algorithms',
  };
  SKILLS.forEach((s) => { s.short = SHORT[s.id] || s.name; });

  window.PORTFOLIO = { SKILLS };
})();
