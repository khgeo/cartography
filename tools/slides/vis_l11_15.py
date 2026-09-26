from vis_core import *
import numpy as np
from vis_core import _pl as PL

def idw(px, py, pv, gx, gy, power=2):
    d = np.hypot(gx[..., None] - px, gy[..., None] - py) + 1e-6; w = 1 / d ** power
    return (w * pv).sum(-1) / w.sum(-1)
def contours_svg(Z, ox, oy, s, levels, color="#5d4037", sw=1):
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    cs = plt.contour(Z, levels=levels); out = []
    for lev, segs in zip(cs.levels, cs.allsegs):
        for sg in segs:
            if len(sg) > 1: out.append(f'<path d="M{" L".join(f"{ox + x * s:.1f} {oy + y * s:.1f}" for x, y in sg)}" fill="none" stroke="{color}" stroke-width="{sw}"/>')
    plt.close("all"); return "".join(out)
_RC = [0]
def raster_rects(f, Z, ox, oy, s, pal, vmin, vmax):
    """Colour a grid as a PNG image (keeps the SVG small)."""
    from PIL import Image
    P = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in pal], np.uint8)
    t = np.clip(((Z - vmin) / (vmax - vmin) * len(pal)).astype(int), 0, len(pal) - 1)
    _RC[0] += 1; name = f"l11-grid-{_RC[0]}.png"
    Image.fromarray(P[t]).resize((Z.shape[1] * 4, Z.shape[0] * 4), Image.NEAREST).save(os.path.join(IMGDIR, name))
    f.add(f'<image href="../assets/img/slides/{name}" x="{ox:.1f}" y="{oy:.1f}" width="{Z.shape[1]*s:.1f}" height="{Z.shape[0]*s:.1f}" preserveAspectRatio="none"/>')

# synthetic rainfall stations over Cambodia (illustrative, labelled as such)
rng = np.random.default_rng(7)
ST = np.array([[40, 60], [80, 120], [140, 90], [200, 60], [250, 110], [120, 180], [180, 170], [230, 200], [60, 200], [150, 230], [100, 90], [210, 140]], float)
RV = np.array([1400, 1500, 1350, 1800, 2100, 1300, 1250, 1600, 2600, 1700, 1450, 1900], float)
RAIN = ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"]

def L11():
    gx, gy = np.meshgrid(np.linspace(0, 300, 60), np.linspace(0, 251, 50))
    Z = idw(ST[:, 0], ST[:, 1], RV, gx, gy, 2)
    # points → surface → isolines
    f = Fig(1000, 460).title("ពីចំណុចទៅផ្ទៃ ពីផ្ទៃទៅខ្សែអ៊ីសូលីន", "ទឹកភ្លៀងប្រចាំឆ្នាំ (មម) · ស្ថានីយគំរូ")
    for k, x0 in enumerate([20, 350, 680]):
        prov_map(f, x0, 110, 1.0, fill=lambda p: "#fafafa", stroke="#cfd8dc", lake=False)
        if k >= 1:
            s = 300 / 59
            clip = f'<clipPath id="kh{k}"><path d="{pd([r for p in PROV["prov"] for r in p["r"]], x0, 110, 1.0)}"/></clipPath>'
            f.add(clip); f.add(f'<g clip-path="url(#kh{k})">')
            if k == 1: raster_rects(f, Z, x0, 110, s, RAIN, 1200, 2700)
            else: f.add(contours_svg(Z, x0, 110, s, list(range(1300, 2700, 200)), "#1565c0", 1.3))
            f.add("</g>")
        for (x, y), v in zip(ST, RV): f.circle(x0 + x, 110 + y, 4, "#c62828", "#fff", 1)
        if k == 0:
            for (x, y), v in zip(ST, RV): f.text(x0 + x + 5, 110 + y - 5, kh(int(v)), 10, INK)
        f.text(x0 + 150, 400, ["១. ស្ថានីយ (ចំណុច)", "២. អន្តរប៉ូល IDW (ផ្ទៃ)", "៣. ខ្សែអ៊ីសូលីន ២០០ មម"][k], 16, IND, "middle", "bold")
    f.source("ទិន្នន័យស្ថានីយជាគំរូបង្រៀន មិនមែនទិន្នន័យអាកាសធាតុផ្លូវការ")
    entry(11, f.save("l11-points-surface-lines"), "ពីចំណុចទៅខ្សែអ៊ីសូលីន",
          ["យើងវាស់តែនៅស្ថានីយ ប៉ុន្តែទឹកភ្លៀងជាបាតុភូតបន្តគ្រប់កន្លែង។", "អន្តរប៉ូល (interpolation) ប៉ាន់តម្លៃនៅចន្លោះស្ថានីយ។", "ខ្សែអ៊ីសូលីនភ្ជាប់ចំណុចដែលមានតម្លៃស្មើគ្នា ដូចខ្សែវណ្ឌ។"], .3)
    # IDW power comparison
    f = Fig(1000, 440).title("អំណាច IDW ប្ដូររូបរាងផ្ទៃ", "Power ១ · ២ · ៤")
    for k, pw in enumerate([1, 2, 4]):
        Zp = idw(ST[:, 0], ST[:, 1], RV, gx, gy, pw); x0 = 20 + k * 330
        raster_rects(f, Zp, x0, 100, 300 / 59, RAIN, 1200, 2700)
        for (x, y) in ST: f.circle(x0 + x, 100 + y, 3, "#c62828")
        f.text(x0 + 150, 385, f"Power {kh(pw)}", 17, IND, "middle", "bold"); f.text(x0 + 150, 410, ["រលោង · ទូទៅ", "សមតុល្យ", "«ភ្នំជុំវិញស្ថានីយ»"][k], 14, "#607d8b", "middle")
    entry(11, f.save("l11-idw-power"), "ការជ្រើសប៉ារ៉ាម៉ែត្រអន្តរប៉ូល",
          ["Power ទាប៖ ស្ថានីយឆ្ងាយមានឥទ្ធិពលច្រើន → ផ្ទៃរលោង។", "Power ខ្ពស់៖ ស្ថានីយជិតបំផុតគ្របដណ្ដប់ → រង្វង់ជុំវិញស្ថានីយ។", "គ្មានតម្លៃ «ត្រឹមត្រូវ» តែមួយទេ៖ ត្រូវផ្ទៀងផ្ទាត់ដោយស្ថានីយដែលទុកចោល។"], .4)
    # uncertainty: distance to nearest station
    D = np.min(np.hypot(gx[..., None] - ST[:, 0], gy[..., None] - ST[:, 1]), -1)
    f = Fig(1000, 440).title("ភាពមិនច្បាស់៖ ចម្ងាយទៅស្ថានីយជិតបំផុត")
    raster_rects(f, D, 60, 90, 330 / 59, ["#f7fcf5", "#c7e9c0", "#74c476", "#238b45", "#00441b"][::-1], 0, 90)
    for (x, y) in ST: f.circle(60 + x * 1.1, 90 + y * 1.1, 4, "#c62828", "#fff")
    f.text(470, 170, "ពណ៌ភ្លឺ = ឆ្ងាយពីស្ថានីយ", 18, INK); f.text(470, 205, "→ តម្លៃអន្តរប៉ូលមិនសូវទុកចិត្ត", 18, "#c62828", weight="bold")
    f.text(470, 260, "បង្ហាញភាពមិនច្បាស់ដោយ៖", 17, IND, weight="bold")
    for i, t in enumerate(["ដាក់ចំណុចស្ថានីយលើផែនទី", "ធ្វើឲ្យស្រាល (transparency) តំបន់ឆ្ងាយ", "សរសេរចំនួនស្ថានីយក្នុងប្រភព"]): f.text(490, 295 + i * 32, "• " + t, 16)
    entry(11, f.save("l11-uncertainty"), "បង្ហាញភាពមិនច្បាស់",
          ["ផ្ទៃដែលអន្តរប៉ូលមើលទៅច្បាស់ដូចគ្នាគ្រប់កន្លែង ប៉ុន្តែការពិតមិនមែនទេ។", "តំបន់ឆ្ងាយពីស្ថានីយ (ភាគឦសាន) ទុកចិត្តតិចជាង។", "អ្នកធ្វើផែនទីត្រូវប្រាប់អ្នកអានពីដែនកំណត់នេះ។"], .55)
    # relief methods on terrain
    z = np.array(TERRAIN["z"]); n = z.shape[0]
    f = Fig(1000, 460).title("វិធីបង្ហាញរលកដីបួន", "DEM ដូចគ្នា")
    x0s = [20, 265, 510, 755]; s = 225 / (n - 1)
    f.add('<image href="../assets/img/slides/l05-hillshade.png" x="20" y="100" width="225" height="225"/>')
    f.add('<image href="../assets/img/slides/l05-hypso.png" x="265" y="100" width="225" height="225"/>')
    f.rect(510, 100, 225, 225, "#fffdf7", "#d7ccc8"); f.add(contours_svg(z, 510, 100, s, list(range(0, 400, 20)), "#8d6e63", .8))
    step = 3
    for i in range(0, n, step):
        pts = [(755 + j * s, 100 + i * s * .8 + 45 - z[i, j] * .25) for j in range(n)]
        f.path("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts), "#fff", "#37474f", .7)
    for x, t in zip(x0s, ["Hillshade", "ពណ៌កម្ពស់", "ខ្សែវណ្ឌ", "ខ្សែតាមជួរ (ridge lines)"]): f.text(x + 112, 360, t, 16, IND, "middle", "bold")
    entry(11, f.save("l11-relief-methods"), "បង្ហាញរលកដី",
          ["Hillshade និងពណ៌កម្ពស់ សម្រាប់ការយល់ឃើញទូទៅ។", "ខ្សែវណ្ឌ សម្រាប់វាស់ និងអានកម្ពស់។", "ខ្សែតាមជួរ ជាស្ទីលសិល្បៈ ល្អសម្រាប់ផ្ទាំងរូបភាព មិនមែនសម្រាប់វាស់។"], .75)
    # continuous vs discrete
    f = Fig(1000, 420).title("បាតុភូតបន្ត ធៀបនឹងបាតុភូតដាច់")
    raster_rects(f, Z, 40, 90, 330 / 59, RAIN, 1200, 2700); f.text(205, 390, "បន្ត៖ ទឹកភ្លៀង សីតុណ្ហភាព កម្ពស់", 16, IND, "middle", "bold")
    c = classify(0, [0, 50, 100, 200, 400], SEQ); prov_map(f, 560, 90, 1.1, fill=lambda p: c(p["dens"])); f.text(725, 390, "ដាច់តាមឯកតា៖ ប្រជាជនក្នុងខេត្ត", 16, IND, "middle", "bold")
    entry(11, f.save("l11-continuous-discrete"), "ទិន្នន័យបន្ត ឬដាច់?",
          ["ទឹកភ្លៀងមានតម្លៃនៅគ្រប់ចំណុច និងប្រែប្រួលបន្តិចម្ដងៗ → isoline ឬរ៉ាស្ទ័រ។", "ប្រជាជនរាប់តាមឯកតារដ្ឋបាល → choropleth ឬសញ្ញា។", "កុំគូស isoline ពីទិន្នន័យខេត្ត ព្រោះព្រំខេត្តមិនមែនជាបាតុភូតបន្ត។"], .1)

def L12():
    pp = pcentre("Phnom Penh")
    # flow map migration (illustrative)
    f = Fig(1000, 560).title("ផែនទីលំហូរ៖ ការធ្វើចំណាកស្រុកទៅភ្នំពេញ (គំរូ)", "ទទឹងខ្សែ ∝ ចំនួនអ្នកធ្វើចំណាកស្រុក")
    prov_map(f, 40, 80, 1.75, fill=lambda p: "#f5f5f5", stroke="#cfd8dc")
    X, Y = 40 + pp[0] * 1.75, 80 + pp[1] * 1.75
    for p in sorted(PROV["prov"], key=lambda p: p["pop"]):
        if p["en"] == "Phnom Penh": continue
        cx, cy = pcentre(p["en"]); x, y = 40 + cx * 1.75, 80 + cy * 1.75
        w = 1 + p["pop"] / 120000 * (0.6 if math.hypot(x - X, y - Y) > 200 else 1)
        mx, my = (x + X) / 2 - (y - Y) * .15, (y + Y) / 2 + (x - X) * .15
        f.path(f"M{x:.1f} {y:.1f} Q{mx:.1f} {my:.1f} {X:.1f} {Y:.1f}", "none", "#7b1fa2", w, .55)
    f.circle(X, Y, 9, "#212121"); f.text(X + 12, Y + 22, "ភ្នំពេញ", 16, INK, weight="bold")
    f.source("ទំហំលំហូរជាគំរូបង្រៀន ផ្អែកលើប្រជាជនខេត្ត មិនមែនទិន្នន័យចំណាកស្រុកផ្លូវការ")
    entry(12, f.save("l12-flow-migration"), "ផែនទីលំហូរ",
          ["ខ្សែកោងជួយកុំឲ្យលំហូរជាន់គ្នា និងបង្ហាញទិស។", "ទទឹងខ្សែតំណាងបរិមាណ៖ ត្រូវមានសញ្ញាសម្គាល់ទទឹង។", "គូសខ្សែតូចពីលើ ខ្សែធំពីក្រោម ដើម្បីកុំឲ្យលាក់គ្នា។"], .1)
    # desire lines vs network
    f = Fig(1000, 440).title("ខ្សែបំណង ធៀបនឹងលំហូរតាមបណ្ដាញ")
    prov_map(f, 20, 90, 1.2, fill=lambda p: "#fafafa", stroke="#e0e0e0"); prov_map(f, 520, 90, 1.2, fill=lambda p: "#fafafa", stroke="#e0e0e0")
    for p in PROV["prov"][:12]:
        cx, cy = pcentre(p["en"]); f.line(20 + cx * 1.2, 90 + cy * 1.2, 20 + pp[0] * 1.2, 90 + pp[1] * 1.2, "#ef6c00", 1.5)
    for r in PROV["roads"]: f.path("M" + " L".join(f"{520 + x * 1.2:.1f} {90 + y * 1.2:.1f}" for x, y in r), "none", "#ef6c00", 2.5, .7)
    f.text(210, 420, "ខ្សែបំណង (ត្រង់ ពីប្រភពទៅគោលដៅ)", 15, IND, "middle", "bold"); f.text(710, 420, "លំហូរតាមផ្លូវពិត", 15, IND, "middle", "bold")
    entry(12, f.save("l12-desire-network"), "ខ្សែត្រង់ ឬតាមផ្លូវ?",
          ["ខ្សែបំណងបង្ហាញ «អ្នកណាទៅណា» មិនមែនផ្លូវដែលពួកគេធ្វើដំណើរទេ។", "លំហូរតាមបណ្ដាញ សមសម្រាប់ចរាចរណ៍ ឬការដឹកជញ្ជូនទំនិញ។", "ជ្រើសតាមសំណួរ៖ ទំនាក់ទំនង ឬផ្លូវ?"], .25)
    # small multiples over time (illustrative growth)
    f = Fig(1000, 420).title("ពហុផែនទីតូចៗ៖ ដង់ស៊ីតេតាមពេលវេលា (គំរូ)")
    c = classify(0, [0, 50, 100, 200, 400], SEQ)
    for i, (yr, g) in enumerate([(1998, .7), (2008, .85), (2019, 1.0), ("2030?", 1.15)]):
        prov_map(f, 20 + i * 245, 100, .78, fill=lambda p, g=g: c(p["dens"] * (g if p["dens"] < 300 else g ** 2)), sw=.4)
        f.text(135 + i * 245, 330, kh(yr), 18, IND, "middle", "bold")
    f.text(500, 380, "ឈុតពណ៌ និងព្រំថ្នាក់ដូចគ្នាគ្រប់ផែនទី ដើម្បីប្រៀបធៀបបាន", 15, "#607d8b", "middle")
    entry(12, f.save("l12-small-multiples"), "បង្ហាញពេលវេលាដោយផែនទីតូចៗ",
          ["ផែនទីតូចៗតម្រៀបគ្នា ជួយប្រៀបធៀបលឿនជាងចលនា។", "ត្រូវប្រើព្រំថ្នាក់ និងពណ៌ដូចគ្នាទាំងអស់។", "តម្លៃឆ្នាំនីមួយៗក្នុងរូបនេះជាគំរូបង្រៀន។"], .6)
    # isochrones rings
    f = Fig(1000, 520).title("រង្វង់ពេលធ្វើដំណើរពីភ្នំពេញ (Isochrone គំរូ)")
    prov_map(f, 40, 80, 1.7, fill=lambda p: "#fafafa", stroke="#cfd8dc")
    X, Y = 40 + pp[0] * 1.7, 80 + pp[1] * 1.7
    for i, (r, cc) in enumerate([(170, "#fff3e0"), (120, "#ffe0b2"), (75, "#ffb74d"), (35, "#fb8c00")]):
        pts = [(X + r * (1 + .25 * math.sin(3 * a)) * math.cos(a), Y + r * (.8 + .2 * math.cos(2 * a)) * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 60)]
        f.path("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z", cc, "#e65100", 1, .75)
    f.legend_boxes(620, 150, ["#fb8c00", "#ffb74d", "#ffe0b2", "#fff3e0"], ["< ១ ម៉ោង", "១–២ ម៉ោង", "២–៣ ម៉ោង", "៣–៤ ម៉ោង"], "ពេលធ្វើដំណើរ")
    entry(12, f.save("l12-isochrones"), "ផែនទីពេលធ្វើដំណើរ",
          ["Isochrone ភ្ជាប់ទីតាំងដែលទៅដល់ក្នុងពេលស្មើគ្នា។", "រាងមិនមែនរង្វង់ទេ៖ លាតតាមផ្លូវជាតិ និងតូចនៅតំបន់គ្មានផ្លូវ។", "QGIS៖ ORS Tools ឬ Network Analysis → Service area។"], .8)
    # chart map bars
    f = Fig(1000, 520).title("ផែនទីក្រាប៖ ប្រជាជន និងដង់ស៊ីតេ (ពហុអថេរ)")
    prov_map(f, 40, 80, 1.7, fill=lambda p: "#fafafa", stroke="#cfd8dc")
    for p in PROV["prov"][::2]:
        cx, cy = pcentre(p["en"]); x, y = 40 + cx * 1.7, 80 + cy * 1.7
        h1 = p["pop"] / 1.4e6 * 45; h2 = min(45, p["dens"] / 400 * 45)
        f.rect(x - 8, y - h1, 7, h1, "#3949ab"); f.rect(x + 1, y - h2, 7, h2, "#fb8c00"); f.line(x - 10, y, x + 10, y, "#455a64", 1)
    f.legend_boxes(640, 200, ["#3949ab", "#fb8c00"], ["ប្រជាជន", "ដង់ស៊ីតេ"])
    entry(12, f.save("l12-chart-map"), "ក្រាបលើផែនទី",
          ["របារពីរក្នុងខេត្តនីមួយៗ ប្រៀបធៀបអថេរពីរ។", "ស័ក្តិសមសម្រាប់ចំនួនអថេរតិច (២–៣)។", "ផែនទីពហុអថេរស្មុគស្មាញ៖ សួរថាតើផែនទីពីរដាច់ពីគ្នាល្អជាងឬទេ។"], .4)

def L13():
    # point label positions
    f = Fig(1000, 440).title("ទីតាំងស្លាកចំណុច តាមអាទិភាព (Imhof)")
    x, y = 300, 240; f.circle(x, y, 9, "#c62828")
    pos = [(1, 30, -18, "start"), (2, -30, -18, "end"), (3, 30, 30, "start"), (4, -30, 30, "end"), (5, 0, -34, "middle"), (6, 0, 46, "middle"), (7, 34, 6, "start"), (8, -34, 6, "end")]
    for n_, dx, dy, an in pos: f.text(x + dx, y + dy, f"{kh(n_)} ភូមិ", 18 if n_ == 1 else 15, "#1b5e20" if n_ == 1 else "#607d8b", an, "bold" if n_ == 1 else "normal")
    f.text(560, 170, "១ = ខាងលើស្ដាំ (ល្អបំផុត)", 18, "#1b5e20", weight="bold"); f.text(560, 210, "បើជាន់ ប្ដូរទៅទីតាំងបន្ទាប់", 17); f.text(560, 250, "ស្លាកមិនគួរឆ្លងទន្លេ ឬព្រំដែន", 17); f.text(560, 290, "QGIS៖ Placement → Cartographic", 17, IND)
    entry(13, f.save("l13-point-positions"), "ទីតាំងស្លាកចំណុច",
          ["ទីតាំងខាងលើស្ដាំងាយអានជាងគេ ព្រោះយើងអានពីឆ្វេងទៅស្ដាំ។", "ស្លាកត្រូវនៅជិត ហើយច្បាស់ថាជារបស់ចំណុចណា។", "ជៀសវាងស្លាកឆ្លងខ្សែ ព្រោះបន្ទាត់កាត់អក្សរ។"], .3)
    # hierarchy of names on map
    f = Fig(1000, 540).title("ឋានានុក្រមអក្សរលើផែនទីកម្ពុជា")
    prov_map(f, 40, 80, 1.7, fill=lambda p: "#fafafa", stroke="#cfd8dc")
    q = lambda en: (40 + pcentre(en)[0] * 1.7, 80 + pcentre(en)[1] * 1.7)
    x, y = q("Phnom Penh"); f.circle(x, y, 6, "#212121"); f.text(x + 8, y - 6, "ភ្នំពេញ", 20, "#212121", weight="bold")
    for en, nm in [("Siemreap", "សៀមរាប"), ("Battambang", "បាត់ដំបង"), ("Kampot", "កំពត"), ("Kratie", "ក្រចេះ")]:
        x, y = q(en); f.circle(x, y, 4, "#424242"); f.text(x + 6, y - 4, nm, 15, "#424242")
    f.text(220, 205, "បឹងទន្លេសាប", 14, "#0277bd", extra='font-style="italic" transform="rotate(-35 220 205)"')
    f.text(360, 150, "ទ ន្លេ មេ គ ង្គ", 13, "#0277bd", extra='transform="rotate(80 360 150)" letter-spacing="2"')
    f.text(120, 440, "ឈូងសមុទ្រថៃ", 16, "#0277bd", extra='font-style="italic" letter-spacing="3"')
    f.text(620, 110, "រតនគិរី", 13, "#9e9e9e", extra='letter-spacing="4"')
    lg = [("រាជធានី", 20, "#212121", "bold"), ("ទីរួមខេត្ត", 15, "#424242", "normal"), ("ទឹក (ទ្រេត ខៀវ)", 15, "#0277bd", "normal"), ("តំបន់ (ឃ្លាតអក្សរ)", 14, "#9e9e9e", "normal")]
    for i, (t, s_, c_, w_) in enumerate(lg): f.text(700, 320 + i * 40, t, s_, c_, weight=w_)
    entry(13, f.save("l13-hierarchy"), "ឋានានុក្រមអក្សរ",
          ["ទំហំ និងភាពដិត បង្ហាញសារៈសំខាន់ (រាជធានី > ខេត្ត > ស្រុក)។", "ពណ៌ និងរចនាបង្ហាញប្រភេទ៖ ទឹកពណ៌ខៀវ។", "ឈ្មោះតំបន់ធំ ឃ្លាតអក្សរ ដើម្បីគ្របដណ្ដប់ផ្ទៃ។"], .1)
    # halo
    f = Fig(1000, 380).title("Halo (ស្រោមជុំវិញអក្សរ)")
    for i, halo in enumerate([False, True]):
        x0 = 60 + i * 470; f.add(f'<image href="../assets/img/slides/l05-hypso.png" x="{x0}" y="90" width="410" height="230" preserveAspectRatio="xMidYMid slice"/>')
        ex = 'stroke="#fff" stroke-width="4" paint-order="stroke"' if halo else ""
        f.text(x0 + 205, 215, "ភ្នំឱរ៉ាល់ ១ ៨១៣ ម", 26, "#212121", "middle", "bold", ex)
        f.text(x0 + 205, 350, "គ្មាន halo · អានពិបាក" if not halo else "halo ពណ៌ស ២ ភីកសែល", 16, "#c62828" if not halo else "#2e7d32", "middle", "bold")
    entry(13, f.save("l13-halo"), "ធ្វើឲ្យអក្សរអានបានលើផ្ទៃស្មុគស្មាញ",
          ["Halo ពណ៌ស (ឬពណ៌ផ្ទៃ) ផ្ដាច់អក្សរចេញពីផ្ទៃខាងក្រោយ។", "Halo ក្រាស់ពេក ធ្វើឲ្យផែនទីមើលទៅធ្ងន់។", "QGIS៖ Labels → Buffer → Size 1–2 មម។"], .55)
    # Khmer fonts
    f = Fig(1000, 420).title("ពុម្ពអក្សរខ្មែរលើផែនទី")
    for i, (fam, nm, use) in enumerate([("Moul", "Moul", "ចំណងជើង"), ("Battambang", "Battambang", "ស្លាក និងអត្ថបទ"), ("Siemreap", "Siemreap", "អត្ថបទតូច")]):
        y = 130 + i * 95; f.text(40, y, "ខេត្តកំពង់ឆ្នាំង", 34, INK, extra=f'font-family="{fam}"'); f.text(520, y - 8, nm, 20, IND, weight="bold"); f.text(520, y + 20, use, 16, "#607d8b")
    entry(13, f.save("l13-khmer-fonts"), "ជ្រើសពុម្ពអក្សរខ្មែរ",
          ["Moul ដិត និងតុបតែង៖ សម្រាប់ចំណងជើងប៉ុណ្ណោះ។", "Battambang ច្បាស់ និងមានដិត៖ សម្រាប់ស្លាកផែនទី។", "ពិនិត្យជើងអក្សរ និងស្រៈលើ/ក្រោម ពេលកំណត់គម្លាតបន្ទាត់។"], .7)
    # label density at scale
    f = Fig(1000, 420).title("ស្លាកច្រើនពេក ធៀបនឹងស្លាកជ្រើសរើស")
    prov_map(f, 20, 90, 1.2, labels=True, lsize=9); f.text(210, 410, "ដាក់ស្លាកទាំង ២៥ ខេត្ត៖ ច្របូកច្របល់", 15, "#c62828", "middle", "bold")
    prov_map(f, 520, 90, 1.2)
    for en in ("Phnom Penh", "Siemreap", "Battambang", "Kampot", "Kratie", "Preah Sihanouk"):
        c = next(c for c in PROV["ctr"] if c["name"] == next(p["name"] for p in PROV["prov"] if p["en"] == en)); f.text(520 + c["xy"][0] * 1.2, 90 + c["xy"][1] * 1.2, c["name"], 12, INK, "middle", "bold")
    f.text(710, 410, "៦ ខេត្តដែលពាក់ព័ន្ធនឹងសារ", 15, "#2e7d32", "middle", "bold")
    entry(13, f.save("l13-label-density"), "ស្លាកអ្វីខ្លះ?",
          ["ដាក់ស្លាកតែអ្វីដែលអ្នកអានត្រូវការ ដើម្បីយល់សារ។", "នៅមាត្រដ្ឋានតូច ដាក់តែទីក្រុងធំ និងទន្លេធំ។", "សញ្ញាសម្គាល់ ឬតារាងអាចជំនួសស្លាកបាន។"], .88)

def L14():
    # layout anatomy A4 landscape
    f = Fig(1000, 560).title("ប្លង់ A4 ផ្ដេក៖ តំបន់ និងឋានានុក្រម")
    f.rect(80, 80, 840, 460, "#fff", "#90a4ae", 2)
    f.rect(100, 95, 800, 50, "#e8eaf6"); f.text(500, 128, "ចំណងជើង (ធំ ដិត) · អនុចំណងជើង", 18, IND, "middle", "bold")
    f.rect(100, 160, 560, 360, "#fff3e0"); f.text(380, 345, "តំបន់ផែនទី (៦០–៧០% នៃទំព័រ)", 20, "#e65100", "middle", "bold")
    f.rect(680, 160, 220, 150, "#e8f5e9"); f.text(790, 240, "សញ្ញាសម្គាល់", 16, "#2e7d32", "middle")
    f.rect(680, 325, 220, 100, "#eceff1"); f.text(790, 380, "ផែនទីទីតាំង", 16, "#546e7a", "middle")
    f.rect(680, 440, 220, 80, "#fafafa", "#cfd8dc"); f.text(790, 470, "មាត្រដ្ឋាន · ទិស", 14, "#546e7a", "middle"); f.text(790, 500, "ប្រភព · អ្នកធ្វើ · ឆ្នាំ", 14, "#546e7a", "middle")
    entry(14, f.save("l14-a4-anatomy"), "កាយវិភាគប្លង់",
          ["តំបន់ផែនទីធំជាងគេ និងនៅកណ្ដាលភ្នែក។", "ធាតុជំនួយ (សញ្ញាសម្គាល់ ទិស ប្រភព) ដាក់ជាក្រុមម្ខាង។", "ទុកគែមទំនេរ ៥–១០ មម ជុំវិញ ដើម្បីកុំឲ្យបោះពុម្ពកាត់។"], .1)
    # balance bad vs good
    f = Fig(1000, 440).title("តុល្យភាពប្លង់៖ ខ្សោយ ធៀបនឹងល្អ")
    f.rect(40, 90, 420, 300, "#fff", "#bdbdbd"); prov_map(f, 60, 180, .75); f.rect(300, 100, 150, 70, "#e8f5e9"); f.rect(60, 100, 90, 60, "#e8eaf6"); f.rect(330, 300, 120, 80, "#eceff1"); f.rect(200, 110, 60, 20, "#ffe0b2")
    f.text(250, 420, "ធាតុរាយប៉ាយ ផែនទីតូច", 15, "#c62828", "middle", "bold")
    f.rect(540, 90, 420, 300, "#fff", "#bdbdbd"); f.rect(555, 100, 390, 34, "#e8eaf6"); prov_map(f, 555, 145, .9); f.rect(835, 150, 110, 110, "#e8f5e9"); f.rect(835, 270, 110, 60, "#eceff1"); f.rect(835, 340, 110, 40, "#fafafa", "#cfd8dc")
    f.text(750, 420, "តម្រង់ជួរ ផែនទីធំ ធាតុជាក្រុម", 15, "#2e7d32", "middle", "bold")
    entry(14, f.save("l14-balance"), "តុល្យភាព និងការតម្រង់ជួរ",
          ["តម្រង់គែមធាតុលើបន្ទាត់ក្រឡាដូចគ្នា (grid)។", "ជៀសវាងទំហំទំនេរ «ខ្វះចេតនា» នៅជ្រុងមួយ។", "ផែនទីកម្ពុជារាងជិតការ៉េ៖ ដាក់សញ្ញាសម្គាល់ក្នុងកន្លែងសមុទ្រខាងឆ្វេងក្រោមបាន។"], .35)
    # portrait vs landscape with Cambodia shape
    f = Fig(1000, 460).title("ទិសក្រដាសតាមរាងតំបន់")
    f.rect(120, 90, 230, 330, "#fff", "#90a4ae", 2); prov_map(f, 130, 170, .7); f.text(235, 445, "បញ្ឈរ៖ ទំនេរលើ–ក្រោម", 15, "#c62828", "middle")
    f.rect(480, 120, 430, 280, "#fff", "#90a4ae", 2); prov_map(f, 500, 135, 1.0); f.rect(830, 150, 70, 110, "#e8f5e9"); f.text(695, 445, "ផ្ដេក៖ ផែនទីធំ + សញ្ញាសម្គាល់ខាងស្ដាំ", 15, "#2e7d32", "middle")
    entry(14, f.save("l14-orientation"), "បញ្ឈរ ឬផ្ដេក?",
          ["រាងកម្ពុជាទូលាយជាងកម្ពស់បន្តិច៖ ផ្ដេកសមជាង។", "ខេត្តវែងបញ្ឈរ (ឧ. កោះកុង) អាចសមនឹងបញ្ឈរ។", "សម្រេចទិសក្រដាសមុនរៀបចំធាតុផ្សេងទៀត។"], .6)
    # legend do/don't
    f = Fig(1000, 440).title("សញ្ញាសម្គាល់៖ មិនល្អ ធៀបនឹងល្អ")
    f.rect(60, 90, 400, 290, "#fff", "#e57373", 2); f.text(80, 125, "Legend", 18, INK, weight="bold")
    for i, t in enumerate(["dens_2019 (0 - 49.99999)", "dens_2019 (50 - 99.99999)", "dens_2019 (100 - 199.9999)", "dens_2019 (200 - 399.9999)", "dens_2019 (400 - 2049)"]): f.rect(80, 145 + i * 40, 30, 22, SEQ[i]); f.text(120, 162 + i * 40, t, 14, "#555")
    f.rect(540, 90, 400, 290, "#fff", "#81c784", 2); f.text(560, 125, "ដង់ស៊ីតេប្រជាជន", 18, INK, weight="bold"); f.text(560, 147, "នាក់ ក្នុង ១ គម² · ២០១៩", 13, "#607d8b")
    for i, t in enumerate(["តិចជាង ៥០", "៥០ – ១០០", "១០០ – ២០០", "២០០ – ៤០០", "៤០០ ឡើងទៅ"]): f.rect(560, 165 + i * 38, 30, 22, SEQ[i], "#bdbdbd", .5); f.text(600, 182 + i * 38, t, 16)
    entry(14, f.save("l14-legend"), "សរសេរសញ្ញាសម្គាល់ឲ្យមនុស្សអាន",
          ["កុំប្រើឈ្មោះវាល (dens_2019) ឬលេខទសភាគវែង។", "ចំណងជើងសញ្ញាសម្គាល់ ប្រាប់អថេរ ឯកតា និងឆ្នាំ។", "លេខមូល និងពាក្យ «តិចជាង / ឡើងទៅ» អានលឿនជាង។"], .8)

def L15():
    # generalisation operators
    f = Fig(1000, 520).title("ប្រតិបត្តិការធ្វើឲ្យទូទៅប្រាំមួយ")
    ops = ["ជ្រើសរើស", "ធ្វើឲ្យសាមញ្ញ", "ធ្វើឲ្យរលោង", "បូកបញ្ចូល", "រំកិល", "បំផ្លើស"]
    for i, t in enumerate(ops):
        x, y = 40 + (i % 3) * 320, 90 + (i // 3) * 210; f.rect(x, y, 290, 180, "#fafafa", "#e0e0e0", 1, 10); f.text(x + 145, y + 170, t, 16, IND, "middle", "bold")
        L, R = x + 20, x + 160
        if i == 0:
            for q in range(12): f.circle(L + 10 + (q * 37) % 110, y + 30 + (q * 53) % 100, 4, "#546e7a")
            for q in range(4): f.circle(R + 20 + q * 25, y + 40 + (q * 31) % 90, 5, "#546e7a")
        if i == 1:
            pts = [(L + j * 11, y + 80 + 25 * math.sin(j * .9) + 8 * math.sin(j * 3.1)) for j in range(12)]; f.path("M" + " L".join(f"{a:.1f} {b:.1f}" for a, b in pts), "none", "#1e88e5", 2)
            f.path("M" + " L".join(f"{a + 140:.1f} {b:.1f}" for a, b in pts[::3] + [pts[-1]]), "none", "#1e88e5", 2)
        if i == 2:
            pts = [(L + j * 11, y + 80 + (15 if j % 2 else -15)) for j in range(12)]; f.path("M" + " L".join(f"{a:.1f} {b:.1f}" for a, b in pts), "none", "#1e88e5", 2)
            f.path("M" + " L".join(f"{a + 140:.1f} {y + 80 + 10 * math.sin(k_ * .5):.1f}" for k_, (a, b) in enumerate(pts)), "none", "#1e88e5", 2)
        if i == 3:
            for q in range(6): f.rect(L + (q % 3) * 35, y + 40 + (q // 3) * 45, 25, 30, "#8d6e63")
            f.rect(R + 5, y + 40, 100, 75, "#8d6e63")
        if i == 4:
            f.line(L, y + 90, L + 120, y + 90, "#c62828", 3); f.line(L, y + 95, L + 120, y + 95, "#1e88e5", 3)
            f.line(R, y + 80, R + 120, y + 80, "#c62828", 3); f.line(R, y + 100, R + 120, y + 100, "#1e88e5", 3)
        if i == 5:
            f.line(L, y + 90, L + 120, y + 90, "#c62828", .6); f.line(R, y + 90, R + 120, y + 90, "#c62828", 5)
        f.line(x + 140, y + 20, x + 140, y + 140, "#e0e0e0", 1, "4 3")
    entry(15, f.save("l15-operators"), "ប្រតិបត្តិការធ្វើឲ្យទូទៅ",
          ["ជ្រើសរើស៖ រក្សាតែវត្ថុសំខាន់ · សាមញ្ញ៖ លុបចំណុចកំពូល។", "រលោង៖ ធ្វើឲ្យខ្សែមិនរញ៉េរញ៉ៃ · បូកបញ្ចូល៖ អគារតូចៗ → តំបន់ក្រុង។", "រំកិល៖ ផ្លូវ និងទន្លេដែលជាន់គ្នា · បំផ្លើស៖ ផ្លូវតូចត្រូវដិតដើម្បីមើលឃើញ។"], .1)
    # simplification of Cambodia border with shapely
    from shapely.geometry import shape as shp
    khg = [shp(g["geometry"]) for g in ASIA["features"] if KHM(g)][0]
    f = Fig(1000, 440).title("ធ្វើឲ្យព្រំដែនកម្ពុជាសាមញ្ញ (Douglas–Peucker)")
    for i, tol in enumerate([0, .05, .15, .35]):
        g = khg.simplify(tol) if tol else khg
        geoms = list(g.geoms) if hasattr(g, "geoms") else [g]; minx, miny, maxx, maxy = khg.bounds; s = 210 / (maxx - minx)
        npts = 0
        for gg in geoms:
            xy = list(gg.exterior.coords); npts += len(xy)
            f.path("M" + " L".join(f"{30 + i * 245 + (x - minx) * s:.1f} {110 + (maxy - y) * s:.1f}" for x, y in xy) + "Z", "#c5cae9", IND, 1)
        f.text(135 + i * 245, 350, f"tolerance {kh(tol)}°", 16, IND, "middle", "bold"); f.text(135 + i * 245, 376, f"{kh(npts)} ចំណុច", 14, "#607d8b", "middle")
    entry(15, f.save("l15-simplify"), "ភាពសាមញ្ញ ធៀបនឹងភាពត្រឹមត្រូវ",
          ["ចំណុចតិច = ឯកសារតូច ផ្ទុកលឿនលើវេប។", "Tolerance ធំពេក ធ្វើឲ្យរាងខូច ហើយខេត្តជិតខាងអាចបែកចន្លោះ។", "ប្រើ tolerance ផ្សេងៗតាមមាត្រដ្ឋានបង្ហាញ។"], .25)
    # lying: truncated axis / area
    f = Fig(1000, 440).title("របៀបផែនទីបំភាន់៖ ពណ៌ក្រហមធ្វើឲ្យភ័យ")
    c = classify(0, [0, 50, 100, 200, 400], SEQ); prov_map(f, 30, 90, 1.2, fill=lambda p: c(p["dens"])); f.text(210, 410, "ពណ៌ពីស្រាលទៅដិត (អព្យាក្រឹត)", 15, IND, "middle", "bold")
    rr = ["#ffcdd2", "#e57373", "#e53935", "#b71c1c", "#4a0000"]; c2 = classify(0, [0, 50, 100, 200, 400], rr)
    prov_map(f, 530, 90, 1.2, fill=lambda p: c2(p["dens"])); f.text(710, 410, "ក្រហមឆ្អៅ៖ «គ្រោះថ្នាក់»", 15, "#c62828", "middle", "bold")
    entry(15, f.save("l15-persuasive"), "ពណ៌ និងអារម្មណ៍",
          ["ទិន្នន័យដូចគ្នា ប៉ុន្តែក្រហមឆ្អៅបង្កើតអារម្មណ៍គ្រោះថ្នាក់។", "ជ្រើសពណ៌ដែលត្រូវនឹងអត្ថន័យ៖ ដង់ស៊ីតេមិនមែនជាគ្រោះថ្នាក់ទេ។", "សួរ៖ តើផែនទីនេះធ្វើឲ្យអ្នកអានសម្រេចចិត្តខុសឬទេ?"], .45)
    # web publishing: tiles/vector workflow
    f = Fig(1000, 420).title("ផ្លូវចេញផ្សាយផែនទី")
    steps = [("QGIS", "#43a047"), ("PDF / PNG", "#1e88e5"), ("qgis2web / Leaflet", "#8e24aa"), ("GitHub Pages", "#fb8c00")]
    for i, (t, c_) in enumerate(steps):
        x = 50 + i * 235; f.rect(x, 150, 200, 90, c_, rx=14); f.text(x + 100, 203, t, 18, "#fff", "middle", "bold")
        if i < 3: f.line(x + 202, 195, x + 232, 195, "#607d8b", 3, arrow=True)
    f.text(250, 290, "បោះពុម្ព · ឯកសារ · របាយការណ៍", 15, "#1565c0", "middle"); f.text(720, 290, "ផែនទីអន្តរកម្មលើវេប · ឥតគិតថ្លៃ", 15, "#e65100", "middle")
    f.text(500, 360, "ចងចាំ៖ ប្រភព អាជ្ញាបណ្ណ និងកាលបរិច្ឆេទ ត្រូវតាមផែនទីទៅគ្រប់ទម្រង់", 15, "#607d8b", "middle")
    entry(15, f.save("l15-publish"), "ចេញផ្សាយផែនទី",
          ["PDF/PNG សម្រាប់បោះពុម្ព (៣០០ dpi) និងរបាយការណ៍។", "qgis2web បង្កើតគេហទំព័រ Leaflet ពី QGIS ដោយផ្ទាល់។", "GitHub Pages បង្ហោះគេហទំព័រឥតគិតថ្លៃ ដូចសៀវភៅនេះ។"], .75)
    # ethics checklist visual
    f = Fig(1000, 440).title("បញ្ជីត្រួតពិនិត្យមុនចេញផ្សាយ")
    items = ["ទិន្នន័យ៖ ប្រភព ឆ្នាំ អាជ្ញាបណ្ណ", "ចំណោល និងដាតុមត្រឹមត្រូវ", "ធ្វើឲ្យស្តង់ដារ (អត្រា មិនមែនចំនួន)", "ព្រំថ្នាក់មានហេតុផល", "ពណ៌សម្រាប់អ្នកខ្វះពណ៌", "ទិន្នន័យខ្វះបង្ហាញច្បាស់", "ឯកជនភាព៖ មិនបង្ហាញផ្ទះបុគ្គល"]
    for i, t in enumerate(items):
        y = 100 + i * 45; f.rect(60, y, 26, 26, "#fff", "#2e7d32", 2); f.path(f"M{65} {y+13} l6 7 l12 -14", "none", "#2e7d32", 3); f.text(100, y + 20, t, 18)
    prov_map(f, 620, 110, 1.0, fill=lambda p: classify(0, [0, 50, 100, 200, 400], SEQ)(p["dens"]))
    entry(15, f.save("l15-checklist"), "សីលធម៌ និងគុណភាព",
          ["ផែនទីមានឥទ្ធិពលលើការសម្រេចចិត្ត៖ ថវិកា សេវា និងគោលនយោបាយ។", "បញ្ជីត្រួតពិនិត្យនេះប្រើបានក្នុងគម្រោងបញ្ចប់វគ្គ។", "ឯកជនភាព៖ ទិន្នន័យកម្រិតផ្ទះ ត្រូវសរុបទៅកម្រិតភូមិ ឬឃុំ។"], .6)

if __name__ == "__main__":
    for fn in (L11, L12, L13, L14, L15): fn()
    print(len(MANIFEST), "visuals")
