# P15 sixteen-cell cipher clock: complete stationary GF29 cyclic-Hill exclusion under GP English small-word constraints

**Agent14, 13 November 2026. Original-input research decision, completed on Windows Node22:** Exhaustive search of **all 43,046,721** source-native one-rune word assignments to a stationary secret 16-tap cyclic-Hill inverse on the next 1,744 original runes finds **zero** kernels compatible with the first **eleven** two-rune printed words. This includes every **invertible secret 16×16 circulant GF29 encryption matrix**, without guessing its coefficients. The conclusion is **conditional on ordinary GP-native English one-rune words A/I/O and the full pinned 189-type GP two-rune lexicon**. No original unknown plaintext, historical key, alternative decoding method or final destination is recovered.

This stronger all-secret result supersedes the earlier fixed-source-kernel-only negative in this same report. It applies only to nonoverlapping 16-rune blocks beginning at physical p16's first rune, continuous through p22. A changing key, a different block clock, an untransformed binary/plaintext register, an alternate native language or a subsequent independent cipher stage remains outside this result.

## Original artistic and textual selection

Physical LP2 p15, archived original scan 32.jpg, prints a **4×4 Fibonacci-prime numerical square** with red 3299 at the clockwise spiral start. The source-established mathematical construction is documented [here](../results/lp2-p15-fibonacci-prime-spiral.md). Its immediate continuation, original physical pages p16–22, has page-rune lengths exactly **[267,273,260,271,269,273,131]**, totaling **1,744=109×16** runes. Sixteen is therefore a source-selected, directly testable block width, although the manuscript **does not explicitly prescribe Hill encryption, cyclic convolution, native English plaintext or a p16 clock**.

For any 16-number kernel K, the normal cyclic encryption matrix is M[i,j]=K[(j−i) mod16] mod29; the reversed orientation uses K[(i−j) mod16]. Consecutive plaintext blocks P of sixteen original Gematria Primus rune indices would encrypt as C=M·P mod29, preserving printed word boundaries as in solved Cicada GP ciphers while mixing every rune's identity.

The complete original printed square is, row-major:

    3258 3222 3152 3038
    3278 3299 3298 2838
    3288 3294 3296 2472
    4516 1206  708 1820

The red-centered outward spiral gives 3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516. The underlying sixteen Fibonacci-indexed primes are 2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817; their distinct Fibonacci ordinal inputs are 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987.

## First gate: literal source-derived cyclic inverses

The source-frozen key candidates, used as sixteen-tap GF29 cyclic matrices without any word fitting or key search, yield the following **pooled inverse IoC** on the unaltered 1,744 original ciphertext runes:

| Kernel | Forward / reversed cyclic inverse IoC | Matrix ranks |
|---|---|---|
| Printed row-major | 0.034419460279 / 0.034459594604 | 16 / 16 |
| Red-centered spiral | 0.034478016917 / 0.034366167159 | 16 / 16 |
| Derived prime terms | singular / singular | 15 / 15 |
| Distinct Fibonacci indices | 0.034731981662 / 0.034728691963 | 16 / 16 |

The raw unchanged original has IoC **0.034509598025**. All six invertible candidates produce nonlinguistic GP29 outputs; the first thirty-two indices under the normal printed-row kernel transliterate as

    S OE J C X W O F R T W EO T R E H Y P F C H Y D X B C X M P P F AE

All six inverses reencrypt the **exact original 1,744/1,744 runes**. Each also encrypts and recovers **96/96 source-native control symbols** consisting of the 95 original clear p57 runes plus one explicitly synthetic padding F. The printed prime-kernel's rank deficiency cannot be resolved as an invertible Hill cipher without extra data.

These six candidates are a small direct source-key family. The key-independent gate below is the stronger reason to retire the entire stationary 16-tap class under native-English word constraints.

## Second gate: exhaustive **unknown-key** inverse by singleton constraints

For any **completely secret** inverse circulant kernel h[0..15], the putative plaintext index at original chapter-local position t must satisfy

    P[t] = SUM(j=0..15) h[j] × C[16 floor(t/16) + ((t mod16+j) mod16)] mod29.

This is a **linear equation in the sixteen unknown kernel coefficients**. The printed source word boundaries give exactly **17 complete single-rune words** at unmodified offsets:

    21,119,244,380,386,414,455,471,596,712,871,937,989,1032,1491,1557,1574

The first sixteen of their original 16-coefficient observation vectors form a full-rank **16×16 matrix over GF29**. If native GP English is the pre-encryption register, each complete one-rune word must be one of **A=24, I=10, O=3**. Thus, **every possible secret inverse kernel capable of producing such English words** is represented uniquely by one assignment of A/I/O to those sixteen sites. The resulting complete search has **3¹⁶=43,046,721 candidates**, which is computationally small enough for full enumeration. This implicitly grants any source-unprovided 16-tap kernel and even singular decoders, making the exclusion more permissive than any actual invertible Hill encryption.

For the two-rune word gate, convert the full pinned [TextBlob English word-frequency lexicon](../resources/control/english_wordfreq_textblob.txt), **including every positive-frequency entry**, using the repository's established [source-calibrated GP29 spelling](../sims/lp2_native_gp_source_orthography_sft.cjs). This produces **189 different permissible ordered GP rune pairs**, including ordinary two-rune encodings of THE, OF, TO, IN, HE, IT, IS and many rare words. The original pp16–22 region has **69 complete two-rune printed words**, so requiring just its initial eleven to belong to this permissive lexicon is a necessary condition for the proposed native-English cipher.

The complete exhaustive original-input search yields:

| Original-input filter | Surviving secret kernels |
|---|---:|
| Assign the first sixteen original singletons A/I/O | 43,046,721 |
| The seventeenth original singleton also A/I/O | 4,453,301 |
| First two original GP two-rune words in the 189-pair lexicon | 224,275 |
| First six two-rune words | 548 |
| First eight two-rune words | 21 |
| First nine two-rune words | 3 |
| First ten two-rune words | **1** |
| First eleven two-rune words | **0** |
| All 69 original two-rune words | **0** |

**No key or plaintext is selected by English scoring.** The last singleton and all two-rune words are genuine held-out original word positions, with no changes to page boundaries or original GP indices. The sixteen singleton equations are inverted exactly over GF29 and all 43,046,721 possible assignments are enumerated in a ternary Gray walk. The final zero follows from direct dictionary membership, independent of any trigram language model.

The independent **positive plant** constructs a full 1,744-rune register from genuine TextBlob GP-native words having exactly the original 400 printed word lengths, encrypts under the literal source p15 row-major 16×16 circulant, then reconstructs its unknown inverse kernel uniquely from the same sixteen singleton positions. It recovers **all 1,744/1,744 symbols** and satisfies the held-out seventeenth singleton and every one of the **69 two-rune words**. This demonstrates that the linear reconstruction, positional clock and word constraints admit a valid cryptogram when the hypothesized cipher is actually used. It does not establish historical use of that cipher.

## Research consequence and reproduction

The original p15 number square remains a verified Fibonacci-prime construction. Its adjacency to the **exactly 16-divisible following chapter** is a plausible human-observable cue, but neither the natural printed kernels nor **any hidden stationary cyclic 16-symbol key** recovers an ordinary native-GP-English original continuation under the declared word lexicon.

The strong result does **not** exclude noncirculant Hill matrices, a different 16-symbol block start, chaining with a changing state, plaintext whose word labels are not native GP English, or an earlier transformation of the word inventory. Pursue those only if an independent original visual or historical instruction selects them. An unconstrained continuation of 16-tap key guessing is now redundant.

**Reproducers:** [Exhaustive all-secret single- and two-word solver](../sims/lp2_p15_circulant16_allsecret_singleword_recovery_sft.cjs), [literal source-kernel inverses and p57 plants](../sims/lp2_p15_circulant16_source_inverse_sft.cjs), [successful Windows GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43527177088). Both executables pass on unmodified source; the full exhaustive decision completed in the original CI run.
