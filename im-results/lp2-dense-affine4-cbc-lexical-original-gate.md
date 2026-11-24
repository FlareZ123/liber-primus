# Unknown dense affine-four CBC — exact joint row-key recovery

**Decision:** no invertible shared 4×4 affine CBC key can satisfy the stated generous singleton/two-rune vocabulary constraints on original pp16–39 in any continuous framing. This excludes every initial chaining value. Two independent dense keyed controls recover the unique matrix and offsets, and all runes beyond the first block. No unknown LP2 plaintext.

## Frozen inverse

For complete consecutive 4-rune blocks:
[
p_i=M c_i+b-c_{i-1}\pmod{29}.
]
(M\in GL(4,29)), (b\in GF(29)^4), and the initial predecessor (c_{-1}) is entirely unknown. This is the additive GP29 counterpart of CBC, using the 4×4 p15 grid as a weak block-size motivation. The original does not explicitly instruct CBC. The earlier literal p15 matrix/CBC tests and the [dense direct affine inverse](lp2-dense-affine4-projective-original-gate.md) do not exclude arbitrary secret chained matrices. Here the matrix is inferred rather than chosen from grid numerals. Preserve all actual word carries; do not fit IV, per-page keys, or transparent F. Continuous physical pp16–55, train through p39, seal tail from p40. Assign complete blocks spanning the split to the tail and exclude incomplete end fringes. Omit the first complete block from key constraints because it is IV-dependent.

## Exact recovery from original short words

Use a broad 10-symbol singleton register A/I/O/S/T/D/M/N/L/R to allow native contractions and more than the actual solved native singleton inventory (A/I/T). All 2,896 original words and 12,956 GP29 runes are matched exactly against the corpus, including carried boundaries. A 29,226-type GP word lexicon contains 189 possible two-rune words; union the independent frequency list, native solved GP words, and first-half Gibran GP conversion. Allow one unrecognized two-rune word **per lane pair**.

Each row of (M|b) has five free coefficients. Every output singleton fixes one linear equation to any of the ten allowed plaintext values after adding its known preceding ciphertext lane. Select five independent singleton equations in each lane, invert their basis, enumerate all (10^5) assignments, and check remaining singleton equations. This enumerates every permitted row, with no heuristic score pruning. For consecutive two-rune words, compute the exact pair compatibility relation between adjacent row candidate lists (including lane3→lane0 across blocks). An invertible full matrix must form a four-cycle in the compatibility graph. Enumerate all cycles and require full matrix rank. If any survive, rank by training lexical coverage, freeze the key, apply to the untouched tail. Use an arbitrary zero IV for replay, which changes only the first block.

## Actual results

[Complete output](lp2-dense-affine4-cbc-lexical-output.json) · [CJS reproducer](../sims/lp2_dense_affine4_cbc_lexical_inverse_sft.cjs). Executed identical pure computation directly in V8 on pinned repository source texts.

| Initial phase | All singleton-compatible row counts (lane order) | Two-rune words across lane-pairs | Compatible row pairs by lane-pair |
|---:|---|---|---|
| 0 | 21, 21, 1388, 4215 | 53, 59, 52, 51 | 0, 0, 0, 0 |
| 1 | 30, 1439, 4099, 13 | 59, 52, 51, 53 | 0, 0, 0, 0 |
| 2 | 1365, 4138, 19, 21 | 52, 51, 53, 59 | 0, 0, 0, 0 |
| 3 | 3987, 17, 10, 1353 | 51, 53, 59, 52 | 0, 0, 0, 0 |

All 16 lane-pair relations are empty. The training test thus rejects the model even before requiring that the four rows jointly form an invertible matrix. No original key is eligible for freezing or original-tail scoring. In particular, do not report a withheld original decryption.

Two separate dense matrix/offset/IV plants use disjoint Gibran prose training windows and the exact solved-native GP tail. Both have exactly one compatible matrix, equal to the planted matrix and bias. Each recovers all **8,852/8,852** runes after the IV-dependent first block. Both recover all **2,980/2,980** sealed runes (including split-block fringe), with all complete solved-native tail words covered by the dictionary. Forward replay is exact. The IV itself was not recovered and is unnecessary after the first block. The positive controls establish that the short-word search has practical key-identification power under this hypothesis, not that the original used it.

## Scope and consequence

This is an exact conditional exclusion of the shared additive affine-four CBC family under the stated intact-word/lexicon assumptions. It is stronger than testing arbitrary source-matrix orientations or fixed IVs. It does not exclude other alphabet registers, non-additive chaining, different block widths or changing keys. The observed zero pair relations are a decisive result within the predeclared constraints; additional searches over the same matrix family and phase cannot fix them. Do not assume that the original plaintext must conform to this exact dictionary in other mechanisms. Seek a genuinely independent first-party receiver before extending chaining assumptions.
