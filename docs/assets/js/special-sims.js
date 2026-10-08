/* ============================================================
   Special-purpose maps · Book 1 (khgeo/cartography)
   cadastre   L4 · cadastral index map: scale, parcel IDs, area by coordinates, shared boundaries
   starchart  L3 · sky map: azimuthal projections seen from inside the sphere
   Registered into window.EXTRA_SIMS; rendered by lesson-sims.js.
   ============================================================ */
(function () {
  "use strict";
  window.EXTRA_SIMS = window.EXTRA_SIMS || {};
  const KM = "០១២៣៤៥៦៧៨៩";
  const kh = (n) => String(n).replace(/[0-9]/g, (d) => KM[d]);
  const fmtN = (n, dec = 0) => kh(Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/,/g, " ").replace(".", ","));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const font = () => getComputedStyle(document.body).fontFamily;
  const RAD = Math.PI / 180;
  const shellC = (el, title, controls) => {
    el.innerHTML = `<div class="sim-title">${title}</div><div class="sim-controls">${controls}</div><div class="sim-body"><div class="sim-canvas-wrap"><canvas></canvas></div></div><div class="sim-out"></div>`;
    const cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
    return { cv, ctx, out: el.querySelector(".sim-out"), q: (x) => el.querySelector(x) };
  };
  const fitC = (cv, ctx, W, H) => { const w = cv.parentElement.clientWidth || W, s = w / W, d = window.devicePixelRatio || 1;
    cv.style.width = w + "px"; cv.style.height = H * s + "px"; cv.width = w * d; cv.height = H * s * d; ctx.setTransform(s * d, 0, 0, s * d, 0, 0); return s; };
  const seg = (el, sel, cb) => el.querySelectorAll(sel + " button").forEach((b) => (b.onclick = () => {
    el.querySelectorAll(sel + " button").forEach((x) => x.classList.toggle("on", x === b)); cb(b.dataset.v); }));

  /* ============================================================
     L4 · Cadastral index map
     ============================================================ */
  window.EXTRA_SIMS["cadastre"] = (el) => {
    const { cv, ctx, out, q } = shellC(el, "ផែនទីសុរិយោដី៖ មាត្រដ្ឋាន លេខក្បាលដី និងផ្ទៃគណនាពីកូអរដោនេ",
      `<span class="sim-seg cd-s"><button type="button" data-v="1000">១:១ ០០០</button><button type="button" data-v="2000" class="on">១:២ ០០០</button><button type="button" data-v="5000">១:៥ ០០០</button></span>
       <label><input type="checkbox" class="cd-len" checked> ប្រវែងព្រំ</label><label><input type="checkbox" class="cd-area" checked> ផ្ទៃ</label>
       <label><input type="checkbox" class="cd-merc"> វាស់លើ Web Mercator</label>
       <button type="button" class="sim-btn cd-reset">ត្រឡប់ដើម</button>
       <span class="sim-hint">ចុចលើក្បាលដីដើម្បីមើលព័ត៌មាន · អូសបង្គោលព្រំ (ចំណុចខ្មៅ) ដើម្បីប្ដូរព្រំ · អូសកន្លែងទទេដើម្បីរំកិល</span>`);
    const E0 = 493000, N0 = 1283000;                         // fictional village near 11.6°N (UTM 48N)
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    // ---- build a topologically clean parcel fabric: bands between boundary lines, nodes shared
    const LINES = [ (x) => 0, (x) => 112 + 6 * Math.sin(x / 90), (x) => 124 + 6 * Math.sin(x / 90), (x) => 178 + 4 * Math.sin(x / 70 + 1), (x) => 300 ];
    const BANDS = [ { b: 0, t: 1, use: "rice", w: [38, 70] }, { b: 2, t: 3, use: "home", w: [16, 26] }, { b: 3, t: 4, use: "orchard", w: [45, 80] } ];
    const XMAX = 420, nodes = [], key = {};
    const node = (line, x) => { const k = line + ":" + x.toFixed(1); if (key[k] == null) { key[k] = nodes.length; nodes.push([x, LINES[line](x)]); } return key[k]; };
    const divs = BANDS.map((B) => { const d = [0]; let x = 0; while (x < XMAX - B.w[0]) { x += B.w[0] + rnd() * (B.w[1] - B.w[0]); d.push(Math.min(x, XMAX)); } d[d.length - 1] = XMAX;
      return d.map((v, i) => (i === 0 || i === d.length - 1 ? [v, v] : [v + (rnd() - 0.5) * 8, v + (rnd() - 0.5) * 8])); });
    const onLine = (line) => { const xs = new Set(); BANDS.forEach((B, i) => { if (B.b === line) divs[i].forEach((d) => xs.add(+d[0].toFixed(1))); if (B.t === line) divs[i].forEach((d) => xs.add(+d[1].toFixed(1))); });
      return [...xs].sort((a, b) => a - b); };
    const P0 = []; let pid = 1;
    BANDS.forEach((B, bi) => { const bot = onLine(B.b), top = onLine(B.t), D = divs[bi];
      for (let i = 0; i < D.length - 1; i++) { const xb0 = +D[i][0].toFixed(1), xb1 = +D[i + 1][0].toFixed(1), xt0 = +D[i][1].toFixed(1), xt1 = +D[i + 1][1].toFixed(1);
        const ring = [...bot.filter((x) => x >= xb0 && x <= xb1).map((x) => node(B.b, x)), ...top.filter((x) => x >= xt0 && x <= xt1).reverse().map((x) => node(B.t, x))];
        const use = B.use === "rice" && rnd() < 0.15 ? "orchard" : B.use === "orchard" && rnd() < 0.35 ? "rice" : B.use;
        P0.push({ id: pid++, ring, use }); } });
    const ORIG = nodes.map((n) => n.slice());
    const USE = { home: ["ដីលំនៅឋាន", "#ffe0b2"], rice: ["ដីស្រែ", "#fff9c4"], orchard: ["ដីចម្ការ", "#dcedc8"] };
    const W = 680, H = 460; let scale = 2000, sel = null, view = { cx: XMAX / 2, cy: 150 }, drag = null;
    const pxPerM = () => 3.78 * 1000 / scale;                 // 96 dpi screen: 1 mm ≈ 3.78 px
    const toS = ([x, y]) => [W / 2 + (x - view.cx) * pxPerM(), H / 2 - (y - view.cy) * pxPerM()];
    const toM = (sx, sy) => [view.cx + (sx - W / 2) / pxPerM(), view.cy - (sy - H / 2) / pxPerM()];
    const lat = (11.6 * RAD), merc = 1 / Math.cos(lat) ** 2;  // Web Mercator area factor at this latitude
    const area = (R) => { let s = 0; for (let i = 0; i < R.length; i++) { const a = nodes[R[i]], b = nodes[R[(i + 1) % R.length]]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
    const perim = (R) => R.reduce((s, n, i) => s + Math.hypot(nodes[R[(i + 1) % R.length]][0] - nodes[n][0], nodes[R[(i + 1) % R.length]][1] - nodes[n][1]), 0);
    const cen = (R) => { let A = 0, x = 0, y = 0; for (let i = 0; i < R.length; i++) { const a = nodes[R[i]], b = nodes[R[(i + 1) % R.length]], f = a[0] * b[1] - b[0] * a[1]; A += f; x += (a[0] + b[0]) * f; y += (a[1] + b[1]) * f; } return [x / (3 * A), y / (3 * A)]; };
    const pid8 = (id) => "១២០៤០៣០២-" + kh(String(id).padStart(4, "0"));   // fictional village code + parcel number
    const draw = () => {
      fitC(cv, ctx, W, H); const m = q(".cd-merc").checked ? merc : 1, k = pxPerM();
      ctx.fillStyle = "#fafafa"; ctx.fillRect(0, 0, W, H);
      // road and canal (not parcels)
      const band = (l0, l1, col) => { ctx.beginPath(); for (let x = -20; x <= XMAX + 20; x += 5) { const p = toS([x, LINES[l0](x)]); x === -20 ? ctx.moveTo(...p) : ctx.lineTo(...p); }
        for (let x = XMAX + 20; x >= -20; x -= 5) ctx.lineTo(...toS([x, LINES[l1](x)])); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
      band(1, 2, "#e0e0e0");
      ctx.fillStyle = "#bbdefb"; const c0 = toS([-30, 300]), c1 = toS([-4, -10]); ctx.fillRect(c0[0], c0[1], c1[0] - c0[0], c1[1] - c0[1]);
      // parcels
      P0.forEach((p) => { ctx.beginPath(); p.ring.forEach((n, i) => (i ? ctx.lineTo(...toS(nodes[n])) : ctx.moveTo(...toS(nodes[n])))); ctx.closePath();
        ctx.fillStyle = p === sel ? "#ffcc80" : USE[p.use][1]; ctx.fill(); ctx.strokeStyle = "#212121"; ctx.lineWidth = Math.max(0.6, 0.18 * 3.78); ctx.stroke(); });
      // labels: what fits at this scale (text needs ≥ ~6 mm of parcel width)
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      P0.forEach((p) => { const c = toS(cen(p.ring)), xs = p.ring.map((n) => toS(nodes[n])[0]), wpx = Math.max(...xs) - Math.min(...xs);
        if (wpx < 18) return;
        ctx.font = `bold ${wpx > 40 ? 12 : 10}px ${font()}`; ctx.fillStyle = "#b71c1c"; ctx.fillText(kh(p.id), c[0], c[1] - (q(".cd-area").checked && wpx > 60 ? 7 : 0));
        if (q(".cd-area").checked && wpx > 60) { ctx.font = `10px ${font()}`; ctx.fillStyle = "#37474f"; ctx.fillText(fmtN(area(p.ring) * m) + " ម²", c[0], c[1] + 7); } });
      // boundary lengths (only where the edge is long enough on paper)
      if (q(".cd-len").checked && scale < 5000) { ctx.font = `9px ${font()}`; ctx.fillStyle = "#1565c0"; const done = new Set();
        P0.forEach((p) => p.ring.forEach((n, i) => { const n2 = p.ring[(i + 1) % p.ring.length], kk = Math.min(n, n2) + "-" + Math.max(n, n2); if (done.has(kk)) return; done.add(kk);
          const a = toS(nodes[n]), b = toS(nodes[n2]), L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < (scale === 1000 ? 34 : 100)) return;
          let ang = Math.atan2(b[1] - a[1], b[0] - a[0]); if (Math.cos(ang) < 0) ang += Math.PI;
          ctx.save(); ctx.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); ctx.rotate(ang); ctx.fillText(fmtN(Math.hypot(nodes[n2][0] - nodes[n][0], nodes[n2][1] - nodes[n][1]) * Math.sqrt(m), 1), 0, -6); ctx.restore(); })); }
      // boundary markers
      if (k > 1) nodes.forEach((n) => { const [x, y] = toS(n); ctx.beginPath(); ctx.arc(x, y, k > 3 ? 2.6 : 1.8, 0, 7); ctx.fillStyle = "#212121"; ctx.fill(); });
      [[118, 118], [290, 236]].forEach((g, i) => { const [x, y] = toS(g); ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5.5, y + 4); ctx.lineTo(x - 5.5, y + 4); ctx.closePath(); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#c62828"; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.font = `9px ${font()}`; ctx.fillStyle = "#c62828"; ctx.textAlign = "left"; ctx.fillText("GCP-" + kh(i + 1), x + 7, y); ctx.textAlign = "center"; });
      ctx.font = `11px ${font()}`; ctx.fillStyle = "#616161"; ctx.fillText("ផ្លូវ", toS([300, 118])[0], toS([300, 118])[1]);
      // scale bar and frame
      const bar = [10, 20, 50, 100, 200].find((v) => v * k > 70) || 200; ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(8, H - 32, bar * k + 60, 24);
      for (let i = 0; i < 2; i++) { ctx.fillStyle = i ? "#fff" : "#212121"; ctx.fillRect(14 + (i * bar * k) / 2, H - 16, (bar * k) / 2, 5); }
      ctx.strokeStyle = "#212121"; ctx.lineWidth = 0.8; ctx.strokeRect(14, H - 16, bar * k, 5); ctx.fillStyle = "#212121"; ctx.textAlign = "left"; ctx.font = `10px ${font()}`;
      ctx.fillText(`០        ${kh(bar)} ម   ·  ១:${fmtN(scale)} (លើអេក្រង់ ៩៦ dpi)`, 12, H - 22); ctx.strokeStyle = "#424242"; ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
      // info panel
      const acc = 0.2 * scale / 1000;
      let info = `<b>មាត្រដ្ឋាន ១:${fmtN(scale)}</b>៖ ១ មម លើផែនទី = ${fmtN(scale / 1000, 0)} ម · ភាពត្រឹមត្រូវគូស (០,២ មម) ≈ ±${fmtN(acc, 1)} ម លើដី។ ` +
        (scale === 5000 ? "ក្បាលដីតូច (ផ្ទះ) តូចពេកមិនអាចសរសេរលេខ ឬប្រវែងបាន។" : scale === 1000 ? "លម្អិតបំផុត៖ ល្អសម្រាប់ទីប្រជុំជន ប៉ុន្តែត្រូវការផ្ទាំងផែនទីច្រើន។" : "សមរម្យសម្រាប់ភូមិជនបទ។");
      if (sel) { const A = area(sel.ring);
        info += `<br><b>ក្បាលដីលេខ ${pid8(sel.id)}</b> · ${USE[sel.use][0]} · ផ្ទៃ <b>${fmtN(A * m)} ម²</b> (${fmtN((A * m) / 10000, 4)} ហិកតា) · បរិមាត្រ ${fmtN(perim(sel.ring) * Math.sqrt(m), 1)} ម · បង្គោលព្រំ ${kh(sel.ring.length)}` +
          (m !== 1 ? ` <b style="color:#c62828">· ធំជាងពិត ${fmtN((m - 1) * 100, 1)}% ព្រោះ Web Mercator មិនរក្សាផ្ទៃ</b>` : "") +
          `<br><span class="sim-hint">កូអរដោនេបង្គោល (UTM 48N)៖ ${sel.ring.slice(0, 6).map((n) => `(${fmtN(E0 + nodes[n][0], 1)}, ${fmtN(N0 + nodes[n][1], 1)})`).join(" ")}${sel.ring.length > 6 ? " …" : ""} · ផ្ទៃ = ½ |Σ (Eᵢ·Nᵢ₊₁ − Eᵢ₊₁·Nᵢ)|</span>`; }
      out.innerHTML = info + `<br><span class="sim-hint">ក្បាលដី ${kh(P0.length)} · ភូមិ និងលេខកូដប្រឌិតសម្រាប់បង្រៀន · ព្រំរួមប្រើបង្គោលតែមួយ ដូច្នេះការអូសបង្គោល ប្ដូរផ្ទៃក្បាលដីជិតខាងក្នុងពេលតែមួយ</span>`;
    };
    const evM = (e) => { const r = cv.getBoundingClientRect(), s = W / r.width; return [(e.clientX - r.left) * s, (e.clientY - r.top) * s]; };
    const inside = (p, [x, y]) => { let c = false; const R = p.ring.map((n) => nodes[n]); for (let i = 0, j = R.length - 1; i < R.length; j = i++) if ((R[i][1] > y) !== (R[j][1] > y) && x < ((R[j][0] - R[i][0]) * (y - R[i][1])) / (R[j][1] - R[i][1]) + R[i][0]) c = !c; return c; };
    cv.addEventListener("pointerdown", (e) => { const [sx, sy] = evM(e), m = toM(sx, sy);
      const ni = nodes.findIndex((n) => { const s = toS(n); return Math.hypot(s[0] - sx, s[1] - sy) < 7; });
      if (ni >= 0) drag = { node: ni }; else { const p = P0.find((pp) => inside(pp, m)); if (p) { sel = p; drag = null; draw(); return; } drag = { pan: [sx, sy, view.cx, view.cy] }; }
      cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (!drag) return; const [sx, sy] = evM(e);
      if (drag.node != null) { const m = toM(sx, sy); nodes[drag.node][0] = m[0]; nodes[drag.node][1] = m[1]; if (!sel) sel = P0.find((p) => p.ring.includes(drag.node)); }
      else { view.cx = drag.pan[2] - (sx - drag.pan[0]) / pxPerM(); view.cy = drag.pan[3] + (sy - drag.pan[1]) / pxPerM(); }
      draw(); });
    cv.addEventListener("pointerup", () => (drag = null)); cv.style.touchAction = "none";
    seg(el, ".cd-s", (v) => { scale = +v; draw(); });
    el.querySelectorAll("input").forEach((c) => c.addEventListener("change", draw));
    q(".cd-reset").onclick = () => { ORIG.forEach((o, i) => { nodes[i][0] = o[0]; nodes[i][1] = o[1]; }); view = { cx: XMAX / 2, cy: 150 }; sel = null; draw(); };
    sel = P0.filter((p) => p.use === "home").sort((a, b) => Math.abs(cen(a.ring)[0] - XMAX / 2) - Math.abs(cen(b.ring)[0] - XMAX / 2))[0]; draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ============================================================
     L3 · Star chart: the sky over Phnom Penh, seen from inside the sphere
     ============================================================ */
  window.EXTRA_SIMS["starchart"] = async (el) => {
    const D = await window.cartoData("../../assets/data/stars.json");
    const { cv, ctx, out, q } = shellC(el, "ផែនទីផ្កាយ៖ មេឃលើភ្នំពេញ",
      `<label>ថ្ងៃ <input class="st-d" type="range" min="0" max="364" step="1" value="348"> <b class="st-dv"></b></label>
       <label>ម៉ោង <input class="st-t" type="range" min="18" max="30" step="0.25" value="21"> <b class="st-tv"></b></label>
       <span class="sim-seg st-p"><button type="button" data-v="eqd" class="on">ចម្ងាយស្មើ</button><button type="button" data-v="ster">Stereographic</button><button type="button" data-v="orth">Orthographic</button></span>
       <span class="sim-seg st-v"><button type="button" data-v="in" class="on">មើលឡើងលើ (ផែនទីផ្កាយ)</button><button type="button" data-v="out">មើលពីក្រៅ (ពិភពផ្កាយ)</button></span>
       <label>ពន្លឺអប្បបរមា <input class="st-m" type="range" min="1" max="5" step="0.5" value="4"> <b class="st-mv"></b></label>
       <label><input type="checkbox" class="st-l" checked> ខ្សែក្រុមផ្កាយ</label><label><input type="checkbox" class="st-n" checked> ឈ្មោះ</label><label><input type="checkbox" class="st-g" checked> ក្រឡាកម្ពស់</label>`);
    const LAT = 11.55, LON = 104.92, W = 600, H = 628, R = 270, cx = W / 2, cy = 296;
    const MON = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    let proj = "eqd", view = "in";
    const fz = { eqd: (z) => z / 90, ster: (z) => Math.tan((z * RAD) / 2), orth: (z) => Math.sin(z * RAD) };
    const draw = () => {
      fitC(cv, ctx, W, H);
      const day = +q(".st-d").value, hr = +q(".st-t").value, mlim = +q(".st-m").value;
      const date = new Date(Date.UTC(2026, 0, 1) + day * 864e5 + (hr - 7) * 36e5);  // local time UTC+7
      const ld = new Date(date.getTime() + 7 * 36e5);
      q(".st-dv").textContent = `${kh(ld.getUTCDate())} ${MON[ld.getUTCMonth()]}`; q(".st-tv").textContent = `${kh(String(ld.getUTCHours()).padStart(2, "0"))}:${kh(String(ld.getUTCMinutes()).padStart(2, "0"))}`;
      q(".st-mv").textContent = fmtN(mlim, 1);
      const jd = date.getTime() / 864e5 + 2440587.5, gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360, lst = gmst + LON;
      const sl = Math.sin(LAT * RAD), cl = Math.cos(LAT * RAD), f = fz[proj], sgn = view === "in" ? -1 : 1;
      const P = (ra, dec) => { const H0 = (lst - (ra < 0 ? ra + 360 : ra)) * RAD, d = dec * RAD;
        const alt = Math.asin(sl * Math.sin(d) + cl * Math.cos(d) * Math.cos(H0));
        const az = Math.atan2(-Math.cos(d) * Math.sin(H0), Math.sin(d) * cl - Math.cos(d) * sl * Math.cos(H0));
        const r = (R * f(90 - alt / RAD)) / f(90); return [cx + sgn * r * Math.sin(az), cy - r * Math.cos(az), alt / RAD]; };
      ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, "#0b1d3a"); g.addColorStop(1, "#18345e");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      if (q(".st-g").checked) { ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 0.8; ctx.font = `10px ${font()}`; ctx.fillStyle = "rgba(255,255,255,.45)";
        [30, 60].forEach((a) => { const r = (R * f(90 - a)) / f(90); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.fillText(kh(a) + "°", cx + 3, cy - r + 11); });
        for (let a = 0; a < 360; a += 45) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sgn * R * Math.sin(a * RAD), cy - R * Math.cos(a * RAD)); ctx.stroke(); }
        // celestial equator and ecliptic as references
        [[0, "rgba(129,212,250,.55)", "អេក្វាទ័រផ្ទៃមេឃ"], [1, "rgba(255,213,79,.6)", "គន្លងព្រះអាទិត្យ"]].forEach(([ecl, col, name]) => { ctx.strokeStyle = col; ctx.setLineDash([5, 4]); ctx.beginPath(); let pen = false, lab = null;
          for (let l = 0; l <= 360; l += 2) { const ra = ecl ? Math.atan2(Math.sin(l * RAD) * Math.cos(23.44 * RAD), Math.cos(l * RAD)) / RAD : l, de = ecl ? Math.asin(Math.sin(23.44 * RAD) * Math.sin(l * RAD)) / RAD : 0;
            const [x, y, alt] = P(ra, de); if (alt > -2) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; if (!lab && alt > 25) lab = [x, y]; } else pen = false; }
          ctx.stroke(); ctx.setLineDash([]); if (lab) { ctx.fillStyle = col; ctx.font = `10px ${font()}`; ctx.fillText(name, lab[0] + 4, lab[1] - 4); } }); }
      if (q(".st-l").checked) { ctx.strokeStyle = "rgba(144,202,249,.55)"; ctx.lineWidth = 0.9;
        Object.values(D.lines).forEach((segs) => segs.forEach((s) => { for (let i = 1; i < s.length; i++) { const a = P(...s[i - 1]), b = P(...s[i]); if (a[2] > 0 && b[2] > 0) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } } })); }
      let n = 0;
      D.stars.forEach(([ra, de, mag, bv]) => { if (mag > mlim) return; const [x, y, alt] = P(ra, de); if (alt <= 0) return; n++;
        const r = Math.max(0.7, 3.6 - 0.62 * mag); ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
        ctx.fillStyle = bv < 0 ? "#cfe3ff" : bv < 0.6 ? "#ffffff" : bv < 1.2 ? "#fff1c9" : "#ffcfa6"; ctx.fill(); });
      if (q(".st-n").checked) { ctx.font = `bold 11px ${font()}`; ctx.fillStyle = "#fff59d";
        D.cons.forEach(([id, la, kmn, c, rank]) => { if (rank !== "1" && !kmn) return; const [x, y, alt] = P(c[0], c[1]); if (alt < 8) return; ctx.textAlign = "center"; ctx.fillStyle = kmn ? "#ffcc80" : "rgba(255,245,157,.8)"; ctx.fillText(kmn ? `${kmn} (${la})` : la, x, y); });
        ctx.font = `10px ${font()}`; ctx.fillStyle = "#e3f2fd"; ctx.textAlign = "left";
        D.named.forEach(([nm, ra, de, mag]) => { if (mag > mlim) return; const [x, y, alt] = P(ra, de); if (alt > 3) ctx.fillText(nm === "Polaris" ? "ផ្កាយប៉ូលខាងជើង" : nm, x + 5, y - 4); }); }
      ctx.restore();
      ctx.strokeStyle = "#263238"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.font = `bold 15px ${font()}`; ctx.fillStyle = "#263238"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      [["ជ", 0], ["ក", 90], ["ត", 180], ["ល", 270]].forEach(([t, a]) => ctx.fillText(t, cx + sgn * (R + 15) * Math.sin(a * RAD), cy - (R + 15) * Math.cos(a * RAD)));
      ctx.textBaseline = "alphabetic"; ctx.font = `11px ${font()}`; ctx.fillStyle = "#455a64";
      ctx.fillText(view === "in" ? "កាន់ផែនទីពីលើក្បាល ក្បាលផែនទីទៅទិសជើង៖ ខាងកើតនៅឆ្វេង" : "មើលពីក្រៅស្វ៊ែរ (ដូចពិភពផ្កាយ)៖ ខាងកើតនៅស្ដាំ ផ្កាយបញ្ច្រាសពីមេឃពិត", cx, H - 6);
      const edge = { eqd: ["ចំណោលចម្ងាយស្មើ (azimuthal equidistant)", "រង្វង់កម្ពស់ ៣០° និង ៦០° ឃ្លាតស្មើគ្នា ហើយចម្ងាយពីកំពូលមេឃពិត។ ក្រុមផ្កាយជិតជើងមេឃលាតទៅខាង ប្រហែល ១,៦ ដង។ ប្រើច្រើនលើ planisphere។"],
        ster: ["Stereographic", "រក្សារាង (conformal)៖ រាងក្រុមផ្កាយដូចពិតគ្រប់កន្លែង ប៉ុន្តែទំហំនៅជើងមេឃធំជាងនៅកំពូល ២ ដង (ផ្ទៃ ៤ ដង)។"],
        orth: ["Orthographic", "ដូចរូបថតដំបូលមេឃពីឆ្ងាយ៖ កំពូលមេឃច្បាស់ ប៉ុន្តែក្រុមផ្កាយជិតជើងមេឃត្រូវរួញខ្លាំង និងពិបាកអាន។"] }[proj];
      out.innerHTML = `<b>${edge[0]}</b>៖ ${edge[1]}<br>ផ្កាយមើលឃើញ ${fmtN(n)} (ពន្លឺ ≤ ${fmtN(mlim, 1)})។ ទីក្រុងភ្នំពេញភ្លឺ ឃើញត្រឹមប្រហែល ២ ដល់ ៣ ប៉ុណ្ណោះ ឯជនបទងងឹតឃើញដល់ ៥ ឬ ៦។ ` +
        `លេខពន្លឺ (magnitude) តូច = ភ្លឺ ដូច្នេះចំណុចធំសម្រាប់លេខតូច។<br><span class="sim-hint">ទីតាំង ១១,៥៥°N · ១០៤,៩២°E · ម៉ោងកម្ពុជា (UTC+7) · ទិន្នន័យ Hipparcos និងខ្សែក្រុមផ្កាយ IAU ពី d3-celestial (BSD) · ឈ្មោះរាសីជាភាសាខ្មែរ</span>`;
    };
    el.querySelectorAll("input").forEach((c) => c.addEventListener(c.type === "range" ? "input" : "change", draw));
    seg(el, ".st-p", (v) => { proj = v; draw(); }); seg(el, ".st-v", (v) => { view = v; draw(); });
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ============================================================
     L14 · QGIS Atlas: one layout, one page per province
     ============================================================ */
  window.EXTRA_SIMS["atlas"] = async (el) => {
    const D = await window.cartoData("../../assets/data/cambodia_provinces_svg.json");
    const PAL = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"], BR = [0, 50, 100, 200, 400];
    const col = (d) => PAL[BR.filter((b) => d >= b).length - 1];
    const MPU = (D.bounds[2] - D.bounds[0]) / D.W;              // metres per data unit
    el.innerHTML = `<div class="sim-title">Atlas៖ ប្លង់តែមួយ ផែនទីមួយសន្លឹកក្នុងមួយខេត្ត</div>
      <div class="sim-controls">
        <button type="button" class="sim-btn at-prev">◀</button><b class="at-pg"></b><button type="button" class="sim-btn at-next">▶</button>
        <button type="button" class="sim-btn at-play">▶ Preview Atlas</button>
        <span class="sim-seg at-sc"><button type="button" data-v="margin" class="on">Margin ១០%</button><button type="button" data-v="pre">Predefined</button><button type="button" data-v="fixed">Fixed ១:២ ៥០០ ០០០</button></span>
      </div>
      <div class="sim-controls">
        <label>តម្រៀប <select class="at-sort"><option value="name">ឈ្មោះខេត្ត</option><option value="pop">ប្រជាជន (ច្រើន → តិច)</option><option value="dens">ដង់ស៊ីតេ</option></select></label>
        <label><input type="checkbox" class="at-fade" checked> ធ្វើឲ្យខេត្តផ្សេងស្លេក</label><label><input type="checkbox" class="at-ins" checked> ផែនទីទីតាំង (overview)</label>
      </div>
      <div class="sim-body"><div class="sim-canvas-wrap at-page"></div></div><div class="sim-out"></div>`;
    const q = (x) => el.querySelector(x);
    const PW = 297, PH = 210, MX = 10, MY = 24, MWmm = 190, MHmm = 172;     // A4 landscape, mm
    const PRE = [100000, 250000, 500000, 1000000, 1500000, 2500000];
    let order = [], i = 0, mode = "margin", timer = null;
    const bbox = (rings) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; rings.forEach((r) => r.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); })); return [x0, y0, x1, y1]; };
    const sortBy = () => { const k = q(".at-sort").value; order = D.prov.slice().sort((a, b) => k === "name" ? a.name.localeCompare(b.name, "km") : (b[k] || 0) - (a[k] || 0)); };
    const path = (rings, f) => rings.map((r) => "M" + r.map((p) => f(p).map((v) => v.toFixed(2)).join(" ")).join(" L") + "Z").join(" ");
    const draw = () => {
      const P = order[i], [x0, y0, x1, y1] = bbox(P.r), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      // scale: data units per mm of paper
      const need = Math.max(((x1 - x0) * 1.2) / MWmm, ((y1 - y0) * 1.2) / MHmm) * MPU * 1000;    // margin 10% each side
      const sc = mode === "margin" ? need : mode === "pre" ? (PRE.find((v) => v >= need) || PRE[PRE.length - 1]) : 2500000;
      const u = sc / 1000 / MPU;                                   // data units per mm
      const f = ([x, y]) => [MX + MWmm / 2 + (x - cx) / u, MY + MHmm / 2 + (y - cy) / u];
      const fade = q(".at-fade").checked;
      let svg = `<svg viewBox="0 0 ${PW} ${PH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fff;border:1px solid #bbb;box-shadow:0 2px 8px rgba(0,0,0,.15)">
        <style>text{font-family:var(--md-text-font-family,'Battambang');fill:#212121}</style>
        <defs><clipPath id="atclip"><rect x="${MX}" y="${MY}" width="${MWmm}" height="${MHmm}"/></clipPath></defs>
        <text x="${MX}" y="12" font-size="7" font-weight="700" fill="#1a237e">ខេត្ត${P.name}</text>
        <text x="${MX}" y="19" font-size="3.6" fill="#555">ដង់ស៊ីតេប្រជាជន ២០១៧ · ${P.en} · ${kh(i + 1)}/${kh(order.length)}</text>
        <g clip-path="url(#atclip)"><rect x="${MX}" y="${MY}" width="${MWmm}" height="${MHmm}" fill="#e3f2fd"/>`;
      D.prov.forEach((p) => { const cur = p === P;
        svg += `<path d="${path(p.r, f)}" fill="${col(p.dens)}" fill-opacity="${cur || !fade ? 1 : 0.22}" stroke="${cur ? "#212121" : "#fff"}" stroke-width="${cur ? 0.6 : 0.25}"/>`; });
      if (D.lake) svg += `<path d="${path(D.lake, f)}" fill="#90caf9"/>`;
      svg += `</g><rect x="${MX}" y="${MY}" width="${MWmm}" height="${MHmm}" fill="none" stroke="#424242" stroke-width=".4"/>`;
      // right panel: overview, legend, stats, scale
      const RX = MX + MWmm + 8, RW = PW - RX - MX;
      if (q(".at-ins").checked) { const k2 = RW / D.W, g = ([x, y]) => [RX + x * k2, MY + y * k2];
        svg += `<rect x="${RX}" y="${MY}" width="${RW}" height="${D.H * k2}" fill="#f5f5f5" stroke="#9e9e9e" stroke-width=".3"/>`;
        D.prov.forEach((p) => (svg += `<path d="${path(p.r, g)}" fill="${p === P ? "#e53935" : "#cfd8dc"}" stroke="#fff" stroke-width=".15"/>`));
        const [a, b] = g([cx - (MWmm / 2) * u, cy - (MHmm / 2) * u]), [c, d] = g([cx + (MWmm / 2) * u, cy + (MHmm / 2) * u]);
        svg += `<rect x="${Math.max(RX, a)}" y="${Math.max(MY, b)}" width="${Math.min(RX + RW, c) - Math.max(RX, a)}" height="${Math.min(MY + D.H * k2, d) - Math.max(MY, b)}" fill="none" stroke="#1565c0" stroke-width=".6"/>`; }
      let ly = MY + (q(".at-ins").checked ? D.H * (RW / D.W) + 9 : 4);
      svg += `<text x="${RX}" y="${ly}" font-size="3.8" font-weight="700">នាក់/គម²</text>`;
      ["< ៥០", "៥០–១០០", "១០០–២០០", "២០០–៤០០", "> ៤០០"].forEach((t, j) => (svg += `<rect x="${RX}" y="${ly + 2 + j * 5}" width="6" height="3.6" fill="${PAL[j]}" stroke="#999" stroke-width=".2"/><text x="${RX + 8}" y="${ly + 5.2 + j * 5}" font-size="3.3">${t}</text>`));
      ly += 34;
      const rank = D.prov.slice().sort((a, b) => b.dens - a.dens).indexOf(P) + 1;
      svg += `<text x="${RX}" y="${ly}" font-size="3.6">ប្រជាជន ${fmtN(P.pop)} នាក់</text><text x="${RX}" y="${ly + 5.5}" font-size="3.6">ដង់ស៊ីតេ ${fmtN(P.dens)} នាក់/គម²</text><text x="${RX}" y="${ly + 11}" font-size="3.6">ចំណាត់ថ្នាក់ ${kh(rank)} ក្នុង ២៥</text>`;
      // scale bar: round length ≈ 1/4 of the frame
      const tgt = (MWmm / 4) * sc / 1000, nice = [1, 2, 5, 10, 20, 25, 50, 100, 200].map((v) => v * 1000).reverse().find((v) => v <= tgt) || 1000, Lmm = nice / (sc / 1000);
      const sy = MY + MHmm + 6;
      svg += `<rect x="${MX}" y="${sy}" width="${Lmm / 2}" height="1.6" fill="#212121"/><rect x="${MX + Lmm / 2}" y="${sy}" width="${Lmm / 2}" height="1.6" fill="#fff" stroke="#212121" stroke-width=".2"/>
        <text x="${MX + Lmm + 2}" y="${sy + 1.8}" font-size="3.4">${fmtN(nice / 1000)} គម · ១:${fmtN(Math.round(sc / 1000) * 1000)}</text>
        <text x="${PW - MX}" y="${PH - 4}" font-size="3" text-anchor="end" fill="#777">ប្រភព៖ Kh_Province_Boundary (POP2017) · EPSG:32648 · ទំព័រ ${kh(i + 1)}</text></svg>`;
      q(".at-page").innerHTML = svg; q(".at-pg").textContent = ` ${kh(i + 1)} / ${kh(order.length)} `;
      const note = { margin: "មាត្រដ្ឋានប្ដូររាល់ទំព័រ៖ ខេត្តតូចពង្រីកខ្លាំង ខេត្តធំបង្រួម។ អ្នកអានមិនអាចប្រៀបធៀបទំហំខេត្តពីទំព័រមួយទៅទំព័រមួយបានទេ ដូច្នេះរបារមាត្រដ្ឋាននៅគ្រប់ទំព័រចាំបាច់។",
        pre: "QGIS ជ្រើសមាត្រដ្ឋានមូលពីបញ្ជី ដែលតូចជាងគេ តែនៅតែឲ្យខេត្តចូលពេញ។ មាត្រដ្ឋានមូលងាយអាន ហើយខេត្តដែលមានទំហំប្រហាក់ប្រហែល ប្រើមាត្រដ្ឋានដូចគ្នា។",
        fixed: "មាត្រដ្ឋានដូចគ្នាគ្រប់ទំព័រ៖ ប្រៀបធៀបទំហំបានត្រឹមត្រូវ ប៉ុន្តែខេត្តតូចដូចជាភ្នំពេញ ឬកែប ស្ទើរមើលមិនឃើញ ហើយខេត្តធំអាចលើសប្រអប់ផែនទី។" }[mode];
      q(".sim-out").innerHTML = `<b>មាត្រដ្ឋានទំព័រនេះ ១:${fmtN(Math.round(sc / 1000) * 1000)}</b> — ${note}<br><span class="sim-hint">ចំណងជើងក្នុង QGIS៖ <code>concat('ខេត្ត', attribute(@atlas_feature, 'Name_KH'))</code> · លេខទំព័រ៖ <code>concat(@atlas_featurenumber, '/', @atlas_totalfeatures)</code> · ធ្វើឲ្យខេត្តផ្សេងស្លេក៖ rule <code>$id = @atlas_featureid</code></span>`;
    };
    const go = (d) => { i = (i + d + order.length) % order.length; draw(); };
    q(".at-prev").onclick = () => go(-1); q(".at-next").onclick = () => go(1);
    q(".at-play").onclick = () => { if (timer) { clearInterval(timer); timer = null; q(".at-play").textContent = "▶ Preview Atlas"; return; }
      q(".at-play").textContent = "■ ឈប់"; timer = setInterval(() => (el.isConnected ? go(1) : clearInterval(timer)), 1200); };
    seg(el, ".at-sc", (v) => { mode = v; draw(); });
    q(".at-sort").onchange = () => { const cur = order[i]; sortBy(); i = Math.max(0, order.indexOf(cur)); draw(); };
    el.querySelectorAll("input").forEach((c) => (c.onchange = draw));
    sortBy(); i = order.findIndex((p) => p.en === "Kampong Chhnang"); if (i < 0) i = 0; draw();
  };
})();
