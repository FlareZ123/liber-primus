# Full-corpus GP0→p50 adjacent-word successor holdout

**Status: negative for a general word-successor decoder; source-selected local pointer routes remain separate.**  
**Date:** 20 November 2026 · **Agent:** Agent9

## Question

The signed-2016 “words are the map / numbers are the direction” clue, together with the p57 and local p0/p27 pointer results, motivates a simple candidate rule:

`T[GP0(w_i)] = GP0(w_{i+1})`,

where `T` is the original 256-cell p50 table decoded in base60 and `GP0(w)` is the raw sum of the word's zero-based Gematria Primus rune indices.

If this is a general successor mechanism for unknown LP2 prose, it should produce an excess of exact transitions in the complete unknown corpus, ideally including multi-edge runs.

## Method

- Used the canonical transcription and rune corpus, with the complete-word parser that preserves line wraps and all 32 cross-page carries.
- Scope: physical p0–p55, excluding the rune-free p50 table page. This yields **12,956 runes**, **2,896 complete words**, and **2,895 adjacent-word pairs**.
- Each source word with `GP0<256` addresses the corresponding p50 cell. The decoded table value must equal the next complete word's raw GP0 sum exactly; no modulo, offset, or normalization is applied.
- Base60 is the primary interpretation for the pre-SHED unknown pages. Base59 is reported only as a sensitivity check.
- The null randomly permutes the 256 existing table values while preserving their exact multiset and the original word sequence. A deterministic xorshift32 generator uses seed `0x3301` for 50,000 shuffles.

## Results

**No general successor enrichment.**

| Measure | Result |
|---|---:|
| Complete words | 2,896 |
| Adjacent pairs | 2,895 |
| Distinct GP0 addresses | 193 |
| Base60 exact successor edges | **10** |
| Expected edges under fixed-token shuffle | **11.83984375** |
| Upper-tail shuffle probability | **0.73624** |
| Consecutive base60 edge runs | **None** |
| Base59 sensitivity edges | 11, also isolated |

The ten base60 hits are isolated and occur at:

| Page / line | Source word (GP0) | p50 token | Next word (GP0) |
|---|---|---|---|
| p0 / 2 | `NEWBASOEEOINGU` (156) | `0q` | `NAEGITH` (52) |
| p6 / 2 | `WIIASPLTHASJ` (144) | `25` | `IADYRDOE` (125) |
| p9 / 5 | `CEONG` (38) | `2D` | `AENIAEAWIIA` (133) |
| p11 / 6 | `XOEPMDCTHWP` (118) | `0Z` | `IAH` (35) |
| p13 / 2 | `ETOX` (51) | `0x` | `YMFX` (59) |
| p16 / 3 | `TRIAAEFD` (95) | `0Z` | `NGJO` (35) |
| p26 / 7 | `UEIOIA` (59) | `19` | `JEOUTHLCE` (69) |
| p35 / 2 | `MB` (36) | `0s` | `MAJ` (54) |
| p42 / 7 | `BEO` (29) | `16` | `IAHXB` (66) |
| p54 / 5 | `XACWIA` (77) | `2O` | `MOPYDIALP` (144) |

The fixed-multiset null produces at least ten hits in **73.624%** of shuffles. A two-edge run occurs in 4.51% of null shuffles; the observed absence of such a run is therefore not independently significant. The base59 sensitivity gives eleven isolated edges and no consecutive run.

## Interpretation

The exact direct successor rule is **not enriched** across the unknown manuscript and does not form a usable general word graph. Do not extend it into a manuscript-wide word-by-word decoder.

This does **not** invalidate the previously identified local p0/p27 navigation circuits: those use additional source-selected typed steps and receiver conditions, not merely the generic adjacent-word equality tested here. Keep those local routes as navigation evidence, not as proof of a global cipher.

## Reproduction

Run from the repository root:

`node sims/lp2_full_corpus_gp0_wordgraph_sft.cjs`

The script asserts the 2,896-word / 12,956-rune canonical parse, 32 cross-page carries, exact edge lists, expected count, and deterministic shuffle diagnostics.

Related research: [local 2016 GP0/p50 pointer circuit](lp2-2016-gp0-table-word-pointer-circuit.md) · [authoritative synthesis](../results/README.md).
