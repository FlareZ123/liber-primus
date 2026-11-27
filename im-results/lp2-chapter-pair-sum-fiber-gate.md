# Chapter-paired GP29 sum-fiber inverse — decision (#3147)

**Decision:** Retire the fixed chapter-start, shared sum-preserving pair bijection on ordinary source-native prose. No map search is warranted. Every original chapter has more distinct ordered rune pairs and fewer pair collisions than **every eligible same-length spacing-free window** of three independent literary donors. This necessary obstruction applies even to an arbitrary chapter-private static pair bijection, which is strictly more permissive than the proposed shared sum-fiber map. No unknown plaintext recovered.

## Receiver and invariant

Use the existing nine visually framed sections (physical pages 0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55), in native order with page carry continuous. Freeze pairing at the first rune of each section, including headings. The six odd-section terminal singletons are left unconstrained, favoring the hypothesis. This is the ordinary framing default from #3147, not an authenticated author instruction. The arithmetic alphabet is the pinned GP29 index order, not prime-valued arithmetic.

For each ordered pair (a,b), let s=(a+b) mod29. Any sum-preserving bijection has the form

    E(a,b)=(pi_s(a), s-pi_s(a) mod29)
    D(c,d)=(pi_s^-1(c), s-pi_s^-1(c) mod29), s=(c+d) mod29.

There are 29 independent permutations of 29 symbols; the sum tape is exactly visible, regardless of the map. For a fixed bijection, pair counts are merely permuted. Both the number of occupied ordered pairs and the sum of n_v(n_v-1) over pairs v are exact invariants. These two additional invariants do not require sum preservation. For a shared map they hold across chapters, and even if the map changes between chapters they hold separately within each chapter.

## Original-cipher result and native calibration

The original 12,956-rune tape yields 6,475 complete pairs. It occupies 835 of 841 pair types, with 51,366 ordered equal-pair collisions (IoC 0.0012253588). Its visible sums have 1,443,286 ordered collisions (IoC 0.0344302306). Exact per-chapter obstructions follow.

| Physical pages | Pairs | Original distinct | Largest donor distinct | Original pair collisions | Smallest donor pair collisions |
|---|---:|---:|---:|---:|---:|
| 0–2 | 364 | 303 | 210 | 134 | 548 |
| 3–7 | 572 | 414 | 258 | 386 | 1432 |
| 8–14 | 864 | 532 | 302 | 858 | 3520 |
| 15–22 | 951 | 573 | 313 | 1020 | 4286 |
| 23–26 | 510 | 373 | 248 | 328 | 1114 |
| 27–32 | 716 | 482 | 283 | 624 | 2406 |
| 33–39 | 840 | 518 | 300 | 922 | 3332 |
| 40–53 | 1504 | 700 | 362 | 2658 | 11180 |
| 54–55 | 154 | 138 | 125 | 38 | 66 |

The independent donor streams are pinned Gibran (62,492 GP runes), Emerson (321,327), Shakespeare (217,106). Apply the existing source-calibrated greedy GP orthography (ING, IO and established normalization); no rune deletion or rearrangement. Scan **all** 5,369,484 eligible chapter-sized windows at every rune start, including both parities; each donor window is paired from its first rune. This is a superset of intact word-start-aligned reuse, with no assumption that printed groups are plaintext words. Also scan all 1,220 eligible chapter-sized windows from the nine published solved-native rune records, without Latin transliteration: every one fails the exact ordered sum test and both occupancy/collision invariants. The records are too short for the seven longer original chapters; this limitation is explicit.

The exact ordered original sum tape matches **zero** eligible literary or solved-native windows. The longest matching initial prefix in literary donors is only four pairs. Thus literal contiguous reuse fails even if the sum-preserving permutation is independently changed for each pair. The pooled sum collision count also lies below the minimum across all 562,060 complete-book donor windows in original chapter geometry. The pooled pair occupancy/collisions have a still wider gap:

| Donor | Full-book windows | Minimum sum collisions | Minimum pair collisions | Maximum distinct pairs |
|---|---:|---:|---:|---:|
| Gibran | 49,537 | 1,582,122 | 245,276 | 463 |
| Emerson | 308,372 | 1,571,856 | 236,494 | 493 |
| Shakespeare | 204,151 | 1,538,096 | 215,308 | 489 |
| Original | 1 | 1,443,286 | 51,366 | 835 |

These are exact finite comparisons, not population p-values. In six of nine chapters (p8–14 through p40–53 inclusive), the sum collision count alone falls below every same-length literary window; the other three do not have that particular marginal obstruction.

## Positive plants and limitation

Independently shuffle all 29 fiber permutations (two frozen xorshift32 seeds). Forward and inverse are verified on all 841 pair types; held ciphertext exactly preserves sum order, occupancy and collision counts. Fit the inverse from 10,000 known native-GP donor anchor pairs (no held values used), completing a fiber only if its remaining entry is uniquely forced. Gibran: 486 distinct anchors, 1,981/2,000 held pairs recover exactly, 19 unobserved pair events remain unknown. Emerson: 502 distinct anchors, 1,977/2,000 exact, 23 unknown. No incorrect recovered pairs; no fiber completion was forced. True full-key inverse replays all held pairs; the learned partial map does **not** claim full recovery. For a fiber with m observed distinct pairs, (29-m)! completions remain in the absence of an independent source constraint. Synthetic success is calibration only.

## Scope and next decision

The source does not specify a concrete permutation, and the necessary gate fails so strongly that fitting one to original ciphertext would be unproductive. Retire this exact chapter-start static pair-bijection family in the tested native register, and avoid arbitrary per-fiber maps as a plaintext attack. This does not exclude novel prose, unusual registers, time-varying non-sum-preserving ciphers, different source-selected pairing origins, or other nonlinear blocks. No companion layer was fitted. A new pairing origin or variable state requires independent source support; do not optimize it on these failures.

Reproduction: [SFT](../sims/lp2_chapter_pair_sum_fiber_gate_sft.cjs), [complete raw output with pinned input blob SHAs](lp2-chapter-pair-sum-fiber-gate-output.json). The rolling histogram was compared against a naive recomputation on a solved-native prefix; all eligible starts are asserted. The same JavaScript experiment function was executed in the live V8 tool and stored as a CommonJS runner. The committed runner has not separately been executed under Node or CI.
