/**
 * WEDDING INVITATION — script.js
 * Gopika & Naveen · 03.05.2026
 *
 * Features
 * ────────────────────────────────────────────────────
 *  1. URL ?to=Name  → personalised guest greeting
 *       • On enter screen: "To our dearest, <Name>"
 *       • Top sticky banner: "Gopika & Naveen invite <Name>"
 *       Share links:  yoursite/?to=Anjali  or  ?to=John%20Doe
 *
 *  2. Petal rain (enter screen)
 *  3. Reception twinkle stars
 *  4. Web Audio API — ambient pads + arpeggio (no file needed)
 *  5. Curtain open animation (pure CSS transition)
 *  6. Enter flow: fade → curtain → hero reveal
 *  7. Navbar solid-on-scroll
 *  8. Mobile hamburger menu
 *  9. Smooth scroll for all anchor links
 * 10. IntersectionObserver scroll-reveal (.rv → .in)
 * 11. Hero parallax
 */

'use strict';

/* ══════════════════════════════════════════════════════
   1. GUEST NAME — URL query parameter  ?to=Name
══════════════════════════════════════════════════════ */

/**
 * Reads ?to= from the URL, URL-decodes, trims, and
 * title-cases each word.  Returns '' if absent.
 */
function parseGuestName() {
  var params = new URLSearchParams(window.location.search);
  // Accept ?to=, ?To=, or ?TO= (case-insensitive key)
  var raw = params.get('to') || params.get('To') || params.get('TO') || '';
  if (!raw) return '';
  try { raw = decodeURIComponent(raw.trim()); } catch (e) { raw = raw.trim(); }
  // Title-case each word
  return raw.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

/**
 * Injects the guest name into:
 *   a) #es-guest-line  (inside enter screen — shown right away)
 *   b) #guest-banner   (sticky top banner — shown after entering)
 */
function applyGuestName(name) {
  if (!name) return;

  // (a) Enter screen personal line
  var line = document.getElementById('es-guest-line');
  if (line) {
    line.innerHTML = 'To our dearest,<strong>' + name + '</strong>';
    line.style.display = 'block';
  }

  // (b) Top banner
  var banner   = document.getElementById('guest-banner');
  var nameSpan = document.getElementById('guest-name-display');
  if (banner && nameSpan) {
    nameSpan.textContent = name;
    // Banner reveals itself via CSS animation (bannerIn) once display != none
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

// Run immediately so name is visible before the enter screen fades
var GUEST_NAME = parseGuestName();
applyGuestName(GUEST_NAME);


/* ══════════════════════════════════════════════════════
   2. PETAL RAIN — enter screen background
══════════════════════════════════════════════════════ */
(function spawnPetals() {
  var wrap   = document.getElementById('epw');
  if (!wrap) return;
  var glyphs = ['✿', '❀', '✾', '❁', '⚘'];

  for (var i = 0; i < 20; i++) {
    var el  = document.createElement('div');
    el.className = 'ep';
    var dur   = (10 + Math.random() * 14).toFixed(1) + 's';
    // Negative delay puts the petal mid-air on page load
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
   4. WEB AUDIO — ambient pads + gentle arpeggio
      (no external audio files required)
══════════════════════════════════════════════════════ */
var audioCtx   = null;
var masterGain = null;
var isPlaying  = false;
var arpTimer   = null;
var arpIndex   = 0;

var ARP_NOTES = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C E G C G E
var PAD_NOTES = [261.63, 329.63, 392.00, 523.25, 196.00, 246.94, 130.81];

function buildAudio() {
  audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  // Gentle 4-second fade-in
  masterGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 4);
  masterGain.connect(audioCtx.destination);

  // Sustained pad tones with vibrato
  PAD_NOTES.forEach(function (freq, i) {
    var osc  = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var pan  = audioCtx.createStereoPanner();
    var vib  = audioCtx.createOscillator(); // LFO
    var vibG = audioCtx.createGain();

    osc.type            = i < 4 ? 'sine' : 'triangle';
    osc.frequency.value = freq;

    vib.frequency.value  = 3.0 + i * 0.13;
    vibG.gain.value      = freq * 0.0014;
    vib.connect(vibG);
    vibG.connect(osc.frequency);

    gain.gain.value = 0.10 / (i + 1);
    pan.pan.value   = ((i % 3) - 1) * 0.2;

    osc.connect(gain); gain.connect(pan); pan.connect(masterGain);
    osc.start(); vib.start();
  });
}

function tickArp() {
  if (!isPlaying || !audioCtx) return;

  var osc   = audioCtx.createOscillator();
  var env   = audioCtx.createGain();
  var aGain = audioCtx.createGain();

  aGain.gain.value    = 0.038;
  aGain.connect(masterGain);
  osc.type            = 'sine';
  osc.frequency.value = ARP_NOTES[arpIndex % ARP_NOTES.length] * 2;

  env.gain.setValueAtTime(0.055, audioCtx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.72);

  osc.connect(env); env.connect(aGain);
  osc.start(); osc.stop(audioCtx.currentTime + 0.78);

  arpIndex++;
  arpTimer = setTimeout(tickArp, 560);
}

function startMusic() {
  if (!audioCtx) {
    buildAudio();
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  isPlaying = true;
  tickArp();
  document.getElementById('icon-play').style.display  = 'none';
  document.getElementById('icon-pause').style.display = 'block';
  document.getElementById('music-btn').classList.add('playing');
}

function stopMusic() {
  if (audioCtx) audioCtx.suspend();
  isPlaying = false;
  clearTimeout(arpTimer);
  document.getElementById('icon-play').style.display  = 'block';
  document.getElementById('icon-pause').style.display = 'none';
  document.getElementById('music-btn').classList.remove('playing');
}

document.getElementById('music-btn').addEventListener('click', function () {
  isPlaying ? stopMusic() : startMusic();
});


/* ══════════════════════════════════════════════════════
   5. CURTAIN OPEN (pure CSS transition, no library)
   Two rAF calls force the browser to paint the closed
   state before the transition begins — prevents skipping.
══════════════════════════════════════════════════════ */
function openCurtain(callback) {
  var curtain = document.getElementById('curtain');
  var cl      = document.getElementById('curtain-l');
  var cr      = document.getElementById('curtain-r');

  // Reset to closed, no transition
  cl.style.transition = 'none';
  cr.style.transition = 'none';
  cl.style.transform  = 'translateX(0)';
  cr.style.transform  = 'translateX(0)';
  curtain.style.display = 'block';

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      // Attach eased transitions
      cl.style.transition = 'transform 1.3s cubic-bezier(.77,0,.175,1)';
      cr.style.transition = 'transform 1.3s cubic-bezier(.77,0,.175,1)';

      // Hold closed for 520 ms so user sees "With Love & Joy"
      setTimeout(function () {
        cl.style.transform = 'translateX(-101%)';
        cr.style.transform = 'translateX(101%)';

        // After animation completes, hide curtain
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

  // 1. Fade out enter screen
  enterEl.classList.add('out');

  setTimeout(function () {
    enterEl.style.display = 'none';

    // 2. Open curtain
    openCurtain(function () {

      // 3. Show music toggle button
      document.getElementById('music-btn').style.display = 'flex';

      // 4. Animate hero text in
      document.getElementById('hero-inner').classList.add('go');

      // 5. Scroll indicator appears slightly later
      setTimeout(function () {
        var hs = document.getElementById('hero-scroll');
        if (hs) hs.classList.add('show');
      }, 1700);

      // 6. Start audio if chosen
      if (withMusic) startMusic();
    });

  }, 900); // matches the .85s CSS fade + buffer
}

document.getElementById('btn-music').addEventListener('click',  function () { doEnter(true);  });
document.getElementById('btn-silent').addEventListener('click', function () { doEnter(false); });


/* ══════════════════════════════════════════════════════
   7. NAVBAR — solid on scroll
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
   9. SMOOTH SCROLL — desktop nav links
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
   10. SCROLL REVEAL — IntersectionObserver
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
   11. HERO PARALLAX — subtle depth on scroll
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