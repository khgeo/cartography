/* ============================================================
   Navigation charts and 3D maps · Book 1 (khgeo/cartography)
   nav-chart     L3  · aeronautical (LCC) vs nautical (Mercator)
   nautical      L11 · soundings, isobaths, safety contour, tide
   lulc3d        L11 · land cover draped on terrain (2.5D)
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
  const segOn = (el, sel, cb) => el.querySelectorAll(sel + " button").forEach((b) => (b.onclick = () => {
    el.querySelectorAll(sel + " button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); cb(b.dataset.v); }));

  /* ============================================================
     L3 · Aeronautical vs nautical chart projections
     ============================================================ */
  window.EXTRA_SIMS["nav-chart"] = async (el) => {
    const WLD = await window.cartoData("../../assets/data/world_land.json");
    const PP = [104.84, 11.55];                       // Phnom Penh Intl (VDPP)
    const DEST = { bkk: ["បាងកក", 100.75, 13.69], han: ["ហាណូយ", 105.81, 21.22], sin: ["សិង្ហបុរី", 103.99, 1.36],
      tyo: ["តូក្យូ", 139.78, 35.55], syd: ["ស៊ីដនី", 151.18, -33.94], dxb: ["ឌូបៃ", 55.36, 25.25], par: ["ប៉ារីស", 2.55, 49.01] };
    const { cv, ctx, out, q } = shellC(el, "ផែនទីអាកាសចរណ៍ (LCC) និងផែនទីសមុទ្រ (Mercator)",
      `<span class="sim-seg nc-p"><button type="button" data-v="lcc" class="on">LCC · ផែនទីអាកាសចរណ៍</button><button type="button" data-v="merc">Mercator · ផែនទីសមុទ្រ</button><button type="button" data-v="gno">Gnomonic · គូសផ្លូវឆ្ងាយ</button></span>
       <label>ពីភ្នំពេញទៅ <select class="nc-d">${Object.entries(DEST).map(([k, v]) => `<option value="${k}" ${k === "tyo" ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label>
       <label><input type="checkbox" class="nc-gc" checked> <span style="color:#c62828">━</span> រង្វង់ធំ (ផ្លូវខ្លីបំផុត)</label>
       <label><input type="checkbox" class="nc-rl" checked> <span style="color:#1565c0">┅</span> ខ្សែទិសថេរ (rhumb line)</label>`);
    let proj = "lcc";
    const p1 = 10.5 * RAD, p2 = 14.1 * RAD, l0 = 105 * RAD, f0 = 12.3 * RAD;
    const tq = (p) => Math.tan(Math.PI / 4 + p / 2);
    const n = Math.log(Math.cos(p1) / Math.cos(p2)) / Math.log(tq(p2) / tq(p1));
    const F = (Math.cos(p1) * Math.pow(tq(p1), n)) / n, r0 = F / Math.pow(tq(f0), n);
    const wrap = (d) => ((d + 540) % 360) - 180;
    let gc0 = [105, 15];                               // gnomonic centre (set to the route midpoint)
    const P = {
      gno: (lo, la) => { const f = la * RAD, l = lo * RAD, f1 = gc0[1] * RAD, l1 = gc0[0] * RAD;
        const c = Math.sin(f1) * Math.sin(f) + Math.cos(f1) * Math.cos(f) * Math.cos(l - l1);
        if (c < 0.12) {                                 // beyond the horizon: pull the point back onto it (keeps rings fillable)
          const az = Math.atan2(Math.sin(l - l1) * Math.cos(f), Math.cos(f1) * Math.sin(f) - Math.sin(f1) * Math.cos(f) * Math.cos(l - l1)), d = Math.acos(0.12);
          const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(az));
          const l2 = l1 + Math.atan2(Math.sin(az) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
          const c2 = 0.12; return [(Math.cos(f2) * Math.sin(l2 - l1)) / c2, (Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(l2 - l1)) / c2]; }
        return [(Math.cos(f) * Math.sin(l - l1)) / c, (Math.cos(f1) * Math.sin(f) - Math.sin(f1) * Math.cos(f) * Math.cos(l - l1)) / c]; },
      lcc: (lo, la) => { const r = F / Math.pow(tq(clamp(la, -75, 88) * RAD), n), t = n * wrap(lo - 105) * RAD; return [r * Math.sin(t), r0 - r * Math.cos(t)]; },
      merc: (lo, la) => [wrap(lo - 105) * RAD, Math.log(tq(clamp(la, -80, 84) * RAD))],
    };
    const kLcc = (la) => (Math.cos(p1) * Math.pow(tq(p1), n)) / (Math.cos(la * RAD) * Math.pow(tq(la * RAD), n));
    const kMerc = (la) => 1 / Math.cos(la * RAD);
    // geodesy on a sphere (R = 6371 km)
    const R = 6371;
    const gc = (a, b, N = 160) => { const v = ([lo, la]) => [Math.cos(la * RAD) * Math.cos(lo * RAD), Math.cos(la * RAD) * Math.sin(lo * RAD), Math.sin(la * RAD)];
      const A = v(a), B = v(b), om = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1)), pts = [];
      for (let i = 0; i <= N; i++) { const t = i / N, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
        const x = s1 * A[0] + s2 * B[0], y = s1 * A[1] + s2 * B[1], z = s1 * A[2] + s2 * B[2];
        pts.push([Math.atan2(y, x) / RAD, Math.asin(clamp(z, -1, 1)) / RAD]); }
      return { pts, d: om * R }; };
    const brgGC = (a, b) => { const f1 = a[1] * RAD, f2 = b[1] * RAD, dl = (b[0] - a[0]) * RAD;
      return (Math.atan2(Math.sin(dl) * Math.cos(f2), Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl)) / RAD + 360) % 360; };
    const rhumb = (a, b, N = 160) => { const f1 = a[1] * RAD, f2 = b[1] * RAD, dl = wrap(b[0] - a[0]) * RAD;
      const dpsi = Math.log(tq(f2) / tq(f1)), qq = Math.abs(dpsi) > 1e-12 ? (f2 - f1) / dpsi : Math.cos(f1);
      const d = Math.sqrt((f2 - f1) ** 2 + qq * qq * dl * dl) * R, br = (Math.atan2(dl, dpsi) / RAD + 360) % 360, pts = [];
      const s1 = Math.log(tq(f1));
      for (let i = 0; i <= N; i++) { const t = i / N, psi = s1 + t * dpsi; pts.push([a[0] + (t * dl) / RAD, (2 * Math.atan(Math.exp(psi)) - Math.PI / 2) / RAD]); }
      return { pts, d, br }; };
    const W = 640, H = 420;
    const draw = () => {
      fitC(cv, ctx, W, H); const f = P[proj], key = q(".nc-d").value, D = DEST[key], B = [D[1], D[2]];
      const G = gc(PP, B), Rl = rhumb(PP, B); gc0 = G.pts[80];
      // fit the view on both routes (minimum span ≈ 30°)
      let xs = [], ys = [];
      [...G.pts, ...Rl.pts].forEach(([lo, la]) => { const [x, y] = f(lo, la); if (isFinite(x)) { xs.push(x); ys.push(y); } });
      let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, span = Math.max(0.4, (x1 - x0) * 1.25, ((y1 - y0) * 1.25 * W) / H);
      const sc = W / span, X = (x) => W / 2 + (x - cx) * sc, Y = (y) => H / 2 - (y - cy) * sc;
      const line = (pts, close) => { ctx.beginPath(); let prev = null, started = false;
        pts.forEach(([lo, la], i) => { const [x, y] = f(lo, la); const jump = prev !== null && Math.abs(wrap(lo - 105) - prev) > 90; prev = wrap(lo - 105);
          if (!isFinite(x)) { prev = null; started = false; return; }
          (i === 0 || jump || !started) ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); started = true; }); if (close) ctx.closePath(); };
      ctx.fillStyle = "#e3f2fd"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f1ead2"; ctx.strokeStyle = "#a1887f"; ctx.lineWidth = 0.7;
      WLD.land.forEach((ring) => { let bad = false;
        for (let i = 1; i < ring.length; i++) if (Math.abs(wrap(ring[i][0] - 105) - wrap(ring[i - 1][0] - 105)) > 90) { bad = true; break; }
        if (bad && proj !== "gno") return; line(ring, true); ctx.fill(); ctx.stroke(); });
      // graticule
      ctx.strokeStyle = "rgba(84,110,122,.45)"; ctx.lineWidth = 0.7;
      for (let lo = -70; lo <= 280; lo += 10) { const pts = []; for (let la = -70; la <= 84; la += 2) pts.push([lo, la]); line(pts); ctx.stroke(); }
      for (let la = -70; la <= 80; la += 10) { const pts = []; for (let lo = -74; lo <= 284; lo += 2) pts.push([lo, la]); line(pts); ctx.stroke(); }
      // standard parallels (LCC) or equator (Mercator)
      ctx.strokeStyle = "#ef6c00"; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
      (proj === "lcc" ? [10.5, 14.1] : proj === "merc" ? [0] : []).forEach((la) => { const pts = []; for (let lo = -74; lo <= 284; lo += 2) pts.push([lo, la]); line(pts); ctx.stroke(); });
      ctx.setLineDash([]);
      if (q(".nc-rl").checked) { ctx.strokeStyle = "#1565c0"; ctx.lineWidth = 2.6; ctx.setLineDash([9, 6]); line(Rl.pts); ctx.stroke(); ctx.setLineDash([]); }
      if (q(".nc-gc").checked) { ctx.strokeStyle = "#c62828"; ctx.lineWidth = 2.6; line(G.pts); ctx.stroke(); }
      ctx.font = `13px ${font()}`;
      [[PP, "ភ្នំពេញ"], [B, D[0]]].forEach(([p, t]) => { const [x, y] = f(p[0], p[1]);
        ctx.beginPath(); ctx.arc(X(x), Y(y), 5, 0, 7); ctx.fillStyle = "#212121"; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.strokeText(t, X(x) + 8, Y(y) - 6); ctx.fillStyle = "#212121"; ctx.fillText(t, X(x) + 8, Y(y) - 6); });
      ctx.font = `12px ${font()}`; ctx.fillStyle = "#e65100";
      ctx.fillText(proj === "lcc" ? "- - ខ្សែស្របស្តង់ដារ 10,5° និង 14,1°N" : proj === "merc" ? "- - អេក្វាទ័រ (ខ្នាតពិត)" : "ចំណុចកណ្ដាលផ្លូវ = ចំណុចប៉ះរបស់ប្លង់", 10, H - 10);
      const diff = ((Rl.d - G.d) / G.d) * 100;
      const bend = (pts) => { const P0 = f(...pts[0]), P1 = f(...pts[pts.length - 1]), L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]); let m = 0;
        pts.forEach(([lo, la]) => { const [x, y] = f(lo, la); if (isFinite(x)) m = Math.max(m, Math.abs((P1[0] - P0[0]) * (y - P0[1]) - (P1[1] - P0[1]) * (x - P0[0])) / L); });
        return (m / L) * 100; };
      const bG = bend(G.pts), bR = bend(Rl.pts), st = (b) => (b < 0.5 ? "<b>ត្រង់</b>" : `កោង ${fmtN(b, 1)}%`);
      const kTxt = proj === "gno" ? "" : [10.5, 12.3, 14.1].map((la) => fmtN((proj === "lcc" ? kLcc : kMerc)(la), 4)).join(" · ");
      const msg = { lcc: "ផែនទីអាកាសចរណ៍ក្នុងតំបន់៖ រក្សារាង ហើយខ្នាតស្ទើរថេរនៅជិតខ្សែស្របស្តង់ដារ។ សម្រាប់ផ្លូវខ្លីក្នុងសន្លឹកផែនទី (រាប់រយ គម) ខ្សែទាំងពីរស្ទើរត្រង់ ហើយជិតគ្នាណាស់។ សម្រាប់ផ្លូវឆ្ងាយ ខ្សែស្របស្តង់ដារនៅឆ្ងាយពេក៖ ត្រូវប្រើផែនទីផ្សេង។",
        merc: "ខ្សែទិសថេរ (rhumb) ត្រង់ ដូច្នេះអ្នកបើកនាវាកាន់ទិសតែមួយតាមត្រីវិស័យ។ ផ្លូវខ្លីបំផុតកោងទៅប៉ូល។",
        gno: "គ្រប់រង្វង់ធំជាខ្សែត្រង់ ប៉ុន្តែមុំ និងខ្នាតខុស។ អ្នករុករកគូសផ្លូវខ្លីបំផុតនៅទីនេះ រួចផ្ទេរចំណុចតាមផ្លូវទៅ Mercator ឬ LCC ជាខ្សែខ្លីៗ។" }[proj];
      out.innerHTML = `<b>${{ lcc: "LCC (ផែនទីអាកាសចរណ៍)", merc: "Mercator (ផែនទីសមុទ្រ)", gno: "Gnomonic" }[proj]}</b>៖ ${msg}` +
        `<br><span style="color:#c62828">រង្វង់ធំ</span> ${fmtN(G.d)} គម (${fmtN(G.d / 1.852)} NM) · ទិសចេញ ${fmtN(brgGC(PP, B))}° ហើយប្ដូរតាមផ្លូវ · លើផែនទីនេះ ${st(bG)}` +
        `<br><span style="color:#1565c0">ខ្សែទិសថេរ</span> ${fmtN(Rl.d)} គម (វែងជាង ${fmtN(diff, 1)}%) · ទិសថេរ ${fmtN(Rl.br)}° · លើផែនទីនេះ ${st(bR)}` +
        (kTxt ? `<br><span class="sim-hint">មេគុណខ្នាតនៅរយៈទទឹង 10,5° · 12,3° · 14,1°N (គែមខាងត្បូង កណ្ដាល ខាងជើងកម្ពុជា)៖ ${kTxt}។ ` +
        (proj === "lcc" ? "ខុសគ្នាតិចជាង ០,១% ដូច្នេះប្រើរបារមាត្រដ្ឋានតែមួយបានទូទាំងប្រទេស។" : "ខុសគ្នាប្រហែល ១,៤% ដូច្នេះវាស់ចម្ងាយលើខ្នាតរយៈទទឹងនៅរយៈទទឹងដដែល (១′ = ១ NM)។") + "</span>" : "");
    };
    segOn(el, ".nc-p", (v) => { proj = v; draw(); });
    el.querySelectorAll("select,input").forEach((c) => c.addEventListener("change", draw));
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ============================================================
     L11 · Nautical chart: soundings, isobaths and the safety contour
     ============================================================ */
  window.EXTRA_SIMS["nautical"] = (el) => {
    const { cv, ctx, out, q } = shellC(el, "ផែនទីសមុទ្រ៖ លេខជម្រៅ ខ្សែជម្រៅ និងខ្សែសុវត្ថិភាព",
      `<label>ជម្រៅលិចនាវា (draught) <input class="na-dr" type="range" min="1" max="9" step="0.5" value="4"> <b class="na-drv"></b></label>
       <label>កម្ពស់ជំនោរលើ Chart Datum <input class="na-td" type="range" min="0" max="3" step="0.1" value="0"> <b class="na-tdv"></b></label>
       <span class="sim-seg na-r"><button type="button" data-v="a" class="on">ផ្លូវ ក · តាមព្រែក</button><button type="button" data-v="b">ផ្លូវ ខ · កាត់ផ្លូវខ្លី</button></span>
       <label><input type="checkbox" class="na-s" checked> លេខជម្រៅ</label><label><input type="checkbox" class="na-c" checked> ខ្សែជម្រៅ</label>`);
    const W = 640, H = 440, M = { x: 44, y: 30, w: 552, h: 380 };
    // synthetic bay (illustrative only, not a real place)
    const coast = (x) => 0.26 + 0.07 * Math.sin(5.5 * x + 0.6) + 0.05 * Math.sin(13 * x) - 0.12 * Math.exp(-((x - 0.55) ** 2) / 0.006);
    const g2 = (x, y, cx, cy, s) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s));
    const port = [0.3, coast(0.3) + 0.012], chA = [[0.3, coast(0.3)], [0.33, 0.55], [0.2, 1.02]];
    const segD = (x, y, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], t = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy), 0, 1);
      return Math.hypot(x - a[0] - t * vx, y - a[1] - t * vy); };
    const depth = (x, y) => {
      let d = y - coast(x);
      if (d < 0) return -3 + d * 30;                         // land
      let z = 26 * (1 - Math.exp(-d * 3.4)) - 1.2;            // shelving coast (drying strip near shore)
      z += 6 * y * y + 0.5 * Math.sin(37 * x + 11 * y) + 0.35 * Math.sin(23 * y - 17 * x);
      z -= 19 * g2(x, y, 0.52, 0.62, 0.07);                  // sand bank
      z -= 9 * g2(x, y, 0.13, 0.5, 0.04);                    // reef near the western point
      z -= 34 * g2(x, y, 0.78, 0.72, 0.035);                  // island
      const ch = Math.min(segD(x, y, chA[0], chA[1]), segD(x, y, chA[1], chA[2]));
      if (ch < 0.018) z = Math.max(z, 10.4);                  // dredged channel, maintained at 10 m
      return z;
    };
    const NX = 184, NY = 127, grid = new Float32Array((NX + 1) * (NY + 1));
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) grid[j * (NX + 1) + i] = depth(i / NX, j / NY);
    const ISO = [0, 2, 5, 10, 20];
    const PX = (x) => M.x + x * M.w, PY = (y) => M.y + y * M.h;
    // jittered sounding positions (deterministic)
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const SND = []; for (let j = 0; j < 13; j++) for (let i = 0; i < 19; i++) { const x = (i + 0.2 + 0.6 * rnd()) / 19, y = (j + 0.2 + 0.6 * rnd()) / 13; SND.push([x, y]); }
    const routes = { a: [port, chA[1], chA[2]], b: [port, [0.47, 0.62], [0.55, 1.02]] };
    let route = "a";
    const draw = () => {
      fitC(cv, ctx, W, H);
      const dr = +q(".na-dr").value, td = +q(".na-td").value, ukc = 0.5;
      q(".na-drv").textContent = fmtN(dr, 1) + " ម"; q(".na-tdv").textContent = fmtN(td, 1) + " ម";
      const need = Math.max(0, dr + ukc - td), safe = ISO.find((v) => v >= need) ?? 20;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      // depth tints (ECDIS-like): land · drying · shallower than safety contour · to 20 m · deep
      const cw = M.w / NX, chh = M.h / NY;
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
        const z = (grid[j * (NX + 1) + i] + grid[j * (NX + 1) + i + 1] + grid[(j + 1) * (NX + 1) + i] + grid[(j + 1) * (NX + 1) + i + 1]) / 4;
        ctx.fillStyle = z < -1.5 ? "#f2dc9b" : z < 0 ? "#b5cf95" : z < safe ? "#8ec5ec" : z < 20 ? "#d4e9f8" : "#ffffff";
        ctx.fillRect(PX(i / NX) - 0.3, PY(j / NY) - 0.3, cw + 0.6, chh + 0.6);
      }
      // isobaths by marching squares
      if (q(".na-c").checked) ISO.forEach((lv) => {
        ctx.beginPath(); ctx.strokeStyle = lv === safe ? "#0d47a1" : lv === 0 ? "#558b2f" : "#5c7f99"; ctx.lineWidth = lv === safe ? 2.6 : 0.9;
        for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
          const a = grid[j * (NX + 1) + i] - lv, b = grid[j * (NX + 1) + i + 1] - lv, c = grid[(j + 1) * (NX + 1) + i + 1] - lv, d = grid[(j + 1) * (NX + 1) + i] - lv;
          const pts = [];
          if ((a < 0) !== (b < 0)) pts.push([i + a / (a - b), j]);
          if ((b < 0) !== (c < 0)) pts.push([i + 1, j + b / (b - c)]);
          if ((d < 0) !== (c < 0)) pts.push([i + d / (d - c), j + 1]);
          if ((a < 0) !== (d < 0)) pts.push([i, j + a / (a - d)]);
          for (let k = 0; k + 1 < pts.length; k += 2) { ctx.moveTo(PX(pts[k][0] / NX), PY(pts[k][1] / NY)); ctx.lineTo(PX(pts[k + 1][0] / NX), PY(pts[k + 1][1] / NY)); }
        }
        ctx.stroke();
      });
      // channel limits
      ctx.setLineDash([7, 4]); ctx.strokeStyle = "#ad1457"; ctx.lineWidth = 1.1;
      [-0.018, 0.018].forEach((o) => { ctx.beginPath(); chA.forEach(([x, y], i) => (i ? ctx.lineTo(PX(x + o), PY(y)) : ctx.moveTo(PX(x + o), PY(y)))); ctx.stroke(); });
      ctx.setLineDash([]);
      // soundings: truncated (never rounded up) to decimetres when < 21 m
      ctx.textAlign = "center";
      if (q(".na-s").checked) SND.forEach(([x, y]) => { const z = depth(x, y); if (z < 0.05) return;
        const deep = z >= 21, m = Math.floor(z), dm = Math.floor((z - m) * 10);
        ctx.font = `italic 12px ${font()}`; ctx.fillStyle = "#263238"; ctx.fillText(String(m), PX(x) - (deep ? 0 : 3), PY(y) + 4);
        if (!deep) { ctx.font = `italic 9px ${font()}`; ctx.fillText(String(dm), PX(x) + (m >= 10 ? 9 : 6), PY(y) + 8); } });
      ctx.textAlign = "start";
      // route and its shallowest point
      const R = routes[route]; let minZ = 99, minP = null;
      for (let s = 0; s + 1 < R.length; s++) for (let t = 0; t <= 1; t += 0.01) { const x = R[s][0] + t * (R[s + 1][0] - R[s][0]), y = R[s][1] + t * (R[s + 1][1] - R[s][1]);
        const z = depth(x, y); if (y > coast(x) + 0.03 && z < minZ) { minZ = z; minP = [x, y]; } }
      const real = minZ + td, clr = real - dr, ok = clr >= ukc;
      ctx.strokeStyle = ok ? "#2e7d32" : "#c62828"; ctx.lineWidth = 3; ctx.beginPath(); R.forEach(([x, y], i) => (i ? ctx.lineTo(PX(x), PY(y)) : ctx.moveTo(PX(x), PY(y)))); ctx.stroke();
      if (minP) { ctx.beginPath(); ctx.arc(PX(minP[0]), PY(minP[1]), 7, 0, 7); ctx.strokeStyle = ok ? "#2e7d32" : "#c62828"; ctx.lineWidth = 2.5; ctx.stroke(); }
      // port, island and labels
      ctx.fillStyle = "#4e342e"; ctx.fillRect(PX(port[0]) - 5, PY(port[1]) - 12, 10, 8);
      ctx.font = `12px ${font()}`; ctx.fillStyle = "#3e2723"; ctx.fillText("កំពង់ផែ", PX(port[0]) + 8, PY(port[1]) - 6);
      ctx.fillText("កោះ", PX(0.775), PY(0.725)); ctx.fillStyle = "#1a237e"; ctx.fillText("ច្រាំងខ្សាច់", PX(0.47), PY(0.66));
      // Mercator frame: latitude scale (1′ = 1 NM) on both sides, longitude scale top and bottom
      const latMin = 10 * 60 + 30, mins = 10, ppm = M.h / mins;
      for (let k = 0; k < mins; k++) for (const xx of [M.x - 8, M.x + M.w]) { ctx.fillStyle = k % 2 ? "#fff" : "#212121"; ctx.fillRect(xx, M.y + M.h - (k + 1) * ppm, 8, ppm); }
      const lonM = M.w / (ppm * Math.cos(10.58 * RAD));
      for (let k = 0; k < Math.floor(lonM); k++) for (const yy of [M.y - 8, M.y + M.h]) { ctx.fillStyle = k % 2 ? "#fff" : "#212121"; ctx.fillRect(M.x + k * ppm * Math.cos(10.58 * RAD), yy, ppm * Math.cos(10.58 * RAD), 8); }
      ctx.strokeStyle = "#212121"; ctx.lineWidth = 1; ctx.strokeRect(M.x - 8, M.y - 8, M.w + 16, M.h + 16); ctx.strokeRect(M.x, M.y, M.w, M.h);
      ctx.font = `11px ${font()}`; ctx.fillStyle = "#212121";
      [0, 5, 10].forEach((k) => { const v = latMin + k; ctx.fillText(`${Math.floor(v / 60)}°${String(v % 60).padStart(2, "0")}′`, 2, M.y + M.h - k * ppm + 4); });
      ctx.fillText("ខ្នាតរយៈទទឹង៖ ១ ចំណែក = ១′ = ១ NM = ១ ៨៥២ ម", M.x, H - 6);
      ctx.textAlign = "right"; ctx.fillText("ផែនទីសាកល្បង · មិនមែនទីតាំងពិត · ជម្រៅជាម៉ែត្រ ក្រោម Chart Datum", M.x + M.w + 8, 14); ctx.textAlign = "start";
      out.innerHTML = `ជម្រៅត្រូវការ = draught ${fmtN(dr, 1)} + ចន្លោះក្រោមកប៉ាល់ ${fmtN(ukc, 1)} − ជំនោរ ${fmtN(td, 1)} = <b>${fmtN(need, 1)} ម</b> ` +
        `→ <b style="color:#0d47a1">ខ្សែសុវត្ថិភាព ${fmtN(safe)} ម</b> (ខ្សែជម្រៅស្តង់ដារបន្ទាប់ដែលជ្រៅជាង)។ ផ្ទៃពណ៌ខៀវខ្លាំងជាតំបន់គ្រោះថ្នាក់។` +
        `<br>ផ្លូវ ${route === "a" ? "ក" : "ខ"}៖ ចំណុចរាក់បំផុត ${fmtN(Math.max(0, minZ), 1)} ម លើផែនទី + ជំនោរ = ${fmtN(Math.max(0, real), 1)} ម · ចន្លោះក្រោមកប៉ាល់ ${fmtN(clr, 1)} ម ` +
        (ok ? `<b style="color:#2e7d32">✓ ឆ្លងកាត់បាន</b>` : `<b style="color:#c62828">✗ មានហានិភ័យជាប់ដី</b>`) +
        `<br><span class="sim-hint">លេខជម្រៅត្រូវកាត់ចុះ (ឧ. ៤,៧៩ → ៤₇) មិនបង្គត់ឡើងទេ៖ ផែនទីសមុទ្រតែងបង្ហាញឲ្យរាក់ជាងពិតបន្តិច ដើម្បីសុវត្ថិភាព។</span>`;
    };
    segOn(el, ".na-r", (v) => { route = v; draw(); });
    el.querySelectorAll("input").forEach((c) => c.addEventListener("input", draw));
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ============================================================
     L11 · 3D land cover on terrain (painter's algorithm, no WebGL)
     ============================================================ */
  window.EXTRA_SIMS["lulc3d"] = async (el) => {
    const D = await window.cartoData("../../assets/data/lulc3d.json");
    const { cv, ctx, out, q } = shellC(el, "ផែនទីគម្របដីបីវិមាត្រ៖ កម្ពុជា ឆ្នាំ ២០០៣",
      `<label>ពង្រីកកម្ពស់ <input class="l3-ex" type="range" min="1" max="40" step="1" value="15"> <b class="l3-exv"></b></label>
       <label>ទិសមើល <input class="l3-az" type="range" min="-180" max="180" step="1" value="0"> <b class="l3-azv"></b></label>
       <label>មុំទំនោរ <input class="l3-tl" type="range" min="15" max="90" step="1" value="40"> <b class="l3-tlv"></b></label>
       <span class="sim-seg l3-sun"><button type="button" data-v="315" class="on">ព្រះអាទិត្យ ពាយ័ព្យ ៣១៥°</button><button type="button" data-v="135">អាគ្នេយ៍ ១៣៥°</button><button type="button" data-v="off">គ្មានស្រមោល</button></span>
       <button type="button" class="sim-btn l3-top">មើលពីលើ</button><button type="button" class="sim-btn l3-spin">▶ បង្វិល</button>
       <span class="sim-hint">អូសលើផែនទីដើម្បីបង្វិល និងទំនោរ។ ចុចលើសញ្ញាសម្គាល់ ដើម្បីបន្លិចប្រភេទមួយ។</span>`);
    const wrap = el.querySelector(".sim-canvas-wrap");
    const leg = document.createElement("div"); leg.className = "l3-leg";
    leg.style.cssText = "display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.68rem;margin-top:6px";
    el.querySelector(".sim-body").after(leg);
    const { nr, nc, cell } = D, N = nr * nc, h = D.h, K = D.k;
    const cls = new Int8Array(N); for (let i = 0; i < N; i++) cls[i] = K.charCodeAt(i) === 46 ? -1 : K.charCodeAt(i) - 65;
    let hl = -1, sun = "315", spin = null;
    leg.innerHTML = D.cls.map(([t, c, p], i) => `<span class="l3-li" data-i="${i}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:1px 4px;border-radius:4px"><i style="width:14px;height:10px;display:inline-block;border:1px solid #0004;background:rgb(${c})"></i>${t} <small style="opacity:.7">${fmtN(p, 1)}%</small></span>`).join("");
    // quads: cells whose four corners are valid
    const quads = []; for (let r = 0; r < nr - 1; r++) for (let c = 0; c < nc - 1; c++) { const a = r * nc + c;
      if (cls[a] >= 0 && cls[a + 1] >= 0 && cls[a + nc] >= 0 && cls[a + nc + 1] >= 0) quads.push(a); }
    const has = new Uint8Array(N); quads.forEach((a) => (has[a] = 1));
    const xw = (c) => (c - (nc - 1) / 2) * cell, yw = (r) => ((nr - 1) / 2 - r) * cell;
    const W = 680, H = 470, BASE = -9000;
    const order = new Uint32Array(quads.length), key = new Float64Array(quads.length);
    const draw = () => {
      const s = fitC(cv, ctx, W, H);
      const ex = +q(".l3-ex").value, az = +q(".l3-az").value * RAD, tl = +q(".l3-tl").value * RAD;
      q(".l3-exv").textContent = "×" + kh(ex); q(".l3-azv").textContent = kh(Math.round(+q(".l3-az").value)) + "°"; q(".l3-tlv").textContent = kh(+q(".l3-tl").value) + "°";
      const ca = Math.cos(az), sa = Math.sin(az), st = Math.sin(tl), ct = Math.cos(tl);
      const P = (x, y, z) => { const X = x * ca - y * sa, Y = x * sa + y * ca; return [X, Y * st + z * ct, Y * ct - z * st]; };
      // fit: project the slab corners
      let mx0 = 1e12, mx1 = -1e12, my0 = 1e12, my1 = -1e12;
      for (let i = 0; i < quads.length; i += 3) { const a = quads[i], r = (a / nc) | 0, c = a % nc;
        for (const z of [BASE, h[a] * ex]) { const p = P(xw(c), yw(r), z); mx0 = Math.min(mx0, p[0]); mx1 = Math.max(mx1, p[0]); my0 = Math.min(my0, p[1]); my1 = Math.max(my1, p[1]); } }
      my1 += 26000;                                            // room for the place labels
      const k = Math.min((W - 40) / (mx1 - mx0), (H - 30) / (my1 - my0)), ox = W / 2 - ((mx1 + mx0) / 2) * k, oy = H / 2 + ((my1 + my0) / 2) * k;
      const S = (x, y, z) => { const p = P(x, y, z); return [ox + p[0] * k, oy - p[1] * k]; };
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e6e9ee"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // sun vector
      const sA = +sun * RAD, sE = 40 * RAD, L = [Math.sin(sA) * Math.cos(sE), Math.cos(sA) * Math.cos(sE), Math.sin(sE)];
      for (let i = 0; i < quads.length; i++) { const a = quads[i], r = (a / nc) | 0, c = a % nc; order[i] = i;
        key[i] = P(xw(c + 0.5), yw(r + 0.5), h[a] * ex)[2]; }
      order.sort((i, j) => key[j] - key[i]);                  // far → near
      const wallFacing = (nx, ny) => nx * sa + ny * ca < 0;     // outward normal points to the viewer
      for (let o = 0; o < order.length; o++) {
        const a = quads[order[o]], r = (a / nc) | 0, c = a % nc;
        const z00 = h[a] * ex, z01 = h[a + 1] * ex, z10 = h[a + nc] * ex, z11 = h[a + nc + 1] * ex;
        const p00 = S(xw(c), yw(r), z00), p01 = S(xw(c + 1), yw(r), z01), p11 = S(xw(c + 1), yw(r + 1), z11), p10 = S(xw(c), yw(r + 1), z10);
        // side walls on the outer edge of the model
        const wall = (pa, pb, xa, ya, xb, yb) => { const qa = S(xa, ya, BASE), qb = S(xb, yb, BASE);
          ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.lineTo(qb[0], qb[1]); ctx.lineTo(qa[0], qa[1]); ctx.closePath();
          ctx.fillStyle = "#c8b48d"; ctx.fill(); ctx.strokeStyle = "#a89670"; ctx.lineWidth = 0.4; ctx.stroke(); };
        if (r === nr - 2 || !has[a + nc]) { if (wallFacing(0, -1)) wall(p10, p11, xw(c), yw(r + 1), xw(c + 1), yw(r + 1)); }
        if (r === 0 || !has[a - nc]) { if (wallFacing(0, 1)) wall(p00, p01, xw(c), yw(r), xw(c + 1), yw(r)); }
        if (c === 0 || !has[a - 1]) { if (wallFacing(-1, 0)) wall(p00, p10, xw(c), yw(r), xw(c), yw(r + 1)); }
        if (c === nc - 2 || !has[a + 1]) { if (wallFacing(1, 0)) wall(p01, p11, xw(c + 1), yw(r), xw(c + 1), yw(r + 1)); }
        // shade from the surface normal
        let f = 1;
        if (sun !== "off") { const dzx = (z01 + z11 - z00 - z10) / (2 * cell), dzy = (z00 + z01 - z10 - z11) / (2 * cell), nn = Math.hypot(dzx, dzy, 1);
          f = clamp(((-dzx * L[0] - dzy * L[1] + L[2]) / nn) / L[2], 0.35, 1.45); }
        let col = D.cls[cls[a]][1];
        if (hl >= 0 && cls[a] !== hl) { const gr = 0.3 * col[0] + 0.59 * col[1] + 0.11 * col[2]; col = [gr * 0.35 + 150, gr * 0.35 + 150, gr * 0.35 + 150]; }
        const rgb = `rgb(${Math.min(255, col[0] * f) | 0},${Math.min(255, col[1] * f) | 0},${Math.min(255, col[2] * f) | 0})`;
        ctx.beginPath(); ctx.moveTo(p00[0], p00[1]); ctx.lineTo(p01[0], p01[1]); ctx.lineTo(p11[0], p11[1]); ctx.lineTo(p10[0], p10[1]); ctx.closePath();
        ctx.fillStyle = rgb; ctx.fill(); ctx.strokeStyle = rgb; ctx.lineWidth = 0.6; ctx.stroke();
      }
      // place labels
      ctx.font = `bold 12px ${font()}`; ctx.textAlign = "center";
      D.labels.forEach(([t, E, Nn]) => { const c = (E - D.x0) / cell - 0.5, r = (D.y0 - Nn) / cell - 0.5, a = Math.round(r) * nc + Math.round(c);
        const z = (h[a] || 0) * ex, [x0, y0] = S(xw(c), yw(r), z), [x1, y1] = S(xw(c), yw(r), z + 22000);
        ctx.strokeStyle = "#212121"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        const w = ctx.measureText(t).width + 10; ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(x1 - w / 2, y1 - 17, w, 18);
        ctx.fillStyle = "#14181d"; ctx.fillText(t, x1, y1 - 4); });
      ctx.textAlign = "start";
      // north arrow follows the rotation
      const [nx0, ny0] = S(0, 0, 0), [nx1, ny1] = S(0, 60000, 0), ang = Math.atan2(nx1 - nx0, -(ny1 - ny0));
      ctx.save(); ctx.translate(W - 34, 40); ctx.rotate(ang); ctx.fillStyle = "#14181d";
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(7, 6); ctx.lineTo(0, 1); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill();
      ctx.font = `bold 12px ${font()}`; ctx.textAlign = "center"; ctx.fillText("N", 0, -21); ctx.restore(); ctx.textAlign = "start";
      const hmax = Math.max(...h);
      out.innerHTML = `ពង្រីកកម្ពស់ ×${kh(ex)}៖ ចំណុចខ្ពស់បំផុតក្នុងទិន្នន័យ (${fmtN(hmax)} ម) បង្ហាញដូចកម្ពស់ ${fmtN((hmax * ex) / 1000, 1)} គម ` +
        `ខណៈទទឹងប្រទេសប្រហែល ${fmtN(((nc - 1) * cell) / 1000)} គម។ ` + (ex === 1 ? "នៅ ×១ កម្ពុជាមើលទៅស្ទើររាបស្មើ៖ នេះជាសមាមាត្រពិត។" : ex > 25 ? "ការពង្រីកខ្លាំងធ្វើឲ្យភ្នំតូចមើលទៅដូចជួរភ្នំធំ៖ ត្រូវសរសេរ «ពង្រីកកម្ពស់ ×" + kh(ex) + "» លើផែនទីជានិច្ច។" : "") +
        (sun === "135" ? "<br><b style=\"color:#c62828\">ព្រះអាទិត្យពីអាគ្នេយ៍៖ មើលពីលើ ភ្នំអាចមើលទៅដូចជ្រលង (relief inversion)។</b>" : "") +
        `<br><span class="sim-hint">ទិន្នន័យ៖ គម្របដីកម្ពុជា ២០០៣ លើ DEM (ក្រឡា ${fmtN(cell / 1000, 1)} គម) ពីកម្មវិធីជំនួយ LULC Relief 3D សម្រាប់ QGIS របស់អ្នកនិពន្ធ · គូរដោយ painter's algorithm លើ canvas</span>`;
    };
    let t0 = 0; const req = () => { if (!t0) t0 = requestAnimationFrame(() => { t0 = 0; draw(); }); };
    el.querySelectorAll("input").forEach((c) => c.addEventListener("input", req));
    segOn(el, ".l3-sun", (v) => { sun = v; req(); });
    q(".l3-top").onclick = () => { q(".l3-tl").value = 90; q(".l3-az").value = 0; req(); };
    q(".l3-spin").onclick = () => { if (spin) { clearInterval(spin); spin = null; q(".l3-spin").textContent = "▶ បង្វិល"; return; }
      q(".l3-spin").textContent = "■ ឈប់"; spin = setInterval(() => { if (!el.isConnected) return clearInterval(spin); const a = q(".l3-az"); a.value = ((+a.value + 184) % 360) - 180; draw(); }, 90); };
    leg.querySelectorAll(".l3-li").forEach((s) => (s.onclick = () => { const i = +s.dataset.i; hl = hl === i ? -1 : i;
      leg.querySelectorAll(".l3-li").forEach((x) => (x.style.background = +x.dataset.i === hl ? "rgba(0,0,0,.1)" : "")); req(); }));
    let drag = null;
    cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY, +q(".l3-az").value, +q(".l3-tl").value]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (!drag) return;
      q(".l3-az").value = ((drag[2] - (e.clientX - drag[0]) * 0.5 + 540) % 360) - 180; q(".l3-tl").value = clamp(drag[3] + (e.clientY - drag[1]) * 0.3, 15, 90); req(); });
    cv.addEventListener("pointerup", () => (drag = null)); cv.style.touchAction = "none"; cv.style.cursor = "grab";
    draw(); window.addEventListener("resize", () => el.isConnected && req());
  };
})();
