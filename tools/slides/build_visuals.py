"""Generate every slide visual (SVG/PNG in docs/assets/{svg,img}/slides) and tools/slides/visuals.json.

    python tools/slides/build_visuals.py

Data: the book's own Cambodia datasets (docs/assets/data), Natural Earth (public domain,
tools/slides/data) and Landsat 8 / Sentinel-2 imagery from Book 3 (optional, skipped if absent).
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis_core, vis_l01_05, vis_l06_10, vis_l11_15, vis_extra
for mod, fns in ((vis_l01_05, ("L01", "L02", "L03", "L04", "L05")), (vis_l06_10, ("L06", "L07", "L08", "L09", "L10")),
                 (vis_l11_15, ("L11", "L12", "L13", "L14", "L15")), (vis_extra, ("extra",))):
    for fn in fns: getattr(mod, fn)()
W = [(3, "proj-explorer", "ឧបករណ៍៖ ប្ដូរចំណោលដោយខ្លួនឯង", "ចុចប៊ូតុងចំណោលនីមួយៗ ហើយសង្កេតរង្វង់ Tissot៖ តើចំណោលណារក្សារាង? ណារក្សាផ្ទៃ?", .3),
     (7, "classify-explorer", "ឧបករណ៍៖ សាកល្បងវិធីចាត់ថ្នាក់", "ប្ដូរវិធី និងចំនួនថ្នាក់ ហើយមើលថាខេត្តប៉ុន្មានធ្លាក់ក្នុងថ្នាក់នីមួយៗ។", .5),
     (8, "colour-explorer", "ឧបករណ៍៖ ពណ៌ និងភ្នែកខ្វះពណ៌", "ជ្រើសឈុតពណ៌ រួចក្លែងធ្វើភ្នែកខ្វះពណ៌ ឬការបោះពុម្ពស ខ្មៅ។", .6),
     (9, "classify-explorer", "ឧបករណ៍៖ ព្រំថ្នាក់ និងសារនៃផែនទី", "ផែនទី choropleth ដូចគ្នា៖ ប្ដូរព្រំថ្នាក់ ហើយពិភាក្សាថាសារប្ដូរយ៉ាងណា។", .7),
     (10, "propsym-explorer", "ឧបករណ៍៖ ធ្វើមាត្រដ្ឋានសញ្ញា", "ប្រៀបធៀបផ្ទៃ Flannery កាំ និងចំណុចដង់ស៊ីតេ លើប្រជាជនខេត្ត។", .5)]
for lesson, sim, title, instr, where in W:
    vis_core.MANIFEST.append(dict(lesson=lesson, sim=sim, title=title, bullets=[instr], where=where))
json.dump(vis_core.MANIFEST, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "visuals.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
n_svg = sum(1 for m in vis_core.MANIFEST if "file" in m); n_w = len(vis_core.MANIFEST) - n_svg
print(f"{n_svg} figures + {n_w} interactive widgets = {len(vis_core.MANIFEST)} visual slides")
