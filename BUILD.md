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
