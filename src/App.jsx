import { useEffect, useRef, useCallback, useState } from 'react';
import LOGO_B64 from './logo.js';
import { buildPlayers } from './formations.js';
import { drawFieldC, drawArrowsC, drawPlayersC, dSeg, dCurve, PR } from './fieldDrawing.js';
import NamesModal from './NamesModal.jsx';
import ShareOverlay from './ShareOverlay.jsx';
import './App.css';

const FW_H = 680, FH_H = 440;
const FW_V = 440, FH_V = 680;

const HINTS = {
  move: 'Arrastrá las fichas para posicionarlas',
  'arrow-straight': 'Flecha recta — tocá origen, luego destino',
  'arrow-curve': 'Flecha curva — 1° origen · 2° control · 3° destino',
  delete: 'Tocá una flecha para eliminarla',
};

export default function App() {
  const canvasRef = useRef(null);
  const logoImgRef = useRef(null);
  const logoReady = useRef(false);

  // All mutable game state lives in a ref to avoid re-render overhead during drag/draw
  const s = useRef({
    players: [], arrows: [], mode: 'move',
    dragging: null, dragOX: 0, dragOY: 0,
    arrowStart: null, arrowCtrl: null, curvePhase: 0,
    mouse: { x: 0, y: 0 },
    W: 0, H: 0, sx: 1, sy: 1,
    FW: FW_H, FH: FH_H, vertical: false, n: 11,
    mouseDown: false, touchStartXY: null, touchMoved: false,
  }).current;

  // React state only for UI re-renders
  const [mode, setModeState] = useState('move');
  const [hint, setHint] = useState(HINTS.move);
  const [teamSize, setTeamSize] = useState(8);
  const [showNames, setShowNames] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);

  // Preload logo image for canvas drawing
  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoReady.current = true; };
    img.src = 'data:image/png;base64,' + LOGO_B64;
    logoImgRef.current = img;
  }, []);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, s.W, s.H);
    drawFieldC(ctx, s.W, s.H, s.sx, s.sy, s.vertical);
    drawArrowsC(ctx, s.sx, s.sy, s.arrows, s.mode, s.arrowStart, s.arrowCtrl, s.curvePhase, s.mouse);
    drawPlayersC(ctx, s.sx, s.sy, s.players, s.dragging);
  }

  const doResize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = document.getElementById('canvas-wrap');
    if (!canvas || !wrap) return;
    const vert = window.innerWidth < 680;
    const prevVert = s.vertical;
    s.vertical = vert;
    s.FW = vert ? FW_V : FW_H;
    s.FH = vert ? FH_V : FH_H;
    const maxW = wrap.clientWidth - 16, maxH = wrap.clientHeight - 16;
    const ratio = s.FH / s.FW;
    if (maxW * ratio <= maxH) { s.W = maxW; s.H = Math.round(maxW * ratio); }
    else { s.H = maxH; s.W = Math.round(maxH / ratio); }

    // High DPI support: scale canvas by devicePixelRatio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = s.W * dpr;
    canvas.height = s.H * dpr;
    canvas.style.width = s.W + 'px';
    canvas.style.height = s.H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    s.sx = s.W / s.FW; s.sy = s.H / s.FH;
    // Rebuild positions if orientation changed
    if (vert !== prevVert) {
      s.players = buildPlayers(s.n, vert, s.players);
      s.arrows = [];
    }
    draw();
  }, []);

  useEffect(() => {
    s.vertical = window.innerWidth < 680;
    s.FW = s.vertical ? FW_V : FW_H;
    s.FH = s.vertical ? FH_V : FH_H;
    s.players = buildPlayers(11, s.vertical);
    doResize();
    window.addEventListener('resize', doResize);
    return () => window.removeEventListener('resize', doResize);
  }, []);

  function tc(fx, fy) { return [fx * s.sx, fy * s.sy]; }
  function tf(cx, cy) { return [cx / s.sx, cy / s.sy]; }

  function playerAt(cx, cy) {
    const [fx, fy] = tf(cx, cy), r = (PR / Math.min(s.sx, s.sy)) * 1.8;
    for (let i = s.players.length - 1; i >= 0; i--) {
      const p = s.players[i];
      if ((p.x - fx) ** 2 + (p.y - fy) ** 2 < r * r) return i;
    }
    return -1;
  }

  function arrowAt(cx, cy) {
    const [fx, fy] = tf(cx, cy);
    for (let i = s.arrows.length - 1; i >= 0; i--) {
      const a = s.arrows[i];
      const d = a.type === 'straight' ? dSeg(fx, fy, a.x1, a.y1, a.x2, a.y2) : dCurve(fx, fy, a);
      if (d < 14) return i;
    }
    return -1;
  }

  function setMode(m) {
    s.mode = m; s.arrowStart = null; s.arrowCtrl = null; s.curvePhase = 0;
    setModeState(m); setHint(HINTS[m] || '');
    draw();
  }

  function handleAction(cx, cy) {
    const [fx, fy] = tf(cx, cy);
    if (s.mode === 'arrow-straight') {
      if (!s.arrowStart) { s.arrowStart = { x: fx, y: fy }; }
      else { s.arrows.push({ type: 'straight', x1: s.arrowStart.x, y1: s.arrowStart.y, x2: fx, y2: fy }); s.arrowStart = null; draw(); }
    } else if (s.mode === 'arrow-curve') {
      if (s.curvePhase === 0) { s.arrowStart = { x: fx, y: fy }; s.curvePhase = 1; }
      else if (s.curvePhase === 1) { s.arrowCtrl = { x: fx, y: fy }; s.curvePhase = 2; }
      else { s.arrows.push({ type: 'curve', x1: s.arrowStart.x, y1: s.arrowStart.y, cx: s.arrowCtrl.x, cy: s.arrowCtrl.y, x2: fx, y2: fy }); s.arrowStart = null; s.arrowCtrl = null; s.curvePhase = 0; draw(); }
    } else if (s.mode === 'delete') {
      const i = arrowAt(cx, cy);
      if (i >= 0) { s.arrows.splice(i, 1); draw(); }
    }
  }

  function getXY(e) {
    const r = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - r.left, src.clientY - r.top];
  }

  // Attach canvas events imperatively (avoids React synthetic event overhead)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = e => {
      const [cx, cy] = getXY(e); s.mouseDown = true;
      if (s.mode === 'move') {
        const i = playerAt(cx, cy);
        if (i >= 0) { s.dragging = i; const [px, py] = tc(s.players[i].x, s.players[i].y); s.dragOX = cx - px; s.dragOY = cy - py; }
      } else { handleAction(cx, cy); }
    };
    const onMove = e => {
      if (!s.mouseDown) return;
      const [cx, cy] = getXY(e); s.mouse = { x: cx, y: cy };
      if (s.mode === 'move' && s.dragging !== null) {
        const [fx, fy] = tf(cx - s.dragOX, cy - s.dragOY);
        s.players[s.dragging].x = Math.max(5, Math.min(s.FW - 5, fx + PR / s.sx));
        s.players[s.dragging].y = Math.max(5, Math.min(s.FH - 5, fy + PR / s.sy));
        draw();
      } else if (s.arrowStart) { draw(); }
    };
    const onUp = () => { s.mouseDown = false; s.dragging = null; };

    const onTouchStart = e => {
      e.preventDefault();
      const [cx, cy] = getXY(e); s.touchStartXY = [cx, cy]; s.touchMoved = false;
      if (s.mode === 'move') {
        const i = playerAt(cx, cy);
        if (i >= 0) { s.dragging = i; const [px, py] = tc(s.players[i].x, s.players[i].y); s.dragOX = cx - px; s.dragOY = cy - py; }
      }
    };
    const onTouchMove = e => {
      e.preventDefault();
      const [cx, cy] = getXY(e); s.mouse = { x: cx, y: cy };
      if (!s.touchMoved && s.touchStartXY && Math.hypot(cx - s.touchStartXY[0], cy - s.touchStartXY[1]) > 8) s.touchMoved = true;
      if (s.mode === 'move' && s.dragging !== null) {
        const [fx, fy] = tf(cx - s.dragOX, cy - s.dragOY);
        s.players[s.dragging].x = Math.max(5, Math.min(s.FW - 5, fx + PR / s.sx));
        s.players[s.dragging].y = Math.max(5, Math.min(s.FH - 5, fy + PR / s.sy));
        draw();
      } else if (s.arrowStart) { draw(); }
    };
    const onTouchEnd = e => {
      e.preventDefault();
      const wasDrag = s.touchMoved;
      if (!wasDrag && s.touchStartXY && s.mode !== 'move') handleAction(s.touchStartXY[0], s.touchStartXY[1]);
      s.dragging = null; s.touchStartXY = null; s.touchMoved = false;
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mouseleave', onUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  function handleTeamSizeChange(e) {
    const n = parseInt(e.target.value);
    s.n = n; setTeamSize(n);
    s.players = buildPlayers(n, s.vertical);
    s.arrows = []; draw();
  }

  function handleSaveNames(vals) {
    s.players = s.players.map(p => ({ ...p, label: vals[`${p.team}-${p.num}`] ?? p.label }));
    draw(); setShowNames(false);
  }

  function buildShareCanvas() {
    const targetW = 900, targetH = Math.round(900 * s.FH / s.FW);
    const scx = targetW / s.FW, scy = targetH / s.FH;
    const banner = 120, pad = 16;
    const out = document.createElement('canvas');
    out.width = targetW + pad * 2; out.height = banner + targetH + pad * 2;
    const c = out.getContext('2d');
    c.fillStyle = '#0a0f2e'; c.fillRect(0, 0, out.width, out.height);
    c.fillStyle = '#0d1540'; c.fillRect(0, 0, out.width, banner);
    if (logoReady.current && logoImgRef.current) {
      const lr = 40, lcx = pad + lr + 8, lcy = banner / 2;
      c.save(); c.beginPath(); c.arc(lcx, lcy, lr, 0, Math.PI * 2); c.clip();
      c.drawImage(logoImgRef.current, lcx - lr, lcy - lr, lr * 2, lr * 2); c.restore();
      c.strokeStyle = '#2a3f8f'; c.lineWidth = 3;
      c.beginPath(); c.arc(lcx, lcy, lr, 0, Math.PI * 2); c.stroke();
      const tx = lcx + lr + 20;
      c.fillStyle = '#fff'; c.font = 'bold 32px Inter,system-ui,sans-serif';
      c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('LIBERTADORES', tx, banner / 2 - 18);
      c.fillStyle = '#ffd700'; c.font = 'bold 28px Inter,system-ui,sans-serif';
      c.fillText('DE MARLBORO', tx, banner / 2 + 18);
      const sx = tx;
      c.fillStyle = '#6080c0'; c.font = '600 14px Inter,system-ui,sans-serif';
      c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText('Pizarra táctica · Fútbol ' + s.n, sx, banner - 26);
    }
    c.save(); c.translate(pad, banner + pad);
    const rr = 10;
    c.beginPath();
    c.moveTo(rr, 0); c.arcTo(targetW, 0, targetW, targetH, rr);
    c.arcTo(targetW, targetH, 0, targetH, rr);
    c.arcTo(0, targetH, 0, 0, rr);
    c.arcTo(0, 0, targetW, 0, rr);
    c.closePath(); c.clip();
    drawFieldC(c, targetW, targetH, scx, scy, s.vertical);
    drawArrowsC(c, scx, scy, s.arrows, 'move', null, null, 0, null);
    drawPlayersC(c, scx, scy, s.players, -1);
    c.restore();
    return out;
  }

  function openShare() {
    const out = buildShareCanvas();
    setShareDataUrl(out.toDataURL('image/png'));
  }

  const tb = m => `tb${mode === m ? ' active' : ''}`;

  return (
    <div className="app">
      <header>
        <div className="logo-wrap">
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="Logo" />
        </div>
        <div className="club-name">
          Libertadores de Marlboro
          <span>Pizarra táctica</span>
        </div>
        <div style={{ flex: 1 }} />
        <select className="h-select" value={teamSize} onChange={handleTeamSizeChange}>
          <option value={5}>Fútbol 5</option>
          <option value={8}>Fútbol 8</option>
          <option value={9}>Fútbol 9</option>
          <option value={11}>Fútbol 11</option>
        </select>
      </header>

      <div className="toolbar">
        <div className="tg">
          <button className={tb('move')} onClick={() => setMode('move')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>
            Mover
          </button>
          <button className={tb('arrow-straight')} onClick={() => setMode('arrow-straight')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>
            Recta
          </button>
          <button className={tb('arrow-curve')} onClick={() => setMode('arrow-curve')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20c5-15 14-15 19 0"/><polyline points="16 20 22 20 22 14"/></svg>
            Curva
          </button>
          <button className={`tb${mode === 'delete' ? ' active' : ''} red`} onClick={() => setMode('delete')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
            Borrar
          </button>
        </div>
        <div className="ts" />
        <div className="tg">
          <button className="tb names-btn" onClick={() => setShowNames(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Nombres
          </button>
          <button className="tb" onClick={() => { s.arrows = []; draw(); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Limpiar
          </button>
          <button className="tb" onClick={() => { s.players = buildPlayers(s.n, s.vertical); s.arrows = []; draw(); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
            Reset
          </button>
          <button className="tb share" onClick={openShare}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Compartir
          </button>
        </div>
      </div>

      <div className="hint">{hint}</div>

      <div className="canvas-wrap" id="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      <div className={`fab-container${fabOpen ? ' open' : ''}`}>
        <button className="fab-main" onClick={() => setFabOpen(!fabOpen)} title="Herramientas">
          {fabOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          )}
        </button>
        {fabOpen && (
          <>
            <button className="fab-action fab-names" onClick={() => { setShowNames(true); setFabOpen(false); }} title="Nombres">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span>Nombres</span>
            </button>
            <button className="fab-action fab-clear" onClick={() => { s.arrows = []; draw(); setFabOpen(false); }} title="Limpiar flechas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Limpiar</span>
            </button>
            <button className="fab-action fab-reset" onClick={() => { s.players = buildPlayers(s.n, s.vertical); s.arrows = []; draw(); setFabOpen(false); }} title="Reset">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
              <span>Reset</span>
            </button>
            <button className="fab-action fab-share" onClick={() => { openShare(); setFabOpen(false); }} title="Compartir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span>Compartir</span>
            </button>
          </>
        )}
      </div>

      {showNames && (
        <NamesModal
          players={s.players}
          onSave={handleSaveNames}
          onClose={() => setShowNames(false)}
        />
      )}

      {shareDataUrl && (
        <ShareOverlay
          dataUrl={shareDataUrl}
          onClose={() => setShareDataUrl(null)}
        />
      )}
    </div>
  );
}
