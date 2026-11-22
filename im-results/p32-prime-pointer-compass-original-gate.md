# LP2 p32 original-prime cell navigation: two direct readouts and a bounded decision

**Evidence class:** source-constrained exploratory navigation test, 13 November 2026, Agent 5. **No unknown LP2 plaintext, cipher key, continuation URL, or authentic readout is recovered.** A single-file, no-fitted-key CommonJS reproducer is [`sims/p32_prime_pointer_compass_sft.cjs`](../sims/p32_prime_pointer_compass_sft.cjs).

## Why p32 offers a human-recognizable starting point

The authenticated January 2016 Cicada tree JPEG measures **563×569** and says that Liber Primus's words form a map and its numbers give direction. Its artwork directly resembles the tree on physical LP2 page 32. The existing [original-image/ciphertext source gate](tree-prime-canvas-partition.md) establishes that physical p32 has **121 GP29 runes**, naturally arrayed 11×11, and that the GP-prime values in its first row sum **563** while the first column sums **569**. The dimensions are independent signed-image evidence, not fitted to a language score.

One novel, literal question follows: do the page's *own* GP-prime numbers specify a reversible traversal? This is independent of the published seven-word-centre route through the 2014 magic square, and distinct from p32 direct Hill-matrix and two-dimensional finite-difference inversions, which were previously negative. In the tests below no numeral is altered, no direction orientation or start location is tuned, and the original runic input remains intact.

## Source-native one-based prime-address graph

Every p32 rune maps to one of the first **29 primes, 2 through 109**, and thus its prime value is also a valid **one-based address inside the 121-cell square**. Earlier genuine Cicada book codes used one-based rune/word/character ordinals. Freeze the simplest pointer: read the prime value in the current cell and jump to the cell whose one-based address equals that prime. This constructs one deterministic out-edge per cell; the only source side information is the original p32 rune stream and standard GP prime table.

The exact complete graph has **two directed cycles**, reported in ascending one-based cell IDs:

| Cycle | Cell addresses | Length |
|---|---|---:|
| A | 17, 83, 107 | 3 |
| B | 3, 11, 79, 101 | 4 |

All 121 starting cells reach one of these two cycles, and none can visit more than a small portion of the original text before repeating. In particular, the natural source-position starts give:

| Unfitted start | Complete walk up to first repeated address | Unique cells |
|---|---|---:|
| First cell, address 1 | 1, 73, 3, 101, 11, 79 | 6 |
| Grid centre, address 61 | 61, 19, 31, 2, 5, 101, 11, 79, 3 | 9 |
| Bottom-centre / stylized root direction, address 116 | 116, 37, 67, 53, 29, 5, 101, 11, 79, 3 | 10 |

There is also an exact mechanism-independent obstruction to a *complete* 121-cell traverse using this rule: **every jump lands in cells 2–109**. The final twelve cell addresses 110–121 cannot be reached after any jump, irrespective of the starting cell or whether the path is interpreted as an encoded message. A literal single-pointer Hamiltonian traversal is impossible under this scheme.

The 3+4 cycle lengths total seven, which echoes other explored p32 and 2014 seven-element structures. That resemblance was noticed after examining this graph, so it is **not** an independently predicted alignment. For a conditional diagnostic, 100,000 fixed-seed Fisher–Yates shuffles of all 121 original source prime labels preserve their entire value multiset while disrupting the cell positions. Exactly **931/100,000** shuffled graphs have the same unordered cycle-length multiset {3,4}, and **10,896/100,000** have exactly seven total cyclic nodes regardless of their partition. The 0.00931 exact-match frequency is selection-conditioned and must not be presented as the probability that Cicada authored this route. A separately planted source-valid seven-cycle is fully recognized by the identical cycle finder.

## An independent literal prime-to-compass graph

Every GP prime except **2** is odd. Therefore its residue modulo eight is exactly one of **1, 3, 5, 7**, which can be interpreted as four cardinal directions. Freeze the same north/east/south/west convention used in the existing p32 first-clause word-centre exploration, but this time apply it to **every one of the 121 printed cells**: 1→north, 3→east, 5→south, 7→west; advance exactly **one neighboring square**, with **no wrapping**, and let prime 2 terminate the path. Here the source itself specifies a strict grid boundary.

The finite 121-start census is decisive for this literal rule:

| Cause of stopping | Original starts |
|---|---:|
| Leaves 11×11 grid | **36** |
| Revisits a prior cell | **73** |
| Encounters prime-2 cell | **12** |
| **Total** | **121** |

**The longest path from any starting cell visits only seven distinct cells.** The first-cell, central-cell, and bottom-centre starts last **one, two, and one** cells respectively. None gives a long or legible runic message. This directly rules out the unmodified one-neighbor modulo-eight compass interpretation as a traversal of the full p32 text; it does not exclude a separately specified word-distance, wrap rule, tree-branch graph, or independent key.

## Decision

The signed image *does* independently identify p32 and its prime axes. The mathematical 3+4 cycles are genuine properties of the source, but the signed prose does not instruct one-based prime pointers, identify a cycle as a password, or prescribe a message readout. The direct prime-address walk is incomplete; the simplest cellwise compass walk is even shorter. Neither can serve as a complete source-selected decipherment or a key-delivery route without adding an unprovided operation.

**Do not broaden this into arbitrary starts, compass rotations, modulo bases, source-page offsets, or hill-climbed path searches.** A worthwhile successor would require a new primary-source instruction that fixes the missing traversal/readout and predicts withheld original ciphertext or an independently verifiable destination. This branch by itself does not change the established LP2 plaintext status.

**Reproduce:** run `node sims/p32_prime_pointer_compass_sft.cjs` in the repository under Node.js 22. It loads only the canonical `resources/liber-primus/lp2-corpus.json`, asserts p32's 121 runes and 563/569 prime axes, reconstructs both complete navigation graphs, runs the conditional shuffles with seed `0x5163301`, and checks a deliberately planted seven-cycle positive. The 2016 image dimensions and identification are sourced through the existing original-image documentation linked above.
