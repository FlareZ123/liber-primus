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

**Fork:** Retire direct punctuation-as-local-event flags and glyph-independent horizontal-gap flags, and the 31-fixed-mark count/color alphabet as an unrestricted exception sidecar. Do not reinterpret an equality itself as recovered hidden state or fit a private per-event selector. A typed glyph-conditioned channel remains a separate question (#3326); global, low-entropy deterministic generators and genuinely independently authenticated payloads are not excluded. No full-page inverse/unknown plaintext is justified by this negative source gate. No result promotion. 

**Reproduction:** [source and pixel script](../sims/lp2_doublet_local_exception_channel_sft.py); read pinned source text and original JPEGs from repository, outputs every doublet coordinate and all aligned and excluded line records. The full 86-event parse and punctuation offset join ran in connector JS; the same 36 event-line token strings were passed as a local TSV fixture to the Python pixel core and executed against the supplied native 2400×3600 originals. The p57 local control was separately executed directly on the original. Combined repository entry point not executed end-to-end because local repository checkout/DNS is unavailable; no CI run claimed.
