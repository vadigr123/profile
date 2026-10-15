// Animations for the three hobbies: falling phrases and a drawable yellow background.
// No dependencies, network access, or user tracking.
(() => {
  'use strict';

  // Справжня Matrix-анімація на Canvas. Кожен стовпчик фізично рухається
  // вниз, а окремі рядки перемикаються між трьома фразами.
  // Не використовує CSS-анімацій, ніяких API або мережевих запитів.
  function startMatrix() {
    const container = document.getElementById('activity-matrix-rain');
    const matrixCanvas = document.getElementById('activity-matrix-canvas');
    if (!container || !matrixCanvas || !matrixCanvas.getContext) return;
    const matrixCtx = matrixCanvas.getContext('2d');
    if (!matrixCtx) return;

    const words = ['poyo', 'silly mouse', 'vadym gay'];
    const rowGap = 29;
    let columns = [];
    let w = 0, h = 0;
    let previousTime = 0;
    let animationId = 0;
    let paused = false;
    let changes = 0;

    function otherWord(previous) {
      const alternatives = words.filter(word => word !== previous);
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    function makeColumn(i, rowCount, offset = 0) {
      const entries = Array.from({ length: rowCount }, (_, row) => ({
        word: words[(i + row) % words.length],
        glow: Math.random() * .4 + .45,
      }));
      return {
        x: 9 + i * (w / Math.max(1, Math.ceil(w / 90))),
        speed: 26 + Math.random() * 23,
        offset: offset || Math.random() * rowGap,
        entries,
        flickerTime: .25 + Math.random() * .4,
      };
    }

    function resizeMatrix() {
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      w = rect.width;
      h = rect.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      matrixCanvas.width = Math.max(1, Math.round(w * scale));
      matrixCanvas.height = Math.max(1, Math.round(h * scale));
      matrixCtx.setTransform(scale, 0, 0, scale, 0, 0);
      matrixCtx.textBaseline = 'middle';
      matrixCtx.font = 'bold 12px monospace';
      const count = Math.max(2, Math.min(5, Math.floor(w / 88)));
      const rows = Math.ceil(h / rowGap) + 3;
      columns = Array.from({length: count}, (_, i) => {
        const col = makeColumn(i, rows);
        col.x = 8 + i * (w - 18) / count;
        return col;
      });
      renderMatrix();
    }

    function updateMatrix(dt) {
      for (const col of columns) {
        col.offset += col.speed * dt;
        while (col.offset >= rowGap) {
          col.offset -= rowGap;
          col.entries.pop();
          col.entries.unshift({word: otherWord(col.entries[0].word), glow: .95});
          changes += 1;
        }
        col.flickerTime -= dt;
        if (col.flickerTime <= 0) {
          const item = col.entries[Math.floor(Math.random() * col.entries.length)];
          item.word = otherWord(item.word);
          item.glow = .85;
          col.flickerTime = .22 + Math.random() * .45;
          changes += 1;
        }
      }
      // Лічильник для локальних тестів і перевірки, що слова дійсно змінюються.
      container.dataset.wordChanges = String(changes);
    }

    function renderMatrix() {
      matrixCtx.clearRect(0, 0, w, h);
      matrixCtx.font = 'bold 12px monospace';
      matrixCtx.textBaseline = 'middle';
      for (const col of columns) {
        col.entries.forEach((entry, row) => {
          const y = -rowGap + col.offset + row * rowGap;
          if (y < -16 || y > h + 16) return;
          const glow = entry.glow;
          matrixCtx.shadowBlur = glow > .8 ? 7 : 3;
          matrixCtx.shadowColor = '#3dff62';
          matrixCtx.fillStyle = glow > .8 ? '#c3ff91' : `rgba(87, 238, 104, ${glow.toFixed(2)})`;
          matrixCtx.fillText(entry.word, col.x, y);
        });
      }
      matrixCtx.shadowBlur = 0;
    }

    function frame(time) {
      if (paused) return;
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .06) : 0;
      previousTime = time;
      updateMatrix(delta);
      renderMatrix();
      animationId = window.requestAnimationFrame(frame);
    }

    resizeMatrix();
    container.classList.add('is-running');
    // Навіть при вимкнених CSS animations Canvas усе одно рухається.
    animationId = window.requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        paused = true;
        window.cancelAnimationFrame(animationId);
        previousTime = 0;
      } else if (paused) {
        paused = false;
        animationId = window.requestAnimationFrame(frame);
      }
    });
    if (window.ResizeObserver) new ResizeObserver(resizeMatrix).observe(container);
    else window.addEventListener('resize', resizeMatrix, { passive: true });
  }

  startMatrix();

  const canvas = document.getElementById('activity-edit-canvas');
  const clearButton = document.getElementById('activity-clear');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Store points normalized to the canvas. Redraw correctly on resize/zoom.
  const strokes = [];
  let active = null;
  let drawingPointer = null;
  let width = 1;
  let height = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.setTransform(density, 0, 0, density, 0, 0);
    repaint();
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  }

  function drawStroke(points) {
    if (!points || !points.length) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f9c900';
    ctx.fillStyle = '#f9c900';
    ctx.beginPath();
    const first = points[0];
    ctx.moveTo(first.x * width, first.y * height);
    for (const point of points.slice(1)) ctx.lineTo(point.x * width, point.y * height);
    if (points.length === 1) {
      ctx.arc(first.x * width, first.y * height, 3, 0, Math.PI * 2);
      ctx.fill();
    } else ctx.stroke();
  }

  function repaint() {
    ctx.clearRect(0, 0, width, height);
    strokes.forEach(drawStroke);
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // On mobile, allow regular page scrolling; touch drawing requires a pen/stylus.
    if (event.pointerType === 'touch') return;
    drawingPointer = event.pointerId;
    active = [getPoint(event)];
    strokes.push(active);
    canvas.setPointerCapture(event.pointerId);
    repaint();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!active || drawingPointer !== event.pointerId) return;
    active.push(getPoint(event));
    repaint();
  });

  const finish = (event) => {
    if (drawingPointer !== event.pointerId) return;
    drawingPointer = null;
    active = null;
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  clearButton?.addEventListener('click', () => {
    strokes.length = 0;
    repaint();
  });

  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  resize();
})();
