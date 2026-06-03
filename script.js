let currentSlide = 0;

function slideTo(index) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  const counter = document.querySelector('.slide-counter');
  if (counter) counter.textContent = (currentSlide + 1) + ' / ' + slides.length;
}

function slidePrev() { slideTo(currentSlide - 1); }
function slideNext() { slideTo(currentSlide + 1); }

function toggleNav() {
  const navLinks = document.querySelector(".nav-links");
  const hamburger = document.querySelector(".hamburger");

  if (!navLinks || !hamburger) return;

  navLinks.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", navLinks.classList.contains("open") ? "true" : "false");
}

function playAudio(audioId) {
  const selectedAudio = document.getElementById(audioId);
  if (!selectedAudio) return;

  document.querySelectorAll("audio").forEach(audio => {
    if (audio !== selectedAudio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  document.querySelectorAll('.audio-speaker').forEach(btn => btn.classList.remove('playing'));

  if (selectedAudio.paused) {
    selectedAudio.play();
    const btn = selectedAudio.parentElement?.querySelector('.audio-speaker');
    if (btn) btn.classList.add('playing');
  } else {
    selectedAudio.pause();
  }
}

document.addEventListener("ended", function (e) {
  if (e.target.tagName !== "AUDIO") return;
  document.querySelectorAll('.audio-speaker').forEach(btn => btn.classList.remove('playing'));
}, true);

window.addEventListener('load', function () {
  document.querySelectorAll('.audio-card-wrap').forEach(function (card) {
    const still = card.querySelector('.card-still');
    if (!still) return;
    card.addEventListener('mouseenter', function () { still.style.opacity = '1'; });
    card.addEventListener('mouseleave', function () { still.style.opacity = '0'; });
  });
});

// Close mobile nav when an anchor link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('open');
    document.querySelector('.hamburger')?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener("play", function (e) {
  if (e.target.tagName !== "AUDIO") return;
  document.querySelectorAll("audio").forEach(audio => {
    if (audio !== e.target) audio.pause();
  });
}, true);

const backToTopBtn = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (!backToTopBtn) return;
  backToTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

backToTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── Kotel Wall ──────────────────────────────────────────────
(function () {
  const NOTE_W    = 58;
  const NOTE_H    = 70;
  const PAD       = 20;
  const MAX_NOTES = 60;

  function getSavedNotes() {
    try { return JSON.parse(localStorage.getItem('kotelNotes') || '[]'); }
    catch { return []; }
  }

  function noteCoords(data, wall) {
    const W = wall.clientWidth;
    const H = wall.clientHeight;
    const x = Math.max(PAD, Math.min(
      Math.round(data.xFrac * (W - NOTE_W - PAD * 2)),
      W - NOTE_W - PAD
    ));
    const y = Math.max(PAD, Math.min(
      Math.round(data.yFrac * (H - NOTE_H - PAD * 2)),
      H - NOTE_H - PAD
    ));
    return { x, y };
  }

  function renderNote(data, animate) {
    const wall = document.getElementById('kotelWall');
    if (!wall) return;
    const { x, y } = noteCoords(data, wall);

    const note = document.createElement('div');
    note.className   = 'kotel-note';
    note.textContent = data.text;
    note.style.left  = x + 'px';
    note.style.top   = y + 'px';
    note.style.transform = `rotate(${data.rot}deg)`;

    if (animate) {
      note.style.opacity    = '0';
      note.style.transform  = `rotate(${data.rot}deg) scale(0.5)`;
      note.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      wall.appendChild(note);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        note.style.opacity   = '1';
        note.style.transform = `rotate(${data.rot}deg) scale(1)`;
      }));
    } else {
      wall.appendChild(note);
    }
  }

  function reloadNotes() {
    const wall = document.getElementById('kotelWall');
    if (!wall) return;
    wall.querySelectorAll('.kotel-note').forEach(n => n.remove());
    getSavedNotes().forEach(n => renderNote(n, false));
  }
  window.reloadNotes = reloadNotes;

  function addNote() {
    const input = document.getElementById('kotelInput');
    const wall  = document.getElementById('kotelWall');
    if (!input || !wall) return;

    const text = input.value.trim();
    if (!text) return;

    const xFrac = 0.04 + Math.random() * 0.88;
    const yFrac = 0.68 + Math.random() * 0.24;
    const rot   = (Math.random() - 0.5) * 14;

    const data = { text, xFrac, yFrac, rot };
    renderNote(data, true);

    const saved = getSavedNotes();
    if (saved.length >= MAX_NOTES) saved.shift();
    saved.push(data);
    try { localStorage.setItem('kotelNotes', JSON.stringify(saved)); } catch {}

    input.value = '';
    const cc = document.getElementById('kotelCharCount');
    if (cc) cc.textContent = '0 / 120';
  }

  window.addEventListener('load', function () {
    reloadNotes();

    document.getElementById('kotelSubmit')
      ?.addEventListener('click', addNote);

    document.getElementById('kotelClear')
      ?.addEventListener('click', function () {
        if (!confirm('Remove all notes from the wall?')) return;
        try { localStorage.removeItem('kotelNotes'); } catch {}
        document.querySelectorAll('#kotelWall .kotel-note').forEach(n => n.remove());
      });

    const input = document.getElementById('kotelInput');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); }
      });
      input.addEventListener('input', function () {
        const cc = document.getElementById('kotelCharCount');
        if (cc) cc.textContent = input.value.length + ' / 120';
      });
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reloadNotes, 200);
    });
  });
}());

// ── Keyboard + swipe navigation for slideshow ──────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft')  slidePrev();
  if (e.key === 'ArrowRight') slideNext();
});

(function () {
  const track = document.querySelector('.slide-track');
  if (!track) return;
  let startX = 0;
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    const dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? slideNext() : slidePrev();
  }, { passive: true });
}());

// ── Active nav link via IntersectionObserver ────────────────────────────────
(function () {
  const pages = document.querySelectorAll('.page');
  const links = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -30% 0px' });

  pages.forEach(function (page) { observer.observe(page); });
}());

// ── Scroll-reveal animations ────────────────────────────────────────────────
(function () {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  [
    '.section-heading',
    '.section-intro',
    '.story-photo',
    'blockquote',
    '.flip-card',
    '.audio-card-wrap',
    '.infographic .stat-card',
    '.infographic .org-card',
    '.video-wrapper',
    '.about-circle',
    '.kotel-wrapper',
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  });
}());
