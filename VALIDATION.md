# Validation — Cartography v2

## v3 document integration — 22 September 2026

- Inspected 13 source PDFs comprising 603 pages; combined extracted text with visual review of 39 representative pages.
- Strict MkDocs build passed and generated 43 HTML pages.
- Link/asset audit passed with no missing local targets, missing fragment targets, or external runtime assets.
- Three new SVG figures passed XML parsing; both new field simulator keys resolve to JavaScript initializers; the updated JavaScript passes Node syntax checking.
- New modules use local assets and the existing responsive course components. Original course typography and figure rules remain unchanged.
- Source screenshots and third-party illustrations were not copied into the course.

Validated on 20 September 2026 in headless desktop Chrome on Windows, with network access disabled in the browser context and direct `file://` page access.

## Passed

- Strict MkDocs build: 38 generated HTML pages.
- Local link/asset audit: no missing file targets, no missing fragment targets, and no remote runtime assets.
- All 15 lesson pages and all 15 lab pages loaded; every displayed simulator initialized.
- Existing simulator selectors, ranges, number inputs, checkboxes and segmented buttons were exercised, including boundary values. No JavaScript errors or non-finite numerical results were observed.
- All 45 new quiz questions accepted their correct answers and reported 3/3 per lesson.
- All 75 existing workbook self-check boxes accepted their documented answer/range.
- Desktop width 1360 px and phone width 390 px: no page-wide horizontal overflow on lesson pages.
- All 30 new SVG comparison images loaded and occupied visible space in the final build.
- Label/layout arrow-key movement and reset worked; label pointer dragging was checked separately.
- Time playback advanced; Pause stopped advancement. Web-map missing values produced a distinct explanation rather than zero.
- Equal-interval and exact Jenks calculations matched independent expected examples.
- Offline search for Mercator returned 5 result documents; homepage, sequential lesson navigation, error-page home link and opening page navigation worked.
- Bundled Siemreap, Battambang and Moul fonts loaded. No HTTP(S) requests occurred during the final full offline browser run.
- Representative desktop/mobile, comparison, label and light/dark web-map renders were inspected.

## Scope and limitations

The original full Cambodia.zip dataset was not present in the supplied archive. Some original practicals and their numeric answers still require that separate dataset. The bundled synthetic polygons, points, CSV and original synthetic DEM support offline practice; they are clearly identified as teaching data.

The course's browser behavior and build were tested. The complete sequence of desktop QGIS labs was not executed in QGIS, and the original PDF export pipeline was not run. Menus may vary across QGIS versions. This release includes the original source and a tested browser build, not a newly generated PDF.

Synthetic comparison drawings are schematic. The colour-vision view is an approximation. Automatic overlap feedback in the design tools supplements human judgment. Self-study answers are available in source and should not be treated as secure assessment items.

## Original styling restored

The original Siemreap/Battambang/Moul font definitions, body and heading sizes, line spacing, simulator typography, and figure/caption rules were restored. A browser comparison on all 15 lessons confirmed original elements have the same computed styles with and without the new-component stylesheet. All 32 original lesson SVG figures are present and their original asset files are byte-for-byte unchanged. All 30 added comparisons render as inline SVG in the original full-width figure style. Desktop/mobile rendering and all local links were rechecked after restoration.

The build now resolves figure snippets from the project directory and fails on missing snippet files, preventing silently omitted figures.
