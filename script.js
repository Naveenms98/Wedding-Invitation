/**
 * WEDDING INVITATION — script.js
 * Gopika & Naveen · 03.05.2026
 *
 * Features
 * ────────────────────────────────────────────────────
 *  1.  URL ?to=Name  → personalised guest greeting
 *  2.  Petal rain (enter screen)
 *  3.  Reception twinkle stars
 *  4.  Audio player — plays from  assets/music.mp3
 *       • Auto-stops when tab is hidden or browser minimised
 *         (Page Visibility API + window blur fallback)
 *       • Auto-resumes when tab becomes visible again
 *       • Music button shows play/pause state only (no stop needed)
 *  5.  Curtain open animation
 *  6.  Enter flow
 *  7.  Navbar solid-on-scroll
 *  8.  Mobile hamburger menu
 *  9.  Smooth scroll
 * 10.  Scroll-reveal (IntersectionObserver)
 * 11.  Hero parallax
 * 12.  Add-to-Calendar buttons
 *       • Detects iOS / Android / desktop
 *       • iOS  → .ics download (iCal)
 *       • Android → Google Calendar URL
 *       • Desktop → Google Calendar URL (fallback)
 */

'use strict';

/* ══════════════════════════════════════════════════════
   1. GUEST NAME  ?to=Name
══════════════════════════════════════════════════════ */
function parseGuestName() {
  var params = new URLSearchParams(window.location.search);
  var raw = params.get('to') || params.get('To') || params.get('TO') || '';
  if (!raw) return '';
  try { raw = decodeURIComponent(raw.trim()); } catch (e) { raw = raw.trim(); }
  return raw.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function applyGuestName(name) {
  if (!name) return;

  var line = document.getElementById('es-guest-line');
  if (line) {
    line.innerHTML = 'To our dearest,<strong>' + name + '</strong>';
    line.style.display = 'block';
  }

  var banner   = document.getElementById('guest-banner');
  var nameSpan = document.getElementById('guest-name-display');
  if (banner && nameSpan) {
    nameSpan.textContent = name;
    banner.style.display = 'block';

    var closeBtn = document.getElementById('guest-banner-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        banner.style.transition = 'opacity .4s ease, transform .4s ease';
        banner.style.opacity    = '0';
        banner.style.transform  = 'translateY(-100%)';
        setTimeout(function () { banner.style.display = 'none'; }, 440);
      });
    }
  }
}

var GUEST_NAME = parseGuestName();
applyGuestName(GUEST_NAME);


/* ══════════════════════════════════════════════════════
   2. PETAL RAIN
══════════════════════════════════════════════════════ */
(function spawnPetals() {
  var wrap   = document.getElementById('epw');
  if (!wrap) return;
  var glyphs = ['✿', '❀', '✾', '❁', '⚘'];

  for (var i = 0; i < 20; i++) {
    var el    = document.createElement('div');
    el.className = 'ep';
    var dur   = (10 + Math.random() * 14).toFixed(1) + 's';
    var delay = '-' + (Math.random() * 14).toFixed(1) + 's';

    el.style.cssText = [
      'position:absolute',
      'left:'        + (Math.random() * 100).toFixed(1) + '%',
      'font-size:'   + (12 + Math.random() * 22).toFixed(0) + 'px',
      'color:'       + (Math.random() > .5 ? '#D4AF37' : '#F5E1DA'),
      'animation-duration:'        + dur,
      'animation-delay:'           + delay,
      'animation-timing-function:linear',
      'animation-iteration-count:infinite',
      'pointer-events:none',
      'user-select:none',
    ].join(';');

    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    wrap.appendChild(el);
  }
}());


/* ══════════════════════════════════════════════════════
   3. RECEPTION STARS
══════════════════════════════════════════════════════ */
(function spawnStars() {
  var wrap = document.getElementById('stars-wrap');
  if (!wrap) return;

  for (var i = 0; i < 60; i++) {
    var s  = document.createElement('div');
    s.className = 'star';
    var sz = (1 + Math.random() * 2.3).toFixed(1);

    s.style.cssText = [
      'left:'       + (Math.random() * 100).toFixed(2) + '%',
      'top:'        + (Math.random() * 100).toFixed(2) + '%',
      '--d:'        + (3 + Math.random() * 5).toFixed(1) + 's',
      '--dl:'       + (Math.random() * 5).toFixed(2) + 's',
      'width:'      + sz + 'px',
      'height:'     + sz + 'px',
      'background:' + (Math.random() > .55 ? '#D4AF37' : '#F5E1DA'),
    ].join(';');

    wrap.appendChild(s);
  }
}());


/* ══════════════════════════════════════════════════════
   4. AUDIO  — plays assets/music.mp3
      Auto-pauses when browser is hidden / minimised.
      Auto-resumes when tab becomes visible again.
      The floating ♪ button still lets users toggle manually.
══════════════════════════════════════════════════════ */
var audio        = new Audio('assets/music/music.mp3');
audio.loop       = true;
audio.volume     = 0.55;
var isPlaying    = false;
// Track whether user deliberately paused (don't auto-resume then)
var userPaused   = false;

/* Fade helpers — smooth volume transitions */
var fadeTimer = null;
function fadeTo(targetVol, duration, onDone) {
  clearInterval(fadeTimer);
  var steps    = 30;
  var interval = duration / steps;
  var startVol = audio.volume;
  var delta    = (targetVol - startVol) / steps;
  var step     = 0;

  fadeTimer = setInterval(function () {
    step++;
    audio.volume = Math.min(1, Math.max(0, startVol + delta * step));
    if (step >= steps) {
      clearInterval(fadeTimer);
      audio.volume = targetVol;
      if (typeof onDone === 'function') onDone();
    }
  }, interval);
}

function updateMusicUI(playing) {
  var btn   = document.getElementById('music-btn');
  var iPlay = document.getElementById('icon-play');
  var iPause= document.getElementById('icon-pause');
  if (!btn) return;
  if (playing) {
    iPlay.style.display  = 'none';
    iPause.style.display = 'block';
    btn.classList.add('playing');
  } else {
    iPlay.style.display  = 'block';
    iPause.style.display = 'none';
    btn.classList.remove('playing');
  }
}

function startMusic() {
  userPaused = false;
  audio.volume = 0;
  audio.play().then(function () {
    isPlaying = true;
    updateMusicUI(true);
    fadeTo(0.55, 1800);          // 1.8 s fade-in
  }).catch(function () {
    // Autoplay blocked — that's fine, user can tap the button
    isPlaying = false;
    updateMusicUI(false);
  });
}

function stopMusic(byUser) {
  userPaused = !!byUser;
  fadeTo(0, 900, function () {   // 0.9 s fade-out then pause
    audio.pause();
    isPlaying = false;
    updateMusicUI(false);
  });
}

/* ── Page Visibility API — pause when tab hidden / minimised ── */
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    if (isPlaying) {
      audio.pause();             // immediate silence, no fade
      isPlaying = false;
      updateMusicUI(false);
    }
  } else {
    // Tab visible again — resume only if user didn't manually pause
    if (!userPaused && audio.src && audio.readyState >= 2) {
      audio.play().then(function () {
        isPlaying = true;
        updateMusicUI(true);
        fadeTo(0.55, 1200);
      }).catch(function () {});
    }
  }
});

/* ── window blur / focus — catches browser minimise on some browsers ── */
window.addEventListener('blur', function () {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    updateMusicUI(false);
  }
});
window.addEventListener('focus', function () {
  if (!userPaused && !document.hidden && audio.src && audio.readyState >= 2) {
    audio.play().then(function () {
      isPlaying = true;
      updateMusicUI(true);
      fadeTo(0.55, 1200);
    }).catch(function () {});
  }
});

/* ── Manual toggle button ── */
document.getElementById('music-btn').addEventListener('click', function () {
  if (isPlaying) {
    stopMusic(true);             // user deliberately paused
  } else {
    userPaused = false;
    startMusic();
  }
});


/* ══════════════════════════════════════════════════════
   5. CURTAIN OPEN
══════════════════════════════════════════════════════ */
function openCurtain(callback) {
  var curtain = document.getElementById('curtain');
  var cl      = document.getElementById('curtain-l');
  var cr      = document.getElementById('curtain-r');

  cl.style.transition = 'none';
  cr.style.transition = 'none';
  cl.style.transform  = 'translateX(0)';
  cr.style.transform  = 'translateX(0)';
  curtain.style.display = 'block';

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      cl.style.transition = 'transform 1.3s cubic-bezier(.77,0,.175,1)';
      cr.style.transition = 'transform 1.3s cubic-bezier(.77,0,.175,1)';

      setTimeout(function () {
        cl.style.transform = 'translateX(-101%)';
        cr.style.transform = 'translateX(101%)';

        setTimeout(function () {
          curtain.style.display = 'none';
          if (typeof callback === 'function') callback();
        }, 1380);
      }, 520);
    });
  });
}


/* ══════════════════════════════════════════════════════
   6. ENTER FLOW
══════════════════════════════════════════════════════ */
function doEnter(withMusic) {
  var enterEl = document.getElementById('enter');
  enterEl.classList.add('out');

  setTimeout(function () {
    enterEl.style.display = 'none';

    openCurtain(function () {
      document.getElementById('music-btn').style.display = 'flex';
      document.getElementById('hero-inner').classList.add('go');

      setTimeout(function () {
        var hs = document.getElementById('hero-scroll');
        if (hs) hs.classList.add('show');
      }, 1700);

      if (withMusic) startMusic();
    });

  }, 900);
}

document.getElementById('btn-music').addEventListener('click',  function () { doEnter(true);  });
// document.getElementById('btn-silent').addEventListener('click', function () { doEnter(false); });
console.log("log")


/* ══════════════════════════════════════════════════════
   7. NAVBAR solid-on-scroll
══════════════════════════════════════════════════════ */
var navEl = document.getElementById('nav');
window.addEventListener('scroll', function () {
  navEl.classList.toggle('solid', window.scrollY > 50);
}, { passive: true });


/* ══════════════════════════════════════════════════════
   8. HAMBURGER MENU
══════════════════════════════════════════════════════ */
var hamburger = document.getElementById('hamburger');
var mobMenu   = document.getElementById('mob-menu');
var mobClose  = document.getElementById('mob-close');

function openMobMenu() {
  mobMenu.classList.add('open');
  mobMenu.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
}
function closeMobMenu() {
  mobMenu.classList.remove('open');
  mobMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', openMobMenu);
mobClose.addEventListener('click',  closeMobMenu);

mobMenu.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    closeMobMenu();
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  });
});


/* ══════════════════════════════════════════════════════
   9. SMOOTH SCROLL — desktop nav
══════════════════════════════════════════════════════ */
document.querySelectorAll('.nav-links a, .nav-logo').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var href = link.getAttribute('href');
    if (href && href.charAt(0) === '#') {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ══════════════════════════════════════════════════════
   10. SCROLL REVEAL
══════════════════════════════════════════════════════ */
var revealObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.10, rootMargin: '0px 0px -18px 0px' });

document.querySelectorAll('.rv').forEach(function (el) {
  revealObs.observe(el);
});


/* ══════════════════════════════════════════════════════
   11. HERO PARALLAX
══════════════════════════════════════════════════════ */
window.addEventListener('scroll', function () {
  var sy        = window.scrollY;
  var heroInner = document.getElementById('hero-inner');
  var heroScroll= document.getElementById('hero-scroll');

  if (sy < window.innerHeight) {
    heroInner.style.transform = 'translateY(' + (sy * 0.24) + 'px)';
    if (heroScroll) {
      heroScroll.style.transform = 'translateX(-50%) translateY(' + (sy * 0.12) + 'px)';
      heroScroll.style.opacity   = Math.max(0, 1 - sy / 260).toFixed(3);
    }
  }
}, { passive: true });


/* ══════════════════════════════════════════════════════
   12. ADD TO CALENDAR
   ────────────────────────────────────────────────────
   Device detection:
     iOS    → download a .ics file (opens in Calendar app)
     Android → open Google Calendar add-event URL
     Desktop → open Google Calendar add-event URL

   Dates are in UTC. Wedding muhurtham 10:30–11:00 IST
   = 05:00–05:30 UTC.  Reception 18:00–21:00 IST = 12:30–15:30 UTC.
══════════════════════════════════════════════════════ */

/* ── Device helpers ── */
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/* ── Event data ── */
var CAL_EVENTS = {
  wedding: {
    title:       'Gopika & Naveen Wedding',
    location:    'Sakthi Auditorium, Alappuzha, Kerala, India',
    description: 'Wedding ceremony of Gopika and Naveen. Muhurtham: 10:30 AM - 11:00 AM IST.',
    // IST = UTC+5:30  →  10:30 IST = 05:00 UTC, 11:00 IST = 05:30 UTC
    startUTC:    '20260503T050000Z',
    endUTC:      '20260503T053000Z',
    // For Google Calendar (local time strings without Z)
    gcStart:     '20260503T103000',
    gcEnd:       '20260503T110000',
    tzid:        'Asia/Kolkata'
  },
  reception: {
    title:       'Gopika & Naveen Wedding Reception',
    location:    'Majestic Ceremonials Convention Centre, Thriprayar, Kerala, India',
    description: 'Wedding reception of Gopika and Naveen. 6:00 PM - 9:00 PM IST.',
    // 18:00 IST = 12:30 UTC, 21:00 IST = 15:30 UTC
    startUTC:    '20260504T123000Z',
    endUTC:      '20260504T153000Z',
    gcStart:     '20260504T180000',
    gcEnd:       '20260504T210000',
    tzid:        'Asia/Kolkata'
  }
};

/* ── .ics file builder (for iOS) ── */
function buildICS(ev) {
  var uid = ev.title.replace(/\s+/g, '') + '-' + Date.now() + '@gopika-naveen.com';
  var lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gopika & Naveen Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:'          + uid,
    'DTSTART:'      + ev.startUTC,
    'DTEND:'        + ev.endUTC,
    'SUMMARY:'      + ev.title,
    'DESCRIPTION:'  + ev.description,
    'LOCATION:'     + ev.location,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
}

/* ── Google Calendar URL builder ── */
function buildGoogleCalURL(ev) {
  var base   = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  var params = [
    'text='     + encodeURIComponent(ev.title),
    'dates='    + ev.gcStart + '/' + ev.gcEnd,
    'ctz='      + encodeURIComponent(ev.tzid),
    'details='  + encodeURIComponent(ev.description),
    'location=' + encodeURIComponent(ev.location),
    'sf=true',
    'output=xml'
  ];
  return base + '&' + params.join('&');
}

/* ── Trigger calendar action ── */
function addToCalendar(eventKey) {
  var ev = CAL_EVENTS[eventKey];
  if (!ev) return;

  if (isIOS()) {
    /* iOS: create a Blob and download the .ics file.
       Safari will open it directly in the Calendar app. */
    var icsContent = buildICS(ev);
    var blob  = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    var url   = URL.createObjectURL(blob);
    var link  = document.createElement('a');
    link.href     = url;
    link.download = ev.title.replace(/[^a-z0-9]/gi, '_') + '.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);

  } else {
    /* Android + Desktop: open Google Calendar in a new tab.
       Works natively in Chrome on Android — pops right into
       the calendar app if Google Calendar is installed. */
    window.open(buildGoogleCalURL(ev), '_blank', 'noopener');
  }
}

/* ── Wire up all Add to Calendar buttons ── */
document.querySelectorAll('.add-cal-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var eventKey = btn.getAttribute('data-event');
    addToCalendar(eventKey);
  });
});