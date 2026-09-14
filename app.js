/* egemenagi.com — Kovan app.js (2126 komuta merkezi)
   Bakiye/equity/günlük geçmiş/parite/strateji/işlem verisi GERÇEK
   (performance_data.json, 44_web_sync_engine.py tarafından üretilir).
   Arı ekranları + sinyal ağı + kraliçe grafiği tamamen GÖRSEL ŞOV —
   yöntem/parametre/karar mekanizması ifşa ETMEZ.
*/

const BEES = [
  { key: "aggressor", name: "AggressorBee", color: "#ef4444",
    role: "Agresif kâr uzmanı",
    lines: ["Momentum taranıyor…", "Fırsat penceresi ölçülüyor…", "Zarar → fırsat değerlendiriliyor…"] },
  { key: "defender", name: "DefenderBee", color: "#3b82f6",
    role: "Risk yönetimi · veto yetkisi",
    lines: ["Teminat seviyesi izleniyor…", "Risk sınırları kontrol ediliyor…", "Kovan güvenliği doğrulanıyor…"] },
  { key: "ranger", name: "RangerBee", color: "#10b981",
    role: "Kurtarma (recovery) uzmanı",
    lines: ["Zarardaki hatlar izleniyor…", "Kurtarma fırsatı taranıyor…", "Destek hattı hesaplanıyor…"] },
  { key: "analyst", name: "AnalystBee", color: "#f59e0b",
    role: "Piyasa / rejim analisti",
    lines: ["Piyasa rejimi okunuyor…", "Volatilite ölçülüyor…", "Trend gücü değerlendiriliyor…"] },
  { key: "veteran", name: "VeteranBee", color: "#8b5cf6",
    role: "Strateji değerlendirmeci",
    lines: ["Strateji geçmişi taranıyor…", "Güven skoru güncelleniyor…", "Tecrübeli hatlar öne çıkarılıyor…"] },
  { key: "sniper", name: "SniperBee", color: "#06b6d4",
    role: "Hassas giriş uzmanı",
    lines: ["Destek/direnç ölçülüyor…", "Giriş penceresi bekleniyor…", "Risk/ödül oranı hesaplanıyor…"] },
  { key: "pyramid", name: "PyramidBee", color: "#f97316",
    role: "Piramit & ölçekleme uzmanı",
    lines: ["Kârdaki hatlar izleniyor…", "Ölçekleme fırsatı değerlendiriliyor…", "Kovan limiti kontrol ediliyor…"] },
];

function fmtUsd(v){
  const n = Number(v) || 0;
  const sign = n > 0 ? "+" : "";
  return `${sign}$${n.toFixed(2)}`;
}
function cls(v){ return Number(v) > 0 ? "pos" : (Number(v) < 0 ? "neg" : ""); }

/* ============ 7 AJAN — Kraliçe'nin etrafında DAİRESEL yerleşim ============ */
const PAIRS6 = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"];

function renderCouncil(){
  const el = document.getElementById("council");
  el.innerHTML = BEES.map((b, i) => `
    <div class="bee-card" data-key="${b.key}" style="--bee-color:${b.color};">
      <div class="bee-icon">
        <svg viewBox="0 0 100 100">
          <ellipse class="agent-wing left" cx="30" cy="42" rx="18" ry="10" fill="${b.color}" opacity="0.35"/>
          <ellipse class="agent-wing right" cx="70" cy="42" rx="18" ry="10" fill="${b.color}" opacity="0.35"/>
          <ellipse cx="50" cy="58" rx="22" ry="26" fill="${b.color}"/>
          <rect x="29" y="48" width="42" height="7" fill="#0a0e1a"/>
          <rect x="29" y="63" width="42" height="7" fill="#0a0e1a"/>
          <circle cx="50" cy="30" r="12" fill="#0a0e1a"/>
        </svg>
      </div>
      <div class="bee-name">${b.name}</div>
      <div class="bee-role">${b.role} · <span style="color:${b.color}">${PAIRS6[i % PAIRS6.length]}</span></div>
      <div class="bee-screen">
        <span class="node-tag">NODE-0${i + 1}</span><span class="node-tag live">●</span>
        <canvas id="chart-${b.key}" width="140" height="52"></canvas>
      </div>
      <div class="neuro-strip" id="neuro-${b.key}"></div>
      <div class="bee-readout" id="readout-${b.key}"><span>spk/s <b>—</b></span><span><b>—</b></span></div>
      <div class="bee-caption" id="cap-${b.key}">${b.lines[0]}</div>
    </div>
  `).join("");

  positionOrbit();
  window.addEventListener("resize", positionOrbit);

  BEES.forEach((b, i) => {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % b.lines.length;
      const capEl = document.getElementById(`cap-${b.key}`);
      if (!capEl) return;
      capEl.style.animation = "none";
      void capEl.offsetWidth;
      capEl.style.animation = "";
      capEl.textContent = b.lines[idx];
    }, 3200 + i * 450);
    animateMiniChart(`chart-${b.key}`, b.color, 900 + i * 130);
    renderNeuroStrip(`neuro-${b.key}`);
    animateBeeReadout(`readout-${b.key}`, i);
  });
}

/* Stonkfly-tarzı nöron ateşleme şeridi — yanıp sönen noktalar, tamamen dekoratif. */
function renderNeuroStrip(elId){
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = Array.from({ length: 8 }, (_, i) =>
    `<span class="neuro-dot" style="animation-delay:${(i * 0.11).toFixed(2)}s"></span>`
  ).join("");
}

/* Ajan okunumu: spikes/s + BUY/SELL/WAIT-tarzı "karar" göstergesi. Dekoratif. */
function animateBeeReadout(elId, seed){
  const el = document.getElementById(elId);
  if (!el) return;
  const decisions = ["WAIT", "SCAN", "HOLD", "WATCH"];
  function tick(){
    const spk = (8 + Math.random() * 34).toFixed(1);
    const dec = decisions[Math.floor(Math.random() * decisions.length)];
    el.innerHTML = `<span>spk/s <b>${spk}k</b></span><span><b>${dec}</b></span>`;
  }
  tick();
  setInterval(tick, 1800 + seed * 90);
}

/* Kraliçenin çevresinde 7 ajanı eşit açıyla dairesel yerleştirir. */
function positionOrbit(){
  const orbit = document.getElementById("orbit");
  if (!orbit) return;
  const w = orbit.clientWidth, h = orbit.clientHeight;
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(w, h) / 2 - 105;
  BEES.forEach((b, i) => {
    const card = document.querySelector(`.bee-card[data-key="${b.key}"]`);
    if (!card) return;
    const angle = (-90 + i * (360 / BEES.length)) * (Math.PI / 180);
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  });
}

/* Kraliçenin komuta ekranındaki dönen HUD satırları — dekoratif teknik "gürültü". */
function animateQueenReadout(){
  const el = document.getElementById("queenReadout");
  if (!el) return;
  const words = ["SIG-LOCK", "UPLINK", "SYNC", "NODE-04", "AUTH-OK", "STREAM"];
  function tick(){
    const w1 = words[Math.floor(Math.random() * words.length)];
    const pct = (95 + Math.random() * 4.9).toFixed(1);
    el.innerHTML = `<span>${w1}</span><span>${pct}%</span>`;
  }
  tick();
  setInterval(tick, 1400);
}

/* Dekoratif mini "analiz" grafiği — her arının kendi ekranı. Sanal veri. */
function animateMiniChart(canvasId, color, seedShift){
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  let points = Array.from({length: 26}, (_, i) => H/2 + Math.sin((i + seedShift) * 0.4) * H * 0.22);
  function step(){
    points.shift();
    const last = points[points.length - 1];
    let next = last + (Math.random() - 0.5) * H * 0.3;
    next = Math.max(H * 0.12, Math.min(H * 0.88, next));
    points.push(next);
    ctx.clearRect(0, 0, W, H);
    // ince ızgara
    ctx.strokeStyle = "rgba(55,230,255,0.08)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 20) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    // çizgi
    ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.shadowColor = color; ctx.shadowBlur = 4;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * W;
      i === 0 ? ctx.moveTo(x, p) : ctx.lineTo(x, p);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    // son nokta imleci
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(W, points[points.length - 1], 2.4, 0, Math.PI * 2);
    ctx.fill();
    setTimeout(() => requestAnimationFrame(step), 260);
  }
  step();
}

/* Kraliçenin önündeki büyük "komuta ekranı" — dekoratif mum grafik. */
function animateQueenChart(){
  const cv = document.getElementById("queenChart");
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  let candles = [];
  let price = H * 0.5;
  for (let i = 0; i < 46; i++) {
    const open = price;
    price += (Math.random() - 0.48) * H * 0.06;
    price = Math.max(H * 0.1, Math.min(H * 0.9, price));
    const close = price;
    const high = Math.max(open, close) - Math.random() * H * 0.04;
    const low = Math.min(open, close) + Math.random() * H * 0.04;
    candles.push({ open, close, high, low });
  }
  function step(){
    candles.shift();
    const prevClose = candles[candles.length - 1].close;
    const open = prevClose;
    let close = open + (Math.random() - 0.48) * H * 0.07;
    close = Math.max(H * 0.08, Math.min(H * 0.92, close));
    const high = Math.min(open, close) - Math.random() * H * 0.035;
    const low = Math.max(open, close) + Math.random() * H * 0.035;
    candles.push({ open, close, high: Math.max(0, high), low: Math.min(H, low) });

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(55,230,255,0.09)"; ctx.lineWidth = 1;
    for (let gy = 0; gy < H; gy += 28) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    const cw = W / candles.length;
    candles.forEach((c, i) => {
      const x = i * cw + cw / 2;
      const up = c.close <= c.open; // canvas y ters (küçük y = yüksek fiyat)
      const col = up ? "#3dffb0" : "#ff4f6d";
      ctx.strokeStyle = col; ctx.fillStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, c.high); ctx.lineTo(x, c.low); ctx.stroke();
      const bodyTop = Math.min(c.open, c.close), bodyH = Math.max(1.5, Math.abs(c.close - c.open));
      ctx.fillRect(x - cw * 0.32, bodyTop, cw * 0.64, bodyH);
    });
    setTimeout(() => requestAnimationFrame(step), 340);
  }
  step();
}

/* ============ Kraliçe <-> 7 arı sinyal ağı (bulanık radar hatları) ============ */
function drawSignalNet(){
  const svg = document.getElementById("signalNet");
  const stage = document.getElementById("hiveStage");
  const queen = document.getElementById("queenBee");
  if (!svg || !stage || !queen) return;

  function render(){
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width < 10) return;
    svg.setAttribute("width", stageRect.width);
    svg.setAttribute("height", stageRect.height);
    svg.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);

    const qr = queen.getBoundingClientRect();
    const qx = qr.left + qr.width / 2 - stageRect.left;
    const qy = qr.top + qr.height / 2 - stageRect.top;

    const ns = "http://www.w3.org/2000/svg";
    svg.innerHTML = "";
    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML = `<filter id="blurSig"><feGaussianBlur stdDeviation="1.1"/></filter>`;
    svg.appendChild(defs);

    BEES.forEach((b, i) => {
      const card = document.querySelector(`.bee-card[data-key="${b.key}"]`);
      if (!card) return;
      const br = card.getBoundingClientRect();
      const bx = br.left + br.width / 2 - stageRect.left;
      const by = br.top - stageRect.top; // arının tepesine bağla

      // eğrisel (bulanık radar hissi veren) kesikli çizgi
      const midx = (bx + qx) / 2, midy = (by + qy) / 2 - 18;
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", `M${bx},${by} Q${midx},${midy} ${qx},${qy}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", b.color);
      path.setAttribute("stroke-width", "1.3");
      path.setAttribute("opacity", "0.55");
      path.setAttribute("filter", "url(#blurSig)");
      path.setAttribute("class", "sig-line");
      path.style.animationDuration = `${1.1 + (i % 4) * 0.25}s`;
      svg.appendChild(path);

      // sinyal noktası (arıdan kraliçeye giden "veri paketi" hissi)
      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("r", "2.6");
      dot.setAttribute("fill", b.color);
      dot.setAttribute("class", "sig-pulse");
      dot.style.animationDelay = `${i * 0.18}s`;
      const anim = document.createElementNS(ns, "animateMotion");
      anim.setAttribute("dur", `${1.6 + (i % 3) * 0.3}s`);
      anim.setAttribute("repeatCount", "indefinite");
      anim.setAttribute("path", `M${bx},${by} Q${midx},${midy} ${qx},${qy}`);
      dot.appendChild(anim);
      svg.appendChild(dot);
    });
  }

  render();
  window.addEventListener("resize", render);
  setInterval(render, 4000); // düzen kayarsa (veri güncellenince) yeniden hizala
}

/* ============ Uzak sunucu ağı — tamamen dekoratif Terminator-esque harita ============ */
function renderNetworkMap(){
  const svg = document.getElementById("networkMap");
  if (!svg) return;
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  const ns = "http://www.w3.org/2000/svg";
  svg.innerHTML = "";

  const cx = W / 2, cy = H / 2;
  const nodes = BEES.map((b, i) => {
    const angle = (i / BEES.length) * Math.PI * 2 - Math.PI / 2;
    const rx = W * 0.42, ry = H * 0.36;
    return { ...b, x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });

  // arka plan ızgara
  const grid = document.createElementNS(ns, "g");
  for (let gx = 0; gx < W; gx += 40) {
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", gx); l.setAttribute("x2", gx); l.setAttribute("y1", 0); l.setAttribute("y2", H);
    l.setAttribute("stroke", "rgba(239,68,68,0.05)");
    grid.appendChild(l);
  }
  for (let gy = 0; gy < H; gy += 40) {
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", 0); l.setAttribute("x2", W); l.setAttribute("y1", gy); l.setAttribute("y2", gy);
    l.setAttribute("stroke", "rgba(239,68,68,0.05)");
    grid.appendChild(l);
  }
  svg.appendChild(grid);

  // node <-> kraliçe bağlantı çizgileri
  nodes.forEach((n, i) => {
    const path = document.createElementNS(ns, "path");
    const midx = (n.x + cx) / 2, midy = (n.y + cy) / 2 + (i % 2 === 0 ? -14 : 14);
    path.setAttribute("d", `M${n.x},${n.y} Q${midx},${midy} ${cx},${cy}`);
    path.setAttribute("fill", "none"); path.setAttribute("stroke", n.color);
    path.setAttribute("stroke-width", "1"); path.setAttribute("opacity", "0.45");
    path.setAttribute("class", "sig-line");
    path.style.animationDuration = `${1.2 + (i % 4) * 0.3}s`;
    svg.appendChild(path);
  });

  // merkez: Kraliçe / Komuta çekirdeği
  const core = document.createElementNS(ns, "g");
  const coreCircle = document.createElementNS(ns, "circle");
  coreCircle.setAttribute("cx", cx); coreCircle.setAttribute("cy", cy); coreCircle.setAttribute("r", 22);
  coreCircle.setAttribute("fill", "#1a1130"); coreCircle.setAttribute("stroke", "#8b5cf6"); coreCircle.setAttribute("stroke-width", "1.5");
  core.appendChild(coreCircle);
  const coreLabel = document.createElementNS(ns, "text");
  coreLabel.setAttribute("x", cx); coreLabel.setAttribute("y", cy + 40);
  coreLabel.setAttribute("fill", "#8b5cf6"); coreLabel.setAttribute("font-size", "10");
  coreLabel.setAttribute("font-family", "Consolas,monospace"); coreLabel.setAttribute("text-anchor", "middle");
  coreLabel.textContent = "CMD-CORE";
  core.appendChild(coreLabel);
  svg.appendChild(core);

  // her ajan için "uzak node" kutusu
  nodes.forEach((n, i) => {
    const g = document.createElementNS(ns, "g");
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", n.x - 34); rect.setAttribute("y", n.y - 16);
    rect.setAttribute("width", 68); rect.setAttribute("height", 32);
    rect.setAttribute("rx", 5); rect.setAttribute("fill", "#03060b");
    rect.setAttribute("stroke", n.color); rect.setAttribute("stroke-width", "1");
    g.appendChild(rect);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", n.x); label.setAttribute("y", n.y - 2);
    label.setAttribute("fill", n.color); label.setAttribute("font-size", "9");
    label.setAttribute("font-family", "Consolas,monospace"); label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-weight", "700");
    label.textContent = `NODE-0${i + 1}`;
    g.appendChild(label);

    const sub = document.createElementNS(ns, "text");
    sub.setAttribute("x", n.x); sub.setAttribute("y", n.y + 10);
    sub.setAttribute("fill", "#6b7280"); sub.setAttribute("font-size", "7.5");
    sub.setAttribute("font-family", "Consolas,monospace"); sub.setAttribute("text-anchor", "middle");
    sub.textContent = n.name.replace("Bee", "");
    g.appendChild(sub);

    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("r", "2"); dot.setAttribute("fill", n.color); dot.setAttribute("class", "sig-pulse");
    dot.style.animationDelay = `${i * 0.2}s`;
    const anim = document.createElementNS(ns, "animateMotion");
    anim.setAttribute("dur", `${1.4 + (i % 3) * 0.3}s`); anim.setAttribute("repeatCount", "indefinite");
    const midx = (n.x + cx) / 2, midy = (n.y + cy) / 2 + (i % 2 === 0 ? -14 : 14);
    anim.setAttribute("path", `M${n.x},${n.y} Q${midx},${midy} ${cx},${cy}`);
    dot.appendChild(anim);
    svg.appendChild(dot);

    svg.appendChild(g);
  });
}

/* Bakiye hero kartındaki küçük gerçek trend çizgisi (son N gün). */
function renderHeroMini(daily){
  const svg = document.getElementById("heroMini");
  if (!svg) return;
  svg.innerHTML = "";
  if (!daily || daily.length < 2) return;
  const W = 400, H = 46;
  const vals = daily.map(d => Number(d.balance) || 0);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = (max - min) || 1;
  const stepX = W / (daily.length - 1);
  const pts = daily.map((d, i) => `${(i * stepX).toFixed(1)},${(H - ((d.balance - min) / range) * H).toFixed(1)}`);
  const ns = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(ns, "polyline");
  path.setAttribute("points", pts.join(" "));
  path.setAttribute("fill", "none"); path.setAttribute("stroke", "#f59e0b");
  path.setAttribute("stroke-width", "2"); path.setAttribute("opacity", "0.85");
  svg.appendChild(path);
}

/* Kazanç/kayıp dairesel grafik — GERÇEK veriden (recent_trades yeterli değilse strateji toplamı kullanılır). */
function renderWinDonut(recent, strategies){
  const svg = document.getElementById("winDonut");
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  svg.innerHTML = "";
  let wins = 0, losses = 0;
  (recent || []).forEach(r => r.result === "WIN" ? wins++ : losses++);
  if (wins + losses === 0) {
    (strategies || []).forEach(s => s.pnl >= 0 ? wins++ : losses++);
  }
  if (wins + losses === 0) { emptyState("winDonut", "Henüz sonuçlanmış işlem yok"); return; }

  const total = wins + losses;
  const cx = W * 0.32, cy = H / 2, r = 70, stroke = 22;
  const ns = "http://www.w3.org/2000/svg";
  const circumference = 2 * Math.PI * r;
  const winFrac = wins / total;

  const bg = document.createElementNS(ns, "circle");
  bg.setAttribute("cx", cx); bg.setAttribute("cy", cy); bg.setAttribute("r", r);
  bg.setAttribute("fill", "none"); bg.setAttribute("stroke", "#ef4444"); bg.setAttribute("stroke-width", stroke);
  bg.setAttribute("opacity", "0.35");
  svg.appendChild(bg);

  const fg = document.createElementNS(ns, "circle");
  fg.setAttribute("cx", cx); fg.setAttribute("cy", cy); fg.setAttribute("r", r);
  fg.setAttribute("fill", "none"); fg.setAttribute("stroke", "#10b981"); fg.setAttribute("stroke-width", stroke);
  fg.setAttribute("stroke-dasharray", `${circumference * winFrac} ${circumference}`);
  fg.setAttribute("stroke-linecap", "round");
  fg.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);
  svg.appendChild(fg);

  const label = document.createElementNS(ns, "text");
  label.setAttribute("x", cx); label.setAttribute("y", cy - 4);
  label.setAttribute("fill", "#e5e7eb"); label.setAttribute("font-size", "22"); label.setAttribute("font-weight", "800");
  label.setAttribute("font-family", "Consolas,monospace"); label.setAttribute("text-anchor", "middle");
  label.textContent = `%${(winFrac * 100).toFixed(0)}`;
  svg.appendChild(label);
  const sub = document.createElementNS(ns, "text");
  sub.setAttribute("x", cx); sub.setAttribute("y", cy + 16);
  sub.setAttribute("fill", "#6b7280"); sub.setAttribute("font-size", "9.5");
  sub.setAttribute("font-family", "Consolas,monospace"); sub.setAttribute("text-anchor", "middle");
  sub.textContent = "isabet";
  svg.appendChild(sub);

  const legendX = W * 0.62;
  [["Kazanan", wins, "#10b981"], ["Kaybeden", losses, "#ef4444"]].forEach(([lbl, n, col], i) => {
    const y = cy - 16 + i * 28;
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", legendX); dot.setAttribute("cy", y); dot.setAttribute("r", 5); dot.setAttribute("fill", col);
    svg.appendChild(dot);
    const t = document.createElementNS(ns, "text");
    t.setAttribute("x", legendX + 12); t.setAttribute("y", y + 4);
    t.setAttribute("fill", "#e5e7eb"); t.setAttribute("font-size", "12"); t.setAttribute("font-family", "Consolas,monospace");
    t.textContent = `${lbl}: ${n}`;
    svg.appendChild(t);
  });
}

function renderStatusGrid(data){
  const el = document.getElementById("statusGrid");
  if (!el) return;
  const a = data.account || {};
  const t = data.last_updated ? new Date(data.last_updated) : null;
  const rows = [
    ["Kraliçe Arı (Komutan)", "sembolik — görsel katman"],
    ["Web Sync Engine", "saatte bir otomatik yayın"],
    ["Son senkronizasyon", (t && !isNaN(t)) ? t.toLocaleTimeString("tr-TR") : "—"],
    ["Takip edilen parite", `${a.pairs_traded ?? 0}`],
    ["Açık pozisyon", `${a.open_positions ?? 0}`],
    ["Bağımsız doğrulama", "myfxbook — aktif"],
  ];
  el.innerHTML = rows.map(([k, v]) => `
    <div class="status-row"><span class="sname"><span class="sdot"></span>${k}</span><span class="sval">${v}</span></div>
  `).join("");
}

function renderHero(data){
  const a = data.account || {};
  document.getElementById("heroBalance").textContent = (a.balance ?? 0).toFixed(2);
  document.getElementById("heroEquity").textContent = `$${(a.equity ?? 0).toFixed(2)}`;
  const t = data.last_updated ? new Date(data.last_updated) : null;
  document.getElementById("heroUpdated").textContent = (t && !isNaN(t))
    ? t.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : "—";
}

function renderStats(data){
  const a = data.account || {};
  const dEl = document.getElementById("sDaily");
  dEl.textContent = fmtUsd(a.daily_pnl); dEl.className = `val ${cls(a.daily_pnl)}`;
  const wEl = document.getElementById("sWeekly");
  wEl.textContent = fmtUsd(a.weekly_pnl); wEl.className = `val ${cls(a.weekly_pnl)}`;
  const mEl = document.getElementById("sMonthly");
  mEl.textContent = fmtUsd(a.monthly_pnl); mEl.className = `val ${cls(a.monthly_pnl)}`;

  document.getElementById("sWinrate").textContent = `%${(a.win_rate ?? 0).toFixed(1)}`;
  document.getElementById("sTrades").textContent = a.total_trades ?? 0;
  document.getElementById("sOpen").textContent = a.open_positions ?? 0;
}

function renderUpdated(data){
  const t = data.last_updated ? new Date(data.last_updated) : null;
  const el = document.getElementById("lastUpdated");
  const staleEl = document.getElementById("staleNote");
  if (!t || isNaN(t)) { el.textContent = "—"; return; }
  el.textContent = t.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  const hoursOld = (Date.now() - t.getTime()) / 3_600_000;
  staleEl.style.display = hoursOld > 3 ? "inline" : "none";
}

function emptyState(svgId, msg){
  const svg = document.getElementById(svgId);
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  svg.innerHTML = `<text x="${W/2}" y="${H/2}" fill="#7d93ab" font-size="13" text-anchor="middle" font-family="Consolas,monospace">${msg}</text>`;
}

function renderDailyChart(daily){
  const svg = document.getElementById("dailyChart");
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  const pad = { l: 60, r: 20, t: 16, b: 30 };
  svg.innerHTML = "";
  if (!daily || !daily.length) { emptyState("dailyChart", "Henüz günlük veri yok"); return; }
  const vals = daily.map(d => Number(d.balance) || 0).concat(daily.map(d => Number(d.equity) || 0));
  const min = Math.min(...vals, 0), max = Math.max(...vals, 1);
  const range = (max - min) || 1;
  const stepX = (W - pad.l - pad.r) / Math.max(daily.length - 1, 1);
  const x = i => pad.l + i * stepX;
  const y = v => H - pad.b - ((v - min) / range) * (H - pad.t - pad.b);

  const ns = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(ns, "g");

  for (let i = 0; i <= 4; i++) {
    const gv = min + (range * i / 4);
    const gy = y(gv);
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", pad.l); line.setAttribute("x2", W - pad.r);
    line.setAttribute("y1", gy); line.setAttribute("y2", gy);
    line.setAttribute("stroke", "rgba(55,230,255,0.12)"); line.setAttribute("stroke-dasharray", "3,4");
    g.appendChild(line);
    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", pad.l - 8); label.setAttribute("y", gy + 4);
    label.setAttribute("fill", "#7d93ab"); label.setAttribute("font-size", "10");
    label.setAttribute("font-family", "Consolas,monospace");
    label.setAttribute("text-anchor", "end");
    label.textContent = `$${gv.toFixed(0)}`;
    g.appendChild(label);
  }

  let path = daily.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.balance).toFixed(1)}`).join(" ");
  const areaPath = `${path} L${x(daily.length-1).toFixed(1)},${(H-pad.b).toFixed(1)} L${x(0).toFixed(1)},${(H-pad.b).toFixed(1)} Z`;

  const grad = document.createElementNS(ns, "linearGradient");
  grad.setAttribute("id", "dailyGrad"); grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0"); grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
  grad.innerHTML = `<stop offset="0%" stop-color="#37e6ff" stop-opacity="0.35"/><stop offset="100%" stop-color="#37e6ff" stop-opacity="0"/>`;
  const defs = document.createElementNS(ns, "defs"); defs.appendChild(grad); g.appendChild(defs);

  const area = document.createElementNS(ns, "path");
  area.setAttribute("d", areaPath); area.setAttribute("fill", "url(#dailyGrad)");
  g.appendChild(area);

  const line = document.createElementNS(ns, "path");
  line.setAttribute("d", path); line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#f59e0b"); line.setAttribute("stroke-width", "2.4");
  line.setAttribute("style", "filter:drop-shadow(0 0 5px rgba(245,158,11,.5))");
  g.appendChild(line);

  const eqPath = daily.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.equity).toFixed(1)}`).join(" ");
  const eqLine = document.createElementNS(ns, "path");
  eqLine.setAttribute("d", eqPath); eqLine.setAttribute("fill", "none");
  eqLine.setAttribute("stroke", "#06b6d4"); eqLine.setAttribute("stroke-width", "1.6");
  eqLine.setAttribute("stroke-dasharray", "4,3"); eqLine.setAttribute("opacity", "0.85");
  g.appendChild(eqLine);

  // lejant
  const leg = document.createElementNS(ns, "g");
  leg.innerHTML = `
    <circle cx="${W - 168}" cy="${pad.t + 4}" r="4" fill="#f59e0b"/>
    <text x="${W - 158}" y="${pad.t + 8}" fill="#9ca3af" font-size="10" font-family="Consolas,monospace">bakiye</text>
    <circle cx="${W - 96}" cy="${pad.t + 4}" r="4" fill="#06b6d4"/>
    <text x="${W - 86}" y="${pad.t + 8}" fill="#9ca3af" font-size="10" font-family="Consolas,monospace">equity</text>`;
  g.appendChild(leg);

  daily.forEach((d, i) => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x(i)); c.setAttribute("cy", y(d.balance));
    c.setAttribute("r", "3"); c.setAttribute("fill", "#ffc93c");
    const title = document.createElementNS(ns, "title");
    title.textContent = `${d.date}: $${Number(d.balance).toFixed(2)} (net ${fmtUsd(d.net)})`;
    c.appendChild(title);
    g.appendChild(c);

    if (i % Math.ceil(daily.length / 8 || 1) === 0) {
      const lbl = document.createElementNS(ns, "text");
      lbl.setAttribute("x", x(i)); lbl.setAttribute("y", H - 8);
      lbl.setAttribute("fill", "#7d93ab"); lbl.setAttribute("font-size", "9.5");
      lbl.setAttribute("font-family", "Consolas,monospace");
      lbl.setAttribute("text-anchor", "middle");
      lbl.textContent = d.date.slice(5);
      g.appendChild(lbl);
    }
  });

  svg.appendChild(g);
}

function renderBarChart(svgId, items, labelKey, valueKey, colorPos, colorNeg, emptyMsg){
  const svg = document.getElementById(svgId);
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  svg.innerHTML = "";
  if (!items || !items.length) { emptyState(svgId, emptyMsg); return; }
  const top = items.slice(0, 10);
  const pad = { l: 70, r: 20, t: 10, b: 10 };
  const rowH = (H - pad.t - pad.b) / top.length;
  const maxAbs = Math.max(...top.map(x => Math.abs(x[valueKey])), 1);
  const midX = pad.l + (W - pad.l - pad.r) * 0.42;
  const scale = (W - pad.l - pad.r) * 0.55 / maxAbs;

  const ns = "http://www.w3.org/2000/svg";
  top.forEach((it, i) => {
    const y = pad.t + i * rowH + rowH * 0.18;
    const h = rowH * 0.64;
    const v = it[valueKey];
    const w = Math.abs(v) * scale;
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("y", y); rect.setAttribute("height", h);
    rect.setAttribute("x", v >= 0 ? midX : midX - w);
    rect.setAttribute("width", Math.max(1, w));
    rect.setAttribute("fill", v >= 0 ? colorPos : colorNeg);
    rect.setAttribute("rx", "2");
    rect.setAttribute("opacity", "0.85");
    svg.appendChild(rect);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", pad.l - 8); label.setAttribute("y", y + h * 0.72);
    label.setAttribute("fill", "#dff6ff"); label.setAttribute("font-size", "10.5");
    label.setAttribute("font-family", "Consolas,monospace"); label.setAttribute("text-anchor", "end");
    label.textContent = it[labelKey];
    svg.appendChild(label);

    const val = document.createElementNS(ns, "text");
    val.setAttribute("x", v >= 0 ? midX + w + 6 : midX - w - 6);
    val.setAttribute("y", y + h * 0.72);
    val.setAttribute("fill", v >= 0 ? colorPos : colorNeg);
    val.setAttribute("font-size", "10"); val.setAttribute("font-family", "Consolas,monospace");
    val.setAttribute("text-anchor", v >= 0 ? "start" : "end");
    val.textContent = fmtUsd(v);
    svg.appendChild(val);
  });
}

function renderPairChart(pairPerf){
  const items = Object.entries(pairPerf || {}).map(([symbol, v]) => ({ symbol, pnl: v.pnl }));
  items.sort((a, b) => b.pnl - a.pnl);
  renderBarChart("pairChart", items, "symbol", "pnl", "#3dffb0", "#ff4f6d", "Henüz parite verisi yok");
}

function renderStratChart(strategies){
  const items = (strategies || []).map(s => ({ code: s.code, pnl: s.pnl }));
  renderBarChart("stratChart", items, "code", "pnl", "#37e6ff", "#ff4fd8", "Henüz strateji verisi yok");
}

function renderTicker(market){
  const el = document.getElementById("ticker");
  if (!market || !market.length) { el.innerHTML = `<span class="tick">Piyasa verisi yok</span>`; return; }
  el.innerHTML = market.map(m => `
    <span class="tick${m.active ? " active" : ""}">
      <b>${m.pair}</b> ${Number(m.bid).toFixed(5)}
      <span class="${m.change >= 0 ? "up" : "down"}">${m.change >= 0 ? "▲" : "▼"} ${Math.abs(m.change).toFixed(2)}%</span>
      ${m.active ? " 🐝" : ""}
    </span>
  `).join("");
}

function renderTrades(recent){
  const tbody = document.querySelector("#tradesTable tbody");
  if (!recent || !recent.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:#7d93ab;">Henüz işlem yok</td></tr>`;
    return;
  }
  tbody.innerHTML = recent.map(r => `
    <tr>
      <td>${r.time}</td><td>${r.strategy}</td><td>${r.pair}</td><td>${r.dir}</td>
      <td class="${r.result === "WIN" ? "win" : "loss"}">${r.result}</td>
      <td class="${r.result === "WIN" ? "win" : "loss"}">${fmtUsd(r.pnl)}</td>
    </tr>
  `).join("");
}

function renderLogs(logs, ts){
  const el = document.getElementById("logs");
  const timeStr = ts ? new Date(ts).toLocaleTimeString("tr-TR") : "--:--";
  if (!logs || !logs.length) { el.textContent = "Kovan sessiz."; return; }
  el.innerHTML = logs.map(l => `<div class="${l.includes("✓") ? "ok" : ""}">${l.replace("{time}", timeStr)}</div>`).join("");
}

async function load(){
  try {
    const res = await fetch(`performance_data.json?v=${Date.now()}`, { cache: "no-store" });
    const data = await res.json();
    renderHero(data);
    renderHeroMini(data.daily);
    renderUpdated(data);
    renderStats(data);
    renderDailyChart(data.daily);
    renderPairChart(data.pair_performance);
    renderStratChart(data.veteran_strategies);
    renderWinDonut(data.recent_trades, data.veteran_strategies);
    renderStatusGrid(data);
    renderTicker(data.market);
    renderTrades(data.recent_trades);
    renderLogs(data.terminal_logs, data.last_updated);
    if (data.disclaimer) document.getElementById("disclaimer").textContent = data.disclaimer;
  } catch (e) {
    document.getElementById("lastUpdated").textContent = "veri okunamadı";
  }
}

renderCouncil();
animateQueenChart();
animateQueenReadout();
renderNetworkMap();
drawSignalNet();
load();
setInterval(load, 5 * 60 * 1000); // veri saatte 1 yenilense de, tarayıcı 5 dk'da bir kontrol eder
