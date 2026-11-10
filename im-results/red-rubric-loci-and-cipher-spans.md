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

## Direct 225-red-rune Hill-matrix inversion

**Source-derived, explicitly reversible candidate, tested on real ciphertext.**
The verified 225 red GP glyphs happen to form exactly one 15×15 matrix when
laid out in source order. Their rune indices, GP prime assignments (mod29),
and both source-order and alternating-row-reversed orientations give **four
literal full-rank matrices over F29**. Each matrix and its transpose can
be inverted exactly with Gauss–Jordan elimination. This provides **eight
different actual source-derived keys**, not 29!-way fitted keys.

The [full original-cipher inverse](../sims/red225_hill15_inverse.cjs)
tests these 8 source keys on each of three block restart policies
(physical page, eight text sections, continuous manuscript), 15 fixed
block phases and either modular decryption sign, for **720** declared
configurations. It selects a winner by source-trained GP-English
unigram log likelihood on the first ~6,500 original rune positions,
then freezes all settings for the remaining ~6,400 rune positions.
The highest original training score is **−0.840893 nats per rune
against uniform**: source red-serpentine-prime matrix, section reset,
phase6, negative sign. Its untouched heldout score is **−0.896511**,
with rune IoC **0.0345016**; the apparent plaintext begins
`MNGFUBEOETHIBIFNGHRNGEFTHRHCXBRETHFYIAEOEONG...`.
No setting produces readable GP text. The best retrospectively selected
heldout score is itself **−0.840798**, and therefore gives no
heldout decipherment.
An additional **independent author-native register** derived from 796
editorial-filtered GP words of the already solved Cicada LP1/LP2 prose
selects a different original-source candidate and still scores
**−0.819017** on its untouched original heldout positions.
The true-red-key heldout Shakespeare plant scores **+0.048564**
under that same native GP prior. The original negative persists
under the known author's vocabulary without assuming Shakespeare
letter frequencies are universal. [Native-register successful CI
42792941901](https://github.com/FlareZ123/liber-primus/actions/runs/42792941901).

A blind, separately held-out Shakespeare GP source of the same
**12,956-rune original page-length layout** was encrypted with the
actual red-row-index matrix under physical-page 15-rune Hill blocks.
It incurred **347 genuine 81%-chance adjacent-collision overwrites**
on emitted ciphertext and was then decoded without supplying the
plaintext. The exact red matrix inverse correctly recovered **68.185%**
of 12,645 tested complete-block rune positions, gave original
heldout IoC **0.0471647**, and a source-language log-likelihood
**+0.035177 nats/rune**. The independently wrong red key gave
**−0.892584 nats/rune** and IoC **0.0345278** on the identical plant.
This confirms sensitivity to a correct source key despite realistic
ciphertext overwrites.

The test rules out this bounded **direct 225-red-rune 15×15 Hill use**
under ordinary GP-English with printed physical or section block
resets. It does **not** address an additional nonlinear KDF,
unknown outer alphabet, changed matrices per page, feedback chaining,
different source register, or other red-rune uses. It yields neither
unknown LP2 plaintext nor a genuine cryptographic key.

Reproduction: [Node22 exact key, matrix inverse and planted
control](../sims/red225_hill15_inverse.cjs) and
[successful original/positive CI run
42790721132](https://github.com/FlareZ123/liber-primus/actions/runs/42790721132).
The job is dispatched through the **existing** manual
[Hill screen runner](../.github/workflows/hill-row-screen.yml)
with `experiment=red225`; no new workflow is needed.

## Red-225 matrix as an evolving reversible keystream

A distinct *direct inversion* uses the same 225 red source runes as
the coefficients of a 15×15 state-transition matrix `M` over F29
rather than as a Hill block encoder. A source-defined initial
15-rune vector is emitted as key symbols before each update
`state ← M × state mod29`. Encryption uses
`cipher = plaintext ± key mod29`. The test fixes eight exact
row/serpentine GP-index/GP-prime matrices including orientation,
four source-defined seed vectors (first row, last row, first column,
diagonal), two first-step conventions, either additive sign, and
page/section/book resets. No coefficients are learned from LP2.
A total of **384** candidate decoders are selected exclusively by
Shakespeare-GP unigram likelihood on the first **6,480 original
ciphertext positions**, with one frozen remaining-page holdout.

The best original configuration is red-prime column matrix,
diagonal seed, initial advance, positive decryption sign and
physical-page resets. Its language excess log-likelihood is
**−0.840450 nats/rune** on selection and **−0.893946** on untouched
original positions, with heldout IoC **0.0344875**. The output begins
`SATAEALOPROIANNGXSNGOWWCHBEAJJWGWNGE...`, and is unreadable.
Even the hindsight-optimized best holdout mode scores
**−0.845135**, showing no evidence for this mechanism on LP2.

In a source-disjoint, blind original-page-layout GP-English positive,
the **actual red-index transition matrix and first-row seed** encrypt
12,956 genuine plaintext runes and apply **373** stochastic
adjacent-repeat rewrites. At the fixed true source settings, the
decoder yields **+0.347220 nats/rune** GP-English log-excess
on the original-sized holdout with IoC **0.0567642**. An unrelated
red source matrix/seed returns **−0.871300** and IoC **0.0345940**
on those same encrypted runes. The positive verifies sensitivity
to even a key-dependent nonlinear-looking output profile.

The results strictly challenge this **fully specified red-matrix
linear-state keystream** under literal GP alphabet and source-key
layout. Unknown nonlinear states, alternative seed derivations,
changing key clocks, ciphertext-dependent rewrites or transformed
plaintext remain open; no unknown LP2 text is decoded. This
extends the earlier static 15×15 use above without redefining it.

Reproducer: [red225 evolving-matrix exact forward/inverse](../sims/red225_matrix_stream_inverse.cjs);
[successful manual original and positive test, GitHub Actions
42791306887](https://github.com/FlareZ123/liber-primus/actions/runs/42791306887);
reuses the existing [Hill screen workflow](../.github/workflows/hill-row-screen.yml)
with `experiment=red225stream`.

## Research implication

The page-7 14-rune red line, page-53 51-rune red passage, and the complete physical positions of all 36 punctuation events provide **image-selected targets** for testing an explicitly specified key, reset, reading-order or encoding hypothesis. A meaningful positive result should preselect its rule without fitting the target, decode actual source ciphertext, and re-encrypt unfit positions exactly; red highlighting alone is not evidence of a separate cipher regime. Do not interpret a word fit after extensive key searching as recovered plaintext. Use the one consistent physical-page and rune-offset contract to compare hypotheses across independent passages.

**Reproduce:** `python sims/red_ink_loci.py --images resources/liber-primus` for the historical approximate colour-band census; `python sims/lp2_ink_annotation_audit.py` for the complete image-checked source. The former is a locator; the latter is the canonical source-facing annotation validator.
