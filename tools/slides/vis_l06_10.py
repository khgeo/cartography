from vis_core import *
import numpy as np
from shapely.geometry import Polygon, Point

def jenks(vals, k):
    v = sorted(vals); n = len(v)
    mat1 = [[0] * (k + 1) for _ in range(n + 1)]; mat2 = [[float("inf")] * (k + 1) for _ in range(n + 1)]
    for i in range(1, k + 1): mat1[1][i] = 1; mat2[1][i] = 0
    for l in range(2, n + 1):
        s1 = s2 = w = 0
        for m in range(1, l + 1):
            i3 = l - m + 1; val = v[i3 - 1]; s2 += val * val; s1 += val; w += 1; var = s2 - s1 * s1 / w
            if i3 != 1:
                for j in range(2, k + 1):
                    if mat2[l][j] >= var + mat2[i3 - 1][j - 1]: mat1[l][j] = i3; mat2[l][j] = var + mat2[i3 - 1][j - 1]
        mat1[l][1] = 1; mat2[l][1] = var
    br = [0] * (k + 1); br[k] = v[-1]; count = k; kk = n
    while count > 1: idx = mat1[kk][count] - 2; br[count - 1] = v[idx]; kk = mat1[kk][count] - 1; count -= 1
    br[0] = v[0]; return br

DENS = [p["dens"] for p in PROV["prov"] if p["en"] != "Phnom Penh"]
ALLD = [p["dens"] for p in PROV["prov"]]
def breaks(method, k=5, vals=ALLD):
    v = sorted(vals)
    if method == "eq": lo, hi = v[0], v[-1]; return [lo + (hi - lo) * i / k for i in range(k + 1)]
    if method == "q": return [v[min(len(v) - 1, round(i * (len(v) - 1) / k))] for i in range(k + 1)]
    if method == "nb": return jenks(v, k)
    if method == "sd":
        m, s = np.mean(v), np.std(v); return [v[0]] + [m + s * z for z in (-.5, .5, 1.5)] + [v[-1]]
def colfor(br, pal):
    return lambda d: pal[max(0, min(len(pal) - 1, sum(1 for b in br[1:-1] if d > b)))]
def lab(br):
    return [f"{kh(round(br[i]))}–{kh(round(br[i+1]))}" for i in range(len(br) - 1)]

def L06():
    # Bertin variables grid
    f = Fig(1000, 560).title("អថេរមើលឃើញរបស់ Bertin", "ចំណុច · បន្ទាត់ · ផ្ទៃ × ទំហំ រាង តម្លៃ ពណ៌ ទិស វាយនភាព")
    vars_ = ["ទំហំ", "រាង", "តម្លៃពន្លឺ", "ពណ៌ (hue)", "ទិស", "វាយនភាព"]; rows = ["ចំណុច", "បន្ទាត់", "ផ្ទៃ"]
    for j, v in enumerate(vars_): f.text(200 + j * 130, 105, v, 15, IND, "middle", "bold")
    for i, r in enumerate(rows): f.text(60, 175 + i * 140, r, 17, INK, weight="bold")
    greys = ["#e0e0e0", "#9e9e9e", "#424242"]; hues = ["#e53935", "#1e88e5", "#43a047"]
    for i in range(3):
        y = 170 + i * 140
        for j in range(6):
            x = 200 + j * 130
            for t in range(3):
                xx = x - 40 + t * 40
                if i == 0:
                    if j == 0: f.circle(xx, y, 5 + t * 5, "#546e7a")
                    elif j == 1: [f.circle(xx, y, 9, "#546e7a"), f.rect(xx - 9, y - 9, 18, 18, "#546e7a"), f.path(f"M{xx} {y-11} L{xx+10} {y+8} L{xx-10} {y+8}Z", "#546e7a")][t]
                    elif j == 2: f.circle(xx, y, 10, greys[t], "#616161", .6)
                    elif j == 3: f.circle(xx, y, 10, hues[t])
                    elif j == 4: f.add(f'<rect x="{xx-3}" y="{y-12}" width="6" height="24" fill="#546e7a" transform="rotate({t*45} {xx} {y})"/>')
                    else: f.circle(xx, y, 11, "none", "#546e7a", 1); [f.line(xx - 8 + q * 4, y - 8, xx - 8 + q * 4, y + 8, "#546e7a", .8) for q in range(t * 2 + 1)]
                elif i == 1:
                    y1, y2 = y - 25 + t * 25, y - 25 + t * 25
                    if j == 0: f.line(x - 50, y1, x + 50, y2, "#546e7a", 1 + t * 3)
                    elif j == 1: f.line(x - 50, y1, x + 50, y2, "#546e7a", 3, ["", "8 5", "2 4"][t])
                    elif j == 2: f.line(x - 50, y1, x + 50, y2, greys[t], 5)
                    elif j == 3: f.line(x - 50, y1, x + 50, y2, hues[t], 5)
                    elif j == 4: f.line(x - 30 + t * 10, y + 25, x + 20 - t * 10 + t * 20, y - 25, "#546e7a", 3)
                    else: f.line(x - 50, y1, x + 50, y2, "#546e7a", 5, ["", "1 3", "10 3 2 3"][t])
            if i == 2:
                if j == 0: [f.rect(x - 48 + t * 34, y - 10 * (t + 1), 28, 20 * (t + 1), "#90a4ae") for t in range(3)]
                elif j == 1: f.rect(x - 50, y - 25, 45, 50, "#90a4ae"); f.circle(x + 25, y, 25, "#90a4ae")
                else:
                    for t in range(3):
                        xx = x - 50 + t * 34; fill = greys[t] if j == 2 else (hues[t] if j == 3 else "#cfd8dc"); f.rect(xx, y - 25, 30, 50, fill, "#607d8b", .6)
                        if j == 4:
                            for q in range(-2, 4): f.line(xx + q * 10, y + 25, xx + q * 10 + [0, 12, 25][t], y - 25, "#607d8b", .8)
                        if j == 5:
                            for q in range(1, 2 + t * 2): f.line(xx, y - 25 + q * 50 / (2 + t * 2), xx + 30, y - 25 + q * 50 / (2 + t * 2), "#607d8b", .8)
    entry(6, f.save("l06-bertin"), "អថេរមើលឃើញ Bertin",
          ["ទំហំ និងតម្លៃពន្លឺ បង្ហាញលំដាប់ (ច្រើន–តិច)។", "រាង និងពណ៌ (hue) បង្ហាញប្រភេទខុសគ្នា មិនមែនលំដាប់ទេ។", "ជ្រើសអថេរឲ្យត្រូវនឹងកម្រិតទិន្នន័យ៖ nominal · ordinal · interval/ratio។"], .05)
    # data levels vs variable table-like
    f = Fig(1000, 420).title("អថេរណាសមនឹងទិន្នន័យណា?")
    heads = ["", "Nominal (ប្រភេទ)", "Ordinal (លំដាប់)", "បរិមាណ"]; rowsv = [("ទំហំ", "✗", "✓", "✓✓"), ("តម្លៃពន្លឺ", "✗", "✓✓", "✓"), ("ពណ៌ (hue)", "✓✓", "✗", "✗"), ("រាង", "✓✓", "✗", "✗"), ("វាយនភាព", "✓", "✓", "✗")]
    for j, h in enumerate(heads): f.text(150 + j * 230, 100, h, 17, IND, "middle", "bold")
    for i, r in enumerate(rowsv):
        y = 150 + i * 50; f.rect(40, y - 30, 920, 44, "#f5f6fc" if i % 2 else "#fff")
        for j, c in enumerate(r): f.text(150 + j * 230, y, c, 20 if j else 17, {"✗": "#c62828", "✓": "#f9a825", "✓✓": "#2e7d32"}.get(c, INK), "middle", "bold" if j else "normal")
    entry(6, f.save("l06-variables-table"), "ផ្គូផ្គងអថេរមើលឃើញជាមួយកម្រិតទិន្នន័យ",
          ["✓✓ = ល្អបំផុត · ✓ = ប្រើបាន · ✗ = បំភាន់។", "ពណ៌ក្រហម–ខៀវ–បៃតង មិនបង្ហាញថាអ្វី «ច្រើនជាង» ទេ។", "សម្រាប់ដង់ស៊ីតេ ប្រើតម្លៃពន្លឺ (ពណ៌តែមួយ ពីស្រាលទៅដិត)។"], .12)
    # point symbols on real lab layers (schools/health/roads)
    import json as js
    D = os.path.join(DOCS, "assets/data/lab-01/")
    try:
        roads = js.load(open(D + "roads.geojson")); schools = js.load(open(D + "schools.geojson")); health = js.load(open(D + "health.geojson")); water = js.load(open(D + "water.geojson")); comm = js.load(open(D + "communes.geojson"))
        allxy = [c for ft in comm["features"] for r in rings_of(ft["geometry"]) for c in r]
        minx, maxx = min(a for a, b in allxy), max(a for a, b in allxy); miny, maxy = min(b for a, b in allxy), max(b for a, b in allxy)
        s = min(560 / (maxx - minx), 440 / (maxy - miny)); T = lambda x, y: (60 + (x - minx) * s, 90 + (maxy - y) * s)
        f = Fig(1000, 560).title("និមិត្តសញ្ញាចំណុច បន្ទាត់ និងផ្ទៃ", "ស្រទាប់លំហាត់ទី១ · ឃុំគំរូ")
        for ft in comm["features"]:
            for r in rings_of(ft["geometry"]): f.path("M" + " L".join("%.1f %.1f" % T(*c) for c in r) + "Z", "#f1f8e9", "#9e9e9e", .8)
        for ft in water["features"]:
            for r in rings_of(ft["geometry"]):
                d = "M" + " L".join("%.1f %.1f" % T(*c) for c in r); poly = ft["geometry"]["type"].endswith("Polygon")
                f.path(d + ("Z" if poly else ""), "#bbdefb" if poly else "none", "#1e88e5", 1.2)
        for ft in roads["features"]:
            prim = "Primary" in str(ft["properties"].get("Type"))
            for r in rings_of(ft["geometry"]): f.path("M" + " L".join("%.1f %.1f" % T(*c) for c in r), "none", "#c62828" if prim else "#8d6e63", 3 if prim else 1.2)
        for ft in schools["features"]: x, y = T(*ft["geometry"]["coordinates"]); f.rect(x - 6, y - 6, 12, 12, "#1565c0", "#fff", 1.2)
        for ft in health["features"]: x, y = T(*ft["geometry"]["coordinates"]); f.circle(x, y, 8, "#fff", "#2e7d32", 2); f.line(x - 5, y, x + 5, y, "#2e7d32", 2); f.line(x, y - 5, x, y + 5, "#2e7d32", 2)
        lx = 680
        f.rect(lx, 150, 16, 16, "#1565c0"); f.text(lx + 26, 164, "សាលារៀន (ចំណុច · រាងការ៉េ)", 15)
        f.circle(lx + 8, 200, 8, "#fff", "#2e7d32", 2); f.text(lx + 26, 205, "មណ្ឌលសុខភាព (ចំណុច · សញ្ញា +)", 15)
        f.line(lx, 240, lx + 18, 240, "#c62828", 3); f.text(lx + 26, 245, "ផ្លូវធំ (បន្ទាត់ដិត)", 15)
        f.line(lx, 280, lx + 18, 280, "#8d6e63", 1.2); f.text(lx + 26, 285, "ផ្លូវតូច (បន្ទាត់ស្ដើង)", 15)
        f.rect(lx, 312, 18, 14, "#bbdefb", "#1e88e5"); f.text(lx + 26, 325, "ទឹក (ផ្ទៃ/បន្ទាត់ខៀវ)", 15)
        f.rect(lx, 352, 18, 14, "#f1f8e9", "#9e9e9e"); f.text(lx + 26, 365, "ព្រំឃុំ (ផ្ទៃ)", 15)
        entry(6, f.save("l06-symbols-lab"), "និមិត្តសញ្ញាលើផែនទីពិត",
              ["ចំណុច បន្ទាត់ ផ្ទៃ ត្រូវមានរចនាខុសគ្នាច្បាស់។", "ផ្លូវធំ និងផ្លូវតូច បែងចែកដោយទទឹង (ទំហំ) និងពណ៌។", "ស្រទាប់ផ្ទៃ (ឃុំ) ស្រាលបំផុត ដើម្បីទុកជាផ្ទៃខាងក្រោយ។"], .3)
    except Exception as e:
        print("lab layers skipped", e)
    # visual hierarchy good vs bad
    f = Fig(1000, 520).title("ឋានានុក្រមមើលឃើញ៖ ខ្សោយ ធៀបនឹង ល្អ")
    col = classify(0, [0, 50, 100, 200, 400], SEQ)
    prov_map(f, 30, 100, 1.45, fill=lambda p: QUAL[hash(p["en"]) % 8], stroke="#000", sw=1.6, roads=True); f.text(245, 500, "គ្រប់យ៉ាងដិតស្មើគ្នា → រកប្រធានបទមិនឃើញ", 15, "#c62828", "middle", "bold")
    prov_map(f, 520, 100, 1.45, fill=lambda p: col(p["dens"]), stroke="#fff", sw=.6)
    for r in PROV["roads"]: f.path("M" + " L".join(f"{520 + x * 1.45:.1f} {100 + y * 1.45:.1f}" for x, y in r), "none", "#9e9e9e", .5, .6)
    f.text(735, 500, "ប្រធានបទដិត · ផ្ទៃខាងក្រោយស្រាល", 15, "#2e7d32", "middle", "bold")
    entry(6, f.save("l06-hierarchy"), "ឋានានុក្រមមើលឃើញ",
          ["ផែនទីឆ្វេង៖ ពណ៌ចៃដន្យ ព្រំខ្មៅដិត និងផ្លូវក្រហម ប្រកួតគ្នាទាក់ទាញភ្នែក។", "ផែនទីស្ដាំ៖ ប្រធានបទ (ដង់ស៊ីតេ) លេចធ្លោ ផ្លូវ និងព្រំស្រាល។", "សួរ៖ តើអ្នកអានឃើញអ្វីមុនគេ? វាគួរជាប្រធានបទ។"], .7)
    # figure-ground
    f = Fig(1000, 460).title("ផ្ទៃមុខ និងផ្ទៃក្រោយ (figure–ground)")
    prov_map(f, 30, 90, 1.25, fill=lambda p: "#bdbdbd", stroke="#bdbdbd", lake=False); f.rect(30, 90, 380, 320, "none", "#bdbdbd"); f.text(215, 440, "ដីនិងសមុទ្រពណ៌ដូចគ្នា", 15, "#c62828", "middle")
    f.rect(520, 90, 440, 330, "#e3f2fd"); prov_map(f, 540, 90, 1.25, fill=lambda p: "#fffde7", stroke="#bdbdbd"); f.text(740, 440, "ទឹកខៀវ · ដីភ្លឺ · ព្រំស្ដើង", 15, "#2e7d32", "middle")
    entry(6, f.save("l06-figure-ground"), "ផ្ទៃមុខ និងផ្ទៃក្រោយ",
          ["ភ្នែកត្រូវដឹងភ្លាមថា «ដី» នៅឯណា និង «ទឹក» នៅឯណា។", "ពណ៌ទឹកស្រាលខៀវ និងដីភ្លឺ ជួយបំបែកផ្ទៃមុខ។", "ស្រមោលស្រាល ឬគែមមួយជុំ ក៏ជួយឲ្យតំបន់សិក្សាលេចឡើង។"], .78)
    # proportional symbol sizing quick look
    f = Fig(1000, 420).title("ទំហំសញ្ញា៖ តាមផ្ទៃ មិនមែនតាមកាំ")
    for i, v in enumerate([1, 4, 9]):
        x = 150 + i * 150; f.circle(x, 230, 20 * math.sqrt(v), "#ffb74d", "#e65100"); f.text(x, 330, f"តម្លៃ {kh(v)}", 15, INK, "middle")
    f.text(300, 370, "ផ្ទៃសមាមាត្រ (ត្រឹមត្រូវ)", 16, "#2e7d32", "middle", "bold")
    for i, v in enumerate([1, 4, 9]):
        x = 580 + i * 150; f.circle(x, 230, min(90, 20 * v / 1.8), "#e0e0e0", "#9e9e9e"); f.text(x, 330, f"តម្លៃ {kh(v)}", 15, INK, "middle")
    f.text(730, 370, "កាំសមាមាត្រ (ផ្ទៃធំហួស)", 16, "#c62828", "middle", "bold")
    entry(6, f.save("l06-circle-sizing"), "ធ្វើមាត្រដ្ឋានសញ្ញាឲ្យត្រូវ",
          ["កាំ ∝ √តម្លៃ ដូច្នេះផ្ទៃរង្វង់ ∝ តម្លៃ។", "បើកាំ ∝ តម្លៃ តម្លៃ ៩ មើលទៅធំជាង ៨១ ដង ជំនួសឲ្យ ៩ ដង។", "QGIS៖ Size scale method = Flannery ឬ Area (មេរៀនទី១០)។"], .45)

def L07():
    methods = [("eq", "ចន្លោះស្មើ (Equal interval)"), ("q", "Quantile"), ("nb", "Natural breaks (Jenks)"), ("sd", "គម្លាតស្តង់ដារ")]
    # histogram with breaks
    f = Fig(1000, 560).title("ទិន្នន័យដង់ស៊ីតេខេត្ត និងព្រំថ្នាក់បួនរបៀប", "២៥ ខេត្ត · នាក់/គម² · អ័ក្សលោការីត")
    v = sorted(ALLD); lg = lambda d: math.log10(max(d, 1))
    X0, W = 120, 820
    xp = lambda d: X0 + (lg(d) - lg(5)) / (lg(2500) - lg(5)) * W
    for i, (m, nm) in enumerate(methods):
        y = 110 + i * 105; f.text(40, y + 8, nm, 15, IND, weight="bold"); f.line(X0, y + 50, X0 + W, y + 50, "#b0bec5", 1)
        for d in v: f.circle(xp(d), y + 40, 6, "#546e7a", op=.8)
        for b in breaks(m)[1:-1]: f.line(xp(b), y + 18, xp(b), y + 62, "#e65100", 2.5)
    for d in (10, 50, 100, 500, 2000): f.text(xp(d), 540, kh(d), 13, "#607d8b", "middle")
    entry(7, f.save("l07-breaks-strip"), "ព្រំថ្នាក់បួនរបៀប លើទិន្នន័យដូចគ្នា",
          ["ចំណុចនីមួយៗជាខេត្តមួយ · បន្ទាត់ទឹកក្រូចជាព្រំថ្នាក់។", "ចន្លោះស្មើ ដាក់ខេត្តស្ទើរទាំងអស់ក្នុងថ្នាក់ទីមួយ ព្រោះភ្នំពេញខ្ពស់ខ្លាំង។", "Quantile ដាក់ខេត្តស្មើគ្នាក្នុងថ្នាក់នីមួយៗ ទោះតម្លៃជិតគ្នាក៏បំបែក។"], .3)
    # four choropleths
    f = Fig(1000, 560).title("ផែនទីបួន ទិន្នន័យដូចគ្នា", "ដង់ស៊ីតេប្រជាជន ២០១៩ · ៥ ថ្នាក់")
    for i, (m, nm) in enumerate(methods):
        x, y = 20 + (i % 2) * 490, 80 + (i // 2) * 240; br = breaks(m); c = colfor(br, SEQ)
        prov_map(f, x, y, .82, fill=lambda p: c(p["dens"]), sw=.5); f.text(x + 260, y + 30, nm, 15, IND, weight="bold")
        for j, (cc, l) in enumerate(zip(SEQ, lab(br))): f.rect(x + 260, y + 50 + j * 24, 18, 16, cc, "#999", .5); f.text(x + 285, y + 63 + j * 24, l, 12)
    entry(7, f.save("l07-four-maps"), "វិធីចាត់ថ្នាក់ផ្លាស់ប្ដូរសារ",
          ["ទិន្នន័យដូចគ្នា ប៉ុន្តែផែនទីនីមួយៗ «និយាយ» ខុសគ្នា។", "ចន្លោះស្មើ៖ មានតែភ្នំពេញលេចធ្លោ។ Quantile៖ ប្រទេសមើលទៅចែកស្មើ។", "ជ្រើសវិធីតាមរូបរាងការចែកចាយ និងសំណួរ ហើយប្រាប់ពីវិធីក្នុងសញ្ញាសម្គាល់។"], .45)
    # histogram of distribution (skew)
    f = Fig(1000, 440).title("មើលទិន្នន័យមុនចាត់ថ្នាក់៖ អ៊ីស្តូក្រាម", "ការចែកចាយខ្ទេចឆ្វេង (skewed)")
    bins = [0, 50, 100, 150, 200, 250, 300, 400, 2100]; cnt = np.histogram(ALLD, bins=bins)[0]
    for i, c in enumerate(cnt):
        x = 100 + i * 100; f.rect(x, 380 - c * 28, 80, c * 28, "#7986cb"); f.text(x + 40, 372 - c * 28, kh(c), 14, INK, "middle"); f.text(x + 40, 402, f"{kh(bins[i])}–{kh(bins[i+1])}", 12, "#607d8b", "middle")
    f.text(900, 150, "ភ្នំពេញ ២ ០៤៩", 15, "#c62828", "end", "bold"); f.text(100, 430, "ដង់ស៊ីតេ (នាក់/គម²)", 14, INK)
    entry(7, f.save("l07-histogram"), "រូបរាងនៃការចែកចាយ",
          ["ខេត្តភាគច្រើនមានដង់ស៊ីតេ < ២៥០ ខណៈភ្នំពេញលើស ២ ០០០។", "តម្លៃខុសប្រក្រតី (outlier) បំផ្លាញ «ចន្លោះស្មើ»។", "ពិចារណាដាក់ outlier ជាថ្នាក់ដាច់ដោយឡែក ឬប្រើ Natural breaks។"], .6)
    # number of classes 3 5 7
    f = Fig(1000, 440).title("ចំនួនថ្នាក់៖ ៣ · ៥ · ៧", "Natural breaks")
    for i, k in enumerate([3, 5, 7]):
        br = breaks("nb", k); pal = [SEQ[0], SEQ[2], SEQ[4]] if k == 3 else (SEQ if k == 5 else ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"])
        c = colfor(br, pal); prov_map(f, 20 + i * 330, 90, 1.0, fill=lambda p: c(p["dens"]), sw=.5); f.text(170 + i * 330, 380, f"{kh(k)} ថ្នាក់", 17, IND, "middle", "bold")
    f.text(500, 420, "៣ ថ្នាក់៖ សាមញ្ញ ប៉ុន្តែបាត់លម្អិត · ៧ ថ្នាក់៖ ពណ៌ជិតគ្នាពេក បែងចែកពិបាក", 15, "#607d8b", "middle")
    entry(7, f.save("l07-class-count"), "ថ្នាក់ប៉ុន្មានគឺល្អ?",
          ["អ្នកអានបែងចែកពណ៌ក្នុងឈុតតែមួយបានប្រហែល ៥–៧។", "ថ្នាក់តិច៖ សារច្បាស់ ប៉ុន្តែលាក់ភាពខុសគ្នា។", "ចំនួនខេត្ត ២៥ មិនគួរលើស ៥ ថ្នាក់ទេ។"], .75)
    # ethics: two stories same data
    f = Fig(1000, 460).title("ទិន្នន័យដូចគ្នា រឿងពីរ", "ព្រំថ្នាក់ដែលជ្រើសដោយចេតនា")
    c1 = colfor([0, 400, 800, 1200, 1600, 2100], SEQ); c2 = colfor([0, 30, 60, 100, 200, 2100], SEQ)
    prov_map(f, 20, 90, 1.25, fill=lambda p: c1(p["dens"]), sw=.5); f.text(210, 420, "«ប្រជាជនរស់នៅតិចស្ទើរគ្រប់កន្លែង»", 15, "#c62828", "middle", "bold")
    prov_map(f, 520, 90, 1.25, fill=lambda p: c2(p["dens"]), sw=.5); f.text(710, 420, "«ប្រទេសពេញដោយមនុស្ស»", 15, "#c62828", "middle", "bold")
    entry(7, f.save("l07-two-stories"), "សីលធម៌នៃការចាត់ថ្នាក់",
          ["ផែនទីទាំងពីរពិតតាមលេខ ប៉ុន្តែបង្កើតចំណាប់អារម្មណ៍ផ្ទុយគ្នា។", "ត្រូវជ្រើសព្រំថ្នាក់ដោយហេតុផល ហើយសរសេរវាក្នុងសញ្ញាសម្គាល់។", "បើមិនប្រាកដ សាកល្បងវិធីច្រើន ហើយប្រៀបធៀបមុនបោះពុម្ព។"], .9)

def L08():
    # HSV dimensions
    f = Fig(1000, 460).title("វិមាត្របីនៃពណ៌", "Hue · Value (ពន្លឺ) · Saturation (ភាពឆ្អិន)")
    for i in range(12): f.circle(80 + i * 72, 150, 28, f"hsl({i*30},75%,50%)")
    f.text(40, 110, "Hue", 18, IND, weight="bold")
    for i in range(9): f.rect(40 + i * 100, 250, 90, 60, f"hsl(225,60%,{92-i*9}%)")
    f.text(40, 240, "Value (តម្លៃពន្លឺ)", 18, IND, weight="bold")
    for i in range(9): f.rect(40 + i * 100, 370, 90, 60, f"hsl(20,{8+i*11}%,55%)")
    f.text(40, 360, "Saturation", 18, IND, weight="bold")
    entry(8, f.save("l08-dimensions"), "Hue · Value · Saturation",
          ["Hue (ពណ៌) សម្រាប់ប្រភេទ៖ ទឹក ព្រៃ ទីក្រុង។", "Value (ពន្លឺ) សម្រាប់លំដាប់៖ ស្រាល = តិច · ដិត = ច្រើន។", "Saturation ខ្ពស់ទាក់ទាញភ្នែក៖ ប្រើសម្រាប់ចំណុចសំខាន់ប៉ុណ្ណោះ។"], .05)
    # three scheme types on maps
    f = Fig(1000, 500).title("ឈុតពណ៌បីប្រភេទ លើផែនទីកម្ពុជា")
    br = breaks("nb"); c = colfor(br, BLU)
    prov_map(f, 10, 100, 1.0, fill=lambda p: c(p["dens"]), sw=.5); f.text(160, 380, "Sequential", 17, IND, "middle", "bold"); f.text(160, 404, "ដង់ស៊ីតេ (តិច → ច្រើន)", 13, "#607d8b", "middle")
    mean = 170; dc = lambda d: DIV[6] if d < mean * .4 else DIV[5] if d < mean * .8 else DIV[3] if d < mean * 1.2 else DIV[1] if d < mean * 2 else DIV[0]
    prov_map(f, 340, 100, 1.0, fill=lambda p: dc(p["dens"]), sw=.5); f.text(490, 380, "Diverging", 17, IND, "middle", "bold"); f.text(490, 404, "ធៀបនឹងមធ្យមជាតិ", 13, "#607d8b", "middle")
    zones = sorted(set(p["zone"] for p in PROV["prov"])); zc = {z: QUAL[i] for i, z in enumerate(zones)}
    prov_map(f, 670, 100, 1.0, fill=lambda p: zc[p["zone"]], sw=.5); f.text(820, 380, "Qualitative", 17, IND, "middle", "bold"); f.text(820, 404, "តំបន់ភូមិសាស្ត្រ (ប្រភេទ)", 13, "#607d8b", "middle")
    for i, z in enumerate(zones): f.rect(700 + (i % 3) * 100, 430 + (i // 3) * 22, 14, 14, zc[z]); f.text(718 + (i % 3) * 100, 442 + (i // 3) * 22, z, 11)
    entry(8, f.save("l08-schemes-maps"), "Sequential · Diverging · Qualitative",
          ["Sequential៖ ពណ៌តែមួយពីស្រាលទៅដិត សម្រាប់តម្លៃកើនជាលំដាប់។", "Diverging៖ ពណ៌ពីរផ្ទុយគ្នាជុំវិញតម្លៃកណ្ដាលដែលមានន័យ (មធ្យម សូន្យ)។", "Qualitative៖ ពណ៌ខុសគ្នាដែលមានពន្លឺស្រដៀងគ្នា សម្រាប់ប្រភេទ។"], .25)
    # rainbow vs sequential
    rb = ["#9e0142", "#f46d43", "#fee08b", "#abdda4", "#3288bd"]
    f = Fig(1000, 460).title("ឈុតពណ៌ឥន្ទធនូ ធៀបនឹង Sequential")
    c = colfor(br, rb); prov_map(f, 20, 90, 1.25, fill=lambda p: c(p["dens"]), sw=.5); f.text(210, 420, "ឥន្ទធនូ៖ លំដាប់មិនច្បាស់", 16, "#c62828", "middle", "bold")
    c = colfor(br, SEQ); prov_map(f, 520, 90, 1.25, fill=lambda p: c(p["dens"]), sw=.5); f.text(710, 420, "Sequential៖ ដិត = ច្រើន", 16, "#2e7d32", "middle", "bold")
    entry(8, f.save("l08-rainbow"), "ហេតុអ្វីមិនប្រើឥន្ទធនូ",
          ["ឥន្ទធនូមិនមានលំដាប់ពន្លឺ៖ លឿងភ្លឺជាងក្រហម និងខៀវ។", "អ្នកអានត្រូវមើលសញ្ញាសម្គាល់ជានិច្ច ដើម្បីដឹងថាពណ៌ណាច្រើន។", "Sequential អានបានភ្លាម ទោះគ្មានសញ្ញាសម្គាល់ក៏ដោយ។"], .35)
    # colour-blind simulation
    def deut(hexc):
        r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        R = .625 * r + .375 * g; G = .7 * r + .3 * g; B = .3 * g + .7 * b
        return "#%02x%02x%02x" % tuple(int(max(0, min(1, v)) * 255) for v in (R, G, B))
    rg = ["#1a9850", "#91cf60", "#ffffbf", "#fc8d59", "#d73027"]
    f = Fig(1000, 520).title("ភ្នែកខ្វះពណ៌ក្រហម–បៃតង (Deuteranopia)", "ការក្លែងធ្វើ · ប្រហែល ៨% នៃបុរស")
    for i, (pal, nm) in enumerate([(rg, "ក្រហម–បៃតង"), (VIR, "Viridis")]):
        c = colfor(br, pal); cs = colfor(br, [deut(x) for x in pal])
        prov_map(f, 20 + i * 490, 90, .8, fill=lambda p: c(p["dens"]), sw=.4); prov_map(f, 250 + i * 490, 90, .8, fill=lambda p: cs(p["dens"]), sw=.4)
        f.text(130 + i * 490, 310, "ភ្នែកធម្មតា", 13, "#607d8b", "middle"); f.text(360 + i * 490, 310, "ក្លែងធ្វើ Deuteranopia", 13, "#607d8b", "middle")
        f.text(245 + i * 490, 350, nm, 18, "#c62828" if i == 0 else "#2e7d32", "middle", "bold")
    f.text(500, 420, "ឈុតក្រហម–បៃតង បាត់ភាពខុសគ្នា · Viridis នៅតែអានបាន", 16, INK, "middle")
    entry(8, f.save("l08-colourblind"), "ផែនទីសម្រាប់អ្នកខ្វះពណ៌",
          ["ក្រហម និងបៃតង ក្លាយជាពណ៌ត្នោតស្រដៀងគ្នាចំពោះអ្នកខ្វះពណ៌។", "ប្រើឈុតដែលពន្លឺប្រែប្រួលជាលំដាប់ (Viridis, ColorBrewer colorblind-safe)។", "ពិនិត្យដោយ Color Oracle ឬ QGIS View → Preview Mode។"], .55)
    # grayscale print check
    def gray(hexc):
        r, g, b = [int(hexc[i:i + 2], 16) for i in (1, 3, 5)]; y = int(.299 * r + .587 * g + .114 * b); return "#%02x%02x%02x" % (y, y, y)
    f = Fig(1000, 460).title("ពិនិត្យការបោះពុម្ពស ខ្មៅ")
    for i, (pal, nm) in enumerate([(QUAL[:5], "Qualitative ពន្លឺដូចគ្នា"), (SEQ, "Sequential")]):
        c = colfor(br, [gray(x) for x in pal]); prov_map(f, 20 + i * 490, 90, 1.25, fill=lambda p: c(p["dens"]), sw=.5)
        f.text(210 + i * 490, 420, nm + (" → បាត់ព័ត៌មាន" if i == 0 else " → នៅតែអានបាន"), 15, "#c62828" if i == 0 else "#2e7d32", "middle", "bold")
    entry(8, f.save("l08-grayscale"), "ពណ៌លើក្រដាសស ខ្មៅ",
          ["ម៉ាស៊ីនថតចម្លងជាច្រើននៅសាលា និងក្រសួង បោះពុម្ពតែស ខ្មៅ។", "បើពន្លឺនៃពណ៌ស្រដៀងគ្នា ផែនទីបាត់ភាពខុសគ្នា។", "សាកល្បងបោះពុម្ពស ខ្មៅ ឬប្ដូរទៅ Grayscale មុនចែកចាយ។"], .85)
    # simultaneous contrast
    f = Fig(1000, 380).title("ពណ៌អាស្រ័យលើអ្វីនៅជុំវិញ", "ការ៉េកណ្ដាលទាំងពីរពណ៌ដូចគ្នា #9e9e9e")
    f.rect(100, 100, 350, 230, "#212121"); f.rect(225, 165, 100, 100, "#9e9e9e"); f.rect(550, 100, 350, 230, "#f5f5f5"); f.rect(675, 165, 100, 100, "#9e9e9e")
    entry(8, f.save("l08-contrast"), "ការប្រៀបធៀបពណ៌ជាប់គ្នា",
          ["ការ៉េលើផ្ទៃខ្មៅមើលទៅភ្លឺជាង ទោះពណ៌ដូចគ្នា។", "នៅលើ choropleth ខេត្តតូចមួយនៅកណ្ដាលខេត្តដិតៗ អាចអានខុសថ្នាក់។", "ព្រំស្ដើងពណ៌សជួយកាត់បន្ថយបញ្ហានេះ។"], .7)

def L09():
    # counts vs density
    f = Fig(1000, 480).title("ចំនួនសរុប ធៀបនឹងដង់ស៊ីតេ", "Choropleth ត្រូវប្រើអត្រា")
    bp = breaks("nb", 5, [p["pop"] for p in PROV["prov"]]); c1 = colfor(bp, SEQ); c2 = colfor(breaks("nb"), SEQ)
    prov_map(f, 20, 90, 1.25, fill=lambda p: c1(p["pop"]), sw=.5); f.text(210, 420, "ចំនួនប្រជាជន (ខុស)", 16, "#c62828", "middle", "bold")
    prov_map(f, 520, 90, 1.25, fill=lambda p: c2(p["dens"]), sw=.5); f.text(710, 420, "ដង់ស៊ីតេ = ប្រជាជន ÷ ផ្ទៃ (ត្រូវ)", 16, "#2e7d32", "middle", "bold")
    f.text(500, 460, "ខេត្តធំ (ឧ. បាត់ដំបង កំពង់ចាម) មើលទៅ «ច្រើន» ព្រោះផ្ទៃធំ មិនមែនព្រោះមនុស្សរស់នៅក្រាស់", 14, "#607d8b", "middle")
    entry(9, f.save("l09-count-vs-rate"), "ធ្វើឲ្យស្តង់ដារ៖ ចំនួន ធៀបនឹងអត្រា",
          ["ចំនួនសរុបលើ choropleth ធ្វើឲ្យខេត្តធំលេចធ្លោដោយមិនត្រឹមត្រូវ។", "ចែកដោយផ្ទៃ (ដង់ស៊ីតេ) ឬដោយប្រជាជន (ភាគរយ អត្រាក្នុង ១ ០០០ នាក់)។", "ចំនួនសរុបគួរបង្ហាញដោយសញ្ញាសមាមាត្រ (មេរៀនទី១០)។"], .2)
    # MAUP communes vs province
    f = Fig(1000, 500).title("បញ្ហា MAUP៖ ខេត្ត ធៀបនឹងឃុំ", "ខេត្តកំពង់ឆ្នាំង · ដង់ស៊ីតេ")
    kk = 250 / KC["W"]; brk = [0, 50, 100, 200, 400, 5000]; cc = colfor(brk, SEQ)
    for cm in KC["comm"]: f.path(pd(cm["r"], 60, 90, kk), cc(KC["prov_dens"]), "#fff", .3)
    for cm in KC["comm"]: f.path(pd(cm["r"], 560, 90, kk), cc(cm["dens"]), "#fff", .4)
    f.text(185, 420, f"ខេត្តទាំងមូល៖ {kh(KC['prov_dens'])} នាក់/គម²", 16, INK, "middle", "bold"); f.text(685, 420, "៦៩ ឃុំ៖ ៦ ដល់ ២ ៨២១ នាក់/គម²", 16, INK, "middle", "bold")
    f.legend_boxes(360, 150, SEQ, ["< ៥០", "៥០–១០០", "១០០–២០០", "២០០–៤០០", "> ៤០០"], "នាក់/គម²")
    entry(9, f.save("l09-maup"), "ឯកតាតំបន់ប្ដូរ លំនាំប្ដូរ",
          ["កម្រិតខេត្ត លាក់ភាពខុសគ្នាធំៗក្នុងខេត្ត។", "ក្រុងកំពង់ឆ្នាំង និងឃុំតាមដងទន្លេ ក្រាស់ជាងមធ្យមខេត្តរាប់សិបដង។", "សន្និដ្ឋានពីផែនទីអនុវត្តតែនៅកម្រិតឯកតាដែលបានវិភាគ។"], .6)
    # bivariate communes density × literacy
    f = Fig(1000, 520).title("ផែនទី Bivariate៖ ដង់ស៊ីតេ × អត្រាអក្ខរកម្ម", "ឃុំខេត្តកំពង់ឆ្នាំង · ៣ × ៣ ថ្នាក់")
    B3 = [["#e8e8e8", "#b5c0da", "#6c83b5"], ["#b8d6be", "#90b2b3", "#567994"], ["#73ae80", "#5a9178", "#2a5a5b"]]
    dq = np.quantile([c["dens"] for c in KC["comm"]], [1 / 3, 2 / 3]); lq = np.quantile([c["lit"] for c in KC["comm"]], [1 / 3, 2 / 3])
    for cm in KC["comm"]:
        a = int(np.searchsorted(dq, cm["dens"])); b = int(np.searchsorted(lq, cm["lit"])); f.path(pd(cm["r"], 60, 80, 300 / KC["W"] * 1.2), B3[b][a], "#fff", .4)
    for a in range(3):
        for b in range(3): f.rect(700 + a * 40, 300 - b * 40, 40, 40, B3[b][a])
    f.text(760, 360, "ដង់ស៊ីតេ →", 14, INK, "middle"); f.text(690, 260, "អក្ខរកម្ម →", 14, INK, "end", extra='transform="rotate(-90 690 260)"')
    entry(9, f.save("l09-bivariate"), "ផែនទីអថេរពីរ",
          ["ពណ៌នីមួយៗតំណាងបន្សំនៃអថេរពីរ។", "ជ្រុងងងឹត = ដង់ស៊ីតេខ្ពស់ និងអក្ខរកម្មខ្ពស់ (ជាទូទៅនៅទីប្រជុំជន)។", "ត្រូវការសញ្ញាសម្គាល់ការ៉េ ៣×៣ ហើយពិបាកអានសម្រាប់អ្នកចាប់ផ្ដើម។"], .85)
    # missing data
    f = Fig(1000, 440).title("តំណាងទិន្នន័យដែលខ្វះ")
    c = colfor(breaks("nb"), SEQ); miss = {"Pailin", "Kep", "Mondul Kiri"}
    prov_map(f, 20, 90, 1.2, fill=lambda p: "#ffffff" if p["en"] in miss else c(p["dens"]), stroke="#bdbdbd", sw=.6); f.text(200, 410, "ស = «តិច» ឬ «គ្មានទិន្នន័យ»?", 15, "#c62828", "middle", "bold")
    f.add('<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#757575" stroke-width="1.5"/></pattern></defs>')
    prov_map(f, 520, 90, 1.2, fill=lambda p: "url(#hatch)" if p["en"] in miss else c(p["dens"]), stroke="#fff", sw=.6)
    f.rect(840, 330, 22, 16, "url(#hatch)", "#757575"); f.text(868, 343, "គ្មានទិន្នន័យ", 13); f.text(700, 410, "គូសឆ្នូត និងមានក្នុងសញ្ញាសម្គាល់", 15, "#2e7d32", "middle", "bold")
    entry(9, f.save("l09-missing"), "ទិន្នន័យខ្វះត្រូវតែមើលឃើញ",
          ["ពណ៌សអាចត្រូវអានថាជាតម្លៃទាបបំផុត។", "ប្រើការគូសឆ្នូត ឬពណ៌ប្រផេះ ដែលមិនមែនជាផ្នែកនៃឈុតពណ៌។", "ពន្យល់ក្នុងសញ្ញាសម្គាល់ជានិច្ច៖ «គ្មានទិន្នន័យ»។"], .92)

def L10():
    pops = {p["en"]: p["pop"] for p in PROV["prov"]}
    # proportional circles
    f = Fig(1000, 560).title("សញ្ញាសមាមាត្រ៖ ប្រជាជនតាមខេត្ត", "ជំរឿន ២០១៩ · កាំ ∝ √ប្រជាជន")
    prov_map(f, 40, 80, 1.75, fill=lambda p: "#f5f5f5", stroke="#bdbdbd")
    order = sorted(PROV["prov"], key=lambda p: -p["pop"])
    for p in order:
        cx, cy = pcentre(p["en"]); f.circle(40 + cx * 1.75, 80 + cy * 1.75, math.sqrt(p["pop"]) / 45, "#ff9800", "#fff", 1, .8)
    for i, v in enumerate([1_400_000, 700_000, 100_000]):
        r = math.sqrt(v) / 45; f.circle(860, 460 - r, r, "none", "#e65100", 1.2); f.line(860, 460 - 2 * r, 930, 460 - 2 * r, "#e65100", .6); f.text(935, 464 - 2 * r, khn(v), 12)
    f.text(820, 330, "ប្រជាជន (នាក់)", 15, INK, weight="bold")
    entry(10, f.save("l10-prop-circles"), "សញ្ញាសមាមាត្រ",
          ["ផ្ទៃរង្វង់សមាមាត្រនឹងចំនួនប្រជាជន។", "រង្វង់ធំនៅខាងក្រោយ តូចនៅខាងមុខ ដើម្បីមិនបិទគ្នា។", "សញ្ញាសម្គាល់ជារង្វង់ជាន់គ្នា (nested) ជួយប្រៀបធៀបទំហំ។"], .1)
    # graduated vs proportional
    f = Fig(1000, 480).title("សញ្ញាសមាមាត្រ ធៀបនឹងសញ្ញាចាត់ថ្នាក់")
    prov_map(f, 20, 90, 1.2, fill=lambda p: "#f5f5f5", stroke="#bdbdbd"); prov_map(f, 520, 90, 1.2, fill=lambda p: "#f5f5f5", stroke="#bdbdbd")
    gb = [0, 300_000, 800_000, 1_200_000, 2e6]; gr = [5, 10, 16, 23]
    for p in order:
        cx, cy = pcentre(p["en"]); f.circle(20 + cx * 1.2, 90 + cy * 1.2, math.sqrt(p["pop"]) / 60, "#42a5f5", "#fff", 1, .85)
        g = gr[sum(1 for b in gb[1:-1] if p["pop"] > b)]; f.circle(520 + cx * 1.2, 90 + cy * 1.2, g, "#ab47bc", "#fff", 1, .85)
    f.text(210, 420, "សមាមាត្រ៖ ទំហំបន្ត", 16, IND, "middle", "bold"); f.text(710, 420, "ចាត់ថ្នាក់៖ ៤ ទំហំ", 16, IND, "middle", "bold")
    entry(10, f.save("l10-graduated"), "បន្ត ឬចាត់ថ្នាក់?",
          ["សមាមាត្រ៖ រក្សាលម្អិត ប៉ុន្តែអ្នកអានប៉ាន់ទំហំរង្វង់មិនសូវត្រូវ។", "ចាត់ថ្នាក់៖ ងាយអាន និងប្រៀបធៀបនឹងសញ្ញាសម្គាល់ ប៉ុន្តែបាត់ភាពខុសគ្នាក្នុងថ្នាក់។", "ជ្រើសតាមគោលបំណង៖ ប្រៀបធៀបទូទៅ ឬអានតម្លៃ។"], .35)
    # dot density
    f = Fig(1000, 560).title("ផែនទីចំណុចដង់ស៊ីតេ", "១ ចំណុច = ២០ ០០០ នាក់ · ចំណុចដាក់ចៃដន្យក្នុងខេត្ត")
    prov_map(f, 40, 80, 1.75, fill=lambda p: "#fafafa", stroke="#bdbdbd")
    rng = np.random.default_rng(11)
    for p in PROV["prov"]:
        polys = [Polygon(r) for r in p["r"] if len(r) > 3]; big = max(polys, key=lambda g: g.area); minx, miny, maxx, maxy = big.bounds
        nd = int(p["pop"] / 20000); c = 0; tries = 0
        while c < nd and tries < nd * 60:
            tries += 1; x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
            if big.contains(Point(x, y)): f.circle(40 + x * 1.75, 80 + y * 1.75, 1.5, "#37474f"); c += 1
    f.circle(820, 300, 2, "#37474f"); f.text(832, 305, "= ២០ ០០០ នាក់", 15)
    entry(10, f.save("l10-dot-density"), "ចំណុចដង់ស៊ីតេ",
          ["ចំណុចបង្ហាញទាំងចំនួន និងការចែកចាយ ក្នុងពេលតែមួយ។", "ទីតាំងចំណុចមិនមែនជាផ្ទះពិតទេ៖ ដាក់ចៃដន្យក្នុងឯកតា។", "ជ្រើសតម្លៃចំណុចឲ្យចំណុចចាប់ផ្ដើមប៉ះគ្នានៅតំបន់ក្រាស់បំផុត។"], .6)
    # pies (zones share)
    f = Fig(1000, 460).title("ផែនទីដ្យាក្រាម៖ សមាមាត្រប្រជាជនក្នុងតំបន់ និងក្រុង (គំរូ)")
    prov_map(f, 40, 80, 1.4, fill=lambda p: "#fafafa", stroke="#bdbdbd")
    for p in PROV["prov"][:: 2]:
        cx, cy = pcentre(p["en"]); x, y = 40 + cx * 1.4, 80 + cy * 1.4; r = math.sqrt(p["pop"]) / 38
        urb = min(.95, .1 + p["dens"] / 2200 + .1); a = urb * 2 * math.pi
        f.circle(x, y, r, "#a5d6a7", "#fff", 1)
        f.path(f"M{x:.1f} {y:.1f} L{x:.1f} {y-r:.1f} A{r:.1f} {r:.1f} 0 {1 if a>math.pi else 0} 1 {x+r*math.sin(a):.1f} {y-r*math.cos(a):.1f}Z", "#ef6c00", "#fff", 1)
    f.legend_boxes(700, 200, ["#ef6c00", "#a5d6a7"], ["ទីក្រុង", "ជនបទ"]); f.text(700, 300, "ទិន្នន័យបំណែកជាគំរូបង្រៀន", 13, "#90a4ae")
    entry(10, f.save("l10-pies"), "ដ្យាក្រាមលើផែនទី",
          ["ទំហំ = ចំនួនសរុប · បំណែក = សមាមាត្រ។", "ប្រើតែ ២–៣ បំណែក បើមិនដូច្នេះ ពិបាកអាន។", "ជម្រើសផ្សេង៖ ផែនទីពីរដាច់ពីគ្នា ឬរបារតូចៗ។"], .8)
    # circle radius error
    f = Fig(1000, 400).title("អ្នកអានប៉ាន់ទំហំរង្វង់តិចជាងការពិត", "តម្លៃ A ធំជាង B ១០ ដង")
    f.circle(250, 230, 20, "#90caf9", "#1565c0"); f.circle(450, 230, 63, "#90caf9", "#1565c0"); f.text(250, 330, "B = ១០", 16, INK, "middle"); f.text(450, 330, "A = ១០០", 16, INK, "middle")
    f.text(620, 180, "អ្នកអានភាគច្រើនប៉ាន់ថា A", 17); f.text(620, 210, "ធំជាង B ប្រហែល ៦–៧ ដង", 17, "#c62828", weight="bold"); f.text(620, 260, "Flannery៖ កាំ ∝ តម្លៃ^០,៥៧", 17, IND); f.text(620, 290, "ដើម្បីប៉ះប៉ូវការយល់ឃើញ", 15, "#607d8b")
    entry(10, f.save("l10-perception"), "ការយល់ឃើញទំហំ",
          ["ភ្នែកមនុស្សប៉ាន់ផ្ទៃរង្វង់ធំៗ តិចជាងការពិត។", "Flannery ពង្រីករង្វង់ធំបន្តិច ដើម្បីប៉ះប៉ូវ។", "សញ្ញាសម្គាល់ជាមួយរង្វង់គំរូ ៣ ទំហំ ជួយការប៉ាន់ស្មានច្រើនជាងគេ។"], .3)

if __name__ == "__main__":
    for fn in (L06, L07, L08, L09, L10): fn()
    print(len(MANIFEST), "visuals")
