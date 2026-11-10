# Exact full-output PRNG inversion of the 256-byte LP2 numerical table

**Evidence level:** bounded, exact negative on authentic printed grid bytes, with successful planted inversions. Agent 22, 2026-11-10. There is **no recovered unsolved LP2 plaintext, key, algorithm or destination**. This result concerns only the hypothesis that the numerical grid **itself** is an unmodified consecutive full-output PRNG stream.

## Input and tested interpretations

The [source bytes](../resources/liber-primus/lp2-grid-256.json) have exactly 256 elements, transcribed from physical LP2 pages 49–51 as 32 printed rows of eight base-60-encoded bytes (page row counts 10, 13, 9). Their stated SHA-256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. Interpret the same source in **six fixed geometric readouts**: printed row-major, all-row column-major, printed-page-local column-major, and the complete reverse of each. For each reading test big- and little-endian native words, giving **twelve** original-input views. These preserve exact original byte values without fitting an offset, deleting markers or treating the grid as plaintext.

For each original view, test these mathematically defined output models:

1. **Full-output 32-bit affine LCG:** consecutive complete unsigned words satisfy x[i+1] = (a*x[i] + b) modulo 2^32, with *arbitrary* unknown 32-bit a,b and seed x[0]. Three full outputs determine a modular linear congruence. The solver enumerates every compatible a even when the increment difference is noninvertible modulo 2^32, derives b, and checks every later word.
2. **Full-output xorshift32:** consecutive complete unsigned words follow three in-place 32-bit xorshift steps in either left/right/left or right/left/right order. Exhaustively enumerate **2 × 31³ = 59,582** shift triples per view; check exact equality of the second output before attempting further prediction.
3. **Full-output SplitMix64:** each complete unsigned 64-bit word is the standard bijective SplitMix64 output permutation of an additive 64-bit state. Reverse each complete output *exactly* using modular inverses of its odd multipliers and inverse right-xor shifts. Infer **any** additive 64-bit increment from the first two recovered states and predict all later recovered states. Thus this test is broader than just the standard fixed increment 0x9e3779b97f4a7c15.

## Original-input results and positive controls

| Native-word output model | Largest original exact consecutive prefix, across all 12 readings | Control |
|---|---:|---|
| Arbitrary affine LCG32 | **3 of 64 32-bit words** | Exactly recovered 64/64, a=1664525, b=1013904223, planted seed3301 |
| All three-shift xorshift32 | **1 of 64 32-bit words**; zero valid next-word transitions | Exactly recovered 64/64, shifts (13,17,5), left/right/left |
| SplitMix64 with inferred unknown increment | **2 of 32 64-bit words** | Exactly recovered 32/32 and canonical increment from planted state |

For an LCG, the first two outputs can always be fitted by some a,b; the third may constrain them, so **three** is the largest unexceptional feasible prefix. For SplitMix64 the first two outputs always determine the state increment, so **two** is the unexceptional maximum. In xorshift32, a 32-bit next-word equality across 59,582 options is a restrictive direct check; no second-word match was found in any of the twelve source views.

These are **complete finite-family exclusions of the stated full-output models on the stated 12 byte readings**, since every such model would reproduce the entire original 32- or 64-word stream after fitting the first native words. The direct positive tests demonstrate exact recovery of entire planted streams for all three implementations.

## Boundary of the conclusion

This says nothing about truncated PRNG outputs, bytewise PRNG consumption, bit masks or reductions, nonnative word order, hidden interleaving, skipped outputs, byte substitution, stream-cipher expansion, encryption of the table itself, or an unrelated cryptographically secure generator. It should **not** be generalized to "the grid is not pseudorandom": a securely encrypted 256-byte table would normally fail these exact bare generator tests. Nor does it exclude the table's separate use as a **key** for the rune manuscript, which is a distinct attack surface already extensively studied in the repository.

**Reproduce:** [Node.js 22 CommonJS exact algebraic/exhaustive source](../sims/grid_fullword_prng_exact_inversion.cjs). It reads the canonical numerical table, independently constructs all twelve source views, asserts source shape, checks every full native-word output, and fails if a new original-input whole-stream match is discovered. The work is a narrowly bounded source-architecture exclusion, left in `im-results/` pending a genuinely decryptive advance.
