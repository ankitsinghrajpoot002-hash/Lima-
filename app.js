// Credentials
const STUDENT_KEY = "KALUAXNDA";
const SUPERUSER_KEY = "NDAXJOURNEY";

// State
let isAdmin = false;
let currentCadet = "Cadet";
let navigationStack = []; // ['EXAMS', 'SUBJECTS', 'CHAPTERS', 'LECTURES']
let selectedExam = 'NDA';
let selectedSubject = null;
let selectedChapter = null;
let ytPlayer = null;

// Complete Seed Hierarchy (Expandable)
const defaultStore = {
  NDA: {
    "MATHEMATICS": {
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
      chapters: {
        "Algebra": [
          { id: "lec_1", title: "Algebra lec 1", ytUrl: "dQw4w9WgXcQ", pdfUrl: "" },
          { id: "lec_2", title: "Log - 01", ytUrl: "dQw4w9WgXcQ", pdfUrl: "" },
          { id: "lec_3", title: "Log - 02", ytUrl: "dQw4w9WgXcQ", pdfUrl: "" }
        ],
        "Trigonometry": [
          { id: "lec_4", title: "Compound Angles 01", ytUrl: "dQw4w9WgXcQ", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ]
      }
    },
    "GAT (GENERAL ABILITY)": {
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      chapters: {
        "English Vocab": [
          { id: "lec_5", title: "Roots & Idioms 01", ytUrl: "dQw4w9WgXcQ", pdfUrl: "" }
        ],
        "Physics": [],
        "Geography": []
      }
    },
    "EXTRA INTEL / PYQs": {
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
      chapters: {
        "PYQ Papers": [
          { id: "lec_6", title: "NDA 1 2024 Maths Paper", ytUrl: "", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ]
      }
    }
  }
};

let storeData = JSON.parse(localStorage.getItem('ROGER_STORE')) || defaultStore;

// 1. Boot up & Splash Screen Handling
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.classList.add('hidden');
      initSession();
    }, 500);
  }, 2000);

  initCountdown();
  setupEasterEgg();
  setupWatermark();
});

function initSession() {
  const session = localStorage.getItem('ROGER_CADET');
  if (!session) {
    document.getElementById('authModal').classList.remove('hidden');
  } else {
    currentCadet = session;
    document.getElementById('displayCadetName').textContent = currentCadet.toUpperCase();
    document.getElementById('profileNameDisplay').textContent = currentCadet;
    document.getElementById('appContainer').classList.remove('hidden');
    renderLevel('EXAMS');
  }
}

// Student Login Check
document.getElementById('authSubmitBtn').addEventListener('click', () => {
  const name = document.getElementById('cadetNameInput').value.trim();
  const code = document.getElementById('passcodeInput').value.trim();
  const err = document.getElementById('authErrorMsg');

  if (code === STUDENT_KEY) {
    currentCadet = name || "Cadet";
    localStorage.setItem('ROGER_CADET', currentCadet);
    document.getElementById('authModal').classList.add('hidden');
    initSession();
  } else {
    err.classList.remove('hidden');
  }
});

// 2. Target 11 April 2027 Countdown
function initCountdown() {
  const target = new Date('April 11, 2027 09:00:00 GMT+0530').getTime();
  const updateTimer = () => {
    const diff = target - Date.now();
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      document.getElementById('daysToNDA').textContent = days;
    }
  };
  updateTimer();
  setInterval(updateTimer, 60000);
}

// 3. Drill-Down Content Rendering
function renderLevel(level) {
  const grid = document.getElementById('cardsGrid');
  const breadcrumb = document.getElementById('currentSectionBreadcrumb');
  const backBtn = document.getElementById('backBtn');
  const addBtn = document.getElementById('dynamicAddBtn');
  grid.innerHTML = '';

  if (isAdmin) addBtn.classList.remove('hidden');
  else addBtn.classList.add('hidden');

  if (level === 'EXAMS') {
    breadcrumb.textContent = "Choose your exam";
    backBtn.classList.add('hidden');
    navigationStack = ['EXAMS'];

    const exams = [
      { name: "NDA", img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80" },
      { name: "CDS", img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80" },
      { name: "AFCAT", img: "https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f9?w=600&auto=format&fit=crop&q=80" }
    ];

    exams.forEach(ex => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="card-img-container" style="background-image: url('${ex.img}')"></div>
        <div class="card-title-bar">${ex.name}</div>
      `;
      card.onclick = () => {
        selectedExam = ex.name;
        renderLevel('SUBJECTS');
      };
      grid.appendChild(card);
    });
  }

  else if (level === 'SUBJECTS') {
    breadcrumb.textContent = `${selectedExam} Subjects`;
    backBtn.classList.remove('hidden');
    navigationStack = ['EXAMS', 'SUBJECTS'];

    const subjects = storeData[selectedExam] || {};
    Object.keys(subjects).forEach(sub => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        ${isAdmin ? `
          <div class="card-admin-actions">
            <button class="icon-action-btn" onclick="event.stopPropagation(); deleteSubject('${sub}')">🗑️</button>
          </div>
        ` : ''}
        <div class="card-img-container" style="background-image: url('${subjects[sub].thumbnail}')"></div>
        <div class="card-title-bar">${sub}</div>
      `;
      card.onclick = () => {
        selectedSubject = sub;
        renderLevel('CHAPTERS');
      };
      grid.appendChild(card);
    });
  }

  else if (level === 'CHAPTERS') {
    breadcrumb.textContent = `${selectedSubject}`;
    backBtn.classList.remove('hidden');
    navigationStack = ['EXAMS', 'SUBJECTS', 'CHAPTERS'];

    const chapters = storeData[selectedExam][selectedSubject].chapters || {};
    Object.keys(chapters).forEach(chap => {
      const card = document.createElement('div');
      card.className = 'continue-card';
      card.style.justifyContent = 'space-between';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="play-circle">📚</div>
          <span class="continue-title">${chap}</span>
        </div>
        ${isAdmin ? `
          <button class="icon-action-btn" onclick="event.stopPropagation(); deleteChapter('${chap}')">🗑️</button>
        ` : ''}
      `;
      card.onclick = () => {
        selectedChapter = chap;
        renderLevel('LECTURES');
      };
      grid.appendChild(card);
    });
  }

  else if (level === 'LECTURES') {
    breadcrumb.textContent = `${selectedChapter}`;
    backBtn.classList.remove('hidden');
    navigationStack = ['EXAMS', 'SUBJECTS', 'CHAPTERS', 'LECTURES'];

    const lectures = storeData[selectedExam][selectedSubject].chapters[selectedChapter] || [];
    lectures.forEach(lec => {
      const card = document.createElement('div');
      card.className = 'continue-card';
      card.style.justifyContent = 'space-between';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="play-circle">▶</div>
          <span class="continue-title">${lec.title}</span>
        </div>
        ${isAdmin ? `
          <button class="icon-action-btn" onclick="event.stopPropagation(); deleteLecture('${lec.id}')">🗑️</button>
        ` : ''}
      `;
      card.onclick = () => openLecturePlayer(lec);
      grid.appendChild(card);
    });
  }
}

function navigateBack() {
  if (navigationStack.length > 1) {
    navigationStack.pop();
    const prevLevel = navigationStack[navigationStack.length - 1];
    renderLevel(prevLevel);
  }
}

// 4. Video & PDF Player Experience
function openLecturePlayer(lec) {
  document.getElementById('viewHome').classList.add('hidden');
  document.getElementById('viewPlayer').classList.remove('hidden');
  document.getElementById('playerLectureHeading').textContent = lec.title;

  // Set continue watching
  localStorage.setItem('LAST_LECTURE', JSON.stringify(lec));
  document.getElementById('continueLectureTitle').textContent = lec.title;

  const ytId = extractYouTubeId(lec.ytUrl);

  if (!ytPlayer && window.YT && YT.Player) {
    ytPlayer = new YT.Player('ytPlayerTarget', {
      videoId: ytId,
      playerVars: { 'autoplay': 1, 'rel': 0, 'modestbranding': 1 }
    });
  } else if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(ytId);
  } else {
    document.getElementById('ytPlayerTarget').innerHTML = `
      <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
              frameborder="0" allowfullscreen allow="autoplay"></iframe>
    `;
  }

  if (lec.pdfUrl) {
    document.getElementById('pdfFrameTarget').src = `https://docs.google.com/viewer?url=${encodeURIComponent(lec.pdfUrl)}&embedded=true`;
    document.getElementById('nativeDownloadLink').href = lec.pdfUrl;
  }
}

function closePlayerView() {
  if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
  document.getElementById('viewPlayer').classList.add('hidden');
  document.getElementById('viewHome').classList.remove('hidden');
}

function togglePdfInline() {
  const box = document.getElementById('inlinePdfBox');
  box.classList.toggle('hidden');
}

function resumeLastLecture() {
  const last = JSON.parse(localStorage.getItem('LAST_LECTURE'));
  if (last) openLecturePlayer(last);
}

function extractYouTubeId(url) {
  if (!url) return "dQw4w9WgXcQ";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url;
}

// 5. 7-Tap Hidden SuperUser Easter Egg
let tapCount = 0;
let lastTap = 0;

function setupEasterEgg() {
  const eye = document.getElementById('easterEggTrigger');
  eye.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 600) tapCount++;
    else tapCount = 1;
    lastTap = now;

    if (tapCount === 7) {
      tapCount = 0;
      const pass = prompt("SUPERUSER CLEARANCE REQUIRED:");
      if (pass === SUPERUSER_KEY) {
        isAdmin = true;
        document.getElementById('adminDockTab').classList.remove('hidden');
        alert("Commanding Officer Clearance Verified. Admin tab unlocked.");
        renderLevel(navigationStack[navigationStack.length - 1]);
      } else {
        alert("Clearance code mismatch.");
      }
    }
  });
}

// 6. Navigation Tabs
function switchTab(tab) {
  document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.dock-item').forEach(d => d.classList.remove('active'));

  document.getElementById(`view${tab}`).classList.remove('hidden');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

// 7. Dynamic Admin Addition
function openAddModal() {
  const currentLevel = navigationStack[navigationStack.length - 1];
  document.getElementById('addModalTitle').textContent = `Add to ${currentLevel}`;
  document.getElementById('ytInputGroup').classList.toggle('hidden', currentLevel !== 'CHAPTERS');
  document.getElementById('pdfInputGroup').classList.toggle('hidden', currentLevel !== 'CHAPTERS');
  document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('addModal').classList.add('hidden');
}

function saveNewItem() {
  const title = document.getElementById('newItemTitle').value.trim();
  const yt = document.getElementById('newItemYt').value.trim();
  const pdf = document.getElementById('newItemPdf').value.trim();
  const currentLevel = navigationStack[navigationStack.length - 1];

  if (!title) return;

  if (currentLevel === 'SUBJECTS') {
    storeData[selectedExam][title] = {
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
      chapters: {}
    };
  } else if (currentLevel === 'CHAPTERS') {
    storeData[selectedExam][selectedSubject].chapters[title] = [];
  } else if (currentLevel === 'LECTURES') {
    storeData[selectedExam][selectedSubject].chapters[selectedChapter].push({
      id: `lec_${Date.now()}`,
      title: title,
      ytUrl: yt,
      pdfUrl: pdf
    });
  }

  localStorage.setItem('ROGER_STORE', JSON.stringify(storeData));
  closeAddModal();
  renderLevel(currentLevel);
}

// Watermark
function setupWatermark() {
  const wm = document.getElementById('dynamicWatermark');
  setInterval(() => {
    wm.textContent = `${currentCadet.toUpperCase()} // KALUA X`;
    wm.classList.remove('hidden');
    wm.style.left = `${Math.random() * (window.innerWidth - 140)}px`;
    wm.style.top = `${Math.max(60, Math.random() * (window.innerHeight - 50))}px`;
  }, 6000);
}

function exportDataJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storeData, null, 2));
  const dl = document.createElement('a');
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", "DEFENCE_ROGER_BACKUP.json");
  dl.click();
}

function logoutCadet() {
  localStorage.removeItem('ROGER_CADET');
  location.reload();
}
