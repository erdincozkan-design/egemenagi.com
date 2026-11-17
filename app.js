/* Egemen AGI — performance_data.json'u okur (44_web_sync_engine.py üretir).
   Uydurma veri YOK: veri yoksa boş-durum gösterilir, doldurulmaz. */
(function () {
  "use strict";
  var STALE_HOURS = 6;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function money(v, sign) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    var s = Math.abs(v).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var pre = v < 0 ? "−" : (sign && v > 0 ? "+" : "");
    return pre + "$" + s;
  }
  function num(v, d) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    return Number(v).toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }
  function cls(v) { return v > 0 ? "pos" : (v < 0 ? "neg" : ""); }
  function trDate(iso) {
    if (!iso) return "—";
    var p = iso.slice(0, 10).split("-");
    return p[2] + "." + p[1] + "." + p[0];
  }
  function localTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    return d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function hoursAgo(iso) { return iso ? (Date.now() - new Date(iso).getTime()) / 36e5 : Infinity; }

  function table(head, rows, rightCols) {
    var wrap = el("div", "tbl-wrap"), t = el("table"), tr = el("tr");
    head.forEach(function (h, i) { var th = el("th", rightCols.indexOf(i) >= 0 ? "r" : "", h); tr.appendChild(th); });
    var thead = el("thead"); thead.appendChild(tr); t.appendChild(thead);
    var tb = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr");
      r.forEach(function (c, i) {
        var td = el("td", (rightCols.indexOf(i) >= 0 ? "r " : "") + (c.cls || ""), c.text !== undefined ? c.text : c);
        row.appendChild(td);
      });
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t);
    return wrap;
  }
  function fill(box, node) { box.textContent = ""; box.appendChild(node); }
  function empty(box, msg) { fill(box, el("div", "empty", msg)); }

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function drawSpark(svg, daily) {
    svg.textContent = "";
    if (!daily || daily.length < 2) return;
    var ys = [0].concat(daily.map(function (d) { return d.cum; }));
    var mn = Math.min.apply(null, ys), mx = Math.max.apply(null, ys), span = (mx - mn) || 1;
    var pts = ys.map(function (y, i) {
      return (i / (ys.length - 1) * 400).toFixed(1) + "," + (56 - (y - mn) / span * 52).toFixed(1);
    }).join(" ");
    var last = ys[ys.length - 1];
    svg.appendChild(svgEl("polyline", { points: pts, fill: "none", stroke: last >= 0 ? cssVar("--good") : cssVar("--bad"), "stroke-width": 2, "vector-effect": "non-scaling-stroke" }));
  }

  function drawChart(box, daily) {
    if (!daily || !daily.length) { empty(box, "Henüz kapanan işlem yok."); return; }
    var W = 800, H = 240, L = 56, R = 10, T = 12, B = 26;
    var cum = daily.map(function (d) { return d.cum; }), net = daily.map(function (d) { return d.net; });
    var mn = Math.min(0, Math.min.apply(null, cum), Math.min.apply(null, net));
    var mx = Math.max(0, Math.max.apply(null, cum), Math.max.apply(null, net));
    if (mx === mn) { mx += 1; mn -= 1; }
    var n = daily.length, cw = (W - L - R) / n;
    function y(v) { return T + (mx - v) / (mx - mn) * (H - T - B); }
    function x(i) { return L + cw * (i + 0.5); }
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": "Kümülatif net grafiği" });
    var muted = cssVar("--muted"), line = cssVar("--line");
    [mx, (mx + mn) / 2, mn].forEach(function (v) {
      svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: line, "stroke-width": 1 }));
      var t = svgEl("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end", fill: muted, "font-size": 11, "font-family": "monospace" });
      t.textContent = money(v); svg.appendChild(t);
    });
    svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: y(0), y2: y(0), stroke: muted, "stroke-width": 1, "stroke-dasharray": "3 3" }));
    var bw = Math.max(2, Math.min(28, cw * 0.6));
    daily.forEach(function (d, i) {
      var y0 = y(0), y1 = y(d.net);
      svg.appendChild(svgEl("rect", { x: x(i) - bw / 2, y: Math.min(y0, y1), width: bw, height: Math.max(1, Math.abs(y1 - y0)), fill: d.net >= 0 ? cssVar("--good") : cssVar("--bad"), opacity: 0.35 }));
    });
    var pts = daily.map(function (d, i) { return x(i).toFixed(1) + "," + y(d.cum).toFixed(1); }).join(" ");
    if (n > 1) svg.appendChild(svgEl("polyline", { points: pts, fill: "none", stroke: cssVar("--accent"), "stroke-width": 2, "vector-effect": "non-scaling-stroke" }));
    daily.forEach(function (d, i) {
      var c = svgEl("circle", { cx: x(i), cy: y(d.cum), r: n > 40 ? 0 : 3, fill: cssVar("--accent") });
      var tt = svgEl("title", {}); tt.textContent = trDate(d.date) + " · gün " + money(d.net, true) + " · toplam " + money(d.cum, true) + " · " + d.trades + " işlem";
      c.appendChild(tt); svg.appendChild(c);
    });
    var step = Math.max(1, Math.ceil(n / 8));
    daily.forEach(function (d, i) {
      if (i % step && i !== n - 1) return;
      var t = svgEl("text", { x: x(i), y: H - 8, "text-anchor": "middle", fill: muted, "font-size": 11, "font-family": "monospace" });
      t.textContent = trDate(d.date).slice(0, 5); svg.appendChild(t);
    });
    fill(box, svg);
  }

  function stat(label, value, c, detail) {
    var s = el("div", "stat");
    s.appendChild(el("div", "lbl", label));
    s.appendChild(el("div", "v " + (c || ""), value));
    if (detail) s.appendChild(el("div", "d", detail));
    return s;
  }

  function render(d) {
    var a = d.account || {};
    var n = a.total_trades || 0;
    var start = d.record_start;

    $("lastUpdated").textContent = localTime(d.last_updated);
    var age = Math.max(hoursAgo(d.last_updated), hoursAgo(d.source_updated));
    if (age > STALE_HOURS) {
      $("syncDot").classList.add("old");
      var sn = $("staleNote"); sn.hidden = false;
      sn.textContent = "veri " + Math.floor(age) + " saattir yenilenmedi";
    }

    if (!n) {
      $("emptyNote").hidden = false;
      var future = start && new Date(start + "T00:00:00") > new Date();
      $("emptyTitle").textContent = future ? "Kayıt " + trDate(start) + " tarihinde başlıyor" : "Henüz kapanan işlem yok";
      $("emptyText").textContent = (future
        ? "Gerçek hesap dönemi " + trDate(start) + " tarihinde başlıyor. "
        : "Kayıt " + trDate(start) + " tarihinde başladı. ") +
        "İlk işlem kapandığında bu sayfa kendiliğinden dolmaya başlar; öncesinde hiçbir sayı doldurulmaz.";
    }

    var net = $("heroNet");
    net.textContent = money(a.total_pnl || 0, true);
    net.className = "big " + cls(a.total_pnl);
    $("heroSub").textContent = trDate(start) + " tarihinden beri · " + num(n) + " kapanan işlem";
    drawSpark($("heroSpark"), d.daily);

    $("accBalance").textContent = money(a.balance);
    $("accEquity").textContent = money(a.equity);
    $("accOpen").textContent = num(a.open_positions);

    var st = $("stats"); st.textContent = "";
    var has = n > 0;
    st.appendChild(stat("Son işlem günü", has ? money(a.daily_pnl, true) : "—", cls(a.daily_pnl), a.last_trade_day ? trDate(a.last_trade_day) : ""));
    st.appendChild(stat("Son 7 gün", has ? money(a.weekly_pnl, true) : "—", cls(a.weekly_pnl)));
    st.appendChild(stat("Son 30 gün", has ? money(a.monthly_pnl, true) : "—", cls(a.monthly_pnl)));
    st.appendChild(stat("İşlem sayısı", num(n)));
    st.appendChild(stat("İsabet oranı", has ? "%" + num(a.win_rate, 1) : "—", "", "kazanan işlem payı"));
    st.appendChild(stat("Kâr faktörü", has && a.profit_factor !== null ? num(a.profit_factor, 2) : "—", "", "toplam kazanç ÷ toplam kayıp"));
    st.appendChild(stat("Kazanç/kayıp oranı", has && a.payoff !== null ? num(a.payoff, 2) : "—", "", has ? "ort. " + money(a.avg_win) + " / " + money(a.avg_loss) : ""));
    st.appendChild(stat("İşlem başı ortalama", has ? money(a.expectancy, true) : "—", cls(a.expectancy)));
    st.appendChild(stat("En büyük düşüş", has ? money(-(a.max_drawdown || 0)) : "—", has && a.max_drawdown > 0 ? "neg" : "", "kapanan işlemlerle, tepeden"));
    st.appendChild(stat("Aktif strateji", has ? num(a.active_bots) : "—", "", "işlem kapatan"));

    drawChart($("chartBox"), d.daily);

    var ss = d.veteran_strategies || [];
    if (ss.length) fill($("stratBox"), table(["Strateji", "İşlem", "İsabet", "Net"],
      ss.map(function (s) { return [s.code, num(s.trades), "%" + num(s.winrate, 1), { text: money(s.pnl, true), cls: cls(s.pnl) }]; }), [1, 2, 3]));
    else empty($("stratBox"), "Henüz veri yok.");

    var pp = d.pair_performance || {}, pk = Object.keys(pp);
    if (pk.length) fill($("pairBox"), table(["Parite", "İşlem", "İsabet", "Net"],
      pk.map(function (k) { var p = pp[k]; return [k, num(p.trades), "%" + num(p.winrate, 1), { text: money(p.pnl, true), cls: cls(p.pnl) }]; }), [1, 2, 3]));
    else empty($("pairBox"), "Henüz veri yok.");

    var tr = d.recent_trades || [];
    if (tr.length) fill($("tradeBox"), table(["Zaman", "Strateji", "Parite", "Yön", "Net"],
      tr.map(function (t) { return [t.time, t.strategy, t.pair, { text: t.dir === "BUY" ? "AL" : "SAT", cls: "tag" }, { text: money(t.pnl, true), cls: cls(t.pnl) }]; }), [4]));
    else empty($("tradeBox"), "Henüz kapanan işlem yok.");

    var mr = d.monthly_returns || [];
    if (mr.length) fill($("monthBox"), table(["Ay", "Net"],
      mr.map(function (m) { var p = m.month.split("-"); return [p[1] + "." + p[0], { text: money(m.pnl, true), cls: cls(m.pnl) }]; }), [1]));
    else empty($("monthBox"), "Henüz veri yok.");

    $("disclaimer").textContent = d.disclaimer || "";
  }

  function load() {
    fetch("performance_data.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () {
        $("lastUpdated").textContent = "veri okunamadı";
        $("syncDot").classList.add("old");
      });
  }
  load();
  setInterval(load, 5 * 60 * 1000);
})();
