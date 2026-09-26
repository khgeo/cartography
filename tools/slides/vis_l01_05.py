from vis_core import *
import numpy as np
from PIL import Image

def L01():
    # 1 location map: Cambodia in the world
    f = Fig(1000, 540).title("កម្ពុជាលើផែនទីពិភពលោក", "ផែនទីទីតាំង (Locator map) · ចំណោល Robinson")
    p, to = world_paths("robin", (20, 80, 960, 440), fill=lambda g: "#e53935" if KHM(g) else "#dfe4e8")
    f.add(graticule(to, 30)); f.add(p)
    x, y = to(*PPH); f.circle(x, y, 14, "none", "#e53935", 2.5); f.text(x + 18, y + 5, "កម្ពុជា", 16, "#c62828", weight="bold")
    f.source("ទិន្នន័យ៖ Natural Earth (public domain)")
    entry(1, f.save("l01-world-locator"), "ផែនទីទីតាំង៖ កម្ពុជាក្នុងពិភពលោក",
          ["ផែនទីទីតាំងឆ្លើយសំណួរ «នៅឯណា?» មុនសំណួរដទៃទៀត។", "ពណ៌មួយខុសគេ (ក្រហម) ទាញភ្នែកទៅប្រធានបទតែមួយ។", "ផែនទីពិភពលោកតែងមានការខូចទ្រង់ទ្រាយ (មេរៀនទី៣)។"], .05)
    # 2 regional reference map
    f = Fig(1000, 560).title("កម្ពុជា និងប្រទេសជិតខាង", "ផែនទីយោងទូទៅតំបន់ · ទន្លេមេគង្គ និងទន្លេសាប")
    p, to = world_paths("merc", (20, 80, 960, 460), feats=ASIA["features"], extent=(97, 5, 112, 21),
                        fill=lambda g: "#ffe0b2" if KHM(g) else "#eceff1", stroke="#90a4ae", sw=.8)
    f.add(p)
    rp, _ = world_paths("merc", (20, 80, 960, 460), feats=RIVERS["features"], extent=(97, 5, 112, 21), fill=lambda g: "none", stroke="#1e88e5", sw=2)
    f.add(rp)
    for nm, lon, lat in [("ថៃ", 101, 15.5), ("ឡាវ", 103.5, 19.2), ("វៀតណាម", 107.8, 15), ("កម្ពុជា", 104.6, 12.6), ("ឈូងសមុទ្រថៃ", 101.6, 10), ("សមុទ្រចិនខាងត្បូង", 109.5, 9)]:
        q = to(lon, lat); f.text(q[0], q[1], nm, 20 if nm == "កម្ពុជា" else 16, "#bf360c" if nm == "កម្ពុជា" else ("#0277bd" if "សមុទ្រ" in nm else "#455a64"), "middle", "bold" if nm == "កម្ពុជា" else "normal")
    x, y = to(*PPH); f.rect(x - 5, y - 5, 10, 10, "#212121"); f.text(x + 10, y + 16, "ភ្នំពេញ", 14, INK, weight="bold")
    f.source("ទិន្នន័យ៖ Natural Earth · ទន្លេ និងព្រំដែនជាតំណាងទូទៅ")
    entry(1, f.save("l01-region-reference"), "ផែនទីយោងទូទៅ៖ កម្ពុជា និងតំបន់",
          ["ផែនទីយោងទូទៅបង្ហាញវត្ថុច្រើនប្រភេទ៖ ព្រំដែន ទន្លេ ទីក្រុង និងសមុទ្រ។", "ពណ៌ខៀវសម្រាប់ទឹក ពណ៌ភ្លឺស្រាលសម្រាប់ដី គឺជាទម្លាប់ដែលអ្នកអានរំពឹងទុក។", "ឈ្មោះសមុទ្រសរសេរទ្រេត/ពណ៌ខៀវ ដើម្បីបែងចែកពីឈ្មោះប្រទេស។"], .12)
    # 3 reference vs thematic (full Cambodia)
    f = Fig(1000, 540).title("ផែនទីយោងទូទៅ ធៀបនឹងផែនទីប្រធានបទ", "ទិន្នន័យដូចគ្នា (ព្រំខេត្ត) · គោលបំណងខុសគ្នា")
    prov_map(f, 30, 90, 1.55, roads=True, labels=True, lsize=9); f.text(260, 520, "ផែនទីយោងទូទៅ៖ ខេត្ត ផ្លូវ ទឹក", 16, INK, "middle", "bold")
    col = classify([0, 50, 100, 200, 400], [0, 50, 100, 200, 400], SEQ)
    prov_map(f, 520, 90, 1.55, fill=lambda p: col(p["dens"]))
    f.legend_boxes(870, 330, SEQ, ["< ៥០", "៥០–១០០", "១០០–២០០", "២០០–៤០០", "> ៤០០"], "ដង់ស៊ីតេ (នាក់/គម²)")
    f.text(760, 520, "ផែនទីប្រធានបទ៖ ដង់ស៊ីតេប្រជាជន", 16, INK, "middle", "bold"); f.source("ជំរឿន ២០១៩ · ព្រំខេត្ត")
    entry(1, f.save("l01-reference-vs-thematic"), "ផែនទីយោងទូទៅ ធៀបនឹងផែនទីប្រធានបទ",
          ["ផែនទីឆ្វេងជួយរកទីតាំង៖ តើផ្លូវជាតិឆ្លងកាត់ខេត្តណា?", "ផែនទីស្ដាំបង្ហាញលំនាំនៃប្រធានបទតែមួយ៖ ដង់ស៊ីតេខ្ពស់នៅជុំវិញភ្នំពេញ និងតាមដងទន្លេ។", "ជ្រើសប្រភេទផែនទីតាមសំណួររបស់អ្នកអាន មិនមែនតាមទិន្នន័យដែលមាន។"], .2)
    # 4 map types gallery
    f = Fig(1000, 560).title("ប្រភេទផែនទីប្រធានបទបួន", "ទិន្នន័យប្រជាជនខេត្តដូចគ្នា · បង្ហាញបួនរបៀប")
    k = 1.05; boxes = [(40, 80), (530, 80), (40, 320), (530, 320)]
    colz = classify(0, [0, 50, 100, 200, 400], SEQ)
    prov_map(f, boxes[0][0], boxes[0][1], .85, fill=lambda p: colz(p["dens"])); f.text(boxes[0][0] + 300, boxes[0][1] + 110, "Choropleth", 18, IND, weight="bold"); f.text(boxes[0][0] + 300, boxes[0][1] + 134, "អត្រា/ដង់ស៊ីតេ", 14)
    prov_map(f, boxes[1][0], boxes[1][1], .85)
    for p in PROV["prov"]:
        cx, cy = pcentre(p["en"]); f.circle(boxes[1][0] + cx * .85, boxes[1][1] + cy * .85, math.sqrt(p["pop"]) / 90, "#fb8c00", "#fff", .6, .85)
    f.text(boxes[1][0] + 300, boxes[1][1] + 110, "សញ្ញាសមាមាត្រ", 18, IND, weight="bold"); f.text(boxes[1][0] + 300, boxes[1][1] + 134, "ចំនួនសរុប", 14)
    prov_map(f, boxes[2][0], boxes[2][1], .85)
    rng = np.random.default_rng(3)
    for p in PROV["prov"]:
        from shapely.geometry import Polygon
        polys = [Polygon(r) for r in p["r"] if len(r) > 3]
        big = max(polys, key=lambda g: g.area); minx, miny, maxx, maxy = big.bounds; nd = int(p["pop"] / 60000); c = 0; tries = 0
        from shapely.geometry import Point
        while c < nd and tries < nd * 40:
            tries += 1; x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
            if big.contains(Point(x, y)): f.circle(boxes[2][0] + x * .85, boxes[2][1] + y * .85, 1.3, "#37474f"); c += 1
    f.text(boxes[2][0] + 300, boxes[2][1] + 110, "ចំណុចដង់ស៊ីតេ", 18, IND, weight="bold"); f.text(boxes[2][0] + 300, boxes[2][1] + 134, "១ ចំណុច = ៦០ ០០០ នាក់", 14)
    prov_map(f, boxes[3][0], boxes[3][1], .85)
    pp = pcentre("Phnom Penh")
    for p in PROV["prov"]:
        if p["en"] == "Phnom Penh": continue
        cx, cy = pcentre(p["en"]); w = p["pop"] / 250000
        f.path(f'M{boxes[3][0]+cx*.85:.1f} {boxes[3][1]+cy*.85:.1f} Q{boxes[3][0]+(cx+pp[0])/2*.85+10:.1f} {boxes[3][1]+(cy+pp[1])/2*.85-15:.1f} {boxes[3][0]+pp[0]*.85:.1f} {boxes[3][1]+pp[1]*.85:.1f}', "none", "#6a1b9a", w, .55)
    f.text(boxes[3][0] + 300, boxes[3][1] + 110, "ផែនទីលំហូរ", 18, IND, weight="bold"); f.text(boxes[3][0] + 300, boxes[3][1] + 134, "ឧទាហរណ៍បង្រៀន", 14)
    f.source("ទិន្នន័យជំរឿន ២០១៩ · លំហូរជាគំរូបង្រៀន")
    entry(1, f.save("l01-thematic-types"), "ទិន្នន័យដូចគ្នា ផែនទីបួនប្រភេទ",
          ["Choropleth សម្រាប់អត្រា ឬដង់ស៊ីតេ មិនមែនចំនួនសរុប (មេរៀនទី៩)។", "សញ្ញាសមាមាត្រ និងចំណុចដង់ស៊ីតេ សម្រាប់ចំនួនសរុប (មេរៀនទី១០)។", "ផែនទីលំហូរ សម្រាប់ចលនារវាងទីកន្លែង (មេរៀនទី១២)។"], .28)
    # 5 image vs map (real Landsat)
    src = "/home/claude/realdata/crop_true.png"
    if os.path.exists(src):
        im = Image.open(src).convert("RGB").resize((420, 420)); im.save(os.path.join(IMGDIR, "l01-landsat-pp.jpg"), quality=88)
        cls = np.load("/home/claude/realdata/l8cls.npy"); pal = np.array([[33, 102, 172], [27, 94, 32], [166, 206, 99], [198, 40, 40], [214, 190, 150]], np.uint8)
        Image.fromarray(pal[cls]).resize((420, 420), Image.NEAREST).save(os.path.join(IMGDIR, "l01-landcover-pp.png"))
        f = Fig(1000, 540).title("រូបភាពផ្កាយរណប ធៀបនឹងផែនទី", "ចំណុចប្រសព្វទន្លេចតុមុខ ភ្នំពេញ · Landsat 8 · ២០១៩")
        f.add('<image href="../assets/img/slides/l01-landsat-pp.jpg" x="40" y="80" width="420" height="420"/>')
        f.add('<image href="../assets/img/slides/l01-landcover-pp.png" x="540" y="80" width="420" height="420"/>')
        f.text(250, 525, "រូបភាព៖ អ្វីៗទាំងអស់ដែលឧបករណ៍ឃើញ", 15, INK, "middle"); f.text(750, 525, "ផែនទី៖ ជ្រើសរើស ចាត់ថ្នាក់ និងធ្វើនិមិត្តសញ្ញា", 15, INK, "middle")
        f.source("Landsat 8 OLI ពី USGS · ផែនទីគម្របដីជាគំរូបង្រៀន")
        entry(1, f.save("l01-image-vs-map"), "រូបភាព ធៀបនឹងផែនទី",
              ["រូបភាពមិនជ្រើសរើស៖ ដំបូល ផ្លូវ ទឹក ស្រមោល លាយគ្នា។", "ផែនទីធ្វើឲ្យអរូបី៖ ចាត់ថ្នាក់ទៅជា ទឹក ដើមឈើ ដំណាំ សំណង់ ដីទទេ។", "អរូបីបាត់ព័ត៌មានខ្លះ ប៉ុន្តែធ្វើឲ្យលំនាំច្បាស់ និងអានលឿន។"], .4)
    # 6 abstraction (generalise levels)
    f = Fig(1000, 520).title("ភាពអរូបីតាមមាត្រដ្ឋាន", "ព្រំប្រទេសដូចគ្នា នៅកម្រិតលម្អិតបួន")
    xs = [20, 265, 510, 755]; labs = [("50000", "១ : ៥០ ០០០"), ("250000", "១ : ២៥០ ០០០"), ("1000000", "១ : ១ ០០០ ០០០"), ("5000000", "១ : ៥ ០០០ ០០០")]
    for x, (key, lab) in zip(xs, labs):
        L = GEN["levels"][key]; k = 225 / GEN["W"]
        f.path(pd(L["rings"], x, 110, k), "#c5cae9", IND, .8); f.text(x + 112, 440, lab, 16, IND, "middle", "bold"); f.text(x + 112, 464, f"{khn(L['n'])} ចំណុច", 14, "#607d8b", "middle")
    f.source("ការធ្វើឲ្យសាមញ្ញ Douglas–Peucker")
    entry(1, f.save("l01-abstraction-levels"), "ភាពអរូបីកើនឡើង នៅពេលមាត្រដ្ឋានតូច",
          ["ព្រំដែនដូចគ្នា ប៉ុន្តែចំនួនចំណុចថយពីរាប់ម៉ឺនមកត្រឹមរាប់រយ។", "នៅមាត្រដ្ឋានតូច លម្អិតដែលមើលមិនឃើញ ត្រូវបានលុបចោល។", "ការធ្វើឲ្យទូទៅ ជាការសម្រេចចិត្តរបស់អ្នកធ្វើផែនទី (មេរៀនទី១៥)។"], .5)
    # 7 communication chain with icons
    f = Fig(1000, 380).title("គំរូទំនាក់ទំនងផែនទី")
    steps = [("ពិភពពិត", "#43a047"), ("អ្នកធ្វើផែនទី", "#1e88e5"), ("ផែនទី", IND), ("អ្នកអាន", "#fb8c00"), ("ការយល់ដឹង", "#8e24aa")]
    for i, (t, c) in enumerate(steps):
        x = 40 + i * 190; f.rect(x, 140, 150, 90, c, rx=14); f.text(x + 75, 193, t, 20, "#fff", "middle", "bold")
        if i < 4: f.line(x + 152, 185, x + 188, 185, "#607d8b", 3, arrow=True)
    f.text(210, 280, "ជ្រើសរើស ធ្វើឲ្យសាមញ្ញ ធ្វើនិមិត្តសញ្ញា", 15, "#1565c0", "middle")
    f.text(690, 280, "អាន ប្រៀបធៀប បកស្រាយ", 15, "#e65100", "middle")
    f.path("M 690 305 Q 500 370 210 305", "none", "#b0bec5", 2, extra='stroke-dasharray="6 5" marker-end="url(#arrow)"'); f.defs.add("arrow")
    f.text(450, 360, "មតិត្រឡប់៖ សួរអ្នកអាន រួចកែផែនទី", 14, "#78909c", "middle")
    entry(1, f.save("l01-communication"), "ផែនទីជាការទំនាក់ទំនង",
          ["កំហុសអាចកើតនៅជំហានណាមួយ៖ ទិន្នន័យខុស ការជ្រើសខុស ឬអ្នកអានយល់ខុស។", "ផែនទីល្អ ត្រូវតែសាកល្បងជាមួយអ្នកអានពិត។", "ព្រួញត្រឡប់ចង្អុលថា ការធ្វើផែនទីជាវដ្ដ មិនមែនខ្សែត្រង់ទេ។"], .62)
    # 8 map elements anatomy (real map)
    f = Fig(1000, 560).title("កាយវិភាគនៃផែនទីបោះពុម្ព")
    f.rect(170, 70, 660, 470, "#fff", "#90a4ae", 1.2)
    f.text(500, 106, "ដង់ស៊ីតេប្រជាជនតាមខេត្ត ២០១៩", 20, INK, "middle", "bold")
    col = classify(0, [0, 50, 100, 200, 400], SEQ); prov_map(f, 190, 130, 1.35, fill=lambda p: col(p["dens"]))
    f.legend_boxes(620, 170, SEQ, ["< ៥០", "៥០–១០០", "១០០–២០០", "២០០–៤០០", "> ៤០០"], "នាក់/គម²", size=16)
    f.rect(200, 480, 60, 6, "#212121"); f.rect(260, 480, 60, 6, "#fff", "#212121"); f.text(200, 502, "០", 11); f.text(320, 502, "១០០ គម", 11, anchor="middle")
    f.path("M 760 200 l 12 34 l -12 -9 l -12 9 z", "#212121"); f.text(760, 196, "ជ", 14, INK, "middle", "bold")
    f.text(820, 528, "ប្រភព៖ ជំរឿន ២០១៩ · UTM 48N", 11, "#607d8b", "end")
    f.rect(660, 390, 150, 90, "#eceff1", "#90a4ae"); f.text(735, 440, "ផែនទីទីតាំង", 12, "#607d8b", "middle")
    for (tx, ty, lx, ly, t) in [(60, 106, 330, 100, "ចំណងជើង"), (60, 250, 250, 250, "តំបន់ផែនទី"), (900, 190, 700, 190, "សញ្ញាសម្គាល់"), (900, 220, 775, 220, "ព្រួញទិស"),
                                (60, 490, 200, 486, "របារមាត្រដ្ឋាន"), (900, 520, 815, 522, "ប្រភព"), (900, 430, 810, 430, "ផែនទីទីតាំង")]:
        f.line(tx + (40 if tx < 500 else -40), ty - 5, lx, ly, "#e65100", 1.3, arrow=True); f.text(tx if tx < 500 else tx + 40, ty, t, 15, "#e65100", "start" if tx < 500 else "end", "bold")
    entry(1, f.save("l01-map-anatomy"), "កាយវិភាគនៃផែនទីបោះពុម្ព",
          ["ធាតុនីមួយៗឆ្លើយសំណួរមួយ៖ អ្វី? ពណ៌មានន័យអ្វី? ឆ្ងាយប៉ុណ្ណា? នៅទិសណា? ទុកចិត្តបានទេ?", "ប្រធានបទ (តំបន់ផែនទី) ត្រូវធំ និងលេចធ្លោជាងគេ។", "ធាតុមិនចាំបាច់ត្រូវលុប៖ ផែនទីល្អមិនមែនផែនទីដែលមានធាតុច្រើនបំផុតទេ។"], .8)

def L02():
    # 1 orthographic globe with graticule
    f = Fig(1000, 560).title("ក្រឡាភូមិសាស្ត្រលើផែនដី", "ខ្សែស្របទទឹង និងខ្សែបណ្ដោយ · ផ្ដោតលើកម្ពុជា")
    f.circle(500, 310, 235, "#e3f2fd", "#90caf9", 1.5)
    p, to = world_paths("ortho", (265, 75, 470, 470), lon0=105, lat0=12, fill=lambda g: "#ef5350" if KHM(g) else "#c8e6c9", stroke="#fff", sw=.4)
    f.add(graticule(to, 15, color="#90a4ae", sw=.7)); f.add(p)
    eq = [to(l, 0) for l in range(15, 196, 2)]; f.add(_pl(eq, "#e65100", 2)) if False else None
    from vis_core import _pl as PL
    f.add(PL([to(l, 0) for l in range(15, 196, 2)], "#e65100", 2)); f.add(PL([to(105, a) for a in range(-89, 90, 2)], "#1565c0", 2))
    q = to(0 + 170, 0); f.text(760, 330, "អេក្វាទ័រ (០°)", 16, "#e65100", weight="bold"); f.text(520, 90, "ខ្សែបណ្ដោយ ១០៥°E", 16, "#1565c0", weight="bold")
    entry(2, f.save("l02-globe-graticule"), "ខ្សែស្របទទឹង និងខ្សែបណ្ដោយ",
          ["រយៈទទឹង (latitude) វាស់ពីអេក្វាទ័រ ០° ដល់ ៩០° ជើង ឬត្បូង។", "រយៈបណ្ដោយ (longitude) វាស់ពី Greenwich ០° ដល់ ១៨០° កើត ឬលិច។", "កម្ពុជានៅប្រហែល ១០°–១៥° ជើង និង ១០២°–១០៨° កើត។"], .05)
    # 2 angles diagram
    f = Fig(1000, 520).title("រយៈទទឹង និងរយៈបណ្ដោយ ជាមុំ", "វាស់ពីចំណុចកណ្ដាលផែនដី")
    cx, cy, R = 330, 290, 190; f.circle(cx, cy, R, "#e8f5e9", "#66bb6a", 2); f.line(cx - R, cy, cx + R, cy, "#e65100", 2)
    import math as m
    a = m.radians(35); px, py = cx + R * m.cos(a), cy - R * m.sin(a)
    f.line(cx, cy, px, py, IND, 2.5); f.circle(px, py, 7, "#c62828"); f.text(px + 10, py - 8, "ចំណុច P", 16, "#c62828", weight="bold")
    f.path(f"M {cx+70} {cy} A 70 70 0 0 0 {cx+70*m.cos(a):.1f} {cy-70*m.sin(a):.1f}", "none", "#1565c0", 2); f.text(cx + 80, cy - 20, "φ = រយៈទទឹង", 16, "#1565c0", weight="bold")
    f.text(cx - R, cy + 30, "អេក្វាទ័រ", 14, "#e65100")
    ex, ey = 760, 290; f.circle(ex, ey, 150, "#fff8e1", "#ffb300", 2); f.line(ex, ey, ex, ey - 150, "#607d8b", 1.5, "5 4"); f.text(ex + 6, ey - 155, "Greenwich ០°", 13, "#607d8b")
    b = m.radians(105 - 90); qx, qy = ex + 150 * m.sin(m.radians(105)), ey - 150 * m.cos(m.radians(105))
    f.line(ex, ey, qx, qy, IND, 2.5); f.path(f"M {ex} {ey-60} A 60 60 0 0 1 {ex+60*m.sin(m.radians(105)):.1f} {ey-60*m.cos(m.radians(105)):.1f}", "none", "#1565c0", 2)
    f.text(ex + 70, ey - 40, "λ = ១០៥°E", 16, "#1565c0", weight="bold"); f.text(ex, ey + 180, "មើលពីប៉ូលខាងជើង", 14, "#607d8b", "middle")
    entry(2, f.save("l02-angles"), "មុំដែលកំណត់ទីតាំង",
          ["φ (រយៈទទឹង) ជាមុំពីប្លង់អេក្វាទ័រទៅចំណុច។", "λ (រយៈបណ្ដោយ) ជាមុំពីខ្សែ Greenwich ទៅខ្សែបណ្ដោយរបស់ចំណុច។", "ដោយសារជាមុំ ១° រយៈបណ្ដោយខ្លីជាងនៅជិតប៉ូល (cos φ)។"], .12)
    # 3 Cambodia with lat-long grid
    f = Fig(1000, 560).title("ក្រឡារយៈទទឹង–រយៈបណ្ដោយលើកម្ពុជា")
    p, to = world_paths("plate", (80, 80, 840, 440), feats=ASIA["features"], extent=(101.5, 9.5, 108.5, 15.5), fill=lambda g: "#ffe0b2" if KHM(g) else "#f5f5f5", stroke="#90a4ae", sw=.8)
    f.add(p)
    for lon in range(102, 109):
        a, b = to(lon, 9.5), to(lon, 15.5); f.line(a[0], a[1], b[0], b[1], "#90a4ae", .8, "4 4"); f.text(a[0], a[1] + 18, f"{kh(lon)}°E", 13, "#546e7a", "middle")
    for lat in range(10, 16):
        a, b = to(101.5, lat), to(108.5, lat); f.line(a[0], a[1], b[0], b[1], "#90a4ae", .8, "4 4"); f.text(a[0] - 6, a[1] + 4, f"{kh(lat)}°N", 13, "#546e7a", "end")
    for nm, lon, lat in [("ភ្នំពេញ", 104.92, 11.55), ("សៀមរាប", 103.86, 13.36), ("បាត់ដំបង", 103.2, 13.1), ("ក្រចេះ", 106.02, 12.49), ("សីហនុ", 103.52, 10.63)]:
        q = to(lon, lat); f.circle(q[0], q[1], 5, "#c62828"); f.text(q[0] + 8, q[1] - 6, f"{nm} ({kh(lat)}°N, {kh(lon)}°E)", 13, INK)
    f.source("Natural Earth · កូអរដោនេប្រហាក់ប្រហែល")
    entry(2, f.save("l02-cambodia-latlong"), "កូអរដោនេទីក្រុងសំខាន់ៗ",
          ["ភ្នំពេញ ≈ ១១,៥៥°N ១០៤,៩២°E · សៀមរាប ≈ ១៣,៣៦°N ១០៣,៨៦°E។", "១° រយៈទទឹង ≈ ១១១ គម គ្រប់ទីកន្លែង។", "១° រយៈបណ្ដោយនៅកម្ពុជា ≈ ១០៩ គម (111 × cos 12°)។"], .2)
    # 4 DMS vs DD card
    f = Fig(1000, 420).title("DMS និង Decimal Degrees", "កូអរដោនេភ្នំពេញ សរសេរពីររបៀប")
    f.rect(60, 100, 380, 250, "#e8eaf6", rx=16); f.text(250, 150, "DMS", 26, IND, "middle", "bold"); f.text(250, 210, "11° 33′ 00″ N", 28, INK, "middle"); f.text(250, 260, "104° 55′ 12″ E", 28, INK, "middle"); f.text(250, 320, "ដឺក្រេ · នាទី · វិនាទី", 15, "#607d8b", "middle")
    f.line(460, 225, 540, 225, AMB, 4, arrow=True)
    f.rect(560, 100, 380, 250, "#fff8e1", rx=16); f.text(750, 150, "DD", 26, "#e65100", "middle", "bold"); f.text(750, 210, "11.5500", 28, INK, "middle"); f.text(750, 260, "104.9200", 28, INK, "middle"); f.text(750, 320, "33/60 = 0.55 · 55/60 + 12/3600 = 0.92", 14, "#607d8b", "middle")
    entry(2, f.save("l02-dms-dd"), "ការបម្លែង DMS ទៅ DD",
          ["DD = ដឺក្រេ + នាទី/៦០ + វិនាទី/៣៦០០។", "GIS ប្រើ DD ជាចម្បង ព្រោះងាយគណនា។", "ត្រូវប្រុងប្រយ័ត្នលំដាប់ (lat, lon) ឬ (lon, lat) ពេលនាំចូល CSV។"], .3)
    # 5 sphere/ellipsoid/geoid
    f = Fig(1000, 460).title("ស្វ៊ែរ អេលីបសូអ៊ីត និងហ្សេអូអ៊ីត", "រាងពង្រីកហួសហេតុ ដើម្បីមើលឃើញភាពខុសគ្នា")
    for i, (t, sub) in enumerate([("ស្វ៊ែរ", "សាមញ្ញ · សម្រាប់ផែនទីពិភពលោក"), ("អេលីបសូអ៊ីត", "ផ្ទៃគណិតវិទ្យា · WGS 84"), ("ហ្សេអូអ៊ីត", "ផ្ទៃទំនាញ · កម្ពស់ពីនីវ៉ូទឹកសមុទ្រ")]):
        cx = 180 + i * 320
        if i == 0: f.circle(cx, 240, 120, "#e3f2fd", "#1e88e5", 2)
        elif i == 1: f.add(f'<ellipse cx="{cx}" cy="240" rx="135" ry="105" fill="#e8eaf6" stroke="{IND}" stroke-width="2"/>')
        else:
            pts = []
            for a in range(0, 361, 6):
                r = 120 + 9 * math.sin(math.radians(a * 3)) + 6 * math.cos(math.radians(a * 5))
                pts.append(f"{cx + r*1.08*math.cos(math.radians(a)):.1f} {240 + r*.88*math.sin(math.radians(a)):.1f}")
            f.add(f'<ellipse cx="{cx}" cy="240" rx="135" ry="105" fill="none" stroke="{IND}" stroke-width="1.2" stroke-dasharray="5 4"/>')
            f.path("M" + " L".join(pts) + "Z", "#e8f5e9", "#2e7d32", 2, .9)
        f.text(cx, 395, t, 20, INK, "middle", "bold"); f.text(cx, 420, sub, 14, "#607d8b", "middle")
    entry(2, f.save("l02-earth-shapes"), "គំរូបីនៃរាងផែនដី",
          ["ផែនដីរាបត្រង់ប៉ូលបន្តិច៖ អង្កត់ផ្ចិតអេក្វាទ័រវែងជាងប្រហែល ៤៣ គម។", "អេលីបសូអ៊ីតជាផ្ទៃរលោងសម្រាប់គណនាកូអរដោនេ។", "ហ្សេអូអ៊ីតមិនរលោង ព្រោះទំនាញប្រែប្រួលតាមម៉ាសនៃផែនដី។"], .42)
    # 6 datum shift
    f = Fig(1000, 520).title("ការរំកិលដាតុម៖ Indian 1960 → WGS 84", "ចំណុចដូចគ្នា កូអរដោនេខុសគ្នា (ពង្រីកព្រួញ)")
    prov_map(f, 60, 80, 1.6, fill=lambda p: "#eceff1")
    rng = np.random.default_rng(5)
    for p in PROV["prov"]:
        cx, cy = pcentre(p["en"]); x, y = 60 + cx * 1.6, 80 + cy * 1.6
        f.circle(x, y, 4, "#1565c0"); f.line(x, y, x - 14, y + 20, "#e65100", 1.6, arrow=True)
    f.legend_boxes(620, 150, ["#1565c0", "#e65100"], ["ទីតាំងក្នុង WGS 84", "ព្រួញរំកិល (ពង្រីក × ~១០០០)"])
    f.text(620, 250, "នៅកម្ពុជា ភាពខុសគ្នារវាង", 16); f.text(620, 276, "Indian 1960 និង WGS 84", 16); f.text(620, 302, "ប្រហែល ៣០០–៥០០ ម៉ែត្រ", 20, "#c62828", weight="bold")
    f.text(620, 350, "គ្រប់គ្រាន់ធ្វើឲ្យផ្លូវ និងអគារ", 16); f.text(620, 376, "ធ្លាក់ខុសក្រឡា ឬខុសភូមិ។", 16)
    f.source("ទំហំរំកិលប្រហាក់ប្រហែល · សម្រាប់បង្រៀន")
    entry(2, f.save("l02-datum-shift"), "ហេតុអ្វីដាតុមសំខាន់",
          ["ចំណុចតែមួយមានកូអរដោនេខុសគ្នា អាស្រ័យលើដាតុម។", "ស្រទាប់ពីររបស់ដាតុមខុសគ្នា អាចរំកិលពីគ្នារាប់រយម៉ែត្រ។", "ត្រូវពិនិត្យដាតុមរាល់ពេលនាំចូលទិន្នន័យចាស់ (ផែនទីទីសណ្ឋាន L7016)។"], .55)
    # 7 UTM zones strip
    f = Fig(1000, 520).title("តំបន់ UTM ជុំវិញកម្ពុជា", "តំបន់នីមួយៗទទឹង ៦° · កម្ពុជាស្ថិតក្នុងតំបន់ ៤៨ ភាគច្រើន")
    p, to = world_paths("merc", (40, 80, 920, 420), feats=ASIA["features"], extent=(90, 0, 120, 25), fill=lambda g: "#ffe0b2" if KHM(g) else "#eceff1", stroke="#b0bec5", sw=.6)
    f.add(p)
    for z in range(46, 51):
        lon = (z - 1) * 6 - 180; a, b = to(lon, 0), to(lon, 25); c = to(lon + 6, 25)
        if z == 48: f.rect(a[0], b[1], c[0] - a[0], a[1] - b[1], "#3949ab", op=None) if False else f.add(f'<rect x="{a[0]:.1f}" y="{b[1]:.1f}" width="{c[0]-a[0]:.1f}" height="{a[1]-b[1]:.1f}" fill="#3949ab" opacity=".12"/>')
        f.line(a[0], a[1], b[0], b[1], "#3949ab", 1.2); f.text((a[0] + c[0]) / 2, b[1] + 22, f"តំបន់ {kh(z)}", 16, "#3949ab", "middle", "bold")
        f.text(a[0], a[1] + 18, f"{kh(lon)}°E", 12, "#546e7a", "middle")
    f.source("Natural Earth · UTM ដោយ 6° ចាប់ពី 180°W")
    entry(2, f.save("l02-utm-zones"), "កម្ពុជាក្នុងតំបន់ UTM",
          ["តំបន់ ៤៨ គ្របពី ១០២°E ដល់ ១០៨°E ដែលគ្របស្ទើរទាំងស្រុងនូវកម្ពុជា។", "ផ្នែកតូចភាគខាងលិច (ប៉ៃលិន បាត់ដំបង) ធ្លាក់ក្នុងតំបន់ ៤៧។", "ប្រទេសជាច្រើនប្រើតំបន់តែមួយ ទោះបីផ្នែកតូចនៅក្រៅតំបន់ក៏ដោយ។"], .75)
    # 8 UTM grid over Cambodia (metres)
    f = Fig(1000, 560).title("ក្រឡាចត្រង្គ UTM 48N លើកម្ពុជា", "បន្ទាត់រៀងរាល់ ១០០ គម · លេខជា គីឡូម៉ែត្រ E និង N")
    k = 1.7; ox, oy = 150, 80; prov_map(f, ox, oy, k, fill=lambda p: "#e8eaf6", stroke="#9fa8da")
    B = PROV["bounds"]; MW, MH = PROV["W"] * k, PROV["H"] * k
    ex = lambda E: ox + (E - B[0]) / (B[2] - B[0]) * MW; ny = lambda N: oy + (B[3] - N) / (B[3] - B[1]) * MH
    for E in range(300000, 800000, 100000): f.line(ex(E), oy, ex(E), oy + MH, "#5c6bc0", .8, "5 4"); f.text(ex(E), oy + MH + 18, kh(E // 1000), 13, "#3949ab", "middle")
    for N in range(1200000, 1700000, 100000):
        if B[1] < N < B[3]: f.line(ox, ny(N), ox + MW, ny(N), "#5c6bc0", .8, "5 4"); f.text(ox - 6, ny(N) + 4, kh(N // 1000), 13, "#3949ab", "end")
    f.text(ox + MW / 2, oy + MH + 42, "Easting (គម)", 14, INK, "middle"); f.text(ox - 70, oy + MH / 2, "Northing", 14, INK, "middle")
    entry(2, f.save("l02-utm-grid"), "ក្រឡា UTM ជាម៉ែត្រ",
          ["កូអរដោនេ UTM ជាម៉ែត្រ៖ Easting (E) និង Northing (N)។", "ភ្នំពេញ ≈ E ៤៩១ ០០០ ម · N ១ ២៧៧ ០០០ ម។", "ក្រឡាការ៉េ ១០០ គម ធ្វើឲ្យវាស់ចម្ងាយ និងផ្ទៃងាយស្រួល។"], .88)

def L03():
    # 1 six projections gallery
    f = Fig(1000, 560).title("ពិភពលោកដូចគ្នា ចំណោលប្រាំមួយ")
    kinds = [("plate", "Plate Carrée"), ("merc", "Mercator"), ("robin", "Robinson"), ("moll", "Mollweide"), ("sin", "Sinusoidal"), ("ortho", "Orthographic")]
    for i, (kd, nm) in enumerate(kinds):
        x, y = 20 + (i % 3) * 325, 80 + (i // 3) * 240
        if kd == "ortho": f.circle(x + 150, y + 100, 97, "#e3f2fd", "#90caf9")
        p, to = world_paths(kd, (x, y, 300, 200), lon0=105 if kd == "ortho" else 0, lat0=12 if kd == "ortho" else 0,
                            fill=lambda g: "#ef5350" if KHM(g) else "#b0bec5", stroke="#fff", sw=.3)
        f.add(graticule(to, 30, color="#e0e0e0", sw=.4)); f.add(p); f.text(x + 150, y + 222, nm, 15, IND, "middle", "bold")
    f.source("Natural Earth · ក្រហម = កម្ពុជា")
    entry(3, f.save("l03-six-projections"), "ពិភពលោកតែមួយ ចំណោលប្រាំមួយ",
          ["គ្មានចំណោលណារក្សាទុក រាង ផ្ទៃ ចម្ងាយ និងទិសដៅ ព្រមគ្នាបានទេ។", "Mercator រក្សារាងក្នុងតំបន់តូច ប៉ុន្តែពង្រីកផ្ទៃនៅជិតប៉ូល។", "Mollweide និង Sinusoidal រក្សាផ្ទៃ ប៉ុន្តែរាងខូចនៅគែម។"], .08)
    # 2-3 Tissot indicatrix on Mercator and Mollweide
    for kd, nm, key in [("merc", "Mercator (រក្សារាង)", "l03-tissot-mercator"), ("moll", "Mollweide (រក្សាផ្ទៃ)", "l03-tissot-mollweide")]:
        f = Fig(1000, 560).title(f"រង្វង់ Tissot លើ {nm}", "រង្វង់ដែលមានទំហំស្មើគ្នាលើផែនដី")
        p, to = world_paths(kd, (40, 80, 920, 460), fill=lambda g: "#e0e0e0", stroke="#fff", sw=.3,
                            extent=(-180, -80, 180, 84) if kd == "merc" else None)
        f.add(graticule(to, 30, color="#eceff1", sw=.5)); f.add(p)
        for lat in range(-60, 61, 30):
            for lon in range(-150, 151, 30):
                pts = []
                for a in range(0, 361, 15):
                    la = lat + 6 * math.sin(math.radians(a)); lo = lon + 6 * math.cos(math.radians(a)) / max(.2, math.cos(math.radians(lat)))
                    q = to(lo, la); pts.append(q)
                if all(pts): f.path("M" + " L".join(f"{q[0]:.1f} {q[1]:.1f}" for q in pts) + "Z", "#ef5350", "#b71c1c", .6, .55)
        entry(3, f.save(key), f"រង្វង់ Tissot៖ {nm}",
              (["រង្វង់នៅតែជារង្វង់ (រាងមិនខូច) ប៉ុន្តែធំឡើងខ្លាំងនៅរយៈទទឹងខ្ពស់។", "នៅ ៦០° រង្វង់ធំជាងអេក្វាទ័រ ៤ ដងក្នុងផ្ទៃ (1/cos²60°)។", "ល្អសម្រាប់ការធ្វើនាវាចរណ៍ និងផែនទីវេប មិនល្អសម្រាប់ប្រៀបធៀបផ្ទៃ។"] if kd == "merc" else
               ["រង្វង់ទាំងអស់មានផ្ទៃស្មើគ្នា ប៉ុន្តែរាងក្លាយជាអេលីបនៅគែម។", "ល្អសម្រាប់ផែនទីដង់ស៊ីតេ ឬ choropleth ពិភពលោក។", "គ្មានចំណោលណាធ្វើឲ្យរង្វង់ទាំងអស់ដូចគ្នាទាំងទំហំ និងរាងទេ។"]), .25 if kd == "merc" else .32)
    # 4 Greenland vs Africa
    f = Fig(1000, 560).title("ហ្គ្រីនឡែន ធៀបនឹងអាហ្វ្រិក", "Mercator ធ្វើឲ្យហ្គ្រីនឡែនមើលទៅធំប្រហាក់ប្រហែលអាហ្វ្រិក")
    GA = lambda g: g["properties"].get("ADM0_A3") in ("GRL",) or g["properties"].get("CONTINENT") == "Africa"
    colr = lambda g: "#1e88e5" if g["properties"].get("ADM0_A3") == "GRL" else ("#fb8c00" if g["properties"].get("CONTINENT") == "Africa" else "#eceff1")
    p, to = world_paths("merc", (30, 90, 450, 400), fill=colr, extent=(-80, -40, 60, 83)); f.add(p); f.text(255, 505, "Mercator", 17, IND, "middle", "bold")
    p, to = world_paths("moll", (520, 90, 450, 400), fill=colr, extent=(-80, -40, 60, 83)); f.add(p); f.text(745, 505, "Mollweide (ផ្ទៃពិត)", 17, IND, "middle", "bold")
    f.text(500, 545, "ផ្ទៃពិត៖ អាហ្វ្រិក ≈ ៣០ លាន គម² · ហ្គ្រីនឡែន ≈ ២,២ លាន គម² (តូចជាង ១៤ ដង)", 15, "#c62828", "middle", "bold")
    entry(3, f.save("l03-greenland-africa"), "ផ្ទៃបំភាន់៖ ហ្គ្រីនឡែន និងអាហ្វ្រិក",
          ["លើ Mercator ហ្គ្រីនឡែនមើលទៅស្ទើរតែស្មើអាហ្វ្រិក។", "ការពិត អាហ្វ្រិកធំជាងប្រហែល ១៤ ដង។", "ផែនទីពិភពលោកសម្រាប់ប្រៀបធៀបទំហំ ត្រូវប្រើចំណោលរក្សាផ្ទៃ។"], .4)
    # 5 developable surfaces
    f = Fig(1000, 440).title("ផ្ទៃលាតសន្ធឹងបានបីប្រភេទ", "ស៊ីឡាំង · កោណ · ប្លង់")
    for i, (t, sub) in enumerate([("ស៊ីឡាំង", "Mercator · UTM"), ("កោណ", "Lambert Conformal Conic"), ("ប្លង់", "Azimuthal · Orthographic")]):
        cx = 180 + i * 320; f.circle(cx, 220, 90, "#e3f2fd", "#1e88e5", 2)
        if i == 0: f.rect(cx - 90, 110, 180, 220, "none", "#e65100", 2.5); f.add(f'<ellipse cx="{cx}" cy="110" rx="90" ry="16" fill="none" stroke="#e65100" stroke-width="2"/>')
        elif i == 1: f.path(f"M {cx} 90 L {cx-120} 330 M {cx} 90 L {cx+120} 330", "none", "#e65100", 2.5); f.add(f'<ellipse cx="{cx}" cy="185" rx="75" ry="12" fill="none" stroke="#e65100" stroke-width="2"/>')
        else: f.path(f"M {cx-130} 130 L {cx+130} 130", "none", "#e65100", 4); f.circle(cx, 130, 5, "#e65100")
        f.text(cx, 375, t, 20, INK, "middle", "bold"); f.text(cx, 402, sub, 14, "#607d8b", "middle")
    entry(3, f.save("l03-surfaces"), "ពីផែនដីមូលទៅក្រដាសរាប",
          ["ចំណោលត្រូវបាន «ចាក់» ពីផ្ទៃផែនដីទៅលើផ្ទៃដែលអាចលាតរាបបាន។", "ការខូចទ្រង់ទ្រាយតិចបំផុត នៅកន្លែងដែលផ្ទៃប៉ះផែនដី។", "UTM ប្រើស៊ីឡាំងផ្ដេក (transverse) ប៉ះតាមខ្សែបណ្ដោយកណ្ដាល។"], .15)
    # 6 Cambodia shape in 4 projections
    f = Fig(1000, 480).title("រាងកម្ពុជាក្នុងចំណោលបួន")
    kh_feat = [g for g in ASIA["features"] if KHM(g)]
    for i, (kd, nm) in enumerate([("plate", "Plate Carrée"), ("merc", "Mercator"), ("sin", "Sinusoidal"), ("laea", "LAEA (លើអាស៊ី)")]):
        x = 20 + i * 245
        p, to = world_paths(kd, (x + 10, 100, 220, 260), feats=kh_feat, lon0=105 if kd in ("laea",) else 0, lat0=12 if kd == "laea" else 0, extent=(102, 10, 108, 15), fill=lambda g: "#7986cb", stroke=IND, sw=1)
        f.add(p); f.text(x + 120, 410, nm, 16, IND, "middle", "bold")
    f.text(500, 450, "នៅតំបន់តូចជិតអេក្វាទ័រ ភាពខុសគ្នាតិច ប៉ុន្តែមិនសូន្យ", 15, "#607d8b", "middle")
    entry(3, f.save("l03-cambodia-shapes"), "ចំណោល និងរាងកម្ពុជា",
          ["នៅរយៈទទឹង ១០°–១៥° ចំណោលភាគច្រើនផ្ដល់រាងស្រដៀងគ្នា។", "Plate Carrée ពង្រីកទិសកើត–លិចតិច ប៉ុន្តែផ្ទៃ និងចម្ងាយខុស ព្រោះឯកតាជាដឺក្រេ។", "សម្រាប់វាស់ចម្ងាយ និងផ្ទៃនៅកម្ពុជា ប្រើ UTM 48N (EPSG:32648)។"], .6)
    # 7 scale-factor heat on Mercator (area)
    f = Fig(1000, 520).title("មេគុណពង្រីកផ្ទៃលើ Mercator", "ពណ៌ = ផ្ទៃលើផែនទី ÷ ផ្ទៃពិត")
    p, to = world_paths("merc", (40, 80, 700, 420), fill=lambda g: "none", stroke="#455a64", sw=.5, extent=(-180, -80, 180, 84))
    for lat in range(-78, 84, 2):
        k2 = 1 / math.cos(math.radians(lat + 1)) ** 2; t = min(1, math.log(k2) / math.log(25))
        a, b = to(-179.9, lat), to(179.9, lat + 2); c = VIR[min(4, int(t * 4.99))]
        f.rect(a[0], b[1], b[0] - a[0], a[1] - b[1] + .5, c)
    f.add(p)
    f.legend_boxes(780, 150, VIR, ["× ១ (អេក្វាទ័រ)", "× ~២", "× ~៥", "× ~១០", "× ≥ ២៥"], "ការពង្រីកផ្ទៃ")
    f.text(780, 360, "កម្ពុជា (១២°N)៖ × ១,០៤", 16, "#c62828", weight="bold")
    entry(3, f.save("l03-mercator-scale"), "Mercator ពង្រីកផ្ទៃតាមរយៈទទឹង",
          ["មេគុណពង្រីកផ្ទៃ = 1 / cos²φ។", "នៅកម្ពុជា ផ្ទៃពង្រីកត្រឹមតែប្រហែល ៤% ប៉ុណ្ណោះ។", "នៅ ៧០° ផ្ទៃពង្រីកជាង ៨ ដង ដូច្នេះអឺរ៉ុបខាងជើងមើលទៅធំខុសពីការពិត។"], .45)
    # 8 great circle vs rhumb (Phnom Penh → Paris) on Mercator
    f = Fig(1000, 520).title("ផ្លូវខ្លីបំផុត ធៀបនឹងខ្សែទិសថេរ", "ភ្នំពេញ → ប៉ារីស លើ Mercator")
    p, to = world_paths("merc", (40, 80, 920, 420), fill=lambda g: "#eceff1", stroke="#fff", sw=.4, extent=(-20, -10, 130, 70)); f.add(p)
    A, Bp = (104.92, 11.55), (2.35, 48.86)
    def gc(t):
        la1, lo1, la2, lo2 = map(math.radians, (A[1], A[0], Bp[1], Bp[0]))
        d = math.acos(math.sin(la1) * math.sin(la2) + math.cos(la1) * math.cos(la2) * math.cos(lo2 - lo1))
        a_ = math.sin((1 - t) * d) / math.sin(d); b_ = math.sin(t * d) / math.sin(d)
        x = a_ * math.cos(la1) * math.cos(lo1) + b_ * math.cos(la2) * math.cos(lo2); y = a_ * math.cos(la1) * math.sin(lo1) + b_ * math.cos(la2) * math.sin(lo2); z = a_ * math.sin(la1) + b_ * math.sin(la2)
        return math.degrees(math.atan2(y, x)), math.degrees(math.atan2(z, math.hypot(x, y)))
    from vis_core import _pl as PL
    f.add(PL([to(*gc(t / 60)) for t in range(61)], "#c62828", 3))
    f.add(PL([to(A[0] + (Bp[0] - A[0]) * t / 60, A[1] + (Bp[1] - A[1]) * t / 60) for t in range(61)], "#1565c0", 3))
    for (lo, la), nm in [(A, "ភ្នំពេញ"), (Bp, "ប៉ារីស")]:
        q = to(lo, la); f.circle(q[0], q[1], 6, INK); f.text(q[0] + 8, q[1] - 8, nm, 15, INK, weight="bold")
    f.legend_boxes(80, 430, ["#c62828", "#1565c0"], ["ខ្សែរង្វង់ធំ (ខ្លីបំផុត ~៩ ៩០០ គម)", "ខ្សែទិសថេរ (មើលទៅត្រង់ ប៉ុន្តែវែងជាង)"])
    entry(3, f.save("l03-great-circle"), "ខ្សែត្រង់លើផែនទី មិនមែនផ្លូវខ្លីបំផុតទេ",
          ["ផ្លូវហោះហើរពិតដើរតាមខ្សែរង្វង់ធំ ដែលមើលទៅកោងលើ Mercator។", "ខ្សែត្រង់លើ Mercator រក្សាទិសថេរ (rhumb line) ប៉ុន្តែវែងជាង។", "ដូច្នេះត្រូវវាស់ចម្ងាយលើអេលីបសូអ៊ីត មិនមែនលើផែនទីពិភពលោកទេ។"], .7)

def L04():
    # 1 three scales
    f = Fig(1000, 540).title("មាត្រដ្ឋានតូច មធ្យម និងធំ", "ប្រទេស → ខេត្ត → ឃុំ")
    prov_map(f, 20, 110, .95, fill=lambda p: "#ffcc80" if p["en"] == "Kampong Chhnang" else "#eceff1"); f.text(160, 470, "១ : ៥ ០០០ ០០០", 17, IND, "middle", "bold"); f.text(160, 495, "ប្រទេសទាំងមូល", 14, "#607d8b", "middle")
    kk = 250 / KC["W"]
    for c in KC["comm"]: f.path(pd(c["r"], 360, 90, kk * 1.0), "#ffe0b2", "#fb8c00", .5)
    f.text(485, 470, "១ : ៧៥០ ០០០", 17, IND, "middle", "bold"); f.text(485, 495, "ខេត្តកំពង់ឆ្នាំង (ឃុំ)", 14, "#607d8b", "middle")
    sel = [c for c in KC["comm"] if c["n"] in ("Phsar Chhnang", "Kampong Chhnang", "B'er", "Khsam", "Srae Thmei", "Kampong Hau", "Pongro")]
    xs = [x for c in sel for r in c["r"] for x, y in r]; ys = [y for c in sel for r in c["r"] for x, y in r]; minx, miny = min(xs), min(ys); s = 300 / max(max(xs) - minx, max(ys) - miny)
    for c in sel:
        f.path(" ".join("M" + " L".join(f"{690 + (x - minx) * s:.1f} {110 + (y - miny) * s:.1f}" for x, y in r) + "Z" for r in c["r"]), "#fff3e0", "#e65100", 1)
        xy = [(x, y) for r in c["r"] for x, y in r]; cx = sum(a for a, b in xy) / len(xy); cy = sum(b for a, b in xy) / len(xy)
        f.text(690 + (cx - minx) * s, 110 + (cy - miny) * s, c["n"], 10, INK, "middle")
    f.text(840, 470, "១ : ១៥០ ០០០", 17, IND, "middle", "bold"); f.text(840, 495, "ក្រុងកំពង់ឆ្នាំង", 14, "#607d8b", "middle")
    entry(4, f.save("l04-three-scales"), "មាត្រដ្ឋានតូច មធ្យម និងធំ",
          ["មាត្រដ្ឋានតូច (ភាគបែងធំ) = ផ្ទៃធំ លម្អិតតិច។", "មាត្រដ្ឋានធំ (ភាគបែងតូច) = ផ្ទៃតូច លម្អិតច្រើន។", "ឈ្មោះឃុំអាចដាក់បានតែនៅមាត្រដ្ឋានធំប៉ុណ្ណោះ។"], .55)
    # 2 scale bar designs
    f = Fig(1000, 420).title("របារមាត្រដ្ឋានបួនម៉ូដ")
    y = 120
    for i, t in enumerate(["បន្ទាត់សាមញ្ញ", "ប្រអប់ឆ្លាស់", "ជ្រុងពីរ (គម / ម៉ាយ)", "ការពារមុខងារ (ស្ដើង)"]):
        yy = y + i * 75; f.text(40, yy + 12, t, 16, INK, weight="bold")
        if i == 0: f.line(330, yy + 10, 730, yy + 10, INK, 2); [f.line(330 + j * 100, yy + 2, 330 + j * 100, yy + 18, INK, 2) for j in range(5)]
        if i == 1:
            for j in range(4): f.rect(330 + j * 100, yy + 4, 100, 12, INK if j % 2 == 0 else "#fff", INK, 1.2)
        if i == 2:
            f.line(330, yy + 10, 730, yy + 10, INK, 2); [f.line(330 + j * 100, yy + 10, 330 + j * 100, yy - 2, INK, 1.5) for j in range(5)]; [f.line(330 + j * 62.1, yy + 10, 330 + j * 62.1, yy + 22, INK, 1.5) for j in range(7)]
        if i == 3: f.line(330, yy + 10, 730, yy + 10, "#607d8b", 1); [f.line(330 + j * 100, yy + 6, 330 + j * 100, yy + 14, "#607d8b", 1) for j in range(5)]
        for j in range(5): f.text(330 + j * 100, yy + 36, kh(j * 25), 12, "#455a64", "middle")
        f.text(760, yy + 16, "គម", 13, "#455a64")
    f.text(40, 410, "ចំនួនរាប់គួរជាលេខមូល (០ ២៥ ៥០ ១០០) ដើម្បីអានលឿន", 14, "#607d8b")
    entry(4, f.save("l04-scale-bars"), "ការរចនារបារមាត្រដ្ឋាន",
          ["របារមាត្រដ្ឋានធ្វើដំណើរជាមួយផែនទី ពេលពង្រីក ឬបង្រួម។", "ប្រើលេខមូល និងឯកតាច្បាស់ (ម ឬ គម)។", "កុំឲ្យរបារមាត្រដ្ឋានធំ ឬលេចធ្លោជាងប្រធានបទ។"], .2)
    # 3 RF ruler
    f = Fig(1000, 380).title("ប្រភាគតំណាង ១ : ៥០ ០០០ មានន័យអ្វី?")
    f.rect(80, 130, 380, 60, "#fff8e1", "#ffb300", 2); f.text(270, 170, "១ សម លើផែនទី", 22, INK, "middle", "bold")
    f.text(500, 170, "=", 34, "#e65100", "middle", "bold")
    f.rect(540, 130, 380, 60, "#e8eaf6", IND, 2); f.text(730, 170, "៥០ ០០០ សម = ៥០០ ម លើដី", 22, INK, "middle", "bold")
    f.text(500, 260, "៤ សម លើផែនទី × ៥០ ០០០ = ២០០ ០០០ សម = ២ គម", 22, IND, "middle")
    f.text(500, 310, "ផ្ទៃ៖ ១ សម² លើផែនទី = (៥០០ ម)² = ២៥០ ០០០ ម² = ០,២៥ គម²", 18, "#607d8b", "middle")
    entry(4, f.save("l04-rf-ruler"), "គណនាចម្ងាយ និងផ្ទៃពី RF",
          ["ចម្ងាយពិត = ចម្ងាយលើផែនទី × ភាគបែង (ឯកតាដូចគ្នា)។", "ផ្ទៃពិត = ផ្ទៃលើផែនទី × ភាគបែង²។", "បម្លែង សម → ម (÷ ១០០) → គម (÷ ១០០០) ជាជំហាន ដើម្បីជៀសវាងកំហុស ១០ ឬ ១០០ ដង។"], .3)
    # 4 area squares
    f = Fig(1000, 420).title("ពង្រីកមាត្រដ្ឋាន ២ ដង = ផ្ទៃ ៤ ដង")
    for i, s in enumerate([1, 2, 3]):
        x = 120 + i * 280; f.rect(x, 300 - 70 * s, 70 * s, 70 * s, ["#c5cae9", "#9fa8da", "#7986cb"][i], IND, 1.5)
        for a in range(s):
            for b in range(s): f.rect(x + a * 70, 300 - 70 * s + b * 70, 70, 70, "none", "#fff", 1)
        f.text(x + 35 * s, 340, f"ប្រវែង × {kh(s)}", 16, INK, "middle"); f.text(x + 35 * s, 365, f"ផ្ទៃ × {kh(s*s)}", 18, "#c62828", "middle", "bold")
    entry(4, f.save("l04-area-squares"), "ប្រវែង និងផ្ទៃមិនប្ដូរស្មើគ្នា",
          ["ពង្រីក ២ ដង៖ ចម្ងាយ × ២ តែផ្ទៃ × ៤។", "ពង្រីក ៣ ដង៖ ផ្ទៃ × ៩។", "កំហុសនេះកើតញឹកញាប់ពេលថតចម្លងផែនទី ហើយប៉ាន់ស្មានផ្ទៃស្រែ។"], .38)
    # 5 web zoom pyramid
    f = Fig(1000, 460).title("កម្រិត zoom នៃផែនទីវេប", "ក្រឡាក្បឿង ២៥៦ × ២៥៦ ភីកសែល · ក្រឡាគុណ ៤ ដងរាល់កម្រិត")
    for z in range(4):
        n = 2 ** z; size = 200; x0 = 60 + z * 230; y0 = 120
        for a in range(n):
            for b in range(n): f.rect(x0 + a * size / n, y0 + b * size / n, size / n, size / n, ["#e8eaf6", "#c5cae9", "#9fa8da", "#7986cb"][z], "#fff", 1)
        f.text(x0 + 100, 350, f"zoom {kh(z)}", 17, IND, "middle", "bold"); f.text(x0 + 100, 375, f"{kh(n*n)} ក្រឡា", 14, "#607d8b", "middle")
        mpp = 156543 / 2 ** z; f.text(x0 + 100, 400, f"≈ {khn(int(mpp/1000))} គម/ភីកសែល", 13, "#607d8b", "middle")
    f.text(60, 440, "នៅ zoom ១៨ ភីកសែលមួយ ≈ ០,៦ ម នៅអេក្វាទ័រ (តូចជាងនៅរយៈទទឹងខ្ពស់)", 14, INK)
    entry(4, f.save("l04-web-zoom"), "មាត្រដ្ឋានលើអេក្រង់៖ កម្រិត zoom",
          ["ផែនទីវេបមិនមាន RF ថេរទេ៖ មាត្រដ្ឋានអាស្រ័យលើ zoom និងទំហំអេក្រង់។", "zoom នីមួយៗ បង្កើនលម្អិត ២ ដង និងចំនួនក្រឡា ៤ ដង។", "ដូច្នេះផែនទីវេបត្រូវមានរបារមាត្រដ្ឋានដែលប្ដូរតាម zoom។"], .8)
    # 6 same distance at 3 scales (Phnom Penh–Kampong Chhnang ~91 km)
    f = Fig(1000, 400).title("ចម្ងាយដូចគ្នា លើមាត្រដ្ឋានបី", "ភ្នំពេញ – កំពង់ឆ្នាំង ≈ ៩១ គម (ត្រង់)")
    for i, (rf, lab) in enumerate([(5_000_000, "១ : ៥ ០០០ ០០០"), (2_000_000, "១ : ២ ០០០ ០០០"), (1_000_000, "១ : ១ ០០០ ០០០")]):
        cm = 91e5 / rf; y = 130 + i * 85; L = cm * 38
        f.line(250, y, 250 + L, y, IND, 5); f.circle(250, y, 7, "#c62828"); f.circle(250 + L, y, 7, "#c62828")
        f.text(40, y + 6, lab, 16, INK, weight="bold"); f.text(260 + L, y - 12, f"{kh(round(cm, 1))} សម", 16, "#e65100", weight="bold")
    f.text(40, 380, "រូបនេះមិនមែនទំហំពិតលើអេក្រង់ទេ (៣៨ ភីកសែល ≈ ១ សម)", 13, "#90a4ae")
    entry(4, f.save("l04-same-distance"), "ចម្ងាយដូចគ្នា ប្រវែងលើផែនទីខុសគ្នា",
          ["មាត្រដ្ឋានធំជាង ២ ដង → ខ្សែលើផែនទីវែងជាង ២ ដង។", "ចម្ងាយលើដីមិនប្ដូរទេ មានតែតំណាងលើក្រដាស។", "ពិនិត្យមាត្រដ្ឋានជានិច្ច មុនវាស់ដោយបន្ទាត់។"], .35)

def L05():
    z = np.array(TERRAIN["z"]); n = z.shape[0]
    # hillshade PNG + contours
    gy, gx = np.gradient(z, 200.0)
    slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(45)
    hs = np.clip(np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect), 0, 1)
    big = np.kron(hs, np.ones((8, 8)))
    Image.fromarray((big * 255).astype(np.uint8)).save(os.path.join(IMGDIR, "l05-hillshade.png"))
    zn = (z - z.min()) / (z.max() - z.min())
    ramp = np.array([[26, 150, 65], [166, 217, 106], [255, 255, 191], [253, 174, 97], [215, 25, 28]], float)
    idx = zn * 4; lo = np.floor(idx).astype(int).clip(0, 3); t = (idx - lo)[..., None]
    rgb = ramp[lo] * (1 - t) + ramp[lo + 1] * t
    shaded = (rgb * (.55 + .45 * hs[..., None])).clip(0, 255).astype(np.uint8)
    Image.fromarray(np.kron(shaded, np.ones((8, 8, 1), np.uint8))).save(os.path.join(IMGDIR, "l05-hypso.png"))
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    cs = plt.contour(np.arange(n), np.arange(n), z, levels=np.arange(0, 400, 10))
    def contour_svg(ox, oy, s, every=10, idx_every=50):
        out = []
        for lev, segs in zip(cs.levels, cs.allsegs):
            for sg in segs:
                if len(sg) < 2: continue
                d = "M" + " L".join(f"{ox + x * s:.1f} {oy + y * s:.1f}" for x, y in sg)
                out.append(f'<path d="{d}" fill="none" stroke="#8d6e63" stroke-width="{1.6 if lev % idx_every == 0 else .6}"/>')
        return "".join(out)
    f = Fig(1000, 540).title("រលកដីបង្ហាញបីរបៀប", "ទិន្នន័យកម្ពស់ដូចគ្នា ៦១ × ៦១ ក្រឡា")
    f.add('<image href="../assets/img/slides/l05-hillshade.png" x="30" y="90" width="300" height="300"/>'); f.text(180, 420, "Hillshade (ពន្លឺពីទិសពាយ័ព្យ)", 15, INK, "middle")
    f.add('<image href="../assets/img/slides/l05-hypso.png" x="350" y="90" width="300" height="300"/>'); f.text(500, 420, "ពណ៌កម្ពស់ + ស្រមោល", 15, INK, "middle")
    f.rect(670, 90, 300, 300, "#fffdf7", "#d7ccc8"); f.add(contour_svg(670, 90, 300 / (n - 1))); f.text(820, 420, "ខ្សែវណ្ឌ ១០ ម (ដិត ៥០ ម)", 15, INK, "middle")
    f.source("DEM គំរូ · កម្ពស់ ០–៣៥០ ម")
    entry(5, f.save("l05-relief-three"), "ផ្ទៃដីតែមួយ បង្ហាញបីរបៀប",
          ["Hillshade ផ្ដល់ការយល់ឃើញ ៣ វិមាត្រ ប៉ុន្តែមិនប្រាប់កម្ពស់ជាលេខ។", "ពណ៌កម្ពស់ ប្រាប់តំបន់ខ្ពស់/ទាប ប៉ុន្តែអាស្រ័យលើសញ្ញាសម្គាល់។", "ខ្សែវណ្ឌ ប្រាប់កម្ពស់ពិត និងជម្រាល ប៉ុន្តែត្រូវការការហ្វឹកហាត់អាន។"], .1)
    # contour with profile
    f = Fig(1000, 540).title("ខ្សែវណ្ឌ និងផ្នែកកាត់បញ្ឈរ A–B")
    s = 420 / (n - 1); f.rect(40, 90, 420, 420, "#fffdf7", "#d7ccc8"); f.add(contour_svg(40, 90, s))
    r = 30; f.line(40, 90 + r * s, 460, 90 + r * s, "#c62828", 2.5); f.text(46, 84 + r * s, "A", 18, "#c62828", weight="bold"); f.text(446, 84 + r * s, "B", 18, "#c62828", weight="bold")
    prof = z[r]; X0, Y0, W, H = 520, 120, 440, 330
    f.line(X0, Y0 + H, X0 + W, Y0 + H, INK, 1); f.line(X0, Y0, X0, Y0 + H, INK, 1)
    zmax = 360; pts = " L".join(f"{X0 + i / (n - 1) * W:.1f} {Y0 + H - v / zmax * H:.1f}" for i, v in enumerate(prof))
    f.path(f"M{X0} {Y0+H} L{pts} L{X0+W} {Y0+H}Z", "#d7ccc8", "#6d4c41", 2)
    for v in (0, 100, 200, 300): f.text(X0 - 8, Y0 + H - v / zmax * H + 4, kh(v), 12, "#607d8b", "end")
    f.text(X0 + W / 2, Y0 + H + 30, "ចម្ងាយពី A ទៅ B (១២ គម)", 14, INK, "middle"); f.text(X0 - 40, Y0 - 10, "កម្ពស់ (ម)", 13, INK)
    f.text(X0, Y0 + H + 55, "ខ្នាតបញ្ឈរពង្រីក ~២០ ដង", 13, "#90a4ae")
    entry(5, f.save("l05-profile"), "ពីខ្សែវណ្ឌទៅផ្នែកកាត់",
          ["ខ្សែវណ្ឌជិតគ្នា = ជម្រាលចោត · ឆ្ងាយពីគ្នា = ជម្រាលរាប។", "ផ្នែកកាត់គូសដោយយកកម្ពស់នៅចំណុចដែលបន្ទាត់ A–B ឆ្លងខ្សែវណ្ឌនីមួយៗ។", "ខ្នាតបញ្ឈរតែងពង្រីក ដូច្នេះជម្រាលមើលទៅចោតជាងការពិត។"], .45)
    # landforms small multiples
    f = Fig(1000, 440).title("លំនាំខ្សែវណ្ឌប្រាំ")
    X, Y = np.meshgrid(np.linspace(-1, 1, 60), np.linspace(-1, 1, 60))
    forms = [("ភ្នំ", 100 * np.exp(-(X**2 + Y**2) * 3)), ("ជ្រលង", 60 * np.abs(X) + 40 * (Y + 1)), ("ខ្នងភ្នំ", 100 - 60 * np.abs(X) + 20 * Y),
             ("ក្រវ៉ាត់ (saddle)", 50 + 40 * (X**2 - Y**2)), ("ច្រាំងចោត", np.where(X > 0, 100, 20) + 10 * Y)]
    for i, (nm, zz) in enumerate(forms):
        c2 = plt.contour(zz, levels=10); ox = 20 + i * 196
        f.rect(ox, 90, 180, 180, "#fffdf7", "#d7ccc8")
        for segs in c2.allsegs:
            for sg in segs:
                if len(sg) > 1: f.path("M" + " L".join(f"{ox + x * 3:.1f} {90 + y * 3:.1f}" for x, y in sg), "none", "#8d6e63", 1)
        f.text(ox + 90, 300, nm, 17, INK, "middle", "bold")
    f.text(500, 350, "អានលំនាំ៖ រង្វង់បិទ = កំពូល · អក្សរ V ចង្អុលឡើង = ជ្រលង · អក្សរ V ចង្អុលចុះ = ខ្នងភ្នំ", 15, "#455a64", "middle")
    f.text(500, 380, "ខ្សែវណ្ឌផ្ដុំជាប់គ្នា = ច្រាំងចោត · រាងម៉ោងខ្សាច់ = ក្រវ៉ាត់ (ចន្លោះភ្នំពីរ)", 15, "#455a64", "middle")
    entry(5, f.save("l05-landforms"), "អានទម្រង់ដីពីខ្សែវណ្ឌ",
          ["ភ្នំ៖ រង្វង់បិទជាន់គ្នា កម្ពស់កើនឆ្ពោះទៅកណ្ដាល។", "ជ្រលង៖ ខ្សែវណ្ឌរាង V ដែលចុងចង្អុលទៅខាងលើជម្រាល។", "ខ្នងភ្នំ៖ រាង V ចុងចង្អុលចុះ · ក្រវ៉ាត់៖ រាងម៉ោងខ្សាច់រវាងកំពូលពីរ។"], .55)
    # slope classes
    sl = np.degrees(slope); cls = np.digitize(sl, [2, 5, 10, 20]); pal = np.array([[255, 255, 204], [161, 218, 180], [65, 182, 196], [44, 127, 184], [37, 52, 148]], np.uint8)
    Image.fromarray(np.kron(pal[cls], np.ones((8, 8, 1), np.uint8))).save(os.path.join(IMGDIR, "l05-slope.png"))
    f = Fig(1000, 500).title("ផែនទីជម្រាល ពីទិន្នន័យកម្ពស់")
    f.add('<image href="../assets/img/slides/l05-slope.png" x="60" y="80" width="400" height="400"/>')
    f.legend_boxes(520, 140, ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"], ["< ២° រាប", "២–៥°", "៥–១០°", "១០–២០°", "> ២០° ចោត"], "ជម្រាល (ដឺក្រេ)")
    f.text(520, 330, "ជម្រាល = arctan(Δកម្ពស់ ÷ ចម្ងាយផ្ដេក)", 16, INK); f.text(520, 360, "ឧ. ឡើង ២០ ម ក្នុង ២០០ ម = ១០% ≈ ៥,៧°", 16, "#607d8b")
    entry(5, f.save("l05-slope-map"), "ផែនទីជម្រាល",
          ["ជម្រាលគណនាពីភាពខុសគ្នានៃកម្ពស់រវាងក្រឡាជិតខាង។", "ជម្រាល > ១៥° ជាទូទៅមិនសមស្របសម្រាប់ស្រែ ឬផ្លូវ។", "QGIS៖ Raster → Analysis → Slope លើ DEM ជាម៉ែត្រ (UTM)។"], .6)
    # grid reference
    f = Fig(1000, 520).title("លេខយោងក្រឡាប្រាំមួយខ្ទង់", "អានទិសកើតមុន (Easting) រួចទិសជើង (Northing)")
    s = 60; ox, oy = 120, 90
    for i in range(7):
        f.line(ox + i * s, oy, ox + i * s, oy + 6 * s, "#5c6bc0", 1.2); f.line(ox, oy + i * s, ox + 6 * s, oy + i * s, "#5c6bc0", 1.2)
        f.text(ox + i * s, oy + 6 * s + 20, kh(40 + i), 14, "#3949ab", "middle"); f.text(ox - 8, oy + (6 - i) * s + 5, kh(20 + i), 14, "#3949ab", "end")
    px, py = ox + 3 * s + .45 * s, oy + (6 - 2) * s - .7 * s
    f.circle(px, py, 8, "#c62828"); f.text(px + 12, py - 8, "សាលា", 15, "#c62828", weight="bold")
    f.line(ox + 3 * s, oy + 6 * s + 30, px, oy + 6 * s + 30, "#e65100", 2); f.text(ox + 3.2 * s, oy + 6 * s + 48, "៤៥", 13, "#e65100")
    f.text(600, 150, "E៖ ៤៣ + ៤/១០ → ៤៣៤", 22, INK); f.text(600, 190, "N៖ ២២ + ៧/១០ → ២២៧", 22, INK)
    f.rect(600, 220, 330, 60, "#fff8e1", "#ffb300", 2); f.text(765, 258, "លេខយោង៖ ៤៣៤ ២២៧", 24, "#e65100", "middle", "bold")
    f.text(600, 320, "៦ ខ្ទង់ = ភាពជាក់លាក់ ១០០ ម", 17, "#607d8b"); f.text(600, 350, "(លើក្រឡា ១ គម នៃផែនទី ១ : ៥០ ០០០)", 15, "#607d8b")
    entry(5, f.save("l05-grid-reference"), "រកលេខយោងក្រឡា",
          ["«ចូលផ្ទះ រួចឡើងជណ្ដើរ»៖ អាន E (ទៅស្ដាំ) មុន N (ឡើងលើ)។", "ចែកក្រឡាជា ១០ ដើម្បីប៉ាន់ខ្ទង់ទីបី។", "លេខយោង ៨ ខ្ទង់ ផ្ដល់ភាពជាក់លាក់ ១០ ម។"], .78)
    # topo sheet sample (exists)
    if os.path.exists(os.path.join(DOCS, "assets/data/lab-05/topo_sheet_sample.jpg")):
        f = Fig(1000, 560).title("ផ្នែកនៃផែនទីទីសណ្ឋានគំរូ")
        f.add('<image href="../assets/data/lab-05/topo_sheet_sample.jpg" x="40" y="80" width="600" height="460" preserveAspectRatio="xMidYMid meet"/>')
        for i, t in enumerate(["ខ្សែវណ្ឌពណ៌ត្នោត", "ទឹកពណ៌ខៀវ", "ព្រៃ/រុក្ខជាតិពណ៌បៃតង", "សំណង់ និងអក្សរពណ៌ខ្មៅ", "ផ្លូវពណ៌ក្រហម/ទឹកក្រូច", "ក្រឡាចត្រង្គ ១ គម"]):
            f.circle(680, 140 + i * 50, 7, ["#8d6e63", "#1e88e5", "#43a047", "#212121", "#e65100", "#5c6bc0"][i]); f.text(700, 146 + i * 50, t, 17)
        entry(5, f.save("l05-topo-sheet"), "អានផែនទីទីសណ្ឋាន",
              ["ពណ៌នីមួយៗតំណាងស្រទាប់ព័ត៌មាន (ស្តង់ដារបោះពុម្ពជាច្រើនពណ៌)។", "ក្រឡាចត្រង្គជួយប្រាប់ទីតាំង និងវាស់ចម្ងាយ។", "សញ្ញាសម្គាល់ផែនទីនៅគែមផែនទីពន្យល់និមិត្តសញ្ញាទាំងអស់។"], .08)

if __name__ == "__main__":
    for fn in (L01, L02, L03, L04, L05): fn()
    print(len(MANIFEST), "visuals")
