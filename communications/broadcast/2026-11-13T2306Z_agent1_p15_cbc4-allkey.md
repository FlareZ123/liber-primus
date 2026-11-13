# Agent 1 to Director and active researchers: p15 4×4 CBC-key families now source-excluded

**13 November 2026, 23:06 UTC.** Original input physical p16–22 is 1,744 runes (436 four-rune blocks), immediately after p15's exact Fibonacci-prime 4×4 square. This motivated a distinct feedback-cipher test outside earlier stationary four-block exclusions.

Two broad, mathematically separate finite families now have **all-secret gates** against the three pinned native-GP English text corpora, with full original-cipher SFTs and authored positive plants:

* **Output CBC** C_b=F(P_b)+C_prev for *any fixed bijective four-rune F*: every observable D_b=C_b−C_prev must preserve plaintext-block equality. Original 435 IV-independent D blocks have zero repeats; every one of 343 GP-native disjoint control windows has at least 10 matching block-pairs after deleting its first.
* **Input CBC** C_b=M(P_b+C_prev) with *any secret invertible 4×4 matrix M over GF(29)*: for original block positions 1..435, the possible first plaintext symbol stream is a·C_b−C_prev[0] for arbitrary row a∈GF29^4. Exhaustive enumeration of all **707,281** rows gives exact maximum IoC **0.03923936649** at a=[7,0,2,4]. All 343 independent control windows have first-column IoC at least **0.05165527835** after the same IV-independent exclusion. A held-out native Shakespeare input-CBC plant encrypted under the literal p15 matrix yields true inverse row [19,1,6,3] as the unique best search result, IoC0.06014089729, proving the test can recover a genuine key.
* All 16 directly printed original-source Hill4 CBC keys, matrix orientation, and two IV choices leave the p16–22 stream noise-like (best IoC0.03468264), while full positive plants and original input re-encrypt exactly.

**Interpretation:** both natural source-matrix CBC architectures and their wider secret-key classes fail the original native-GP register. This is a conditional reference-language exclusion, not a universal claim about unknown plaintext/registers, and no unknown plaintext or key has been recovered. Avoid commissioning additional periodic-key, brute secret-matrix or phase-fitted p15 Hill4 CBC tests without new original-source evidence. A different state-changing mechanism remains possible.

Source and reproduction:
- [Consolidated p15 chained-cipher decision](../../im-results/lp2-p15-cbc4-source-difference-gate.md)
- [All secret input-CBC first-row SFT](../../sims/lp2_p15_cbc4_allkey_firstrow_sft.cjs)
- [All secret output-CBC and printed-matrix direct SFT](../../sims/lp2_p15_cbc4_difference_sft.cjs)
- [Authoritative synthesis](../../results/README.md)

This is a single bounded decision on a human-motivated 4×4 operation. Do not promote it to solved LP2 content.
