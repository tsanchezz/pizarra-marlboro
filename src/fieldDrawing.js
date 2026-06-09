export const ARROW_COL = 'rgba(255,255,180,0.92)';
export const C_LOCAL = '#e84545';
export const C_VISIT = '#ffffff';
export const C_VISIT_TEXT = '#0d1540';
export const PR = 18;

export function drawFieldC(c, w, h, scx, scy, vertical) {
  c.fillStyle = '#2a7a35';
  c.fillRect(0, 0, w, h);

  const nS = 10;
  if (vertical) {
    for (let i = 0; i < nS; i++) {
      if (i % 2 === 0) { c.fillStyle = 'rgba(0,0,0,0.05)'; c.fillRect(0, i * (h / nS), w, h / nS); }
    }
  } else {
    for (let i = 0; i < nS; i++) {
      if (i % 2 === 0) { c.fillStyle = 'rgba(0,0,0,0.05)'; c.fillRect(i * (w / nS), 0, w / nS, h); }
    }
  }

  c.save();
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 1.5;
  const mx = 22 * scx, my = 20 * scy, fw = w - 2 * mx, fh = h - 2 * my;
  c.strokeRect(mx, my, fw, fh);

  if (!vertical) {
    // ── HORIZONTAL ──
    c.beginPath(); c.moveTo(w / 2, my); c.lineTo(w / 2, my + fh); c.stroke();
    c.beginPath(); c.arc(w / 2, h / 2, 58 * scx, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath(); c.arc(w / 2, h / 2, 2.5 * scx, 0, Math.PI * 2); c.fill();

    const ah = 170 * scy, aw = 75 * scx;
    c.strokeRect(mx, h / 2 - ah / 2, aw, ah);
    c.strokeRect(mx + fw - aw, h / 2 - ah / 2, aw, ah);
    const sh = 90 * scy, sw = 30 * scx;
    c.strokeRect(mx, h / 2 - sh / 2, sw, sh);
    c.strokeRect(mx + fw - sw, h / 2 - sh / 2, sw, sh);
    const gH = 60 * scy, gW = 10 * scx;
    c.strokeRect(mx - gW, h / 2 - gH / 2, gW, gH);
    c.strokeRect(mx + fw, h / 2 - gH / 2, gW, gH);
    const ps = 52 * scx;
    c.fillStyle = 'rgba(255,255,255,0.65)';
    c.beginPath(); c.arc(mx + ps, h / 2, 2.5 * scx, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(mx + fw - ps, h / 2, 2.5 * scx, 0, Math.PI * 2); c.fill();

    c.save(); c.beginPath(); c.rect(0, 0, w, h); c.rect(mx, h / 2 - ah / 2, aw, ah); c.clip('evenodd');
    c.beginPath(); c.arc(mx + ps, h / 2, 46 * scx, 0, Math.PI * 2); c.stroke(); c.restore();
    c.save(); c.beginPath(); c.rect(0, 0, w, h); c.rect(mx + fw - aw, h / 2 - ah / 2, aw, ah); c.clip('evenodd');
    c.beginPath(); c.arc(mx + fw - ps, h / 2, 46 * scx, 0, Math.PI * 2); c.stroke(); c.restore();

    const cr = 7 * scx;
    [[mx, my, Math.PI, 3 * Math.PI / 2], [mx + fw, my, 3 * Math.PI / 2, 2 * Math.PI],
     [mx, my + fh, Math.PI / 2, Math.PI], [mx + fw, my + fh, 0, Math.PI / 2]].forEach(([x, y, a1, a2]) => {
      c.beginPath(); c.arc(x, y, cr, a1, a2); c.stroke();
    });
  } else {
    // ── VERTICAL ──
    c.beginPath(); c.moveTo(mx, h / 2); c.lineTo(mx + fw, h / 2); c.stroke();
    const cR = 58 * scx;
    c.beginPath(); c.arc(w / 2, h / 2, cR, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath(); c.arc(w / 2, h / 2, 2.5 * scx, 0, Math.PI * 2); c.fill();

    const agW = 220 * scx, agH = 75 * scy, agX = w / 2 - agW / 2;
    c.strokeRect(agX, my, agW, agH);
    c.strokeRect(agX, my + fh - agH, agW, agH);
    const acW = 100 * scx, acH = 30 * scy, acX = w / 2 - acW / 2;
    c.strokeRect(acX, my, acW, acH);
    c.strokeRect(acX, my + fh - acH, acW, acH);
    const gW = 70 * scx, gH = 12 * scy, gX = w / 2 - gW / 2;
    c.strokeRect(gX, my - gH, gW, gH);
    c.strokeRect(gX, my + fh, gW, gH);

    const ps = 55 * scy;
    c.fillStyle = 'rgba(255,255,255,0.65)';
    c.beginPath(); c.arc(w / 2, my + ps, 2.5 * scx, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(w / 2, my + fh - ps, 2.5 * scx, 0, Math.PI * 2); c.fill();

    const smR = 48 * scy;
    c.save(); c.beginPath(); c.rect(0, 0, w, h); c.rect(agX, my, agW, agH); c.clip('evenodd');
    c.beginPath(); c.arc(w / 2, my + ps, smR, 0, Math.PI * 2); c.stroke(); c.restore();
    c.save(); c.beginPath(); c.rect(0, 0, w, h); c.rect(agX, my + fh - agH, agW, agH); c.clip('evenodd');
    c.beginPath(); c.arc(w / 2, my + fh - ps, smR, 0, Math.PI * 2); c.stroke(); c.restore();

    const cr = 7 * scx;
    [[mx, my, Math.PI, 3 * Math.PI / 2], [mx + fw, my, 3 * Math.PI / 2, 2 * Math.PI],
     [mx, my + fh, Math.PI / 2, Math.PI], [mx + fw, my + fh, 0, Math.PI / 2]].forEach(([x, y, a1, a2]) => {
      c.beginPath(); c.arc(x, y, cr, a1, a2); c.stroke();
    });
  }
  c.restore();
}

export function arrowHeadC(c, x1, y1, x2, y2, col, scx, scy) {
  const ang = Math.atan2(y2 - y1, x2 - x1), s = 13 * Math.min(scx, scy);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - s * Math.cos(ang - 0.38), y2 - s * Math.sin(ang - 0.38));
  c.lineTo(x2 - s * Math.cos(ang + 0.38), y2 - s * Math.sin(ang + 0.38));
  c.closePath();
  c.fill();
}

export function drawArrowsC(c, scx, scy, arrows, mode, arrowStart, arrowCtrl, curvePhase, mousePos) {
  const _tc = (fx, fy) => [fx * scx, fy * scy];
  arrows.forEach(a => {
    const [ax1, ay1] = _tc(a.x1, a.y1), [ax2, ay2] = _tc(a.x2, a.y2);
    c.strokeStyle = ARROW_COL; c.lineWidth = 2.5; c.setLineDash([9, 5]);
    if (a.type === 'straight') {
      c.beginPath(); c.moveTo(ax1, ay1); c.lineTo(ax2, ay2); c.stroke();
      arrowHeadC(c, ax1, ay1, ax2, ay2, ARROW_COL, scx, scy);
    } else {
      const [cx2, cy2] = _tc(a.cx, a.cy);
      c.beginPath(); c.moveTo(ax1, ay1); c.quadraticCurveTo(cx2, cy2, ax2, ay2); c.stroke();
      const tx = 2 * (ax2 - cx2), ty = 2 * (ay2 - cy2);
      arrowHeadC(c, ax2 - tx * 0.02, ay2 - ty * 0.02, ax2, ay2, ARROW_COL, scx, scy);
    }
    c.setLineDash([]);
  });

  if (arrowStart && mousePos) {
    const [ax1, ay1] = _tc(arrowStart.x, arrowStart.y);
    c.strokeStyle = 'rgba(255,255,180,0.3)'; c.lineWidth = 2; c.setLineDash([7, 5]);
    if (mode === 'arrow-straight') {
      c.beginPath(); c.moveTo(ax1, ay1); c.lineTo(mousePos.x, mousePos.y); c.stroke();
    } else if (mode === 'arrow-curve') {
      if (curvePhase === 2 && arrowCtrl) {
        const [cx2, cy2] = _tc(arrowCtrl.x, arrowCtrl.y);
        c.beginPath(); c.moveTo(ax1, ay1); c.quadraticCurveTo(cx2, cy2, mousePos.x, mousePos.y); c.stroke();
      } else {
        c.beginPath(); c.moveTo(ax1, ay1); c.lineTo(mousePos.x, mousePos.y); c.stroke();
      }
    }
    c.setLineDash([]);
  }
}

export function drawPlayersC(c, scx, scy, players, draggingIdx) {
  const _tc = (fx, fy) => [fx * scx, fy * scy];
  const r = PR * Math.min(scx, scy);
  players.forEach((p, i) => {
    const [cx, cy] = _tc(p.x, p.y);
    const isLocal = p.team === 0;
    const isDrag = draggingIdx === i;
    c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = isDrag ? 16 : 6; c.shadowOffsetY = isDrag ? 5 : 2;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2);
    c.fillStyle = isLocal ? C_LOCAL : C_VISIT; c.fill();
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.strokeStyle = isDrag ? '#ffe060' : (isLocal ? 'rgba(0,0,0,0.3)' : '#1a2a6e');
    c.lineWidth = isDrag ? 3 : 2; c.stroke();

    const hasLabel = p.label && p.label.length > 0;
    c.fillStyle = isLocal ? '#fff' : C_VISIT_TEXT;
    c.font = 'bold ' + Math.round(r * (hasLabel ? 0.68 : 0.9)) + 'px Inter,system-ui,sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(p.num, cx, cy + (hasLabel ? -r * 0.2 : 0.5));

    if (hasLabel) {
      const fs = Math.max(9, Math.round(r * 0.62));
      c.font = '700 ' + fs + 'px Inter,system-ui,sans-serif';
      const lw = c.measureText(p.label).width;
      const lpad = 3, lh = fs + 5;
      const lrx = cx - lw / 2 - lpad, lry = cy + r * 0.18;
      c.fillStyle = isLocal ? 'rgba(160,15,15,0.88)' : 'rgba(15,25,90,0.88)';
      c.beginPath();
      if (c.roundRect) c.roundRect(lrx, lry, lw + lpad * 2, lh, 3);
      else c.rect(lrx, lry, lw + lpad * 2, lh);
      c.fill();
      c.fillStyle = '#fff';
      c.fillText(p.label, cx, lry + lh / 2 + 0.5);
    }
  });
}

export function dSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  if (!l2) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
export function dCurve(px, py, a) {
  let d = Infinity;
  for (let t = 0; t <= 1; t += 0.04) {
    const u = 1 - t;
    const bx = u * u * a.x1 + 2 * u * t * a.cx + t * t * a.x2;
    const by = u * u * a.y1 + 2 * u * t * a.cy + t * t * a.y2;
    d = Math.min(d, Math.hypot(px - bx, py - by));
  }
  return d;
}
