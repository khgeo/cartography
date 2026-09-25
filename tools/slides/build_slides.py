"""Build one HTML slide deck per lesson from docs/lessons/lesson-XX.md.

    python tools/slides/build_slides.py        # -> docs/slides/lesson-01.html ... + docs/slides/index.md

Decks are self-contained HTML (inline SVG figures, local fonts, no CDN), so they work
offline, inside the MkDocs site, and when opened directly from disk.
Keys: → / Space next · ← previous · Home/End · F fullscreen · N speaker notes · P print (→ PDF).
Edit the lesson markdown, not the decks: rerun this script after changing a lesson.
"""
import os, re, html, io, base64

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(ROOT, "docs")
OUT = os.path.join(DOCS, "slides")

# ---- book settings (the only part to change for another book) -------------
BOOK = "ផែនទីវិទ្យា"
BOOK_EN = "Cartography"
BOOK_NO = "សៀវភៅទី១"
AUTHOR = "យាំ សារដ្ឋ · YAM Sarath"
ONLINE = "https://khgeo.github.io/cartography/"
PAGE_EXT = ".html"          # lesson page URLs: ".html" (offline plugin) or "/" (directory URLs)
C1, C2, C3, BG = "#283593", "#ffa000", "#1a237e", "#f5f6fc"   # primary, accent, dark, light
# ---------------------------------------------------------------------------

KM = "០១២៣៤៥៦៧៨៩"
kh = lambda n: "".join(KM[int(c)] if c.isdigit() else c for c in str(n))

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)\*(?!\w)", r"<i>\1</i>", t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = re.sub(r"\{[^}]*\}", "", t)
    return t

def sentences(par, n=1, maxlen=190):
    """First n Khmer sentences (split on ។ ? !) of a paragraph, shortened."""
    parts = re.findall(r"[^។?!]+[។?!]?", par.strip())
    out = "".join(parts[:n]).strip()
    return out if len(out) <= maxlen else out[:maxlen].rsplit(" ", 1)[0] + " …"

def table_html(rows, maxrows=7):
    rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
    rows = [r for r in rows if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
    if not rows: return ""
    head, body = rows[0], rows[1:maxrows + 1]
    return ("<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>" +
            "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body) + "</tbody></table>")

def svg_inline(rel):
    p = os.path.join(DOCS, rel)
    if not os.path.exists(p): return ""
    s = open(p, encoding="utf-8").read()
    s = re.sub(r"<\?xml[^>]*\?>", "", s)
    return re.sub(r"<svg\b", '<svg preserveAspectRatio="xMidYMid meet"', s, count=1)

def qr_svg(url):
    try:
        import qrcode, qrcode.image.svg
        img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, border=1)
        b = io.BytesIO(); img.save(b); s = b.getvalue().decode()
        return re.sub(r"<\?xml[^>]*\?>", "", s)
    except Exception:
        return ""

# ---- markdown walking ------------------------------------------------------
def blocks(md):
    """Yield ('h2'|'h3'|'par'|'list'|'table'|'figure'|'sim'|'adm'|'comparison', payload)."""
    lines = md.replace("\r", "").split("\n"); i = 0
    while i < len(lines):
        l = lines[i]
        if l.startswith("## "): yield ("h2", l[3:].strip()); i += 1; continue
        if l.startswith("### "): yield ("h3", l[4:].strip()); i += 1; continue
        if l.startswith("<div class=\"rich-comparison\""):
            figs, j = [], i + 1
            while j < len(lines) and not lines[j].startswith("</div>"):
                m = re.search(r'--8<-- "([^"]+)"', lines[j]); c = re.search(r"<figcaption>(.*?)</figcaption>", lines[j])
                if m: figs.append([m.group(1), ""])
                if c and figs: figs[-1][1] = re.sub("<[^>]+>", "", c.group(1))
                j += 1
            yield ("comparison", figs); i = j + 1; continue
        if l.startswith("<figure"):
            src, cap, j = None, "", i
            while j < len(lines) and "</figure>" not in lines[j]:
                m = re.search(r'--8<-- "([^"]+)"', lines[j]) or re.search(r'!\[[^\]]*\]\(([^)]+)\)', lines[j])
                if m: src = m.group(1)
                c = re.search(r"<figcaption>(.*?)</figcaption>", lines[j])
                if c: cap = re.sub("<[^>]+>", "", c.group(1))
                j += 1
            if src: yield ("figure", (src, cap))
            i = j + 1; continue
        m = re.match(r'<div class="sim" data-sim="([^"]+)"', l)
        if m: yield ("sim", m.group(1)); i += 1; continue
        m = re.match(r'!!!\s+(\w+)\s+"([^"]*)"', l)
        if m:
            body, j = [], i + 1
            while j < len(lines) and (lines[j].startswith("    ") or not lines[j].strip()):
                if lines[j].strip(): body.append(lines[j].strip())
                j += 1
            yield ("adm", (m.group(1), m.group(2), " ".join(body))); i = j; continue
        if l.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"): rows.append(lines[i]); i += 1
            yield ("table", rows); continue
        if re.match(r"\s*(\d+\.|-|\*)\s+", l):
            items = []
            while i < len(lines) and (re.match(r"\s*(\d+\.|-|\*)\s+", lines[i]) or (lines[i].startswith("   ") and lines[i].strip())):
                if re.match(r"\s*(\d+\.|-|\*)\s+", lines[i]): items.append(re.sub(r"^\s*(\d+\.|-|\*)\s+", "", lines[i]))
                else: items[-1] += " " + lines[i].strip()
                i += 1
            yield ("list", items); continue
        if l.strip() and not l.startswith(("<", "---", "#", "|")):
            par = [l.strip()]; i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r"(#|<|\||!!!|\s*(\d+\.|-|\*)\s)", lines[i]):
                par.append(lines[i].strip()); i += 1
            yield ("par", " ".join(par)); continue
        i += 1

# ---- slide builders ---------------------------------------------------------
def S(kind, title, body, notes="", sub=""):
    return dict(kind=kind, title=title, body=body, notes=notes, sub=sub)

def bullets(items, cls=""):
    return f'<ul class="{cls}">' + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ul>"

def deck(n, md):
    title = re.search(r"^# (.+)$", md, re.M).group(1).strip()
    short = title.split("៖", 1)[-1].strip()
    lesson_url = f"../lessons/lesson-{n:02d}{PAGE_EXT}"
    online = ONLINE + f"lessons/lesson-{n:02d}{PAGE_EXT if PAGE_EXT != '/' else '/'}"
    slides = [S("title", short, "", sub=title.split("៖")[0])]
    TITLE = slides[0]
    sec, sub, pending_sim = "", "", None
    theory_bul, theory_notes, theory_tables, figs, sims = [], [], [], [], []
    first_art = []

    def fig_art(src):
        return svg_inline(src) if src.endswith(".svg") else f'<img src="../{src.lstrip("./")}" alt="">'

    def flush_theory():
        """Emit the slides of one subsection: text (+ figure side by side when text is short), more figures, then sims."""
        nonlocal theory_bul, theory_notes, theory_tables, figs, sims
        title = sub or sec
        figs_left = list(figs)
        if theory_bul or theory_tables:
            if figs_left and len(theory_bul) <= 3 and not theory_tables:
                src, cap = figs_left.pop(0)
                slides.append(S("split", title, f'<div class="splitwrap"><div class="txt">{bullets(theory_bul)}</div><div class="fig"><div class="art">{fig_art(src)}</div><p class="cap">{inline(sentences(cap, 1, 170))}</p></div></div>', " ".join(theory_notes) + " " + cap))
            else:
                chunks = [theory_bul[k:k + 5] for k in range(0, max(1, len(theory_bul)), 5)] or [[]]
                for ci, ch in enumerate(chunks):
                    body = bullets(ch)
                    if ci == len(chunks) - 1 and theory_tables: body += theory_tables[0]
                    slides.append(S("content", title + (" (ត)" if ci else ""), body, " ".join(theory_notes)))
        for src, cap in figs_left:
            slides.append(S("figure", title, f'<div class="art">{fig_art(src)}</div><p class="cap">{inline(sentences(cap, 1, 220))}</p>', cap))
        slides.extend(sims)
        theory_bul, theory_notes, theory_tables, figs, sims = [], [], [], [], []

    obj, scen, scen_q, steps, mis, summ, core, terms, qs = [], [], [], [], [], [], "", [], []
    for kind, p in blocks(md):
        if kind == "h2":
            flush_theory(); sec = p; sub = ""; continue
        if kind == "h3":
            flush_theory(); sub = re.sub(r"^[\d០-៩.]+\s*", "", p) if "៣." in p or "ទ្រឹស្ដី" in sec else p
            if "ឧទាហរណ៍" in sec and p.startswith("ជំហាន"): steps.append([p.split("៖", 1)[-1].strip(), ""])
            continue
        in_obj = "គោលបំណង" in sec; in_scen = "ស្ថានភាពបើក" in sec; in_th = "ទ្រឹស្ដី" in sec
        in_ex = "ឧទាហរណ៍" in sec; in_mis = "ការយល់ច្រឡំ" in sec; in_sum = "សេចក្ដីសង្ខេប" in sec
        in_terms = "ពាក្យគន្លឹះ" in sec; in_q = "សំណួររំលឹក" in sec; in_ws = "សិក្ខាសាលា" in sec
        if kind == "list":
            if in_obj and not sub: obj += p
            elif in_scen: scen_q += p
            elif in_th: theory_bul += [sentences(x, 1, 170) for x in p]
            elif in_q and "យល់ដឹង" in sub: qs += p
        elif kind == "par":
            if in_scen: scen.append(p)
            elif in_th:
                theory_bul.append(sentences(p, 1)); theory_notes.append(p)
            elif in_ex and steps and not steps[-1][1]: steps[-1][1] = sentences(p, 1, 170)
            elif in_mis: mis.append(p)
            elif in_sum: summ.append(p)
        elif kind == "table":
            if in_th: theory_tables.append(table_html(p, 6))
            elif in_terms: terms = p
            elif in_mis: mis.append(table_html(p, 6))
        elif kind == "adm":
            typ, t, body = p
            if typ == "abstract" and in_sum: core = body
            elif typ == "example" and t.startswith("ពិសោធន៍"): pending_sim = (t.split("៖", 1)[-1].strip(), sentences(body, 2, 240))
            elif in_th and typ in ("note", "tip", "warning") and t: theory_bul.append(f"**{t}**៖ " + sentences(body, 1, 150))
        elif kind == "figure":
            src, cap = p
            if not first_art and src.endswith(".svg"): first_art.append(src)
            if not (in_th or in_ws or in_ex): continue
            figs.append((src, cap))
        elif kind == "comparison" and len(p) >= 2:
            flush_theory()
            cols = "".join(f'<div class="cmp {"bad" if i == 0 else "good"}"><div class="tag">{"មុន / ខ្សោយ" if i == 0 else "ក្រោយ / ល្អ"}</div><div class="art">{svg_inline(src)}</div><p class="cap">{inline(sentences(cap, 1, 150))}</p></div>' for i, (src, cap) in enumerate(p[:2]))
            slides.append(S("compare", "ប្រៀបធៀប៖ មុន និងក្រោយ", f'<div class="cmpwrap">{cols}</div>'))
        elif kind == "sim":
            t, instr = pending_sim or ("ពិសោធន៍អន្តរកម្ម", "")
            sims.append(S("sim", "ពិសោធន៍៖ " + t,
                f'<div class="simbox"><div><p>{inline(instr)}</p><a class="btn" href="{lesson_url}" target="_blank">បើកពិសោធន៍ក្នុងមេរៀន ↗</a>'
                f'<p class="small">ពិសោធន៍ <code>{p}</code> · ស្កេន QR ដើម្បីបើកលើទូរស័ព្ទ</p></div><div class="qr">{qr_svg(online)}</div></div>', instr))
            pending_sim = None
    flush_theory()

    # assemble fixed slides in teaching order
    head = [slides[0]]
    if obj: head.append(S("content", "គោលបំណងសិក្សា", bullets(obj, "num")))
    if scen:
        head.append(S("scenario", "ស្ថានភាពបើកមេរៀន", f'<p class="lead">{inline(sentences(scen[0], 3, 360))}</p>' + (bullets(scen_q, "q") if scen_q else ""), " ".join(scen)))
    tail = []
    if steps: tail.append(S("content", "ឧទាហរណ៍ដែលបានដោះស្រាយ", '<ol class="steps">' + "".join(f"<li><b>{inline(a)}</b><br><span>{inline(b)}</span></li>" for a, b in steps[:6]) + "</ol>"))
    if mis:
        tbl = next((m for m in mis if m.startswith("<table")), None)
        if tbl: body = tbl
        else:
            pairs = re.findall(r"\*\*[^*]*?«(.+?)»\*\*\s*(.*)", "\n".join(mis))
            body = '<div class="mis">' + "".join(f'<div><span class="x">✗ {inline(a)}</span><span class="v">✓ {inline(sentences(b, 1, 150))}</span></div>' for a, b in pairs[:5]) + "</div>"
        tail.append(S("content", "ការយល់ច្រឡំដែលត្រូវប្រុងប្រយ័ត្ន", body))
    if summ or core:
        tail.append(S("summary", "សេចក្ដីសង្ខេប", bullets([sentences(x, 2, 260) for x in summ[:3]]) + (f'<div class="core">{inline(core)}</div>' if core else "")))
    if terms: tail.append(S("content", "ពាក្យគន្លឹះ", table_html(terms, 8)))
    if qs: tail.append(S("content", "សំណួររំលឹក", bullets(qs[:5], "num")))
    tail.append(S("end", "អរគុណ", f'<p class="lead">សូមអានមេរៀនពេញ និងធ្វើលំហាត់ទី{kh(n)} ក្នុង QGIS</p><div class="endqr">{qr_svg(online)}</div><p class="small">{online}</p>'))
    if first_art: TITLE["body"] = f'<div class="tart">{svg_inline(first_art[0])}</div>'
    return title, head + slides[1:] + tail

# ---- HTML -------------------------------------------------------------------
CSS = """
@font-face{font-family:Siemreap;src:url(../assets/fonts/Siemreap.ttf)} @font-face{font-family:Battambang;src:url(../assets/fonts/Battambang-Regular.ttf)}
@font-face{font-family:Battambang;font-weight:700;src:url(../assets/fonts/Battambang-Bold.ttf)} @font-face{font-family:Moul;src:url(../assets/fonts/Moul-Regular.ttf)}
*{box-sizing:border-box} html,body{margin:0;height:100%;background:#1c1c24;font-family:Battambang,Siemreap,sans-serif;overflow:hidden}
#stage{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:0 0}
.slide{position:absolute;inset:0;background:#fff;display:none;padding:56px 72px 60px;color:#222;overflow:hidden}
.slide.on{display:block} .slide h2{font-family:Battambang;font-weight:700;color:C1;font-size:38px;margin:0 0 26px;padding-bottom:12px;border-bottom:4px solid C2;line-height:1.5}
.slide ul,.slide ol{font-size:27px;line-height:1.75;margin:0;padding-left:1.1em} .slide li{margin:.25em 0} .slide li::marker{color:C2}
ul.num{list-style:none;counter-reset:n;padding-left:0} ul.num li{counter-increment:n;padding-left:2.1em;position:relative}
ul.num li::before{content:counter(n);position:absolute;left:0;top:.18em;width:1.45em;height:1.45em;border-radius:50%;background:C1;color:#fff;font-size:.72em;display:flex;align-items:center;justify-content:center}
ul.q li{color:C3;font-weight:700}
.lead{font-size:28px;line-height:1.8;margin:0 0 18px} .small{font-size:18px;color:#666}
table{border-collapse:collapse;font-size:21px;line-height:1.55;margin-top:18px;width:100%} th{background:C1;color:#fff;text-align:left;padding:8px 12px;font-weight:700}
td{padding:7px 12px;border-bottom:1px solid #e3e3ea;vertical-align:top} tr:nth-child(even) td{background:BG}
code{font-family:monospace;background:#eef;padding:0 .25em;border-radius:3px;font-size:.9em}
.art{height:520px;display:flex;align-items:center;justify-content:center} .art svg,.art img{max-width:100%;max-height:100%;width:auto;height:100%}
.figure .art{height:470px} .cap{font-size:19px;color:#555;text-align:center;margin:8px 60px 0;line-height:1.55}
.figure h2,.compare h2,.sim h2{margin-bottom:12px}
.cmpwrap{display:flex;gap:28px} .cmp{flex:1;border:3px solid #ddd;border-radius:10px;padding:10px 12px 6px} .cmp .art{height:390px}
.cmp.bad{border-color:#e57373} .cmp.good{border-color:#66bb6a} .tag{font-weight:700;font-size:20px} .bad .tag{color:#c62828} .good .tag{color:#2e7d32}
.cmp .cap{margin:6px 0 0;font-size:17px}
.simbox{display:flex;gap:40px;align-items:center;font-size:26px;line-height:1.8} .simbox p{margin:0 0 20px}
.qr svg{width:260px;height:260px} .btn{display:inline-block;background:C1;color:#fff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700;font-size:24px;margin-bottom:18px}
.splitwrap{display:flex;gap:34px;align-items:flex-start} .splitwrap .txt{flex:1 1 42%} .splitwrap .fig{flex:1 1 58%} .splitwrap .art{height:440px} .splitwrap ul{font-size:25px}
.tart{position:absolute;right:60px;bottom:70px;width:560px;height:330px;background:#fff;border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.tart svg{max-width:100%;max-height:100%;width:auto;height:100%}
.steps{font-size:23px!important} .steps li{margin-bottom:.3em} .steps span{font-size:.85em;color:#444}
.mis div{display:flex;gap:18px;font-size:23px;line-height:1.6;margin-bottom:14px;border-left:6px solid C2;padding:6px 14px;background:BG}
.mis .x{flex:1;color:#c62828} .mis .v{flex:1.3;color:#1b5e20}
.core{margin-top:26px;font-size:27px;line-height:1.7;background:C1;color:#fff;border-radius:10px;padding:18px 26px;border-left:12px solid C2}
.title{background:linear-gradient(135deg,C3,C1);color:#fff;padding:80px 90px} .title .kick{color:C2;font-size:26px;letter-spacing:1px}
.title h1{font-family:Moul;font-weight:400;font-size:58px;line-height:1.55;margin:26px 0 30px;max-width:1050px}
.title .rule{width:280px;height:6px;background:C2;margin-bottom:34px} .title .meta{font-size:24px;opacity:.9;line-height:1.8}
.end{text-align:center;padding-top:70px} .end h2{border:0;font-family:Moul;font-weight:400;font-size:54px} .endqr svg{width:220px;height:220px}
.foot{position:absolute;left:72px;right:72px;bottom:18px;display:flex;justify-content:space-between;font-size:15px;color:#9a9aa8}
.title .foot{color:rgba(255,255,255,.65)}
#bar{position:fixed;left:0;bottom:0;height:5px;background:C2;transition:width .2s}
#ui{position:fixed;right:14px;bottom:12px;display:flex;gap:6px;font-size:14px;color:#eee;align-items:center;font-family:sans-serif;background:rgba(20,20,30,.6);padding:4px 6px;border-radius:7px}
#ui button{background:#333;color:#eee;border:0;border-radius:5px;padding:6px 10px;cursor:pointer;font-size:14px}
#notes{position:fixed;left:0;right:0;bottom:0;max-height:32%;overflow:auto;background:#fffde7;color:#333;font-size:17px;line-height:1.7;padding:14px 24px;display:none;border-top:3px solid C2;font-family:Battambang}
body.shownotes #notes{display:block}
@media print{@page{size:1280px 720px;margin:0} html,body{height:auto;overflow:visible;background:#fff}
 #stage{position:static;transform:none!important;width:auto;height:auto} .slide{display:block!important;position:relative;width:1280px;height:720px;page-break-after:always}
 #ui,#bar,#notes{display:none!important}}
"""

JS = """
const S=[...document.querySelectorAll('.slide')],st=document.getElementById('stage'),bar=document.getElementById('bar'),no=document.getElementById('no'),nt=document.getElementById('notes');
let i=Math.max(0,Math.min(S.length-1,(parseInt(location.hash.slice(1))||1)-1));
function fit(){const k=Math.min(innerWidth/1280,innerHeight/720);st.style.transform=`translate(${-640*k}px,${-360*k}px) scale(${k})`;}
function go(n){i=Math.max(0,Math.min(S.length-1,n));S.forEach((s,j)=>s.classList.toggle('on',j===i));bar.style.width=((i+1)/S.length*100)+'%';
 no.textContent=(i+1)+' / '+S.length;history.replaceState(null,'','#'+(i+1));const a=S[i].querySelector('aside');nt.textContent=a?a.textContent:'';}
addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' ','Enter'].includes(e.key)){go(i+1);e.preventDefault()}
 else if(['ArrowLeft','PageUp','Backspace'].includes(e.key)){go(i-1);e.preventDefault()} else if(e.key==='Home')go(0); else if(e.key==='End')go(S.length-1);
 else if(e.key==='f'||e.key==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}
 else if(e.key==='n'||e.key==='N')document.body.classList.toggle('shownotes'); else if(e.key==='p'||e.key==='P')print();});
st.addEventListener('click',e=>{if(e.target.closest('a'))return;const r=st.getBoundingClientRect();go(e.clientX>r.left+r.width/3?i+1:i-1)});
let tx=null;addEventListener('touchstart',e=>tx=e.touches[0].clientX);addEventListener('touchend',e=>{if(tx===null)return;const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)go(d<0?i+1:i-1);tx=null});
document.getElementById('prev').onclick=()=>go(i-1);document.getElementById('next').onclick=()=>go(i+1);
document.getElementById('fs').onclick=()=>document.documentElement.requestFullscreen();document.getElementById('pn').onclick=()=>document.body.classList.toggle('shownotes');
document.getElementById('pr').onclick=()=>print();
addEventListener('resize',fit);fit();go(i);
"""

def render(n, title, slides):
    css = CSS.replace("C1", C1).replace("C2", C2).replace("C3", C3).replace("BG", BG)
    parts = []
    for k, s in enumerate(slides, 1):
        foot = f'<div class="foot"><span>{BOOK_NO} · {BOOK} · មេរៀនទី{kh(n)}</span><span>{kh(k)}</span></div>'
        notes = f"<aside hidden>{html.escape(s['notes'])}</aside>" if s["notes"] else ""
        if s["kind"] == "title":
            parts.append(f'<section class="slide title"><div class="kick">{BOOK_NO} · {BOOK} ({BOOK_EN})</div><h1>{inline(s["title"])}</h1><div class="rule"></div>'
                         f'<div class="meta">{inline(s["sub"])} នៃ ១៥ · ៣ ម៉ោង<br>{AUTHOR}</div>{s["body"]}{foot}</section>')
        elif s["kind"] == "end":
            parts.append(f'<section class="slide end"><h2>{s["title"]}</h2>{s["body"]}{foot}</section>')
        else:
            parts.append(f'<section class="slide {s["kind"]}"><h2>{inline(s["title"])}</h2>{s["body"]}{notes}{foot}</section>')
    return (f'<!doctype html><html lang="km"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>ស្លាយ · {html.escape(title)}</title><style>{css}</style></head><body><div id="stage">{"".join(parts)}</div>'
            f'<div id="bar"></div><div id="notes"></div><div id="ui"><button id="prev" title="ថយក្រោយ (←)">◀</button><span id="no"></span>'
            f'<button id="next" title="បន្ទាប់ (→)">▶</button><button id="pn" title="កំណត់ចំណាំគ្រូ (N)">N</button><button id="fs" title="ពេញអេក្រង់ (F)">⛶</button>'
            f'<button id="pr" title="បោះពុម្ព / PDF (P)">PDF</button></div><script>{JS}</script></body></html>')

def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for n in range(1, 16):
        p = os.path.join(DOCS, "lessons", f"lesson-{n:02d}.md")
        if not os.path.exists(p): continue
        title, slides = deck(n, open(p, encoding="utf-8").read())
        open(os.path.join(OUT, f"lesson-{n:02d}.html"), "w", encoding="utf-8").write(render(n, title, slides))
        rows.append((n, title, len(slides)))
        print(f"lesson {n:02d}: {len(slides)} slides")
    idx = ["# ស្លាយបង្រៀន", "",
           "ស្លាយសម្រាប់បង្រៀនមេរៀននីមួយៗ នៅក្នុងថ្នាក់។ ស្លាយបង្កើតដោយស្វ័យប្រវត្តិពីខ្លឹមសារមេរៀន (គោលបំណង ស្ថានភាពបើកមេរៀន ទ្រឹស្ដីស្នូល រូបភាព ពិសោធន៍ ឧទាហរណ៍ ការយល់ច្រឡំ សេចក្ដីសង្ខេប ពាក្យគន្លឹះ និងសំណួររំលឹក)។", "",
           '!!! tip "របៀបប្រើ"',
           "    ចុចលើចំណងជើង ដើម្បីបើកស្លាយក្នុងផ្ទាំងថ្មី។ **→ / Space** ស្លាយបន្ទាប់ · **←** ថយក្រោយ · **F** ពេញអេក្រង់ · **N** កំណត់ចំណាំគ្រូ · **P** បោះពុម្ព ឬរក្សាទុកជា PDF (ជ្រើស «Save as PDF» ក្នុងប្រអប់បោះពុម្ព)។ ស្លាយប្រើបានដោយគ្មានអ៊ីនធឺណិត។", "",
           "| មេរៀន | ចំណងជើង | ស្លាយ |", "|---|---|---|"]
    for n, t, k in rows:
        idx.append(f'| {kh(n)} | <a href="lesson-{n:02d}.html" target="_blank">{t.split("៖", 1)[-1].strip()}</a> | {kh(k)} |')
    open(os.path.join(OUT, "index.md"), "w", encoding="utf-8").write("\n".join(idx) + "\n")

if __name__ == "__main__":
    main()
