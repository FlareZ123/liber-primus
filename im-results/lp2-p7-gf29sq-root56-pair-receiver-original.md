# LP2 p7 quadratic root order56 as a full-book two-rune decoder: an exact all-secret obstruction

**Source-bound original-input decision (Agent37, 22 November 2026; Director [#2309](https://github.com/FlareZ123/liber-primus/issues/2309)).** The authentic p7 red five-word GP29 coefficient list defines a quadratic residual whose two roots have order56 in GF(29²), equal to the count of encrypted LP2 physical pages. The naturally represented field generator is **too simple to be a native-prose receiver**: every power merely multiplies the two rune positions by nonzero field scalars and optionally exchanges them. The **observed full-book original-input source stratified collision rate 0.0341622** is incompatible with the independent GP-native English controls tested (**minimum 0.0586561**), even if an unknown cipher analyst supplies arbitrary secret 29! symbol permutations independently to every physical-page × paired-rune-position stratum. All original 12,956 runes and full ciphertext re-encryption are preserved. **No unknown LP2 plaintext, first-party cipher key or authenticated global field-state instruction has been recovered.**

## The exact motivated object

The original p7 final five red complete words have GP0 products `[11,26,8,15,2]`. Their *ascending-degree* polynomial over GF29 is

```text
P(x) = 11+26x+8x²+15x³+2x⁴  (mod 29)
P(x)-x = 2(x-3)(x-4)(x²-8) (mod 29).
```

Its fixed points 3 and 4 are the two next-page p8 red word products in opposite order, and P′(4)=17 equals the final p8 red glyph. The independent [original p7→p8 source report](lp2-p7-p8-original-red-polynomial-fixedpoint.md) documents the complete source circuit and its decisive limitations. The polynomial's `x²−8` is irreducible over GF29. In the canonical quotient field `F=GF29[X]/(X²−8)`, its root `α=X` has **exact order56**, since `α²=8`, `8` has order28 in GF29, `α²⁸=−1` and `α⁵⁶=1`. The conjugate root `−X` also has order56. This is a real mathematical fact, independent of any decoding success.

**Unselected manuscript premises:** The original source does not say that two adjacent ciphertext runes are a field element, use the quotient basis `(1,X)`, use physical page p as exponent, choose root +X versus −X, or transform runic ciphertext by a multiplicative field action. The equality of 56 orders and 56 pages alone is a hypothesis, not a cryptographic instruction. The only first-party numeric operands are the polynomial's source coefficients and fixed-point links.

## One fully specified, reversible original recipient

To give the 56-order observation its cheapest lossless original-input opportunity, concatenate **all 12,956 canonical encrypted runes p0–p55**, including all 32 authentic page-carry words and the zero-rune p50 page. Keep all printed word separators, original punctuation and page lengths as the exact inverse sidecar. Pair global consecutive rune ordinals as `c[2j]+c[2j+1]X`, even across a physical page seam. If the first rune belongs to physical page p, decode the pair by multiplying by `(±X)^(−p)` in F; the inverse multiplies the decoded pair by `(±X)^p`. Thus the whole receiver round-trips *every original rune* with **no padding, missing words, or letter deletion**. The physical page ownership convention is frozen before inspecting output, with p50 simply advancing the page counter even though it has no runes. It uses exactly two source-defined root directions and **the natural zero-origin page clock**; no secret phase, source-arbitrary field basis, extra key or Galois state selection was searched.

The multiplicative structure is stronger than a negative language score:

```text
α^(2k)   = 8^k
α^(2k+1) = 8^k X
(a+bX)α^(2k)   = 8^k a + 8^k b X
(a+bX)α^(2k+1) = 8^(k+1)b + 8^k a X.
```

Hence the field matrix is **monomial in the source canonical basis** at every period position. Both root signs yield the same conditional property. Every output position is a nonzero rescaling of exactly one input position, with possible pair parity reversal. **For each true physical-page × global pair-parity cell, symbol-equality counts and index of coincidence are exactly preserved**, although odd pages exchange their two parity classes. Any additional *arbitrary page-and-parity private permutation of all 29 symbols* is another bijection and preserves the same statistic. This proves a strict obstruction even under **110 independently secret symbol alphabets** for the canonical-basis X-orbit family. The claim holds for **all 56 phase origins** because every integer power of ±X is monomial; the finite test implements only the original-source natural zero-origin receiver.

## Original full-length output and truly independent source controls

| Original physical region | GP runes | Original IoC | Decoded root +X IoC | Decoded root −X IoC |
|---|---:|---:|---:|---:|
| p0 | 262 | 0.03430727 | **0.03430727** | **0.03430727** |
| p16–21 development | 1,613 | 0.03454947 | 0.03423179 | 0.03437409 |
| p40–53 held out | 3,008 | 0.03454263 | 0.03444688 | 0.03443804 |
| p54–55 final original | 308 | 0.03382123 | 0.03392699 | 0.03401159 |
| Whole p0–55 | 12,956 | approximately 0.0345 | 0.03446856 | 0.03447397 |

Original p0 is **unchanged exactly** because its source page exponent is zero. This immediate source-clock obstruction cannot be repaired by a changed glyph interpretation alone. All nonzero state variants stay near uniform GP29 occupancy; neither native prose nor a usable key emerges.

More importantly, condition on all **110 original physical-page × paired-rune-position strata** (55 rune-bearing pages, with source page ownership assigned to the first rune of each global pair). The original ciphertext has **54,422 ordered same-symbol pairs out of 1,593,048 eligible ordered pairs**, giving precisely **0.03416218469248886**. Both complete decoded streams preserve **all 110 corresponding index-of-coincidence values to floating-point precision**. This does not rely on choosing the best root or a linguistic model.

Use the already source-calibrated GP29 transliteration of independent Gibran, Shakespeare and Emerson plaintext, with native ING/IO spellings established by original solved LP1 words. Preserve the original exact 12,956-rune page/pair stratum geometry. Full-length source windows at stride 6,478 runes give the following *descriptive* matched control range:

| Original-language control | Overlapping 12,956-rune windows | Minimum page/parity IoC | Median | Maximum | At or below LP2 |
|---|---:|---:|---:|---:|---:|
| Gibran | 8 | 0.06021915 | 0.06107537 | 0.06127876 | 0 |
| Shakespeare | 32 | **0.05865611** | 0.06037232 | 0.06207095 | 0 |
| Emerson | 48 | 0.06068116 | 0.06194917 | 0.06320965 | 0 |

The windows overlap and do not constitute independent hypothesis tests. They show the proposed monomial source generator cannot create the collision-rich native prose of these established solved-style control registers, even with secret source-independent per-stratum value labels. Other plaintext languages, strong pre-rune compression, actual mixed-basis state matrices, or an independently supplied key are outside this exact theorem.

## Verification and Director decision

The [single-file source-exact Windows Node22/CommonJS SFT](../sims/lp2_p7_gf29sq_root56_pair_receiver_original_sft.cjs) independently checks the original p7 polynomial factor for every GF29 value, both root period56 properties and monomial powers, all original 12,956 rune positions, exact decapsulation/forward replay and 110 parity-collision invariants; it also encrypts and recovers an authentic solved-p57 95-rune source-native repeated plant at full original length. The independent 88 language windows are tested through the existing solved-LP1-calibrated rune encoder. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45051202947).

**Stop the exact canonical-basis root56 two-rune decoder.** The unsolved source question is how the creator would have intended a *different field basis, a non-monomial recipient, and a page state origin* to be read from p7/p8/p9 without fitted secret parameters. This is **not** a proof that every conceivable GF(29²) or 56-state cipher fails, and the root order coincidence remains an original mathematical observation. Any reopened branch needs first-party evidence of those missing operands and must recover or predict an independent real plaintext/key, rather than fitting arbitrary 2×2 page matrices after seeing the same nearly uniform ciphertext.
