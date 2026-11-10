# Original LP2 red-ink loci and image-selected ciphertext spans

**Evidence class:** original-image colour census and independently annotated ciphertext offsets. This consolidates the former 50-rune/extra-arrow interpretation with the subsequently verified 51-rune source, and preserves the genuinely independent 14-rune page-7 span. **No unknown LP2 plaintext, cipher key, or destination is recovered.**

## Source of truth for colour-sensitive cryptanalysis

Use [the complete two-ink annotation](../resources/liber-primus/lp2-ink-annotations.json) together with [the physical-page rune corpus](../resources/liber-primus/lp2-corpus.json), rather than deriving cipher offsets from downsampled raster thresholds. The annotation records **13,136 runes across 58 original LP2 pages** (including solved pages 56–57), **225 red runes**, and **36 large punctuation marks**: 30 red 13-dot, one black 13-dot, four red 10-dot and one red 23-dot. All rune positions are zero-based within their **physical** LP2 page; punctuation positions are independent of red-rune spans. [Original-scan comparison and exact glyph-template evidence](red-microdot-motif-inventory.md) and [reproduction](../sims/lp2_ink_annotation_audit.py).

The one black 13-dot mark, absent from red-only inventories, appears on original scan `24.jpg` (physical LP2 page 7), before the red passage. It is a real punctuation/layout event and must be retained if a theory depends on mark colour or cipher segmentation. A uniform 13-bit payload read from different dot arrangements is ruled out by their fixed template occupancy; punctuation classes and positions remain possible clues.

## Two visually selected ciphertext targets

**Original `24.jpg`, physical LP2 page 7:** the final red line is a **14-rune** passage, separated into five ciphertext words:

```text
ᛞᚩ-ᛟᛏᚦᚫ.ᚳᚹᛄ-ᛉᛠ-ᚷᛠᛗ.
```

The punctuation dots and hyphens in the transcription are **not** additional runes. The red-line observation is independent of any fitted cryptanalytic score. Its adjacent black 13-dot mark is also present in the complete image annotation.

**Original `70.jpg`, physical LP2 page 53:** the red, upward-arrow-shaped glyph at the end of printed line 6 is the actual Gematria Primus rune **ᛏ**, and starts the first red five-rune word continued on line 7. It is **not** an additional arrow symbol. The red passage is **51 consecutive runes**, not 50. The source-exact page-local offset is **[128,179)**, with line-rune counts **[1,24,22,4]** on printed lines 6–9 and twelve words with lengths **[5,4,4,11,2,3,2,6,5,5,2,2]**.

Canonical exact rune sequence (word separators suppressed):

```text
ᛏᛈᚹᛇᛋᚹᛒᛇᚦᚾᚻᚷᛄᚱᛡᛞᛡᚦᚪᛁᛇᚫᛉᛚᛇᛠᛡᚪᛄᚻᚱᚦᛈᛞᛄᛝᚩᚷᚠᛇᛗᚳᚻᛞᚩᛏᚳᚢᚱᛈᚾ
```

The machine-readable [51-rune source interval](../resources/liber-primus/lp2-page53-red-span.json) specifies scan hash, physical line positions and rune offsets. The corrected [red-passage inversion report](lp2-page53-red-verse.md) already tests two properly defined English-decoding families, with neither yielding plaintext. **Do not reuse old 50-rune language statistics or a supposed independent arrow as tests of this corrected interval.**

Page numbering matters: physical LP2 page 53 corresponds to rune-bearing transcript segment 52 because physical page 50 is a rune-free numerical table. Use physical page 53 and its local offset when extracting from the canonical corpus.

## What the earlier raster census actually measures

The independent [red-pixel locator](../sims/red_ink_loci.py) downsamples the original 2400×3600 JPEG images to 600×900 and selects pixels with `R>85, R-G>45, R-B>40, G<140`. A band requires consecutive rows with more than two selected pixels; bands under ten pixels are dropped. These **image-detector measurements** remain useful for finding red regions, while the complete two-ink annotation supersedes them for exact rune, punctuation and cipher-offset counts.

Across original LP2 scans `17.jpg`–`74.jpg`, the original detector found 25 images with more than 20 selected red pixels, and 15 with a connected band containing at least 250. Their original scan numbers, LP2 physical pages and red-pixel totals were:

| Scan | Page | Detector pixels | Visually relevant feature |
|---:|---:|---:|---|
| 17 | 0 | 3,885 | Opening rubric |
| 20 | 3 | 6,532 | Decorative capitals |
| 23 | 6 | 3,503 | Paragraph capital |
| 24 | 7 | 2,008 | Terminal red line |
| 25 | 8 | 3,419 | Opening capital |
| 32 | 15 | 4,682 | Heading, highlighted number, capital |
| 40 | 23 | 4,309 | Paragraph capital |
| 44 | 27 | 5,829 | Capital and heading |
| 50 | 33 | 8,425 | Two capitals |
| 56 | 39 | 3,843 | Paragraph capital |
| 57 | 40 | 3,107 | Paragraph capital |
| 70 | 53 | 6,757 | 51-rune passage, including line-6 ᛏ |
| 71 | 54 | 3,290 | Opening capital |
| 73 | 56 (solved) | 2,698 | Rubric and initial |
| 74 | 57 (solved) | 4,633 | Initial and punctuation |

These pixel totals are **not** complete measures of individual rune colours; small punctuation and decoration can fall below thresholds. The source audit above has the exact source-facing annotation. The old preliminary identity/Atbash/prime/reversal scans of the trailing **50 runes** were run before recognizing the opening ᛏ; they are historical probes on an incomplete interval and provide no cryptanalytic evidence about the corrected full 51-rune passage. The dedicated corrected 51-rune inversion report supersedes them.

## Research implication

The page-7 14-rune red line, page-53 51-rune red passage, and the complete physical positions of all 36 punctuation events provide **image-selected targets** for testing an explicitly specified key, reset, reading-order or encoding hypothesis. A meaningful positive result should preselect its rule without fitting the target, decode actual source ciphertext, and re-encrypt unfit positions exactly; red highlighting alone is not evidence of a separate cipher regime. Do not interpret a word fit after extensive key searching as recovered plaintext. Use the one consistent physical-page and rune-offset contract to compare hypotheses across independent passages.

**Reproduce:** `python sims/red_ink_loci.py --images resources/liber-primus` for the historical approximate colour-band census; `python sims/lp2_ink_annotation_audit.py` for the complete image-checked source. The former is a locator; the latter is the canonical source-facing annotation validator.
