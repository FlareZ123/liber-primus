# Signed p15's order812: all-secret periodic plaintext-consumer exclusion on original LP2

**Agent 1, 15 November 2026. Independent original-source cryptanalytic gate.** The sign-restored p15 Fibonacci-prime GF29 matrix has exact multiplicative order **812**. This supplies a concrete, independently calculated candidate **period of 812 original GP29 rune positions** for any matrix-generated keystream. On the original untouched unknown manuscript, an exact all-secret necessary condition excludes a *fixed 812-period GP29 alphabet schedule* acting either directly on plaintext symbols or on a predecessor-ciphertext differential register, assuming the intact original position clock and native-GP prose. No unknown LP2 plaintext or author's key has been recovered.

## Motivation and explicit model bounds

The manuscript's physical p15 4×4 grid is assembled from Fibonacci/primes relative to 3301. Recovering **two suppressed signs** by undoing the printed absolute values gives the signed matrix whose order is **812** over GF29. Its p39 red-polynomial double-eigenroot relation was independently documented with 120 two-negative sign controls and an exact 812-step matrix orbit in [the original p15/p39 crosslink](lp2-p15-p39-signed-matrix-eigen-crosslink.md). Separately the dual-number unit group suggested by p39 has size812, which prompted an [exact 841-state full-ring completion](lp2-dual812-fullring-nonunit-completion.md). Neither tells the solver to cipher by an 812-step periodic key, and the author printed **positive** matrix magnitudes. This is one finite, important test of whether an 812-period source-derived consumer is compatible with real ciphertext.

Rather than selecting one guessed matrix projection or fitting a key, **grant every possible secret permutation of the entire 29-rune alphabet independently for every one of the 812 positions, for each of the nine visible chapters**.

Two source-plausible invertible encryption architectures are distinguished:

1. **Absolute GP register.** `C_i = π_(chapter,i mod812)(P_i)` for arbitrary 29-way bijections `π`. At source positions separated by exactly812 within a chapter, the *same arbitrary secret permutation* applies, so `C_i=C_(i+812)` **if and only if** `P_i=P_(i+812)`. The true keystream and its distribution cannot change the exact count.
2. **Predecessor-chain GP register.** `C_i = C_(i−1)+π_(chapter,i mod812)(P_i) mod29`, initializing each visible chapter from any arbitrary original-state seed. Let `D_i=(C_i−C_(i−1)) mod29`. At positions `i≥1` and `i+812`, `D_i=D_(i+812)` **if and only if** the corresponding two plaintext GP rune identities agree. This remains true for any secret 812-phase permutations, as long as the phase clock follows original positions.

The model includes **all periods dividing 812** as special cases. It excludes no clock schedule that pauses or skips on a source-defined F, rekeys inside words, changes the plaintext spelling alphabet, performs nonlocal compression, or uses ciphertext-driven phase transitions. Nor is the actual LP2 cipher asserted to be a matrix-orbit cipher.

## Exact original-input and native-GP necessary condition

The nine original visual-chapter rune lengths, read from unchanged physical p0–55 source, are:

`[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]`

Seven chapters are longer than812. The first and ninth cannot contribute a lag812 internal comparison and are retained unchanged as source context. For the other chapters there are **6,235 exact raw-rune comparisons** and **6,228 predecessor-chain step comparisons** (the first within-chapter step requires a preceding rune).

| Original measurement | Equalities | Eligible comparisons | Rate |
| --- | ---: | ---: | ---: |
| Source GP rune at positions i and i+812 | **206** | **6,235** | **3.30%** |
| Source GP predecessor step at positions i and i+812 | **215** | **6,228** | **3.45%** |

The raw source matching counts per chapter are `[0,8,22,37,7,21,30,81,0]`. The chain-step counts are `[0,9,37,29,5,26,33,76,0]`. Both are near chance for a 29-rune ciphertext and far below the coincidence rate from matched genuine native GP English.

Use the source-pinned complete English *Prophet* control in `resources/control/gibran_prophet_58585.txt`, transliterated with the same GP29 orthography used by existing native controls (greedy runes with special `ING→NG`, `IO→IA`, `QU→CW`, `V→U`, `K/Q→C`, `Z→S`). This yields **62,492 GP runes**. Enumerate **all 49,537 overlapping contiguous windows** of exactly the original unknown book's 12,956-rune length. Partition each hypothetical cleartext window into the *nine exact original chapter lengths*; count the same raw i↔i+812 GP rune equalities, and for the chain model exclude the first comparison in each chapter.

| Native-GP reference across all 49,537 windows | Minimum 812 equality count | Maximum |
| --- | ---: | ---: |
| GP plaintext, nine visible chapter clocks | **316/6,235** | 433/6,235 |
| GP plaintext, chain register with predecessor seed excluded | **316/6,228** | 433/6,228 |
| **Real unknown ciphertext to be explained** | **206/6,235** | **215/6,228** |

The authentic original register has **110 fewer direct matches** than the lowest of these full-length reference windows; the predecessor-chain register has **101 fewer**. The enumeration does not imply any independent statistical sampling of those overlapping windows. It is a conservative exact source-calibrated necessary-condition comparator, not a universal hypothesis test over all possible languages.

## Genuine secret-cipher positive with complete recovery

The [original-data CommonJS SFT](../sims/lp2_p15_order812_allsecret_native_original_sft.cjs) creates **nine independent sets of 812 secret 29-way alphabet permutations**, generated with a fixed seed for replay but otherwise arbitrary. It takes **12,956 consecutive native-GP runes** from the exact same Gibran control, encrypts and decrypts them under both the **absolute-permutation** and **ciphertext-feedback predecessor-step** modes, and asserts **12,956/12,956** exact recovery for both. On these positive controls, the appropriate source-independent lag812 equality counts are preserved *exactly*, demonstrating that the experiment detects plaintext under the investigated mechanism rather than simply punishing ciphertext statistics.

The implementation also asserts all original chapter sizes, all 206 raw and 215 chain source matches, all comparison totals and Gibran GP rune counts, and computes all 49,537 native windows using an O(N) lag-match prefix sum rather than a huge random search. [Successful Windows Node22 original-source run 43772668911](https://github.com/FlareZ123/liber-primus/actions/runs/43772668911). A first trial surfaced a false planted-chain assertion that compared cipher-step equality against **plaintext differential equality** instead of **plaintext rune equality**; that local harness comparator was corrected before the passing run. The original counts did not change.

## Decision

For native-GP English in unchanged original symbol order, **no 812-period secret lookup, 812-period additive keystream, or any period dividing812 can explain the seven source-long chapters under either of the two explicit models**, regardless of the actual secret letters, page phase or independent chapter keys. The manuscript's source arithmetic is a valid candidate mathematical bridge, but a periodic cipher that literally consumes it in these ways cannot be the missing decryptor. Another source-selected state update, F skip/marker rule or nonperiodic key generator is required to recover plaintext. Do not fit a different secret 812-symbol table or a free phase as an attempted rescue of this exact family; the equality invariant already quantifies all of them.
