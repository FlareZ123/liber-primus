# GP29 predecessor-exclusion / five-base28-to-three-byte original gate

**Scope:** A lossless, keyless and directly observable 29-rune→28-rank transport suggested by the manuscript's scarcity of adjacent equal runes, combined with the unusually efficient 28⁵≈2²⁴ packing. **Conclusion:** This direct, natural-order five-digit/three-byte interpretation is contradicted by the original ciphertext before any language or key assumptions. It recovers no unknown plaintext.

## Independent clue and exact operation

The 55 original rune-bearing unsolved physical pages contain 12,956 GP29 runes, with only 86 equal-adjacent events across the page-local original stream. Against the approximately 445 equality events expected under unconstrained independent uniform symbols, this is a conspicuous original-cipher anomaly. A contemporary solver could notice the missing repeats and rank each next rune among the **28** alphabet symbols other than the preceding rune. The fifth power of 28 is **17,210,368**, just 2.58% above the 16,777,216 possible three-byte strings. This motivates a reversible `3 bytes → 5 base28 successor ranks → 5 nonidentical runes` candidate with no free key.

Freeze GP29 alphabet order to the source-corpus order. Given the previous emitted rune index `p` and next rune index `c` with `c≠p`, the candidate digit is `d=c` if `c<p`, otherwise `d=c−1`, so `0≤d<28`. Invert by `c=d` for `d<p`, else `c=d+1`. Equal-adjacent runes are impossible under this simple map, so the most forgiving deterministic extension is to treat all **86** repeated outputs as no-data escape events and omit them, then test the remaining 12,869 ranks. This is an exploratory allowance, **not a source-authenticated escape instruction**.

For each five-digit codeword, let `V=((((d0×28+d1)×28+d2)×28+d3)×28+d4)`. A direct three-byte transport requires `V<2²⁴` for *every* full word. The natural reversible alternative interprets digits in the opposite significance order. Two source-plausible 5-digit origins are tested: continuous book stream with all five fixed starting phases (to account for a first-rune IV or segment framing), and page-local restart at each physical page. The original corpus's 55 per-page runic arrays are used without language fitting or postselected byte values.

## Original-input discrimination

| Natural source clock | High-to-low digit order | Low-to-high digit order |
| --- | ---: | ---: |
| Book phase 0, 2,573 words | **62** invalid | **73** invalid |
| Book phase 1, 2,573 words | **54** invalid | **60** invalid |
| Book phase 2, 2,573 words | **65** invalid | **62** invalid |
| Book phase 3, 2,573 words | **70** invalid | **64** invalid |
| Book phase 4, 2,573 words | **71** invalid | **72** invalid |
| Independent printed-page origin, 2,539 words | **79** invalid | **66** invalid |

Any single invalid block is mathematically incompatible with direct 24-bit-to-five-base28 encoding under that exact fixed rank and framing. The observed invalid rates closely track the **2.5168%** of unrestricted five-digit base28 strings that exceed the three-byte range, rather than the 0% expected from an authentic encoder. Byte order does not change this inequality.

A deterministic positive control generates 2,573 three-byte values using a fixed xorshift32 seed 3301, encodes them as five base28 digits, then as predecessor-excluding GP29 symbols starting from a fixed artificial rune. It inserts 86 repeated-rune no-data events into the encoded stream. Decoding and skipping those events recovers **all 12,865 digits exactly**, with **0/2,573** invalid 24-bit blocks. The original failure therefore does not arise from digit-order, skip, or integer-range implementation mistakes.

**Reproduce:** [`sims/lp2_predecessor_28_to_byte_gate_sft.cjs`](../sims/lp2_predecessor_28_to_byte_gate_sft.cjs) using [canonical original-cipher page arrays](../resources/liber-primus/lp2-corpus.json). The independent original-input numeric counts were computed against the exact same source arrays; the new SFT itself is committed, without claiming a remote workflow run.

## Decision and remaining possibility

Retire the direct keyless predecessor-rank `5×base28 → 3-byte` interpretation under the tested original-source word/frame conventions, even if all 86 visible repeats are granted optimistic no-data-escape status. This is distinct from the previously tested **78-phase fixed lookup/ASCII** models: no phase78 state, guessed 28-way secret permutation, or language detector enters this gate.

Unconstrained secret 28-way successor permutations, variable-length coding, compressed streams with non-24-bit source words, lossless arithmetic coding, source-selected nonlinear feedback, and differently assigned escape symbols remain outside scope. Revisit only if an independent Cicada artifact fixes a different successor mapping or packing rule. Numerically elegant capacity matching and repeat suppression are insufficient reasons to search arbitrary keys.