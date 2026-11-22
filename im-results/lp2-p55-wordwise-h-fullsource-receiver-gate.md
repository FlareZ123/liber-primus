# Original LP2 wordwise outside-in H: full-ciphertext reversible receiver gate

**Agent20, 22 November 2026. Classification: source-constrained six-decoder negative, not recovered plaintext or an authenticated page cipher.**

## Why this bounded receiver is plausible

The solved, original p57 instructs a pilgrim to “SHED OUR OWN CIRCUMFERENCES” and “FIND THE DIVINITY WITHIN”. A literal word-level operation is to pair each printed word's first/last rune, then work inward. The extant p55/p28 investigation independently defines the reversible arithmetic pair map

`H(a,b)=(a−b, a+b) mod 29`,

with `H⁻¹(u,v)=((u+v)/2,(v−u)/2) mod29` (inverse of two is 15). Its p55 application has previously been **partial**: five recursively emerged word centers and the three shell pairs around one surviving 13-rune word yield source-word navigation. Those partial readouts do not supply the complete p55 plaintext or an inverse for the printed passage.

Here the missing **direct 76-rune consumer** is made explicit: apply the same H transform *to every opposing pair in each complete original word*, rather than only to a specially selected surviving word. The signed p28 DH-state exponent `e=3` supplies one motivated alternate iteration count. The solved p57 word “shed” motivates a candidate one-extra-round-per-inner-shell clock. These choices are **hypothetical receivers**; no first-party instruction explicitly fixes the all-word application, sign or iteration clock.

## Frozen exact operations

Six transformations of the original GP29 ciphertext were run, with no fitted key, phase, permutation, word regrouping or cryptographic-score optimization:

| Receiver | H exponent on each symmetric word-rune pair |
| --- | --- |
| `one+` / `one−` | +1 / −1 |
| `three+` / `three−` | +3 / −3 |
| `depth+` / `depth−` | +(d+1) / −(d+1), where d=0 at the outermost pair |

For odd-length words, the lone center rune is held unchanged. All pairs are transformed simultaneously from their **original** rune values. A physical page break **does not split a printed word**: the parser rejoins the canonical across-page carries, including p54→p55, before any pair operation.

The SFT consumes the repository's literal `lp2-transcription.txt` (preserving `-` and `.` word breaks and suppressing line/page wraps) and validates its flattened glyph stream *exactly* against all **13,136** canonical GP29 indices in `lp2-corpus.json`. It has **2,941** complete transcript words, including the two clear terminal pages. Of these symbols, **12,956** belong to the 55 rune-bearing unknown p0–55 pages. The rune-free numeric p50 is correctly excluded from letter scores, but not from physical page indexing.

A planted complete-word positive applies the opposite H exponent to the same source-shaped words and recovers the entire **13,136/13,136** rune stream exactly under each mode, including solved p57. This is an algebraic forward/inverse control, not a claim that the cipher type is historically correct.

## Exact original-ciphertext readout

The normalized index of coincidence here is `29 × sum f(r)(f(r)−1)/(N(N−1))`; uniform GP29 yields ~1. A clear original solved p57 page has normalized IoC **1.818589** on 95 runes, whereas the unknown 76-rune p55 original has **1.098947** before transformation.

| Model | Whole unknown 12,956-rune IoC | Highest unknown page IoC (page) | Decoded p55 IoC |
| --- | ---: | ---: | ---: |
| `one+` | 0.999351 | 1.108457 (p51) | 0.946316 |
| `one−` | 0.999730 | **1.139649 (p55)** | **1.139649** |
| `three+` | 0.999649 | 1.098947 (p55) | 1.098947 |
| `three−` | 0.999416 | 1.062534 (p32) | 0.976842 |
| `depth+` | 0.999156 | 1.088772 (p55) | 1.088772 |
| `depth−` | 0.999339 | 1.085105 (p15) | 0.976842 |

All six entire decoded manuscripts retain near-uniform GP29 histograms, despite the direct inverse changing word-internal rune values. No unknown page shows anything resembling p57's clear-symbol concentration under this small, source-motivated family. The top page score was selected across all 55 pages and six decoders; it is **not** a positive or a recovered phrase. The SFT prints each complete decoded p55 transliteration and the maximum for every variant for manual inspection.

## Decision and relationship to the genuine open problem

The straightforward operation “shed every word from the outside in with the same fixed H transform”, including direct one-round, DH-three-round and depth-dependent word shell variants, **does not unlock p55 or any other LP2 unknown page** in situ. This is a bounded failure of six precise receivers, with exact reverse replay on all original runes. It does not exclude an H-derived word-map *navigation* clue, a differently specified source-selected data stream, or a later second cipher layer.

The earlier p55 five-core **WITHIN** and isolated **THE ROAD AND** navigational readouts are unchanged. The missing step remains an author-selected, value-changing rule that produces authentic plaintext under original word and page constraints. More H iteration counts or score-optimized word-order permutations have no direct support from the printed clues and should not be opened just to rescue this receiver.

**Reproducer:** [`sims/lp2_p55_wordwise_h_fullsource_sft.cjs`](../sims/lp2_p55_wordwise_h_fullsource_sft.cjs). Run from repository root with Node.js 22. Zero external dependencies and zero file writes. The checked parser identity and full exact round-trip are runtime assertions.
