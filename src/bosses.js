// Рисунки боссов и их соратников. Игра и превью зовут одни и те же функции.
export function paintBoss(ctx, e, t) {
  const r = e.r || 70;
  const id = e.bossId || "monolith";
  ctx.save();
  ctx.shadowColor = e.color;
  ctx.shadowBlur = e.grown ? 26 : 16;
  if (e.grown) {
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 3);
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (id === "reaper") paintReaper(ctx, r, e.color, t);
  else if (id === "satellite") paintSatellite(ctx, r, e.color, t);
  else if (id === "crystal") paintCrystal(ctx, r, e.color, t);
  else if (id === "crown") paintCrown(ctx, r, e.color, t);
  else paintMonolith(ctx, r, e.color, t);
  ctx.restore();
}

export function paintMinion(ctx, e, t) {
  const r = e.r || 11;
  ctx.save();
  ctx.shadowColor = e.color;
  ctx.shadowBlur = e.strong ? 12 : 6;
  const type = e.type;
  if (type === "blade") paintBlade(ctx, r, e.color, t);
  else if (type === "mote") paintMote(ctx, r, e.color, t);
  else if (type === "shard") paintShard(ctx, r, e.color, t);
  else if (type === "wisp") paintWisp(ctx, r, e.color, t);
  else paintMite(ctx, r, e.color, t);
  if (e.strong) {
    ctx.strokeStyle = "#fff6d8";
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function paintBossShot(ctx, s, t) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(Math.atan2(s.vy || 0, s.vx || 1));
  ctx.fillStyle = s.color;
  ctx.strokeStyle = s.color;
  ctx.shadowColor = s.color;
  ctx.shadowBlur = 14;
  const style = s.style || "orb";
  if (style === "spike") {
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-10, -7);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.fill();
  } else if (style === "arc") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 11, -1.1, 1.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-2, 0, 6, -0.8, 0.8);
    ctx.stroke();
  } else if (style === "beam") {
    const g = ctx.createLinearGradient(-18, 0, 14, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, s.color);
    ctx.fillStyle = g;
    ctx.fillRect(-18, -3, 32, 6);
  } else if (style === "ring") {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 8 + Math.sin(t * 8) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const grd = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9);
    grd.addColorStop(0, "#f8fdff");
    grd.addColorStop(0.45, s.color);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintMonolith(ctx, r, color, t) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, r * 0.08, r * 1.2, 0.55, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, r * 0.08, r * 1.2, Math.PI * 1.95, Math.PI * 2 + 0.28);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#4c0519";
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, r * 0.7);
  ctx.lineTo(r * 0.7, r * 0.7);
  ctx.lineTo(r * 0.56, r * 0.96);
  ctx.lineTo(-r * 0.56, r * 0.96);
  ctx.closePath();
  ctx.fill();

  const shaft = ctx.createLinearGradient(-r * 0.42, 0, r * 0.42, 0);
  shaft.addColorStop(0, "#881337");
  shaft.addColorStop(0.42, color);
  shaft.addColorStop(1, "#fecdd3");
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, r * 0.7);
  ctx.lineTo(-r * 0.4, -r * 0.38);
  ctx.lineTo(r * 0.4, -r * 0.38);
  ctx.lineTo(r * 0.4, r * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff1f2";
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.08);
  ctx.lineTo(r * 0.46, -r * 0.32);
  ctx.lineTo(-r * 0.46, -r * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.92);
  ctx.lineTo(r * 0.3, -r * 0.38);
  ctx.lineTo(-r * 0.3, -r * 0.38);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(76, 5, 25, 0.72)";
  for (const y of [-0.08, 0.18, 0.44]) ctx.fillRect(-r * 0.4, r * y, r * 0.8, r * 0.055);

  const pulse = 0.62 + 0.38 * Math.sin(t * 3);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = "#fff1f2";
  ctx.shadowColor = "#fff1f2";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.16);
  ctx.lineTo(r * 0.13, r * 0.08);
  ctx.lineTo(0, r * 0.32);
  ctx.lineTo(-r * 0.13, r * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  for (let i = 0; i < 4; i++) {
    const a = t * 0.55 + (i * Math.PI) / 2;
    ctx.save();
    ctx.translate(Math.cos(a) * r * 1.22, r * 0.08 + Math.sin(a) * r * 1.22);
    ctx.rotate(a);
    ctx.fillStyle = i % 2 ? "#fff1f2" : color;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.1);
    ctx.lineTo(r * 0.07, 0);
    ctx.lineTo(0, r * 0.1);
    ctx.lineTo(-r * 0.07, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function paintReaper(ctx, r, color, t) {
  ctx.rotate(Math.sin(t * 0.8) * 0.15);
  ctx.fillStyle = "#3f2a08";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(r * 0.08, 0, r * 0.78, -2.2, 2.2);
  ctx.stroke();
  ctx.strokeStyle = "#fff7d6";
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(r * 0.08, 0, r * 0.78, -2.2, 2.2);
  ctx.stroke();
  ctx.fillStyle = "#1c1408";
  ctx.beginPath();
  ctx.arc(-r * 0.05, 0, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(-r * 0.02, -r * 0.04, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const a = t * 1.4 + (i * Math.PI * 2) / 3;
    ctx.save();
    ctx.translate(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05);
    ctx.rotate(a + Math.PI / 2);
    paintBlade(ctx, r * 0.28, color, t);
    ctx.restore();
  }
}

function paintSatellite(ctx, r, color, t) {
  const body = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.1, 0, 0, r * 0.62);
  body.addColorStop(0, "#e0f2fe");
  body.addColorStop(0.45, color);
  body.addColorStop(1, "#0c4a6e");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(224, 242, 254, 0.85)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.38, -0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.95, r * 0.28, 0.9, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 2; i++) {
    const a = t * (i ? -0.9 : 1.1) + i * 2;
    const rx = r * (i ? 0.95 : 1.15);
    const ry = r * (i ? 0.28 : 0.38);
    const tilt = i ? 0.9 : -0.4;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    const px = x * Math.cos(tilt) - y * Math.sin(tilt);
    const py = x * Math.sin(tilt) + y * Math.cos(tilt);
    ctx.fillStyle = i ? "#bae6fd" : "#f0f9ff";
    ctx.beginPath();
    ctx.arc(px, py, r * (i ? 0.16 : 0.2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintCrystal(ctx, r, color, t) {
  ctx.fillStyle = "#3b0764";
  hexAt(ctx, 0, 0, r * 0.95);
  ctx.fill();
  ctx.save();
  ctx.rotate(t * 0.35);
  ctx.fillStyle = color;
  hexAt(ctx, 0, 0, r * 0.72);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#f5f3ff";
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.28);
  ctx.lineTo(r * 0.16, 0);
  ctx.lineTo(0, r * 0.34);
  ctx.lineTo(-r * 0.16, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 3 + t * 0.5;
    ctx.save();
    ctx.translate(Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = i === 1 ? "#e9d5ff" : color;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.22);
    ctx.lineTo(r * 0.1, r * 0.16);
    ctx.lineTo(-r * 0.1, r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function paintCrown(ctx, r, color, t) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#064e3b";
  ctx.beginPath();
  ctx.arc(0, r * 0.08, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  const gem = ctx.createRadialGradient(0, r * 0.02, 2, 0, r * 0.08, r * 0.28);
  gem.addColorStop(0, "#ecfdf5");
  gem.addColorStop(0.5, color);
  gem.addColorStop(1, "#065f46");
  ctx.fillStyle = gem;
  ctx.beginPath();
  ctx.arc(0, r * 0.08, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n + Math.sin(t + i) * 0.04;
    const inner = r * 0.7;
    const tip = r * (i % 2 ? 1.2 : 1.38);
    ctx.fillStyle = i % 2 ? "#6ee7b7" : color;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * tip, Math.sin(a) * tip);
    ctx.lineTo(Math.cos(a - 0.18) * inner, Math.sin(a - 0.18) * inner);
    ctx.lineTo(Math.cos(a + 0.18) * inner, Math.sin(a + 0.18) * inner);
    ctx.closePath();
    ctx.fill();
  }
}

function paintMite(ctx, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.85, r * 0.7);
  ctx.lineTo(-r * 0.2, r * 0.15);
  ctx.lineTo(-r * 0.9, r * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff1f2";
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.45);
  ctx.lineTo(r * 0.22, r * 0.05);
  ctx.lineTo(-r * 0.12, r * 0.02);
  ctx.closePath();
  ctx.fill();
}

function paintBlade(ctx, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.quadraticCurveTo(0, -r * 1.15, -r, -r * 0.15);
  ctx.quadraticCurveTo(-r * 0.2, -r * 0.05, -r * 0.15, r * 0.35);
  ctx.quadraticCurveTo(0, -r * 0.45, r, 0);
  ctx.fill();
}

function paintMote(ctx, r, color, t) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f0f9ff";
  ctx.beginPath();
  ctx.arc(Math.cos(t * 3) * r * 0.15, Math.sin(t * 3) * r * 0.15, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function paintShard(ctx, r, color) {
  ctx.fillStyle = color;
  hexAt(ctx, 0, 0, r);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  hexAt(ctx, 0, 0, r * 0.38);
  ctx.fill();
}

function paintWisp(ctx, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.72, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.72, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ecfdf5";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function hexAt(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
