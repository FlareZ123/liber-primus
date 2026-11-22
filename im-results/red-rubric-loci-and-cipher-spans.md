# Original LP2 red-ink loci and image-selected ciphertext spans

**Evidence class:** original-image colour census and independently annotated ciphertext offsets. This consolidates the former 50-rune/extra-arrow interpretation with the subsequently verified 51-rune source, and preserves the genuinely independent 14-rune page-7 span. **No unknown LP2 plaintext, cipher key, or destination is recovered.**

## Source of truth for colour-sensitive cryptanalysis

Use [the complete two-ink annotation](../resources/liber-primus/lp2-ink-annotations.json) together with [the physical-page rune corpus](../resources/liber-primus/lp2-corpus.json), rather than deriving cipher offsets from downsampled raster thresholds. The annotation records **13,136 runes across 58 original LP2 pages** (including solved pages 56–57), **225 red runes**, and **36 large punctuation marks**: 30 red 13-dot, one black 13-dot, four red 10-dot and one red 23-dot. All rune positions are zero-based within their **physical** LP2 page; punctuation positions are independent of red-rune spans. [Original-scan comparison and exact glyph-template evidence](red-microdot-motif-inventory.md) and [reproduction](../sims/lp2_ink_annotation_audit.py).

The one black 13-dot mark, absent from red-only inventories, appears on original scan `24.jpg` (physical LP2 page 7), before the red passage. It is a real punctuation/layout event and must be retained if a theory depends on mark colour or cipher segmentation. A uniform 13-bit payload read from different dot arrangements is ruled out by their fixed template occupancy; punctuation classes and positions remain possible clues.

## Sixteen unsolved red spans: page-15 spiral key gate

The source annotation gives exactly **16 red-rune spans on unsolved physical pp0–55**, excluding two separately solved p56–57 headings. The first-rune GP indices, in original page/offset order, are
`[15,20,13,24,23,14,0,20,1,19,23,21,27,0,16,24]` (transliterated `S L P A D X F L U M D NG IA F T A`). This provides a testable, visually motivated but **not author-selected** link to the authentic 16-position Fibonacci-prime square on p15. The marked red 3299 starts the square spiral at row2,column2; its exact traversal selects the acrostic `X F D M U D S L P A L NG A T F IA`. Neither reading is legible.

A finite original-cipher test uses the chronological order, the source-fixed p15 clockwise outward spiral, and the inverse placement as three 16-rune repeating GP29 keys. For each key both additive signs are tested, with the first key symbol at the start of source-printed p16 (the 1,744-rune pp16–22 continuation), and separately at the start of the full 12,956-rune unsolved stream. The **six pp16–22 IoCs range 0.03428787–0.03454842** (source 0.03450960); the **six book IoCs range 0.03447076–0.03452452** (source 0.03447840). All outputs remain uniform-like and unreadable. Inverse-key reencryption and planted GP29-symbol controls pass. The count match alone therefore selects no coherent red-ink acrostic, key or plaintext under this direct source-chosen use. It does not exclude independent instructions for combining complete red spans, nonperiodic use, or non-GP registers.

**Direct red-passage test:** A more local application assigns each of the 16 marked numerical cells to **one entire red span** (213 source-original ciphertext runes) and uses that printed value modulo29 as a single fixed GP Caesar shift across the span. Three inputs are frozen by the original p15 construction: clockwise numerical spiral, the printed four-row order, and the underlying distinct Fibonacci inputs, with both additive signs. Across these six source-fixed decodings, aggregate red-rune IoC is **0.03397112–0.03609709**, versus source **0.03383825**; none restores identifiable red-heading prose or a coherent short instruction. All six exactly re-encipher their respective original source spans. A key shared throughout each red span is a hypothesis, not an author-prescribed cipher; this test does not exclude more complex red-text-specific operations. The same standalone SFT reproduces both the 213-rune red-local inverse and the 12,956-rune full-stream gate. [Reproducible standalone original-input test](../sims/lp2_red16_spiral_original_sft.cjs).

## Solved-page red-title status: no transferable mode selector

Original physical p56 (scan `73.jpg`) begins with five red runes `ᚫᛄᛟᛋᚱ` and a red 13-dot mark at local rune offset 5. Its known, **ciphered** heading decrypts as **AN END** by the documented prime-totient inverse; the page has a red 10-dot mark at offset 45 and an ordinary terminal red 13-dot mark at offset 85. The source-exact decoder is [the p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs), including the whole-page literal-F exception. Physical p57 (scan `74.jpg`) begins with seven literal red runes `ᛈᚪᚱᚪᛒᛚᛖ` = **PARABLE**, also followed by a red 13-dot mark, and ends at local offset 95 with the **only** original red 23-dot terminator. Both headings use the same decorative red-drop-cap presentation in the original JPEGs.

A frozen visible-only discriminator, “the unique page terminating in red 23-dot punctuation has a literal heading; an ordinary 13-dot terminator belongs to a ciphered heading,” agrees with **both** solved pages, but it has only one positive cleartext example and no known independent unknown-page result. The 23-dot mark occurs at the **end** of the final page; it supplies no cipher operator, secret key, literal-F handling rule or generalizable shift/reset state. The 13-dot heading punctuation also appears on many unknown pages (including p54) and already on both solved pages, so it cannot on its own select a title cipher mode. A reader might recognize the last PARABLE as a plaintext epilogue, but this interpretation is not an independent decoder for earlier red headings.

**Decision for Director #180:** the original art and complete 18-span ink map do **not** select a prospective, reversible p56→unknown red-title rule. Do not classify all unsolved headings as decryptable under the p56 key, guess their words by likelihood, or use the 23-dot exception as an inferred decryption switch. This is a bounded missing-selector result, not a discovery of unknown LP2 plaintext. A new attempt requires an independent original-source instruction that fixes the title operation and state before reading an unknown span.

## Original-rune allograph gate: 1,381 A/R/E observations

**Bounded original-image decision for Director #181, not plaintext:** The 58 original LP2 JPEGs were checked for repeatable alternate glyph forms hidden by normalized GP transliteration. The source-selected controls are ordinary **A (ᚪ)**, **R (ᚱ)** and **E (ᛖ)** from the red **PARABLE** rubric on physical p57 (original scan `74.jpg`). Under one fixed grayscale threshold **160**, original-size template boxes `A: x890..922`, `R: x928..961`, `E: x1084..1133` at `y918..1030`, and fixed OpenCV normalized-correlation cutoff **0.90**, these three templates recover an **exact chronological A/R/E subsequence on every one of the 58 original pages**, including the solved p56/p57 controls. Image matches are located with fixed 105×36 nonmaximum suppression, read in physical line order (188 px row spacing) and compared with the independent normalized original rune corpus, not with fitted plaintext.

The source corpus contains exactly **489 A, 436 R and 456 E** runes. The test detects **487 ordinary A + 436 R + 456 E = 1,379** correctly ordered ordinary glyphs, with zero missing/extra/misordered template-class symbols at the 58 page-level readouts. The two additional original A are the **enlarged red drop capitals** at physical **p6:local71** and **p54:local0**, independently marked in the source ink annotation and visibly different in size. This accounts for all **1,381/1,381** canonical occurrences of these three identities. Minimum matched normalized correlations are **0.960805 (A), 0.943187 (R), 0.933196 (E)**; **68 A, 77 R and 64 E** template comparisons are exact at the thresholded bitmap level. The page-level identity and read-order tests are stricter than matching just global frequencies or selecting four-letter words.

**Inversion consequence:** three abundant symbol identities reproduce the same ordinary printed glyphs across widely separated unknown and solved pages, with no second stable allograph class needed for any ordinary A/R/E. This specifically excludes a full-book, per-rune hidden binary channel requiring a second printed letterform for **A, R or E** on those **1,379** positions. It does **not** rule out alternative glyphs on the other **26** GP identities, source-defined enlarged drop-cap encoding, or a channel in page layout/ink/dots. A deliberately broad B/L partial-stroke detector had substantial cross-rune false positives and is not evidence of allographs or of their absence. No original instruction fixes an allograph-to-key map, and no unknown plaintext or key was recovered.

**Exact original-source SFT:** [`sims/lp2_are_allograph_original_sft.py`](../sims/lp2_are_allograph_original_sft.py) (OpenCV, numpy, Pillow) reads the 58 original `resources/liber-primus/17.jpg..74.jpg` files, `lp2-corpus.json` and `lp2-ink-annotations.json`; checks every page's complete A/R/E image subsequence against its unmodified canonical source indices after accounting for the two annotated enlarged red initials. The source scan p50 is correctly rune-free. Its fixed parameters are declared in code; it neither performs OCR nor trains on LP2 unknown plaintext. The same original ZIP mounted locally passes with **1,379** standard glyphs, **2** enlarged controls and **58/58** page-order checks.

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
