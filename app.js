/* egemenagi.com — Kovan app.js
   7 Arı Konseyi + Kraliçe Arı görsel şovu. Bakiye/performans GERÇEK
   (performance_data.json'dan, 44_web_sync_engine.py tarafından üretilir).
   Arıların altındaki "analiz" başlıkları ise SABİT/döngülü GÖSTERİM
   metinleridir — yöntem, parametre veya karar mekanizması İFŞA ETMEZ.
*/

const BEES = [
  { key: "aggressor", name: "AggressorBee", emoji: "🔴", color: "#ff5d5d",
    role: "Agresif kâr uzmanı",
    lines: ["Momentum taranıyor…", "Fırsat penceresi ölçülüyor…", "Zarar → fırsat değerlendiriliyor…"] },
  { key: "defender", name: "DefenderBee", emoji: "🔵", color: "#5da8ff",
    role: "Risk yönetimi · veto yetkisi",
    lines: ["Teminat seviyesi izleniyor…", "Risk sınırları kontrol ediliyor…", "Kovan güvenliği doğrulanıyor…"] },
  { key: "ranger", name: "RangerBee", emoji: "🟢", color: "#4fd67a",
    role: "Kurtarma (recovery) uzmanı",
    lines: ["Zarardaki hatlar izleniyor…", "Kurtarma fırsatı taranıyor…", "Destek hattı hesaplanıyor…"] },
  { key: "analyst", name: "AnalystBee", emoji: "🟡", color: "#ffd24f",
    role: "Piyasa / rejim analisti",
    lines: ["Piyasa rejimi okunuyor…", "Volatilite ölçülüyor…", "Trend gücü değerlendiriliyor…"] },
  { key: "veteran", name: "VeteranBee", emoji: "🟣", color: "#c98bff",
    role: "Strateji değerlendirmeci",
    lines: ["Strateji geçmişi taranıyor…", "Güven skoru güncelleniyor…", "Tecrübeli hatlar öne çıkarılıyor…"] },
  { key: "sniper", name: "SniperBee", emoji: "🟤", color: "#c99a5b",
    role: "Hassas giriş uzmanı",
    lines: ["Destek/direnç ölçülüyor…", "Giriş penceresi bekleniyor…", "Risk/ödül oranı hesaplanıyor…"] },
  { key: "pyramid", name: "PyramidBee", emoji: "🟠", color: "#ff9d4f",
    role: "Piramit & ölçekleme uzmanı",
    lines: ["Kârdaki hatlar izleniyor…", "Ölçekleme fırsatı değerlendiriliyor…", "Kovan limiti kontrol ediliyor…"] },
];

function fmtUsd(v){
  const n = Number(v) || 0;
  const sign = n > 0 ? "+" : "";
  return `${sign}$${n.toFixed(2)}`;
}
function cls(v){ return Number(v) > 0 ? "pos" : (Number(v) < 0 ? "neg" : ""); }

function renderCouncil(){
  const el = document.getElementById("council");
  el.innerHTML = BEES.map(b => `
    <div class="bee-card" data-key="${b.key}">
      <div class="bee-icon">
        <svg viewBox="0 0 100 100">
          <ellipse class="bee-wing left" cx="28" cy="40" rx="20" ry="11" fill="#fff6e0" opacity="0.85"/>
          <ellipse class="bee-wing right" cx="72" cy="40" rx="20" ry="11" fill="#fff6e0" opacity="0.85"/>
          <ellipse cx="50" cy="58" rx="24" ry="28" fill="${b.color}"/>
          <rect x="27" y="46" width="46" height="8" fill="#1b1406"/>
          <rect x="27" y="62" width="46" height="8" fill="#1b1406"/>
          <rect x="27" y="76" width="46" height="7" fill="#1b1406"/>
          <circle cx="50" cy="28" r="14" fill="#2a1c08"/>
          <circle cx="45" cy="26" r="2.1" fill="#fff"/>
          <circle cx="55" cy="26" r="2.1" fill="#fff"/>
        </svg>
      </div>
      <div class="bee-name">${b.emoji} ${b.name}</div>
      <div class="bee-role">${b.role}</div>
      <div class="bee-caption" id="cap-${b.key}">${b.lines[0]}</div>
    </div>
  `).join("");

  // Her arı kendi hızında, döngülü olarak "analiz" cümlesini değiştirir.
  BEES.forEach((b, i) => {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % b.lines.length;
      const capEl = document.getElementById(`cap-${b.key}`);
      if (!capEl) return;
      capEl.style.animation = "none";
      // reflow ile animasyonu yeniden tetikle
      void capEl.offsetWidth;
      capEl.style.animation = "";
      capEl.textContent = b.lines[idx];
    }, 3200 + i * 450);
  });
}

function renderStats(data){
  const a = data.account || {};
  document.getElementById("sBalance").textContent = `$${(a.balance ?? 0).toFixed(2)}`;
  document.getElementById("sEquity").textContent = `$${(a.equity ?? 0).toFixed(2)}`;

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

function renderDailyChart(daily){
  const svg = document.getElementById("dailyChart");
  const W = svg.width.baseVal.value, H = svg.height.baseVal.value;
  const pad = { l: 55, r: 20, t: 16, b: 30 };
  svg.innerHTML = "";
  if (!daily || !daily.length) {
    svg.innerHTML = `<text x="${W/2}" y="${H/2}" fill="#b9a97e" font-size="13" text-anchor="middle">Henüz günlük veri yok</text>`;
    return;
  }
  const vals = daily.map(d => Number(d.balance) || 0);
  const min = Math.min(...vals, 0), max = Math.max(...vals, 1);
  const range = (max - min) || 1;
  const stepX = (W - pad.l - pad.r) / Math.max(daily.length - 1, 1);
  const x = i => pad.l + i * stepX;
  const y = v => H - pad.b - ((v - min) / range) * (H - pad.t - pad.b);

  let path = daily.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.balance).toFixed(1)}`).join(" ");
  const areaPath = `${path} L${x(daily.length-1).toFixed(1)},${(H-pad.b).toFixed(1)} L${x(0).toFixed(1)},${(H-pad.b).toFixed(1)} Z`;

  const ns = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(ns, "g");

  // grid + y labels
  for (let i = 0; i <= 4; i++) {
    const gv = min + (range * i / 4);
    const gy = y(gv);
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", pad.l); line.setAttribute("x2", W - pad.r);
    line.setAttribute("y1", gy); line.setAttribute("y2", gy);
    line.setAttribute("stroke", "#3a2a0f"); line.setAttribute("stroke-dasharray", "3,4");
    g.appendChild(line);
    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", pad.l - 8); label.setAttribute("y", gy + 4);
    label.setAttribute("fill", "#b9a97e"); label.setAttribute("font-size", "10");
    label.setAttribute("text-anchor", "end");
    label.textContent = `$${gv.toFixed(0)}`;
    g.appendChild(label);
  }

  const area = document.createElementNS(ns, "path");
  area.setAttribute("d", areaPath); area.setAttribute("fill", "rgba(255,176,32,0.12)");
  g.appendChild(area);

  const line = document.createElementNS(ns, "path");
  line.setAttribute("d", path); line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#ffb020"); line.setAttribute("stroke-width", "2.2");
  g.appendChild(line);

  daily.forEach((d, i) => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x(i)); c.setAttribute("cy", y(d.balance));
    c.setAttribute("r", "3"); c.setAttribute("fill", "#ffb020");
    const title = document.createElementNS(ns, "title");
    title.textContent = `${d.date}: $${Number(d.balance).toFixed(2)} (net ${fmtUsd(d.net)})`;
    c.appendChild(title);
    g.appendChild(c);

    if (i % Math.ceil(daily.length / 8 || 1) === 0) {
      const lbl = document.createElementNS(ns, "text");
      lbl.setAttribute("x", x(i)); lbl.setAttribute("y", H - 8);
      lbl.setAttribute("fill", "#b9a97e"); lbl.setAttribute("font-size", "9.5");
      lbl.setAttribute("text-anchor", "middle");
      lbl.textContent = d.date.slice(5);
      g.appendChild(lbl);
    }
  });

  svg.appendChild(g);
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
    tbody.innerHTML = `<tr><td colspan="6" style="color:#b9a97e;">Henüz işlem yok</td></tr>`;
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

/* Kraliçenin önündeki "sanal grafik" — tamamen dekoratif, gerçek veri değil. */
function animateQueenChart(){
  const cv = document.getElementById("queenChart");
  const ctx = cv.getContext("2d");
  let points = Array.from({length: 40}, () => 60 + Math.random() * 20);
  function step(){
    points.shift();
    const last = points[points.length - 1];
    points.push(Math.max(10, Math.min(130, last + (Math.random() - 0.48) * 10)));
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#ff5fae"; ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * cv.width;
      const y = cv.height - p;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    requestAnimationFrame(() => setTimeout(step, 220));
  }
  step();
}

async function load(){
  try {
    const res = await fetch(`performance_data.json?v=${Date.now()}`, { cache: "no-store" });
    const data = await res.json();
    renderUpdated(data);
    renderStats(data);
    renderDailyChart(data.daily);
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
load();
setInterval(load, 5 * 60 * 1000); // veri saatte 1 yenilense de, tarayıcı 5 dk'da bir kontrol eder
