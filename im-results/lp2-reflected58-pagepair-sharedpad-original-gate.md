# Reflecting the 58 original LP2 pages: a source-locked shared-pad original-inversion gate

**Agent 9, 17 November 2026. Classification:** new, bounded original-input negative for a position-aligned reused GP29 pad under full-release reflection. **No unknown plaintext, authored key, cipher mechanism, or destination recovered.** Reproducer: [Node22 CommonJS SFT](../sims/lp2_reflected58_pagepair_sharedpad_sft.cjs); [original-source workflow](../.github/workflows/agent9-reflected58-pagepair-manual.yml).

## Original clue and strongest alternative

The 2014 release has exactly **58 physically ordered LP2 images**, twice the source's **29 Gematria Primus** symbol count. A human could envisage a two-sided book and pair physical page `p` with `57−p`, a *reflection* of the entire physical sequence. This is materially distinct from the previously tested `p↔p+29` page-offset alignment ([prior gate](lp2-fixed-offset29-original-page-pairing-gate.md)). The manuscript supplies no first-party instruction for book imposition or pad reuse. The counter-hypothesis is that page number and GP29 alphabet size simply happen to produce the same factor.

The original corpus [LP2](../resources/liber-primus/lp2-corpus.json) contains 58 pages; encrypted p0–55 hold **12,956** GP29 indices. Pairing the encrypted pages with other encrypted pages excludes `p0↔p57` (p57 is clear), `p1↔p56` (p56 is already solved), and `p7↔p50` (p50 is entirely numeric). This leaves **26 mirrored pairs** covering **5,402 paired rune offsets**, where each pair is compared from the start and only through its shorter page. No plaintext, punctuation, word-boundary positions, or phase offsets are fitted.

## Direct all-key invariant and exact original result

A reversible reused-pad proposal is `C_A[i]=(P_A[i]+K[i]) mod29` and `C_B[i]=(P_B[i]+K[i]) mod29`; `K[i]` may be a completely unrestricted arbitrary secret at every offset. It forces `C_A[i]===C_B[i]` exactly when `P_A[i]===P_B[i]`. This property is independent of the pad's entropy, period, key length and key-generation procedure. The same equality identity holds for an arbitrary shared positionwise GP29 permutation.

The source pair alignment gives:

| Frozen direction within each mirrored page pair | Equal original runes | Rate | 20,000 original-B circular-phase null mean | Nulls at least as large | Add-one tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same forward printed direction | **215/5,402** | **0.0398001** | 185.87345 | 373 | **0.0186991** |
| Reverse the opposite page's reading direction | **193/5,402** | **0.0357275** | 185.86555 | 6,190 | **0.309535** |

The null preserves the exact original page, symbol multiset and contiguous sequence for each side. It independently selects an integer circular rotation of the second physical page of each of the same 26 pairs. Deterministic xorshift32 seed `0x33015729` controls 20,000 complete alignments **per fixed direction**. The original's forward alignment exceeds typical rotations modestly; that one-tail p-value is conditional on this postulated geometric pairing and metric. It does not correct for the many broader historical candidate architectures and alternative physical pairings.

The most conspicuous local pair is p17↔p40, with **18 equal positions of 231**, but the maximum over all 26 original pairs has a circular-phase-scan tail **0.068747**. The best contiguous four-pair forward run is p15↔42 through p18↔39, **52** equal runes, with null scan-max tail **0.019699**. This small local pattern is not a recovered phrase and supplies no key.

## Genuine original length-matched, shared-secret English plants

A completely separate *positive* source test samples random non-overlapping-position GP29 English windows for the **same 26 original pair lengths** from each of Shakespeare, Gibran and Emerson, encoded with the repository's independently solved LP1-calibrated **ING/IO** GP spelling. Every pair is encrypted under a freshly drawn random GP29 `K[i]`, identically applied at each local position of both paired plaintexts. The decoder verifies every planted plaintext symbol and the expected equality invariance. Each source receives **2,000** such whole-book pairings. We count the number of equal paired ciphertext symbols over the same **5,402** locations.

| Source-native controlled author | Typical matching GP29 runes, 5,402 positions | Minimum of 2,000 matched plants | Plants with ≤215 |
| --- | ---: | ---: | ---: |
| Shakespeare | **about 321** | **266** | **0** |
| Gibran | **about 323** | **255** | **0** |
| Emerson | **about 332** | **270** | **0** |

These figures were first independently computed by direct source-data execution; the source-exact SFT reruns the complete scan and self-inverting positive family. The finite empirical bounds are **1/2,001 per source**, conditional on each author and sampling model. They do not prove that an unknown non-English plaintext cannot obey a shared pad.

## Cryptanalytic decision

The original's **215/5,402** equalities are far below genuine GP29 English controls encrypted with a *completely unknown common pad*. The mild page-reflection alignment excess is insufficient to rescue **same-position common-key English** as a source-chosen recovery route. Arbitrary pairwise different pad starts, source-authenticated transpositions, a different plaintext register, feedback, and independent page-specific keys are outside this test, and should not be guessed merely to increase the original match rate.

**Outcome:** retire the specific `p↔57−p` shared-position GP29 key-reuse hypothesis. Preserve the original symmetric-pairing signal as a low-strength observation with calibrated null, without promoting it to an authored cipher mechanism or plaintext. Further mirror-specific work needs an independent first-party page-imposition instruction or a held-out cipher prediction, not a tuned rotation.
