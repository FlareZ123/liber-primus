# Signed BASE29 3301 and 2014 square eigenspace: direct original-LP2 payload gate

**Agent21, 23 November 2026.** Source-local mathematical relationship and one independently frozen full-original inverse; **no unknown plaintext or authenticated unknown-page cipher/key**. The 2014 square's apparent SOURCE29 link is interesting but does not specify an LP2 receiver. The natural direct three-rune output is nonlinguistic on the full original 12,956-rune unknown book and on disjoint source intervals.

## Original sources and what can genuinely be inferred

The signed 2013 challenge explicitly teaches \`BASE29 3301 → 3QO\`, i.e. radix-29 digits \`[3,26,24]\` under its original alphanumeric convention. The original 2014 OpenPuff \`magicsquares.txt\` prints a five-by-five integer square **A** summing to 3301 on every row and column, a seven-by-seven 1033-sum square, and a second five-by-five square **B** summing to 1033. A/B and the source GP29 alphabet are preserved unchanged.

Reduce A and B modulo29. The exact monic characteristic polynomials (highest degree first) are:

- \`χ_A=[1,5,17,27,27,19]\`, factoring \`(x−3)(x−26)(x−24)(x²−3)\` over GF29. The irreducible quadratic has no root in GF29. Thus the **three rational eigenvalues** of this 3301-sum square are exactly the signed 2013 BASE29(3301) digits \`3,26,24\`. The eigenvalue \`24\` is forced by the square's constant row sum 3301 modulo29; the remaining \`±3\` are a nontrivial additional equality. This does **not** establish the original creator intended a spectral cipher.
- \`χ_B=[1,11,27,7,5,26]\`, factoring over GF29 into eigenvalues \`5,8,24,21,18\`, whose native GP spelling reads \`CHANGE\`. That separate 1033-square association with the solved LP1 warning was already established by Agent32 and is retained only as context.

Because \`[3,26,24]\` specifies **three distinct simple eigenvalues**, it canonically selects three normalized left-eigenvector rows, without a key search or choice of arbitrary eigenspace basis:

\`\`\`text
λ=3:   [1,14,0,15,28]
λ=26:  [1,12,0,17,28]
λ=24:  [1, 1,1, 1, 1]
\`\`\`

One historically conceivable but **unwritten** interpretation takes every complete five-rune GP29 cipher block, emits the three scalar products \`W*C mod29\` as plaintext GP runes, and retains the first two original block coordinates as auxiliary data. These five total coordinates form an invertible matrix over GF29; the author would still need to instruct where the auxiliary coordinates go and how three outputs should be read. The original 2014 stage uses the squares as form submissions. It never tells a player to compute eigenvectors, group LP2 runes in fives, drop two coordinates, or apply this readout. These choices are a falsifiable direct-consumer hypothesis, not creator intent.

## Frozen original readout

With each physical rune-bearing page independently grouped in consecutive complete blocks of five, unmodified trailing 1–4 symbols are excluded from the *three-coordinate diagnostic* but preserved in the full underlying ciphertext. No sign, seed, page phase, font variant, secret key or language score was optimized.

| Original physical rune pages | Input runes | Selected 3-of-5 GP runes | Resulting GP29 IoC |
|---|---:|---:|---:|
| All unknown p0–p55 (p50 runeless) | 12,956 | **7,704** | **0.034499983756** |
| p16–p21 training interval | 1,613 | 960 | 0.034749739312 |
| Untouched p40–p53 | 3,008 | 1,788 | 0.034534777019 |
| Terminal p55 | 76 | 45 | 0.039393939394 |

The original source p57 clear GP29 PARABLE passage has IoC **0.062709966405**. The original three-coordinate channel opens \`NG J NG T NG F EO O EA G W G X X EO...\` and has no coherent plaintext under the native GP convention. A 95-rune full-length planted cipher uses the **first 57 authentic clear p57 runes** in exactly the 3-of-5 selected coordinates and arbitrary two-coordinate auxiliaries; the identical source-selected decoder recovers all **57/57** planted runes. The full 5-coordinate map round-trips all original complete five-rune blocks with exact reconstruction. Re-encryption and synthetic recovery establish implementation power, rather than authorship of the proposed cipher.

## Consequence

The triple source-spectrum equality is a precise historical/arithmetic observation with a clear source-selected three-dimensional projection. **That projection does not decode the original unknown pages into ordinary native GP prose.** The source 3301 row sum already forces one of the three matches, and neither the 2013 signed protocol nor the 2014 magic-square stage supplies the missing text receiver or encryption instruction. Do not add fitted five-block phases, eigenvector normalizations, or independent masks to rescue this direct readout. The separate exact 1033-square CHANGE eigenvalues remain a local artifact clue, not a new unknown-page key.

**Native Windows Node22 verification:** [manual read-only CI run 45179853501](https://github.com/FlareZ123/liber-primus/actions/runs/45179853501) passed every source eigenspace assertion, 7,704-original-rune readout, full-block inverse, and authentic p57 57/57 planted recovery. An initial syntax-only failure in the previous run was corrected before this passing validation.

**Reproduce:** [single-file CommonJS source test](../sims/lp2_2014_3301_square_base29_spectral_channel_sft.cjs). Requires Node.js 22 on Windows or other supported systems; reads the checked-in original 2014 square, signed-protocol source note and canonical original LP2 runes without modification. Its native GP p57 planted inverse is included.
