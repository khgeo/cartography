# Cartography v2 — rich interactive edition

## v3 — existing teaching documents integrated

- Reviewed 13 existing Cartography PDFs (603 pages) using text extraction plus representative visual page inspection.
- Added five detailed field and digital practice modules: map sheets/map use, GPS/GNSS, Avenza offline mapping, Google Earth/Maps, and Total Station-to-QGIS.
- Added original local SVG diagrams for the map-sheet workflow, GNSS data chain, and Total Station orientation.
- Added offline interactive models for GNSS position quality and Total Station polar calculation/orientation error.
- Added Cambodia-specific examples, field checklists, good/bad practice comparisons, worked calculations, QC procedures, mini challenges, answer-reveal checks, and QGIS handoffs.
- Linked the new resources from relevant existing lessons and the home page while preserving the 15-lesson, 45-hour course architecture.
- Preserved the restored original fonts, sizes, heading styles, and figure/caption treatment. No source-slide screenshots were copied.
- Strict build now contains 43 HTML pages and remains self-contained for offline use.

The original Khmer-first MkDocs architecture, 15 lessons, 15 QGIS labs, syllabus, glossary, existing graphics, and original datasets are preserved.

## Added across every lesson

- A guided visual workshop with a local teaching scenario and deeper conceptual explanations.
- A before/after comparison with explanatory captions: 30 new SVG illustrations in total.
- A worked calculation or design decision, a prediction–observation activity, a mini challenge, a QGIS connection, and submission criteria.
- Three self-study questions with immediate explanatory feedback: 45 new questions in total. Answers remain readable without JavaScript.
- Links between the enriched lessons, existing labs, and the new offline practice guide.

## Seven new interactive tools

| Lesson | Tool | Learner action |
|---|---|---|
| 4 | Zoom and scale | Change zoom; inspect map extent, symbols, detail and scale bar |
| 8 | Palette lab | Compare palette types, grayscale and text/background contrast |
| 10 | Proportional-symbol editor | Change population; compare correct area scaling with incorrect radius scaling |
| 12 | Time player | Step, play and pause a three-year series with fixed class breaks |
| 13 | Label studio | Drag or use arrow keys; receive overlap, obstruction and distance feedback |
| 14 | Layout studio | Rearrange title, legend and source; inspect overlap with the map |
| 15 | Offline web map | Switch year, zoom, pan, select units and use an accessible data table |

## Improved existing tools and accuracy

- Fixed the scale simulator's undefined variable and prevented negative distances.
- Replaced the k-means approximation labeled as Jenks with an exact dynamic-programming natural-breaks calculation.
- Added keyboard-operated contour endpoints and protected the slope calculation when endpoints coincide.
- Added IDW power and sample-count controls; improved pointer handling.
- Updated colour-vision simulation matrices and labeled the result as an approximation.
- Corrected the coordinate-order explanation, contour interval counting, and an unsupported geographic comparison.
- Added a note distinguishing original illustrative area measurements from measurements reproducible with the supplied data.
- Preserved the original Siemreap/Battambang/Moul typography, original text sizes and figure styling; added focus states, feedback, reset controls and reduced-motion handling.

## Offline delivery

- Ready-to-read `site/` build and `START_HERE.html` entry point.
- Bundled Khmer fonts with their SIL OFL licenses.
- Local simulator data embedded for direct `file://` reading; local offline-search shim and index.
- Removed external font/Leaflet dependencies and automatic GitHub statistics requests.
- Six synthetic practice polygons, six centres, a CSV and field/provenance notes for QGIS exercises.
- A MkDocs hook regenerates the local data bundle on future builds.

New comparisons, scenarios and practice data are teaching examples, not official Cambodian statistics. The original full external Cambodia dataset is not bundled. See `VALIDATION.md` for the tested scope.

## Styling restoration

Restored the original font definitions, sizes, line spacing, heading styles, simulator text sizing and figure presentation. Corrected a malformed stylesheet import removal that had prevented the font variables from taking effect. Added comparison illustrations now use the same inline SVG and full-width figure treatment as the original diagrams. Local font files retain offline operation.
