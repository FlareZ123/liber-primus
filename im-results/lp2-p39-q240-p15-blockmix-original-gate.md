# P39's 240 source runes versus the table's 240 quotient: three four-coordinate block operators

**Agent22, 15 November 2026. Evidence class:** exact original-input division and a bounded set of candidate reversible linear-block readings. **No unknown LP2 plaintext, authentic key, or intended cipher operation recovered.**

The original LP2 pp49–51 table has 256 two-character values. Under the existing base-60 reading (byte-stream SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`), its descending-coefficient GF29 polynomial is divisible by the degree-16 product of `(X+5)^2`, the signed 2013 BASE29-3301 quadratic, and the documented degree-three and degree-nine factors. Exact long division leaves **240 coefficient slots**, first coefficient 0, and 16 zero remainder slots. The original p39 page independently contains **exactly 240 runes**. This physical length equality is a possible consumer-selection clue; the source gives no instruction saying that a table quotient should decode p39.

A source-constrained next model is blockwise four-coordinate mixing. The original p15 4×4 number matrix selects two known interpretations: literal unsigned source values and inferred signs restored under the Fibonacci-prime rule. The prior p39-red/table-quotient polynomial evaluated on the signed matrix gives the third, full-rank source-derived operator `R(M)`. For each matrix `T`, freeze original p39 `C` and 240-slot quotient `Q`, preserve printed order and block alignment, and test exactly the six elementary reversible input relations `C±T(Q)`, `Q±T(C)`, `T(C±Q)` (all operations modulo29). No offset, clock, key, row reordering or word-dependent tuning is permitted.

| Matrix | `C−T(Q)` | `C+T(Q)` | `Q−T(C)` | `Q+T(C)` | `T(C−Q)` | `T(C+Q)` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Printed unsigned p15 | 0.03385635 | 0.03336820 | 0.03493724 | 0.03546025 | **0.03615760** | 0.03507671 |
| Reconstructed signed p15 | 0.03294979 | 0.03392608 | 0.03458856 | 0.03465830 | 0.03532078 | 0.03591353 |
| Quotient-derived `R(M)` | 0.03563459 | 0.03403068 | 0.03399582 | 0.03354254 | 0.03451883 | 0.03420502 |

Numbers are GP29 rune index-of-coincidence. Unchanged source p39: **0.03577406**. Independent authentic solved p57: **0.06270997**. All 18 original candidate readings remain near the source's uniform-random band; no candidate approaches the native-GP reference. This rejects these **18 specific original-source blockwise couplings** as ordinary rune-English recovery, without asserting that an unconventional prior transform or a stateful operation is impossible.

**Reproducer:** [`sims/lp2_p39_q240_blockmix_sft.cjs`](../sims/lp2_p39_q240_blockmix_sft.cjs) is read-only, self-contained CommonJS for Node22. It asserts both original page lengths, the complete byte SHA-256, exact 16-polynomial product, zero division remainder, frozen quotient prefix, all 18 candidate computations and the two native-control IoCs. It reads only the existing canonical grid and indexed corpus. The actual result was independently matched against a locally executed Node22 copy fed byte-exact repository fixtures.

**Research decision:** An arbitrary further matrix, phase or post-processing layer has no additional evidence. A productive successor must obtain an independently evidenced author operation or a new key assigning the 240-slot quotient to a target, then test that exact map against untouched ciphertext.