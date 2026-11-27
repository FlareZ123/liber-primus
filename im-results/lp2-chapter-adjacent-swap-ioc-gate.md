# #3239 — Source-marked adjacent-swap alphabet change gate

**Agent16 · 27 November 2026. Classification: all-key exclusion for one source-fixed change-point family. No unknown LP2 plaintext/key recovered.**

## Frozen sender

Use the eight original unknown chapters fixed by the visible `$` marks. The sender has one shared GP29 substitution chart. At each `$` chapter boundary the chart may change by exactly one adjacent swap; there are no within-chapter changes and no fitted segmentation. The initial chart and every chosen adjacent pair are completely secret.

This is a period-plausible pencil-and-paper evolving alphabet, is distinct from periodic Quagmire and adaptive-recency tables, and gives the visual chapter marks an explicit cryptographic role.

## All-key invariant

Within any chapter, the sender is a fixed bijection of the 29 rune symbols. Therefore every symbol multiplicity is merely relabeled and the index of coincidence

`IoC = sum_r n_r(n_r-1) / (N(N-1))`

is preserved **exactly**, independent of the initial alphabet, the adjacent swaps, or their history. An arbitrary independent substitution per chapter is a strict superset and has the same invariant, so failure of this test excludes the much smaller one-swap family without key recovery.

Source-visible unknown chapter endpoints are exactly:

`729, 1874, 3612, 5506, 6527, 7960, 9640, 12956`.

## Original result

| chapter | runes | original IoC | lowest matched native IoC (Gibran / Emerson / Shakespeare) |
|---:|---:|---:|---:|
| 0 | 729 | 0.0340825 | 0.0562490 / 0.0552805 / **0.0531098** |
| 1 | 1,145 | 0.0346337 | 0.0573472 / 0.0572266 / **0.0546661** |
| 2 | 1,738 | 0.0344860 | 0.0582807 / 0.0581012 / **0.0554241** |
| 3 | 1,894 | 0.0344949 | 0.0583174 / 0.0583889 / **0.0553615** |
| 4 | 1,021 | 0.0342744 | 0.0576252 / 0.0568339 / **0.0547445** |
| 5 | 1,433 | 0.0341862 | 0.0581553 / 0.0576534 / **0.0552860** |
| 6 | 1,680 | 0.0343600 | 0.0581851 / 0.0579065 / **0.0554787** |
| 7 | 3,316 | 0.0344628 | **0.0585270** / 0.0587447 / 0.0565653 |

The comparison is exhaustive over every contiguous matched-length GP-native window in the three pinned prose controls, not sampled windows: **4,245,452** windows total. **Zero** control windows have IoC at or below their corresponding original chapter. The lowest native value anywhere is 0.0531098, while the highest original chapter is only 0.0346337.

This is an enormous structural separation. It does not depend on printed word boundaries, English scoring, a guessed key, or the order of rune labels.

## Positive control

The reproducer takes native-GP pieces at the eight exact chapter lengths, applies an arbitrary full initial permutation, then applies one deterministic adjacent chart swap at each chapter boundary. Every planted ciphertext chapter preserves its plaintext IoC to floating-point equality. Thus the invariant detects the intended family even while the key and swap history remain hidden.

## Decision

**Reject the source-marked adjacent-swap alphabet-change family for ordinary native-GP prose.**

The original chapters are far too flat for any fixed substitution inside the visible `$` frames. Since even arbitrary per-chapter permutations cannot change this invariant, recovering a one-swap transition path cannot produce native plaintext.

This does not exclude an alphabet that changes *inside* chapters under a genuinely source-selected finer clock, a polygraphic transform, expansion/contraction, or non-native plaintext. But #3239 explicitly forbids free change-point fitting. No additional visible marker was found that independently authorizes enough within-chapter changes to evade this invariant, so the correct fork is to stop rather than introduce them.

## Reproduction

`sims/lp2_chapter_adjacent_swap_ioc_gate.cjs`

Pinned inputs:
- `resources/liber-primus/lp2-corpus.json`
- `resources/liber-primus/lp2-transcription.txt`
- `resources/control/gibran_prophet_58585.txt`
- `resources/control/emerson_essays_2944.txt`
- `resources/control/shakespeare_first300k.txt`
