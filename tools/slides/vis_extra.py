from vis_core import *
import numpy as np
from PIL import Image
RD = "/home/claude/realdata"

def extra():
    # L1 real image at 3 extents (scale & abstraction with imagery)
    full = os.path.join(RD, "l8_true_full.png")
    if os.path.exists(full):
        im = Image.open(full).convert("RGB"); W, H = im.size
        crops = [(0, 0, W, H), (620, 520, 1060, 900), (800, 640, 960, 780)]
        for i, c in enumerate(crops): im.crop(c).resize((300, 260)).save(os.path.join(IMGDIR, f"l04-landsat-z{i}.jpg"), quality=86)
        f = Fig(1000, 440).title("រូបភាព Landsat តែមួយ នៅទំហំបី", "ភ្នំពេញ ២០១៩ · ក្រឡា ៣០ ម")
        for i, t in enumerate(["~៤០ គម ទទឹង", "~១៣ គម ទទឹង", "~៥ គម ទទឹង"]):
            f.add(f'<image href="../assets/img/slides/l04-landsat-z{i}.jpg" x="{30+i*325}" y="90" width="300" height="260"/>'); f.text(180 + i * 325, 380, t, 16, IND, "middle", "bold")
        f.text(500, 420, "ពង្រីកខ្លាំង៖ ឃើញក្រឡា (ភីកសែល) មិនមែនលម្អិតបន្ថែមទេ", 15, "#c62828", "middle")
        f.source("Landsat 8 OLI · USGS")
        entry(4, f.save("l04-landsat-zoom"), "ពង្រីកមិនបន្ថែមព័ត៌មាន",
              ["រូបភាពមានលម្អិតថេរ (ក្រឡា ៣០ ម) ទោះពង្រីកប៉ុណ្ណាក៏ដោយ។", "នៅពង្រីកខ្លាំង យើងឃើញប្រអប់ការ៉េ មិនមែនផ្ទះ ឬផ្លូវតូចទេ។", "ដូចគ្នានឹងទិន្នន័យវ៉ិចទ័រ ១ : ១ ០០០ ០០០ ពង្រីកមក ១ : ១០ ០០០។"], .7)
        # false colour vs true colour (L8 colour meaning)
        try:
            import rasterio, math as m
            se = m.radians(51.56434261)
            def toa(b):
                a = rasterio.open(f"{RD}/L8_Zone48n/L8_Zone48n/L8_B{b}.tif").read(1).astype(float)[520:900, 620:1060]; return (a * 2e-5 - .1) / m.sin(se)
            A = [toa(b) for b in (5, 4, 3)]
            st = lambda a: (np.clip((a - np.percentile(a, 2)) / (np.percentile(a, 98) - np.percentile(a, 2)), 0, 1) * 255).astype(np.uint8)
            Image.fromarray(np.dstack([st(a) for a in A])).resize((380, 330)).save(os.path.join(IMGDIR, "l08-falsecolour.jpg"), quality=86)
            im.crop(crops[1]).resize((380, 330)).save(os.path.join(IMGDIR, "l08-truecolour.jpg"), quality=86)
            f = Fig(1000, 470).title("ពណ៌ពិត ធៀបនឹងពណ៌សន្មត", "ពណ៌នៅលើផែនទី និងរូបភាព គឺជាការសម្រេចចិត្ត")
            f.add('<image href="../assets/img/slides/l08-truecolour.jpg" x="60" y="90" width="380" height="330"/>'); f.add('<image href="../assets/img/slides/l08-falsecolour.jpg" x="560" y="90" width="380" height="330"/>')
            f.text(250, 450, "ពណ៌ពិត (ក្រហម–បៃតង–ខៀវ)", 16, IND, "middle", "bold"); f.text(750, 450, "ពណ៌សន្មត៖ រុក្ខជាតិ = ក្រហម", 16, IND, "middle", "bold")
            entry(8, f.save("l08-true-false"), "ពណ៌មានន័យតាមការព្រមព្រៀង",
                  ["ក្នុងពណ៌សន្មត រុក្ខជាតិចេញជាពណ៌ក្រហម ព្រោះចាំងពន្លឺអ៊ីនហ្វ្រាក្រហមខ្លាំង។", "អ្នកអានត្រូវដឹងពីការព្រមព្រៀងនេះ បើមិនដូច្នេះ នឹងអានខុស។", "នៅលើផែនទីប្រធានបទ ប្រើពណ៌ដែលអ្នកអានរំពឹង៖ ទឹក = ខៀវ ព្រៃ = បៃតង។"], .6)
        except Exception as e: print("false colour skipped", e)
    # L12 real change Sihanoukville
    a, b = os.path.join(RD, "shv2015_true.png"), os.path.join(RD, "shv2021_true.png")
    if os.path.exists(a) and os.path.exists(b):
        for src, dst in ((a, "l12-shv2015.jpg"), (b, "l12-shv2021.jpg")): Image.open(src).convert("RGB").resize((400, 384)).save(os.path.join(IMGDIR, dst), quality=86)
        f = Fig(1000, 500).title("ការផ្លាស់ប្ដូរតាមពេលវេលា៖ ក្រុងព្រះសីហនុ", "Sentinel-2 · ២០១៥ និង ២០២១")
        f.add('<image href="../assets/img/slides/l12-shv2015.jpg" x="60" y="85" width="400" height="384"/>'); f.add('<image href="../assets/img/slides/l12-shv2021.jpg" x="540" y="85" width="400" height="384"/>')
        f.text(260, 492, "២០១៥", 18, IND, "middle", "bold"); f.text(740, 492, "២០២១", 18, IND, "middle", "bold")
        entry(12, f.save("l12-shv-change"), "ពីរកាលបរិច្ឆេទ ប្រៀបធៀបចំហៀងគ្នា",
              ["ព្រៃភាគខាងជើង និងកណ្ដាល ត្រូវបានឈូសឆាយសម្រាប់ការសាងសង់។", "ការប្រៀបធៀបចំហៀងគ្នា ត្រូវមានវិសាលភាព និងមាត្រដ្ឋានដូចគ្នា។", "ផែនទីការផ្លាស់ប្ដូរ (មុន → ក្រោយ) ជួយឲ្យអ្នកអានមិនចាំបាច់រកភាពខុសគ្នាដោយខ្លួនឯង។"], .45)
    # L5 contour intervals
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    z = np.array(TERRAIN["z"]); n = z.shape[0]
    f = Fig(1000, 420).title("ចន្លោះខ្សែវណ្ឌ ៥ · ២០ · ៥០ ម")
    for i, ci in enumerate([5, 20, 50]):
        x0 = 30 + i * 325; f.rect(x0, 90, 280, 280, "#fffdf7", "#d7ccc8")
        cs = plt.contour(z, levels=np.arange(0, 400, ci))
        for segs in cs.allsegs:
            for sg in segs:
                if len(sg) > 1: f.path("M" + " L".join(f"{x0 + x * 280 / (n - 1):.1f} {90 + y * 280 / (n - 1):.1f}" for x, y in sg), "none", "#8d6e63", .7)
        plt.close("all"); f.text(x0 + 140, 400, f"ចន្លោះ {kh(ci)} ម", 16, IND, "middle", "bold")
    entry(5, f.save("l05-contour-interval"), "ជ្រើសចន្លោះខ្សែវណ្ឌ",
          ["ចន្លោះតូច៖ លម្អិតច្រើន ប៉ុន្តែខ្សែក្រាស់ពេកនៅតំបន់ចោត។", "ចន្លោះធំ៖ ច្បាស់ ប៉ុន្តែបាត់ទម្រង់ដីតូចៗ។", "ផែនទី ១ : ៥០ ០០០ នៅកម្ពុជាប្រើចន្លោះ ២០ ម (ដីរាបអាចមាន ១០ ម)។"], .4)
    # L5 3D wire block
    f = Fig(1000, 460).title("ទិដ្ឋភាព ៣ វិមាត្រ (block diagram)")
    for i in range(0, n, 2):
        pts = [(160 + j * 11 + i * 5, 380 - i * 3.2 - z[i, j] * .55) for j in range(n)]
        f.path("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts), "#e8f5e9", "#2e7d32", .7)
    f.text(860, 420, "ពង្រីកកម្ពស់ × ៣", 13, "#90a4ae", "end")
    entry(5, f.save("l05-block3d"), "ពីផែនទីទៅទិដ្ឋភាព ៣ វិមាត្រ",
          ["ទិដ្ឋភាព ៣ វិមាត្រងាយយល់សម្រាប់អ្នកមិនស្គាល់ខ្សែវណ្ឌ។", "ប៉ុន្តែផ្នែកខ្លះត្រូវលាក់នៅពីក្រោយភ្នំ ហើយវាស់ចម្ងាយមិនបាន។", "QGIS៖ View → 3D Map View ជាមួយ DEM។"], .9)
    # L6 pictograms for Cambodia features
    f = Fig(1000, 420).title("សញ្ញារូបភាព ធៀបនឹងសញ្ញាធរណីមាត្រ")
    icons = [("សាលារៀន", '<path d="M-14 4 L0 -10 L14 4 Z M-10 4 v12 h20 v-12" fill="#1565c0"/>'), ("មន្ទីរពេទ្យ", '<rect x="-12" y="-12" width="24" height="24" rx="4" fill="#fff" stroke="#c62828" stroke-width="3"/><path d="M-3 -8h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill="#c62828"/>'),
             ("វត្ត", '<path d="M0 -16 L4 -6 L10 -6 L10 14 L-10 14 L-10 -6 L-4 -6 Z" fill="#f9a825"/>'), ("ផ្សារ", '<path d="M-14 -4 h28 l-4 16 h-20 z M-8 -4 q8 -14 16 0" fill="#6d4c41" stroke="#6d4c41" stroke-width="1.5"/>'),
             ("ប៉ុស្តិ៍ប៉ូលិស", '<path d="M0 -15 L13 -9 L10 8 L0 15 L-10 8 L-13 -9 Z" fill="#283593"/>')]
    for i, (t, g) in enumerate(icons):
        x = 120 + i * 180; f.add(f'<g transform="translate({x} 160) scale(1.6)">{g}</g>'); f.circle(x, 270, 10, ["#1565c0", "#c62828", "#f9a825", "#6d4c41", "#283593"][i]); f.text(x, 330, t, 16, INK, "middle")
    f.text(40, 165, "រូបភាព", 15, "#607d8b"); f.text(40, 275, "ធរណីមាត្រ", 15, "#607d8b")
    entry(6, f.save("l06-pictograms"), "សញ្ញារូបភាព ឬរង្វង់?",
          ["សញ្ញារូបភាពយល់ភ្លាមដោយគ្មានសញ្ញាសម្គាល់ ប៉ុន្តែត្រូវការទំហំធំ។", "សញ្ញាធរណីមាត្រតូច និងស្អាត ល្អនៅពេលមានចំណុចច្រើន។", "ប្រើសញ្ញាដែលអ្នកអានក្នុងស្រុកស្គាល់ (វត្ត ផ្សារ)។"], .38)
    # L8 ColorBrewer palettes sheet
    pals = {"Sequential": [SEQ, BLU, ["#f7fcf5", "#c7e9c0", "#74c476", "#31a354", "#006d2c"], VIR],
            "Diverging": [DIV, ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"]],
            "Qualitative": [QUAL, ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69"]]}
    f = Fig(1000, 480).title("ឈុតពណ៌ ColorBrewer ដែលប្រើញឹកញាប់")
    y = 100
    for k, lst in pals.items():
        f.text(40, y + 18, k, 17, IND, weight="bold")
        for p in lst:
            for j, c in enumerate(p): f.rect(220 + j * 60, y, 58, 26, c)
            y += 34
        y += 12
    f.text(40, 465, "colorbrewer2.org · ជ្រើស «colorblind safe» និង «print friendly»", 14, "#607d8b")
    entry(8, f.save("l08-palettes"), "ឈុតពណ៌ដែលបានសាកល្បង",
          ["ColorBrewer (Cynthia Brewer) ផ្ដល់ឈុតពណ៌សម្រាប់ផែនទី ដែលបានសាកល្បងលើអ្នកអាន។", "QGIS មានឈុតទាំងនេះរួចហើយ ក្នុង Color ramp។", "Viridis សមសម្រាប់ទិន្នន័យបន្ត និងអ្នកខ្វះពណ៌។"], .15)
    # L9 rates chart
    top = sorted(PROV["prov"], key=lambda p: -p["pop"])[:8]
    f = Fig(1000, 460).title("ចំណាត់ថ្នាក់ប្ដូរ ពេលធ្វើឲ្យស្តង់ដារ", "៨ ខេត្តដែលមានប្រជាជនច្រើនជាងគេ")
    mxp = max(p["pop"] for p in top); mxd = max(p["dens"] for p in top)
    for i, p in enumerate(top):
        y = 100 + i * 42; f.text(40, y + 20, p["name"], 15)
        f.rect(200, y + 4, p["pop"] / mxp * 330, 22, "#7986cb"); f.text(205 + p["pop"] / mxp * 330, y + 21, khn(p["pop"]), 12)
        f.rect(620, y + 4, p["dens"] / mxd * 330, 22, "#ffb74d"); f.text(625 + p["dens"] / mxd * 330, y + 21, kh(p["dens"]), 12)
    f.text(365, 90, "ប្រជាជនសរុប", 16, IND, "middle", "bold"); f.text(785, 90, "ដង់ស៊ីតេ (នាក់/គម²)", 16, "#e65100", "middle", "bold")
    entry(9, f.save("l09-rank-change"), "ចំនួន និងអត្រា ប្រាប់រឿងខុសគ្នា",
          ["បាត់ដំបងមានប្រជាជនច្រើន ប៉ុន្តែដង់ស៊ីតេមធ្យម ព្រោះខេត្តធំ។", "កណ្ដាល និងតាកែវ មានដង់ស៊ីតេខ្ពស់ជាងបាត់ដំបងច្រើនដង។", "មុនគូសផែនទី សួរ៖ សំណួររបស់ខ្ញុំជាចំនួន ឬអត្រា?"], .4)
    # L10 dot value choice
    from shapely.geometry import Polygon, Point
    f = Fig(1000, 420).title("ជ្រើសតម្លៃចំណុច", "១ ចំណុច = ៥ ០០០ · ២០ ០០០ · ១០០ ០០០ នាក់")
    rng = np.random.default_rng(2)
    for i, val in enumerate([5000, 20000, 100000]):
        x0 = 20 + i * 330; prov_map(f, x0, 90, 1.0, fill=lambda p: "#fafafa", stroke="#e0e0e0", lake=False)
        for p in PROV["prov"]:
            polys = [Polygon(r) for r in p["r"] if len(r) > 3]; big = max(polys, key=lambda g: g.area); mnx, mny, mxx, mxy = big.bounds; nd = int(p["pop"] / val); c = 0; t = 0
            while c < nd and t < nd * 40:
                t += 1; x, y = rng.uniform(mnx, mxx), rng.uniform(mny, mxy)
                if big.contains(Point(x, y)): f.circle(x0 + x, 90 + y, .9 if val == 5000 else 1.4, "#37474f"); c += 1
        f.text(x0 + 150, 380, ["ក្រាស់ពេក (ចំណុចជាប់គ្នា)", "សមល្មម", "ស្រាលពេក (បាត់លំនាំ)"][i], 15, ["#c62828", "#2e7d32", "#c62828"][i], "middle", "bold")
    entry(10, f.save("l10-dot-value"), "តម្លៃចំណុចសមល្មម",
          ["តម្លៃតូចពេក៖ ចំណុចជាប់គ្នាក្លាយជាពណ៌ខ្មៅ។", "តម្លៃធំពេក៖ ខេត្តតូចមិនមានចំណុចសោះ។", "គោលការណ៍៖ ចំណុចចាប់ផ្ដើមប៉ះគ្នានៅតំបន់ក្រាស់បំផុត។"], .7)
    # L13 river label along curve (Mekong from NE data)
    f = Fig(1000, 460).title("ស្លាកតាមខ្សែទន្លេ")
    p, to = world_paths("merc", (40, 80, 920, 360), feats=ASIA["features"], extent=(103.5, 10.5, 107.5, 14.5), fill=lambda g: "#fafafa", stroke="#e0e0e0"); f.add(p)
    mek = [ft for ft in RIVERS["features"] if (ft["properties"].get("name") or "").startswith("Mekong")]
    d = []
    for ft in mek:
        for r in rings_of(ft["geometry"]):
            pts = [to(*c) for c in r if 103.5 < c[0] < 107.5 and 10.5 < c[1] < 14.5]
            pts = [q for q in pts if q]
            if len(pts) > 1: d.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
    if d:
        f.add(f'<path id="mek" d="{" ".join(d)}" fill="none" stroke="#1e88e5" stroke-width="3"/>')
        f.add('<text font-size="18" fill="#0277bd" font-style="italic" letter-spacing="3"><textPath href="#mek" startOffset="30%">ទន្លេមេគង្គ</textPath></text>')
    f.text(660, 420, "អក្សរដើរតាមខ្សែ · ឃ្លាតអក្សរ · ពណ៌ខៀវទ្រេត", 15, INK, "middle")
    entry(13, f.save("l13-river-label"), "ដាក់ស្លាកលើបន្ទាត់",
          ["ស្លាកទន្លេដើរតាមខ្សែ នៅខាងលើ ឬខាងក្រោមបន្ទាត់បន្តិច។", "ជៀសវាងផ្នែកកោងខ្លាំង ដែលធ្វើឲ្យអក្សរបត់។", "QGIS៖ Placement → Curved ជាមួយ «Above line»។"], .45)
    # L14 poster example
    f = Fig(1000, 560).title("ឧទាហរណ៍ប្លង់បញ្ចប់", "ផែនទីដង់ស៊ីតេ · A4 ផ្ដេក")
    f.rect(60, 80, 880, 470, "#fff", "#90a4ae", 1.5); f.text(90, 120, "ដង់ស៊ីតេប្រជាជនកម្ពុជា តាមខេត្ត ២០១៩", 22, INK, weight="bold"); f.text(90, 146, "ប្រជាជនប្រមូលផ្ដុំតាមដងទន្លេមេគង្គ និងជុំវិញភ្នំពេញ", 14, "#607d8b")
    c = classify(0, [0, 50, 100, 200, 400], SEQ); prov_map(f, 90, 160, 1.45, fill=lambda p: c(p["dens"]))
    f.legend_boxes(680, 200, SEQ, ["តិចជាង ៥០", "៥០ – ១០០", "១០០ – ២០០", "២០០ – ៤០០", "៤០០ ឡើងទៅ"], "នាក់ក្នុង ១ គម²")
    f.rect(680, 380, 60, 6, "#212121"); f.rect(740, 380, 60, 6, "#fff", "#212121"); f.text(680, 402, "០", 11); f.text(800, 402, "១០០ គម", 11, "#212121", "middle")
    f.path("M 880 220 l 10 30 l -10 -8 l -10 8 z", "#212121"); f.text(880, 214, "ជ", 13, INK, "middle", "bold")
    f.text(920, 535, "ប្រភព៖ ជំរឿនទូទៅ ២០១៩ · ព្រំខេត្ត · UTM 48N · អ្នកធ្វើ៖ និស្សិត ឆ្នាំទី២", 11, "#607d8b", "end")
    entry(14, f.save("l14-final-layout"), "ប្លង់បញ្ចប់",
          ["ចំណងជើងប្រាប់ «អ្វី នៅឯណា ពេលណា» · អនុចំណងជើងប្រាប់សារ។", "ផែនទីធំ ធាតុជំនួយតូច ហើយតម្រង់ជួរ។", "ប្រភព និងអ្នកធ្វើ នៅខាងក្រោម តូច ប៉ុន្តែអានបាន។"], .92)
    # L3 UTM scale factor across zone
    f = Fig(1000, 420).title("មេគុណមាត្រដ្ឋានក្នុងតំបន់ UTM", "k = 0.9996 នៅខ្សែកណ្ដាល ១០៥°E")
    X0, Y0, W, H = 100, 100, 800, 250
    pts = []
    for i in range(0, 61):
        dl = -3 + i * .1; k = .9996 * (1 + (math.radians(dl) * math.cos(math.radians(12))) ** 2 / 2); pts.append((X0 + i / 60 * W, Y0 + H - (k - .9994) / .0012 * H))
    f.path("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts), "none", IND, 3)
    y1 = Y0 + H - (1 - .9994) / .0012 * H; f.line(X0, y1, X0 + W, y1, "#e65100", 1.5, "6 4"); f.text(X0 + W + 5, y1 + 5, "k = 1", 14, "#e65100")
    for dl in (-3, -2, -1, 0, 1, 2, 3): x = X0 + (dl + 3) / 6 * W; f.text(x, Y0 + H + 22, f"{kh(105+dl)}°E", 13, "#546e7a", "middle")
    f.text(X0 + W / 2, Y0 + H + 50, "ភ្នំពេញ (១០៤,៩°E) ជិតខ្សែកណ្ដាល → កំហុសចម្ងាយ < ០,០៥%", 15, INK, "middle")
    entry(3, f.save("l03-utm-scale"), "UTM ត្រឹមត្រូវប៉ុណ្ណា?",
          ["នៅខ្សែកណ្ដាល ចម្ងាយលើផែនទីខ្លីជាងការពិត ០,០៤%។", "នៅគែមតំបន់ (±៣°) ចម្ងាយវែងជាងការពិតប្រហែល ០,១%។", "សម្រាប់ផែនទីកម្ពុជា កំហុសនេះតូចជាងកំហុសទិន្នន័យច្រើនដង។"], .85)

if __name__ == "__main__":
    extra(); print(len(MANIFEST), "extra visuals")
