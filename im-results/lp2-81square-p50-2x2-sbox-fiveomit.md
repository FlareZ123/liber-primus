# Original LP2 81×81 → 80×80, original p50 byte-table neighborhood gate

**Classification:** bounded negative original-input cryptanalytic experiment (Agent22, 22 November 2026). No unknown Liber Primus plaintext or authentic key recovered. [Single-file Windows Node22 reproducer](../sims/lp2_81square_p50_2x2_sbox_fiveomit_sft.cjs).

The unchanged LP2 stream of 12,956 runes happens to split at **6,561 = 81²** into **6,395 = 80² − 5** remaining runes. The printed p50 table contains **256** original base60 byte values. A possible human hypothesis is that a local 2×2 operation on a hypothetical 81×81 rune square uses the 256-cell table as a nonlinear lookup, emits an 80×80 output, and discards five positions. None of the original pages displays this 81×81 square or instructs using a 2×2 lookup. The five omitted symbols and local-rule family are explicit speculative freedoms.

**Fixed receiver:** read first 6,561 GP29 indices row-major into 81×81, and later 6,395 indices row-major as the target. For each 2×2 input square `[a,b;c,d]`, compute one index of the actual source p50 table `grid[hash(a,b,c,d) mod 256] mod 29`, preserving full 80×80 output order. Eight frozen hashes use either raw GP index or its authentic GP-prime weight: (1) four-symbol sum, (2) XOR, (3) determinant `ad−bc`, (4) Gaussian `a+2b+2c+d`; two registers per rule. No fitted table, letter substitution, page phase, key, reordering, or hidden state.

An exact dynamic program permits **any five deleted predicted positions** and maximizes exact symbol agreement with the untouched 6,395-rune target, giving the hypothesis the strongest possible deletion placements without searching them one by one.

| Hash | Direct symbol matches / 6,395 | Best matches allowing any five deletions / 6,395 |
| --- | ---: | ---: |
| Sum, index | 239 | 264 |
| Sum, GP prime | 208 | 261 |
| XOR, index | 228 | 267 |
| XOR, GP prime | 226 | 270 |
| Determinant, index | 215 | 281 |
| Determinant, GP prime | 242 | 277 |
| Gaussian, index | 249 | 281 |
| Gaussian, GP prime | 220 | 294 |

**Independently motivated finite-difference expansion.** Removing a final row and column from an 81×81 cell grid produces an 80×80 grid of adjacent 2×2 source neighborhoods. The natural mixed difference \(a-b-c+d\) is a particularly inexpensive causal interpretation. It could give a reversible cumulative-sum inverse if boundary conditions were supplied. For completeness, compare seven frozen field operations: index- and GP-prime versions of mixed difference, horizontal and vertical gradients, and the factorized four-corner product \((a-c)(b-d)\). For each, emit either the direct GF29 residue or the actual p50 table's indexed byte modulo29. Charge **all eight dihedral rotations/reflections** of the output and allow the same arbitrary five omissions. The best agreements with the original untouched last 6,395 runes are:

| Source four-corner operation | Best direct GF29, any D4 | Best table-indexed, any D4 |
| --- | ---: | ---: |
| \(a-b-c+d\) | 296 | 290 |
| GP-prime counterpart | 292 | 296 |
| \(a+b-c-d\) | 297 | 275 |
| \(a+c-b-d\) | 285 | 295 |
| GP-prime horizontal | 295 | 283 |
| GP-prime vertical | 271 | 298 |
| \((a-c)(b-d)\) | 287 | 287 |

The strongest of all **112 rotated/reflected four-corner difference readers** is just **298/6,395**; any exact decoder would require 6,395. The finite-difference interpretation is therefore rejected even with the broadest output orientation and unconstrained five deletions. This tests a concrete reversible-cumulative-sum prospect without inventing boundary conditions or a secret key.

**Decisive readout:** all eight direct source-table hashes fail exact original-target reproduction by at least **6,101 runes** even with an arbitrary five deletions. The same forward formula operating on a source-native p57-repeated 81×81 synthetic input, followed by five fixed deletions, yields **6,395/6,395** exact recovery using the identical DP, so the finite gate can detect a genuine match.

**Decision:** retire only the eight **direct** neighborhood-to-p50-lookup readings and seven two-register difference/gradient rules (all D4 orientations) of the 81²/80²−5 arithmetic. A secret nonlinear pretransform, unknown transposition, alternate output formatting or independently keyed cipher is not covered; those require a new original clue that selects an operation. The large square split remains a numerical observation, not an independently attested intended encoding.
