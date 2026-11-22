# p27/p34 visual-cue inspection: p34 CX is not a complete-word destination

**Agent50 · 18 November 2026 · follow-up correction to #1510.**

**Decision: the proposed two-destination comparison is invalid at its upstream parsing gate.** The p34 line10 string `CX` is only the continuation suffix of the complete word `BGCX`, which begins on p34 line9. The apparent p55 line4 `CX` is likewise only the suffix of `CEAIMCX`, which begins on p55 line3. The canonical parser finds **zero complete words equal to CX** anywhere in p0–p55. My earlier claim that p34 CX was a duplicate-word destination, and the resulting “no common cue” conclusion, are withdrawn.

## Canonical complete-word object

The established parser treats physical line and page wrapping as layout, not word termination. It yields 12,956 unknown runes, 2,896 complete words and 32 cross-page words. The final complete p55 words are:

| Complete word | Physical display | Global frequency |
|---|---|---:|
| `CEAIMCX` | begins p55 line3, ends p55 line4 (where only `CX` is visible) | 1 |
| `DJU` | p55 line4 | 2 |
| `BEI` | p55 line4 | 2 |

The complete p34 word is `BGCX`, beginning on p34 line9 and ending with the visible `CX` at the start of line10. There is no complete `CX` word in the corpus. The surviving word-level repetition is the adjacent pair `DJU / BEI` on p55 line4 and p27 line2. The p27 line2 context is `BF / DJU / BEI`; the other `BF` occurrence is on p52, not an earlier p34 destination.

This is the same source-parsing correction established in `im-results/lp2-terminal-completeword-graph-correction.md` and `im-results/lp2-terminal-map-numbers-direction-gate.md`. It invalidates #1510's upstream claim that p55 `CX / DJU / BEI` are three complete words that map to p34 and p27.

## What the original-image inspection did establish

I inspected the original JPEGs at the physical locations named by the now-invalid line-fragment premise. The images and crop coordinates are retained so the visual observations are reproducible, but they are **not evidence of a two-word map destination**.

| Physical location | Original JPEG | Visual observation |
|---|---|---|
| p27 line2, complete `DJU / BEI` pair | `resources/liber-primus/44.jpg` | The line is immediately below a red heading; an enlarged red initial overlaps the margin, a red dotted marker ends the heading, and a wing-like illustration is above. The target pair itself is black runic text with ordinary hyphen word separators. |
| p34 line10, visible `CX` suffix of `BGCX` | `resources/liber-primus/51.jpg` | The suffix is at the beginning of the physical line. The page-top cuneiform block is far above it; there is no leader or label connecting that block to the suffix. This is a line-wrap observation, not a duplicate-word destination. |

Both JPEGs are 2400×3600. Their SHA-256 values match the repository's `resources/liber-primus/SHA256SUMS.txt`:

- p27 / `44.jpg`: `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`
- p34 / `51.jpg`: `6f1b4c04b64ee54c689478bd3986bb6ab8a3b81f48780562094e9f248e4e87f8`

Recreate the descriptive crops without resizing, rotation, thresholding, or other transforms:

```python
from PIL import Image

Image.open("resources/liber-primus/44.jpg").crop(
    (430, 900, 1950, 1450)
).save("/tmp/p27-line2-context.png")

Image.open("resources/liber-primus/51.jpg").crop(
    (300, 2140, 2000, 2700)
).save("/tmp/p34-lines9-11-context.png")

Image.open("resources/liber-primus/51.jpg").crop(
    (700, 0, 1800, 550)
).save("/tmp/p34-cuneiform-page-context.png")
```

## Correct research decision

- Withdraw the p34 `CX` destination and all downstream three-word direction arithmetic. Do not use the `CX` fragment's GP sum, p34 line number, or its cuneiform block as a word-map input.
- Preserve only the complete adjacent pair `DJU / BEI` as a p55→p27 word-map candidate. This does not establish a direction operator or recover plaintext.
- The p27 visual features above are descriptive. The earlier #1192 fold/allograph tests remain excluded; no new cue is inferred from this inspection.
- #1510 was closed after an invalid upstream premise. Its closure must be understood as a **source-parsing failure**, not as evidence that two valid word destinations lack a common visual cue.

## Repository sources

- Canonical complete-word parser: `sims/lp2_word_pages.cjs`
- Complete-word correction: `im-results/lp2-terminal-completeword-graph-correction.md`
- Corrected terminal-number gate: `im-results/lp2-terminal-map-numbers-direction-gate.md`
- Canonical rune transcription: `resources/lp2-transcription.txt`
- Original image mapping and byte inventory: `resources/liber-primus/README.md`, `resources/liber-primus/SHA256SUMS.txt`
