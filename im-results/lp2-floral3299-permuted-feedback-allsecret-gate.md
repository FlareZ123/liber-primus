# Source-selected floral3299 permutation followed by one-tap secret GP29 feedback

**Agent33, 14 November 2026. Original-cipher finite negative.** No recovered plaintext, authorial encryption key, new destination or actual decipherment operation.

## A candidate that could have decoded the manuscript

Physical p15 visibly prints the red **3299** within its sixteen-value Fibonacci-prime spiral. The p40–55 floral section has 3,316 original ciphertext runes. Removing only the 8-rune p40 and 9-rune p54 red chapter headings leaves exactly **3,299** runes. Separately, the source-printed p40 red8, p53 red51 and p54 red9 have a total GP-prime weight of **3,294**. Thus **3301−3294=7**; seven is a primitive root modulo the printed prime3299. These source arithmetic/length observations were established earlier and are reused without claiming another independent discovery.

This gives a human-computable original positional route: read the 3299 floral body at index0, then at addresses 7^0, 7^1, ... modulo3299. The inverse of that complete permutation and the two simple address strides i→7i and i→1414i modulo3299 are the three comparably motivated alternatives. Earlier work screened raw rune readout and simple additive keys after these permutations. This study asks whether their **one-step differences**, possibly transformed by a stationary secret GP29 alphabet, reveal actual English.

## Exact all-secret experiment

For each of four fully specified source-led positional orders, let R be the reordered original floral ciphertext. Consider the general family R_i = a R_(i−1) + h(P_i) modulo29, where **a can be any of 29 field elements and h can be any of 29! secret bijections** of the entire GP alphabet. This includes nonlinear h, independent fixed substitution a=0, cumulative substitution a=1, and every stationary one-tap affine-feedback slope. A chosen initial ciphertext rune may be arbitrary.

The original inverse computes D_i = R_i − a R_(i−1) modulo29. For every possible h the D sequence has exactly the same *collision spectrum* as the native plaintext P, and in particular the same index of coincidence (IoC). The invariant eliminates any need to guess h, decode plausible words or search 29! keys. The fixed four maps and all 29 slopes yield **116 original-cipher attempts** using the same **3,298** observed transition symbols.

| Original reordering before feedback | Best a among all 29 | Max original IoC |
|---|---:|---:|
| Primitive-root-7 power order | 6 | 0.034693502 |
| Inverse power order | 17 | 0.034610180 |
| 7-stride order | 6 | **0.034765604** |
| Inverse 7-stride order | 4 | 0.034688536 |

The best result across all 116 is **0.034765604**, essentially the uniform 29-symbol reference 1/29 = 0.034482759. To calibrate the proposed recovered language under historically available spelling, three pinned pre-2014 source works are converted using the canonical solved-LP1 GP29 orthography, including **ING/IO** contractions. All **4,612** eligible 3,299-rune windows are sampled at stride127, and IoC is calculated on exactly 3,298 native runes, matching the original feedback output:

| Native reference | Windows | Minimum genuine native-GP IoC |
|---|---:|---:|
| Gibran, The Prophet | 462 | 0.056635459 |
| Shakespeare | 1,671 | **0.054766512** |
| Emerson | 2,479 | 0.056877331 |

None of the **116** original outputs reaches even the minimum measured native-GP English concentration. Because relabeling cannot change IoC, this rejection holds for *every secret stationary symbol permutation* in the stated model.

## Controls, reproducibility and consequence

The original source totals, the 68 explicitly printed floral red symbols, the order of seven modulo3299, all four unique position permutations, and independently solved p57's **95/95** source-native GP characters are asserted. A positive plant encodes a genuine 3,299-rune native Gibran passage through a **nonlinear** hidden permutation h(p)=(p^5+7) mod29, a **nonunit feedback slope a=17**, and the complete seven-power position scatter. The matching inverse recovers **3,298/3,298** non-initial plaintext GP runes exactly, checking the test's capacity to accept real source-native text and secret nonlinear keying. The initial symbol can be separately inverted from the encoder seed.

**Decision.** This finite, source-constrained composite mechanism cannot decode the original floral3299 body into ordinary native English under any secret stationary GP29 alphabet and any one-tap GF29 feedback coefficient. It does **not** exclude another source language/register, changing alphabet, positional key derived from unavailable material, or a different keyed transition rule. The numerical 3299/7 correspondence alone does not authorize any further phase tuning. Preserve the finding as a conditional negative; no new unknown-page plaintext or key has been recovered.

**Reproduce:** [CommonJS original-corpus SFT](../sims/lp2_floral3299_permuted_feedback_allsecret_sft.cjs) uses the already committed corpus, red-ink annotations, authentic p57 plain-GP reference and three pinned English controls. [Successful manual Windows Node22 run 43546259289](https://github.com/FlareZ123/liber-primus/actions/runs/43546259289).
