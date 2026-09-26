# Rebuilding the course

The finished course can be read without installing anything: open `START_HERE.html` after extracting the ZIP.

To edit and rebuild:

```text
python -m pip install -r requirements.txt
python -m mkdocs build --strict
```

Run these from this project directory. The build uses MkDocs 1.6 and Material 9; the existing dependency ceilings are retained. The bundled build was produced with MkDocs 1.6.1, Material 9.7.7, and pymdown-extensions 12.0.1.

The offline plugin intentionally emits `.html` page URLs. Preserve this setting: it makes file-based navigation reliable. `tools/offline_hook.py` regenerates `docs/assets/js/offline-data.js` from the local JSON/GeoJSON files and adjusts the standalone error page's paths.

Lesson content: `docs/lessons/`. Existing practicals: `docs/workbook/`. New components: `docs/assets/js/rich-lessons.js` and `docs/assets/css/rich-lessons.css`. New comparison illustrations: `docs/assets/svg/rich/`. Synthetic practice data: `docs/assets/data/practice/`.

The original PDF tooling is retained, but this release targets the browser course. Interactive controls do not become interactive in a printed PDF.

## Lesson slides

`tools/slides/build_slides.py` turns each lesson (`docs/lessons/lesson-XX.md`) into a full teaching deck (`docs/slides/lesson-XX.html`, about 65–75 slides for a 3-hour lesson) and writes `docs/slides/index.md`. The lesson's simulators, before/after comparisons and self-check quizzes run live inside the slides, using the same scripts and bundled data as the website, so the decks work offline. Never edit the decks by hand: edit the lesson and rerun

```text
python tools/slides/build_slides.py
```

The deploy workflow runs this automatically before `mkdocs build`. Keys in a deck: → / Space next · ← back · O overview · F fullscreen · N teacher notes · P print or save as PDF.

### Slide visuals

`tools/slides/build_visuals.py` draws the 98 figures used only in the slides (maps, diagrams, charts and satellite-image panels in `docs/assets/svg/slides/` and `docs/assets/img/slides/`) and writes `tools/slides/visuals.json`, which `build_slides.py` uses to place each figure, with its "សង្កេត" notes, inside the lesson's theory section. Five interactive widgets (`docs/assets/js/slide-widgets.js`: projection, classification, colour and proportional-symbol explorers) are placed the same way.

The figures are committed to the repository, so the deploy workflow only runs `build_slides.py`. Rerun `build_visuals.py` only when you change a figure. Data sources: the book's own Cambodia datasets, Natural Earth (public domain, `tools/slides/data/`), and Landsat 8 (USGS) / Sentinel-2 (Copernicus) imagery from Book 3, which must be available locally to regenerate the image panels.
