# Original LP2 font-slot gate: allrunes Type-1 and Junicode

**25 November 2026 decision: no exact face identification among tested fonts.** Partial result for [#2673](https://github.com/FlareZ123/liber-primus/issues/2673). All 216 locally installed allrunes Type-1 faces and 38 Junicode 2.209 OTF faces were screened. Best original match is about seven times the degraded-known-face distance. Period Junicode 0.6.17 is acquired through the GitHub connector but historical matching timed out; period 0.7.8 and Everson Mono are still untested. No original plaintext or key recovered.

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

Controls: independently render each of these two selected 29-slot sets at 240px; global x condensation .83; resize median height to114px; JPEG quality92, threshold160; rerun identical matcher. fruabt .02436251, 27/29 exact slot IDs, fixed true IDs mean .02570456/max .12077016. Junicode .02081427, 29/29 exact slot IDs, max .20646352. Not a full-bank leave-one-in calibration, and allrunes alternate-ID ambiguity remains. The much larger source scores disfavor these sampled candidate transforms; no font identification. Best fruabt glyph names in canonical GP order: S Lacute u o r Eogonek g w dcaron n i scaron I Eth x s Idieresis lcaron e m ccaron eng Gbreve lacute a ecircumflex Egrave Atilde Adieresis. These are best-fit slot IDs, **not source encoding**.

Font metadata: allrunes.sty identifies v2.1 (2004-01-06), Carl-Gustav Werner LPPL; Type-1 metadata version 001.001 generated from MF with mftrace 1.0.12; [CTAN](https://ctan.org/pkg/allrunes). Modern Junicode OTF embedded version 2.209, SIL OFL1.1. No font bytes redistributed. The instrument emits full selected-slot matrices, per-face hashes, scores and mappings. The executed full JSON was 792900 bytes, SHA256 99dea1496063f30b6d2103c8c06dad88015166e6ebf6ddf5dcc3dbe8ed1cb5c3 (local artifact).

## Remaining period acquisition
[Fromager/junicode pinned mirror](https://github.com/Fromager/junicode/tree/059558d413cf88277dc123e0b02fef15b67dd3b3/fonts): eight TTFs report 0.6.17 via name-table parse. Regular 770972 bytes, Git blob a76ad0630d7b1491690a8f3972485927a725d8e2; six faces map 81 Runic codepoints, BoldItalic/BoldItalicCondensed map none. Embedded Regular license GPL despite repository generic OFL statement; do not redistribute. The connector reads base64 font bytes, local network cannot clone/download. Initial historical-outline matching timed out before returning a result. Ubuntu 0.7.8-2 package dated December 2013 [mirror](https://mirrors.edge.kernel.org/ubuntu/pool/main/f/fonts-junicode/) indexed but download unsuccessful. [Evertype](https://www.evertype.com/emono/) official download is December 2014 shareware, after May release; no period binary acquired. Finish only named historical candidates; do not reopen generic stock-font sweep. No source PDF, key or plaintext.