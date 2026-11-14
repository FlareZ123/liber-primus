# Fibonacci-page lag-eight scalar-feedback inverse: original LP2 result

**Agent 37, 14 November 2026. Classification: bounded original-input cryptanalytic negative with a complete causal inverse.** No new plaintext, authentic LP2 key, author-selected cipher, or continuation destination is recovered.

## Source clue and testable hypothesis

Two independently printed properties suggest a specific memory-length experiment. The original p15 4×4 numerical spiral is exactly reconstructible using Fibonacci-indexed primes (see `sims/fibonacci_prime_spiral.cjs`). The original pp49–51 numerical table is printed in **eight columns**. Earlier work found a striking paucity of repeated **nonzero ciphertext first differences at lag eight**, especially on the Fibonacci-numbered physical pages 8, 13 and 21: 45 equal nonzero steps in 2,226 eligible comparisons across ten Fibonacci pages, while a within-page inventory-preserving null expects about 82.35. The source and its conditional test are fully documented in [the existing Fibonacci lag-eight inventory study](lp2-fibonacci-lag8-inventory-fixed-fork.md).

That finding leaves an untested, economical reversible explanation: perhaps a **linear recurrence of ciphertext differences** produces the apparent repulsion. Take each original page's nine initial ciphertext GP29 indices as an IV, set `D_i=C_i−C_(i−1) mod 29`, and for every page-local position `i≥9` test the proposed native-GP inverse

```text
R_i = D_i − a·D_(i−8) (mod 29).
```

The recurrence is causal and lossless: `D_i=R_i+a·D_(i−8) (mod 29)`; accumulate those differences from the original ninth ciphertext rune to reproduce all of the source's subsequent ciphertext. The only free scalar `a` is in GF(29). `a=1` represents direct lag-eight differencing; `a=8` corresponds numerically to the printed eight-column layout; `a=24` is the manuscript-derived p39 double root; `a=17` is an independently present GP numeral; `a=0` is a no-feedback diagnostic. The manuscript **does not instruct this recurrence, these slopes, or the use of Fibonacci page numbers as a cipher selector**. In particular the observed lag-eight *equality deficit* alone does not imply a linear recurrence.

This is a distinct family from the [previously rejected 29-category lag-eight rank-and-exclusion model](lp2-fibonacci-lag8-inventory-fixed-fork.md), which reserved two symbol labels and allowed completely unknown static page alphabets. Here every GP29 step remains a field element; the lag-eight term is subtracted algebraically, and **the entire finite 29-slope family is tested without fitting words, phase, page order or plaintext**.

## Original exact results

The original [58-page indexed corpus](../resources/liber-primus/lp2-corpus.json) supplies exactly **12,956** unknown runes over p0–55, with p50 runeless. Apply the same page-local transform to three independent source scopes: the ten physical Fibonacci-indexed pages `0,1,2,3,5,8,13,21,34,55` (2,256 post-IV rune positions); their high-anomaly triple p8,13,21 (773 post-IV positions); and **all 55** unknown rune-bearing pages (12,461 post-IV positions). The index of coincidence measures GP29 label concentration; approximate native-English GP control is substantially above the random-like 0.0345 range.

| Fixed scalar | Ten Fibonacci pages, IoC | p8/13/21 only, IoC | All 55 pages, IoC |
| ---: | ---: | ---: | ---: |
| 0, no feedback | 0.03546217232 | 0.03634986494 | 0.03531570667 |
| **1, literal lag-eight subtraction** | **0.03470577597** | **0.03481825068** | **0.03447739290** |
| 8, printed column count | 0.03445652687 | 0.03410439107 | 0.03446461467 |
| 17 | 0.03452257395 | 0.03446969951 | 0.03451688691 |
| 24, source polynomial root | 0.03456346024 | 0.03449315968 | 0.03447320648 |

The test evaluates **every one of the 29 possible scalars**. The **highest** ten-Fibonacci-page IoC across the entire family is **0.03546217231998239**, attained by `a=0`, the no-feedback first-difference channel. No scalar shows English-like rune-frequency concentration across those original 2,256 positions. The prominent triple p8/13/21 similarly remains near a uniform native-GP register under each fixed source scalar. The original outputs have no sustained recognizable GP plaintext.

The original source signal therefore does **not** resolve into a direct scalar-eight-feedback plaintext inverse. This conclusion is specific to the source-segmented, page-reset GP29 field register: an authentic non-linear, plaintext-dependent, time-varying or transposition component could behave differently.

## Complete forward test and independent solved-page plant

The [standalone CommonJS SFT](../sims/lp2_fibonacci_lag8_source_scalar_feedback_sft.cjs) asserts source page totals, all frozen numerical readouts and the exhaustive maximum over `a=0..28`. Every original page is decrypted under **every slope** and recomposed through the strictly causal forward recurrence, checking **29×55=1,595 exact full-page original-cipher round trips**. Each of the ten source-selected pages also receives an **independently solved p57 GP-native plaintext plant** with precisely the matching original post-IV length. Encryption and decoding recover all those rune positions exactly for every slope, **29×10=290 positive whole-page experiments**. The positive stream has IoC **0.0711869604**, in contrast to the original's maximum 0.0354621723. This validates the inverse's ability to expose genuine source-like GP runes when its hypothesized encoder is true, without treating a planted passage as original unknown plaintext.

The SFT was independently executed against the exact repository code and the unmodified original indexed corpus in a JavaScript runtime: all assertions passed. The execution uses equivalent Node standard-library shims to supply the pinned original file and strict assertions; the permanent file runs unmodified as a CommonJS script under Node 22.

## Key-independent extension: even all page-secret scalar choices fail native English

The direct GP29 inverse might conceal letter frequencies under a secret alphabet. Grant each of the ten Fibonacci pages **its own arbitrary scalar `a_p` (0–28) and its own arbitrary invertible permutation of all 29 output runes**, fixed over that page. The nine IV runes per page remain unscored, as in the original inverse. A fixed per-page permutation preserves each residual symbol's multiplicity, so the maximum number of occurrences of *any one* GP plaintext rune is the maximum residual bin on each page, summed over all ten pages. Two distinct plaintext runes together are limited by the two largest residual bins on each page.

Exhaustively optimizing the scalar separately for every source page yields **177/2,256** maximum occurrences of *any one* plaintext rune and **316/2,256** combined occurrences of *any two* distinct plaintext runes, even under entirely arbitrary page-secret alphabets. These are exact, source-invariant necessary ceilings with no language-model tuning or alphabet search. They are weaker only than the unrealistically generous page-IV exemption already disclosed.

The independently GP-source-calibrated [full source-English window controls](lp2-fibonacci-lag8-inventory-fixed-fork.md) established a *minimum* of **195 occurrences of the most frequent rune** and **386 occurrences of the two most frequent runes** across **594,160 contiguous 2,256-rune windows** of Shakespeare (214,851), Gibran (60,237), and Emerson (319,072). Thus **none** of those 594,160 reference-language windows can be exactly represented by the entire original page-secret scalar-plus-permutation family. This is a finite corpus exclusion in the source-native GP register, not a proof for all English literature or other plaintext encodings. The control set and GP transcription were established before this experiment.

A genuinely different, higher-complexity scheme might use **eight independent slope keys per page**, one at each printed table-column phase. Granting that family even independent phase-specific secret symbol permutations produces very generous original-data ceilings **419** (one rune) and **685** (two runes); the native-English minima no longer exclude it. A source-derived phase schedule and independent plaintext/key evidence would be required before that larger family merits key fitting.

The [updated standalone CommonJS SFT](../sims/lp2_fibonacci_lag8_source_scalar_feedback_sft.cjs) computes the complete all-page-secret 29-slope histogram envelope exactly, asserts **177/316** and **419/685**, and preserves the 1,595 authentic original-cipher and 290 GP-native planted exact forward roundtrips. **Decision:** retire even per-page arbitrary scalar plus fixed alphabet decoding as native GP prose for these original source windows; a genuinely author-selected *changing state within pages* or a different register is needed.

## Decision

**Retire the direct page-reset lag-eight *scalar difference* decoder under all 29 GF29 parameters** as an explanation of ordinary GP-native English in the ten Fibonacci pages. The earlier anomalous lag-eight equality result remains an interesting conditional observation, but supplies no authentic plaintext/key or specified non-linear state transition. Avoid scalar tuning, extra plaintext-dependent erasures or unmotivated page-specific slope fitting. A follow-up should offer an independently sourced key schedule, explicit cipher-state operation or source-selected outside message that predicts multiple untouched ciphertext runes before optimizing a new inverse.
