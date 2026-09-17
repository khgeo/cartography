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
})();
