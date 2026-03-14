// ==================== NAV ====================
function setActive(el) {
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollTopBtn');
  btn.classList.toggle('visible', window.scrollY > 400);
});

// ==================== ACCENT ====================
function setAccent(color, el) {
  document.documentElement.style.setProperty('--accent-blue', color);
  document.querySelectorAll('.palette-dot').forEach(d => d.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ==================== THEME ====================
let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  const btn = document.querySelector('.theme-btn');
  if (!isDark) {
    document.documentElement.style.setProperty('--bg', '#f4f4f6');
    document.documentElement.style.setProperty('--surface', '#ffffff');
    document.documentElement.style.setProperty('--border', '#e0e0e8');
    document.documentElement.style.setProperty('--text', '#111113');
    document.documentElement.style.setProperty('--muted', '#666680');
    document.documentElement.style.setProperty('--canvas-bg', '#e8e8f0');
    btn.textContent = '🌙';
  } else {
    document.documentElement.style.setProperty('--bg', '#111113');
    document.documentElement.style.setProperty('--surface', '#1a1a1e');
    document.documentElement.style.setProperty('--border', '#2a2a30');
    document.documentElement.style.setProperty('--text', '#e8e8ec');
    document.documentElement.style.setProperty('--muted', '#888896');
    document.documentElement.style.setProperty('--canvas-bg', '#1e1e24');
    btn.textContent = '☀️';
  }
}

// ==================== POLAROID DRAG ====================
const polaroidEl = document.getElementById('polaroidEl');

if (polaroidEl) {

let isDragging = false, startX, startY, currentX = 0, currentY = 0;

polaroidEl.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
  polaroidEl.style.cursor = 'grabbing';
  polaroidEl.style.animation = 'none';
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  polaroidEl.style.transform = `translate(${currentX}px, ${currentY}px) rotate(-4deg)`;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  polaroidEl.style.cursor = 'grab';
});

}

// ==================== CANVAS ENGINE ====================
let activeTool = 'pen';
let drawColor = '#ffffff';
let brushSize = 4;
let drawOpacity = 1.0;
let isDown = false;
let startPos = {};
let snapshot;
let history = [];
let historyIndex = -1;

const canvas = document.getElementById('drawCanvas');
let ctx = null;

if (canvas) {
  ctx = canvas.getContext('2d');
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = rect.width;
  canvas.height = rect.height;
  ctx.putImageData(imageData, 0, 0);
  ctx.fillStyle = '#16161a';
}

function initCanvas(c, ct) {
  c.width = c.offsetWidth || c.parentElement.clientWidth || 800;
  c.height = 500;
  ct.fillStyle = '#16161a';
  ct.fillRect(0, 0, c.width, c.height);
}

window.addEventListener('load', () => {
  if (canvas) {
    initCanvas(canvas, ctx);
    saveHistory();
  }
});

window.addEventListener('resize', () => {
  if (canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
});

function getPos(e, c) {
  const rect = c.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return {
    x: (touch.clientX - rect.left) * (c.width / rect.width),
    y: (touch.clientY - rect.top) * (c.height / rect.height)
  };
}

function startDraw(e) {
  isDown = true;
  const pos = getPos(e, canvas);
  startPos = pos;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  e.preventDefault();
}

function draw(e) {
  if (!isDown) return;
  const pos = getPos(e, canvas);
  ctx.strokeStyle = activeTool === 'eraser' ? '#16161a' : drawColor;
  ctx.lineWidth = activeTool === 'brush' ? brushSize * 3 : brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = activeTool === 'eraser' ? 1 : drawOpacity;

  if (activeTool === 'pen' || activeTool === 'brush' || activeTool === 'eraser') {
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  } else {
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.globalAlpha = drawOpacity;
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;

    if (activeTool === 'line') {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (activeTool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    } else if (activeTool === 'circle') {
      const rx = Math.abs(pos.x - startPos.x) / 2;
      const ry = Math.abs(pos.y - startPos.y) / 2;
      const cx = startPos.x + (pos.x - startPos.x) / 2;
      const cy = startPos.y + (pos.y - startPos.y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  e.preventDefault();
}

function endDraw(e) {
  if (!isDown) return;
  isDown = false;
  ctx.globalAlpha = 1;
  saveHistory();
  e.preventDefault();
}

if (canvas) {
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', endDraw, { passive: false });
}

function saveHistory() {
  historyIndex++;
  history = history.slice(0, historyIndex);
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > 30) { history.shift(); historyIndex--; }
}

function undoCanvas() {
  if (historyIndex > 0) {
    historyIndex--;
    ctx.putImageData(history[historyIndex], 0, 0);
  }
}

function setTool(tool, btn) {
  activeTool = tool;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setColor(color, el) {
  drawColor = color;
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  if (el) el.classList.add('selected');
  document.getElementById('colorPicker').value = color;
}

function updateSize(val) {
  brushSize = parseInt(val);
  document.getElementById('sizeLabel').textContent = val + 'px';
}

function updateOpacity(val) {
  drawOpacity = val / 100;
  document.getElementById('opacityLabel').textContent = val + '%';
}

function setCanvasBg(color) {
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(img, 0, 0);
}

function clearCanvas() {
  ctx.fillStyle = '#16161a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveHistory();
}

function downloadCanvas() {
  const link = document.createElement('a');
  link.download = 'rafli-canvas.png';
  link.href = canvas.toDataURL();
  link.click();
}

// ==================== FULLSCREEN CANVAS ====================
let fctx, fCanvas;
let fIsDown = false, fSnapshot, fStartPos = {};

function openCanvas() {
  document.getElementById('canvasModal').classList.add('open');
  fCanvas = document.getElementById('drawCanvasFull');
  fctx = fCanvas.getContext('2d');
  if (fCanvas.width < 100) {
    fCanvas.width = fCanvas.offsetWidth || 800;
    fCanvas.height = 500;
    fctx.fillStyle = '#16161a';
    fctx.fillRect(0, 0, fCanvas.width, fCanvas.height);
  }
  setupFullCanvas();
}

function setupFullCanvas() {
  fCanvas.addEventListener('mousedown', fs);
  fCanvas.addEventListener('mousemove', fm);
  fCanvas.addEventListener('mouseup', fe);
  fCanvas.addEventListener('mouseleave', fe);
  fCanvas.addEventListener('touchstart', fs, { passive: false });
  fCanvas.addEventListener('touchmove', fm, { passive: false });
  fCanvas.addEventListener('touchend', fe, { passive: false });
}

function fs(e) {
  fIsDown = true;
  fStartPos = getPos(e, fCanvas);
  fSnapshot = fctx.getImageData(0, 0, fCanvas.width, fCanvas.height);
  fctx.beginPath(); fctx.moveTo(fStartPos.x, fStartPos.y);
  e.preventDefault();
}

function fm(e) {
  if (!fIsDown) return;
  const pos = getPos(e, fCanvas);
  fctx.strokeStyle = activeTool === 'eraser' ? '#16161a' : drawColor;
  fctx.lineWidth = activeTool === 'brush' ? brushSize * 3 : brushSize;
  fctx.lineCap = 'round'; fctx.lineJoin = 'round';
  fctx.globalAlpha = activeTool === 'eraser' ? 1 : drawOpacity;

  if (activeTool === 'pen' || activeTool === 'brush' || activeTool === 'eraser') {
    fctx.lineTo(pos.x, pos.y); fctx.stroke();
  } else {
    fctx.putImageData(fSnapshot, 0, 0);
    fctx.beginPath(); fctx.globalAlpha = drawOpacity; fctx.strokeStyle = drawColor; fctx.lineWidth = brushSize;
    if (activeTool === 'line') { fctx.moveTo(fStartPos.x, fStartPos.y); fctx.lineTo(pos.x, pos.y); fctx.stroke(); }
    else if (activeTool === 'rect') { fctx.strokeRect(fStartPos.x, fStartPos.y, pos.x - fStartPos.x, pos.y - fStartPos.y); }
    else if (activeTool === 'circle') {
      const rx = Math.abs(pos.x - fStartPos.x) / 2, ry = Math.abs(pos.y - fStartPos.y) / 2;
      fctx.ellipse(fStartPos.x + (pos.x - fStartPos.x)/2, fStartPos.y + (pos.y - fStartPos.y)/2, rx, ry, 0, 0, 2*Math.PI);
      fctx.stroke();
    }
  }
  e.preventDefault();
}

function fe(e) { fIsDown = false; fctx.globalAlpha = 1; e.preventDefault(); }

function closeCanvas() { document.getElementById('canvasModal').classList.remove('open'); }
function clearFullCanvas() { fctx.fillStyle = '#16161a'; fctx.fillRect(0, 0, fCanvas.width, fCanvas.height); }
function downloadFullCanvas() {
  const link = document.createElement('a');
  link.download = 'rafli-canvas-full.png';
  link.href = fCanvas.toDataURL();
  link.click();
}

// ==================== PAGE TRANSITION ====================
const transition = document.getElementById("pageTransition");

document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", function(e) {
    const href = this.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#")) return;
    if (this.target === "_blank") return;
    const sameOrigin = !this.hostname || this.hostname === window.location.hostname;
    if (sameOrigin) {
      e.preventDefault();
      transition.classList.add("active");
      setTimeout(() => {
        window.location.href = href;
      }, 700);
    }
  });
});