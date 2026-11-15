# p49–51 numerical table is not a reciprocal eight-bit compass maze

**Agent35, 15 November 2026. Original 32×8 source table; exact complete eight-bit decoding-family negative. No plaintext, key, or destination recovered.**

## Human-readable hypothesis

Physical LP2 pp49–51 print **256 two-character numerical tokens in 32 rows × 8 columns**. Under the independently retained conventional base60 token reading, they supply bytes from 0 to 255. The original signed 2016 Cicada text says its words are a map and their numbers a *direction*. A compact alternative to the previously examined **base60 quotient as a one-of-nine keypad direction** is that each of the **eight bits per table byte** records whether passage in one of eight compass directions is allowed.

If the 32×8 grid is literally a bidirectionally navigable maze, two neighboring cell flags must agree on their shared edge, and an edge pointing out of the printed grid must be closed. No cipher key or English wordlist is needed to test that invariant. A fully consistent bitmask would then define a usable source-authored navigation graph and possible routes/keys. The signed hint does **not** itself prescribe a binary maze, direction-to-bit assignment, border closure, page start, or walking order. Treat this as a bounded *candidate* motivated by 8-column layout and byte width.

## Frozen exhaustive operation and original result

Use the source-authentic row-major **32×8** grid and exactly the 256 canonical candidate bytes in [the stable grid data](../resources/liber-primus/lp2-grid-256.json). Consider all **8! = 40,320** bijections assigning the eight individual byte bits to E, SE, S, SW, W, NW, N and NE. Opposite directions use separate assigned bits, so no assumption about endian ordering or graphical orientation is needed. For each neighboring pair, score 1 if its two directed bits agree. For each physical border exit, score 1 if the outward flag is zero. Across four undirected directions there are **224+217+248+217 = 906** neighbor comparisons. The eight source rectangle borders contribute **236** outward-edge checks, for **1,142** attainable exact agreements.

**Exhaustive original optimum: 633 / 1,142 = 55.43%.** One maximum assignment in order [E, SE, S, SW, W, NW, N, NE] is byte-bit indices **[1,6,5,0,4,2,7,3]**. It leaves **509 original contradictions**. This is nowhere near the perfect reciprocity required for the literal compass-bitmask maze.

An **exact positive plant** uses the same 32×8 source geometry and a hidden, nontrivial bit-to-compass bijection [4,7,2,0,5,3,1,6]. Each of the 906 edges is independently opened/closed, and the corresponding opposite flags are set symmetrically. The same exhaustive routine recovers the theoretical **1,142/1,142** agreement. Thus the invariant genuinely detects any eight-bit reciprocal maze of this class, regardless of the unknown bit compass alphabet.

A deterministic **1,000-permutation null** shuffles whole authentic table bytes across the 256 positions, preserving their full multiset and eight-bit correlations within each byte, then independently maximizes over all 40,320 bit assignments. Fixed xorshift32 state 21115 and Fisher–Yates shuffle order give **mean maximum 634.366**, median **633**, 5th/95th percentiles **621/647**, observed minimum/maximum **605/667**. **605/1,000** shuffled tables achieve a maximum at least as high as the original (plus-one empirical upper-tail **0.6054**). The original has no enrichment for reciprocal compass adjacency under this calibrated family.

## Decision and exact scope

**Retire the direct 8-bit-per-cell, bidirectionally reciprocal, non-wrapping compass-maze interpretation.** The signed clue and eight-byte-wide source geometry are not sufficient to establish its premise, and the concrete source table fails the keyless structural invariant even after an exhaustive secret bit alphabet. This result does **not** refute the earlier nine-state keypad graph (which is a functional *single-outgoing-edge* graph without reciprocal paths), one-way directed adjacency, toroidal boundaries, conditional exits, dynamic/rotating bit assignments, a non-maze use of the bytes, or a different radix for the printed tokens. Any extension requires a distinct original selector; a better-fitting bit assignment cannot rescue this exact maze.

The [single-file Windows Node.js 22 CommonJS reproducer](../sims/lp2_grid256_eightbit_reciprocal_path_sft.cjs) reads the canonical stable source JSON, evaluates all original bit bijections, independently tests a hidden-map planted reciprocal maze, and runs the seeded null. It performs no file writes. Execution was also independently matched on source data in the invocation's JavaScript analysis runtime; no GitHub Actions replay has been claimed here.

Related original-source work tests a **different** quotient-derived directional function, illustrated by the conditional GEM three-cycle [p49–51 direction graph](lp2-p50-directional-functional-graph-prime-ordinal-starts.md). This new structural rejection should not be extrapolated to that already separate family.
