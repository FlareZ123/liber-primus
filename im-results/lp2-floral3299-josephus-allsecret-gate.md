# Original 3299 floral-body Josephus decoding: all-secret one-tap gate

**Agent 33, 14 November 2026.** Six fixed, source-motivated circular-elimination orders and all 29 possible GF(29) one-step feedback slopes were tested on the unchanged original LP2 floral body. Every source result remains near uniform, even under an arbitrary secret fixed 29-rune substitution. This is an original-input **bounded negative**, with no recovered unknown plaintext, cryptographic key, cipher identification, or puzzle destination.

## The candidate human solve path

Original physical LP2 page 15 prints a red **3299** within its sixteen-cell Fibonacci-indexed-prime spiral. Physical pages 40 through 55 have matching floral borders and together contain 3316 runes. Their source-visible page-opening red headings occur on p40 (8 runes) and p54 (9 runes); dropping exactly those two headings leaves **3299 original runes**, while retaining p53's red51 terminal stanza. This source-link was already established in [the floral-register report](lp2-p15-red3299-floral-body-register.md).

All red rune positions within the same floral group are the p40 red8, p53 red51 and p54 red9. Their GP prime sums add to **3294**, and therefore **3301−3294=7**. The solved p57 text mentions *shedding circumferences*, which makes circular positional counting a conceivable human operation. The printed p15 sixteen values and their independently reconstructible underlying Fibonacci-indexed primes give two additional potential step sequences. **Neither the manuscript nor a signed historical instruction selects Josephus elimination, its cursor rule, or the proposed combination with a second cipher.** These are conditional hypotheses motivated by the visible numbers.

Earlier [permutation-plus-feedback work](lp2-floral3299-permuted-feedback-allsecret-gate.md) tested modular power and stride orders, not successive elimination of positions from a shrinking 3299-element ring. This test does not repeat those orders.

## Complete frozen inverse

Read the 3299 original body GP indices in ascending physical page/rune order. Initialize a live ring of positions 0 through3298 and cursor0. For each output position, remove the position counted after `k−1` forward advances, updating the cursor to the gap. Backward counting uses `1−k` instead. For three independently specified step registers, test both directions:

* constant `k=7`, from the complete red-prime sum;
* the sixteen actual p15 printed cells, repeated cyclically: `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`;
* their sixteen underlying prime values `|3301−cell|`, repeated cyclically: `2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817`.

Each order is a complete 3299-position permutation. For reordered runes `R`, test the full family `R[i]=a·R[i−1]+h(P[i]) mod29`, where `a` is **any of all 29** field values and `h` is **any secret fixed bijection** on GP29, without enumerating 29! keys. The mandatory decrypted register `D[i]=R[i]−a·R[i−1] mod29` must preserve the plaintext's rune-frequency collision index under every such `h`. No initial rune is scored. The original 3298 transition runes are held fixed and 174 source-conditioned cases are exhaustive within this mechanism.

| Circular elimination | Direction | Best `a` of 29 | Largest original output IoC |
|---|---:|---:|---:|
| Constant 7 | Forward | 22 | **0.034665176** |
| Constant 7 | Backward | 17 | **0.034688720** |
| Printed p15 values | Forward | 23 | **0.034656899** |
| Printed p15 values | Backward | 22 | **0.034584613** |
| Underlying p15 primes | Forward | 12 | **0.034552609** |
| Underlying p15 primes | Backward | 9 | **0.034732864** |

The untouched 3299-rune body has IoC **0.034464934**. The reference uniform GP29 IoC is **1/29 ≈ 0.034482759**. The globally largest of the 174 outputs, **0.034732864**, does not approach the already clear 95-rune p57 GP29 IoC of **0.062709966**, or the native-English original-length values established in the earlier [power/stride inversion report](lp2-floral3299-permuted-feedback-allsecret-gate.md). A fixed alphabet substitution cannot change these frequencies.

## Reversible control and boundary of the result

[Read-only CommonJS SFT](../sims/lp2_floral3299_josephus_allsecret_sft.cjs) reopens the original rune corpus and source-annotated red headings, recomputes the 3299/3294/7 totals, reconstructs all three source numeric schedules, and asserts each exact original IoC maximum and maximizing feedback slope. It also builds an independently clear 3298-rune plant from source-authentic solved p57 characters, encodes it with the **nonlinear hidden permutation** `h(p)=p^5+7 mod29`, feedback coefficient17 and an arbitrary initial rune24, then scatters the generated ciphertext under the complete constant-7 Josephus order. The inverse recovers all **3298/3298** planted source-native GP runes and exactly reencrypts the planted ciphertext. This is an implementation control, not historical evidence.

**Decision:** the examined circular elimination orders followed by *one stationary GF29 linear feedback tap and an arbitrary fixed output substitution* do **not** directly decode the original floral3299 body as ordinary native GP English. No independent first-party instruction presently licenses an extra stream key, changing alphabet, keyed clock, or second cipher. A different register or externally sourced cryptographic key is not ruled out. Further p15/floral counting variants would require a newly observed original clue or a prediction on genuine unknown plaintext.
