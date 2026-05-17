/* ═══════════════════════════════════════════════════════════════
   EGEMENAGI.com — App Logic
   ═══════════════════════════════════════════════════════════════ */

let DATA = null;

// ─── DATA LOADING ───
async function loadData() {
    try {
        const res = await fetch('performance_data.json');
        DATA = await res.json();
        renderAll();
    } catch (e) {
        console.error('Data load failed:', e);
    }
}

function renderAll() {
    if (!DATA) return;
    renderHeroStats();
    renderTicker();
    renderTerminal();
    renderRecentTrades();
    renderQuantumVision();
    renderEquityChart();
    renderMonthlyChart();
    renderHeatmap();
    renderVeterans();
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

// ─── RECENT TRADES ───
function renderRecentTrades() {
    const list = document.getElementById('trades-list');
    const trades = DATA.recent_trades;
    list.innerHTML = trades.map(t => `
        <div class="trade-row">
            <span class="time">${t.time}</span>
            <span class="pair">${t.pair}</span>
            <span class="dir ${t.dir.toLowerCase()}">${t.dir}</span>
            <span class="result ${t.result.toLowerCase()}">${t.result}</span>
            <span class="pips" style="color: ${t.pips >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${t.pips >= 0 ? '+' : ''}${t.pips}</span>
        </div>
    `).join('');
}

// ─── QUANTUM VISION (SIMULATORS) ───
const PAIRS_22 = [
    "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD","EURGBP",
    "EURJPY","GBPJPY","CHFJPY","AUDJPY","EURCHF","GBPCHF","EURAUD","GBPAUD",
    "EURNZD","GBPNZD","AUDCAD","NZDJPY","CADJPY","AUDNZD"
];

function renderQuantumVision() {
    const grid = document.getElementById('scanner-grid');
    if (!grid) return;
    
    // 1. Setup Scanner Grid
    grid.innerHTML = PAIRS_22.map(p => `
        <div class="scanner-cell" id="sc-${p}">
            <div class="sc-pair">${p}</div>
            <div class="sc-val" id="sc-val-${p}">RSI: 50.0</div>
            <div class="sc-tensor" id="sc-tns-${p}">W: [0.00, 0.00]</div>
        </div>
    `).join('');

    setInterval(() => {
        const p = PAIRS_22[Math.floor(Math.random() * PAIRS_22.length)];
        const cell = document.getElementById(`sc-${p}`);
        const val = document.getElementById(`sc-val-${p}`);
        const tns = document.getElementById(`sc-tns-${p}`);
        
        const rsi = (Math.random() * 60 + 20).toFixed(1);
        val.textContent = `RSI: ${rsi}`;
        tns.textContent = `W: [${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}]`;
        
        if (rsi > 70) {
            cell.className = 'scanner-cell flash-sell';
            setTimeout(() => cell.className = 'scanner-cell', 200);
            logSimExecution(p, 'SELL', rsi);
        } else if (rsi < 30) {
            cell.className = 'scanner-cell flash-buy';
            setTimeout(() => cell.className = 'scanner-cell', 200);
            logSimExecution(p, 'BUY', rsi);
        }
    }, 150);

    // 2. Setup Fast Chart
    const ctx = document.getElementById('simChart').getContext('2d');
    const simData = Array(50).fill(1.0500).map((v, i) => v + (Math.random() - 0.5) * 0.01);
    
    window.simChartObj = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(50).fill(''),
            datasets: [{
                data: simData,
                borderColor: '#7b2ff7',
                borderWidth: 1.5,
                tension: 0.1,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false, min: 1.03, max: 1.07 }
            }
        }
    });

    setInterval(() => {
        const last = simData[simData.length - 1];
        const next = last + (Math.random() - 0.5) * 0.002;
        simData.push(next);
        simData.shift();
        window.simChartObj.update();
    }, 100);
}

function logSimExecution(pair, dir, rsi) {
    const logs = document.getElementById('sim-logs');
    if (!logs) return;
    
    const div = document.createElement('div');
    div.className = 'sim-log-line';
    const now = new Date();
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${ms}`;
    
    const dClass = dir === 'BUY' ? 'b' : 's';
    div.innerHTML = `<span class="t">${time}</span> | <span class="${dClass}">${dir}</span> <span class="v">${pair}</span> (Score: ${rsi}) → EXECUTED`;
    
    logs.appendChild(div);
    if (logs.children.length > 8) {
        logs.removeChild(logs.firstChild);
    }
}

// ─── EQUITY CHART ───
function renderEquityChart() {
    const ctx = document.getElementById('equityChart').getContext('2d');
    const data = DATA.equity_curve;

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => ''),
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
                x: { display: false },
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
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const months = DATA.monthly_returns;

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
    const pairs = DATA.pair_performance;

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
                <div class="pair-wr">${wr}% WR</div>
            </div>
        `;
    }).join('');
}

// ─── VETERAN STRATEGIES ───
function renderVeterans() {
    const grid = document.getElementById('veterans-grid');
    const vets = DATA.veteran_strategies;

    const rankClass = {
        'LEGENDARY': 'rank-legendary',
        'ULTRA VETERAN': 'rank-ultra',
        'IRON VETERAN': 'rank-iron',
        'STABLE': 'rank-stable',
    };

    grid.innerHTML = vets.map(v => `
        <div class="veteran-card">
            <div class="veteran-header">
                <span class="veteran-code">${v.code}</span>
                <span class="veteran-rank ${rankClass[v.rank] || 'rank-stable'}">${v.rank}</span>
            </div>
            <div class="veteran-stars">${'⭐'.repeat(v.stars)}</div>
            <div class="veteran-stats">
                <div class="vet-stat">
                    <div class="val">${v.trades}</div>
                    <div class="lbl">Trades</div>
                </div>
                <div class="vet-stat">
                    <div class="val green">${v.winrate}%</div>
                    <div class="lbl">Win Rate</div>
                </div>
                <div class="vet-stat">
                    <div class="val green">+$${v.pnl}</div>
                    <div class="lbl">Profit</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ─── AI MODULES ───
function renderModules() {
    const modules = [
        { icon: '🧠', name: 'Commander' },
        { icon: '⚔️', name: 'Apex Hunter' },
        { icon: '🔬', name: 'X-Ray Engine' },
        { icon: '🛡️', name: 'Guardian' },
        { icon: '📡', name: 'Sentinel' },
        { icon: '🎯', name: 'Pentagon' },
        { icon: '📊', name: 'Analytics' },
        { icon: '🤖', name: 'AGI Coder' },
        { icon: '🧬', name: 'DNA Scanner' },
        { icon: '⚡', name: 'Flash Trader' },
        { icon: '📈', name: 'Trend Engine' },
        { icon: '🔄', name: 'Mean Revert' },
        { icon: '💎', name: 'Kelly Engine' },
        { icon: '🌊', name: 'Order Flow' },
        { icon: '🧪', name: 'Scientist' },
        { icon: '🏆', name: 'Trainer' },
        { icon: '⚖️', name: 'Rebalancer' },
        { icon: '🔮', name: 'Oracle' },
        { icon: '📋', name: 'Reporter' },
        { icon: '🌙', name: 'Night Judge' },
        { icon: '🎲', name: 'Randomizer' },
        { icon: '🔥', name: 'Momentum' },
        { icon: '🧊', name: 'Cooldown' },
        { icon: '🗂️', name: 'Archiver' },
        { icon: '📐', name: 'Risk Engine' },
        { icon: '🔗', name: 'Sync Bridge' },
        { icon: '🧭', name: 'Navigator' },
        { icon: '🛰️', name: 'Regime HMM' },
        { icon: '🏛️', name: 'Farm Manager' },
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
    loadData();
});
