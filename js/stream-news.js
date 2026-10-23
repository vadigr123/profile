// POYO v17 — independent, randomly changing white question marks.
// Static spans in HTML guarantee a visible background even without JavaScript.
(() => {
  'use strict';
  const field = document.getElementById('stream-question-field');
  if (!field) return;
  const marks = Array.from(field.querySelectorAll('.stream-question'));
  if (!marks.length) return;

  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const random = (a, b) => a + Math.random() * (b - a);
  const particles = marks.map((mark, i) => ({
    mark,
    period: random(2.3, 5.8),
    offset: random(0, 12) + i * 0.12,
    cycle: -1,
    alpha: random(0.25, 0.9),
    drift: random(-18, 18),
  }));

  function moveParticle(particle) {
    // Fresh random size and position every time this particle reappears.
    const el = particle.mark;
    particle.alpha = random(0.25, 0.88);
    particle.drift = random(-22, 22);
    el.style.left = `${random(1, 94).toFixed(2)}%`;
    el.style.top = `${random(2, 90).toFixed(2)}%`;
    el.style.fontSize = `${Math.round(random(24, 96))}px`;
    el.style.setProperty('--glitch-delay', `${random(-2.9, 0).toFixed(2)}s`);
  }

  function animate(time) {
    if (!field.isConnected || motion?.matches) return;
    if (!document.hidden) {
      const seconds = time / 1000;
      for (const p of particles) {
        const total = (seconds + p.offset) / p.period;
        const cycle = Math.floor(total);
        const phase = total - cycle;
        if (p.cycle !== cycle) {
          p.cycle = cycle;
          moveParticle(p);
        }
        // A different sign appears, brightens, floats, then vanishes.
        const appear = Math.min(1, phase / 0.2);
        const disappear = Math.min(1, (1 - phase) / 0.25);
        const strength = Math.max(0, Math.min(appear, disappear));
        p.mark.style.opacity = (p.alpha * strength).toFixed(3);
        p.mark.style.transform = `translateY(${(p.drift * (phase - 0.5)).toFixed(1)}px) rotate(${(phase * 12 - 6).toFixed(1)}deg)`;
      }
    }
    frame = requestAnimationFrame(animate);
  }

  function applyMotionPreference() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (motion?.matches) {
      // Keep a still, readable field for accessibility instead of an empty black box.
      particles.forEach(p => {
        p.mark.style.opacity = '';
        p.mark.style.transform = '';
      });
    } else {
      // Use fresh cycles if animations become enabled while the page is open.
      particles.forEach(p => { p.cycle = -1; });
      frame = requestAnimationFrame(animate);
    }
  }

  // Artificially corrupted transmission: the text is constantly changing,
  // but the intact sentence is kept in aria-label on its parent paragraph.
  const signal = document.getElementById('stream-news-signal');
  let signalTimer = 0;
  if (signal) {
    const source = signal.dataset.full || signal.textContent;
    const noise = ['?', '#', '▓', '█', '/', '⍰', '_'];
    let tick = 0;
    function alterSignal() {
      if (motion?.matches || document.hidden) return;
      tick += 1;
      // Heavily corrupt most frames, with a rare brief fully legible frame.
      const showClear = tick % 17 === 0;
      const text = showClear ? source : Array.from(source).map((ch) => {
        if (/\s/.test(ch)) return ch;
        return Math.random() < 0.52 ? noise[Math.floor(Math.random() * noise.length)] : ch;
      }).join('');
      signal.textContent = text;
      signal.dataset.text = text;
    }
    function updateSignalMode() {
      if (signalTimer) clearInterval(signalTimer);
      signalTimer = 0;
      if (motion?.matches) {
        signal.textContent = source;
        signal.dataset.text = source;
      } else {
        alterSignal();
        signalTimer = window.setInterval(alterSignal, 145);
      }
    }
    updateSignalMode();
    motion?.addEventListener?.('change', updateSignalMode);
    window.addEventListener('pagehide', () => { if (signalTimer) clearInterval(signalTimer); }, {once:true});
  }

  applyMotionPreference();
  motion?.addEventListener?.('change', applyMotionPreference);
  window.addEventListener('pagehide', () => { if (frame) cancelAnimationFrame(frame); }, { once:true });
})();
