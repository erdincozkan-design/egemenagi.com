/* ═══════════════════════════════════════════════════════════════
   EGEMENAGI.com — App Logic
   ═══════════════════════════════════════════════════════════════ */

let DATA = null;

// ─── DATA LOADING ───
const REFRESH_MS = 5 * 60 * 1000;

async function loadData(isRefresh) {
    try {
        // cache-buster: GitHub Pages/CDN bayat kopya vermesin
        const res = await fetch('performance_data.json?t=' + Date.now(), { cache: 'no-store' });
        const next = await res.json();
        if (isRefresh && DATA && next.last_updated === DATA.last_updated) return;
        DATA = next;
        if (isRefresh) renderLiveParts(); else renderAll();
    } catch (e) {
        console.error('Data load failed:', e);
    }
}

// Tazelemede SADECE veriye bagli bolumler yeniden cizilir.
// renderTerminal() bilerek DISARIDA: kendi setTimeout dongusu var, tekrar
// cagirmak ust uste binen dongular olustururdu.
function renderLiveParts() {
    renderHeroStats();
    renderTicker();
    renderRecentTrades();
    renderMarketScanner();
    renderHeatmap();
    renderVeterans();
    renderAgents();
}

function renderAll() {
    if (!DATA) return;
    renderHeroStats();
    renderTicker();
    renderTerminal();
    renderRecentTrades();
    renderMarketScanner();
    renderEquityChart();
    renderMonthlyChart();
    renderHeatmap();
    renderVeterans();
    renderAgents();
    renderModules();
}

// ─── MATRIX RAIN BACKGROUND ───
function initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'EGEMENAGI01αβγδ≡∑∏∫√∞≈≠±×÷'.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(5, 5, 8, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00d4ff';
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.globalAlpha = Math.random() * 0.5 + 0.1;
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}

// ─── HERO STATS ───
function renderHeroStats() {
    const a = DATA.account;
    
    // Balance Logic
    const balanceEl = document.getElementById('live-balance');
    const lockText = document.getElementById('balance-lock');
    const eqLock = document.getElementById('equity-lock');
    const eqContainer = document.getElementById('equity-container');
    const eqOverlay = document.getElementById('equity-overlay');
    
    // 2026-08-25: $10K maskesi KALDIRILDI — gerçek bakiye gösteriliyor.
    // Küçük bir bakiyeyi saklamak, büyük bir bakiye ima etmek demekti.
    balanceEl.textContent = '$' + a.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    balanceEl.style.color = a.equity >= a.balance ? 'var(--accent-green)' : 'var(--accent-blue)';
    if (lockText) {
        const fl = a.system_floating || 0;
        lockText.innerHTML = `🟢 LIVE ACCOUNT · Equity $${a.equity.toFixed(2)} · Floating ${fl >= 0 ? '+' : '-'}$${Math.abs(fl).toFixed(2)}`;
        lockText.style.color = 'var(--accent-green)';
    }
    if (eqLock) eqLock.style.display = 'none';
    if (eqContainer) eqContainer.style.filter = 'none';
    if (eqOverlay) eqOverlay.style.display = 'none';

    animateCounter('stat-trades', a.total_trades);
    document.getElementById('stat-winrate').textContent = a.win_rate + '%';
    animateCounter('stat-bots', a.active_bots);
    animateCounter('stat-pairs', a.pairs_traded);
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current.toLocaleString();
    }, 20);
}

// ─── TICKER BAR ───
function renderTicker() {
    const a = DATA.account;
    const items = [
        { label: 'Total Trades', value: a.total_trades.toLocaleString(), cls: '' },
        { label: 'Win Rate', value: a.win_rate + '%', cls: '' },
        { label: 'Today P&L', value: '$' + a.daily_pnl.toFixed(0), cls: a.daily_pnl >= 0 ? 'positive' : 'negative' },
        { label: 'Weekly P&L', value: '$' + a.weekly_pnl.toFixed(0), cls: a.weekly_pnl >= 0 ? 'positive' : 'negative' },
        { label: 'Monthly P&L', value: '$' + a.monthly_pnl.toFixed(0), cls: a.monthly_pnl >= 0 ? 'positive' : 'negative' },
        { label: 'Active Positions', value: a.active_positions, cls: '' },
        { label: 'Active Modules', value: a.active_bots, cls: '' },
        { label: 'Pairs', value: a.pairs_traded, cls: '' },
    ];

    const html = (items.map(i =>
        `<span class="ticker-item"><span class="label">${i.label}:</span> <span class="value ${i.cls}">${i.value}</span></span>`
    ).join('<span class="ticker-sep">│</span>') + '<span class="ticker-sep" style="margin-right:3rem">│</span>').repeat(2);

    document.getElementById('ticker-content').innerHTML = html;
}

// ─── TERMINAL LOG ───
function renderTerminal() {
    const body = document.getElementById('terminal-body');
    const logs = DATA.terminal_logs;
    let lineIndex = 0;

    function addLine() {
        const template = logs[lineIndex % logs.length];
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8);
        const text = template.replace('{time}', timeStr);

        // Parse and color the log line
        const parts = text.match(/\[([^\]]+)\]\s+(\w+)\s+\|\s+(.*)/);
        let html;
        if (parts) {
            let msg = parts[3]
                .replace(/████+/g, '<span class="censored">████</span>')
                .replace(/██/g, '<span class="censored">██</span>')
                .replace(/✓/g, '<span class="success">✓</span>')
                .replace(/(LEGENDARY|PASS|WIN)/g, '<span class="success">$1</span>')
                .replace(/(FAIL|LOSS|RED)/g, '<span class="warning">$1</span>');
            html = `<span class="timestamp">[${parts[1]}]</span> <span class="module">${parts[2]}</span> | ${msg}`;
        } else {
            html = text;
        }

        const div = document.createElement('div');
        div.className = 'log-line';
        div.innerHTML = html;
        div.style.animationDelay = '0s';
        body.appendChild(div);

        // Keep max 25 lines
        while (body.children.length > 25) {
            body.removeChild(body.firstChild);
        }
        body.scrollTop = body.scrollHeight;

        lineIndex++;
        setTimeout(addLine, 1500 + Math.random() * 2500);
    }
    addLine();
}

// ─── CLOSED TRADES ───
function renderRecentTrades() {
    const list = document.getElementById('trades-list');
    const trades = DATA.recent_trades;
    const badge = document.getElementById('update-badge');

    // Show last updated time
    if (DATA.last_updated && badge) {
        const updated = new Date(DATA.last_updated);
        const now = new Date();
        const diffMin = Math.round((now - updated) / 60000);
        let ago;
        if (diffMin < 2) ago = 'just now';
        else if (diffMin < 60) ago = `${diffMin}m ago`;
        else if (diffMin < 1440) ago = `${Math.floor(diffMin/60)}h ago`;
        else ago = `${Math.floor(diffMin/1440)}d ago`;
        badge.innerHTML = `<span class="update-icon">⏱</span> ${ago}`;
    }

    // Empty state
    if (!trades || trades.length === 0) {
        list.innerHTML = `
            <div class="trades-empty">
                <div class="empty-icon">📊</div>
                <div class="empty-text">No closed strategy trades in last 24h</div>
                <div class="empty-sub">Trades appear here after strategies close positions</div>
            </div>
        `;
        return;
    }

    // 2026-08-25: `pips` alani ARTIK YOK — gercek $ P&L gosteriliyor.
    list.innerHTML = trades.map(t => `
        <div class="trade-row">
            <span class="time">${t.time}</span>
            <span class="strategy">${t.strategy || '—'}</span>
            <span class="pair">${t.pair}</span>
            <span class="dir ${t.dir.toLowerCase()}">${t.dir}</span>
            <span class="result ${t.result.toLowerCase()}">${t.result}</span>
            <span class="pips" style="color: ${t.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}</span>
        </div>
    `).join('');
}

// ─── MARKET SCANNER (GERCEK KOTASYON) ───
// ⚠️ 2026-08-25: Bu bolum ESKIDEN TAMAMEN UYDURMAYDI. Her 150ms'de rastgele
// bir RSI uretip "→ EXECUTED" satiri yaziyordu; hicbir islem olmadan islem
// yapiliyormus goruntusu veriyordu. Ayrica sahte bir fiyat grafigi ciziyordu.
// Artik SADECE gercek veri: canli kotasyon, gunluk % degisim, spread ve
// sistemin o parite'de acik pozisyonu olup olmadigi.
function renderMarketScanner() {
    const grid = document.getElementById('scanner-grid');
    if (!grid) return;
    const market = DATA.market || [];

    if (!market.length) {
        grid.innerHTML = '<div class="trades-empty"><div class="empty-text">Market closed — no quotes available</div></div>';
        return;
    }

    grid.innerHTML = market.map(m => {
        const up = m.change >= 0;
        return `
        <div class="scanner-cell ${m.active ? 'holding' : ''}">
            <div class="sc-pair">${m.pair}${m.active ? ' <span class="sc-dot"></span>' : ''}</div>
            <div class="sc-val" style="color:${up ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${m.bid}
            </div>
            <div class="sc-tensor">${up ? '+' : ''}${m.change}% · sp ${m.spread}</div>
        </div>`;
    }).join('');

    const openCount = market.filter(m => m.active).length;
    const logs = document.getElementById('sim-logs');
    if (logs) {
        const a = DATA.account;
        const rows = [
            `Pairs monitored: ${market.length}`,
            `Pairs with open exposure: ${openCount}`,
            `Open positions: ${a.active_positions}`,
            `Floating P&L: ${(a.system_floating >= 0 ? '+' : '-')}$${Math.abs(a.system_floating || 0).toFixed(2)}`,
            `Margin level: ${a.margin_level ? a.margin_level.toFixed(0) + '%' : '—'}`,
        ];
        logs.innerHTML = rows.map(r =>
            `<div class="sim-log-line"><span class="v">${r}</span></div>`).join('');
    }
}

// ─── EQUITY CHART ───
function renderEquityChart() {
    const el = document.getElementById('equityChart');
    // ⚠️ 2026-08-25: ESKIDEN `DATA.equity_curve` idi ve SENTETIKTI:
    //   [balance*(0.8 + i*0.01) for i in 0..59]  -> her zaman duzgun yukselen
    //   sahte bir egri. Artik GERCEK gunluk bakiye kaydi (web_daily_history).
    const days = DATA.daily || [];
    if (days.length < 2) {
        el.parentElement.innerHTML =
            `<div class="trades-empty"><div class="empty-icon">📈</div>` +
            `<div class="empty-text">Balance history is still building</div>` +
            `<div class="empty-sub">${days.length} day recorded — the chart starts from day two</div></div>`;
        return;
    }
    const ctx = el.getContext('2d');
    const data = days.map(d => d.balance);
    const labels = days.map(d => d.date.slice(5));

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: '#00d4ff',
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#00d4ff',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#555570', font: { family: "'JetBrains Mono'", size: 9 }, maxTicksLimit: 8 }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: {
                        color: '#555570',
                        font: { family: "'JetBrains Mono'", size: 10 },
                        callback: v => '$' + v.toLocaleString()
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            }
        }
    });
}

// ─── MONTHLY RETURNS ───
function renderMonthlyChart() {
    const el = document.getElementById('monthlyChart');
    // ⚠️ 2026-08-25: ESKIDEN toplam karin uydurma yuzdelere (0.15/0.22/...)
    // bolunmesiydi. Artik gercek deal'lerden aylik toplam; VERI OLAN aylar.
    const months = DATA.monthly_returns || [];
    if (!months.length) {
        el.parentElement.innerHTML =
            '<div class="trades-empty"><div class="empty-icon">📊</div>' +
            '<div class="empty-text">No closed monthly data yet</div></div>';
        return;
    }
    const ctx = el.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => m.month),
            datasets: [{
                data: months.map(m => m.pnl),
                backgroundColor: months.map(m =>
                    m.pnl >= 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 51, 85, 0.6)'
                ),
                borderColor: months.map(m =>
                    m.pnl >= 0 ? '#00ff88' : '#ff3355'
                ),
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#555570', font: { family: "'JetBrains Mono'", size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: {
                        color: '#555570',
                        font: { family: "'JetBrains Mono'", size: 10 },
                        callback: v => '$' + v
                    }
                }
            }
        }
    });
}

// ─── PAIR HEATMAP ───
function renderHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    // ⚠️ 2026-08-25: ESKIDEN her sembol icin SABIT {trades:50, pnl:100} ve
    // hepsine AYNI genel isabet orani yaziliyordu. Artik parite bazli GERCEK.
    const pairs = DATA.pair_performance || {};
    if (!Object.keys(pairs).length) {
        grid.innerHTML = '<div class="trades-empty"><div class="empty-icon">🌡️</div>' +
            '<div class="empty-text">No closed trades yet</div>' +
            '<div class="empty-sub">Pairs appear here once positions start closing</div></div>';
        return;
    }

    grid.innerHTML = Object.entries(pairs).map(([pair, d]) => {
        const wr = d.winrate;
        let bg;
        if (wr >= 68) bg = 'rgba(0, 255, 136, 0.35)';
        else if (wr >= 60) bg = 'rgba(0, 255, 136, 0.18)';
        else if (wr >= 55) bg = 'rgba(255, 215, 0, 0.15)';
        else bg = 'rgba(255, 51, 85, 0.15)';

        return `
            <div class="heat-cell" style="background: ${bg}">
                <div class="pair-name">${pair}</div>
                <div class="pair-wr">${wr}% WR · ${d.trades} trades</div>
                <div class="pair-wr" style="color:${d.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${d.pnl >= 0 ? '+' : ''}$${d.pnl.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

// ─── ACTIVE STRATEGIES (GERCEK) ───
// ⚠️ 2026-08-25: Rutbe/yildiz alanlari UYDURMAYDI. Artik her sey canli
// hesaptan olculur. Strateji adi yerine KALICI takma ad (SOV-xxxx):
// ziyaretci ayni stratejiyi gunlerce izleyebilir ama hangi motor ailesinden
// geldigini goremez.
function renderVeterans() {
    const grid = document.getElementById('veterans-grid');
    const vets = DATA.veteran_strategies || [];

    if (!vets.length) {
        grid.innerHTML = `
            <div class="trades-empty">
                <div class="empty-icon">🧬</div>
                <div class="empty-text">No strategy has closed a trade yet</div>
                <div class="empty-sub">Strategies are listed here after their first close</div>
            </div>`;
        return;
    }

    grid.innerHTML = vets.map(v => {
        const pos = v.pnl >= 0;
        return `
        <div class="veteran-card">
            <div class="veteran-header">
                <span class="veteran-code">${v.code}</span>
                <span class="veteran-rank ${pos ? 'rank-ultra' : 'rank-stable'}">
                    ${v.pairs} PAIR${v.pairs > 1 ? 'S' : ''}
                </span>
            </div>
            <div class="veteran-stats">
                <div class="vet-stat">
                    <div class="val">${v.trades}</div>
                    <div class="lbl">Trades</div>
                </div>
                <div class="vet-stat">
                    <div class="val ${v.winrate >= 50 ? 'green' : ''}">${v.winrate}%</div>
                    <div class="lbl">Win Rate</div>
                </div>
                <div class="vet-stat">
                    <div class="val" style="color:${pos ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        ${pos ? '+' : ''}$${v.pnl.toFixed(2)}
                    </div>
                    <div class="lbl">Net P&L</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ─── AGENT NETWORK ───
// Bir supervisor + yedi uzman ajan. Dugumlerdeki HER SAYI canli hesaptan
// olculur; yerlesim ise sorumluluk dagilimini gosteren bir SEMADIR.
// ⚠️ Bilerek YAPILMAYANLAR:
//   - Ajanlar arasinda uydurma mesaj metni ("AGENT-3: BUY EURUSD onaylandi")
//     YAZILMAZ. Bu, sitede daha once temizledigimiz sahte "→ EXECUTED"
//     satirlarinin aynisi olurdu.
//   - Ajan adlari GENERIKTIR; gercek modul/script adlari verilmez.
function renderAgents() {
    const svg = document.getElementById('agent-svg');
    if (!svg) return;
    const a = DATA.account;
    const m = DATA.market || [];
    const exposed = m.filter(x => x.active).length;

    const agents = [
        { icon: '📡', name: 'SENSING',   val: `${m.length} pairs` },
        { icon: '🔬', name: 'RESEARCH',  val: `${a.active_bots} active` },
        { icon: '📐', name: 'SIZING',    val: `$${a.equity.toFixed(0)} base` },
        { icon: '🛡️', name: 'RISK',      val: a.margin_level ? `${a.margin_level.toFixed(0)}%` : '—' },
        { icon: '⚖️', name: 'EXPOSURE',  val: `${exposed} pairs` },
        { icon: '📰', name: 'EVENTS',    val: 'guarded' },
        { icon: '🔗', name: 'EXECUTION', val: `${a.active_positions} open` },
    ];

    const CX = 380, CY = 238, R = 168;
    let links = '', flows = '', nodes = '';

    agents.forEach((ag, i) => {
        const ang = (2 * Math.PI * i / agents.length) - Math.PI / 2;
        const x = CX + R * Math.cos(ang);
        const y = CY + R * Math.sin(ang) * 0.82;   // hafif eliptik: genis ekranda dengeli
        links += `<line class="ag-link" x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
        flows += `<line class="ag-flow" x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
                   style="animation-delay:${(i * 0.42).toFixed(2)}s"/>`;
        nodes += `
            <g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
                <circle class="ag-node" r="34"/>
                <text class="ag-icon" y="-9">${ag.icon}</text>
                <text class="ag-name" y="9">${ag.name}</text>
                <text class="ag-val"  y="22">${ag.val}</text>
            </g>`;
    });

    svg.innerHTML = `
        ${links}
        ${flows}
        ${nodes}
        <g transform="translate(${CX},${CY})">
            <circle class="ag-ring" r="44"/>
            <circle class="ag-node-sup" r="46"/>
            <text class="ag-icon" y="-14" style="font-size:20px">🧠</text>
            <text class="ag-sup-name" y="8">SUPERVISOR</text>
            <text class="ag-sup-val"  y="23">${a.total_trades} trade${a.total_trades===1?'':'s'} logged</text>
        </g>
        <text class="ag-caption" x="${CX}" y="482">
            Node figures are measured live · layout is a schematic of responsibilities
        </text>`;
}

// ─── CAPABILITY GRID ───
// NOT: Bu liste NE YAPILDIGINI anlatir, NASIL yapildigini degil.
// Onceki surumde buraya sistemdeki gercek script/modul adlari yazilmisti;
// bu dosya herkese acik yayinlandigi icin mimarinin dogrudan ifsasiydi.
// Buraya asla gercek modul/motor/dosya adi yazilmayacak.
function renderModules() {
    const modules = [
        { icon: '🧠', name: 'Decision Core' },
        { icon: '📡', name: 'Market Sensing' },
        { icon: '🔬', name: 'Signal Research' },
        { icon: '🛡️', name: 'Risk Control' },
        { icon: '📐', name: 'Position Sizing' },
        { icon: '⚖️', name: 'Exposure Balance' },
        { icon: '📊', name: 'Performance Audit' },
        { icon: '🧪', name: 'Validation' },
        { icon: '🗂️', name: 'Data Pipeline' },
        { icon: '🔗', name: 'Execution Bridge' },
        { icon: '🕒', name: 'Session Timing' },
        { icon: '📰', name: 'Event Guard' },
    ];

    const grid = document.getElementById('modules-grid');
    grid.innerHTML = modules.map(m => `
        <div class="module-hex">
            <div class="icon">${m.icon}</div>
            <div class="name">${m.name}</div>
            <span class="led"></span>
        </div>
    `).join('');
}

// ─── NAVBAR SCROLL EFFECT ───
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    loadData(false);
    setInterval(() => loadData(true), REFRESH_MS);
});
