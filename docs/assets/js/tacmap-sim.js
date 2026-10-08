/* ============================================================
   Tactical situation map editor · Book 1 (khgeo/cartography) · Lesson 6
   A browser version of the author's TacMap KH QGIS plugin:
   53 symbols (25 point · 18 line · 10 area) + text, two colour conventions,
   symbols sized in paper millimetres, auto legend, GeoJSON / PNG export.
   Usage: <div class="sim" data-sim="tacmap"></div>
   ============================================================ */
(function () {
  "use strict";
  window.EXTRA_SIMS = window.EXTRA_SIMS || {};
  const KM = "០១២៣៤៥៦៧៨៩";
  const kh = (n) => String(n).replace(/[0-9]/g, (d) => KM[d]);
  const font = () => getComputedStyle(document.body).fontFamily;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PT = 0.3528;                                    // 1 pt in mm

  // ---------------------------------------------------------------- catalog (from TacMap KH catalog.py)
  const CAT = {
    flag_rect: ["p", "ទង់អង្គភាព (ចតុកោណ)", "Unit flag – rectangle", 10], flag_pennant: ["p", "ទង់ត្រីកោណ", "Unit flag – pennant", 10],
    flag_swallow: ["p", "ទង់ចុងបែក", "Unit flag – swallowtail", 10], flag_slant: ["p", "ទង់ចុងទ្រេត", "Unit flag – slanted", 10],
    flag_diag: ["p", "ទង់មានខ្សែទ្រេត", "Unit flag – diagonal", 10], flag_double: ["p", "ទង់ស៊ុមពីរ", "Unit flag – double frame", 10],
    obs_post: ["p", "ប៉ុស្តិ៍សង្កេតការណ៍", "Observation post", 6], key_point: ["p", "ចំណុចសំខាន់", "Key point (triple ring)", 7],
    weapon_pos: ["p", "ទីតាំងអាវុធ (មានទិស)", "Weapon position (directional)", 6], firing_point: ["p", "ចំណុចបាញ់", "Firing point", 6],
    vehicle: ["p", "យានយន្ត / គ្រឿងចក្រ", "Vehicle / equipment", 6], mines: ["p", "មីន", "Mines", 6],
    logistics: ["p", "ចំណុចភស្តុភារ", "Supply point", 5], tank: ["p", "រថក្រោះ", "Tank", 7],
    at_weapon: ["p", "អាវុធប្រឆាំងរថក្រោះ", "Anti-tank weapon", 6], machine_gun: ["p", "កាំភ្លើងយន្ត", "Machine gun", 6],
    mortar: ["p", "កាំភ្លើងត្បាល់", "Mortar", 6], artillery: ["p", "កាំភ្លើងធំ", "Artillery", 7],
    trp: ["p", "ចំណុចយោងគោលដៅ", "Target reference point", 6], roadblock: ["p", "របាំងផ្លូវ", "Roadblock", 6],
    bridge: ["p", "ស្ពាន", "Bridge / crossing", 6], landing_zone: ["p", "ទីចុះឧទ្ធម្ភាគចក្រ", "Helicopter landing zone", 6],
    medical: ["p", "ចំណុចពេទ្យ", "Medical point", 6], checkpoint: ["p", "ប៉ុស្តិ៍ត្រួតពិនិត្យ", "Checkpoint", 6],
    rally_point: ["p", "ចំណុចជួបជុំ", "Rally point", 6],
    boundary_arc: ["l", "ខ្សែព្រំតំបន់ (មានរង្វង់)", "Boundary line with arcs"], trench: ["l", "លេណដ្ឋាន", "Trench line"],
    trench_zigzag: ["l", "លេណដ្ឋានក្រឡាញ់", "Trench – zig-zag"], fortified_line: ["l", "ខ្សែបន្ទាយ", "Fortified line (crenellated)"],
    phase_line: ["l", "ខ្សែដំណាក់កាល", "Phase line"], obstacle_belt: ["l", "ខ្សែឧបសគ្គ", "Obstacle belt"],
    wire: ["l", "របាំងលួសបន្លា", "Wire obstacle"], minefield_line: ["l", "ខ្សែមីន", "Mine line"],
    at_ditch: ["l", "ប្រឡាយប្រឆាំងរថក្រោះ", "Anti-tank ditch"], abatis: ["l", "របាំងដើមឈើ", "Abatis / tree obstacle"],
    route: ["l", "ផ្លូវចលនា", "Movement route"], axis: ["l", "ទិសវាយលុក", "Axis of attack"],
    axis_planned: ["l", "ទិសវាយបកគ្រោងទុក", "Planned / counterattack axis"], fire_direction: ["l", "ទិសបាញ់", "Direction of fire"],
    sector_line: ["l", "ខ្សែវិស័យ", "Sector line"], boundary_dash: ["l", "ខ្សែព្រំ (ដាច់ៗ)", "Dashed boundary", 0, 1],
    boundary_dashdot: ["l", "ខ្សែព្រំអង្គភាព (ដាច់-ចុច)", "Unit boundary (dash-dot)", 0, 1],
    dimension: ["d", "ព្រួញវាស់ចម្ងាយ", "Dimension arrow", 0, 1],
    def_area: ["a", "តំបន់ការពារ (លេណដ្ឋាន)", "Defended area (trench outline)"], assembly: ["a", "តំបន់ប្រមូលផ្តុំ", "Assembly area"],
    zone: ["a", "តំបន់ (ព្រំដាច់ៗ)", "Zone (dashed)"], logistics_area: ["a", "តំបន់ភស្តុភារ", "Logistics area"],
    obstacle_area: ["a", "តំបន់ឧបសគ្គ", "Obstacle area (hatched)"], minefield_area: ["a", "វាលមីន", "Minefield"],
    objective: ["a", "គោលដៅ", "Objective"], impassable: ["a", "តំបន់ឆ្លងកាត់មិនបាន", "Impassable terrain (cross-hatch)"],
    fire_sector: ["s", "វិស័យបាញ់", "Fire sector (fan)"], range_ring: ["c", "រង្វង់ចម្ងាយ", "Range ring"],
  };
  const FLAG_OFF = { flag_rect: [0.40, 0.70], flag_pennant: [0.27, 0.64], flag_swallow: [0.34, 0.70], flag_slant: [0.39, 0.70], flag_diag: [0.40, 0.70], flag_double: [0.40, 0.70] };
  const CONV = { khmer: { own: "#e8173d", enemy: "#1f5fbf", neutral: "#222222" }, nato: { own: "#1f5fbf", enemy: "#e8173d", neutral: "#222222" } };
  const tab = (c) => ({ p: "p", l: "l", d: "l", a: "a", s: "a", c: "a" }[CAT[c][0]]);
  const fmtDist = (m) => { if (m >= 1000) { const k = m / 1000; return kh(k >= 10 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "").replace(".", ",")) + " គ.ម"; }
    return kh(Math.round(m / 5) * 5) + " ម"; };

  // ---------------------------------------------------------------- polyline geometry in screen px
  const segLen = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const cum = (P) => { const c = [0]; for (let i = 1; i < P.length; i++) c.push(c[i - 1] + segLen(P[i - 1], P[i])); return c; };
  const at = (P, C, d) => { let i = 1; while (i < P.length - 1 && C[i] < d) i++;
    const a = P[i - 1], b = P[i], L = C[i] - C[i - 1] || 1, t = clamp((d - C[i - 1]) / L, 0, 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(b[1] - a[1], b[0] - a[0])]; };
  // offset o (px): positive = visual right of the drawing direction, as in QGIS marker lines
  const along = (P, interval, start, off, fn) => { if (P.length < 2) return; const C = cum(P), L = C[C.length - 1];
    for (let d = start; d <= L + 1e-6; d += interval) { const [x, y, a] = at(P, C, d); fn(x - Math.sin(a) * off, y + Math.cos(a) * off, a); } };
  const offsetLine = (P, o) => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return [p[0] - Math.sin(an) * o, p[1] + Math.cos(an) * o]; });
  const smooth = (P, n = 10) => { if (P.length < 3) return P; const out = [];
    for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
    out.push(P[P.length - 1]); return out; };
  const wave = (P, wl, amp, square) => { const C = cum(P), L = C[C.length - 1], out = []; if (L < 1) return P;
    const step = wl / 4; let k = 0;
    for (let d = 0; d <= L; d += step, k++) { const [x, y, a] = at(P, C, d), nx = -Math.sin(a), ny = Math.cos(a);
      if (square) { const s = Math.floor(d / (wl / 2)) % 2 ? -amp : amp, d2 = Math.min(L, d + step), q = at(P, C, d2);
        out.push([x + nx * s, y + ny * s]); if (k % 2 === 1) { out.push([q[0] + nx * s, q[1] + ny * s]); out.push([q[0] - nx * s, q[1] - ny * s]); } }
      else { const s = [0, amp, 0, -amp][k % 4]; out.push([x + nx * s, y + ny * s]); } }
    return out; };
  const path = (ctx, P, close) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (close) ctx.closePath(); };
  const areaS = (R) => { let s = 0; for (let i = 0; i < R.length; i++) { const a = R[i], b = R[(i + 1) % R.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  const centroid = (R) => { let A = 0, x = 0, y = 0; for (let i = 0; i < R.length; i++) { const a = R[i], b = R[(i + 1) % R.length], f = a[0] * b[1] - b[0] * a[1]; A += f; x += (a[0] + b[0]) * f; y += (a[1] + b[1]) * f; }
    return Math.abs(A) < 1e-9 ? R[0] : [x / (3 * A), y / (3 * A)]; };

  // ---------------------------------------------------------------- marker shapes (QGIS simple markers), local frame x along the line
  const marker = (ctx, kind, x, y, ang, s, col, sw, fill) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = sw; ctx.lineJoin = "miter";
    const r = s / 2; ctx.beginPath();
    if (kind === "tick") { ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke(); }
    else if (kind === "circle") { ctx.arc(0, 0, r, 0, 7); fill ? ctx.fill() : ctx.stroke(); }
    else if (kind === "halfarc") { ctx.arc(0, 0, r, 0, Math.PI); ctx.stroke(); }
    else if (kind === "cross") { ctx.moveTo(-r * 0.7, -r * 0.7); ctx.lineTo(r * 0.7, r * 0.7); ctx.moveTo(-r * 0.7, r * 0.7); ctx.lineTo(r * 0.7, -r * 0.7); ctx.stroke(); }
    else if (kind === "head") { ctx.moveTo(0, 0); ctx.lineTo(-s, -r * 0.8); ctx.lineTo(-s, r * 0.8); ctx.closePath(); ctx.fill(); }
    else if (kind === "diamond") { ctx.moveTo(-r, 0); ctx.lineTo(0, -r * 0.6); ctx.lineTo(r, 0); ctx.lineTo(0, r * 0.6); ctx.closePath(); ctx.fillStyle = "#fff"; ctx.fill(); ctx.stroke(); }
    else if (kind === "tri") { ctx.moveTo(-r, r * 0.55); ctx.lineTo(r, r * 0.55); ctx.lineTo(0, -r * 1.1); ctx.closePath(); ctx.fill(); }
    else if (kind === "vee") { ctx.moveTo(-r * 0.8, r * 0.3); ctx.lineTo(0, -r * 0.9); ctx.lineTo(r * 0.8, r * 0.3); ctx.stroke(); }
    ctx.restore(); };

  // block arrow along a smoothed line (QgsArrowSymbolLayer)
  const arrow = (ctx, P, u, o) => { const S = smooth(P), C = cum(S), L = C[C.length - 1]; if (L < 2) return;
    const hl = Math.min(o.head * u, L * 0.6), w = o.w * u / 2, ht = o.thick * u;
    const cut = (from, to) => { const pts = []; for (let i = 0; i < S.length; i++) if (C[i] > from && C[i] < to) pts.push(S[i]); return [at(S, C, from), ...pts, at(S, C, to)]; };
    const body = cut(o.dbl ? hl : 0, L - hl), left = offsetLine(body, -w), right = offsetLine(body, w).reverse();
    const tip = at(S, C, L), hb = at(S, C, L - hl), nx = -Math.sin(hb[2]), ny = Math.cos(hb[2]);
    const poly = [...left, [hb[0] - nx * (w + ht), hb[1] - ny * (w + ht)], [tip[0], tip[1]], [hb[0] + nx * (w + ht), hb[1] + ny * (w + ht)], ...right];
    if (o.dbl) { const t0 = at(S, C, 0), h0 = at(S, C, hl), mx = -Math.sin(h0[2]), my = Math.cos(h0[2]);
      poly.push([h0[0] + mx * (w + ht), h0[1] + my * (w + ht)], [t0[0], t0[1]], [h0[0] - mx * (w + ht), h0[1] - my * (w + ht)]); }
    path(ctx, poly, true); ctx.fillStyle = o.fill; ctx.fill();
    ctx.strokeStyle = o.col; ctx.lineWidth = o.sw * u; if (o.dash) ctx.setLineDash(o.dash.map((v) => v * u)); ctx.stroke(); ctx.setLineDash([]); };

  const alpha = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  // ---------------------------------------------------------------- symbol renderers (u = px per mm)
  const drawLine = (ctx, code, P, col, u) => {
    if (P.length < 2) return;
    const ln = (w, dash) => { path(ctx, P); ctx.strokeStyle = col; ctx.lineWidth = w * u; ctx.lineJoin = "round"; ctx.setLineDash(dash ? dash.map((v) => v * u) : []); ctx.stroke(); ctx.setLineDash([]); };
    const mk = (kind, s, interval, off, start, sw, fill) => along(P, interval * u, (start || interval / 2) * u, off * u, (x, y, a) => marker(ctx, kind, x, y, a, s * u, col, sw * u, fill));
    switch (code) {
      case "boundary_arc": ln(0.8); mk("halfarc", 7, 45, 0, 20, 0.8); break;
      case "trench": ln(0.55); mk("tick", 1.4, 3.5, -0.7, 1.75, 0.45); mk("circle", 0.9, 3.5, -1.45, 1.75, 0.1, true); break;
      case "obstacle_belt": mk("circle", 2.0, 2.0, 0.9, 1, 0.35); mk("circle", 2.0, 2.0, -0.9, 2, 0.35); break;
      case "wire": ln(0.35); mk("cross", 2.0, 4, 0, 2, 0.4); break;
      case "route": ln(0.45, [3, 1.5]); { const a = P[P.length - 2], b = P[P.length - 1]; marker(ctx, "head", b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]), 3 * u, col, 0.2 * u); } break;
      case "fire_direction": ln(0.45); { const a = P[P.length - 2], b = P[P.length - 1]; marker(ctx, "head", b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]), 3 * u, col, 0.2 * u); } break;
      case "axis": arrow(ctx, P, u, { w: 2.2, head: 5, thick: 3, fill: col, col, sw: 0.3 }); break;
      case "axis_planned": arrow(ctx, P, u, { w: 2.2, head: 5, thick: 3, fill: "rgba(255,255,255,.9)", col, sw: 0.5, dash: [2.5, 1.5] }); break;
      case "dimension": arrow(ctx, P, u, { w: 0.25, head: 2.8, thick: 1.1, fill: col, col, sw: 0.1, dbl: true }); break;
      case "trench_zigzag": path(ctx, wave(P, 3 * u, 0.9 * u, false)); ctx.strokeStyle = col; ctx.lineWidth = 0.5 * u; ctx.lineJoin = "miter"; ctx.stroke(); break;
      case "fortified_line": path(ctx, wave(P, 3 * u, 0.8 * u, true)); ctx.strokeStyle = col; ctx.lineWidth = 0.5 * u; ctx.lineJoin = "miter"; ctx.stroke(); break;
      case "phase_line": ln(0.9); break;
      case "minefield_line": ln(0.3, [1.5, 1.5]); mk("diamond", 1.9, 3.5, 0, 1.75, 0.35); break;
      case "at_ditch": ln(0.45); mk("tri", 2.0, 3, -0.85, 1.5, 0.1); break;
      case "abatis": ln(0.3); mk("vee", 2.2, 3, -0.6, 1.5, 0.45); break;
      case "boundary_dashdot": ln(0.6, [6, 1.5, 1, 1.5]); break;
      case "boundary_dash": ln(0.6, [5, 2.5]); break;
      default: ln(0.45);                                     // sector_line
    }
  };
  const hatch = (ctx, R, angs, gap, w, col) => { ctx.save(); path(ctx, R, true); ctx.clip();
    const xs = R.map((p) => p[0]), ys = R.map((p) => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const rad = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + gap;
    ctx.strokeStyle = col; ctx.lineWidth = w;
    angs.forEach((a) => { const t = (a * Math.PI) / 180, dx = Math.cos(t), dy = -Math.sin(t); ctx.beginPath();
      for (let k = -rad; k <= rad; k += gap) { const ox = cx - dy * k, oy = cy + dx * k; ctx.moveTo(ox - dx * rad, oy - dy * rad); ctx.lineTo(ox + dx * rad, oy + dy * rad); } ctx.stroke(); });
    ctx.restore(); };
  const drawArea = (ctx, code, R, col, u) => {
    if (R.length < 3) return;
    const outline = (w, dash) => { path(ctx, R, true); ctx.strokeStyle = col; ctx.lineWidth = w * u; ctx.setLineDash(dash ? dash.map((v) => v * u) : []); ctx.stroke(); ctx.setLineDash([]); };
    const tint = (a) => { path(ctx, R, true); ctx.fillStyle = alpha(col, a); ctx.fill(); };
    switch (code) {
      case "def_area": { tint(18 / 255); let Q = R.slice(); if (areaS(Q) < 0) Q.reverse(); Q = [...Q, Q[0]];   // visually clockwise → right side is inside
        path(ctx, Q); ctx.strokeStyle = col; ctx.lineWidth = 0.55 * u; ctx.stroke();
        along(Q, 3.5 * u, 1.75 * u, 0.7 * u, (x, y, a) => marker(ctx, "tick", x, y, a, 1.4 * u, col, 0.45 * u));
        along(Q, 3.5 * u, 1.75 * u, 1.45 * u, (x, y, a) => marker(ctx, "circle", x, y, a, 0.9 * u, col, 0.1 * u, true)); break; }
      case "assembly": outline(0.45, [3, 1.5]); break;
      case "zone": outline(0.6, [6, 2.5]); break;
      case "logistics_area": outline(0.5); break;
      case "fire_sector": tint(14 / 255); outline(0.4); break;
      case "range_ring": outline(0.4, [4, 1.5, 1, 1.5]); break;
      case "objective": tint(22 / 255); outline(1.0); break;
      case "minefield_area": { ctx.save(); path(ctx, R, true); ctx.clip(); const xs = R.map((p) => p[0]), ys = R.map((p) => p[1]), g = 4 * u;
        for (let y = Math.min(...ys) - g, j = 0; y < Math.max(...ys) + g; y += g, j++) for (let x = Math.min(...xs) - g + (j % 2) * g / 2; x < Math.max(...xs) + g; x += g) marker(ctx, "diamond", x, y, 0, 1.8 * u, col, 0.35 * u);
        ctx.restore(); outline(0.45); break; }
      case "impassable": hatch(ctx, R, [45, 135], 2.5 * u, 0.2 * u, col); outline(0.45); break;
      case "obstacle_area": hatch(ctx, R, [45], 2 * u, 0.25 * u, col); outline(0.45); break;
    }
  };
  // SVG point markers, recoloured per side and cached
  const svgCache = {};
  const svgImg = (SVG, code, col, sizeMm) => { const k = code + col + sizeMm; if (svgCache[k]) return svgCache[k];
    const sw = ((0.45 * 40) / sizeMm).toFixed(2);
    const s = SVG[code].replace(/#e8173d/gi, col).replace(/stroke-width="2"/g, `stroke-width="${sw}"`);
    const im = new Image(); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s); svgCache[k] = im; return im; };
  const drawPoint = (ctx, SVG, f, col, u, redraw) => {
    const size = f.z || CAT[f.s][3], px = size * u, im = svgImg(SVG, f.s, col, size), [x, y] = f.p;
    if (!im.complete) { im.onload = redraw; return; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(((f.r || 0) * Math.PI) / 180);
    if (f.s.startsWith("flag_")) ctx.drawImage(im, -px * 4 / 40, -px * 39 / 40, px, px);   // pole foot on the point
    else ctx.drawImage(im, -px / 2, -px / 2, px, px);
    ctx.restore(); };

  const text = (ctx, s, x, y, sizePt, col, u, o = {}) => { const fs = sizePt * PT * u; if (fs < 3) return;
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    ctx.font = `${o.bold ? "bold " : ""}${fs}px ${font()}`; ctx.textAlign = o.align || "center"; ctx.textBaseline = "middle";
    const lines = String(s).split("\n"), lh = fs * 1.35;
    lines.forEach((t, i) => { const yy = (i - (lines.length - 1) / 2) * lh;
      if (o.buffer !== false) { ctx.lineWidth = 0.7 * u * 2; ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineJoin = "round"; ctx.strokeText(t, 0, yy); }
      ctx.fillStyle = col; ctx.fillText(t, 0, yy); });
    ctx.restore(); };

  // UTM zone 48N (WGS 84) → lon/lat, for GeoJSON export (RFC 7946 requires WGS 84)
  const utm2ll = (E, N) => { const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996, e2 = f * (2 - f), ep2 = e2 / (1 - e2), x = E - 500000, M = N / k0;
    const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256)), e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const p1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu);
    const C1 = ep2 * Math.cos(p1) ** 2, T1 = Math.tan(p1) ** 2, N1 = a / Math.sqrt(1 - e2 * Math.sin(p1) ** 2), R1 = a * (1 - e2) / (1 - e2 * Math.sin(p1) ** 2) ** 1.5, Dd = x / (N1 * k0);
    const lat = p1 - (N1 * Math.tan(p1) / R1) * (Dd * Dd / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * Dd ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * Dd ** 6 / 720);
    const lon = (Dd - (1 + 2 * T1 + C1) * Dd ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * Dd ** 5 / 120) / Math.cos(p1);
    return [+(105 + (lon * 180) / Math.PI).toFixed(7), +((lat * 180) / Math.PI).toFixed(7)]; };

  // ================================================================ the simulator
  window.EXTRA_SIMS["tacmap"] = async (el) => {
    const D = await window.cartoData("../../assets/data/tacmap.json"), SVG = D.svg, B = D.base;
    const W = 720, H = 520, STORE = "khgeo-tacmap-v1";
    el.innerHTML = `<div class="sim-title">ផែនទីស្ថានការណ៍៖ គូស និងរចនាសញ្ញាដោយខ្លួនឯង</div>
      <div class="sim-controls tm-row">
        <span class="sim-seg tm-conv"><button type="button" data-v="khmer" class="on">ខ្មែរ/សូវៀត · យើង=ក្រហម</button><button type="button" data-v="nato">NATO APP-6 · យើង=ខៀវ</button></span>
        <span class="sim-seg tm-side"><button type="button" data-v="own" class="on">កម្លាំងយើង</button><button type="button" data-v="enemy">សត្រូវ</button><button type="button" data-v="neutral">អព្យាក្រឹត</button></span>
      </div>
      <div class="sim-controls tm-row">
        <label>លេខអង្គភាព <input class="tm-lab" type="text" size="4" placeholder="១២"></label>
        <label>ឈ្មោះ / អត្ថបទ <input class="tm-name" type="text" size="16" placeholder="ខ្សែ ក · ប្រើ // ចុះបន្ទាត់"></label>
        <label>បង្វិល <input class="tm-rot" type="range" min="-180" max="180" step="5" value="0"> <b class="tm-rotv">០°</b></label>
        <label>ទំហំសញ្ញា <input class="tm-sz" type="range" min="0.6" max="2" step="0.1" value="1"></label>
      </div>
      <div class="sim-controls tm-row">
        <span class="sim-seg tm-tab"><button type="button" data-v="p" class="on">ចំណុច (២៥)</button><button type="button" data-v="l">ខ្សែ (១៨)</button><button type="button" data-v="a">តំបន់ (១០)</button><button type="button" data-v="x">អត្ថបទ</button></span>
        <span class="sim-seg tm-mode"><button type="button" data-v="draw" class="on">✎ គូស</button><button type="button" data-v="select">☝ ជ្រើស/លុប</button><button type="button" data-v="pan">✋ រំកិល</button></span>
        <button type="button" class="sim-btn tm-zin">＋</button><button type="button" class="sim-btn tm-zout">－</button>
        <button type="button" class="sim-btn tm-undo">↶ មិនធ្វើវិញ</button>
      </div>
      <div class="tm-pal"></div>
      <div class="sim-body"><div class="sim-canvas-wrap"><canvas tabindex="0"></canvas></div></div>
      <div class="sim-controls tm-row">
        <button type="button" class="sim-btn tm-demo">📂 បើកឧទាហរណ៍</button><button type="button" class="sim-btn tm-clear">🗑 លុបទាំងអស់</button>
        <button type="button" class="sim-btn tm-gj">⬇ GeoJSON (QGIS)</button><button type="button" class="sim-btn tm-png">⬇ PNG</button>
        <label><input type="checkbox" class="tm-hill" checked> ស្រមោលភ្នំ</label><label><input type="checkbox" class="tm-cont" checked> ខ្សែវណ្ឌ</label><label><input type="checkbox" class="tm-grid" checked> ក្រឡា UTM ១ គម</label>
      </div>
      <div class="sim-out tm-status"></div>
      <div class="tm-leg"></div>`;
    const q = (s) => el.querySelector(s), cv = q("canvas"), ctx = cv.getContext("2d");
    const css = document.createElement("style");
    css.textContent = `.tm-row{margin-top:4px}.tm-pal{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0}.tm-pal button{width:46px;height:34px;padding:0;border:1px solid var(--md-default-fg-color--lighter);background:#fff;border-radius:4px;cursor:pointer}
      .tm-pal button.on{outline:2px solid var(--md-primary-fg-color);outline-offset:1px;background:#fff8e1}.tm-pal canvas{display:block;margin:auto}
      .tm-leg{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:2px 12px;font-size:.66rem;margin-top:6px}.tm-leg div{display:flex;align-items:center;gap:6px}
      .tm-leg h4{grid-column:1/-1;margin:.4em 0 .1em;font-size:.72rem}.sim[data-sim=tacmap] canvas{cursor:crosshair;outline:none}`;
    el.appendChild(css);
    // ---- state
    let conv = "khmer", side = "own", tabv = "p", mode = "draw", code = "flag_rect", feats = [], undo = [], temp = [], hover = null, sel = -1;
    const view = { cx: D.w / 2, cy: D.h / 2, res: D.w / (W - 20) };      // metres per CSS px
    const colOf = (c, s) => (CAT[c] && CAT[c][4] ? "#222222" : CONV[conv][s || "own"]);
    const u = () => 2.6 * +q(".tm-sz").value;                          // px per paper mm
    const toS = ([x, y]) => [W / 2 + (x - view.cx) / view.res, H / 2 - (y - view.cy) / view.res];
    const toM = (sx, sy) => [view.cx + (sx - W / 2) * view.res, view.cy - (sy - H / 2) * view.res];
    const save = () => { try { localStorage.setItem(STORE, JSON.stringify(feats)); } catch (e) { /* storage may be blocked */ } };
    const push = () => { undo.push(JSON.stringify(feats)); if (undo.length > 60) undo.shift(); };
    try { const s = JSON.parse(localStorage.getItem(STORE) || "null"); if (Array.isArray(s)) feats = s; } catch (e) { /* ignore */ }
    const hill = new Image(); hill.onload = () => draw(); hill.src = B.hill;

    // ---- render one feature (map coords → screen)
    const renderF = (c2, f, U, hl) => {
      const col = f.t === "x" ? f.c || "#222222" : colOf(f.s, f.d);
      if (f.t === "p") { const p = toS(f.g); drawPoint(c2, SVG, { ...f, p }, col, U, draw);
        if (f.s.startsWith("flag_") && f.l) { const s = (f.z || CAT[f.s][3]), [dx, dy] = FLAG_OFF[f.s]; text(c2, kh(f.l), p[0] + dx * s * U, p[1] - dy * s * U, Math.max(5, s * 0.75), col, U, { bold: true, buffer: false }); }
        else if (f.l || f.n) text(c2, kh(f.l || f.n), p[0] + 4 * U, p[1] - 3.5 * U, 8, col, U, { align: "left" }); }
      else if (f.t === "l") { const P = f.g.map(toS); drawLine(c2, f.s, P, col, U);
        const C = cum(P), L = C[C.length - 1];
        if (f.s === "phase_line") { const t = ("PL " + (f.n || "")).trim(); for (let d = Math.min(L / 2, 35 * U); d < L; d += 70 * U) { let [x, y, a] = at(P, C, d); if (Math.cos(a) < 0) a += Math.PI; text(c2, t, x + Math.sin(a) * 2.5 * U, y - Math.cos(a) * 2.5 * U, 8.5, col, U, { bold: true, rot: a }); } }
        else if (f.n || f.l) { let [x, y, a] = at(P, C, L / 2); if (Math.cos(a) < 0) a += Math.PI; const t = [f.l, f.n].filter(Boolean).join(" ");
          text(c2, kh(t), x + Math.sin(a) * 2.6 * U, y - Math.cos(a) * 2.6 * U, f.s === "dimension" ? 9 : 8, f.s === "dimension" ? "#222222" : col, U, { bold: f.s === "dimension", rot: a }); } }
      else if (f.t === "a") { const R = f.g.map(toS); drawArea(c2, f.s, R, col, U);
        const t = [f.l, f.n].filter(Boolean).join("\n"); if (t) { const c = centroid(R); text(c2, kh(t), c[0], c[1], 8, col, U, { bold: true }); } }
      else if (f.t === "x") { const p = toS(f.g); text(c2, f.n, p[0], p[1], f.z || 9, col, U, { bold: true, rot: ((f.r || 0) * Math.PI) / 180 }); }
      if (hl) { c2.save(); c2.strokeStyle = "#ff9800"; c2.lineWidth = 2; c2.setLineDash([4, 3]);
        const pts = f.t === "p" || f.t === "x" ? [toS(f.g)] : f.g.map(toS), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        c2.strokeRect(Math.min(...xs) - 10, Math.min(...ys) - 10, Math.max(...xs) - Math.min(...xs) + 20, Math.max(...ys) - Math.min(...ys) + 20); c2.restore(); }
    };
    // ---- geometry for special tools from clicked vertices (map coords)
    const build = (c, V) => {
      const g = CAT[c][0];
      if (g === "s" && V.length >= 2) { const [C0, P1] = V, r = Math.hypot(P1[0] - C0[0], P1[1] - C0[1]), a1 = Math.atan2(P1[1] - C0[1], P1[0] - C0[0]);
        const P2 = V[2] || [C0[0] + Math.cos(a1 + 0.5) * r, C0[1] + Math.sin(a1 + 0.5) * r];
        let d = Math.atan2(P2[1] - C0[1], P2[0] - C0[0]) - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;   // the narrower fan
        const ring = [C0]; for (let k = 0; k <= 40; k++) { const a = a1 + (d * k) / 40; ring.push([C0[0] + Math.cos(a) * r, C0[1] + Math.sin(a) * r]); }
        return { g: [...ring, C0], n: fmtDist(r) }; }
      if (g === "c" && V.length >= 2) { const [C0, P1] = V, r = Math.hypot(P1[0] - C0[0], P1[1] - C0[1]), ring = [];
        for (let k = 0; k <= 72; k++) { const a = (k / 72) * 2 * Math.PI; ring.push([C0[0] + Math.cos(a) * r, C0[1] + Math.sin(a) * r]); } return { g: ring, n: fmtDist(r) }; }
      if (g === "d" && V.length >= 2) return { g: V.slice(0, 2), n: fmtDist(Math.hypot(V[1][0] - V[0][0], V[1][1] - V[0][1])) };
      return { g: V };
    };
    const need = (c) => ({ p: 1, d: 2, c: 2, s: 3 }[CAT[c][0]] || 0);   // 0 = free vertices, finish by double-click / Enter
    const commit = () => {
      const g = CAT[code][0], t = tab(code), name = q(".tm-name").value.replace(/\/\//g, "\n").trim(), lab = q(".tm-lab").value.trim();
      const V = temp.slice(); temp = [];
      if ((t === "l" && V.length < 2) || (t === "a" && V.length < (g === "a" ? 3 : 2))) return draw();
      const b = build(code, V); push();
      feats.push({ t: t === "l" ? "l" : "a", s: code, d: side, l: "dsc".includes(g) ? null : lab || null, n: name || b.n || null, g: t === "a" && g === "a" ? [...b.g, b.g[0]] : b.g });
      save(); draw(); legend(); };

    // ---- full draw
    const draw = () => {
      const s = cv.parentElement.clientWidth || W, k = s / W, dpr = window.devicePixelRatio || 1;
      cv.style.width = s + "px"; cv.style.height = H * k + "px"; cv.width = s * dpr; cv.height = H * k * dpr; ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      paint(ctx, u(), true); };
    const paint = (c2, U, live) => {
      c2.fillStyle = "#fbfaf5"; c2.fillRect(0, 0, W, H);
      const [ox, oy] = toS([0, D.h]), [ex, ey] = toS([D.w, 0]);
      if (q(".tm-hill").checked && hill.complete) { c2.save(); c2.globalAlpha = 0.42; c2.drawImage(hill, ox, oy, ex - ox, ey - oy); c2.restore(); }
      B.forest.forEach((f) => { path(c2, f.g.map(toS), true); c2.fillStyle = "rgba(139,195,74,.20)"; c2.fill(); });
      if (q(".tm-cont").checked) B.contour.forEach((f) => { path(c2, f.g.map(toS)); const idx = f.e % 100 === 50; c2.strokeStyle = idx ? "rgba(141,85,36,.75)" : "rgba(141,85,36,.45)"; c2.lineWidth = idx ? 1 : 0.55; c2.stroke(); });
      B.river.forEach((f) => { path(c2, f.g.map(toS)); c2.strokeStyle = "#4a90d9"; c2.lineWidth = (f.w || 0.8) * 1.2; c2.lineJoin = "round"; c2.stroke(); });
      B.road.forEach((f) => { const P = f.g.map(toS); path(c2, P); c2.strokeStyle = "#6d4c41"; c2.lineWidth = 3; c2.stroke(); path(c2, P); c2.strokeStyle = "#ffcc80"; c2.lineWidth = 1.6; c2.stroke(); });
      B.spot.forEach((f) => { const [x, y] = toS(f.g); c2.fillStyle = "#5d4037"; c2.beginPath(); c2.arc(x, y, 1.6, 0, 7); c2.fill(); c2.font = `9px ${font()}`; c2.textAlign = "left"; c2.fillText(kh(f.e), x + 3, y - 2); });
      if (q(".tm-grid").checked) { c2.strokeStyle = "rgba(30,60,120,.22)"; c2.lineWidth = 0.6; c2.font = `9px ${font()}`; c2.fillStyle = "rgba(30,60,120,.75)";
        for (let E = Math.ceil((D.x0 + toM(0, 0)[0]) / 1000) * 1000; E < D.x0 + toM(W, 0)[0]; E += 1000) { const x = toS([E - D.x0, 0])[0]; c2.beginPath(); c2.moveTo(x, 0); c2.lineTo(x, H); c2.stroke(); c2.textAlign = "center"; c2.fillText(kh(String(E / 1000 % 100).padStart(2, "0")), x, 9); }
        for (let N = Math.ceil((D.y0 + toM(0, H)[1]) / 1000) * 1000; N < D.y0 + toM(0, 0)[1]; N += 1000) { const y = toS([0, N - D.y0])[1]; c2.beginPath(); c2.moveTo(0, y); c2.lineTo(W, y); c2.stroke(); c2.textAlign = "left"; c2.fillText(kh(String(N / 1000 % 100).padStart(2, "0")), 2, y - 2); } }
      // overlay: areas below lines below points below text
      ["a", "l", "p", "x"].forEach((t) => feats.forEach((f, i) => f.t === t && renderF(c2, f, U, live && i === sel)));
      // rubber band
      if (live && temp.length && mode === "draw") { const V = hover ? [...temp, hover] : temp, b = build(code, V), t = tab(code), col = colOf(code, side);
        c2.save(); c2.globalAlpha = 0.85;
        if (t === "l" && b.g.length >= 2) drawLine(c2, code, b.g.map(toS), col, U);
        if (t === "a") { const R = b.g.map(toS); if (R.length >= 3) drawArea(c2, code, R, col, U); else if (R.length === 2) { path(c2, R); c2.strokeStyle = col; c2.setLineDash([4, 3]); c2.stroke(); c2.setLineDash([]); } }
        c2.restore(); temp.forEach((v) => { const [x, y] = toS(v); c2.fillStyle = "#ff9800"; c2.fillRect(x - 2.5, y - 2.5, 5, 5); });
        if (b.n) { const [x, y] = toS(hover || temp[temp.length - 1]); text(c2, b.n, x + 8, y - 10, 9, "#222", U, { align: "left", bold: true }); } }
      // frame furniture: scale bar (km) and north arrow
      const km = [500, 1000, 2000, 5000].find((m) => m / view.res > 70) || 5000, Lp = km / view.res;
      c2.fillStyle = "rgba(255,255,255,.85)"; c2.fillRect(8, H - 34, Lp + 54, 26);
      for (let i = 0; i < 4; i++) { c2.fillStyle = i % 2 ? "#fff" : "#222"; c2.fillRect(14 + (i * Lp) / 4, H - 18, Lp / 4, 5); }
      c2.strokeStyle = "#222"; c2.lineWidth = 0.8; c2.strokeRect(14, H - 18, Lp, 5); c2.fillStyle = "#222"; c2.font = `10px ${font()}`; c2.textAlign = "left";
      c2.fillText("០", 11, H - 23); c2.fillText(fmtDist(km), 14 + Lp - 4, H - 23);
      c2.save(); c2.translate(W - 26, 34); c2.fillStyle = "#222"; c2.beginPath(); c2.moveTo(0, -18); c2.lineTo(7, 8); c2.lineTo(0, 3); c2.closePath(); c2.fill();
      c2.beginPath(); c2.moveTo(0, -18); c2.lineTo(-7, 8); c2.lineTo(0, 3); c2.closePath(); c2.strokeStyle = "#222"; c2.lineWidth = 1; c2.stroke(); c2.font = `bold 11px ${font()}`; c2.textAlign = "center"; c2.fillText("ជ", 0, 21); c2.restore();
      c2.strokeStyle = "#444"; c2.lineWidth = 1; c2.strokeRect(0.5, 0.5, W - 1, H - 1);
    };

    // ---- palette with live icons
    const icon = (c, col) => { const cn = document.createElement("canvas"), dpr = window.devicePixelRatio || 1, w = 44, h = 30; cn.width = w * dpr; cn.height = h * dpr; cn.style.width = w + "px"; cn.style.height = h + "px";
      const g = cn.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); const t = CAT[c][0], U = 1.25;
      if (t === "p") { const sz = Math.min(CAT[c][3], 10), f = { s: c, z: sz, p: c.startsWith("flag_") ? [w / 2 - 5, h - 3] : [w / 2, h / 2] };
        const go = () => { g.clearRect(0, 0, w, h); drawPoint(g, SVG, f, col, (sz === 10 ? 2.4 : 3) * 1, go); }; go(); }
      else { const cc = CAT[c][4] ? "#222222" : col;
        if (t === "l" || t === "d") drawLine(g, c, c === "axis" || c === "axis_planned" ? [[4, 20], [22, 13], [40, 15]] : [[4, h / 2 + 2], [40, h / 2 + 2]], cc, c.startsWith("axis") ? 1.7 : U * 1.6);
        else if (t === "s") { const C0 = [7, 26], R = [C0]; for (let k = 0; k <= 12; k++) { const a = -0.12 - k * 0.07; R.push([C0[0] + 33 * Math.cos(a), C0[1] + 33 * Math.sin(a)]); } R.push(C0); drawArea(g, c, R, cc, U * 1.4); }
        else drawArea(g, c, c === "range_ring" ? Array.from({ length: 37 }, (_, k) => [w / 2 + 12 * Math.cos(k / 36 * 6.283), h / 2 + 12 * Math.sin(k / 36 * 6.283)]) : [[6, 4], [38, 4], [38, 26], [6, 26]], cc, U * 1.6); }
      return cn; };
    const palette = () => { const P = q(".tm-pal"); P.innerHTML = "";
      if (tabv === "x") { P.innerHTML = `<span class="sim-hint">ចុចលើផែនទីដើម្បីដាក់អត្ថបទពីប្រអប់ «ឈ្មោះ / អត្ថបទ» (ប្រើ // ដើម្បីចុះបន្ទាត់)។ ពណ៌ខ្មៅ ទំហំ ៩ pt។</span>`; return; }
      Object.keys(CAT).filter((c) => tab(c) === tabv).forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.title = CAT[c][1] + " · " + CAT[c][2];
        if (c === code) b.classList.add("on"); b.appendChild(icon(c, colOf(c, side)));
        b.onclick = () => { code = c; temp = []; mode = "draw"; setSeg(".tm-mode", "draw"); palette(); status(); draw(); }; P.appendChild(b); }); };
    const legend = () => { const used = {}; feats.forEach((f) => { if (f.t === "x") return; (used[tab(f.s)] = used[tab(f.s)] || new Set()).add(f.s + "|" + (CAT[f.s][4] ? "neutral" : f.d)); });
      const L = q(".tm-leg"); L.innerHTML = ""; if (!feats.length) return;
      const head = document.createElement("h4"); head.textContent = `សញ្ញាសម្គាល់ · Legend (${conv === "khmer" ? "ខ្មែរ/សូវៀត៖ យើង ក្រហម · សត្រូវ ខៀវ" : "NATO APP-6៖ យើង ខៀវ · សត្រូវ ក្រហម"})`; L.appendChild(head);
      [["p", "សញ្ញាចំណុច · Point"], ["l", "សញ្ញាខ្សែ · Line"], ["a", "តំបន់ · Area"]].forEach(([t, tt]) => { if (!used[t]) return;
        const h = document.createElement("h4"); h.textContent = tt; L.appendChild(h);
        const by = {}; [...used[t]].forEach((k) => { const [c, sd] = k.split("|"); (by[c] = by[c] || []).push(sd); });
        Object.keys(by).sort((a, b) => Object.keys(CAT).indexOf(a) - Object.keys(CAT).indexOf(b)).forEach((c) => { const row = document.createElement("div");
          ["own", "enemy", "neutral"].filter((sd) => by[c].includes(sd)).forEach((sd) => row.appendChild(icon(c, CONV[conv][sd])));
          const s = document.createElement("span"); s.textContent = `${CAT[c][1]} · ${CAT[c][2]}`; row.appendChild(s); L.appendChild(row); }); }); };
    const status = (pt) => { const g = tabv === "x" ? "x" : CAT[code][0];
      const how = mode === "pan" ? "អូសដើម្បីរំកិល · កង់កណ្ដុរដើម្បីពង្រីក" : mode === "select" ? "ចុចលើសញ្ញាដើម្បីជ្រើស រួចចុច Delete ឬចុចម្ដងទៀតដើម្បីលុប"
        : g === "x" ? "ចុចដើម្បីដាក់អត្ថបទ" : g === "p" ? "ចុចដើម្បីដាក់សញ្ញា · ប្រើ «បង្វិល» សម្រាប់សញ្ញាមានទិស" : g === "d" ? "ចុចចំណុចចាប់ផ្ដើម និងចំណុចបញ្ចប់៖ ចម្ងាយសរសេរដោយស្វ័យប្រវត្តិ"
        : g === "s" ? "ចុចទីតាំងអាវុធ → ចំណុចចម្ងាយពេញលើគែមទីមួយ → គែមទីពីរ" : g === "c" ? "ចុចចំណុចកណ្ដាល រួចកាំ"
        : "ចុចចំណុចកំពូលម្ដងមួយៗ · ចុចពីរដង ឬ Enter ដើម្បីបញ្ចប់ · Backspace ដកចំណុច · Esc បោះបង់";
      const xy = pt ? ` · E ${kh(Math.round(D.x0 + pt[0]))} · N ${kh(Math.round(D.y0 + pt[1]))} (UTM 48N)` : "";
      q(".tm-status").innerHTML = `<b>${tabv === "x" ? "អត្ថបទ" : CAT[code][1] + " · " + CAT[code][2]}</b> — ${how}${xy}<br><span class="sim-hint">វត្ថុ ${kh(feats.length)} · មាត្រដ្ឋានសញ្ញាថេរជាមិល្លីម៉ែត្រលើក្រដាស ទោះពង្រីកផែនទីក៏ដោយ · ស្រទាប់ផែនទីមូលដ្ឋាន និងឧទាហរណ៍៖ សេណារីយ៉ូប្រឌិតពីកម្មវិធីជំនួយ TacMap KH</span>`; };
    const setSeg = (sel2, v) => el.querySelectorAll(sel2 + " button").forEach((b) => b.classList.toggle("on", b.dataset.v === v));
    const seg = (sel2, cb) => el.querySelectorAll(sel2 + " button").forEach((b) => (b.onclick = () => { setSeg(sel2, b.dataset.v); cb(b.dataset.v); }));
    seg(".tm-conv", (v) => { conv = v; palette(); legend(); draw(); });
    seg(".tm-side", (v) => { side = v; palette(); draw(); });
    seg(".tm-tab", (v) => { tabv = v; temp = []; if (v !== "x") code = Object.keys(CAT).find((c) => tab(c) === v); mode = "draw"; setSeg(".tm-mode", "draw"); palette(); status(); draw(); });
    seg(".tm-mode", (v) => { mode = v; temp = []; sel = -1; cv.style.cursor = v === "pan" ? "grab" : v === "select" ? "pointer" : "crosshair"; status(); draw(); });
    q(".tm-rot").oninput = () => { q(".tm-rotv").textContent = kh(q(".tm-rot").value) + "°"; };
    q(".tm-sz").oninput = () => { palette(); draw(); };
    ["tm-hill", "tm-cont", "tm-grid"].forEach((c) => (q("." + c).onchange = draw));
    const zoom = (f, sx = W / 2, sy = H / 2) => { const m = toM(sx, sy); view.res = clamp(view.res * f, 2, 80); const m2 = toM(sx, sy); view.cx += m[0] - m2[0]; view.cy += m[1] - m2[1]; draw(); };
    q(".tm-zin").onclick = () => zoom(1 / 1.4); q(".tm-zout").onclick = () => zoom(1.4);
    q(".tm-undo").onclick = () => { if (temp.length) { temp.pop(); return draw(); } if (undo.length) { feats = JSON.parse(undo.pop()); sel = -1; save(); draw(); legend(); status(); } };
    q(".tm-clear").onclick = () => { if (!feats.length) return; push(); feats = []; sel = -1; save(); draw(); legend(); status(); };
    q(".tm-demo").onclick = () => { push(); feats = JSON.parse(JSON.stringify(D.scenario)); sel = -1; view.cx = D.w / 2; view.cy = D.h / 2; view.res = D.w / (W - 20); save(); draw(); legend(); status(); };
    const dl = (name, href) => { const a = document.createElement("a"); a.download = name; a.href = href; document.body.appendChild(a); a.click(); a.remove(); };
    q(".tm-gj").onclick = () => { const ll = ([x, y]) => utm2ll(D.x0 + x, D.y0 + y);
      const fc = { type: "FeatureCollection", name: "tacmap_kh", features: feats.map((f) => ({ type: "Feature",
        properties: { layer: { p: "tm_points", l: "tm_lines", a: "tm_areas", x: "tm_text" }[f.t], sym: f.s || null, side: f.d || null, label: f.l || null, name: f.t === "x" ? null : f.n || null, text: f.t === "x" ? f.n : null, size: f.z || null, rot: f.r || null },
        geometry: f.t === "p" || f.t === "x" ? { type: "Point", coordinates: ll(f.g) } : f.t === "l" ? { type: "LineString", coordinates: f.g.map(ll) } : { type: "Polygon", coordinates: [f.g.map(ll)] } })) };
      dl("tacmap_kh.geojson", URL.createObjectURL(new Blob([JSON.stringify(fc)], { type: "application/geo+json" }))); };
    q(".tm-png").onclick = () => { const c = document.createElement("canvas"), k = 3; c.width = W * k; c.height = H * k; const g = c.getContext("2d"); g.setTransform(k, 0, 0, k, 0, 0); paint(g, u(), false); dl("tacmap_kh.png", c.toDataURL("image/png")); };

    // ---- pointer interaction
    const evM = (e) => { const r = cv.getBoundingClientRect(), k = W / r.width; return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
    const hit = (sx, sy) => { const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      for (let i = feats.length - 1; i >= 0; i--) { const f = feats[i];
        if (f.t === "p" || f.t === "x") { if (d2(toS(f.g), [sx, sy]) < 14) return i; continue; }
        const P = f.g.map(toS);
        for (let j = 1; j < P.length; j++) { const a = P[j - 1], b = P[j], vx = b[0] - a[0], vy = b[1] - a[1], t = clamp(((sx - a[0]) * vx + (sy - a[1]) * vy) / (vx * vx + vy * vy || 1), 0, 1);
          if (Math.hypot(sx - a[0] - t * vx, sy - a[1] - t * vy) < 6) return i; }
        if (f.t === "a") { let inside = false; for (let j = 0, k = P.length - 1; j < P.length; k = j++) if ((P[j][1] > sy) !== (P[k][1] > sy) && sx < ((P[k][0] - P[j][0]) * (sy - P[j][1])) / (P[k][1] - P[j][1]) + P[j][0]) inside = !inside; if (inside) return i; } }
      return -1; };
    let drag = null, lastClick = 0, lastXY = [0, 0];
    cv.addEventListener("pointerdown", (e) => { cv.focus({ preventScroll: true }); const [sx, sy] = evM(e);
      if (mode === "pan" || e.button === 1) { drag = [sx, sy, view.cx, view.cy]; cv.setPointerCapture(e.pointerId); return; }
      if (e.button === 2) return;
      if (mode === "select") { const i = hit(sx, sy); if (i >= 0 && i === sel) { push(); feats.splice(i, 1); sel = -1; save(); legend(); } else sel = i; status(); return draw(); }
      const m = toM(sx, sy), now = performance.now();
      if (tabv === "x") { const t = q(".tm-name").value.replace(/\/\//g, "\n").trim(); if (!t) { q(".tm-name").focus(); return; } push(); feats.push({ t: "x", n: t, z: 9, r: +q(".tm-rot").value || null, c: "#222222", g: m }); save(); return draw(); }
      if (CAT[code][0] === "p") { push(); feats.push({ t: "p", s: code, d: side, l: q(".tm-lab").value.trim() || null, n: q(".tm-name").value.trim() || null, z: null, r: +q(".tm-rot").value || null, g: m }); save(); legend(); return draw(); }
      if (now - lastClick < 400 && need(code) === 0 && Math.hypot(sx - lastXY[0], sy - lastXY[1]) < 6) { lastClick = 0; return commit(); }   // double-click finishes
      lastClick = now; lastXY = [sx, sy]; temp.push(m); if (need(code) && temp.length >= need(code)) commit(); else draw(); });
    cv.addEventListener("pointermove", (e) => { const [sx, sy] = evM(e);
      if (drag) { view.cx = drag[2] - (sx - drag[0]) * view.res; view.cy = drag[3] + (sy - drag[1]) * view.res; return draw(); }
      hover = toM(sx, sy); status(hover); if (temp.length) draw(); });
    cv.addEventListener("pointerup", () => (drag = null));
    cv.addEventListener("contextmenu", (e) => { e.preventDefault(); if (temp.length) commit(); });
    cv.addEventListener("wheel", (e) => { if (mode !== "pan" && !e.ctrlKey && !e.metaKey) return; e.preventDefault(); const [sx, sy] = evM(e); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, sx, sy); }, { passive: false });
    cv.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && temp.length) { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { temp = []; sel = -1; draw(); }
      else if (e.key === "Backspace" && temp.length) { e.preventDefault(); temp.pop(); draw(); }
      else if ((e.key === "Delete" || e.key === "Backspace") && sel >= 0) { e.preventDefault(); push(); feats.splice(sel, 1); sel = -1; save(); legend(); draw(); status(); }
      else if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); q(".tm-undo").click(); } });
    palette(); legend(); status(); draw();
    window.addEventListener("resize", () => el.isConnected && draw());
  };
})();
