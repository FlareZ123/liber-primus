# Original LP2 font-slot gate: allrunes Type-1 and Junicode

**25 November 2026 decision: no exact face identification among tested fonts.** Partial result for [#2673](https://github.com/FlareZ123/liber-primus/issues/2673). All 216 locally installed allrunes Type-1 faces and 38 Junicode 2.209 OTF faces were screened. Best original match is about seven times the degraded-known-face distance. Historical Junicode 0.6.17 binaries and 0.7.8 source outlines were also screened; none approaches its own outline-render control. Everson Mono 6.2.1 remains an inaccessible historical candidate. No original plaintext or key recovered.

## Instrument and source
[Dukotah Round18 L1 §5](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round18/L1-toolchain/RESULTS.md) used height-normalized templates, which confounded their aspect-aware comparison. Here use direct original physical p1/p2 images, archive 18.jpg and 19.jpg. Black RGB maximum <160; connected-component height 101–129, fixed x550–1810 and y650–2900 text zone. Match only lines with equal component and canonical rune counts: transcription lines 14–25 and 27–35; accepted local p1 lines [2,4,5,6,8,9,11,12], p2 [1,2,3,4,5,8,9]. All 29 classes occur in both independent pages. Native glyph heights predominantly 114–115 px; keep proportions with a common 30/114 scale in both axes, centered 40×40, class medians. Split mean soft Dice distance .007217397 (max .091621, G). 
Candidate FreeType 150px unhinted raster, crop >.15; Type-1 all glyph slots, Unicode fonts all mapped Runic glyph IDs. Global transform only, rectangular Hungarian assignment, soft Dice = 1−2a·b/(||a||²+||b||²). Coarse grid: modal 5-pixel height bin +2.5, rune-size filter .7–1.4 of modal height, width≤1.7 modal; sy=(30/modal)×[.9,1,1.1]; sx/sy=[.5,.7,.9,1.1,1.3]. Refine 12 best overall plus best remaining family using sy±.035 step .007 and sx±.045 step .009 with all rendered slots. Holdout p2 freezes p1-selected slots and scales. Finite sampled transform grid, not a universal continuous exclusion. Python/OpenCV/FreeType/SciPy locally executed; not CI. Reproducer: [script](../sims/agent43_lp2_font_slot_match.py).

## Measured results

| Family | Files | Coarse best | Refined best | Frozen p2 |
|---|---:|---:|---:|---:|
| frua | 36 | .18117915 | .17606246 | .17777193 |
| fruc | 36 | .19300054 | .19300054 | .19628732 |
| frul | 36 | .54870087 | .54555821 | .54804891 |
| frum | 36 | .21374254 | .20695612 | .21061973 |
| frun | 36 | .23160261 | .21798839 | .22107670 |
| frut | 36 | .25324896 | .24544308 | .24824497 |
| Junicode 2.209 | 38 | .18463539 | .17991145 | .18139742 |

236 feasible 29-slot assignments; 18 frul files have 8–24 rune-size slots and no assignment under the screen. Best allrunes fruabt.pfb SHA256 740c1d2ec2b3efc2d6a15e0479d1b72b83ff74bf6a5cad8d50f80da242d9aad3, sy=.27366667, sx=.18666667, worst=.35172051. Best modern Junicode-SmCondMedium.otf SHA256 b6e206089355fc416c9bf84565804b8f81bc209d491374df13c4037d0d6c9642, sy=.27206977, sx=.18634884, worst=.49166936.

Controls: independently render each of these two selected 29-slot sets at 240px; global x condensation .83; resize median height to114px; JPEG quality92, threshold160; rerun identical matcher. fruabt .02436251, 27/29 exact slot IDs, fixed true IDs mean .02570456/max .12077016. Junicode .02081427, 29/29 exact slot IDs, max .20646352. A subsequent 254-file leave-one-in control uses each planted set as a full-bank query. Allrunes fruabt is coarse rank 1/254 and refined rank 1 among the top five: .024363 versus .030566 for fruabm, .069520 for fruabq. The planted Junicode-SmCondMedium is coarse rank 9/254; after refining the five coarse leaders plus the true face, Junicode-SmExpSmBold scores .005864, Junicode-SmBold .019656, and the true face .020814. Thus a face can be confounded with another globally rescaled style, and unique font/style identification is **not** established even on both positive controls. This is a calibration failure for exact-face ranking, not evidence of an original match: the original LP2 scores are well outside the best observed planted distances. The allrunes alternate-ID ambiguity remains. The much larger source scores disfavor these sampled candidate transforms; no font identification. Full leave-one-in output JSON SHA256 e6dacecd9f76d6b347178cef4d776b4e3d7bdbe678361febd1ae20bf6d78364b (local artifact). Best fruabt glyph names in canonical GP order: S Lacute u o r Eogonek g w dcaron n i scaron I Eth x s Idieresis lcaron e m ccaron eng Gbreve lacute a ecircumflex Egrave Atilde Adieresis. These are best-fit slot IDs, **not source encoding**.

Font metadata: allrunes.sty identifies v2.1 (2004-01-06), Carl-Gustav Werner LPPL; Type-1 metadata version 001.001 generated from MF with mftrace 1.0.12; [CTAN](https://ctan.org/pkg/allrunes). Modern Junicode OTF embedded version 2.209, SIL OFL1.1. No font bytes redistributed. The instrument emits full selected-slot matrices, per-face hashes, scores and mappings. The executed full JSON was 792900 bytes, SHA256 99dea1496063f30b6d2103c8c06dad88015166e6ebf6ddf5dcc3dbe8ed1cb5c3 (local artifact).

## Historical Junicode: completed bounded outline search

The native download failure was bypassed using source-pinned GitHub reads, with no font data redistributed. [Junicode 0.6.17 TTF mirror](https://github.com/Fromager/junicode/tree/059558d413cf88277dc123e0b02fef15b67dd3b3/fonts): all eight files report 0.6.17 via name-table parse; six have 81 distinct runic slots, two bold-italic faces have no mapped runic slots. Embedded Regular license GPL despite generic OFL README. [Junicode-Cyrillic source fork](https://github.com/jonorthwash/Junicode-Cyrillic/tree/ad1e0e2200d950a6d40c9fc4360871838058f899) has `version.mk` and four SFD headers all reporting 0.7.8, original copyright 1998–2012 Peter S. Baker, OFL. Regular source includes 81 encoded and 49 unencoded rune-named alternative/mirrored slots; the other three faces contain 81 each. These are source outlines from a Cyrillic fork, not claimed byte-identical original upstream TTF binaries.

The historical comparator uses the same original page splits and GP29 order, but binarizes each 40×40 class median at >0.5 and rasterizes font outlines by nonzero winding at pixel centers. Quadratic (TTF) curves subdivided into 8 segments; SFD curves into 16. Fit one global pair of scales and distinct assignment. Height factor grid 0.8–1.2 by 0.1 times 30/median height; horizontal/vertical ratios 0.5–1.3 by 0.2; refine local factors ±8% vertical and ±12% horizontal. Holdout is frozen p1 mapping applied to p2. Positive control plants the selected 29 glyphs with scales ×1.017 and ×0.983, quarter-pixel registration perturbation, then runs the local search; it is an outline self-recovery control, not the native JPEG degradation test above. Therefore these binary distances are **not directly comparable to the soft-Dice bank**.

| Version / face | Slots | Original p1 | Frozen p2 | Plant distance | Plant IDs |
|---|---:|---:|---:|---:|---:|
| 0.6.17 Regular | 81 | .301347 | .312043 | .147990 | 29/29 |
| 0.6.17 Bold | 81 | .300591 | .309114 | .150253 | 29/29 |
| 0.6.17 Italic | 81 | .511963 | .509807 | .122885 | 29/29 |
| 0.6.17 RegularCondensed | 81 | .299146 | .312867 | .156932 | 29/29 |
| 0.6.17 BoldCondensed | 81 | .299959 | .311590 | .162219 | 29/29 |
| 0.6.17 ItalicCondensed | 81 | .514201 | .519527 | .101916 | 29/29 |
| 0.7.8 Regular SFD | 130 | .296812 | .312177 | .146367 | 29/29 |
| 0.7.8 Bold SFD | 81 | .263488 | .266312 | .077323 | 29/29 |
| 0.7.8 Italic SFD | 81 | .511874 | .515343 | .106111 | 27/29 |
| 0.7.8 BoldItalic SFD | 81 | .374109 | .371403 | .070903 | 29/29 |

Exact Git blob IDs, per-rune selected IDs and distances, scale parameters, control scores: [0.6.17 results](agent43-historical-junicode-0617.json) and [0.7.8 results](agent43-historical-junicode-078.json). Source-pinned repeatable CJS implementations: [TTF](../sims/agent43_historical_junicode.cjs), [SFD](../sims/agent43_historical_junicode_sfd.cjs). Both execute in ordinary Node without dependencies using the embedded source-derived binary masks; the masks are independently extracted from the original JPEGs by the Python pipeline. All recorded runs executed in the local tool JS runtime from exact remote blobs, not in CI. The regular historical outlines remain a poor fit even with the additional mirrored glyph slots. No source mapping is warranted.

## Unavailable candidate and next decision

[Evertype](https://www.evertype.com/emono/) currently distributes December 2014 shareware version 7.0.0/7.0.1b, later than May 2014. A Minix 3.3.0 package mirror [indexes evermono-ttf-6.2.1](https://www.minix3.org/pkgsrc/distfiles/local/3.3.0/), but the historical subdirectory could not be retrieved and direct local internet is unavailable. The 2012 6.2.1 candidate is not excluded. No redistribution or unlicensed download attempted. The current local bank and available historical Junicode sources are insufficient to identify an original face; stop generic stock-font sweeps. The full-bank modern face ambiguity further demonstrates why even a small distance would not by itself authenticate a unique original font. #2673 may close as no match on the available named candidate set, explicitly leaving Everson untested. Keep exact period Everson or an authentic parent source/font as specific acquisition dependencies, rather than infer an encoding from poor matches. No authentic key or new plaintext.
