# P15 Fibonacci-prime 4×4 spiral as a reversible ciphertext–space transducer

**Agent 6, 22 November 2026 | Exact original-input negative; no recovered unknown LP2 plaintext or key.** This tests one concrete, 2014-human-executable interpretation of a genuinely recovered number-grid operation on the manuscript's **rune-plus-printed-space tape**. It also establishes a general key-independent obstruction for any transposition that moves spaces while retaining the identity of all runes. It neither authenticates that interpretation as Cicada's intent nor excludes a cipher that changes rune values.

## Visible operation, source choice and rival

The original physical LP2 p15 image (original 32.jpg) contains the 4×4 Fibonacci-indexed prime-number square with a **red center 3299**. Its exact clockwise center-out reading is independently established in [the p15 prime spiral reproduction](../sims/fibonacci_prime_spiral.cjs). Applied to a row-major 4×4 array, that visibly selected sixteen-cell path is

\`[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]\`

with source values

\`[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]\`.

The printed square supplies a **geometric permutation** without choosing any secret key or ciphertext letters. The source does **not** say to apply it to punctuation, nor specify a reset or serialization rule. The explicit experimental premise is that the grid might teach a human to *move the manuscript's printed spaces with its rune symbols*, changing plaintext word locations while retaining a reversible tape. A rival explanation is that this numerical square has no relation to word boundaries, and the ciphertext's flat rune frequencies require a value-changing encryption layer.

Use two disjoint, source-delineated regions: the full red-heading chapter **p16–22**, immediately after the numeric source grid on p15, and the independent floral region **p40–53**. Physical p50 has no rune prose. Joining these regions' physical page and line wraps preserves the original unmarked carried words; source paragraph/section ornaments are retained in a position-anchored layout sidecar. Actual printed \`-\` and \`.\` are treated as *two different* ordinary movable tape symbols, together with the 29 literal Gematria Primus rune identities. No fictitious spaces, dictionary segmentation or deleted/inserted glyphs are introduced.

Each consecutive complete **16-token source block** is laid row-major in the original visible 4×4 coordinate convention and read center-out clockwise. The exact inverse maps center-out token offsets back to their row-major cells. The last incomplete block is passed literally. Both decoding directions are frozen, with **zero phase, no fitted key and no content-dependent fallback**. The wrong-path control reverses each complete sixteen-token block. The experiment treats the source's actual punctuation as movable; a cipher preserving the original spaces as plaintext spaces is a separate already-heavily-tested architecture.

## Complete original inverses, source punctuation and held-out result

| Physical pages | Operation | Retained GP runes | Original punctuation (\`-\`, \`.\`) | Nonempty output words | Empty word slots | Literal adjacent \`--\` |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| p16–22 | Original | **1,744** | **381, 19** | **400** | **0** | **0** |
| p16–22 | Center-out spiral | 1,744 | 381, 19 | **353** | **47** | **44** |
| p16–22 | Inverse spiral | 1,744 | 381, 19 | **360** | **39** | **38** |
| p16–22 | Reverse each 16-token block control | 1,744 | 381, 19 | **398** | **3** | **3** |
| p40–53 | Original | **3,008** | **626, 43** | **669** | **0** | **0** |
| p40–53 | Center-out spiral | 3,008 | 626, 43 | **600** | **65** | **61** |
| p40–53 | Inverse spiral | 3,008 | 626, 43 | **601** | **62** | **56** |
| p40–53 | Reverse each 16-token block control | 3,008 | 626, 43 | **660** | **8** | **7** |

The output's dozens of consecutive separator symbols would represent empty words under the **literal-space** model; no such marks are present in the original source or needed in the authentic cleartext controls. They are not repaired after scoring. More fundamentally, the entire **2,144-token** opening-chapter tape and **3,677-token** held-out tape roundtrip exactly through either spiral/inverse pair and reconstruct their source rune, separator, stop and ornament serialization. This proves the model is reversible, but cannot establish semantic decryption.

The original GP29 rune multisets are unchanged in every cell of the table. Consequently, every original, spiral and inverse stream has exactly the same original alphabet-concentration and index of coincidence:

| Original source span | Fraction in five most common GP rune values | GP29 IoC |
| --- | ---: | ---: |
| p16–22 | **0.2012614679** | **0.0345095980** |
| p40–53 | **0.1998005319** | **0.0345426275** |

These are near the uniform-GP29 five-symbol and pair-collision scales, whereas actual solved English rendered natively in GP29 is far more concentrated: the solved LP1 long-source control has **320/755 = 0.42384** in its five most common runes and solved LP2 p57 has **46/95 = 0.48421**, documented in [independent solved-source controls](lp2-gp30-divinity-allsecret-space-concentration-original-gate.md). They are empirical native-language comparators rather than universal requirements on every human-written text.

**General all-key consequence.** For every **arbitrary invertible position permutation** of the 29 original rune identities and the literal punctuation symbols, including every possible secret block permutation, arbitrary transposition, bookwide space reflow and the exact p15 spiral, the original 29-bin rune histogram is mathematically invariant. Thus *no* such identity-preserving operation by itself can increase top-five rune concentration or GP29 IoC toward native solved-Cicada English. This statement has no key, phase, reset or word-boundary assumption. It does **not** exclude an intermediate plaintext over a deliberately uniform register, a non-GP representation, a code that changes rune identities, or a multilayer cipher. A pure transposition could still be part of a larger cipher, but it cannot independently solve the visible unknown pages into ordinary source-native GP prose.

## Native solved control, implementation and decision

The source-native positive is the complete **95-rune solved p57 PARABLE**, retaining its **16 hyphens and four stops**. It was genuinely permuted into a different full31-symbol ciphertext tape and restored with the corresponding inverse, recovering **all 95 original plaintext rune symbols and all 20 exact separator/stop events** in both directions. Every original tested region reconstructs its normalized rune/punctuation/section-ornament source tape on exact forward replay. The intentionally wrong-path within-block reversal is also evaluated and does not rescue native GP frequency, because no symbol permutation can.

The [read-only Windows Node22/CommonJS reproduction](../sims/lp2_p15_spiral16_space_reflow_original_sft.cjs) checks the source 4×4 grid, full rune tape against canonical \`lp2-corpus.json\`, original words, counts, all reversible algorithms and both solved-source plants, and asserts the no-go. **Windows runner PASS:** [Actions 45069093971](https://github.com/FlareZ123/liber-primus/actions/runs/45069093971). The original input images are in \`resources/liber-primus/32.jpg\` and the matching physical page files.

**Decision for Director #2278:** The source-motivated literal p15 spiral space-reflow is a complete negative original-cipher experiment on a substantial opening receiver and independent holdout. More broadly, *moving the actual printed space characters via any symbol-preserving transposition* is an insufficient standalone English LP2 inversion, regardless of secret route. Do **not** commission more permutation-order sweeps of the unchanged rune-plus-punctuation tape unless a first-party instruction adds a **value-changing, lossless receiver** or supplies a demonstrably different, source-typed plaintext alphabet. Recovering an actual punctuation transducer with extra information, authenticated cipher opcode, external key or original post-2014 private instruction remains the unsolved decisive step. **No novel plaintext, page decoder or final destination has been recovered.**
