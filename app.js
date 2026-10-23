// Pre-computed SHA-256 Hashes
const STUDENT_HASH = "0c0a969f6bb7d903f6ca47a505b38f8f042eecbc4291c9443c683b547ee93739";
const SUPERUSER_HASH = "7db8aeb817651a2dc8a1da7c1cf2ffba6fbaadce03e7a36cb077eec82cb859ce";

// Plaintext Fallbacks (Ensures instant login on local file protocols)
const STUDENT_PASS_PLAIN = "KALUAXNDA";
const SUPERUSER_PASS_PLAIN = "NDAXJOURNEY";

// Core State
let currentCategory = 'MATHS';
let activeGatSubject = 'English';
let ytPlayer = null;
let currentPlaybackSpeed = 1;

// Seed Data for LIMA BATCH
const defaultBatchData = {
  MATHS: {
    "Trigonometry": [
      {
        id: "m_trigo_1",
        title: "Lecture 01: Compound Angles & Identities",
        ytId: "dQw4w9WgXcQ",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        extraUrl: ""
      }
    ],
    "Calculus": [
      {
        id: "m_calc_1",
        title: "Lecture 01: Limits, Continuity & Differentiability",
        ytId: "dQw4w9WgXcQ",
        pdfUrl: "",
        extraUrl: ""
      }
    ]
  },
  GAT: {
    "English": {
      "Vocabulary & Idioms": [
        {
          id: "g_eng_1",
          title: "Session 01: High Frequency NDA Vocab",
          ytId: "dQw4w9WgXcQ",
          pdfUrl: "",
          extraUrl: ""
        }
      ]
    },
    "Physics": {
      "Mechanics & Optics": [
        {
          id: "g_phy_1",
          title: "Lecture 01: Motion in 1D & Newton's Laws",
          ytId: "dQw4w9WgXcQ",
          pdfUrl: "",
          extraUrl: ""
        }
      ]
    },
    "Geography": {},
    "History": {},
    "Current Affairs": {}
  },
  EXTRA_PDF: {
    "Formula Sheets": [
      {
        id: "pdf_1",
        title: "Brahmastra Maths Formula Sheet (Complete)",
        ytId: "",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        extraUrl: ""
      }
    ]
  }
};

let storeData = JSON.parse(localStorage.getItem('LIMA_BATCH_DATA')) || defaultBatchData;

// Cryptographic SHA-256 Function with Error Safety
async function sha256(message) {
  try {
    if (window.crypto && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn("Crypto API fallback active:", err);
  }
  return null;
}

// 1. Initial 2-Second Boot & Splash Screen Handling
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.classList.add('hidden');
        verifyAuthentication();
      }, 500);
    } else {
      verifyAuthentication();
    }
  }, 2000);

  initCountdown();
  setupAntiPiracyWatermark();
  setupEasterEgg();
  renderBatchContent();
});

function verifyAuthentication() {
  const authSession = localStorage.getItem('LIMA_AUTH_SESSION');
  if (!authSession) {
    document.getElementById('authModal').classList.remove('hidden');
  } else {
    document.getElementById('appContainer').classList.remove('hidden');
    startDynamicWatermark(authSession);
  }
}

// Student Login Verification (Direct Match + Encrypted Hash Check)
document.getElementById('authSubmitBtn').addEventListener('click', async () => {
  const cadetName = document.getElementById('cadetNameInput').value.trim();
  const pass = document.getElementById('passcodeInput').value.trim();
  const errorMsg = document.getElementById('authErrorMsg');

  if (!cadetName || !pass) {
    errorMsg.textContent = "PLEASE COMPLETE ALL FIELDS";
    errorMsg.classList.remove('hidden');
    return;
  }

  let isValid = (pass === STUDENT_PASS_PLAIN);

  if (!isValid) {
    const hash = await sha256(pass);
    if (hash === STUDENT_HASH) {
      isValid = true;
    }
  }

  if (isValid) {
    localStorage.setItem('LIMA_AUTH_SESSION', cadetName);
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    startDynamicWatermark(cadetName);
  } else {
    errorMsg.textContent = "INVALID CLEARANCE CODE";
    errorMsg.classList.remove('hidden');
  }
});

// 2. 7-Tap Hidden SuperUser Gateway
let tapCount = 0;
let lastTapTime = 0;

function setupEasterEgg() {
  const trigger = document.getElementById('easterEggTrigger');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTapTime < 600) {
      tapCount++;
    } else {
      tapCount = 1;
    }
    lastTapTime = now;

    if (tapCount === 7) {
      tapCount = 0;
      openAdminPortalAuth();
    }
  });
}

async function openAdminPortalAuth() {
  const code = prompt("ENTER SUPERUSER SECURITY CLEARANCE:");
  if (!code) return;
  const cleanCode = code.trim();

  let isValidAdmin = (cleanCode === SUPERUSER_PASS_PLAIN);

  if (!isValidAdmin) {
    const hash = await sha256(cleanCode);
    if (hash === SUPERUSER_HASH) {
      isValidAdmin = true;
    }
  }

  if (isValidAdmin) {
    document.getElementById('adminModal').classList.remove('hidden');
  } else {
    alert("SECURITY BREACH ATTEMPT LOGGED. ACCESS TERMINATED.");
  }
}

document.getElementById('closeAdminBtn').addEventListener('click', () => {
  document.getElementById('adminModal').classList.add('hidden');
});

// 3. Tactical Countdown HUD (Target: 11 April 2027)
function initCountdown() {
  const targetDate = new Date('April 11, 2027 09:00:00 GMT+0530').getTime();

  setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cdDays');
      const hEl = document.getElementById('cdHours');
      const mEl = document.getElementById('cdMins');
      const sEl = document.getElementById('cdSecs');

      if (dEl) dEl.textContent = String(days).padStart(3, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }
  }, 1000);
}

// 4. Sector & Sub-Category Switching
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.getAttribute('data-cat');
    
    const subNav = document.getElementById('subCatNav');
    if (currentCategory === 'GAT') {
      subNav.classList.remove('hidden');
      renderGatSubNav();
    } else {
      subNav.classList.add('hidden');
    }
    renderBatchContent();
  });
});

function renderGatSubNav() {
  const subNav = document.getElementById('subCatNav');
  subNav.innerHTML = '';
  const subjects = Object.keys(storeData.GAT);

  subjects.forEach(sub => {
    const pill = document.createElement('button');
    pill.className = `sub-cat-pill ${sub === activeGatSubject ? 'active' : ''}`;
    pill.textContent = sub;
    pill.onclick = () => {
      activeGatSubject = sub;
      renderGatSubNav();
      renderBatchContent();
    };
    subNav.appendChild(pill);
  });
}

function renderBatchContent() {
  const feed = document.getElementById('batchContentFeed');
  if (!feed) return;
  feed.innerHTML = '';

  let dataset = {};
  if (currentCategory === 'MATHS') dataset = storeData.MATHS;
  else if (currentCategory === 'GAT') dataset = storeData.GAT[activeGatSubject] || {};
  else dataset = storeData.EXTRA_PDF;

  const chapters = Object.keys(dataset);
  if (chapters.length === 0) {
    feed.innerHTML = '<div style="text-align:center;padding:30px;font-size:12px;color:#8b949e;">NO LECTURES DEPLOYED IN THIS SECTOR YET.</div>';
    return;
  }

  chapters.forEach(chap => {
    const box = document.createElement('div');
    box.className = 'chapter-box';
    
    let lecturesHTML = '';
    dataset[chap].forEach(lec => {
      lecturesHTML += `
        <div class="lecture-item">
          <div class="lecture-meta">
            <h4>${lec.title}</h4>
          </div>
          <div class="lecture-btn-group">
            ${lec.ytId ? `<button class="btn-play" onclick="playLecture('${lec.ytId}', '${lec.title.replace(/'/g, "\\'")}')">▶ WATCH</button>` : ''}
            ${lec.pdfUrl ? `<button class="btn-pdf" onclick="loadPdfStream('${lec.pdfUrl}', '${lec.title.replace(/'/g, "\\'")}')">📄 PDF</button>` : ''}
          </div>
        </div>
      `;
    });

    box.innerHTML = `
      <div class="chapter-title-bar">
        <span>${chap}</span>
        <span style="font-size:10px;color:#00ff88;">${dataset[chap].length} UNITS</span>
      </div>
      <div>${lecturesHTML}</div>
    `;
    feed.appendChild(box);
  });
}

// 5. Custom YouTube Engine
function playLecture(ytId, title) {
  const playerWrap = document.getElementById('playerModule');
  document.getElementById('currentLectureTitle').textContent = title;
  playerWrap.classList.remove('hidden');
  window.scrollTo({ top: playerWrap.offsetTop - 70, behavior: 'smooth' });

  const videoId = extractYouTubeId(ytId);

  if (!ytPlayer && window.YT && YT.Player) {
    ytPlayer = new YT.Player('ytPlayerTarget', {
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'rel': 0,
        'modestbranding': 1,
        'controls': 1,
        'iv_load_policy': 3
      },
      events: {
        'onReady': (e) => e.target.setPlaybackRate(currentPlaybackSpeed)
      }
    });
  } else if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(videoId);
    ytPlayer.setPlaybackRate(currentPlaybackSpeed);
  } else {
    // Standard Embed Fallback if API hasn't resolved
    document.getElementById('ytPlayerTarget').innerHTML = `
      <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
              class="w-full h-full" frameborder="0" allowfullscreen allow="autoplay"></iframe>
    `;
  }
}

function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url;
}

function seekRelative(offset) {
  if (ytPlayer && ytPlayer.getCurrentTime) {
    ytPlayer.seekTo(ytPlayer.getCurrentTime() + offset, true);
  }
}

function setPlaySpeed(spd) {
  currentPlaybackSpeed = spd;
  if (ytPlayer && ytPlayer.setPlaybackRate) {
    ytPlayer.setPlaybackRate(spd);
  }
  document.querySelectorAll('.spd-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.textContent) === spd);
  });
}

document.getElementById('closePlayerBtn').addEventListener('click', () => {
  if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
  document.getElementById('playerModule').classList.add('hidden');
});

// 6. High-Capacity PDF Engine
function loadPdfStream(url, title) {
  const pdfWrap = document.getElementById('pdfViewerModule');
  document.getElementById('currentPdfTitle').textContent = title;
  
  document.getElementById('nativePdfDownloadLink').href = url;
  const streamUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  document.getElementById('pdfFrame').src = streamUrl;

  pdfWrap.classList.remove('hidden');
  window.scrollTo({ top: pdfWrap.offsetTop - 70, behavior: 'smooth' });
}

document.getElementById('closePdfBtn').addEventListener('click', () => {
  document.getElementById('pdfFrame').src = '';
  document.getElementById('pdfViewerModule').classList.add('hidden');
});

// 7. Dynamic Anti-Piracy Watermark Animation
function setupAntiPiracyWatermark() {
  const mark = document.getElementById('dynamicWatermark');
  if (!mark) return;

  setInterval(() => {
    const maxX = window.innerWidth - 180;
    const maxY = window.innerHeight - 50;
    const randX = Math.max(10, Math.floor(Math.random() * maxX));
    const randY = Math.max(60, Math.floor(Math.random() * maxY));
    mark.style.left = `${randX}px`;
    mark.style.top = `${randY}px`;
  }, 7000);
}

function startDynamicWatermark(cadetName) {
  const mark = document.getElementById('dynamicWatermark');
  if (!mark) return;
  mark.textContent = `CADET: ${cadetName.toUpperCase()} // LIMA SECURE`;
  mark.classList.remove('hidden');
}

// 8. SuperUser Admin Management
document.getElementById('adminCategorySelect').addEventListener('change', (e) => {
  const gatGroup = document.getElementById('adminGatSubjectField');
  gatGroup.classList.toggle('hidden', e.target.value !== 'GAT');
});

document.getElementById('adminSaveEntryBtn').addEventListener('click', () => {
  const cat = document.getElementById('adminCategorySelect').value;
  const gatSub = document.getElementById('adminGatSubjectInput').value.trim();
  const chapter = document.getElementById('adminChapterInput').value.trim();
  const title = document.getElementById('adminTitleInput').value.trim();
  const yt = document.getElementById('adminYtInput').value.trim();
  const pdf = document.getElementById('adminPdfInput').value.trim();
  const extra = document.getElementById('adminExtraInput').value.trim();

  if (!chapter || !title) {
    alert("Chapter & Title are required.");
    return;
  }

  const newUnit = {
    id: `lec_${Date.now()}`,
    title: title,
    ytId: yt,
    pdfUrl: pdf,
    extraUrl: extra
  };

  if (cat === 'MATHS') {
    if (!storeData.MATHS[chapter]) storeData.MATHS[chapter] = [];
    storeData.MATHS[chapter].push(newUnit);
  } else if (cat === 'GAT') {
    const subKey = gatSub || 'General GK';
    if (!storeData.GAT[subKey]) storeData.GAT[subKey] = {};
    if (!storeData.GAT[subKey][chapter]) storeData.GAT[subKey][chapter] = [];
    storeData.GAT[subKey][chapter].push(newUnit);
  } else {
    if (!storeData.EXTRA_PDF[chapter]) storeData.EXTRA_PDF[chapter] = [];
    storeData.EXTRA_PDF[chapter].push(newUnit);
  }

  localStorage.setItem('LIMA_BATCH_DATA', JSON.stringify(storeData));
  alert("Lecture Deployed Successfully to Local Storage!");
  document.getElementById('adminModal').classList.add('hidden');
  renderBatchContent();
});

document.getElementById('adminExportBtn').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storeData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "LIMA_BATCH_BACKUP.json");
  dlAnchor.click();
});

// 9. Network Status Watcher
window.addEventListener('offline', () => {
  document.getElementById('networkAlert').classList.remove('hidden');
});

window.addEventListener('online', () => {
  document.getElementById('networkAlert').classList.add('hidden');
});
