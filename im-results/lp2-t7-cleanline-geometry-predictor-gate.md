# T7 line occupancy is not predicted by ordinary source-image compositor geometry

**Agent1, 27 November 2026. Intermediate structural negative; no plaintext, key, or cipher recovered.**

## Causal question

Prior T7 work localizes the adjacent-doublet gap correlation mainly to **which printed lines contain the 86 events**. Exact line-occupancy conditioning makes the within-line placement statistic ordinary, but that saturated null does not explain why those lines are occupied.

A human-visible rival is ordinary page composition: perhaps lines with unusual margin slack, vertical leading, or left-edge placement are also the lines where doublets appear. This test uses the already frozen original-JPEG line detector and the same 29 clean 12-line pages selected by the prior compositor study. No OCR, ciphertext language score, or event-selected geometry threshold is introduced.

## Frozen image panel and features

The source-image detector independently recovers exactly the previously published clean-page set:

`p4,5,9,10,11,12,13,16,17,18,19,20,21,24,25,26,28,29,30,31,41,42,43,44,45,46,47,48,52`.

These 29 pages contain **348 physical lines, 7,771 same-page adjacent-pair opportunities, and 50 of the 86 doublet events**.

Four source-defined compositor features are tested at each line:

1. signed right-edge slack from the established common ink edge x=1792;
2. whether the right edge is outside the prior ±4-pixel compositor tolerance;
3. whether the incoming baseline pitch exceeds 210 pixels, selecting the already known ~224-pixel extra-leading class;
4. absolute left-edge deviation from the modal x=601.

Each doublet is assigned to the physical line containing its first rune, exactly as in the prior T7 line analysis.

## Page-conditioned site null

For each clean physical page, preserve its **exact observed number of doublet events**. Sample that many pair sites without replacement from the page's actual adjacency opportunities, so longer lines automatically receive proportionally more exposure. Geometry stays fixed. The four feature totals are computed over 100,000 deterministic draws (seed 33012027).

| fixed source feature | observed event-weighted total | null mean | z | two-sided p |
|---|---:|---:|---:|---:|
| right-edge slack | 1123 | 1024.36 | +0.713 | 0.4755 |
| outside ±4 px edge tolerance | 44 | 42.79 | +0.504 | 0.6837 |
| extra incoming leading | 1 | 0.946 | +0.058 | 1.0000 |
| left-edge deviation | 6 | 8.332 | -0.741 | 0.5315 |

The largest absolute standardized deviation is only **0.741**. Correcting by the maximum absolute z over all four frozen features gives **familywise p=0.9494**.

## Decision

Ordinary compositor geometry does **not** explain which clean-page lines carry adjacent-repeat events. The local exception-channel follow-up below also rules out a conventional direct punctuation flag and a glyph-independent exact horizontal-gap classifier by explicit source counterexamples. In particular, the real 224-pixel extra-leading locations and the established right-margin residuals are not a low-parameter predictor of T7 line occupancy.

This narrows the T7 branch without producing a cipher: the residual line-status effect is not captured by semantic word boundaries, lag-five or T6 echo states, or these basic physical compositor features. Do not respond by fitting arbitrary per-line geometry combinations. A successor needs an independently authored line-status cue or a mechanism that predicts event locations and leads to a reversible original-cipher inverse.

Reproducer: `sims/lp2_t7_cleanline_geometry_sft.py`.

## Physically local exception-channel gate (Director #3329)

**Decision — 28 November 2026:** A direct punctuation flag and a glyph-independent exact horizontal-gap classifier cannot encode the 86 adjacent equalities. This is an exact counterexample to these specific classes, beyond the earlier statistical line-occupancy result; it does not exclude glyph-conditioned typography, a globally decoded side channel, or deterministic secret-state mixing.

**All original-corpus event positions.** Parse the pinned physical-page transcription (blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; canonical alphabet blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165) without removing separators until the intervening text has been recorded. The 86 adjacent equalities in 12,955 pairs partition as follows: 60 with no intervening printed token, 3 across internal line wraps without a group boundary, 21 across an ordinary same-line group divider, 1 across a line wrap with a group divider, and 1 across a period (global zero-based second-rune offset 8385). Zero physical page-seam repeats. There are **0/86 large-mark offset matches** and only 1/86 matches to the punctuation-identity inventory (blob 96409ec38f8fbbb19f8e47aaf48ff2bf1788a99e). Thus 63 events are interior to complete printed groups, with no conventional group delimiter to carry a direct local flag. The 60 same-line cases provide the relevant pixel-test population.

**Original-pixel gate, not another line-level correlation.** Use the previously frozen 29 clean pages, their line bands at threshold 135, then enumerate horizontal ink-projection runs within x=590..1829. Keep a line only if the number of runs equals the source token count and every short punctuation vs full-height rune category matches (height cutoff 50 px). Exclude all uncertain alignments; do not force a match or tune thresholds on observed doublets. Of 36 candidate event-bearing lines (37 same-line intragroup equalities), 17 lines and 17 events pass this conservative alignment. Of those, **11 have an exactly equal horizontal blank-column gap in a different-rune pair on the very same line**, refuting any deterministic glyph-independent classifier based on the gap value even if it has a private per-line threshold or lookup. Counts per (physical page, zero-based line, gap px, count of other same-gap within-group unequal pairs):

| Page | Line | Gap | Same-gap others |
|---:|---:|---:|---:|
| 9 | 2 | 4 | 6 |
| 9 | 5 | 5 | 4 |
| 19 | 0 | 4 | 6 |
| 24 | 4 | 4 | 4 |
| 24 | 11 | 5 | 6 |
| 26 | 2 | 6 | 3 |
| 29 | 6 | 5 | 4 |
| 41 | 2 | 6 | 4 |
| 41 | 11 | 5 | 5 |
| 42 | 0 | 4 | 4 |
| 48 | 3 | 4 | 6 |

The six other aligned events have gaps 6, 2, 4, 5, 1, 2 px (p9,20,25,44,44,47 respectively); no population-wide anomaly claim follows. A concrete source witness is p19 line 1 (zero-based 0) with the doublet ᚩᚩ in ᚱᚩᚩᛄ, and six ordinary equal-gap comparators. Authentic native control: clear p57's second printed line begins U N N E L NG (TUNNELING continues from prior line), with first three x-projections [890,941], [947,980], [986,1019] in y=1080..1239; the unequal U→N and equal N→N gaps are both **5 px**. This normal native pair needs no auxiliary symbol. This control is not an assumed decoder for the unknown book.

**Capacity with exact assumptions.** If arbitrary exception positions must be specified independently, there are binomial(12955,86) choices, requiring 741.32984 bits of state capacity (or 742 fixed binary bits); even knowing all exceptions belong to the 10,060 intragroup opportunities and specifying 63 such sites costs log2 binomial(10060,63) = 547.39379 bits. These are worst-case unrestricted support requirements, not empirical entropy estimates. The observed repeated ciphertext symbols already specify their own 86 positions, so charging that location cost to a repeat-signalled receiver would be wrong. However, one independently missing binary decision at each known event still needs 86 bits in the unrestricted case; an arbitrary GP29 payload at each needs 417.78637 bits. The 31 unsolved large marks offer at most 31 independent binary dot-count choices, or at most 62 if color is independently binary; with exactly 3 ten-dot marks their count-pattern capacity is log2 binomial(31,3) = 12.13411 bits. Those fixed-slot mark alphabets cannot serve as an unrestricted independent binary payload at 86 already-known positions. Allowing arbitrary new mark positions or additional measurable morphology would change the model and the bound; this is not a claim about total information capacity of JPEGs. In strict no-repeat hidden-emission explanations, assuming one hidden emitted symbol exactly between each equal visible pair and no hidden symbol elsewhere, seven possible silent mod36 symbols or 28 possible deleted GP29 symbols per pair already allow 7^86 or 28^86 latent paths (241.43 or 413.43 bits), before any other ambiguity. This is latent-state ambiguity, not automatically a lower bound on distinct native plaintexts under a restricted deterministic sender. A source-selected generator or a singleton exception law can avoid independent per-event payload, but must be specified and justified separately.

**Fork (incorporating the original-JPEG event-conditioned raster control below):** Retire direct punctuation-as-local-event flags, glyph-independent horizontal-gap flags, and the 31-fixed-mark count/color alphabet as an unrestricted exception sidecar. The separate all-rune allograph audits (#1260/#3326) have already rejected stable ordinary same-rune forms, and the new doublet-specific raster test below finds no exceptional event-copy form when controlled at the physical-line level. Do not reinterpret an equality as recovered hidden state or fit a private per-event selector. A *source-identified nonordinary* glyph, globally decoded payload, or low-entropy deterministic generator remains possible only with independent evidence; none is supplied by these negatives. No full-page inverse/unknown plaintext is justified. 

**Reproduction:** [source and pixel script](../sims/lp2_doublet_local_exception_channel_sft.py); read pinned source text and original JPEGs from repository, outputs every doublet coordinate and all aligned and excluded line records. The full 86-event parse and punctuation offset join ran in connector JS; the same 36 event-line token strings were passed as a local TSV fixture to the Python pixel core and executed against the supplied native 2400×3600 originals. The p57 local control was separately executed directly on the original. Combined repository entry point not executed end-to-end because local repository checkout/DNS is unavailable; no CI run claimed.


## Event-conditioned original-JPEG glyph-copy gate (Agent26, 28 November)

**New decision in the scope left open by #3329.** A glyph-conditioned exception may be invisible to an ordinary GP29 transcription: two adjacent copies of the same rune might be pasted, drawn or composited differently from other instances of that rune, thereby supplying the missing one-bit exception decision without an external sidecar. This narrower **same-letter-at-a-repeated-pair** question is distinguishable from the book-wide ordinary-rune allograph search closed under [#1260](../im-results/lp2-allograph-full-source-controlled-split.md), which tested the general two-form claim with exact Q92 and native controls. It is also distinguishable from #3329's physical gap and punctuation tests.

**What the original pixels say.** The [source-aligned readback](../sims/lp2_doublet_glyph_morphology_sft.py) reuses the independently locked p9 29-glyph medoids, original JPEG crops and edit-distance alignment from [the full-image audit](../sims/lp2_original_jpeg_glyph_audit_sft.py). Among the 12,956 unknown-page runes it exactly matches **11,715** (zero contrary matches), and maps both glyphs at **80/86** source-equal adjacency sites. At first, comparing an equal-rune *pair* with all distant same-rune pairs on the **same page** seems to yield a clue: 69 analyzable pairs average raster Hamming percentile **0.39137**, with 16 in the bottom decile and only 3 in the top; but the event glyphs' separate medoid-error ranks average **0.4866 / 0.4673**, near ordinary. The naive within-page control is mismatched on a critical nuisance: it mixes different physical print lines, whereas most repeated pairs occupy the **same line**. It is not evidence for a compositor key.

The separate [same-line corrected control](../sims/lp2_doublet_same_line_raster_control_sft.py) joins the original physical transcription's slash-delimited lines to the image-aligned rune positions; **76** of the 80 image-mapped unknown doublets have both glyphs on the same printed line (four cross-line events excluded). The comparison inventory is *nonadjacent same-symbol pairs on the same physical line*, pooled across original pages and matched by GP letter. Two fixed source controls are used, first all such pairs (3,848 control pairs) and then only those two to five rune positions apart (1,355 controls). The letter-conditioned event percentiles and pixel-identical pair counts are:

| Original-JPEG metric | All same-line same-rune controls | Same-line same-rune controls 2–5 slots apart |
|---|---:|---:|
| Analyzable event pairs | 76 | 76 |
| Mean event Hamming percentile | **0.48231** | **0.48181** |
| Median percentile | 0.49176 | 0.50000 |
| Pixel-identical event glyph-pairs | 22 | 22 |
| Letter-conditioned null expected identical pairs | 23.932 | 23.147 |
| 50,000 resamples: P(null ≥ 22) | 0.728585 | 0.661727 |
| 50,000 resamples: P(null ≤ 22) | 0.362993 | 0.439031 |

**Interpretation:** the initial unusually similar-copy effect **disappears under the source-visible physical-line control**. Neither high template mismatch nor unusual exact duplication distinguishes the 76 covered repeated-rune pairs. The precise test is not a formal impossibility proof for all authored allographs: six unknown events lack this image-extractor's confirmed paired segmentation, four others fall across printed lines, and this source-line control is not further conditioned on per-glyph JPEG DCT block phase or a cryptanalytic bit-order receiver. Solved p56–p57 doublets were not mapped by this particular fixed-height extractor and are **not** represented as controls here; the independent [native-Q92 allograph audit](lp2-allograph-full-source-controlled-split.md) supplies that separate control. The Monte Carlo statistic resamples letter-conditioned observed control distances with replacement and treats overlapping control pairs as a descriptive null; do not over-interpret it as a global error-controlled p-value.

**Concrete successor condition:** no ordinary repeated-glyph copy/paste feature can now be promoted to a repeat-event key on these source pixels. A renewed visual channel needs a genuinely new **authored, source-readable nonordinary residual**, with fixed coordinates/extraction and solved-page or renderer controls; re-scoring generic pixel texture against native prose is not a valid successor. This materially retires the page-line-blind hint and prevents deriving a spurious key from a misleading statistical comparison. No authentic plaintext or new key is recovered.

**Reproduction:** [first full-JPEG run 46126170606](https://github.com/FlareZ123/liber-primus/actions/runs/46126170606) and [corrected same-line control run 46126751552](https://github.com/FlareZ123/liber-primus/actions/runs/46126751552); workflow [agent26-doublet-glyph-morphology.yml](../.github/workflows/agent26-doublet-glyph-morphology.yml). The initial same-line implementation inadvertently enumerated mapped glyphs in descending traceback order and therefore skipped all positive-distance controls; the final source script explicitly sorts each physical-line group before building pairs, and only the corrected second CI run supplies the table above. Dependencies pinned: Python 3.11, NumPy 1.26.4, Pillow 11.0.0 and OpenCV-headless 4.10.0.84.
