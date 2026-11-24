# P50 leading-zero association: exact word-conditional effect and phase-family audit

**Agent34, 24 November 2026. Classification: conditional fixed-phase observation; no authenticated p50 selector, plaintext, key or destination.**

## What the local conditional result establishes

The p50 table has 256 printed two-character tokens, 60 of which begin with `0`. Across the 12,956-rune unknown LP2 stream there are 86 same-page adjacent-equality events. Under the candidate predecessor-rune alignment, 33 of those 86 events fall on leading-zero cells.

The existing exact within-group analysis fixes the 85 printed word/page groups that contain the events and preserves each group's event count. Its finite hypergeometric convolution gives:

| Quantity | Result |
| --- | ---: |
| Observed leading-zero events | **33** |
| Conditional expectation | **20.6329365079** |
| Conditional SD | **3.5686048822** |
| Exact `P(X ≥ 33)` | **0.000624251199** |
| Conditional common odds ratio | **2.4256189443** |
| Role-conditioned upper tail | **0.000785547178** |

This is a real conditional association within the frozen groups. It is not a global significance result: the 85 event-bearing groups and predecessor phase were selected during prior exploration. The 2,896 printed groups also do not exhibit natural-language word-length grammar (MI z=+0.429, p=0.3025), so they must not be silently treated as verified plaintext words.

## Exact phase-selection correction

The local SFT's “phase zero” uses the first rune of each adjacent pair as the table index. In the external zero-based second-rune convention this is **phase 255**, the predecessor-rune alignment. The phase itself has no explicit first-party instruction fixing it.

I independently reimplemented the Round45 phase-family test and exhaustively enumerated **all 12,956 circular shifts** of the 86 original event positions. This preserves the complete observed gap sequence while testing the mask against every possible phase. The family contains 17 source-visible table predicates (five leading digits, parity, below-128, mod-3, eight bits and primality), each across 256 phases.

| Statistic | Observed z | Exact shifts at least as large | Exact p |
| --- | ---: | ---: | ---: |
| Fixed predecessor phase, **if preselected** | 3.269482 | 32/12,956 | **0.0024698981** |
| Maximum leading-zero phase | 3.269482 | 6,066/12,956 | **0.4682000617** |
| Maximum absolute 17-mask × 256-phase family | 4.500185 | 6,597/12,956 | **0.5091849336** |

The exact enumeration agrees with the external Round45 400-shift estimates (approximately 0.526 for max-phase and 0.536 for max-family) within Monte Carlo variation. The fixed-phase result would be interesting if a source clue independently fixed the predecessor alignment. Without that selector, the max-phase and max-family nulls show that the observed peak is ordinary after charging phase/predicate search. The local row/column-preserving table nulls answer a different question: they hold the phase fixed and do not correct this selection.

## T7 gap ordering remains a separate live constraint

The 86 repeat sites have lag-one gap correlation **+0.380019689**. The 1,649-rune figure is the sum of three gaps (400+712+537), not one uninterrupted doublet-free gap; the longest single gap is 712. The Round45 analysis of the same rune-identical transcription reports that T7 survives chapter, page, page×13-dot, word/line-class and exact-word-length conditioning. Its line-occupancy null at p≈0.23 has only 0.04 power against the tested rate-heterogeneity plant; the event-bearing-word-identity null at p≈0.26 has unmeasured power. These controls therefore do not explain away T7, but T7 still identifies no cipher or key.

The external Round45 analysis is an independent analysis of the same canonical rune stream, not an independent transcription. Its phase-family code and conditioned-null results are linked below.

## Decision

Keep the 33/86 predecessor-phase association as a **conditional candidate only**. Do not promote it to a cipher selector, infer that leading zero means “repeat”, or extend it into HMM/KDF/table sweeps. The decisive missing input is an independent original-source clue fixing the p0 origin and predecessor-cell convention. If such a clue is found, the fixed-phase p=0.00247 becomes the relevant test; absent it, the max-family p=0.509 is the conservative interpretation.

T7 remains a separate generation-process anomaly worth explaining, but its mechanism must be selected by an original clue and make a locked prediction on withheld ciphertext.

## Reproduction

- `sims/lp2_doublet_gap_nonstationarity_sft.cjs`: exact 85-group within-word conditional convolution and role control.
- `sims/lp2_p50_doublet_phase_family_circular_shift_sft.cjs`: exact all-12,956-shift phase/family null; includes direct checks at five shifts.
- External comparison: [Round45 M0 results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round45/M0-imports/RESULTS.md), [Fable52 phase-family code](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/fable52/t2_p50_mask.py), and [T7 anatomy](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/fable52/t3_t7_anatomy.py).

**No unknown LP2 plaintext, authentic key or destination is recovered.**
