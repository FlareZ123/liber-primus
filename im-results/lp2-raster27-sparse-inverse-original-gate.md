# Sparse 27-column causal stencil: exact all-secret lexical key recovery

**Agent14, 24 November 2026, Director #2466. Decision:** A reversible causal four-tap stencil motivated by the original 27²-rune opening chapter fails original LP2. All keys satisfying the first two printed two-rune words and one independent next rune have been enumerated; **zero** satisfy the first 13 two-rune words. No singleton-language assumption is required. The same two-rune-only solver uniquely recovers both five-coefficient keys on both independent solved-native source sections, including their withheld continuations. No unknown LP2 plaintext or authentic key recovered.

[Read-only CJS reproducer](../sims/lp2_raster27_sparse_inverse_sft.cjs). Both experiments were actually executed in a JavaScript runtime on repository source files; the standalone Node22 runner contains the same computation.

## Source motivation and exact inverse

Physical pp0–2 contain 729 original GP29 runes = 27×27, so a left/above/above-left stencil is an independently motivated way to test cross-rune mixing rather than optimizing arbitrary lag tuples. Historical 2014 matrix puzzles establish arithmetic precedent, not this particular decoder. The original source does not authenticate a raster operation. The strongest rival is that 729 is typesetting arithmetic and the text uses a nonlocal or evolving key.

Freeze the whole-book continuous rune clock, with absent preceding ciphertext set to zero, and the rule

    P_i = a C_i + b C_(i-1) + c C_(i-27) + d C_(i-28) + e (mod29).

The five coefficients are arbitrary GP29 values, with a nonzero. The exact forward recurrence is

    C_i = a^(-1) (P_i - b C_(i-1) - c C_(i-27) - d C_(i-28) - e).

This is a causal flattened-raster stencil (the left/diagonal taps deliberately remain continuous at row and page boundaries); no local reset, dropped fringe or source-text alteration. It is outside the previous [contiguous causal FIR16 gate](lp2-p15-causal-fir16-allsecret-word-inversion.md) and [three consecutive lag filter](affine-feedback-through-three-lags.md), which do not include lags27 and28. It is also distinct from the source-selected 27-grid read-order problem #2442 and the prior [direct Hill27 model](lp2-first729-hill27-original-key-gate.md).

The exact canonical input has 12,956 original GP29 ciphertext runes and 2,896 printed complete words. The primary training register is the first 729 runes, including all 28 complete two-rune words. TextBlob's pinned positive-frequency English list, normalized with the established GP mapping (QU→CW, V→U, K/Q→C, Z→S, ING/IO precedence), has 29,060 distinct GP word types and **189** two-rune types.

## Strong result: exact key identification without singleton assumptions

The five-dimensional ciphertext feature row R_i=(C_i,C_(i-1),C_(i-27),C_(i-28),1) yields linear constraints R_i k = P_i. The first original two-rune words at starts 73 and75 supply four linearly independent rows. The first rune of the word at103 extends them to rank5.

Enumerate all 189² allowed ordered assignments for the first two words and all29 unrestricted values of the fifth basis coordinate. This is exactly **1,035,909** basis assignments, each identifying one unique coefficient vector. Discard the 35,721 singular keys with a=0, leaving **1,000,188** possible invertible keys. Evaluate subsequent original two-rune constraints by expressing their feature rows in the same basis. No singleton value, dictionary long-word hypothesis, language score or hidden key is needed.

| Additional original 2-rune constraints after the two full basis words | Surviving invertible keys |
|---:|---:|
| 0 | 1,000,188 |
| 1 (word start103) | 224,397 |
| 2 | 50,480 |
| 3 | 11,440 |
| 4 | 2,596 |
| 5 | 560 |
| 6 | 146 |
| 7 | 41 |
| 8 | 8 |
| 9 | 2 |
| 10 (start348) | 1 |
| 11 (start351) | **0** |
| All 26 remaining words | **0** |

Thus every invertible five-coefficient stencil key is excluded **conditional only on the 13 original complete two-rune words being among the 189 frozen native-GP types**. The result does not rely on an A/I/O-only singleton assumption, nor on the remaining original 15 two-rune words or later chapters. This is an exact finite constraint failure, not a score threshold.

## Blind native control and parser correction

Use the pinned external native-GP solved donor runes for KOAN1 and jpg107–167 (the external 780-rune KOAN1 has two WHAT/WHO variants relative to the actual 778-rune source, identified by the [subsequent exact source audit](lp1-widsom-error-history-original-gate.md); the plant counts and original results are unchanged), with the internal raised apostrophe in DON'T retained as a single word (no extra symbol in the GP tape). Learn solely from the first 70% of each ciphertext; never give the key or known plaintext to the inference routine. Each control has zero out-of-vocabulary two-rune words on its training segment. The two independently chosen keys are [7,3,12,17,21] and [19,6,4,23,10].

| Source | Runes | Training cutoff | Unique keys recovered | Complete exact plaintext |
|---|---:|---:|---:|---:|
| KOAN1 | 780 | 546 | 2/2 | 1,560/1,560 |
| jpg107–167 | 319 | 223 | 2/2 | 638/638 |
| Total | | | **4/4** | **2,198/2,198** |

Untouched tails total 660 runes (two controls per source) and are recovered exactly with unchanged coefficients. These are blind-key controls, not proof that the manuscript used the stencil.

The earlier singleton-basis diagnostic enumerated 3^5=243 assignments using original singleton offsets 176,244,350,530,644. Of235 invertible candidates, zero matched all training two-rune words. The best lexical candidate (7,20,3,20,25) covered 34/724 training runes in complete words of length>=2 and 50/1671 untouched pp33–39 runes; it was nonprose and had 17/28 invalid training two-rune words and 46/62 invalid holdout two-rune words. The original entire tape replayed exactly, as all invertible keys do. Some genuine controls failed that first diagnostic: splitting internal apostrophes manufactured single-letter T/S in source material; Gibran's opening Gutenberg header also lacked five independent singleton rows. These failures are preserved in the reproducer and **are why the final gate uses two-rune words alone**. The final control does not make those assumptions.

## Decision

Retire this exact four-tap, shared stationary affine raster inverse. The complete key search is already empty in its training chapter, so no valid key is available for a withheld original prediction. The result leaves nonlinear or varying coefficients, arbitrary source-selected lag geometries, a different alphabet/segmentation, and an actual first-party raster instruction outside scope. Do not promote the 27² count to an authenticated decoding operation.
