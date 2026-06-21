/* ============================================================
   Limbu Heritage — interactions (vanilla JS, no framework).
   Rebuilt from the original Claude Design component logic, with
   bug fixes: keyboard + touch support, reduced-motion handling,
   viewport-aware tooltip, roving-tabindex timeline, and removal
   of dead/no-op code.
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* matchMedia unsupported — assume motion ok */ }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function boot() {
    try {
      wire();
    } catch (err) {
      // If anything throws during setup, never leave content hidden.
      console.warn('Limbu Heritage: wiring failed, revealing everything.', err);
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
    }
  }

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------------------------------------------------------- */
  function wire() {
    buildKings();
    setupReveal();
    setupDust();
    setupScroll();
    setupNav();
    setupGlossary();
    setupDistricts();
    setupKingsInteraction();
    setupDrum();
  }

  /* ---- 29 Kirat Hang: data + bars ---- */
  var KNOWN = {
    1:  { name: 'Yalambar',  title: 'Yelung Hang · The Founder', desc: 'First king of the Kirat dynasty. Tradition identifies him with the Yalambar of the Mahabharata, said to have marched to the field of Kurukshetra.' },
    3:  { name: 'Humati',    title: 'Humati Hang',        desc: 'Remembered for shaping the dynasty’s earliest rudimentary legal codes.' },
    7:  { name: 'Jitedasti', title: 'Jitedasti Hang',     desc: 'Limbu chronicles record that Gautama Buddha visited the Kathmandu valley during his reign.' },
    11: { name: 'Sthunko',   title: 'Sthunko Hang',       desc: 'Said to have ruled when the Mauryan emperor Ashoka journeyed to the valley.' },
    29: { name: 'Gasti',     title: 'Gasti Hang · The Last', desc: 'The twenty-ninth and final Kirat king, overthrown by the rising Licchavi dynasty around the 4th century CE.' }
  };

  function buildKings() {
    var rail = document.querySelector('[data-kings-rail]');
    if (!rail) return;
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= 29; i++) {
      var num = String(i).padStart(2, '0');
      var k = KNOWN[i];
      var isKnown = !!k;
      var name = isKnown ? k.name : 'Hang ' + i;
      var title = isKnown ? k.title : 'Reign unrecorded';
      var desc = isKnown ? k.desc
        : 'One of the twenty-nine Kirat Hang whose rule shaped the land even as the chronicles let the name slip away.';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-king', '');
      btn.setAttribute('data-name', name);
      btn.setAttribute('data-title', title);
      btn.setAttribute('data-desc', desc);
      btn.setAttribute('data-known', isKnown ? 'yes' : 'no');
      btn.setAttribute('data-num', num);
      btn.setAttribute('aria-label', name + ' — ' + title);
      btn.tabIndex = i === 1 ? 0 : -1; // roving tabindex
      btn.style.cssText = 'flex:1 1 0;min-width:16px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px;cursor:pointer;background:none;border:0;padding:0';

      if (isKnown) {
        var nm = document.createElement('span');
        nm.setAttribute('data-king-name', '');
        nm.textContent = name;
        nm.style.cssText = 'writing-mode:vertical-rl;transform:rotate(180deg);font-family:\'Marcellus\',serif;font-size:13px;letter-spacing:.02em;color:#e7c87f;white-space:nowrap;transition:color .3s';
        btn.appendChild(nm);
      }
      var bar = document.createElement('span');
      bar.setAttribute('data-king-bar', '');
      bar.style.cssText = 'display:block;width:100%;max-width:15px;height:46px;border-radius:7px 7px 2px 2px;background:rgba(236,225,205,.4);transition:height .35s cubic-bezier(.16,.85,.3,1),background .3s';
      btn.appendChild(bar);
      frag.appendChild(btn);
    }
    rail.appendChild(frag);
  }

  /* ---- reveal on scroll ---- */
  function setupReveal() {
    var items = q('[data-reveal]');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var d = parseFloat(el.getAttribute('data-reveal-delay') || '0');
        el.style.transitionDelay = d + 'ms';
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'blur(0px)';
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    items.forEach(function (el) { io.observe(el); });

    // safety net: hard-reveal anything in view that somehow stayed hidden.
    setTimeout(function () {
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && getComputedStyle(el).opacity === '0') {
          el.style.transition = 'none';
          el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
        }
      });
    }, 2600);
  }

  /* ---- hero dust ---- */
  function setupDust() {
    if (prefersReduced) return;
    var dust = document.querySelector('[data-dust]');
    if (!dust) return;
    var count = window.innerWidth < 600 ? 0 : 14;  // skip the embers on phones
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      var sz = 2 + Math.random() * 3;
      p.style.cssText = 'position:absolute;border-radius:50%;background:rgba(232,192,105,' +
        (0.3 + Math.random() * 0.4) + ');width:' + sz + 'px;height:' + sz + 'px;left:' +
        (Math.random() * 100) + '%;bottom:' + (Math.random() * 40) + '%;animation:floatDust ' +
        (7 + Math.random() * 8) + 's linear ' + (Math.random() * 8) + 's infinite';
      dust.appendChild(p);
    }
  }

  /* ---- scroll progress + parallax + hero fade + active chapter ---- */
  function setupScroll() {
    var progress = document.getElementById('scroll-progress');
    var parE = q('[data-parallax]');
    var heroFade = document.querySelector('[data-herofade]');
    var chapters = q('[data-chapter]');
    var dots = q('[data-navdot]');
    var caption = document.getElementById('chapter-caption');
    var navHidden = window.innerWidth < 720;
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        var sc = window.scrollY || window.pageYOffset || 0;
        var docH = (document.documentElement.scrollHeight - vh) || 1;
        if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, sc / docH)) + ')';
        if (heroFade) {
          var hp = Math.min(1, Math.max(0, sc / (vh * 0.82)));
          heroFade.style.opacity = (1 - hp * 0.96).toFixed(3);
          heroFade.style.transform = 'translateY(' + (hp * -64).toFixed(1) + 'px)';
        }
        if (!prefersReduced) {
          parE.forEach(function (el) {
            var r = el.getBoundingClientRect();
            var center = r.top + r.height / 2 - vh / 2;
            var sp = parseFloat(el.getAttribute('data-parallax') || '0');
            el.style.transform = 'translate3d(0,' + (center * -sp).toFixed(1) + 'px,0)';
          });
        }
        var active = 0, navLight = false;
        chapters.forEach(function (c, i) {
          var r = c.getBoundingClientRect();
          if (r.top <= vh * 0.42) active = i;
          // which section sits behind the fixed nav (its vertical centre)?
          if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) {
            navLight = (c.id === 'sec-map' || c.id === 'sec-dance' || c.id === 'sec-tongba');
          }
        });
        // mobile wayfinding: the side rail is hidden on phones, so surface the
        // current chapter name in a small caption. Blank on the hero.
        if (caption) {
          var lbl = active > 0 ? (chapters[active].getAttribute('data-screen-label') || '') : '';
          if (caption.textContent !== lbl) caption.textContent = lbl;
          caption.style.opacity = lbl ? '1' : '0';
        }
        // the chapter rail is display:none under 720px — skip its per-frame
        // restyle entirely on phones.
        if (!navHidden) {
          // adapt the tracker's colours to the section behind it so it stays
          // visible on the cream sections (light dots were invisible there).
          var accent = navLight ? '#a23f24' : '#c89a3e';
          var idle = navLight ? 'rgba(36,24,17,.5)' : 'rgba(236,225,205,.42)';
          var labelInk = navLight ? '#241811' : 'rgba(236,225,205,.78)';
          var labelHalo = navLight ? '0 1px 6px rgba(245,236,214,.7)' : '0 1px 6px rgba(18,12,8,.55)';
          dots.forEach(function (d, i) {
            var on = i === active;
            var tick = d.querySelector('[data-navtick]');
            var lab = d.querySelector('[data-navlabel]');
            if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
            if (tick) {
              tick.style.background = on ? accent : 'transparent';
              tick.style.borderColor = on ? accent : idle;
              tick.style.transform = on ? 'scale(1.35)' : 'scale(1)';
            }
            if (lab) { lab.style.color = labelInk; lab.style.textShadow = labelHalo; }
          });
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { navHidden = window.innerWidth < 720; onScroll(); });
    onScroll();
  }

  /* ---- chapter nav clicks ---- */
  function setupNav() {
    q('[data-navdot]').forEach(function (d) {
      d.addEventListener('click', function () {
        var t = document.getElementById(d.getAttribute('data-target'));
        if (!t) return;
        var top = t.getBoundingClientRect().top + window.scrollY - 6;
        window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---- glossary tooltip (hover + tap + keyboard) ---- */
  function setupGlossary() {
    var tip = document.getElementById('glossary-tip');
    if (!tip) return;
    var tT = tip.querySelector('[data-tip-term]');
    var tD = tip.querySelector('[data-tip-def]');
    var terms = q('[data-term]');
    var openTerm = null;
    var justFocused = false;

    // Offscreen copy of every definition so each term is programmatically
    // described — screen readers announce the term AND its definition,
    // independent of the visual tooltip (WCAG 4.1.2 / 1.3.1).
    var sink = document.createElement('div');
    sink.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;margin:-1px;padding:0';
    document.body.appendChild(sink);

    function place(x, y) {
      var pad = 16;
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var px = x + 16, py = y - h - 12;
      if (px + w + pad > window.innerWidth) px = x - w - 16;
      if (px < pad) px = pad;
      if (py < pad) py = y + 18;
      if (py + h + pad > window.innerHeight) py = Math.max(pad, window.innerHeight - h - pad);
      tip.style.left = px + 'px';
      tip.style.top = py + 'px';
    }

    function show(term, x, y) {
      tT.textContent = term.getAttribute('data-term');
      tD.textContent = term.getAttribute('data-def');
      tip.style.visibility = 'visible';
      tip.style.opacity = '1';
      tip.style.transform = 'translateY(0)';
      place(x, y);
      if (openTerm && openTerm !== term) openTerm.setAttribute('aria-expanded', 'false');
      term.setAttribute('aria-expanded', 'true');
      openTerm = term;
    }
    function hide() {
      tip.style.opacity = '0';
      tip.style.transform = 'translateY(6px)';
      if (openTerm) openTerm.setAttribute('aria-expanded', 'false');
      openTerm = null;
      setTimeout(function () {
        if (tip.style.opacity === '0') tip.style.visibility = 'hidden';
      }, 180);
    }
    function anchorOf(term) {
      var r = term.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top };
    }

    terms.forEach(function (term, i) {
      var defId = 'gloss-def-' + i;
      var def = document.createElement('span');
      def.id = defId;
      def.textContent = term.getAttribute('data-def');
      sink.appendChild(def);
      term.setAttribute('aria-describedby', defId);
      term.setAttribute('aria-expanded', 'false');

      term.addEventListener('mouseenter', function (ev) { show(term, ev.clientX, ev.clientY); });
      term.addEventListener('mousemove', function (ev) { if (openTerm === term) place(ev.clientX, ev.clientY); });
      term.addEventListener('mouseleave', hide);
      // keyboard / touch focus opens the tip; flag it so the click that follows
      // a tap doesn't immediately toggle it back closed.
      term.addEventListener('focus', function () {
        justFocused = true;
        setTimeout(function () { justFocused = false; }, 500);
        var a = anchorOf(term);
        show(term, a.x, a.y);
      });
      term.addEventListener('blur', hide);
      term.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          var a = anchorOf(term);
          if (openTerm === term) hide(); else show(term, a.x, a.y);
        } else if (ev.key === 'Escape') {
          hide();
        }
      });
      term.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (justFocused) { justFocused = false; return; } // focus already opened it
        if (openTerm === term) { hide(); return; }
        var a = anchorOf(term);
        show(term, a.x, a.y);
      });
    });

    // tap elsewhere / scroll closes an open tooltip
    document.addEventListener('click', function () { if (openTerm) hide(); });
    window.addEventListener('scroll', function () { if (openTerm) hide(); }, { passive: true });
  }

  /* ---- Limbuwan district map ---- */
  function setupDistricts() {
    var dd = document.getElementById('district-detail');
    var dpaths = q('[data-district]');
    if (!dd || !dpaths.length) return;
    var ddName = dd.querySelector('[data-dd-name]');
    var ddTag = dd.querySelector('[data-dd-tag]');
    var ddDesc = dd.querySelector('[data-dd-desc]');
    var chips = {}; // district name -> mobile chip button

    function select(p) {
      var name = p.getAttribute('data-name');
      ddName.textContent = name;
      ddTag.textContent = p.getAttribute('data-tag');
      ddDesc.textContent = p.getAttribute('data-desc');
      dpaths.forEach(function (o) {
        var on = o === p;
        o.style.opacity = on ? '1' : '0.8';
        o.style.filter = on ? 'brightness(1.16) saturate(1.08)' : 'none';
        o.style.stroke = on ? '#f4ead2' : '#241811';
        o.style.strokeWidth = on ? '3.4' : '2';
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      Object.keys(chips).forEach(function (n) {
        var on = n === name;
        chips[n].classList.toggle('is-active', on);
        chips[n].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      // raise the active path so its highlighted stroke is not clipped
      p.parentNode.appendChild(p);
    }

    dpaths.forEach(function (p) {
      p.addEventListener('mouseenter', function () { select(p); });
      p.addEventListener('focus', function () { select(p); });
      p.addEventListener('click', function () { select(p); });
      p.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(p); }
      });
    });

    // Tappable district chips — the map cluster is far too small to tap on a
    // phone, so this row of >=44px buttons drives the same selection. Shown on
    // small screens via CSS; hidden on desktop where the map hover works.
    var wrap = document.createElement('div');
    wrap.className = 'district-chips';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Select a Limbuwan district');
    dpaths.forEach(function (p) {
      var name = p.getAttribute('data-name');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'district-chip';
      b.textContent = name;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { select(p); });
      chips[name] = b;
      wrap.appendChild(b);
    });
    dd.parentNode.insertBefore(wrap, dd);

    var initial = dpaths.filter(function (p) { return p.getAttribute('data-name') === 'Taplejung'; })[0] || dpaths[0];
    select(initial);
  }

  /* ---- kings timeline interaction ---- */
  function setupKingsInteraction() {
    var kings = q('[data-king]');
    var kd = document.getElementById('king-detail');
    if (!kd || !kings.length) return;
    var kn = kd.querySelector('[data-kd-name]');
    var ktl = kd.querySelector('[data-kd-title]');
    var kde = kd.querySelector('[data-kd-desc]');
    var knum = kd.querySelector('[data-kd-num]');

    function styleBar(x, on) {
      var hi = x.getAttribute('data-known') === 'yes';
      var bar = x.querySelector('[data-king-bar]');
      var nm = x.querySelector('[data-king-name]');
      if (!bar) return;
      bar.style.height = on ? (hi ? '152px' : '94px') : (hi ? '124px' : '46px');
      bar.style.background = on ? 'linear-gradient(180deg,#e8c069,#b14a30)' : (hi ? 'rgba(200,154,62,.6)' : 'rgba(236,225,205,.4)');
      bar.style.boxShadow = on ? '0 0 18px rgba(200,154,62,.45)' : 'none';
      if (nm) nm.style.color = on ? '#f6ead0' : '#e7c87f';
    }
    function show(k) {
      kn.textContent = k.getAttribute('data-name');
      ktl.textContent = k.getAttribute('data-title');
      kde.textContent = k.getAttribute('data-desc');
      knum.textContent = k.getAttribute('data-num');
      kings.forEach(function (x) { styleBar(x, x === k); });
    }
    function focusKing(idx) {
      var clamped = Math.max(0, Math.min(kings.length - 1, idx));
      kings.forEach(function (x, i) { x.tabIndex = i === clamped ? 0 : -1; });
      kings[clamped].focus();
      show(kings[clamped]);
    }

    kings.forEach(function (k, idx) {
      styleBar(k, false);
      k.addEventListener('mouseenter', function () { show(k); });
      k.addEventListener('click', function () { show(k); });
      k.addEventListener('focus', function () { show(k); });
      k.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { ev.preventDefault(); focusKing(idx + 1); }
        else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { ev.preventDefault(); focusKing(idx - 1); }
        else if (ev.key === 'Home') { ev.preventDefault(); focusKing(0); }
        else if (ev.key === 'End') { ev.preventDefault(); focusKing(kings.length - 1); }
      });
    });
    show(kings[0]);
  }

  /* ---- Chyabhrung drum (Web Audio) ---- */
  function setupDrum() {
    var btn = document.getElementById('audio-toggle');
    var disc = document.getElementById('audio-disc');
    var label = document.getElementById('audio-label');
    var danceBtn = document.getElementById('dance-audio-cue');
    if (!btn) return;

    var drumOn = false;
    var actx = null, master = null, timer = null;

    function ensureCtx() {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        actx = new AC();
        master = actx.createGain();
        master.gain.value = 0.0001;
        master.connect(actx.destination);
      }
      if (actx.state === 'suspended') actx.resume();
      return true;
    }
    function noise(t, dur, gain, hp) {
      var n = Math.max(1, Math.floor(actx.sampleRate * dur));
      var buf = actx.createBuffer(1, n, actx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      var src = actx.createBufferSource(); src.buffer = buf;
      var f = actx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
      var g = actx.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    }
    function tone(t, freq, dur, gain) {
      var o = actx.createOscillator(); var g = actx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(38, freq * 0.5), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
    }
    function low(t, v) { tone(t, 96, 0.34, 0.5 * v); noise(t, 0.11, 0.1 * v, 120); }
    function high(t, v) { noise(t, 0.07, 0.18 * v, 2200); tone(t, 300, 0.07, 0.1 * v); }
    function loop() {
      if (!drumOn) return;
      var sp = 0.34, t0 = actx.currentTime + 0.06;
      [0, 3, 6].forEach(function (i) { low(t0 + i * sp, i === 0 ? 1 : 0.78); });
      [2, 4, 5, 7].forEach(function (i) { high(t0 + i * sp, i === 4 ? 0.95 : 0.6); });
      timer = setTimeout(loop, 8 * sp * 1000 - 28);
    }
    function start() {
      if (!ensureCtx()) return;
      drumOn = true;
      master.gain.cancelScheduledValues(actx.currentTime);
      master.gain.setTargetAtTime(0.22, actx.currentTime, 0.2);
      loop();
      if (disc && !prefersReduced) disc.style.animation = 'drumPulse 0.85s ease-in-out infinite';
      if (label) label.textContent = 'Chyabhrung ▪ stop';
      btn.style.borderColor = 'rgba(200,154,62,.85)';
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Stop the Chyabhrung drum');
      if (danceBtn) { danceBtn.setAttribute('aria-pressed', 'true'); danceBtn.textContent = '▪ Stop the drum'; }
    }
    function stop() {
      drumOn = false;
      if (timer) { clearTimeout(timer); timer = null; }
      if (master && actx) master.gain.setTargetAtTime(0.0001, actx.currentTime, 0.15);
      if (disc) disc.style.animation = 'none';
      if (label) label.textContent = 'Chyabhrung ▸ play';
      btn.style.borderColor = 'rgba(200,154,62,.4)';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Play the Chyabhrung drum');
      if (danceBtn) { danceBtn.setAttribute('aria-pressed', 'false'); danceBtn.textContent = '▸ Hear the drum'; }
    }
    function toggle() { if (drumOn) stop(); else start(); }

    btn.addEventListener('click', toggle);
    if (danceBtn) danceBtn.addEventListener('click', toggle);
    window.addEventListener('pagehide', stop);
  }

  // Kick everything off once the DOM is ready. Declared functions and the
  // KNOWN table above are all defined by the time this runs.
  ready(boot);
})();
