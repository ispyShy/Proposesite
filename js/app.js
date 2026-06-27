/* ─── STATE ────────────────────────────────────────────── */
const state = {
  selectedDate: null,
  selectedType: null,
  clickCount: 0,
  keySequence: '',
  musicPlaying: false,
};

/* ─── DOM REFS ─────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const screens = {
  landing:  $('screen-landing'),
  calendar: $('screen-calendar'),
  datetype: $('screen-datetype'),
  final:    $('screen-final'),
};

/* ═══════════════════════════════════════════════════════════
   PARTICLE CANVAS — floating hearts background
════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = $('particleCanvas');
  const ctx    = canvas.getContext('2d');
  const HEARTS = ['💗','💕','💖','💓','🌸','✨','💞'];
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function mkParticle() {
    return {
      x:    Math.random() * W,
      y:    H + 30,
      char: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      size: 12 + Math.random() * 16,
      vx:   (Math.random() - .5) * .6,
      vy:   -(0.4 + Math.random() * 0.6),
      alpha: 0.6 + Math.random() * 0.4,
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - .5) * 0.02,
    };
  }

  // seed initial particles
  for (let i = 0; i < 18; i++) {
    const p = mkParticle();
    p.y = Math.random() * H;
    particles.push(p);
  }

  let last = 0;
  function loop(ts) {
    ctx.clearRect(0, 0, W, H);

    // spawn
    if (ts - last > 800) {
      if (particles.length < 30) particles.push(mkParticle());
      last = ts;
    }

    particles = particles.filter(p => p.alpha > 0.02);

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      p.alpha -= 0.0018;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    });

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ═══════════════════════════════════════════════════════════
   NO BUTTON — evasive behaviour
════════════════════════════════════════════════════════════ */
(function initNoButton() {
  const btn  = $('btnNo');
  const group = $('btnGroup');
  let placed = false;

  function randomPos() {
    const gr = group.getBoundingClientRect();
    const bw = btn.offsetWidth  || 120;
    const bh = btn.offsetHeight || 48;
    const margin = 10;

    // place within the viewport, avoiding the YES button roughly
    const maxX = window.innerWidth  - bw - margin;
    const maxY = window.innerHeight - bh - margin;
    return {
      x: Math.max(margin, Math.random() * maxX),
      y: Math.max(margin, Math.random() * maxY),
    };
  }

  function moveAway(e) {
    if (!placed) placed = true;
    const { x, y } = randomPos();
    btn.style.position = 'fixed';
    btn.style.left     = x + 'px';
    btn.style.top      = y  + 'px';
    btn.style.transition = 'left 0.25s ease, top 0.25s ease';
  }

  btn.addEventListener('mouseover', moveAway);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); moveAway(e); }, { passive: false });

  // Initial placement - let layout settle first
  setTimeout(() => {
    const gr = group.getBoundingClientRect();
    btn.style.position = 'fixed';
    btn.style.left = (gr.right + 20) + 'px';
    btn.style.top  = gr.top + 'px';
  }, 1200);
})();

/* ═══════════════════════════════════════════════════════════
   SCREEN TRANSITIONS
════════════════════════════════════════════════════════════ */
function goTo(name) {
  Object.entries(screens).forEach(([k, el]) => {
    if (k === name) {
      el.classList.remove('exit');
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   YES HANDLER
════════════════════════════════════════════════════════════ */
function handleYes() {
  // Heart burst from button
  const btn = $('btnYes');
  const rect = btn.getBoundingClientRect();
  burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);

  // Transition after short delay
  setTimeout(() => {
    screens.landing.classList.add('exit');
    setTimeout(() => goTo('calendar'), 550);
  }, 600);
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR
════════════════════════════════════════════════════════════ */
const cal = {
  viewYear:  new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
};
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function buildCalendar() {
  const { viewYear: y, viewMonth: m } = cal;
  $('calMonthLabel').textContent = `${MONTHS[m]} ${y}`;

  const grid  = $('calGrid');
  grid.innerHTML = '';

  const today  = new Date(); today.setHours(0,0,0,0);
  const first  = new Date(y, m, 1).getDay();
  const days   = new Date(y, m + 1, 0).getDate();

  // empty cells
  for (let i = 0; i < first; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    grid.appendChild(e);
  }

  for (let d = 1; d <= days; d++) {
    const el   = document.createElement('div');
    const date = new Date(y, m, d);
    const isPast = date < today;

    el.className = 'cal-day' + (isPast ? ' past' : '');
    if (date.toDateString() === today.toDateString()) el.classList.add('today');
    el.textContent = d;

    if (!isPast) {
      el.addEventListener('click', () => selectCalDay(d, el));
    }
    grid.appendChild(el);
  }
}

function selectCalDay(day, el) {
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedDate = new Date(cal.viewYear, cal.viewMonth, day);

  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  $('calSelectedLabel').textContent = '💖 ' + state.selectedDate.toLocaleDateString(undefined, opts);
  $('btnDateConfirm').disabled = false;
}

$('calPrev').addEventListener('click', () => {
  if (cal.viewMonth === 0) { cal.viewMonth = 11; cal.viewYear--; }
  else cal.viewMonth--;
  buildCalendar();
});
$('calNext').addEventListener('click', () => {
  if (cal.viewMonth === 11) { cal.viewMonth = 0; cal.viewYear++; }
  else cal.viewMonth++;
  buildCalendar();
});

buildCalendar();

/* ═══════════════════════════════════════════════════════════
   DATE TYPE SELECTION
════════════════════════════════════════════════════════════ */
function selectDateType(el) {
  document.querySelectorAll('.date-card.chosen').forEach(c => c.classList.remove('chosen'));
  el.classList.add('chosen');
  state.selectedType = el.dataset.type;
  $('btnTypeConfirm').disabled = false;
}

/* ═══════════════════════════════════════════════════════════
   GO TO DATE TYPE SCREEN
════════════════════════════════════════════════════════════ */
function goToDateType() {
  burstHearts(window.innerWidth / 2, window.innerHeight / 2, 8);
  setTimeout(() => {
    screens.calendar.classList.add('exit');
    setTimeout(() => goTo('datetype'), 550);
  }, 300);
}

/* ═══════════════════════════════════════════════════════════
   FINAL SCREEN
════════════════════════════════════════════════════════════ */
const DATE_MSGS = {
  movie:  "Cinema lights down, your face glowing in the dark — that's my favourite view 🎬",
  coffee: "Two cups, one cozy table, and all the time in the world for us ☕",
  picnic: "Blanket for two, the whole sky above us, and no reason to ever go home 🌙",
  walk:   "Every step together feels like home. I can't wait to get lost with you 🌸",
};
const DATE_LABELS = {
  movie: 'Movie Date 🎬', coffee: 'Coffee Date ☕',
  picnic: 'Picnic Under Stars 🌙', walk: 'Long Walk Together 🌸',
};

function goToFinal() {
  screens.datetype.classList.add('exit');

  const dateStr = state.selectedDate
    ? state.selectedDate.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : 'our special day';

  $('finalMsg').textContent = DATE_MSGS[state.selectedType] || '';
  $('finalDetails').innerHTML =
    `📅 ${dateStr}<br/>🎉 ${DATE_LABELS[state.selectedType] || ''}`;

  setTimeout(() => {
    goTo('final');
    setTimeout(() => {
      launchFinalHearts();
    }, 400);
  }, 550);
}

/* ═══════════════════════════════════════════════════════════
   HEART BURST (click effect)
════════════════════════════════════════════════════════════ */
function burstHearts(cx, cy, count = 10) {
  const CHARS = ['💖','💗','💕','✨','🌸','💓'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const angle = (i / count) * Math.PI * 2;
    const dist  = 60 + Math.random() * 80;
    el.style.cssText = `
      position:fixed; left:${cx}px; top:${cy}px;
      font-size:${18 + Math.random()*14}px;
      pointer-events:none; z-index:9999;
      animation: heartBurst 0.9s ease-out forwards;
      --bx: ${Math.cos(angle)*dist}px;
      --by: ${Math.sin(angle)*dist}px;
    `;
    el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

// inject heartBurst keyframes
const burstKF = document.createElement('style');
burstKF.textContent = `
  @keyframes heartBurst {
    0%   { transform:translate(0,0) scale(0.5); opacity:1; }
    100% { transform:translate(var(--bx),var(--by)) scale(1.4); opacity:0; }
  }
`;
document.head.appendChild(burstKF);

/* ═══════════════════════════════════════════════════════════
   FINAL FLOATING HEARTS
════════════════════════════════════════════════════════════ */
function launchFinalHearts() {
  const container = $('floatingFinalHearts');
  container.innerHTML = '';
  const CHARS = ['💖','💕','💗','🌸','✨','💓','🌹','💞'];

  function spawnHeart() {
    const el = document.createElement('div');
    const size = 16 + Math.random() * 20;
    const x    = Math.random() * 100; // vw
    const dur  = 5 + Math.random() * 6;
    const delay= Math.random() * 3;
    const dx   = (Math.random() - .5) * 120;
    const rot  = (Math.random() - .5) * 360;

    el.style.cssText = `
      position:absolute; left:${x}vw; bottom:-30px;
      font-size:${size}px;
      animation: floatUp ${dur}s ${delay}s linear forwards;
      --dx:${dx}px; --rot:${rot}deg;
      pointer-events:none;
    `;
    el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay) * 1000 + 500);
  }

  // initial burst
  for (let i = 0; i < 16; i++) setTimeout(spawnHeart, i * 180);
  // continuous
  const iv = setInterval(spawnHeart, 700);
  setTimeout(() => clearInterval(iv), 12000);
}

/* ═══════════════════════════════════════════════════════════
   MUSIC TOGGLE
════════════════════════════════════════════════════════════ */
function toggleMusic() {
  const audio = $('bgMusic');
  const btn   = $('musicToggle');

  if (!audio.src || audio.src === window.location.href) {
    // No audio file — show a cute message instead
    showEasterEgg('🎵 Imagine the most romantic song ever playing right now…');
    return;
  }

  if (state.musicPlaying) {
    audio.pause();
    btn.textContent = '🎵 Play Music';
    state.musicPlaying = false;
  } else {
    audio.play().catch(() => showEasterEgg('🎵 Your browser wants you to click again to play music!'));
    btn.textContent = '🔇 Pause Music';
    state.musicPlaying = true;
  }
}

/* ═══════════════════════════════════════════════════════════
   REPLAY
════════════════════════════════════════════════════════════ */
function replay() {
  state.selectedDate = null;
  state.selectedType = null;
  $('btnDateConfirm').disabled = true;
  $('btnTypeConfirm').disabled = true;
  $('calSelectedLabel').textContent = 'Pick a day ✨';
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  document.querySelectorAll('.date-card.chosen').forEach(e => e.classList.remove('chosen'));
  buildCalendar();
  $('floatingFinalHearts').innerHTML = '';
  screens.final.classList.add('exit');
  setTimeout(() => {
    screens.final.classList.remove('exit');
    goTo('landing');
    // re-position no button
    const btn = $('btnNo');
    btn.style.position = '';
    btn.style.left = '';
    btn.style.top  = '';
    btn.style.transition = '';
  }, 600);
}

/* ═══════════════════════════════════════════════════════════
   EASTER EGGS
════════════════════════════════════════════════════════════ */
const easterMessages = [
  "You just triggered O(n) love complexity 💘",
  "Compilation successful: relationship.exe ✅",
  "git commit -m 'Found the one' 💻",
  "Warning: feelings.overflow detected 💖",
  "sudo apt-get install love — already installed ✨",
  "Exception caught: TooMuchCutenessError 🌸",
];
let easterIdx = 0;

// 1. Click anywhere 5 times → easter egg
document.addEventListener('click', (e) => {
  if (e.target.closest('button') || e.target.closest('.cal-day') || e.target.closest('.date-card')) {
    state.clickCount = 0; // reset on real interactions
    return;
  }
  state.clickCount++;
  if (state.clickCount >= 5) {
    state.clickCount = 0;
    showEasterEgg(easterMessages[easterIdx % easterMessages.length]);
    easterIdx++;
  }
});

// 2. Console message
console.log('%c💖 Hint: true love is always === true', 'color:#e84989; font-size:14px; font-family:monospace; font-weight:bold;');
console.log('%c// This code was written with love. Always.', 'color:#ad5174; font-size:12px; font-family:monospace;');
console.log('%ctrue === true // love is unconditional', 'color:#f06292; font-size:12px; font-family:monospace;');

// 3. Secret key sequence "LOVE"
const TARGET_SEQ = 'LOVE';
document.addEventListener('keydown', (e) => {
  state.keySequence = (state.keySequence + e.key.toUpperCase()).slice(-TARGET_SEQ.length);
  if (state.keySequence === TARGET_SEQ) {
    openSecret();
    state.keySequence = '';
  }
});

function showEasterEgg(msg) {
  const toast = $('easterToast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function openSecret() {
  $('secretOverlay').classList.add('open');
}
function closeSecret() {
  $('secretOverlay').classList.remove('open');
}

// 4. Hover tooltip on bear sign
const bearSign = document.querySelector('.bear-sign');
let tipShown = false;
if (bearSign) {
  bearSign.addEventListener('mouseenter', () => {
    if (!tipShown) {
      tipShown = true;
      showEasterEgg('❤️ You found me! 404: loneliness not found');
    }
  });
}

// 5. Konami code (Up Up Down Down Left Right Left Right B A) → extra secret
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', (e) => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      showEasterEgg('🎮 Konami Code entered! Cheat code: infinite_love = true;');
      burstHearts(window.innerWidth/2, window.innerHeight/2, 20);
    }
  } else {
    konamiIdx = 0;
  }
});

/* ═══════════════════════════════════════════════════════════
   CLICK RIPPLE on body
════════════════════════════════════════════════════════════ */
document.addEventListener('click', (e) => {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position:fixed; left:${e.clientX}px; top:${e.clientY}px;
    width:6px; height:6px; margin:-3px;
    background:rgba(240,98,146,.5);
    border-radius:50%;
    pointer-events:none; z-index:9998;
    animation: rippleOut 0.5s ease-out forwards;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 520);
});
const rippleKF = document.createElement('style');
rippleKF.textContent = `
  @keyframes rippleOut {
    0%   { transform:scale(0); opacity:.9; }
    100% { transform:scale(12); opacity:0; }
  }
`;
document.head.appendChild(rippleKF);
