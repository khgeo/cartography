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
})();
