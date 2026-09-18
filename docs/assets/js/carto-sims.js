/* ============================================================
   Cartography simulators · Book 1 (khgeo/cartography)
   Registered into window.EXTRA_SIMS; rendered by lesson-sims.js.
   Usage: <div class="sim" data-sim="map-elements"></div>
   ============================================================ */
(function () {
  "use strict";
  const KM = "០១២៣៤៥៦៧៨៩";
  const kh = (n) => String(n).replace(/[0-9]/g, (d) => KM[d]);
  const DATA = "../../assets/data/cambodia_provinces_svg.json", INSET = "../../assets/data/inset_sea_svg.json";
  let cache = null;
  const load = async () => cache || (cache = await (await fetch(new URL(DATA, location.href))).json());
  let icache = null;
  const loadInset = async () => icache || (icache = await (await fetch(new URL(INSET, location.href))).json());
  const pd = (rings, ox, oy, k) => rings.map((r) => "M" + r.map(([x, y]) => `${(ox + x * k).toFixed(1)} ${(oy + y * k).toFixed(1)}`).join(" L") + "Z").join(" ");
  const PAL = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"], BR = [0, 50, 100, 200, 400];
  const LAB = ["តិចជាង ៥០", "៥០–១០០", "១០០–២០០", "២០០–៤០០", "លើស ៤០០"];
  const col = (d) => PAL[BR.filter((b) => d >= b).length - 1];

  window.EXTRA_SIMS = window.EXTRA_SIMS || {};

  /* ---------- Map elements: what can a reader answer? ---------- */
  window.EXTRA_SIMS["map-elements"] = async (el) => {
    const EL = [["title", "ចំណងជើង"], ["legend", "សញ្ញាសម្គាល់ផែនទី"], ["scale", "របារមាត្រដ្ឋាន"], ["north", "សញ្ញាព្រួញទិស"], ["source", "ប្រភព និងឆ្នាំ"], ["inset", "ផែនទីទីតាំង"]];
    const Q = [
      ["ផែនទីនេះនិយាយអំពីអ្វី?", ["title"]],
      ["ពណ៌ក្រហមដិតមានន័យអ្វី?", ["legend"]],
      ["ពីភ្នំពេញទៅខេត្តតាកែវ ឆ្ងាយប្រហែលប៉ុន្មាន?", ["scale"]],
      ["ខេត្តរតនគិរីនៅទិសណានៃខេត្តកំពង់ចាម?", ["north"]],
      ["តួលេខនេះជាឆ្នាំណា ហើយទុកចិត្តបានទេ?", ["source"]],
      ["តំបន់នេះនៅកន្លែងណាក្នុងអាស៊ីអាគ្នេយ៍?", ["inset"]],
    ];
    el.innerHTML = `<div class="sim-title">ធាតុផែនទី៖ អ្នកអានអាចឆ្លើយសំណួរអ្វីខ្លះ?</div>
      <div class="sim-controls">${EL.map(([k, n]) => `<label><input type="checkbox" data-k="${k}"> ${n}</label>`).join("")}
      <button type="button" class="sim-btn me-all">បើកទាំងអស់</button></div>
      <div class="sim-body"><div class="sim-canvas-wrap me-map"></div><div class="me-q"></div></div>
      <div class="sim-out"></div>`;
    const D = await load(), I = await loadInset();
    const W = 640, H = 470, k = 1.35, ox = 40, oy = 70;
    const on = {};
    const draw = () => {
      el.querySelectorAll(".sim-controls input").forEach((c) => (on[c.dataset.k] = c.checked));
      const provs = D.prov.map((p) => `<path d="${pd(p.r, ox, oy, k)}" fill="${col(p.dens)}" stroke="#fff" stroke-width=".7"><title>${p.name} · ${kh(p.dens)} នាក់/គម²</title></path>`).join("");
      const seg = (360 / 573.2) * 50 * (k / 1.2);
      let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fff;border:1px solid #bbb;border-radius:4px">
        <style>text{font-family:var(--md-text-font-family,'Battambang');fill:#212121}</style>${provs}`;
      if (on.title) svg += `<rect x="20" y="14" width="${W - 40}" height="40" fill="#e8eaf6"/><text x="${W / 2}" y="41" text-anchor="middle" font-size="17" font-weight="700">ដង់ស៊ីតេប្រជាជនតាមខេត្ត ឆ្នាំ ២០១៧</text>`;
      if (on.legend) svg += `<text x="512" y="222" font-size="12" font-weight="700">នាក់/គម²</text>` + LAB.map((l, i) => `<rect x="512" y="${230 + i * 18}" width="14" height="13" fill="${PAL[i]}" stroke="#999"/><text x="532" y="${241 + i * 18}" font-size="12">${l}</text>`).join("");
      if (on.scale) svg += [0, 1, 2, 3].map((i) => `<rect x="${50 + i * seg}" y="${H - 58}" width="${seg}" height="6" fill="${i % 2 ? "#fff" : "#212121"}" stroke="#212121"/>`).join("") + ["០", "៥០", "១០០", "១៥០", "២០០ គម"].map((t, i) => `<text x="${50 + i * seg}" y="${H - 38}" font-size="11" text-anchor="${i < 4 ? "middle" : "start"}">${t}</text>`).join("");
      if (on.north) svg += `<g transform="translate(${W - 50} ${H - 90})"><path d="M0 -24 L8 6 L0 0 L-8 6Z" fill="#212121"/><text x="0" y="22" text-anchor="middle" font-size="13">ជ</text></g>`;
      if (on.source) svg += `<text x="24" y="${H - 12}" font-size="11">ប្រភព៖ Kh_Province_Boundary (POP2017) · EPSG:32648 · រៀបចំ ២០២៦</text>`;
      if (on.inset) { const ix = 512, iy = 70, ik = 1.15;
        svg += `<g><rect x="${ix}" y="${iy}" width="${100 * ik}" height="${100 * ik}" fill="#f2f2f2" stroke="#757575"/>` +
          `<path d="${pd(I.sea, ix, iy, ik)}" fill="#a6cee3"/><path d="${pd(I.land, ix, iy, ik)}" fill="#d9d9d9" stroke="#9e9e9e" stroke-width=".4"/>` +
          `<path d="${pd(I.kh, ix, iy, ik)}" fill="#e34a33" stroke="#7f0000" stroke-width=".5"/>` +
          I.labels.map(([t, x, y]) => `<text x="${ix + x * ik}" y="${iy + y * ik}" font-size="10" text-anchor="middle">${t}</text>`).join("") + `</g>`; }
      svg += "</svg>";
      el.querySelector(".me-map").innerHTML = svg;
      let n = 0;
      el.querySelector(".me-q").innerHTML = "<b>សំណួររបស់អ្នកអាន</b>" + Q.map(([q, need]) => {
        const ok = need.every((x) => on[x]); if (ok) n++;
        return `<div class="me-row ${ok ? "ok" : "no"}">${ok ? "✓" : "✗"} ${q}</div>`;
      }).join("");
      el.querySelector(".sim-out").innerHTML = `អ្នកអានអាចឆ្លើយបាន <b>${kh(n)} / ${kh(Q.length)}</b> សំណួរ។ ` +
        (n === Q.length ? "ផែនទីពេញលេញ។ ប៉ុន្តែធាតុច្រើនពេកក៏រំខានដែរ៖ ធាតុនីមួយៗត្រូវមានហេតុផល។" : "ពិនិត្យថា ធាតុណាចាំបាច់សម្រាប់ផែនទីនេះ និងធាតុណាអាចលុបបាន ដោយគិតពីអ្នកអាន។");
    };
    el.querySelectorAll("input").forEach((c) => c.addEventListener("change", draw));
    el.querySelector(".me-all").onclick = () => { el.querySelectorAll("input").forEach((c) => (c.checked = true)); draw(); };
    draw();
  };

  /* ---------- helpers for canvas sims ---------- */
  const shellC = (el, title, controls) => {
    el.innerHTML = `<div class="sim-title">${title}</div><div class="sim-controls">${controls}</div><div class="sim-body"><div class="sim-canvas-wrap"><canvas></canvas></div></div><div class="sim-out"></div>`;
    const cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
    return { cv, ctx, out: el.querySelector(".sim-out"), q: (x) => el.querySelector(x) };
  };
  const fitC = (cv, ctx, W, H) => { const w = cv.parentElement.clientWidth || W, s = w / W, d = window.devicePixelRatio || 1;
    cv.style.width = w + "px"; cv.style.height = H * s + "px"; cv.width = w * d; cv.height = H * s * d; ctx.setTransform(s * d, 0, 0, s * d, 0, 0); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ramp = (t, stops) => { t = clamp(t, 0, 1); const n = stops.length - 1, i = Math.min(n - 1, Math.floor(t * n)), f = t * n - i; const a = stops[i], b = stops[i + 1]; return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(",")})`; };
  const fmtN = (n, dec = 0) => kh(Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/,/g, " ").replace(".", ","));
  const font = () => getComputedStyle(document.body).fontFamily;

  /* ---------- L2 · Datum shift ---------- */
  window.EXTRA_SIMS["datum-shift"] = (el) => {
    const CRS = [
      ["WGS 84 / UTM 48N", "EPSG:32648", 492171, 1277503, "#1565c0"],
      ["WGS 72 / UTM 48N", "EPSG:32248", 492155, 1277498, "#6a1b9a"],
      ["Indian 1954 / UTM 48N", "EPSG:23948", 492594, 1277185, "#2e7d32"],
      ["Indian 1960 / UTM 48N", "EPSG:3148", 492590, 1277180, "#e65100"],
      ["Indian 1975 / UTM 48N", "EPSG:24048", 492764, 1277137, "#c62828"]];
    const { cv, ctx, out, q } = shellC(el, "ទីតាំងតែមួយ ដាតុមខុសគ្នា៖ វិមានឯករាជ្យ ភ្នំពេញ",
      `<label>អានកូអរដោនេក្នុង <select class="ds-c">${CRS.map((c, i) => `<option value="${i}">${c[0]}</option>`).join("")}</select></label>
       <label><input type="checkbox" class="ds-err"> បញ្ចូលលេខនេះក្នុងស្រទាប់ WGS 84 ដោយខុស</label>`);
    const W = 640, H = 380, S = 0.42, cx = 250, cy = 170; // px per metre
    const draw = () => {
      fitC(cv, ctx, W, H); const i = +q(".ds-c").value, c = CRS[i], err = q(".ds-err").checked;
      ctx.fillStyle = "#f5f3ee"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#e0ddd4"; ctx.lineWidth = 1;
      for (let m = -600; m <= 900; m += 100) { const x = cx + m * S; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let m = -500; m <= 500; m += 100) { const y = cy - m * S; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = "#bdbdbd"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
      ctx.fillStyle = "#795548"; ctx.fillRect(cx - 9, cy - 9, 18, 18);
      ctx.font = `12px ${font()}`; ctx.fillStyle = "#4e342e"; ctx.fillText("វិមានឯករាជ្យ (ទីតាំងពិត)", cx + 14, cy - 12);
      CRS.forEach((k, j) => { if (j === 0) return; const x = cx + (k[2] - CRS[0][2]) * S, y = cy - (k[3] - CRS[0][3]) * S;
        ctx.beginPath(); ctx.arc(x, y, j === i && err ? 8 : 4, 0, 7); ctx.fillStyle = j === i && err ? k[4] : "rgba(0,0,0,.18)"; ctx.fill(); });
      if (err && i > 0) {
        const x = cx + (c[2] - CRS[0][2]) * S, y = cy - (c[3] - CRS[0][3]) * S;
        ctx.strokeStyle = c[4]; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = c[4]; ctx.fillText("ទីតាំងដែលបង្ហាញខុស", x + 10, y + 4);
      }
      ctx.fillStyle = "#212121"; ctx.fillRect(20, H - 30, 100 * S * 2, 5); ctx.fillText("២០០ ម", 20, H - 12);
      const d = Math.hypot(c[2] - CRS[0][2], c[3] - CRS[0][3]);
      out.innerHTML = `<b>${c[0]}</b> (${c[1]})៖ E = <b>${fmtN(c[2])}</b> ម · N = <b>${fmtN(c[3])}</b> ម<br>` +
        (i === 0 ? "នេះជាប្រព័ន្ធដែលសៀវភៅ និងទិន្នន័យវគ្គសិក្សាប្រើ។ ជ្រើសដាតុមផ្សេង ដើម្បីមើលថាលេខប្ដូរ ទោះទីតាំងនៅដដែល។"
          : `លេខខុសពី WGS 84 ប្រហែល <b>${fmtN(d)} ម</b>។ ` + (err ? `បើយកលេខនេះទៅដាក់ក្នុងស្រទាប់ WGS 84 ចំណុចនឹងធ្លាក់ខុសកន្លែង ${fmtN(d)} ម ដោយគ្មានសារព្រមាន។` : "ធីកប្រអប់ខាងលើ ដើម្បីមើលផលវិបាក។")) +
        `<br><span class="sim-hint">តម្លៃគណនាដោយ PROJ ជាមួយប៉ារ៉ាម៉ែត្របំប្លែង EPSG។ ប៉ារ៉ាម៉ែត្រផ្សេងអាចផ្ដល់លទ្ធផលខុសគ្នាច្រើនម៉ែត្រ។</span>`;
    };
    el.querySelectorAll("select,input").forEach((x) => x.addEventListener("change", draw)); draw();
    window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ---------- L3 · Projection & Tissot indicatrix ---------- */
  window.EXTRA_SIMS["projection"] = (el) => {
    const P = {
      plate: ["Plate Carrée (EPSG:4326 ជាប្លង់)", (l, p) => [l, p], "រក្សាចម្ងាយតាមខ្សែមេរីឌាន ប៉ុន្តែផ្ទៃ និងរាងខូច កាន់តែខ្លាំងទៅប៉ូល។"],
      merc: ["Mercator (Web Mercator)", (l, p) => [l, (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (Math.min(Math.abs(p), 84) * Math.sign(p) * Math.PI) / 360))], "រក្សារាង (conformal) ប៉ុន្តែផ្ទៃរីកធំខ្លាំងទៅប៉ូល។ កម្ពុជាធំជាងពិតប្រហែល ៦%។"],
      equal: ["Lambert Cylindrical Equal-Area", (l, p) => [l, (180 / Math.PI) * Math.sin((p * Math.PI) / 180)], "រក្សាផ្ទៃ (equal-area) ប៉ុន្តែរាងបង្រួមក្បែរប៉ូល។"],
      sinus: ["Sinusoidal", (l, p) => [l * Math.cos((p * Math.PI) / 180), p], "រក្សាផ្ទៃ ហើយរាងល្អនៅកណ្ដាល ប៉ុន្តែខូចខ្លាំងនៅគែម។"],
    };
    const { cv, ctx, out, q } = shellC(el, "ចំណោលផែនទី និងរង្វង់ Tissot",
      `<span class="sim-seg">${Object.entries(P).map(([k, v], i) => `<button type="button" data-p="${k}" class="${i ? "" : "on"}">${v[0].split(" (")[0]}</button>`).join("")}</span>
       <span class="sim-hint">រង្វង់ទាំងអស់មានទំហំស្មើគ្នាលើផែនដី។ មើលថាវាប្ដូររាង និងទំហំយ៉ាងណាលើផែនទី។</span>`);
    let key = "plate"; const W = 640, H = 400;
    const draw = () => {
      fitC(cv, ctx, W, H); const f = P[key][1];
      const ymax = key === "merc" ? f(0, 84)[1] : key === "equal" ? f(0, 90)[1] : 90;
      const sc = Math.min((W / 2 - 16) / 180, (H / 2 - 16) / ymax);   // same scale on both axes: shapes stay honest
      const X = (l) => W / 2 + l * sc, Y = (y) => H / 2 - y * sc;
      ctx.fillStyle = "#e3f2fd"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#90a4ae"; ctx.lineWidth = 0.7;
      for (let l = -180; l <= 180; l += 30) { ctx.beginPath(); for (let p = -84; p <= 84; p += 2) { const [x, y] = f(l, p); p === -84 ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); } ctx.stroke(); }
      for (let p = -75; p <= 75; p += 15) { ctx.beginPath(); for (let l = -180; l <= 180; l += 3) { const [x, y] = f(l, p); l === -180 ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); } ctx.stroke(); }
      ctx.strokeStyle = "#1565c0"; ctx.lineWidth = 1.3; ctx.beginPath(); for (let l = -180; l <= 180; l += 3) { const [x, y] = f(l, 0); l === -180 ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); } ctx.stroke();
      const r = 6; // degrees radius on sphere
      for (let p = -60; p <= 60; p += 30) for (let l = -150; l <= 150; l += 60) {
        ctx.beginPath();
        for (let a = 0; a <= 360; a += 10) { const t = (a * Math.PI) / 180, pp = p + r * Math.sin(t), ll = l + (r * Math.cos(t)) / Math.cos((pp * Math.PI) / 180); const [x, y] = f(ll, pp); a ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
        ctx.fillStyle = "rgba(230,81,0,.35)"; ctx.fill(); ctx.strokeStyle = "#e65100"; ctx.lineWidth = 1; ctx.stroke();
      }
      const [kx, ky] = f(105, 12.5); ctx.beginPath(); ctx.arc(X(kx), Y(ky), 5, 0, 7); ctx.fillStyle = "#c62828"; ctx.fill();
      ctx.font = `12px ${font()}`; ctx.fillStyle = "#b71c1c"; ctx.fillText("កម្ពុជា", X(kx) + 8, Y(ky) - 6);
      out.innerHTML = `<b>${P[key][0]}</b>៖ ${P[key][2]}<br><span class="sim-hint">ផ្ទៃកម្ពុជា (Kh_Country_area)៖ លើអេលីបសូអ៊ីត ១៨១ ៦៨៥ គម² · UTM 48N ១៨១ ៦៣៣ គម² · Web Mercator ១៩២ ១៥០ គម²</span>`;
    };
    el.querySelectorAll(".sim-seg button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".sim-seg button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); key = b.dataset.p; draw(); }));
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ---------- L4 · Scale converter & enlargement ---------- */
  window.EXTRA_SIMS["scale"] = (el) => {
    el.innerHTML = `<div class="sim-title">មាត្រដ្ឋាន៖ គណនាចម្ងាយ និងការពង្រីកផែនទី</div>
      <div class="sim-controls">
        <label>មាត្រដ្ឋាន ១ : <select class="sc-s"><option>5000</option><option>25000</option><option selected>50000</option><option>100000</option><option>1000000</option></select></label>
        <label>ចម្ងាយវាស់លើផែនទី <input type="number" class="sc-d sim-input" value="4" min="0" step="0.1" style="width:5em"> សម</label>
        <label>ថតចម្លងពង្រីក <b class="sc-zv"></b> <input type="range" class="sc-z" min="50" max="200" step="10" value="100"></label></div>
      <div class="sc-view"></div><div class="sim-out"></div>`;
    const q = (x) => el.querySelector(x);
    const draw = () => {
      const S = +q(".sc-s").value, d = +q(".sc-d").value || 0, z = +q(".sc-z").value / 100;
      const ground = (d * S) / 100, eff = S / z, PXCM = 38;            // ~38 px per printed cm on screen
      const nice = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];      // bar length in km
      const barKm = nice.reduce((a, k) => (Math.abs((k * 1e5 / S) * PXCM * z - 300) < Math.abs((a * 1e5 / S) * PXCM * z - 300) ? k : a));
      const barPx = (barKm * 1e5 / S) * PXCM * z;
      q(".sc-zv").textContent = kh(Math.round(z * 100)) + "%";
      q(".sc-view").innerHTML = `<svg viewBox="0 0 640 120" style="width:100%;background:#fafafa;border:1px solid #ddd;border-radius:4px">
        <text x="20" y="30" font-size="16" font-family="${font()}">១ : ${fmtN(S)}${z !== 1 ? `  <tspan fill="#c62828">(ក្រោយពង្រីក៖ ពិតប្រាកដ ១ : ${fmtN(eff)})</tspan>` : ""}</text>
        ${[0, 1, 2, 3].map((i) => `<rect x="${20 + (i * barPx) / 4}" y="60" width="${barPx / 4}" height="10" fill="${i % 2 ? "#fff" : "#212121"}" stroke="#212121"/>`).join("")}
        <text x="20" y="92" font-size="13" font-family="${font()}">០</text><text x="${20 + barPx}" y="92" font-size="13" text-anchor="middle" font-family="${font()}">${fmtN(barKm, barKm < 1 ? 1 : 0)} គម</text>
        <text x="${30 + barPx + 20}" y="70" font-size="12" fill="#2e7d32" font-family="${font()}">របារមាត្រដ្ឋានពង្រីកជាមួយផែនទី ដូច្នេះនៅតែត្រឹមត្រូវ</text></svg>`;
      q(".sim-out").innerHTML = `${fmtN(d, 1)} សម លើផែនទី ១ : ${fmtN(S)} = <b>${fmtN(ground)} ម</b> (${fmtN(ground / 1000, 2)} គម) លើដី` +
        `<br>១ សម លើផែនទី = ${fmtN(S / 100)} ម លើដី · ១ គម លើដី = ${fmtN(barCm, 2)} សម លើផែនទី` +
        (z !== 1 ? `<br><span class="sim-warn">ក្រោយពង្រីក ${kh(Math.round(z * 100))}% លេខ «១ : ${fmtN(S)}» ដែលបោះពុម្ពលើផែនទី <b>ខុស</b>៖ ប្រើ ${fmtN(d, 1)} សម នឹងទទួលបាន ${fmtN((d / z) * S / 100)} ម ពិតប្រាកដ។ របារមាត្រដ្ឋាននៅតែត្រឹមត្រូវ។</span>` : "");
    };
    el.querySelectorAll("input,select").forEach((x) => x.addEventListener("input", draw)); draw();
  };

  /* ---------- L5 · Contours, profile and grid references ---------- */
  let tcache = null;
  const loadTerrain = async () => tcache || (tcache = await (await fetch(new URL("../../assets/data/terrain_sample.json", location.href))).json());
  const bilinear = (T, u, v) => { const n = T.n - 1, x = Math.min(0.999, Math.max(0, u)) * n, y = Math.min(0.999, Math.max(0, v)) * n;
    const i = Math.floor(y), j = Math.floor(x), fy = y - i, fx = x - j;
    return T.z[i][j] * (1 - fx) * (1 - fy) + T.z[i][j + 1] * fx * (1 - fy) + T.z[i + 1][j] * (1 - fx) * fy + T.z[i + 1][j + 1] * fx * fy; };

  window.EXTRA_SIMS["contour"] = async (el) => {
    const T = await loadTerrain();
    const { cv, ctx, out, q } = shellC(el, "ខ្សែវណ្ឌ ជម្រាល និងផ្នែកកាត់បញ្ឈរ",
      `<label>ចន្លោះខ្សែវណ្ឌ <select class="ct-i"><option>10</option><option selected>20</option><option>50</option><option>100</option></select> ម</label>
       <label><input type="checkbox" class="ct-sh" checked> ពណ៌តាមកម្ពស់</label>
       <label><input type="checkbox" class="ct-v" checked> ភូមិ</label>
       <span class="sim-hint">ដាក់កណ្ដុរលើផែនទី ដើម្បីអានកម្ពស់ និងកូអរដោនេ · អូសចំណុច A និង B ដើម្បីប្ដូរខ្សែកាត់</span>`);
    const W = 640, H = 325, M = 300;
    let A = [0.18, 0.78], B = [0.72, 0.30], drag = null, hover = null;
    const ramp5 = (t) => ramp(t, [[199, 233, 180], [173, 221, 142], [255, 237, 160], [254, 178, 76], [217, 95, 14]]);
    const draw = () => {
      fitC(cv, ctx, W, H); const iv = +q(".ct-i").value, shade = q(".ct-sh").checked;
      const ox = 10, oy = 10, S = M;
      ctx.fillStyle = "#fdfaf2"; ctx.fillRect(0, 0, W, H);
      if (shade) { const step = 4; for (let py = 0; py < S; py += step) for (let px = 0; px < S; px += step) {
        const z = bilinear(T, px / S, 1 - py / S); ctx.fillStyle = ramp5(z / 360); ctx.fillRect(ox + px, oy + py, step, step); } }
      // marching squares
      const n = 120, zmax = 360;
      for (let lev = iv; lev < zmax; lev += iv) {
        const index = lev % (iv * 5) === 0 || lev % 100 === 0;
        ctx.beginPath();
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const u0 = j / n, v0 = 1 - i / n, u1 = (j + 1) / n, v1 = 1 - (i + 1) / n;
          const a = bilinear(T, u0, v0), b = bilinear(T, u1, v0), c = bilinear(T, u1, v1), d = bilinear(T, u0, v1);
          const P = [[a, b, u0, v0, u1, v0], [b, c, u1, v0, u1, v1], [c, d, u1, v1, u0, v1], [d, a, u0, v1, u0, v0]];
          const pts = [];
          P.forEach(([p, qv, ux, uy, vx, vy]) => { if ((p - lev) * (qv - lev) < 0) { const t = (lev - p) / (qv - p);
            pts.push([ux + (vx - ux) * t, uy + (vy - uy) * t]); } });
          if (pts.length >= 2) { ctx.moveTo(ox + pts[0][0] * S, oy + (1 - pts[0][1]) * S); ctx.lineTo(ox + pts[1][0] * S, oy + (1 - pts[1][1]) * S); }
        }
        ctx.strokeStyle = index ? "#8a5a33" : "rgba(161,114,74,.85)"; ctx.lineWidth = index ? 1.6 : 0.8; ctx.stroke();
      }
      // UTM grid every 2 km
      ctx.strokeStyle = "rgba(58,110,165,.75)"; ctx.lineWidth = 0.8; ctx.font = `10px ${font()}`; ctx.fillStyle = "#3a6ea5";
      for (let k = 2; k < 12; k += 2) { const p = (k / 12) * S;
        ctx.beginPath(); ctx.moveTo(ox + p, oy); ctx.lineTo(ox + p, oy + S); ctx.moveTo(ox, oy + S - p); ctx.lineTo(ox + S, oy + S - p); ctx.stroke();
        ctx.fillText(String(400 + k), ox + p + 2, oy + S - 3); ctx.fillText(String(1250 + k), ox + 2, oy + S - p - 3); }
      ctx.strokeStyle = "#555"; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, S, S);
      if (q(".ct-v").checked) T.villages.forEach(([nm, x, y]) => { const px = ox + ((x - T.x0) / T.size) * S, py = oy + (1 - (y - T.y0) / T.size) * S;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fillStyle = "#212121"; ctx.fill(); ctx.fillText(nm, px + 6, py - 5); });
      // profile line
      const pA = [ox + A[0] * S, oy + (1 - A[1]) * S], pB = [ox + B[0] * S, oy + (1 - B[1]) * S];
      ctx.strokeStyle = "#c62828"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...pA); ctx.lineTo(...pB); ctx.stroke();
      [["A", pA], ["B", pB]].forEach(([t, p]) => { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.fillStyle = "#c62828"; ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `bold 10px ${font()}`; ctx.fillText(t, p[0] - 3, p[1] + 3.5); ctx.font = `10px ${font()}`; });
      // profile graph
      const gx = M + 40, gy = 40, gw = W - gx - 20, gh = 230;
      ctx.fillStyle = "#fff"; ctx.fillRect(gx, gy, gw, gh); ctx.strokeStyle = "#999"; ctx.strokeRect(gx, gy, gw, gh);
      const N = 120, zs = []; for (let i = 0; i <= N; i++) zs.push(bilinear(T, A[0] + (B[0] - A[0]) * i / N, A[1] + (B[1] - A[1]) * i / N));
      ctx.beginPath(); zs.forEach((z, i) => { const x = gx + (gw * i) / N, y = gy + gh - (z / 380) * gh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.lineTo(gx + gw, gy + gh); ctx.lineTo(gx, gy + gh); ctx.closePath(); ctx.fillStyle = "rgba(141,110,99,.35)"; ctx.fill();
      ctx.strokeStyle = "#6d4c41"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = "#555"; ctx.font = `10px ${font()}`;
      [0, 100, 200, 300].forEach((z) => { const y = gy + gh - (z / 380) * gh; ctx.fillText(kh(z), gx - 26, y + 3);
        ctx.strokeStyle = "#eee"; ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke(); });
      ctx.fillStyle = "#c62828"; ctx.fillText("A", gx - 4, gy + gh + 14); ctx.fillText("B", gx + gw - 4, gy + gh + 14);
      ctx.fillStyle = "#555"; ctx.fillText("កម្ពស់ (ម)", gx - 30, gy - 8);
      const len = Math.hypot((B[0] - A[0]) * T.size, (B[1] - A[1]) * T.size), zA = zs[0], zB = zs[N];
      const dz = Math.max(...zs) - Math.min(...zs), slope = (Math.abs(zB - zA) / len) * 100;
      out.innerHTML = (hover ? `កម្ពស់ក្រោមកណ្ដុរ៖ <b>${fmtN(hover.z)} ម</b> · E ${fmtN(hover.E)} · N ${fmtN(hover.N)} · លេខយោងក្រឡា ៦ ខ្ទង់៖ <b>${hover.gr}</b><br>` : "") +
        `ខ្សែ A–B៖ ប្រវែង <b>${fmtN(len)} ម</b> · កម្ពស់ A ${fmtN(zA)} ម · B ${fmtN(zB)} ម · ឡើងចុះ ${fmtN(dz)} ម · ជម្រាលមធ្យម A→B <b>${fmtN(slope, 1)}%</b>
         <br><span class="sim-hint">ខ្សែវណ្ឌជិតគ្នា = ជម្រាលចោត · ខ្សែឆ្ងាយគ្នា = ជម្រាលរាប។ កម្ពស់ក្នុងគំរូនេះជាតម្លៃសំយោគសម្រាប់បង្រៀន។</span>`;
    };
    const pos = (e) => { const r = cv.getBoundingClientRect(), s = r.width / W;
      return [(e.clientX - r.left) / s, (e.clientY - r.top) / s]; };
    cv.addEventListener("pointerdown", (e) => { const [x, y] = pos(e); const S = 300, ox = 10, oy = 10;
      const dA = Math.hypot(x - (ox + A[0] * S), y - (oy + (1 - A[1]) * S)), dB = Math.hypot(x - (ox + B[0] * S), y - (oy + (1 - B[1]) * S));
      if (Math.min(dA, dB) < 14) { drag = dA < dB ? "A" : "B"; cv.setPointerCapture(e.pointerId); } });
    cv.addEventListener("pointermove", (e) => { const [x, y] = pos(e); const S = 300, ox = 10, oy = 10;
      const u = (x - ox) / S, v = 1 - (y - oy) / S;
      if (drag) { const p = [clamp(u, 0, 1), clamp(v, 0, 1)]; drag === "A" ? (A = p) : (B = p); }
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) { const E = Math.round(T.x0 + u * T.size), N = Math.round(T.y0 + v * T.size);
        hover = { z: Math.round(bilinear(T, u, v)), E, N, gr: `${String(Math.floor((E % 100000) / 100)).padStart(3, "0")} ${String(Math.floor((N % 100000) / 100)).padStart(3, "0")}` }; }
      else hover = null;
      draw(); });
    cv.addEventListener("pointerup", () => (drag = null));
    cv.addEventListener("pointerleave", () => { hover = null; draw(); });
    el.querySelectorAll("select,input").forEach((x) => x.addEventListener("change", draw));
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ---------- L6 · Visual variables ---------- */
  window.EXTRA_SIMS["visual-variables"] = (el) => {
    const VARS = [["size", "ទំហំ"], ["value", "តម្លៃពន្លឺ"], ["hue", "ពណ៌"], ["shape", "រាង"], ["orient", "ទិសដៅ"], ["texture", "វាយនភាព"]];
    const LEV = [["nominal", "Nominal · ប្រភេទ (ប្រភេទសាលា)"], ["ordinal", "Ordinal · លំដាប់ (ស្ថានភាពផ្លូវ)"], ["ratio", "Quantitative · បរិមាណ (ប្រជាជន)"]];
    const OK = { size: { nominal: 0, ordinal: 2, ratio: 2 }, value: { nominal: 0, ordinal: 2, ratio: 1 }, hue: { nominal: 2, ordinal: 0, ratio: 0 },
      shape: { nominal: 2, ordinal: 0, ratio: 0 }, orient: { nominal: 1, ordinal: 0, ratio: 0 }, texture: { nominal: 1, ordinal: 1, ratio: 0 } };
    const NOTE = { "size-ratio": "ទំហំជាអថេរល្អបំផុតសម្រាប់បរិមាណ ព្រោះភ្នែកអានលំដាប់ និងសមាមាត្របាន។",
      "size-nominal": "ទំហំបង្កើតលំដាប់ក្លែងក្លាយ៖ អ្នកអានគិតថាសញ្ញាធំសំខាន់ជាង។",
      "value-ratio": "តម្លៃពន្លឺល្អសម្រាប់ផែនទី choropleth ប៉ុន្តែភ្នែកអានសមាមាត្រមិនច្បាស់ដូចទំហំ។",
      "value-ordinal": "តម្លៃពន្លឺល្អបំផុតសម្រាប់លំដាប់៖ ស្រាល → ដិត។",
      "value-nominal": "តម្លៃពន្លឺបង្កើតលំដាប់ក្លែងក្លាយសម្រាប់ប្រភេទ។",
      "hue-nominal": "ពណ៌ល្អបំផុតសម្រាប់ប្រភេទ ព្រោះវាមិនបង្កើតលំដាប់។",
      "hue-ordinal": "ពណ៌ផ្សេងៗគ្នាមិនមានលំដាប់ធម្មជាតិទេ។ ប្រើតម្លៃពន្លឺវិញ។",
      "hue-ratio": "ពណ៌មិនបង្ហាញបរិមាណទេ។ អ្នកអានមិនដឹងថាខៀវធំជាង ឬតូចជាងបៃតង។",
      "shape-nominal": "រាងសញ្ញាល្អសម្រាប់ប្រភេទ ជាពិសេសសញ្ញារូបភាព (សាលា មន្ទីរពេទ្យ)។",
      "shape-ordinal": "រាងគ្មានលំដាប់ធម្មជាតិ។", "shape-ratio": "រាងមិនបង្ហាញបរិមាណ។",
      "orient-nominal": "ទិសដៅប្រើបានសម្រាប់ប្រភេទតិច ប៉ុន្តែពិបាកអានជាងរាង ឬពណ៌។",
      "orient-ordinal": "ទិសដៅមិនបង្ហាញលំដាប់ច្បាស់។", "orient-ratio": "ទិសដៅមិនបង្ហាញបរិមាណ។",
      "texture-nominal": "វាយនភាព (ខ្សែ ចំណុច) ប្រើបានពេលបោះពុម្ពសខ្មៅ។",
      "texture-ordinal": "ដង់ស៊ីតេវាយនភាពអាចបង្ហាញលំដាប់បាន ប៉ុន្តែងាយធ្វើឲ្យភ្នែករំខាន។",
      "texture-ratio": "វាយនភាពមិនផ្ដល់ការអានបរិមាណច្បាស់ទេ។" };
    el.innerHTML = `<div class="sim-title">អថេរមើលឃើញ៖ តើអថេរណាសមនឹងទិន្នន័យណា?</div>
      <div class="sim-controls"><span class="sim-seg vv-v">${VARS.map(([k, n], i) => `<button type="button" data-k="${k}" class="${i ? "" : "on"}">${n}</button>`).join("")}</span>
      <label>ប្រភេទទិន្នន័យ <select class="vv-l">${LEV.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></label></div>
      <div class="sim-body"><div class="sim-canvas-wrap vv-draw"></div></div><div class="sim-out"></div>`;
    let v = "size";
    const draw = () => {
      const lev = el.querySelector(".vv-l").value, score = OK[v][lev];
      const vals = lev === "nominal" ? ["ក", "ខ", "គ", "ឃ", "ង"] : ["១", "២", "៣", "៤", "៥"];
      const g = [];
      for (let i = 0; i < 5; i++) {
        const t = i / 4, cx = 70 + i * 105, cy = 70;
        if (v === "size") g.push(`<circle cx="${cx}" cy="${cy}" r="${8 + t * 26}" fill="#3949ab" opacity=".8"/>`);
        if (v === "value") g.push(`<rect x="${cx - 30}" y="${cy - 30}" width="60" height="60" fill="rgb(${230 - t * 190},${235 - t * 190},${245 - t * 150})" stroke="#999"/>`);
        if (v === "hue") g.push(`<rect x="${cx - 30}" y="${cy - 30}" width="60" height="60" fill="${["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"][i]}" opacity=".85" stroke="#999"/>`);
        if (v === "shape") g.push(["<circle cx='X' cy='Y' r='20' />", "<rect x='X2' y='Y2' width='38' height='38'/>", "<polygon points='X,Y-22 X+20,Y+16 X-20,Y+16'/>", "<polygon points='X,Y-24 X+22,Y X,Y+24 X-22,Y'/>", "<polygon points='X-20,Y-20 X+20,Y-20 X+12,Y+20 X-12,Y+20'/>"][i]
          .replace(/X2/g, cx - 19).replace(/Y2/g, cy - 19).replace(/X([+-]\d+)?/g, (m, d) => String(cx + (d ? +d : 0))).replace(/Y([+-]\d+)?/g, (m, d) => String(cy + (d ? +d : 0))) + "");
        if (v === "orient") g.push(`<g transform="rotate(${i * 36} ${cx} ${cy})"><rect x="${cx - 4}" y="${cy - 26}" width="8" height="52" fill="#3949ab"/></g>`);
        if (v === "texture") g.push(`<rect x="${cx - 30}" y="${cy - 30}" width="60" height="60" fill="url(#p${i})" stroke="#999"/>`);
        g.push(`<text x="${cx}" y="${cy + 52}" text-anchor="middle" font-size="13" font-family="${font()}">${vals[i]}</text>`);
      }
      const defs = `<defs>${[2, 4, 6, 9, 13].map((d, i) => `<pattern id="p${i}" width="${d}" height="${d}" patternUnits="userSpaceOnUse"><rect width="${d}" height="${d}" fill="#fff"/><circle cx="${d / 2}" cy="${d / 2}" r="1.6" fill="#3949ab"/></pattern>`).join("")}</defs>`;
      el.querySelector(".vv-draw").innerHTML = `<svg viewBox="0 0 600 140" style="width:100%;background:#fafafa;border:1px solid #ddd;border-radius:4px">${defs}<g fill="#3949ab">${g.join("")}</g></svg>`;
      const verdict = ["✗ មិនសមស្រប", "⚠ ប្រើបានដោយប្រុងប្រយ័ត្ន", "✓ សមស្រប"][score];
      const cls = ["sim-warn", "", "ft-ok"][score];
      el.querySelector(".sim-out").innerHTML = `<b class="${cls}">${verdict}</b> · ${NOTE[v + "-" + lev] || ""}`;
    };
    el.querySelectorAll(".vv-v button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".vv-v button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); v = b.dataset.k; draw(); }));
    el.querySelector(".vv-l").onchange = draw; draw();
  };

  /* ---------- L7 · Classification methods ---------- */
  const breaksOf = (vals, k, method) => {
    const v = vals.slice().sort((a, b) => a - b), n = v.length, mn = v[0], mx = v[n - 1];
    if (method === "equal") return Array.from({ length: k + 1 }, (_, i) => mn + ((mx - mn) * i) / k);
    if (method === "quantile") return Array.from({ length: k + 1 }, (_, i) => { const p = (i / k) * (n - 1), lo = Math.floor(p); return v[lo] + (v[Math.min(n - 1, lo + 1)] - v[lo]) * (p - lo); });
    if (method === "std") { const m = v.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / n);
      const inner = []; for (let i = -(k - 2) / 2; i <= (k - 2) / 2; i++) inner.push(m + sd * i);
      return [mn, ...inner.map((x) => clamp(x, mn, mx)), mx].sort((a, b) => a - b); }
    // natural breaks: 1-D k-means (Jenks-like)
    let c = Array.from({ length: k }, (_, i) => v[Math.min(n - 1, Math.floor(((i + 0.5) / k) * n))]);
    let lab = [];
    for (let it = 0; it < 60; it++) {
      lab = v.map((x) => c.reduce((bi, cc, j) => (Math.abs(x - cc) < Math.abs(x - c[bi]) ? j : bi), 0));
      const nc = c.map((cc, j) => { const g = v.filter((_, i) => lab[i] === j); return g.length ? g.reduce((a, b) => a + b, 0) / g.length : cc; });
      if (nc.every((x, j) => Math.abs(x - c[j]) < 1e-9)) break; c = nc;
    }
    const br = [mn];
    for (let j = 0; j < k - 1; j++) { const a = v.filter((_, i) => lab[i] === j), b = v.filter((_, i) => lab[i] === j + 1);
      br.push(a.length && b.length ? (a[a.length - 1] + b[0]) / 2 : br[br.length - 1]); }
    br.push(mx); return br;
  };
  const PALS = { seq: ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000", "#7f0000"],
    div: ["#2166ac", "#67a9cf", "#d1e5f0", "#f7f7f7", "#fddbc7", "#ef8a62", "#b2182b"],
    qual: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628", "#f781bf"],
    rainbow: ["#4b0082", "#0000ff", "#00ff00", "#ffff00", "#ff7f00", "#ff0000", "#8b0000"] };
  const pick = (pal, k, i) => { const P = PALS[pal]; return P[Math.round((i * (P.length - 1)) / Math.max(1, k - 1))]; };

  window.EXTRA_SIMS["classification"] = async (el) => {
    const D = await load();
    const { cv, ctx, out, q } = shellC(el, "វិធីចាត់ថ្នាក់៖ ទិន្នន័យដដែល ផែនទីខុសគ្នា",
      `<span class="sim-seg cls-m"><button type="button" data-m="equal" class="on">ចន្លោះស្មើ</button><button type="button" data-m="quantile">ចំនួនស្មើ</button><button type="button" data-m="natural">ចន្លោះធម្មជាតិ</button><button type="button" data-m="std">គម្លាតគំរូ</button></span>
       <label>ចំនួនថ្នាក់ <b class="cls-kv"></b> <input type="range" class="cls-k" min="3" max="7" value="5"></label>`);
    const vals = D.prov.map((p) => p.dens);
    const W = 640, H = 330;
    const draw = () => {
      fitC(cv, ctx, W, H);
      const k = +q(".cls-k").value, m = el.querySelector(".cls-m .on").dataset.m;
      q(".cls-kv").textContent = kh(k);
      const br = breaksOf(vals, k, m);
      const cls = (v) => { for (let i = k - 1; i >= 0; i--) if (v >= br[i]) return i; return 0; };
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      const sc = 1.05, ox = 10, oy = 15;
      D.prov.forEach((p) => { ctx.beginPath();
        p.r.forEach((ring) => ring.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * sc, oy + y * sc) : ctx.moveTo(ox + x * sc, oy + y * sc))));
        ctx.closePath(); ctx.fillStyle = pick("seq", k, cls(p.dens)); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.7; ctx.stroke(); });
      // histogram
      const hx = 350, hy = 40, hw = 270, hh = 120, mx = Math.max(...vals);
      ctx.strokeStyle = "#999"; ctx.strokeRect(hx, hy, hw, hh);
      const bins = 26, cnt = new Array(bins).fill(0);
      vals.forEach((v) => cnt[Math.min(bins - 1, Math.floor((v / mx) * bins))]++);
      const cmax = Math.max(...cnt);
      cnt.forEach((c, i) => { const x = hx + (hw * i) / bins, h = (c / cmax) * (hh - 6);
        ctx.fillStyle = pick("seq", k, cls(((i + 0.5) / bins) * mx)); ctx.fillRect(x + 1, hy + hh - h, hw / bins - 2, h); });
      br.slice(1, -1).forEach((b) => { const x = hx + (b / mx) * hw; ctx.strokeStyle = "#c62828"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, hy + hh); ctx.stroke(); ctx.setLineDash([]); });
      ctx.fillStyle = "#555"; ctx.font = `11px ${font()}`;
      ctx.fillText("ការចែកចាយទិន្នន័យ · បន្ទាត់ក្រហម = ព្រំថ្នាក់", hx, hy - 8);
      ctx.fillText("០", hx, hy + hh + 14); ctx.fillText(kh(Math.round(mx)) + " នាក់/គម²", hx + hw, hy + hh + 14);
      // legend + counts
      let ly = hy + hh + 34;
      for (let i = k - 1; i >= 0; i--) { const n = vals.filter((v) => cls(v) === i).length;
        ctx.fillStyle = pick("seq", k, i); ctx.fillRect(hx, ly, 16, 12); ctx.strokeStyle = "#999"; ctx.strokeRect(hx, ly, 16, 12);
        ctx.fillStyle = "#333"; ctx.fillText(`${fmtN(Math.round(br[i]))} – ${fmtN(Math.round(br[i + 1]))}  (${kh(n)} ខេត្ត)`, hx + 22, ly + 11); ly += 17; }
      const top = vals.filter((v) => cls(v) === k - 1).length;
      const note = { equal: "ចន្លោះស្មើ៖ ព្រំថ្នាក់ងាយយល់ ប៉ុន្តែពេលទិន្នន័យលម្អៀង (ភ្នំពេញ ២ ០៤៩) ខេត្តស្ទើរទាំងអស់ធ្លាក់ក្នុងថ្នាក់ទាបតែមួយ។",
        quantile: "ចំនួនស្មើ៖ ថ្នាក់នីមួយៗមានខេត្តប្រហែលស្មើគ្នា ដែលបង្ហាញលំដាប់ច្បាស់ ប៉ុន្តែអាចបំបែកតម្លៃស្រដៀងគ្នា ឬបញ្ចូលតម្លៃខុសគ្នាឆ្ងាយក្នុងថ្នាក់តែមួយ។",
        natural: "ចន្លោះធម្មជាតិ (k-means/Jenks)៖ ព្រំថ្នាក់ធ្លាក់ត្រង់កន្លែងដែលទិន្នន័យដាច់ពីគ្នា ដែលសមស្របបំផុតសម្រាប់ទិន្នន័យលម្អៀង។",
        std: "គម្លាតគំរូ៖ សន្មតថាទិន្នន័យចែកចាយធម្មតា។ ទិន្នន័យនេះលម្អៀងខ្លាំង (មធ្យម ១៩៩ · គម្លាតគំរូ ៣៩១) ដូច្នេះវិធីនេះមិនសមស្របទេ។" }[m];
      out.innerHTML = `ថ្នាក់ខ្ពស់បំផុតមាន <b>${kh(top)}</b> ខេត្ត · ${note}<br><span class="sim-hint">ទិន្នន័យ៖ ដង់ស៊ីតេប្រជាជន ២០១៧ ពី Kh_Province_Boundary (៦ ដល់ ២ ០៤៩ នាក់/គម²)</span>`;
    };
    el.querySelectorAll(".cls-m button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".cls-m button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    q(".cls-k").addEventListener("input", draw); draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ---------- L8 · Colour schemes and colour blindness ---------- */
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const cbSim = (rgb, type) => {
    if (type === "none") return rgb;
    const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    const M = { deut: [[0.625, 0.7, 0], [0.375, 0.3, 0.3], [0, 0, 0.7]], prot: [[0.567, 0.558, 0], [0.433, 0.442, 0.242], [0, 0, 0.758]], trit: [[0.95, 0, 0], [0.05, 0.433, 0], [0, 0.567, 1]] }[type];
    const o = [M[0][0] * r + M[0][1] * g + M[0][2] * b, M[1][0] * r + M[1][1] * g + M[1][2] * b, M[2][0] * r + M[2][1] * g + M[2][2] * b];
    return o.map((v) => { v = clamp(v, 0, 1); v = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055; return Math.round(v * 255); });
  };
  window.EXTRA_SIMS["colour"] = async (el) => {
    const D = await load();
    const { cv, ctx, out, q } = shellC(el, "ពណ៌ផែនទី និងភ្នែកខ្វះពណ៌",
      `<label>ឈុតពណ៌ <select class="co-p"><option value="seq">តគ្នា (Sequential)</option><option value="div">ពីរទិស (Diverging)</option><option value="qual">ប្រភេទ (Qualitative)</option><option value="rainbow">ឥន្ធនូ (Rainbow)</option></select></label>
       <label>ចំនួនថ្នាក់ <b class="co-kv"></b> <input type="range" class="co-k" min="3" max="7" value="5"></label>
       <label>ភ្នែក <select class="co-b"><option value="none">ធម្មតា</option><option value="deut">Deuteranopia (បៃតង)</option><option value="prot">Protanopia (ក្រហម)</option><option value="trit">Tritanopia (ខៀវ)</option></select></label>`);
    const vals = D.prov.map((p) => p.dens), W = 640, H = 320;
    const draw = () => {
      fitC(cv, ctx, W, H); const pal = q(".co-p").value, k = +q(".co-k").value, cb = q(".co-b").value;
      q(".co-kv").textContent = kh(k);
      const br = breaksOf(vals, k, "natural");
      const cls = (v) => { for (let i = k - 1; i >= 0; i--) if (v >= br[i]) return i; return 0; };
      const col = (i) => { const c = cbSim(hex2rgb(pick(pal, k, i)), cb); return `rgb(${c.join(",")})`; };
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      const sc = 1.0, ox = 10, oy = 20;
      D.prov.forEach((p) => { ctx.beginPath();
        p.r.forEach((ring) => ring.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * sc, oy + y * sc) : ctx.moveTo(ox + x * sc, oy + y * sc))));
        ctx.closePath(); ctx.fillStyle = col(cls(p.dens)); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.7; ctx.stroke(); });
      ctx.font = `12px ${font()}`; let ly = 50;
      ctx.fillStyle = "#333"; ctx.fillText("សញ្ញាសម្គាល់ផែនទី", 340, 34);
      for (let i = k - 1; i >= 0; i--) { ctx.fillStyle = col(i); ctx.fillRect(340, ly, 26, 16); ctx.strokeStyle = "#999"; ctx.strokeRect(340, ly, 26, 16);
        ctx.fillStyle = "#333"; ctx.fillText(`${fmtN(Math.round(br[i]))} – ${fmtN(Math.round(br[i + 1]))}`, 374, ly + 13); ly += 22; }
      const NOTE = { seq: "ឈុតតគ្នា៖ ពណ៌តែមួយ ស្រាល → ដិត។ សមស្របសម្រាប់បរិមាណដែលមានទិសតែមួយ (ដង់ស៊ីតេ ភាគរយ)។",
        div: "ឈុតពីរទិស៖ ពណ៌ពីរ ជួបគ្នានៅតម្លៃកណ្ដាលសំខាន់ (សូន្យ មធ្យម)។ មិនសមស្របសម្រាប់ដង់ស៊ីតេ ដែលគ្មានចំណុចកណ្ដាលធម្មជាតិ។",
        qual: "ឈុតប្រភេទ៖ ពណ៌ខុសគ្នាដោយគ្មានលំដាប់។ មិនត្រូវប្រើសម្រាប់បរិមាណ ព្រោះអ្នកអានមិនដឹងថាមួយណាច្រើនជាង។",
        rainbow: "ឈុតឥន្ធនូ៖ ពណ៌ភ្លឺ តែគ្មានលំដាប់ធម្មជាតិ បង្កើតព្រំក្លែងក្លាយ ហើយបាត់អត្ថន័យសម្រាប់អ្នកខ្វះពណ៌។ ជៀសវាងសម្រាប់ទិន្នន័យបរិមាណ។" }[pal];
      const CB = { none: "", deut: "ប្រហែល ៥% នៃបុរស មានភ្នែកខ្វះពណ៌បៃតង។ ", prot: "ភ្នែកខ្វះពណ៌ក្រហម។ ", trit: "ភ្នែកខ្វះពណ៌ខៀវ (កម្រ)។ " }[cb];
      out.innerHTML = `${NOTE}<br>${CB}${cb === "none" ? "ប្ដូរជម្រើស «ភ្នែក» ដើម្បីមើលផែនទីតាមភ្នែកអ្នកខ្វះពណ៌។" : "ពិនិត្យថាថ្នាក់នៅតែបែងចែកបានឬទេ។ បើមិនបាន ត្រូវប្ដូរឈុតពណ៌ ឬបន្ថែមភាពខុសគ្នានៃតម្លៃពន្លឺ។"}`;
    };
    el.querySelectorAll("select,input").forEach((x) => x.addEventListener("input", draw)); draw();
    window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ---------- L9 · Normalisation and unit size ---------- */
  let kcache = null;
  const loadKC = async () => kcache || (kcache = await (await fetch(new URL("../../assets/data/kc_communes_svg.json", location.href))).json());
  const drawShapes = (ctx, shapes, ox, oy, sc, colFn, stroke = "#fff", sw = 0.7) => {
    shapes.forEach((sh) => { ctx.beginPath();
      sh.r.forEach((ring) => ring.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * sc, oy + y * sc) : ctx.moveTo(ox + x * sc, oy + y * sc))));
      ctx.closePath(); ctx.fillStyle = colFn(sh); ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); });
  };
  window.EXTRA_SIMS["normalise"] = async (el) => {
    const D = await load();
    const { cv, ctx, out, q } = shellC(el, "ចំនួនដុល ឬអត្រា? ការធ្វើឲ្យស្តង់ដារ",
      `<span class="sim-seg nm-v"><button type="button" data-v="pop" class="on">ចំនួនប្រជាជន (ដុល)</button><button type="button" data-v="dens">ដង់ស៊ីតេ (នាក់/គម²)</button><button type="button" data-v="area">ផ្ទៃខេត្ត (គម²)</button></span>
       <span class="sim-hint">ទិន្នន័យដដែល ខេត្តដដែល ប៉ុន្តែសារខុសគ្នា</span>`);
    const W = 640, H = 330;
    const draw = () => {
      fitC(cv, ctx, W, H); const v = el.querySelector(".nm-v .on").dataset.v;
      const val = (p) => (v === "pop" ? p.pop : v === "dens" ? p.dens : p.pop / p.dens);
      const vals = D.prov.map(val), k = 5, br = breaksOf(vals, k, "natural");
      const cls = (x) => { for (let i = k - 1; i >= 0; i--) if (x >= br[i]) return i; return 0; };
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      drawShapes(ctx, D.prov, 10, 15, 1.05, (p) => pick("seq", k, cls(val(p))));
      ctx.font = `12px ${font()}`; let ly = 60;
      const unit = v === "pop" ? "នាក់" : v === "dens" ? "នាក់/គម²" : "គម²";
      ctx.fillStyle = "#333"; ctx.fillText("សញ្ញាសម្គាល់ផែនទី (" + unit + ")", 350, 40);
      for (let i = k - 1; i >= 0; i--) { ctx.fillStyle = pick("seq", k, i); ctx.fillRect(350, ly, 24, 15); ctx.strokeStyle = "#999"; ctx.strokeRect(350, ly, 24, 15);
        ctx.fillStyle = "#333"; ctx.fillText(`${fmtN(Math.round(br[i]))} – ${fmtN(Math.round(br[i + 1]))}`, 382, ly + 12); ly += 21; }
      const top = D.prov.map((p) => [val(p), p.name]).sort((a, b) => b[0] - a[0]).slice(0, 3);
      const NOTE = { pop: "ចំនួនដុល៖ ខេត្តធំមើលទៅ «ខ្ពស់» ដោយសារវាធំ។ ភ្នំពេញ (ផ្ទៃ ៦៨៥ គម²) និងបាត់ដំបង (១១ ៨៦៨ គម²) មានប្រជាជនប្រហែលគ្នា ប៉ុន្តែក្រាស់មិនដូចគ្នាទេ។",
        dens: "ដង់ស៊ីតេ៖ ចែកនឹងផ្ទៃ ដូច្នេះប្រៀបធៀបបាន។ ភ្នំពេញលេចធ្លោដោយសារមនុស្សក្រាស់ពិតប្រាកដ។",
        area: "ផ្ទៃខេត្ត៖ បង្ហាញថាខេត្តណាធំ ដែលជាហេតុផលដែលផែនទីចំនួនដុលបំភាន់។" }[v];
      out.innerHTML = `បីខេត្តខ្ពស់បំផុត៖ <b>${top.map(([x, n]) => `${n} (${fmtN(Math.round(x))})`).join(" · ")}</b><br>${NOTE}`;
    };
    el.querySelectorAll(".nm-v button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".nm-v button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  window.EXTRA_SIMS["unit-size"] = async (el) => {
    const K = await loadKC();
    const { cv, ctx, out, q } = shellC(el, "ទំហំឯកតា៖ ខេត្ត ឬឃុំ?",
      `<span class="sim-seg us-v"><button type="button" data-v="prov" class="on">កម្រិតខេត្ត</button><button type="button" data-v="comm">កម្រិតឃុំ</button></span>
       <span class="sim-hint">ខេត្តកំពង់ឆ្នាំង · ដង់ស៊ីតេប្រជាជន ២០០៨</span>`);
    const W = 640, H = 340;
    const draw = () => {
      fitC(cv, ctx, W, H); const v = el.querySelector(".us-v .on").dataset.v;
      const vals = K.comm.map((c) => c.dens), k = 5, br = breaksOf(vals, k, "natural");
      const cls = (x) => { for (let i = k - 1; i >= 0; i--) if (x >= br[i]) return i; return 0; };
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      const sc = Math.min(300 / K.W, 300 / K.H);
      if (v === "comm") drawShapes(ctx, K.comm, 20, 20, sc, (c) => pick("seq", k, cls(c.dens)));
      else { ctx.beginPath(); K.comm.forEach((c) => c.r.forEach((ring) => ring.forEach(([x, y], i) => (i ? ctx.lineTo(20 + x * sc, 20 + y * sc) : ctx.moveTo(20 + x * sc, 20 + y * sc)))));
        ctx.fillStyle = pick("seq", k, cls(K.prov_dens)); ctx.fill("evenodd"); ctx.strokeStyle = "#888"; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.font = `12px ${font()}`; let ly = 60; ctx.fillStyle = "#333"; ctx.fillText("នាក់/គម²", 350, 40);
      for (let i = k - 1; i >= 0; i--) { ctx.fillStyle = pick("seq", k, i); ctx.fillRect(350, ly, 24, 15); ctx.strokeStyle = "#999"; ctx.strokeRect(350, ly, 24, 15);
        ctx.fillStyle = "#333"; ctx.fillText(`${fmtN(Math.round(br[i]))} – ${fmtN(Math.round(br[i + 1]))}`, 382, ly + 12); ly += 21; }
      const mx = Math.max(...vals), mn = Math.min(...vals);
      out.innerHTML = v === "prov"
        ? `កម្រិតខេត្ត៖ តម្លៃតែមួយ <b>${fmtN(K.prov_dens, 1)} នាក់/គម²</b> សម្រាប់ខេត្តទាំងមូល។ ភាពខុសគ្នាខាងក្នុងបាត់ទាំងស្រុង។`
        : `កម្រិតឃុំ៖ តម្លៃពី <b>${fmtN(mn, 1)}</b> ដល់ <b>${fmtN(mx)}</b> នាក់/គម² ក្នុងខេត្តតែមួយ។ មធ្យមខេត្ត ${fmtN(K.prov_dens, 1)} លាក់ភាពខុសគ្នានេះ (បញ្ហាឯកតាផ្ទៃ · MAUP)។`;
    };
    el.querySelectorAll(".us-v button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".us-v button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };

  /* ---------- L10 · Proportional symbols and dot density ---------- */
  window.EXTRA_SIMS["symbols"] = async (el) => {
    const D = await load();
    const { cv, ctx, out, q } = shellC(el, "សញ្ញាសមាមាត្រ សញ្ញាចាត់ថ្នាក់ និងផែនទីចំណុចដង់ស៊ីតេ",
      `<span class="sim-seg sy-t"><button type="button" data-t="prop" class="on">សញ្ញាសមាមាត្រ (√)</button><button type="button" data-t="lin">មាត្រដ្ឋានកាំ (ខុស)</button><button type="button" data-t="grad">សញ្ញាចាត់ថ្នាក់</button><button type="button" data-t="dot">ចំណុចដង់ស៊ីតេ</button></span>
       <label class="sy-dl">១ ចំណុច = <select class="sy-d"><option>5000</option><option selected>10000</option><option>25000</option></select> នាក់</label>`);
    const W = 640, H = 340;
    let dots = null;
    const makeDots = (per) => D.prov.map((p) => { const n = Math.round(p.pop / per), pts = [];
      // rejection sampling inside the province rings
      const all = p.r[0] || []; let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      p.r.forEach((ring) => ring.forEach(([x, y]) => { minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y); }));
      const inside = (x, y) => { let c = false; p.r.forEach((ring) => { for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, yi] = ring[i], [xj, yj] = ring[j];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } }); return c; };
      let guard = 0;
      while (pts.length < n && guard < n * 60 + 400) { guard++;
        const x = minx + Math.random() * (maxx - minx), y = miny + Math.random() * (maxy - miny);
        if (inside(x, y)) pts.push([x, y]); }
      return pts; });
    const draw = () => {
      fitC(cv, ctx, W, H); const t = el.querySelector(".sy-t .on").dataset.t, per = +q(".sy-d").value;
      el.querySelector(".sy-dl").style.display = t === "dot" ? "" : "none";
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      const sc = 1.05, ox = 10, oy = 15;
      drawShapes(ctx, D.prov, ox, oy, sc, () => "#f5f5f0", "#cfcfcf", 0.8);
      const pops = D.prov.map((p) => p.pop), mx = Math.max(...pops);
      const centre = (p) => { let sx = 0, sy = 0, n = 0; p.r.forEach((ring) => ring.forEach(([x, y]) => { sx += x; sy += y; n++; })); return [ox + (sx / n) * sc, oy + (sy / n) * sc]; };
      if (t === "dot") {
        if (!dots || dots.per !== per) { dots = { per, d: makeDots(per) }; }
        ctx.fillStyle = "rgba(198,40,40,.75)";
        dots.d.forEach((pts) => pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(ox + x * sc, oy + y * sc, 1.5, 0, 7); ctx.fill(); }));
      } else {
        D.prov.forEach((p) => { const [cx, cy] = centre(p);
          let r;
          if (t === "prop") r = 26 * Math.sqrt(p.pop / mx);
          else if (t === "lin") r = 26 * (p.pop / mx);
          else { const br = breaksOf(pops, 5, "natural"); let i = 0; for (let j = 4; j >= 0; j--) if (p.pop >= br[j]) { i = j; break; } r = 6 + i * 5; }
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, r), 0, 7); ctx.fillStyle = "rgba(25,118,210,.55)"; ctx.fill(); ctx.strokeStyle = "#0d47a1"; ctx.lineWidth = 1; ctx.stroke(); });
      }
      ctx.font = `12px ${font()}`; ctx.fillStyle = "#333";
      if (t === "dot") { ctx.fillText(`១ ចំណុច = ${fmtN(per)} នាក់`, 350, 40); ctx.beginPath(); ctx.arc(356, 56, 1.5, 0, 7); ctx.fillStyle = "rgba(198,40,40,.75)"; ctx.fill(); }
      else { ctx.fillText("សញ្ញាសម្គាល់ផែនទី", 350, 40);
        [1400000, 700000, 200000].forEach((v, i) => { const r = t === "lin" ? 26 * (v / mx) : t === "grad" ? 6 + (2 - i) * 5 : 26 * Math.sqrt(v / mx);
          ctx.beginPath(); ctx.arc(390, 120 - i * 0, 0, 0, 0); ctx.beginPath(); ctx.arc(390, 130 - r + i * 0 + i * 60, Math.max(2, r), 0, 7);
          ctx.fillStyle = "rgba(25,118,210,.35)"; ctx.fill(); ctx.strokeStyle = "#0d47a1"; ctx.stroke();
          ctx.fillStyle = "#333"; ctx.fillText(fmtN(v) + " នាក់", 430, 132 - r + i * 60); }); }
      const NOTE = { prop: "កាំ = k × √(តម្លៃ)៖ ផ្ទៃរង្វង់សមាមាត្រនឹងតម្លៃ ដែលភ្នែកអានបានត្រឹមត្រូវ។",
        lin: "កាំគុណដោយផ្ទាល់នឹងតម្លៃ៖ ខេត្តធំមើលទៅធំហួសហេតុ (ផ្ទៃកើនតាមការ៉េ)។ ជៀសវាង។",
        grad: "សញ្ញាចាត់ថ្នាក់៖ ទំហំតែប៉ុន្មានថ្នាក់ ដែលងាយអានពីសញ្ញាសម្គាល់ផែនទី ប៉ុន្តែបាត់លម្អិត។",
        dot: "ផែនទីចំណុចដង់ស៊ីតេ៖ ចំណុចនីមួយៗតំណាងចំនួនថេរ។ វាបង្ហាញលំនាំបានល្អ ប៉ុន្តែទីតាំងចំណុចមិនមែនជាទីតាំងពិតទេ។" }[t];
      out.innerHTML = NOTE + (t === "dot" ? `<br><span class="sim-hint">ចំណុចដាក់ចៃដន្យក្នុងខេត្ត ដូច្នេះមិនត្រូវអានវាជាទីតាំងផ្ទះពិត។</span>` : "");
    };
    el.querySelectorAll(".sy-t button").forEach((b) => (b.onclick = () => { el.querySelectorAll(".sy-t button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draw(); }));
    q(".sy-d").onchange = draw; draw(); window.addEventListener("resize", () => el.isConnected && draw());
  };
})();
