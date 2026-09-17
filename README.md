# ផែនទីវិទ្យា

## Cartography: a Khmer-language textbook (Book 1 of 4)

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

A one-semester (15-lesson, 45-hour) undergraduate cartography textbook written **in Khmer**, with a self-study QGIS workbook and examples drawn entirely from Cambodia.

📖 **Read online:** https://khgeo.github.io/cartography/
📚 **The whole series:** https://khgeo.github.io/

| | |
|---|---|
| Lessons | 15 (theory, 3 hours each) |
| Labs | 15 (QGIS practicals with real Cambodian data) |
| Interactive | Simulators, quizzes, web maps and self-check boxes |
| Software | QGIS 3.34 LTR, free and open source |
| Level | Year 2, Semester 1 · Department of Geography and Land Management |
| License | CC BY-SA 4.0 |

## The series

| Book | Title | Repository |
|---|---|---|
| **1** | **Cartography** (this book) | `khgeo/cartography` |
| 2 | Fundamentals of GIS | [`khgeo/gis-fundamentals`](https://github.com/khgeo/gis-fundamentals) |
| 3 | Fundamentals of Remote Sensing | planned |
| 4 | Applied GIS and Remote Sensing | planned |

All books share one glossary, one Cambodia dataset (attached to the Book 2 release) and the same interactive toolkit (`docs/assets/js`).

## Build

```bash
pip install -r requirements.txt
mkdocs serve          # preview at http://127.0.0.1:8000
```

PDF: see `tools/pdf/` (same builder as Book 2).

## Citation

```
YAM Sarath [យាំ សារដ្ឋ] (2026). ផែនទីវិទ្យា [Cartography: A Khmer-language textbook]. CC BY-SA 4.0.
https://github.com/khgeo/cartography
```
