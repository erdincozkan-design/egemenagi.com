/* egemenagi.com — Kovan app.js (2126 komuta merkezi)
   Bakiye/equity/günlük geçmiş/parite/strateji/işlem verisi GERÇEK
   (performance_data.json, 44_web_sync_engine.py tarafından üretilir).
   Arı ekranları + sinyal ağı + kraliçe grafiği tamamen GÖRSEL ŞOV —
   yöntem/parametre/karar mekanizması ifşa ETMEZ.
*/

const BEES = [
  { key: "aggressor", name: "AggressorBee", color: "#ef4444",
    role: "Agresif kâr uzmanı", neurons: "166,700",
    lines: ["Momentum taranıyor…", "Fırsat penceresi ölçülüyor…", "Zarar → fırsat değerlendiriliyor…"] },
  { key: "defender", name: "DefenderBee", color: "#3b82f6",
    role: "Risk yönetimi · veto yetkisi", neurons: "142,300",
    lines: ["Teminat seviyesi izleniyor…", "Risk sınırları kontrol ediliyor…", "Kovan güvenliği doğrulanıyor…"] },
  { key: "ranger", name: "RangerBee", color: "#10b981",
    role: "Kurtarma (recovery) uzmanı", neurons: "158,900",
    lines: ["Zarardaki hatlar izleniyor…", "Kurtarma fırsatı taranıyor…", "Destek hattı hesaplanıyor…"] },
  { key: "analyst", name: "AnalystBee", color: "#f59e0b",
    role: "Piyasa / rejim analisti", neurons: "171,200",
    lines: ["Piyasa rejimi okunuyor…", "Volatilite ölçülüyor…", "Trend gücü değerlendiriliyor…"] },
  { key: "veteran", name: "VeteranBee", color: "#8b5cf6",
    role: "Strateji değerlendirmeci", neurons: "149,600",
    lines: ["Strateji geçmişi taranıyor…", "Güven skoru güncelleniyor…", "Tecrübeli hatlar öne çıkarılıyor…"] },
  { key: "sniper", name: "SniperBee", color: "#06b6d4",
    role: "Hassas giriş uzmanı", neurons: "163,400",
    lines: ["Destek/direnç ölçülüyor…", "Giriş penceresi bekleniyor…", "Risk/ödül oranı hesaplanıyor…"] },
  { key: "pyramid", name: "PyramidBee", color: "#f97316",
    role: "Piramit & ölçekleme uzmanı", neurons: "154,800",
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
    <div class="bee-card ws-card" data-key="${b.key}" style="--bee-color:${b.color};">
      <div class="bee-name">${b.name}</div>
      <div class="bee-role">${b.role}</div>

      <!-- Arı, insan gibi bilgisayar masasında; 4 ekranlı düzeneğe bakıp
           fikirlerini kraliçeye gönderiyor. Kutu/çerçeve yok — sahne açık. -->
      <div class="ws-scene">
        <div class="ws-bee-figure">
          <div class="ws-brain-glow"><span class="ws-brain-pulse"></span></div>
          <svg viewBox="0 0 90 100" class="bee-profile-svg">
            <ellipse class="ws-wing" cx="24" cy="47" rx="15" ry="9" fill="#dfe7f5" opacity="0.3" transform="rotate(-18 24 47)"/>
            <line x1="32" y1="88" x2="26" y2="98" stroke="#0a0e1a" stroke-width="3" stroke-linecap="round"/>
            <line x1="42" y1="90" x2="42" y2="99" stroke="#0a0e1a" stroke-width="3" stroke-linecap="round"/>
            <line x1="52" y1="88" x2="58" y2="98" stroke="#0a0e1a" stroke-width="3" stroke-linecap="round"/>
            <rect x="24" y="45" width="32" height="46" rx="15" fill="${b.color}"/>
            <rect x="24" y="58" width="32" height="6" fill="#0a0e1a"/>
            <rect x="24" y="72" width="32" height="6" fill="#0a0e1a"/>
            <circle cx="46" cy="33" r="15" fill="#0a0e1a"/>
            <path d="M50 20 Q58 10 64 14" stroke="${b.color}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M46 19 Q50 8 57 6" stroke="${b.color}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="53" cy="31" r="4" fill="${b.color}"/>
            <circle cx="54.3" cy="29.7" r="1.3" fill="#fff"/>
          </svg>
        </div>
        <div class="ws-desk">
          <div class="ws-monitors-4">
            <div class="ws-mon"><span class="mon-tag">${PAIRS6[i % PAIRS6.length].replace("/", "")}</span><canvas id="chart-${b.key}" width="120" height="66"></canvas></div>
            <div class="ws-mon"><span class="mon-tag">TREND</span><canvas id="line-${b.key}" width="120" height="66"></canvas></div>
            <div class="ws-mon mon-heat" id="heat-${b.key}"></div>
            <div class="ws-mon ws-mon-readout" id="mread-${b.key}"></div>
          </div>
          <div class="ws-desk-bar"></div>
        </div>
      </div>
      <div class="ws-pair" style="color:${b.color}">${PAIRS6[i % PAIRS6.length]}</div>

      <div class="bee-sync" id="sync-${b.key}">◉ FİKİRLERİNİ KRALİÇE ARI'YA GÖNDERİYOR</div>
      <div class="neuro-strip" id="neuro-${b.key}"></div>
      <div class="bee-neurons"><b>${b.neurons}</b> <small>neurons</small></div>
      <div class="bee-readout" id="readout-${b.key}">
        <div><span class="rlbl">spk/s</span><b>—</b></div>
        <div><span class="rlbl">syn</span><b>—</b></div>
        <div><span class="rlbl">dec</span><b>—</b></div>
      </div>
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
    animateBeeCandles(`chart-${b.key}`, 900 + i * 130);
    animateMiniLine(`line-${b.key}`, b.color, 400 + i * 90);
    renderMiniHeat(`heat-${b.key}`, b.color);
    renderMiniReadoutScreen(`mread-${b.key}`, b.color, i);
    renderNeuroStrip(`neuro-${b.key}`);
    animateBeeReadout(`readout-${b.key}`, i);
  });
}

/* Küçük trend çizgisi — ikinci "analiz ekranı". Dekoratif. */
function animateMiniLine(canvasId, color, seed){
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  let pts = Array.from({ length: 30 }, (_, i) => H / 2 + Math.sin((i + seed) * 0.35) * H * 0.28);
  function step(){
    pts.shift();
    const last = pts[pts.length - 1];
    let next = last + (Math.random() - 0.5) * H * 0.28;
    next = Math.max(3, Math.min(H - 3, next));
    pts.push(next);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 18) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + "55"); grad.addColorStop(1, color + "00");
    ctx.beginPath();
    pts.forEach((p, i) => { const x = (i / (pts.length - 1)) * W; i === 0 ? ctx.moveTo(x, p) : ctx.lineTo(x, p); });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => { const x = (i / (pts.length - 1)) * W; i === 0 ? ctx.moveTo(x, p) : ctx.lineTo(x, p); });
    ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.stroke();
    setTimeout(() => requestAnimationFrame(step), 280);
  }
  step();
}

/* Küçük nöron bulutu — ajanın "beyni", kraliçeyle aynı görsel dilde. Dekoratif. */
function animateMiniBrain(canvasId, color, count){
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
  const dots = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * Math.min(W, H) * 0.42 * Math.sqrt(Math.random());
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.85, phase: Math.random() * Math.PI * 2 };
  });
  let t = Math.random() * 10;
  function frame(){
    t += 0.06;
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      const glow = 0.3 + 0.55 * Math.abs(Math.sin(t + d.phase));
      ctx.fillStyle = color; ctx.globalAlpha = glow;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  frame();
}

/* Küçük gauge çifti — ekranlardan biri. Dekoratif. */
function renderMiniGauges(elId, color){
  const el = document.getElementById(elId);
  if (!el) return;
  function tick(){
    const a = 20 + Math.random() * 75, b = 20 + Math.random() * 75;
    el.innerHTML = `
      <span class="mon-tag">METRİK</span>
      <div class="mini-gauge"><div class="mg-track"><div class="mg-fill" style="width:${a.toFixed(0)}%;background:${color}"></div></div></div>
      <div class="mini-gauge"><div class="mg-track"><div class="mg-fill" style="width:${b.toFixed(0)}%;background:${color}"></div></div></div>
      <div class="mini-gauge"><div class="mg-track"><div class="mg-fill" style="width:${(100 - a).toFixed(0)}%;background:${color}"></div></div></div>`;
  }
  tick();
  setInterval(tick, 2000 + Math.random() * 800);
}

/* 4. ekran — küçük "terminal" okunumu: dönen sayılar. Dekoratif. */
function renderMiniReadoutScreen(elId, color, seed){
  const el = document.getElementById(elId);
  if (!el) return;
  function tick(){
    const conf = (55 + Math.random() * 44).toFixed(0);
    const lat = (4 + Math.random() * 9).toFixed(0);
    el.innerHTML = `<span class="mon-tag">ANALİZ</span>
      <div class="mread-line" style="color:${color}">GÜVEN <b>%${conf}</b></div>
      <div class="mread-line" style="color:${color}">GECİKME <b>${lat}ms</b></div>
      <div class="mread-line mread-blink" style="color:${color}">▮ İŞLENİYOR</div>`;
  }
  tick();
  setInterval(tick, 1700 + seed * 60);
}

/* Küçük ısı ızgarası — ekranlardan biri. Dekoratif. */
function renderMiniHeat(elId, color){
  const el = document.getElementById(elId);
  if (!el) return;
  function tick(){
    const cells = Array.from({ length: 18 }, () => Math.random());
    el.innerHTML = `<span class="mon-tag">ISI</span><div class="heat-grid">` +
      cells.map(v => `<span class="heat-cell" style="background:${color};opacity:${(0.12 + v * 0.75).toFixed(2)}"></span>`).join("") +
      `</div>`;
  }
  tick();
  setInterval(tick, 1500);
}

/* Stonkfly-tarzı nöron ateşleme şeridi — yanıp sönen noktalar, tamamen dekoratif. */
function renderNeuroStrip(elId){
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = Array.from({ length: 8 }, (_, i) =>
    `<span class="neuro-dot" style="animation-delay:${(i * 0.11).toFixed(2)}s"></span>`
  ).join("");
}

/* Ajan okunumu: spikes/s + synapses + BUY/SELL/WAIT-tarzı "karar" göstergesi. Dekoratif. */
function animateBeeReadout(elId, seed){
  const el = document.getElementById(elId);
  if (!el) return;
  const decisions = [
    { v: "WAIT", cls: "" }, { v: "SCAN", cls: "" },
    { v: "BUY", cls: "dec-buy" }, { v: "SELL", cls: "dec-sell" }, { v: "HOLD", cls: "" },
  ];
  function tick(){
    const spk = (8 + Math.random() * 34).toFixed(1);
    const syn = (18 + Math.random() * 9).toFixed(1);
    const dec = decisions[Math.floor(Math.random() * decisions.length)];
    el.innerHTML = `
      <div><span class="rlbl">spk/s</span><b>${spk}k</b></div>
      <div><span class="rlbl">syn</span><b>${syn}M</b></div>
      <div><span class="rlbl">dec</span><b class="${dec.cls}">${dec.v}</b></div>`;
  }
  tick();
  setInterval(tick, 1800 + seed * 90);
}

/* Kraliçenin çevresinde 7 ajanı eşit açıyla dairesel yerleştirir. */
function positionOrbit(){
  const orbit = document.getElementById("orbit");
  if (!orbit) return;
  if (window.innerWidth <= 760) {
    // Mobilde CSS akışkan (grid) düzeni devrede — JS konumlandırma gerekmez.
    BEES.forEach(b => {
      const card = document.querySelector(`.bee-card[data-key="${b.key}"]`);
      if (card) { card.style.left = ""; card.style.top = ""; }
    });
    return;
  }
  const w = orbit.clientWidth, h = orbit.clientHeight;
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(w, h) / 2 - 165;
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

/* Kraliçenin "kararı" — BUY/SELL/WAIT, komuta ekranının üstünde büyük rozet. Dekoratif. */
function animateQueenDecision(){
  const el = document.getElementById("queenDecision");
  if (!el) return;
  const options = [
    { v: "BUY", cls: "buy" },
    { v: "SELL", cls: "sell" },
    { v: "WAIT", cls: "wait" },
  ];
  function tick(){
    const pick = options[Math.floor(Math.random() * options.length)];
    el.textContent = pick.v;
    el.className = `queen-decision ${pick.cls}`;
  }
  tick();
  setInterval(tick, 2600);
}

/* Her arının önündeki forex terminal ekranı — kraliçeninkiyle aynı dilde
   küçük mum grafiği. Tamamen dekoratif sanal veri, gerçek fiyat değil. */
function animateBeeCandles(canvasId, seed){
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  let candles = [];
  let price = H * 0.5;
  for (let i = 0; i < 22; i++) {
    const open = price;
    price += (Math.sin((i + seed) * 0.6) + (Math.random() - 0.5)) * H * 0.05;
    price = Math.max(H * 0.12, Math.min(H * 0.88, price));
    const close = price;
    const high = Math.max(open, close) - Math.random() * H * 0.05;
    const low = Math.min(open, close) + Math.random() * H * 0.05;
    candles.push({ open, close, high, low });
  }
  function step(){
    candles.shift();
    const open = candles[candles.length - 1].close;
    let close = open + (Math.random() - 0.48) * H * 0.09;
    close = Math.max(H * 0.1, Math.min(H * 0.9, close));
    const high = Math.min(open, close) - Math.random() * H * 0.04;
    const low = Math.max(open, close) + Math.random() * H * 0.04;
    candles.push({ open, close, high: Math.max(0, high), low: Math.min(H, low) });

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(16,185,129,0.08)"; ctx.lineWidth = 1;
    for (let gy = 0; gy < H; gy += 16) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    const cw = W / candles.length;
    candles.forEach((c, i) => {
      const x = i * cw + cw / 2;
      const up = c.close <= c.open;
      const col = up ? "#10b981" : "#ef4444";
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, c.high); ctx.lineTo(x, c.low); ctx.stroke();
      const bodyTop = Math.min(c.open, c.close), bodyH = Math.max(1, Math.abs(c.close - c.open));
      ctx.fillRect(x - cw * 0.34, bodyTop, cw * 0.68, bodyH);
    });
    setTimeout(() => requestAnimationFrame(step), 300);
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

/* ============ 01 KOMUTA MASASI — gauge çubukları (dekoratif) + gerçek equity/günlük ============ */
function renderDeskGauges(){
  const el = document.getElementById("deskGauges");
  if (!el) return;
  const gauges = [
    { key: "conf", label: "Güven" },
    { key: "risk", label: "Risk İştahı" },
    { key: "reac", label: "Reaksiyon" },
  ];
  function tick(){
    el.innerHTML = gauges.map(g => {
      const pct = 30 + Math.random() * 65;
      return `<div class="gauge"><span class="glabel">${g.label}</span>
        <span class="gtrack"><span class="gfill" style="width:${pct.toFixed(0)}%"></span></span>
        <span class="gval">${pct.toFixed(0)}%</span></div>`;
    }).join("");
  }
  tick();
  setInterval(tick, 2400);
}
function renderDeskStats(data){
  const a = data.account || {};
  const eqEl = document.getElementById("deskEquity");
  const dEl = document.getElementById("deskDaily");
  if (eqEl) eqEl.textContent = `$${(a.equity ?? 0).toFixed(2)}`;
  if (dEl) { dEl.textContent = fmtUsd(a.daily_pnl); dEl.style.color = Number(a.daily_pnl) >= 0 ? "var(--emerald)" : "var(--red)"; }
}

/* ============ 04 NÖRAL AKTİVİTE — beyin bulutu canvası (tamamen dekoratif) ============ */
function animateBrainCloud(){
  const cv = document.getElementById("brainCanvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2;
  const dots = Array.from({ length: 140 }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * Math.min(W, H) * 0.42 * Math.sqrt(Math.random());
    return { x: cx + Math.cos(a) * r * 1.15, y: cy + Math.sin(a) * r * 0.85, phase: Math.random() * Math.PI * 2 };
  });
  let t = 0;
  function frame(){
    t += 0.05;
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      const glow = 0.35 + 0.5 * Math.abs(Math.sin(t + d.phase));
      ctx.fillStyle = `rgba(16,185,129,${glow.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
}
function animateBrainStats(){
  const syn = document.getElementById("brSyn"), spiking = document.getElementById("brSpiking");
  const spikes = document.getElementById("brSpikes"), lat = document.getElementById("brLat");
  if (!syn) return;
  function tick(){
    syn.textContent = (24 + Math.random() * 3).toFixed(1) + "M";
    spiking.textContent = Math.floor(140 + Math.random() * 90);
    spikes.textContent = Math.floor(560 + Math.random() * 220).toLocaleString("tr-TR");
    lat.textContent = (6 + Math.random() * 6).toFixed(0) + " ms";
  }
  tick();
  setInterval(tick, 1500);
}

/* ============ 02 PARİTE DEFTERİ — GERÇEK piyasa verisi, tablo görünümü ============ */
function renderOrderBook(market){
  const tbody = document.querySelector("#orderBook tbody");
  if (!tbody) return;
  if (!market || !market.length) { tbody.innerHTML = `<tr><td colspan="4" style="color:var(--text-faint);">veri yok</td></tr>`; return; }
  const top = market.slice(0, 8);
  tbody.innerHTML = top.map(m => `
    <tr class="${m.active ? "active" : ""}">
      <td>${m.pair}</td>
      <td>${Number(m.bid).toFixed(5)}</td>
      <td>${m.spread}</td>
      <td class="${m.change >= 0 ? "up" : "down"}">${m.change >= 0 ? "+" : ""}${m.change}%</td>
    </tr>
  `).join("");
}

/* ============ 03 İŞLEM AKIŞI — GERÇEK son işlemler ============ */
function renderOrderFlow(recent){
  const tbody = document.querySelector("#orderFlow tbody");
  if (!tbody) return;
  if (!recent || !recent.length) { tbody.innerHTML = `<tr><td style="color:var(--text-faint);">henüz işlem yok</td></tr>`; return; }
  tbody.innerHTML = recent.slice(0, 9).map(r => `
    <tr>
      <td style="color:var(--text-faint);">${r.time}</td>
      <td>${r.pair}</td>
      <td>${r.dir}</td>
      <td class="${r.result === "WIN" ? "win" : "loss"}">${fmtUsd(r.pnl)}</td>
    </tr>
  `).join("");
}

/* ============ 05 mini bakiye grafiği — GERÇEK, aralık butonlu ============ */
let __dailyFull = [];
function renderMiniHistChart(daily, days){
  const svg = document.getElementById("miniHistChart");
  if (!svg) return;
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  svg.innerHTML = "";
  const slice = days ? daily.slice(-days) : daily;
  if (!slice || !slice.length) { emptyState("miniHistChart", "veri yok"); return; }
  const vals = slice.map(d => Number(d.balance) || 0);
  const min = Math.min(...vals, 0), max = Math.max(...vals, 1);
  const range = (max - min) || 1;
  const pad = { l: 6, r: 6, t: 6, b: 6 };
  const stepX = (W - pad.l - pad.r) / Math.max(slice.length - 1, 1);
  const x = i => pad.l + i * stepX;
  const y = v => H - pad.b - ((v - min) / range) * (H - pad.t - pad.b);
  const path = slice.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.balance).toFixed(1)}`).join(" ");
  const ns = "http://www.w3.org/2000/svg";
  const line = document.createElementNS(ns, "path");
  line.setAttribute("d", path); line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#f59e0b"); line.setAttribute("stroke-width", "2");
  svg.appendChild(line);
}
function renderRangeBtns(){
  const el = document.getElementById("rangeBtns");
  if (!el) return;
  const opts = [["7g", 7], ["30g", 30], ["Tümü", null]];
  el.innerHTML = opts.map(([lbl, n], i) => `<button data-n="${n ?? ""}" class="${i === 2 ? "on" : ""}">${lbl}</button>`).join("");
  el.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      el.querySelectorAll("button").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      const n = btn.dataset.n ? Number(btn.dataset.n) : null;
      renderMiniHistChart(__dailyFull, n);
    });
  });
}

/* ============ 06 NÖRAL DALGA FORMLARI — dekoratif sparkline seti ============ */
function renderWaves(){
  const el = document.getElementById("wavesBody");
  if (!el) return;
  const rows = [
    { key: "sensory", label: "Duyusal Girdi", color: "#06b6d4" },
    { key: "burst", label: "Ateşleme Patlaması", color: "#f59e0b" },
    { key: "mbon", label: "MBON Zarfı", color: "#8b5cf6" },
  ];
  el.innerHTML = rows.map(r => `
    <div class="wave-row"><div class="wlbl">${r.label}</div><canvas id="wave-${r.key}" width="500" height="28"></canvas></div>
  `).join("");
  rows.forEach((r, i) => animateWave(`wave-${r.key}`, r.color, i));
}
function animateWave(id, color, seed){
  const cv = document.getElementById(id);
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  let pts = Array.from({ length: 60 }, (_, i) => H / 2 + Math.sin((i + seed * 10) * 0.3) * H * 0.3);
  function step(){
    pts.shift();
    const last = pts[pts.length - 1];
    let next = last + (Math.random() - 0.5) * H * 0.35;
    next = Math.max(2, Math.min(H - 2, next));
    pts.push(next);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = color; ctx.lineWidth = 1.3; ctx.beginPath();
    pts.forEach((p, i) => { const x = (i / (pts.length - 1)) * W; i === 0 ? ctx.moveTo(x, p) : ctx.lineTo(x, p); });
    ctx.stroke();
    setTimeout(() => requestAnimationFrame(step), 90);
  }
  step();
}

/* ============ 07 HABER AKIŞI — GERÇEK terminal_logs, newswire biçiminde ============ */
function renderNewswire(logs, ts){
  const el = document.getElementById("newswireBody");
  if (!el) return;
  const timeStr = ts ? new Date(ts).toLocaleTimeString("tr-TR") : "--:--";
  if (!logs || !logs.length) { el.innerHTML = `<div style="color:var(--text-faint);font-size:11px;">kovan sessiz</div>`; return; }
  el.innerHTML = logs.map(l => {
    const clean = l.replace("{time}", timeStr);
    const m = clean.match(/^\[(.*?)\]\s*([A-Z]+)\s*\|\s*(.*)$/);
    const tag = m ? m[2] : "SYS";
    const txt = m ? m[3] : clean;
    return `<div class="newswire-row"><span class="nw-tag">${tag}</span><span class="nw-txt">${txt}</span></div>`;
  }).join("");
}

/* ============ KAYAN SİNYAL ŞERİDİ — tamamen dekoratif şov ============ */
const WALL_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "AUDJPY", "EURCHF", "GBPCHF",
  "EURAUD", "GBPAUD", "EURNZD", "GBPNZD", "AUDCAD", "NZDJPY", "CADJPY", "AUDNZD",
];
function renderMarquee(){
  const el = document.getElementById("marqueeTrack");
  if (!el) return;
  function item(){
    const pair = WALL_PAIRS[Math.floor(Math.random() * WALL_PAIRS.length)];
    const buy = Math.random() > 0.5;
    const pips = (Math.random() * 30).toFixed(1);
    return `<span class="marquee-item"><b>${pair}</b>
      <span class="${buy ? "sig-buy" : "sig-sell"}">${buy ? "▲ BUY" : "▼ SELL"}</span>
      <span class="${buy ? "pip-up" : "pip-down"}">${buy ? "+" : "-"}${pips}p</span></span>`;
  }
  const items = Array.from({ length: 24 }, item);
  el.innerHTML = items.join("") + items.join(""); // döngü kesintisiz olsun diye ikiye katla
}

/* ============ SİNYAL DUVARI — çok sayıda küçük dekoratif ekran ============ */
function renderSignalWall(){
  const el = document.getElementById("signalWall");
  if (!el) return;
  function cellHtml(pair){
    const price = (0.6 + Math.random() * 1.0).toFixed(4);
    const buy = Math.random() > 0.5;
    return `<div class="sig-cell" data-p="${pair}">
      <div class="sc-pair">${pair}</div>
      <div class="sc-price">${price}</div>
      <div class="sc-badge ${buy ? "buy" : "sell"}">${buy ? "BUY" : "SELL"}</div>
    </div>`;
  }
  el.innerHTML = WALL_PAIRS.map(cellHtml).join("");
  setInterval(() => {
    const cells = el.querySelectorAll(".sig-cell");
    // her turda birkaç hücreyi tazele (hepsini değil) — daha canlı, performanslı
    for (let i = 0; i < 4; i++) {
      const c = cells[Math.floor(Math.random() * cells.length)];
      if (!c) continue;
      const pair = c.dataset.p;
      c.outerHTML = cellHtml(pair);
    }
  }, 1200);
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
    renderDeskStats(data);
    renderDailyChart(data.daily);
    renderPairChart(data.pair_performance);
    renderStratChart(data.veteran_strategies);
    renderWinDonut(data.recent_trades, data.veteran_strategies);
    renderStatusGrid(data);
    renderTicker(data.market);
    renderOrderBook(data.market);
    renderOrderFlow(data.recent_trades);
    renderNewswire(data.terminal_logs, data.last_updated);
    __dailyFull = data.daily || [];
    renderMiniHistChart(__dailyFull, null);
    if (data.disclaimer) document.getElementById("disclaimer").textContent = data.disclaimer;
  } catch (e) {
    document.getElementById("lastUpdated").textContent = "veri okunamadı";
  }
}

renderCouncil();
animateQueenChart();
animateMiniLine("qline1", "#8b5cf6", 12);
animateMiniLine("qline2", "#06b6d4", 55);
renderMiniHeat("qheat", "#8b5cf6");
animateQueenReadout();
animateQueenDecision();
renderNetworkMap();
drawSignalNet();
renderDeskGauges();
animateBrainCloud();
animateBrainStats();
renderWaves();
renderRangeBtns();
renderMarquee();
renderSignalWall();
load();
setInterval(load, 5 * 60 * 1000); // veri saatte 1 yenilense de, tarayıcı 5 dk'da bir kontrol eder
