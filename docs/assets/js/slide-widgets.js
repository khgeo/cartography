/* ============================================================
   Interactive teaching widgets (Book 1 · used in the lesson slides and pages)
   Registered into window.EXTRA_SIMS; rendered by lesson-sims.js.
   proj-explorer · classify-explorer · colour-explorer · propsym-explorer
   ============================================================ */
(function () {
  "use strict";
  const KM = "០១២៣៤៥៦៧៨៩", kh = (n) => String(n).replace(/[0-9]/g, (d) => KM[d]);
  const khn = (n) => kh(Math.round(n).toLocaleString("en-US").replace(/,/g, " "));
  const P = "../../assets/data/cambodia_provinces_svg.json";
  const pd = (rings, ox, oy, k) => rings.map((r) => "M" + r.map(([x, y]) => `${(ox + x * k).toFixed(1)} ${(oy + y * k).toFixed(1)}`).join(" L") + "Z").join(" ");
  const shell = (el, title, controls) => {
    el.innerHTML = `<div class="sim-title">${title}</div><div class="sim-controls">${controls}</div><div class="sim-body"><div class="sim-canvas-wrap w-map"></div></div><div class="sim-out"></div>`;
    return { map: el.querySelector(".w-map"), out: el.querySelector(".sim-out"), q: (s) => el.querySelector(s) };
  };
  const centre = (D, p) => { const c = (D.ctr || []).find((c) => c.name === p.name); if (c) return c.xy;
    let sx = 0, sy = 0, n = 0; p.r.forEach((r) => r.forEach(([x, y]) => { sx += x; sy += y; n++; })); return [sx / n, sy / n]; };
  window.EXTRA_SIMS = window.EXTRA_SIMS || {};

  /* ---------- projection explorer ---------- */
  const ROB = [[0,1,0],[5,.9986,.062],[10,.9954,.124],[15,.99,.186],[20,.9822,.248],[25,.973,.31],[30,.96,.372],[35,.9427,.434],[40,.9216,.4958],[45,.8962,.5571],[50,.8679,.6176],[55,.835,.6769],[60,.7986,.7346],[65,.7597,.7903],[70,.7186,.8435],[75,.6732,.8936],[80,.6213,.9394],[85,.5722,.9761],[90,.5322,1]];
  const proj = (lon, lat, kind, lon0) => {
    let l = ((((lon - lon0 + 180) % 360) + 360) % 360 - 180) * Math.PI / 180, p = Math.max(-89.5, Math.min(89.5, lat)) * Math.PI / 180;
    if (kind === "plate") return [l, -p];
    if (kind === "merc") return [l, -Math.log(Math.tan(Math.PI / 4 + Math.max(-1.45, Math.min(1.45, p)) / 2))];
    if (kind === "sin") return [l * Math.cos(p), -p];
    if (kind === "moll") { let t = p; for (let i = 0; i < 10; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(p)) / (2 + 2 * Math.cos(2 * t) + 1e-12);
      return [2 * Math.SQRT2 / Math.PI * l * Math.cos(t), -Math.SQRT2 * Math.sin(t)]; }
    if (kind === "robin") { const a = Math.abs(p * 180 / Math.PI), i = Math.min(17, Math.floor(a / 5)), f = (a - ROB[i][0]) / 5;
      const X = ROB[i][1] + f * (ROB[i + 1][1] - ROB[i][1]), Y = ROB[i][2] + f * (ROB[i + 1][2] - ROB[i][2]); return [.8487 * X * l, -1.3523 * Y * Math.sign(p || 1)]; }
    if (kind === "ortho") { const c = Math.cos(p) * Math.cos(l); if (c < 0) return null; return [Math.cos(p) * Math.sin(l), -Math.sin(p)]; }
  };
  window.EXTRA_SIMS["proj-explorer"] = async (el) => {
    const K = [["plate", "Plate Carrée"], ["merc", "Mercator"], ["robin", "Robinson"], ["moll", "Mollweide"], ["sin", "Sinusoidal"], ["ortho", "Orthographic"]];
    const { map, out, q } = shell(el, "ឧបករណ៍ប្ដូរចំណោល",
      `<span class="sim-seg pe-k">${K.map(([k, n], i) => `<button type="button" data-k="${k}" class="${i ? "" : "on"}">${n}</button>`).join("")}</span>
       <label><input type="checkbox" class="pe-t" checked> រង្វង់ Tissot</label>
       <label>ខ្សែបណ្ដោយកណ្ដាល <b class="pe-lv"></b> <input type="range" class="pe-l" min="-180" max="180" step="5" value="105"></label>`);
    const W = await window.cartoData("../../assets/data/world_land.json");
    const draw = () => {
      const kind = q(".pe-k .on").dataset.k, lon0 = +q(".pe-l").value; q(".pe-lv").textContent = kh(lon0) + "°";
      const pts = []; for (let a = -180; a <= 180; a += 10) for (let b = -85; b <= 85; b += 5) { const v = proj(a, b, kind, kind === "ortho" ? 0 : 0); if (v) pts.push(v); }
      const rot = kind === "ortho" ? lon0 : lon0;
      const all = []; for (let a = -180; a <= 180; a += 10) for (let b = -85; b <= 85; b += 5) { const v = proj(a, b, kind, rot); if (v) all.push(v); }
      const minx = Math.min(...all.map((v) => v[0])), maxx = Math.max(...all.map((v) => v[0])), miny = Math.min(...all.map((v) => v[1])), maxy = Math.max(...all.map((v) => v[1]));
      const Wd = 640, Hd = 360, s = Math.min(Wd / (maxx - minx), Hd / (maxy - miny)), ox = (Wd - s * (maxx - minx)) / 2, oy = (Hd - s * (maxy - miny)) / 2;
      const to = (lon, lat) => { const v = proj(lon, lat, kind, rot); return v ? [ox + (v[0] - minx) * s, oy + (v[1] - miny) * s] : null; };
      const line = (arr) => { let d = "", pen = false, prev = null; arr.forEach(([lon, lat]) => { const v = to(lon, lat); if (!v || (prev !== null && Math.abs(lon - prev) > 180)) { pen = false; } if (v) { d += (pen ? "L" : "M") + v[0].toFixed(1) + " " + v[1].toFixed(1); pen = true; } prev = lon; }); return d; };
      let svg = kind === "ortho" ? `<circle cx="${Wd / 2}" cy="${Hd / 2}" r="${Hd / 2}" fill="#e3f2fd" stroke="#90caf9"/>` : `<rect width="${Wd}" height="${Hd}" fill="#fff"/>`;
      let g = ""; for (let lon = -180; lon <= 180; lon += 30) { const a = []; for (let lat = -85; lat <= 85; lat += 2) a.push([lon, lat]); g += line(a); }
      for (let lat = -60; lat <= 60; lat += 30) { const a = []; for (let lon = -180; lon <= 180; lon += 2) a.push([lon, lat]); g += line(a); }
      svg += `<path d="${g}" fill="none" stroke="#cfd8dc" stroke-width=".6"/>`;
      const land = (W.land || W).map((r) => { const rr = r.map(([a, b]) => [a + 0, b]); return line(rr.concat([rr[0]])) + (kind === "ortho" ? "" : "Z"); }).join("");
      svg += `<path d="${land}" fill="#b0bec5" stroke="#78909c" stroke-width=".4"/>`;
      if (q(".pe-t").checked) {
        let t = ""; for (let lat = -60; lat <= 60; lat += 30) for (let lon = -150; lon <= 150; lon += 30) {
          const c = []; for (let a = 0; a <= 360; a += 20) { const la = lat + 6 * Math.sin(a * Math.PI / 180), lo = lon + 6 * Math.cos(a * Math.PI / 180) / Math.max(.2, Math.cos(lat * Math.PI / 180)); const v = to(lo, la); if (!v) { c.length = 0; break; } c.push(v); }
          if (c.length) t += "M" + c.map((v) => v[0].toFixed(1) + " " + v[1].toFixed(1)).join(" L") + "Z"; }
        svg += `<path d="${t}" fill="#ef5350" fill-opacity=".5" stroke="#b71c1c" stroke-width=".6"/>`;
      }
      const kc = to(105, 12.5); if (kc) svg += `<circle cx="${kc[0]}" cy="${kc[1]}" r="5" fill="#ffa000" stroke="#fff"/>`;
      map.innerHTML = `<svg viewBox="0 0 ${Wd} ${Hd}" style="width:100%;height:auto;display:block">${svg}</svg>`;
      const msg = { plate: "Plate Carrée៖ ក្រឡាការ៉េ · ផ្ទៃ និងរាងខូចឆ្ពោះទៅប៉ូល", merc: "Mercator៖ រង្វង់នៅតែជារង្វង់ (រក្សារាង) ប៉ុន្តែធំឡើងខ្លាំងនៅរយៈទទឹងខ្ពស់",
        robin: "Robinson៖ សម្របសម្រួល · មិនរក្សារាង ឬផ្ទៃត្រឹមត្រូវទាំងស្រុង ប៉ុន្តែមើលទៅធម្មជាតិ", moll: "Mollweide៖ រង្វង់ទាំងអស់ផ្ទៃស្មើគ្នា (រក្សាផ្ទៃ) ប៉ុន្តែរាងខូចនៅគែម",
        sin: "Sinusoidal៖ រក្សាផ្ទៃ · ខូចរាងខ្លាំងនៅជ្រុង", ortho: "Orthographic៖ មើលផែនដីពីអវកាស · ឃើញតែពាក់កណ្ដាល" }[kind];
      out.innerHTML = msg + `<br><span class="sim-hint">ចំណុចលឿង = កម្ពុជា · ប្ដូរខ្សែបណ្ដោយកណ្ដាល ដើម្បីឲ្យកម្ពុជានៅកណ្ដាល</span>`;
    };
    el.querySelectorAll(".pe-k button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".pe-k button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", draw)); draw();
  };

  /* ---------- classification explorer ---------- */
  const jenks = (v, k) => { const n = v.length, m1 = [], m2 = []; for (let i = 0; i <= n; i++) { m1.push(Array(k + 1).fill(0)); m2.push(Array(k + 1).fill(Infinity)); }
    for (let i = 1; i <= k; i++) { m1[1][i] = 1; m2[1][i] = 0; }
    for (let l = 2; l <= n; l++) { let s1 = 0, s2 = 0, w = 0, va = 0; for (let m = 1; m <= l; m++) { const i3 = l - m + 1, val = v[i3 - 1]; s2 += val * val; s1 += val; w++; va = s2 - s1 * s1 / w;
      if (i3 !== 1) for (let j = 2; j <= k; j++) if (m2[l][j] >= va + m2[i3 - 1][j - 1]) { m1[l][j] = i3; m2[l][j] = va + m2[i3 - 1][j - 1]; } } m1[l][1] = 1; m2[l][1] = va; }
    const br = Array(k + 1).fill(0); br[k] = v[n - 1]; let c = k, kk = n; while (c > 1) { br[c - 1] = v[m1[kk][c] - 2]; kk = m1[kk][c] - 1; c--; } br[0] = v[0]; return br; };
  const breaks = (m, k, vals) => { const v = [...vals].sort((a, b) => a - b), lo = v[0], hi = v[v.length - 1];
    if (m === "eq") return Array.from({ length: k + 1 }, (_, i) => lo + (hi - lo) * i / k);
    if (m === "q") return Array.from({ length: k + 1 }, (_, i) => v[Math.min(v.length - 1, Math.round(i * (v.length - 1) / k))]);
    if (m === "nb") return jenks(v, k);
    const mean = v.reduce((a, b) => a + b) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
    const b = [lo]; for (let i = 1; i < k; i++) b.push(Math.max(lo, mean + sd * (i - k / 2))); b.push(hi); return b; };
  const RAMP = (k) => ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"].filter((_, i, a) => k === 7 || [[0, 3, 6], [0, 2, 4, 6], [0, 1, 3, 5, 6], [0, 1, 2, 4, 5, 6]][k - 3].includes(i));
  window.EXTRA_SIMS["classify-explorer"] = async (el) => {
    const { map, out, q } = shell(el, "ឧបករណ៍ចាត់ថ្នាក់ទិន្នន័យ",
      `<span class="sim-seg ce-m"><button type="button" data-m="eq" class="on">ចន្លោះស្មើ</button><button type="button" data-m="q">Quantile</button><button type="button" data-m="nb">Natural breaks</button><button type="button" data-m="sd">គម្លាតស្តង់ដារ</button></span>
       <label>ចំនួនថ្នាក់ <b class="ce-kv"></b> <input type="range" class="ce-k" min="3" max="7" value="5"></label>`);
    const D = await window.cartoData(P), vals = D.prov.map((p) => p.dens);
    const draw = () => {
      const m = q(".ce-m .on").dataset.m, k = +q(".ce-k").value; q(".ce-kv").textContent = kh(k);
      const br = breaks(m, k, vals), pal = RAMP(k), col = (d) => pal[Math.max(0, Math.min(k - 1, br.slice(1, -1).filter((b) => d > b).length))];
      let svg = D.prov.map((p) => `<path d="${pd(p.r, 10, 10, 1.45)}" fill="${col(p.dens)}" stroke="#fff" stroke-width=".7"><title>${p.name} · ${kh(p.dens)}</title></path>`).join("");
      svg += `<path d="${pd(D.lake, 10, 10, 1.45)}" fill="#9ecae1"/>`;
      const lg = (d) => Math.log10(Math.max(d, 1)), X0 = 470, Wd = 160, xp = (d) => X0 + (lg(d) - lg(5)) / (lg(2500) - lg(5)) * Wd;
      br.slice(0, -1).forEach((b, i) => { svg += `<rect x="470" y="${40 + i * 24}" width="18" height="16" fill="${pal[i]}" stroke="#999" stroke-width=".5"/><text x="494" y="${53 + i * 24}" font-size="12">${kh(Math.round(b))}–${kh(Math.round(br[i + 1]))}</text>`; });
      const counts = pal.map((_, i) => vals.filter((d) => (i === 0 ? d <= br[1] : d > br[i] && (i === k - 1 || d <= br[i + 1]))).length);
      const y0 = 250; svg += `<line x1="${X0}" y1="${y0}" x2="${X0 + Wd}" y2="${y0}" stroke="#90a4ae"/>`;
      vals.forEach((d) => (svg += `<circle cx="${xp(d)}" cy="${y0 - 8}" r="4" fill="#546e7a" opacity=".75"/>`));
      br.slice(1, -1).forEach((b) => (svg += `<line x1="${xp(b)}" y1="${y0 - 22}" x2="${xp(b)}" y2="${y0 + 6}" stroke="#e65100" stroke-width="2"/>`));
      svg += `<text x="${X0}" y="${y0 + 22}" font-size="11" fill="#607d8b">ដង់ស៊ីតេ (log) · ចំណុច = ខេត្ត</text>`;
      map.innerHTML = `<svg viewBox="0 0 640 380" style="width:100%;height:auto;display:block">${svg}</svg>`;
      out.innerHTML = `ចំនួនខេត្តក្នុងថ្នាក់នីមួយៗ៖ <b>${counts.map(kh).join(" · ")}</b><br><span class="sim-hint">${{ eq: "ចន្លោះស្មើ៖ ភ្នំពេញ (២ ០៤៩) រុញខេត្តស្ទើរទាំងអស់ចូលថ្នាក់ទីមួយ", q: "Quantile៖ ចំនួនខេត្តប្រហាក់ប្រហែលគ្នាគ្រប់ថ្នាក់ ទោះតម្លៃជិតគ្នាក៏ត្រូវបំបែក", nb: "Natural breaks៖ ព្រំថ្នាក់នៅចន្លោះធំៗក្នុងទិន្នន័យ", sd: "គម្លាតស្តង់ដារ៖ ថ្នាក់ធៀបនឹងមធ្យម · ល្អជាមួយឈុតពណ៌ diverging" }[m]}</span>`;
    };
    el.querySelectorAll(".ce-m button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".ce-m button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    q(".ce-k").addEventListener("input", draw); draw();
  };

  /* ---------- colour explorer ---------- */
  const SCHEMES = { seq: ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"], blue: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"], vir: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
    rain: ["#9e0142", "#f46d43", "#fee08b", "#abdda4", "#3288bd"], rg: ["#1a9850", "#91cf60", "#ffffbf", "#fc8d59", "#d73027"], div: ["#2166ac", "#67a9cf", "#f7f7f7", "#ef8a62", "#b2182b"] };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), toHex = (a) => "#" + a.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
  const sim = (h, mode) => { const [r, g, b] = hex(h); if (mode === "deut") return toHex([.625 * r + .375 * g, .7 * r + .3 * g, .3 * g + .7 * b]);
    if (mode === "prot") return toHex([.567 * r + .433 * g, .558 * r + .442 * g, .242 * g + .758 * b]); if (mode === "gray") { const y = .299 * r + .587 * g + .114 * b; return toHex([y, y, y]); } return h; };
  window.EXTRA_SIMS["colour-explorer"] = async (el) => {
    const { map, out, q } = shell(el, "ឧបករណ៍សាកល្បងពណ៌",
      `<label>ឈុតពណ៌ <select class="co-s"><option value="seq">Sequential ក្រហម</option><option value="blue">Sequential ខៀវ</option><option value="vir">Viridis</option><option value="div">Diverging</option><option value="rain">ឥន្ទធនូ</option><option value="rg">ក្រហម–បៃតង</option></select></label>
       <span class="sim-seg co-v"><button type="button" data-v="none" class="on">ភ្នែកធម្មតា</button><button type="button" data-v="deut">Deuteranopia</button><button type="button" data-v="prot">Protanopia</button><button type="button" data-v="gray">បោះពុម្ពស ខ្មៅ</button></span>`);
    const D = await window.cartoData(P); const BR = [0, 50, 100, 200, 400];
    const draw = () => {
      const s = SCHEMES[q(".co-s").value], v = q(".co-v .on").dataset.v, pal = s.map((c) => sim(c, v)), col = (d) => pal[BR.filter((b) => d >= b).length - 1];
      let svg = D.prov.map((p) => `<path d="${pd(p.r, 10, 10, 1.45)}" fill="${col(p.dens)}" stroke="#fff" stroke-width=".7"/>`).join("");
      svg += `<path d="${pd(D.lake, 10, 10, 1.45)}" fill="${sim("#9ecae1", v)}"/>`;
      ["< ៥០", "៥០–១០០", "១០០–២០០", "២០០–៤០០", "> ៤០០"].forEach((t, i) => (svg += `<rect x="470" y="${60 + i * 28}" width="22" height="18" fill="${pal[i]}" stroke="#999" stroke-width=".5"/><text x="500" y="${74 + i * 28}" font-size="13">${t}</text>`));
      map.innerHTML = `<svg viewBox="0 0 640 380" style="width:100%;height:auto;display:block">${svg}</svg>`;
      const lum = pal.map((c) => { const [r, g, b] = hex(c); return .299 * r + .587 * g + .114 * b; });
      const mono = lum.every((l, i) => i === 0 || Math.abs(l - lum[i - 1]) > .06) && lum.every((l, i) => i === 0 || Math.sign(l - lum[i - 1]) === Math.sign(lum[1] - lum[0]));
      out.innerHTML = mono ? "✓ ពន្លឺប្រែប្រួលជាលំដាប់៖ អ្នកអាននៅតែបែងចែកថ្នាក់បាន" : "✗ ពន្លឺមិនប្រែប្រួលជាលំដាប់៖ ថ្នាក់ខ្លះច្រឡំគ្នា ឬលំដាប់មិនច្បាស់";
      out.innerHTML += `<br><span class="sim-hint">ប្រហែល ៨% នៃបុរស មានភ្នែកខ្វះពណ៌ក្រហម–បៃតង · ផែនទីជាច្រើនត្រូវបានថតចម្លងស ខ្មៅ</span>`;
    };
    q(".co-s").addEventListener("change", draw);
    el.querySelectorAll(".co-v button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".co-v button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); })); draw();
  };

  /* ---------- proportional symbol explorer ---------- */
  window.EXTRA_SIMS["propsym-explorer"] = async (el) => {
    const { map, out, q } = shell(el, "ឧបករណ៍សញ្ញាសមាមាត្រ",
      `<span class="sim-seg ps-m"><button type="button" data-m="area" class="on">ផ្ទៃ (√)</button><button type="button" data-m="flan">Flannery</button><button type="button" data-m="rad">កាំ (ខុស)</button><button type="button" data-m="dot">ចំណុចដង់ស៊ីតេ</button></span>
       <label>ទំហំអតិបរមា <b class="ps-sv"></b> <input type="range" class="ps-s" min="10" max="45" value="28"></label>`);
    const D = await window.cartoData(P); const mx = Math.max(...D.prov.map((p) => p.pop));
    const draw = () => {
      const m = q(".ps-m .on").dataset.m, S = +q(".ps-s").value; q(".ps-sv").textContent = kh(S);
      let svg = D.prov.map((p) => `<path d="${pd(p.r, 10, 10, 1.45)}" fill="#f5f5f5" stroke="#cfd8dc" stroke-width=".7"/>`).join("") + `<path d="${pd(D.lake, 10, 10, 1.45)}" fill="#9ecae1"/>`;
      const R = (v) => m === "area" ? S * Math.sqrt(v / mx) : m === "flan" ? S * Math.pow(v / mx, .57) : S * v / mx;
      if (m === "dot") {
        let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        D.prov.forEach((p) => { const ring = p.r.reduce((a, b) => (b.length > a.length ? b : a)); const xs = ring.map((c) => c[0]), ys = ring.map((c) => c[1]);
          const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; const n = Math.round(p.pop / (S * 1000)); let c = 0, t = 0;
          const inside = (x, y) => { let o = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) o = !o; } return o; };
          while (c < n && t < n * 50) { t++; const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0); if (inside(x, y)) { svg += `<circle cx="${(10 + x * 1.45).toFixed(1)}" cy="${(10 + y * 1.45).toFixed(1)}" r="1.3" fill="#37474f"/>`; c++; } } });
        out.innerHTML = `១ ចំណុច = <b>${khn(S * 1000)}</b> នាក់ · ប្ដូររំកិល ដើម្បីរកតម្លៃចំណុចដែលចំណុចប៉ះគ្នានៅភ្នំពេញ`;
      } else {
        [...D.prov].sort((a, b) => b.pop - a.pop).forEach((p) => { const [cx, cy] = centre(D, p); svg += `<circle cx="${(10 + cx * 1.45).toFixed(1)}" cy="${(10 + cy * 1.45).toFixed(1)}" r="${R(p.pop).toFixed(1)}" fill="#ff9800" fill-opacity=".8" stroke="#fff"><title>${p.name} · ${khn(p.pop)}</title></circle>`; });
        [1.4e6, 7e5, 1e5].forEach((v, i) => { const r = R(v); svg += `<circle cx="540" cy="${330 - r}" r="${r}" fill="none" stroke="#e65100"/><text x="${545 + S}" y="${334 - 2 * r}" font-size="11">${khn(v)}</text>`; });
        out.innerHTML = { area: "ផ្ទៃរង្វង់ ∝ ប្រជាជន (ត្រឹមត្រូវ)", flan: "Flannery៖ ពង្រីករង្វង់ធំបន្តិច ដើម្បីប៉ះប៉ូវការប៉ាន់ស្មានតិចរបស់ភ្នែក", rad: "កាំ ∝ ប្រជាជន៖ ភ្នំពេញមើលទៅធំហួសហេតុ ខេត្តតូចស្ទើរមើលមិនឃើញ" }[m];
      }
      map.innerHTML = `<svg viewBox="0 0 640 380" style="width:100%;height:auto;display:block">${svg}</svg>`;
    };
    el.querySelectorAll(".ps-m button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".ps-m button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    q(".ps-s").addEventListener("input", draw); draw();
  };
})();
