# p27/p34 duplicate-word destinations: no common visual direction cue

**Agent50 · 18 November 2026 · Director task #1510 · bounded negative.**

No source-visible direction/orientation rule was found at the two duplicate-word destinations. The finite `prime_echo` result remains a navigation candidate, but this visual inspection does not implement the signed 2016 clause “their numbers are the direction.” No unknown plaintext, key, cipher operation, or destination is recovered.

## Fixed source windows

The repository's image mapping is LP2 physical page = archive image index − 17. Thus the two original JPEGs are:

| Destination | Original image | Target |
|---|---|---|
| p27 | `resources/liber-primus/44.jpg` | `DJU-BEI`, p27 text line 2 |
| p34 | `resources/liber-primus/51.jpg` | `CX`, p34 text line 10; first word on that line |

Both files are 2400×3600. Their SHA-256 values, also present in `resources/liber-primus/SHA256SUMS.txt`, are:

- p27 / `44.jpg`: `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`
- p34 / `51.jpg`: `6f1b4c04b64ee54c689478bd3986bb6ab8a3b81f48780562094e9f248e4e87f8`

Before interpretation, I fixed the local window as the target printed line plus the immediately preceding and following printed lines, including any rubrication, punctuation, margin initial, or illustration overlapping that three-line band. The p34 page-top cuneiform block was recorded separately as page context, not silently pulled into the local window: it is separated from line 10 by the intervening body lines.

Recreate the inspected crops without resizing, rotation, thresholding, or other transforms:

```python
from PIL import Image

Image.open("resources/liber-primus/44.jpg").crop(
    (430, 900, 1950, 1450)
).save("/tmp/p27-map-destination.png")

Image.open("resources/liber-primus/51.jpg").crop(
    (300, 2140, 2000, 2700)
).save("/tmp/p34-map-destination.png")

Image.open("resources/liber-primus/51.jpg").crop(
    (700, 0, 1800, 550)
).save("/tmp/p34-cuneiform-context.png")
```

## Comparison against the predeclared cue classes

The comparison was limited to the same possible cue class at both sites: explicit direction/orientation symbol; numbered label; rubricated or other marker; line-start/line-end convention; or a previously authenticated Cicada operation trigger.

| Cue class | p27: DJU-BEI | p34: CX | Same actionable cue? |
|---|---|---|---|
| Direction/orientation symbol | No arrow, compass, cardinal mark, or labelled orientation appears in the three-line window. The large red margin glyph is a decorated runic initial, not an explicit direction sign. | No arrow, compass, cardinal mark, or labelled orientation appears beside CX or in its adjacent lines. | No |
| Numbered label / marker | The preceding red heading ends in a red dotted punctuation marker. It belongs to the heading, not to either DJU or BEI individually. | No number, label, or marker is attached to CX or its line. | No |
| Rubrication | Red heading and enlarged red initial occur immediately above/alongside the black target line. | The target line and its adjacent lines are ordinary black runic text; no corresponding red heading or initial occurs there. | No |
| Line placement / punctuation | DJU-BEI is an internal adjacent word pair in line 2, with ordinary hyphen word separators. | CX is the first word of line 10; its following words use the ordinary hyphen separators. | No |
| Illustration / numeric context | A wing-like drawing is above the heading; the dotted marker is part of the red heading line. Neither supplies a direction rule tied to DJU-BEI. | A two-line cuneiform inscription is at the top of the page, many body lines above CX. There is no leader, bracket, label, or line connection from it to CX. | No |

The only common features are generic book typography and ordinary word separation. Calling the p27 red dotted heading marker and the distant p34 cuneiform block one shared “number cue” would be an overbroad category: they are different forms, occupy different relationships to their target words, and select no deterministic common operation. Likewise, the p27 wing and the p34 cuneiform inscription are not the same illustration or direction-symbol class.

The line-position difference is material: the p27 pair is internal to its line, whereas p34 CX begins its line. There is no shared line-end convention or common punctuation pattern that selects an extraction direction.

## Decision

**Negative under the fixed source windows and cue classes.** Duplicate identity maps the terminal words to p27 and p34, but the two destinations do not expose one common local visual cue that tells a human solver what to do next. Stop this visual branch; do not enlarge the windows, reinterpret unrelated page decorations as a shared marker, or replace the missing rule with word-sum/base/modulus numerology.

This is distinct from, and does not repeat, #1192's p27–p55 half-book-fold and alternate-glyph tests. It also does not reopen #1507's already-frozen word-number address/relative-motion grammars, which failed to yield a common direction convention. Keep the finite `prime_echo` terminal line as a candidate navigation object only; its direction clause remains unresolved.

## Sources within the repository

- Original image/page mapping and byte inventory: `resources/liber-primus/README.md`, `resources/liber-primus/SHA256SUMS.txt`
- Canonical rune transcription: `resources/liber-primus/lp2-transcription.txt`
- Finite terminal-line/navigation candidate: `im-results/lp2-primeecho-terminal-duplicate-mapline.md`
- Prior p27–p55 recurrence and excluded visual tests: `im-results/lp2-p27-p55-terminal-two-word-echo.md`
- Frozen number-to-direction negative: `im-results/lp2-terminal-map-numbers-direction-gate.md`
