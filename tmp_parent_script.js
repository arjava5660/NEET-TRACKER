const NEET_TARGET = (() => {
  const now = new Date();
  const year = now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() > 6) ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 4, 6, 11, 0, 0);
})();

function updateNeetCountdown() {
  const now = new Date();
  const diff = NEET_TARGET - now;
  const el = document.getElementById("neet-countdown");
  if (!el) return;
  if (diff <= 0) {
    el.textContent = "NEET is live!";
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateNeetCountdown, 1000);
updateNeetCountdown();
const SUBJECTS = [
 { key: 'neet_phy', name: 'Physics', icon: '⚡', color: '#1a5fa8', path: 'physics/phy.html' },
  { key: 'neet_chem_organic', name: 'Organic Chemistry', icon: '🧪', color: '#2a7a3b', path: 'chem_organic/orga.html' },
  { key: 'neet_chem_physical', name: 'Physical Chemistry', icon: '⚗️', color: '#7a4f00', path: 'chem_physical/physicall.html' },
  { key: 'neet_chem_inorganic', name: 'Inorganic Chemistry', icon: '🔬', color: '#5b2d8e', path: 'inorganic_chem/inor.html' },
  { key: 'neet_botany', name: 'Botany', icon: '🌿', color: '#2a7a3b', path: 'botany/bota.html' },
  { key: 'neet_zoology', name: 'Zoology', icon: '🦎', color: '#8a3a00', path: 'zoology/zoo.html' },
];

const CHAPTER_DEFS = {
  neet_phy: [
    "Basic maths", "Vector", "Unit and dimensions", "Motion in a straight line",
    "Motion in a plane", "Laws of motion", "Work, energy and power",
    "Centre of mass", "Rotational motion", "Gravitation", "Solids",
    "Fluids", "Thermal properties of matter", "Thermodynamics",
    "Kinetic theory", "Waves", "Oscillations", "Electric charge and fields",
    "Electrostatics and capacitance", "Current electricity",
    "Moving charge and magnetism", "Magnetism and matter",
    "Electromagnetic induction", "AC", "EM waves", "Ray optics",
    "Wave optics", "Dual nature of radiation and matter",
    "Atoms", "Nuclei", "Semiconductor"
  ],
  neet_chem_physical: [
    "Atomic Structure", "Some Basic Concepts of Chemistry",
    "Thermodynamics", "Chemical Equilibrium", "Ionic Equilibrium",
    "Redox Reactions", "Solutions", "Electrochemistry",
    "Chemical Kinetics", "Practical Chemistry"
  ],
  neet_chem_organic: [
    "IUPAC Nomenclature", "Isomerism", "GOC (General Organic Chemistry)",
    "Hydrocarbons", "Haloalkane and Haloarene", "Alcohol, Phenol and Ether",
    "Carboxylic Acid and Ester", "Amine", "Biomolecules", "Purification Techniques"
  ],
  neet_chem_inorganic: [
    "Periodic Table", "Chemical Bonding", "P-Block Elements",
    "D and F Block Elements", "Salt Analysis", "Coordination Compounds"
  ],
  neet_botany: [
    "Cell: The Unit of Life", "Cell Cycle and Cell Division",
    "The Living World", "Biological Classification", "Plant Kingdom",
    "Morphology of Flowering Plants", "Anatomy of Flowering Plants",
    "Photosynthesis in Higher Plants", "Respiration in Plants",
    "Plant Growth and Development", "Sexual Reproduction in Flowering Plants",
    "Organisms and Population", "Ecosystem", "Biodiversity and Conservation",
    "Microbes in Human Welfare", "Principles of Inheritance and Variation",
    "Molecular Basis of Inheritance"
  ],
  neet_zoology: [
    "Structural Organisation in Animals", "Animal Kingdom", "Biomolecules",
    "Breathing and Exchange of Gases", "Body Fluids and Circulation",
    "Excretory Products and Elimination", "Locomotion and Movement",
    "Neural Control and Coordination", "Chemical Coordination and Integration",
    "Human Reproduction", "Reproductive Health", "Evolution",
    "Human Health and Diseases", "Biotechnology Principles and Process",
    "Biotechnology and Its Applications"
  ]
};

const TODAY = new Date().toISOString().slice(0, 10);
const TASKS_KEY = 'neet_tasks';
const PLANNER_KEY = 'neet_planner';
const REV_DAYS = [1, 3, 5, 8, 15, 30, 50];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getSubjectData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}

function getChapterLecCount(subjectKey, chIndex) {
  const data = getSubjectData(subjectKey);
  const lecKey = `ch${chIndex}_lec_count`;
  if (typeof data[lecKey] === 'number') return data[lecKey];
  if (data[lecKey]) return Number(data[lecKey]) || 10;
  const def = CHAPTER_DEFS[subjectKey] && CHAPTER_DEFS[subjectKey][chIndex];
  return def ? 10 : 10;
}

function calculateProgress(subjectKey) {
  const data = getSubjectData(subjectKey);
  const chapters = CHAPTER_DEFS[subjectKey] || [];
  let total = 0, done = 0;
  chapters.forEach((ch, ci) => {
    const lec = getChapterLecCount(subjectKey, ci);
    for (let i = 0; i < lec; i++) {
      total++; if (data[`ch${ci}_lec_${i}`]) done++;
      total++; if (data[`ch${ci}_dpp_${i}`]) done++;
    }
    total += 4;
    if (data[`ch${ci}_kneet_0`]) done++;
    if (data[`ch${ci}_kneet_1`]) done++;
    if (data[`ch${ci}_pyqneet_0`]) done++;
    if (data[`ch${ci}_pyqjee_0`]) done++;
    total++;
    if (data[`ch${ci}_ncert_0`]) done++;
    total += REV_DAYS.length;
    REV_DAYS.forEach(day => { if (data[`ch${ci}_rev_d${day}`]) done++; });
  });
  return total ? Math.round(done / total * 100) : 0;
}

function renderSubjects() {
  const grid = document.getElementById('subject-grid');
  grid.innerHTML = SUBJECTS.map(s => {
    const pct = calculateProgress(s.key);
    return `<a href="${s.path}" class="subject-card">
      <div class="subject-header">
        <div class="subject-icon" style="background:${s.color}22;color:${s.color}">${s.icon}</div>
        <div class="subject-name">${s.name}</div>
        <div class="subject-pct">${pct}%</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${s.color}"></div></div>
      <div class="subject-meta">${(CHAPTER_DEFS[s.key] || []).length} chapters</div>
    </a>`;
  }).join('');
}

function getTodayRevisions() {
  const revs = [];
  SUBJECTS.forEach(s => {
    const data = getSubjectData(s.key);
    const chapters = CHAPTER_DEFS[s.key] || [];
    chapters.forEach((ch, ci) => {
      const compDate = data[`ch${ci}_completedDate`];
      if (!compDate) return;
      REV_DAYS.forEach(day => {
        const targetDate = addDays(compDate, day);
        if (targetDate === TODAY) {
          revs.push({ subjectKey: s.key, subjectName: s.name, chIndex: ci, chName: ch, day, done: data[`ch${ci}_rev_d${day}`] });
        }
      });
    });
  });
  return revs;
}

function toggleRevision(subjectKey, chIndex, day) {
  const data = getSubjectData(subjectKey);
  const key = `ch${chIndex}_rev_d${day}`;
  data[key] = !data[key];
  localStorage.setItem(subjectKey, JSON.stringify(data));
  renderRevisions();
  renderSubjects();
  renderAnalytics();
  renderWeakTopics();
}

function renderRevisions() {
  const list = document.getElementById('rev-list');
  const revs = getTodayRevisions();
  if (!revs.length) {
    list.innerHTML = '<div class="rev-empty">✨ No revisions due today.</div>';
    return;
  }
  list.innerHTML = revs.map(r => `
    <div class="rev-item">
      <div class="rev-day">Day ${r.day}</div>
      <div class="rev-info">
        <div class="rev-chapter">${r.chName}</div>
        <div class="rev-subject">${r.subjectName}</div>
      </div>
      <div class="rev-check ${r.done ? 'done' : ''}" onclick="toggleRevision('${r.subjectKey}', ${r.chIndex}, ${r.day})">
        ${r.done ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
      </div>
    </div>
  `).join('');
}

function getChapterCompletion(subjectKey, chIndex, data) {
  const lec = getChapterLecCount(subjectKey, chIndex);
  let total = 0;
  let done = 0;

  for (let i = 0; i < lec; i++) {
    total += 2;
    if (data[`ch${chIndex}_lec_${i}`]) done++;
    if (data[`ch${chIndex}_dpp_${i}`]) done++;
  }

  total += 4;
  if (data[`ch${chIndex}_kneet_0`]) done++;
  if (data[`ch${chIndex}_kneet_1`]) done++;
  if (data[`ch${chIndex}_pyqneet_0`]) done++;
  if (data[`ch${chIndex}_pyqjee_0`]) done++;

  total += 1;
  if (data[`ch${chIndex}_ncert_0`]) done++;

  total += REV_DAYS.length;
  REV_DAYS.forEach(day => { if (data[`ch${chIndex}_rev_d${day}`]) done++; });

  const percent = total ? Math.round(done / total * 100) : 0;
  return { total, done, percent, lec, lecDone: Array.from({ length: lec }, (_, i) => data[`ch${chIndex}_lec_${i}`]).filter(Boolean).length, dppDone: Array.from({ length: lec }, (_, i) => data[`ch${chIndex}_dpp_${i}`]).filter(Boolean).length, knDone: [0, 1].filter(i => data[`ch${chIndex}_kneet_${i}`]).length, pyqNeeDone: data[`ch${chIndex}_pyqneet_0`] ? 1 : 0, pyqJeeDone: data[`ch${chIndex}_pyqjee_0`] ? 1 : 0, ncertDone: data[`ch${chIndex}_ncert_0`] ? 1 : 0 };
}

function getUpcomingRevisions() {
  const items = [];
  SUBJECTS.forEach(s => {
    const data = getSubjectData(s.key);
    const chapters = CHAPTER_DEFS[s.key] || [];
    chapters.forEach((ch, ci) => {
      const compDate = data[`ch${ci}_completedDate`];
      if (!compDate) return;
      REV_DAYS.forEach(day => {
        const targetDate = addDays(compDate, day);
        if (targetDate >= TODAY && targetDate <= addDays(TODAY, 7) && !data[`ch${ci}_rev_d${day}`]) {
          items.push({ subject: s.name, chapter: ch, day, targetDate });
        }
      });
    });
  });
  return items;
}

function getDashboardStats() {
  let totalSubjects = SUBJECTS.length;
  let totalChapters = 0;
  let completedChapters = 0;
  let progressSum = 0;
  const weak = [];

  SUBJECTS.forEach(s => {
    const chapters = CHAPTER_DEFS[s.key] || [];
    const data = getSubjectData(s.key);
    chapters.forEach((ch, ci) => {
      const stats = getChapterCompletion(s.key, ci, data);
      totalChapters += 1;
      if (stats.percent === 100) completedChapters += 1;
      if (stats.percent < 100) {
        const missing = [];
        if (stats.lecDone < stats.lec) missing.push(`${stats.lec - stats.lecDone} lec`);
        if (stats.dppDone < stats.lec) missing.push(`${stats.lec - stats.dppDone} DPP`);
        if (stats.knDone < 2) missing.push(`${2 - stats.knDone} KN`);
        if (!stats.pyqNeeDone) missing.push('NEET PYQ');
        if (!stats.pyqJeeDone) missing.push('JEE PYQ');
        if (!stats.ncertDone) missing.push('NCERT');
        const pendingRevs = REV_DAYS.filter(day => !data[`ch${ci}_rev_d${day}`] && data[`ch${ci}_completedDate`]).length;
        if (pendingRevs) missing.push(`${pendingRevs} rev`);
        weak.push({ subject: s.name, chapter: ch, percent: stats.percent, missing });
      }
      progressSum += stats.percent;
    });
  });

  const todayRevs = getTodayRevisions().filter(r => !r.done).length;
  const upcoming = getUpcomingRevisions().length;

  return {
    overallPercent: totalChapters ? Math.round(progressSum / totalChapters) : 0,
    totalChapters,
    completedChapters,
    todayRevisions: todayRevs,
    upcomingRevisions: upcoming,
    plannerItems: loadPlanner().length,
    weakTopics: weak.sort((a, b) => a.percent - b.percent).slice(0, 6)
  };
}

function renderAnalytics() {
  const stats = getDashboardStats();
  document.getElementById('analytics-progress').textContent = `${stats.overallPercent}%`;
  document.getElementById('analytics-chapters').textContent = `${stats.completedChapters} / ${stats.totalChapters}`;
  document.getElementById('analytics-revisions').textContent = `${stats.todayRevisions} today · ${stats.upcomingRevisions} soon`;
  document.getElementById('analytics-planner').textContent = `${stats.plannerItems} active`;
}

function renderWeakTopics() {
  const grid = document.getElementById('weak-grid');
  const weak = getDashboardStats().weakTopics;
  if (!weak.length) {
    grid.innerHTML = '<div class="weak-card"><h3>No weak topics found</h3><div class="weak-item-sub">Keep tracking progress and weak areas will appear here.</div></div>';
    return;
  }
  grid.innerHTML = weak.map(item => `
    <div class="weak-card">
      <h3>${item.subject}</h3>
      <div class="weak-item-title">${item.chapter}</div>
      <div class="weak-item-sub">${item.percent}% complete · Missing: ${item.missing.slice(0, 3).join(', ')}</div>
    </div>
  `).join('');
}

function loadPlanner() {
  try { return JSON.parse(localStorage.getItem(PLANNER_KEY)) || []; } catch { return []; }
}
function savePlanner(items) { localStorage.setItem(PLANNER_KEY, JSON.stringify(items)); }

function renderPlanner() {
  const list = document.getElementById('planner-list');
  const items = loadPlanner();
  if (!items.length) {
    list.innerHTML = '<div class="weak-item-sub">No planner items yet. Add something quick or type your study plan.</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="planner-item">
      <div class="planner-item-text ${item.done ? 'done' : ''}">${item.text}</div>
      <div class="planner-item-actions">
        <button class="planner-item-toggle ${item.done ? 'done' : ''}" onclick="togglePlannerItem(${item.id})">${item.done ? '✓' : '○'}</button>
        <button class="planner-item-delete" onclick="deletePlannerItem(${item.id})">✕</button>
      </div>
    </div>
  `).join('');
}

function addPlannerItem() {
  const input = document.getElementById('planner-input');
  const text = input.value.trim();
  if (!text) return;
  const items = loadPlanner();
  items.push({ id: Date.now(), text, done: false });
  savePlanner(items);
  input.value = '';
  renderPlanner();
  renderAnalytics();
}

function addPlannerTemplate(text) {
  const items = loadPlanner();
  items.push({ id: Date.now(), text, done: false });
  savePlanner(items);
  renderPlanner();
  renderAnalytics();
}

function promptPlannerQuestions() {
  const count = prompt('How many questions do you want to practice?', '10');
  if (!count) return;
  const text = `${count.trim()} questions`;
  addPlannerTemplate(text);
}

function promptPlannerCount(label, prefix) {
  const count = prompt(`Enter ${label} day number`, '1');
  if (!count) return;
  const text = `${prefix === 'rev' ? `Revision day ${count.trim()}` : `${count.trim()} ${label}`}`;
  addPlannerTemplate(text);
}

function togglePlannerItem(id) {
  const items = loadPlanner();
  const item = items.find(i => i.id === id);
  if (!item) return;
  item.done = !item.done;
  savePlanner(items);
  renderPlanner();
}

function deletePlannerItem(id) {
  const items = loadPlanner().filter(i => i.id !== id);
  savePlanner(items);
  renderPlanner();
  renderAnalytics();
}

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY)) || []; } catch { return []; }
}
function saveTasks(tasks) { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }

function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) return;
  const tasks = loadTasks();
  tasks.push({ text, done: false, id: Date.now() });
  saveTasks(tasks);
  input.value = '';
  renderTasks();
  renderAnalytics();
}

function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks(tasks);
  renderTasks();
  renderAnalytics();
}

function deleteTask(id) {
  const tasks = loadTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
  renderAnalytics();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const tasks = loadTasks();
  list.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask(${t.id})">
        ${t.done ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
      </div>
      <div class="task-text ${t.done ? 'done' : ''}">${t.text}</div>
      <div class="task-delete" onclick="deleteTask(${t.id})">✕</div>
    </div>
  `).join('');
}

function openSettings() {
  const content = document.getElementById('settings-content');
  content.innerHTML = SUBJECTS.map(s => {
    const chapters = CHAPTER_DEFS[s.key] || [];
    return `<div class="modal-section">
      <div class="modal-section-title">${s.icon} ${s.name}</div>
      ${chapters.map((ch, ci) => {
        const lec = getChapterLecCount(s.key, ci);
        return `<div class="chapter-edit">
          <div class="chapter-edit-name">${ch}</div>
          <input type="number" class="chapter-edit-input" id="lec-${s.key}-${ci}" value="${lec}" min="1" max="50">
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
  document.getElementById('settings-modal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}

function saveSettings() {
  SUBJECTS.forEach(s => {
    const data = getSubjectData(s.key);
    const chapters = CHAPTER_DEFS[s.key] || [];
    chapters.forEach((_, ci) => {
      const input = document.getElementById(`lec-${s.key}-${ci}`);
      if (!input) return;
      data[`ch${ci}_lec_count`] = Number(input.value) || 10;
    });
    localStorage.setItem(s.key, JSON.stringify(data));
  });
  closeSettings();
  renderSubjects();
  renderAnalytics();
  renderWeakTopics();
  alert('Lecture counts saved.');
}

function backupData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const allData = {};
  SUBJECTS.forEach(s => { allData[s.key] = getSubjectData(s.key); });
  allData[TASKS_KEY] = loadTasks();
  const backup = { timestamp, data: allData };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neet_backup_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('Backup created. Save this JSON file safely.');
}

function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.data) throw new Error('Invalid backup file');
      Object.keys(backup.data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(backup.data[key]));
      });
      alert('Restore complete.');
      location.reload();
    } catch (err) {
      alert('Restore failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm('Reset ALL progress across all subjects? This cannot be undone.')) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const allData = {};
  SUBJECTS.forEach(s => { allData[s.key] = getSubjectData(s.key); });
  allData[TASKS_KEY] = loadTasks();
  const backup = { timestamp, data: allData };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neet_backup_before_reset_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setTimeout(() => {
    SUBJECTS.forEach(s => localStorage.removeItem(s.key));
    localStorage.removeItem(TASKS_KEY);
    alert('All data reset. Backup downloaded automatically.');
    location.reload();
  }, 300);
}

renderSubjects();
renderRevisions();
renderTasks();
renderAnalytics();
renderWeakTopics();
renderPlanner();