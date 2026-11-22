# Basis-independent obstruction to the 56-page GF(29²) square-root clock

**Agent16, 22 November 2026. Director [#2309](https://github.com/FlareZ123/liber-primus/issues/2309).** **No new unknown-page plaintext, creator-selected key or decipherment operation recovered.** This is a strong exact exclusion of the simplest **whole-book, page-indexed, two-rune field-multiplication cipher**, across *every fixed basis, every exact-order-56 field generator and every global phase*. It does **not** exclude an externally keyed field design, cross-page nonlinear mixing or a different human-selected decoder.

## Actual authored inputs, source motivation and missing selector

The five final red whole words on original physical p7 yield native GP0 products `[11,26,8,15,2]`, hence the already established quartic `P(x)=11+26x+8x²+15x³+2x⁴ mod29`. Its exact fixed-point factorization is

`P(x)-x = 2(x-3)(x-4)(x²-8) mod29`.

The native fixed roots **3,4** reproduce the original next-page red heading products in reverse order. The irreducible residual `x²-8` defines `K=GF29[α]/(α²-8)`. The element `α` has exact order **56**, because 8 has order28 in the prime field, `α²⁸=−1` and `α⁵⁶=1`. The second LP release has **56 unresolved physical pages p0–p55**, including rune-free numerical-table page p50. Those original objects motivate the hypothesis.

**Crucial unmet authored step:** the original art/text does not uniquely instruct a 2014 solver to make successive GP29 rune pairs into coordinates of K, choose multiplication by α, start a page-state clock at a particular physical page, carry across actual page/word boundaries or supply side information. The 56 count is a later classification of unresolved pages, and physical page labels do not print a field basis. Thus a coincident order56 by itself does not specify an inverse.

## The exact basis-independent no-go theorem

Suppose the cipher operates on two successive GP29 runes as an ordered pair of `GF29` coordinates, chooses **any one fixed invertible two-coordinate basis**, and applies the field root as a literal page clock `M^(page+phase)`, where `M` represents multiplication by either `+α` or `−α` (or its inverse). Both roots satisfy

`M² = 8I`, hence for **every** integer k, `M^(2k)=8^k I`.

**This actually covers every generator of order 56.** For any β∈K* of exact order 56, β²⁸=−1, so β²⁹=−β. The Frobenius map in K sends a+bα to a−bα (since α²=8 is a quadratic nonresidue), so comparing a−bα=−a−bα forces a=0. **Every exact-order-56 β is thus a pure bα**, and β²=8b²∈GF29*. There are exactly **24** such elements, all enumerated in the SFT, including the independently source-defined p8 red-title cube **(4+3α)³=12α** and reversed-title fifteenth power **(3+4α)¹⁵=24α**. All 24 have scalar squares. This remains true under **every** invertible basis change `BMB⁻¹`, because the scalar matrix `8^k I` commutes with B. Swapping α for −α also leaves every even power unchanged. Changing the global page phase only switches which original page parity receives even exponents.

On each even-state page, **the entire two-rune transform is a uniform nonzero scalar multiplication**. It cannot alter the GP29 symbol collision count or index of coincidence (IoC): the map `r→λr (mod29)` merely permutes the 29 rune labels.

Original corpus provides two independent, long, exactly pair-aligned counterexample pages of **opposite physical parity**:

| Physical page | Original global rune offset | Original rune length | Original GP29 IoC |
| --- | ---: | ---: | ---: |
| **p0** | **0** | **262** | **0.034307273844** |
| **p43** | **10,416** | **274** | **0.035988342558** |

Both pages begin at an **even global rune offset** and have even rune lengths. Therefore the identical statement holds whether the mechanism pairs characters from the beginning of each physical page or pairs the entire original manuscript continuously. For **any** phase across 56 states, p0 and p43 have opposite exponent parities. At least one of them is an even-exponent page and thus **must preserve its listed low ciphertext IoC exactly**, regardless of the hidden fixed basis and root sign.

A 262–274-rune authentic natural-GP plaintext should not have such uniform glyph frequencies under the project's existing controls. The published source-native original 229-rune control census contains 3,517 native-English samples with IoC **at least 0.049529**, well above both counterexamples. Clear p57 GP95 has IoC **0.0627099664**. Therefore a pure 56-state page multiplication **cannot supply long ordinary natural-GP plaintext across all unknown pages**. The counterexample is whole-page and independent of any fitted language model.

The result has a cryptographic explanation beyond statistics: **half the 56 states are merely monoalphabetic rune substitutions**, even if the odd states are pair-swapping transformations. A state machine of this literal form lacks enough diffusion to hide frequency structure on every page.

## Universal strengthening: all 840 field elements, every field-power page clock

The no-go theorem extends beyond all 24 exact-order56 generators. **Every nonzero** `β=a+bα∈GF(29²)` satisfies the field-norm identity

`β³⁰ = β · β²⁹ = (a+bα)(a−bα) = a²−8b² ∈ GF29*`.

Therefore **every** literal whole-book page power clock `β^(physical page+φ)`, for an arbitrary original phase φ, has a page exponent divisible by 30 among the first **30 physical pages p0–p29**. On that page the transform is a nonzero **scalar rune permutation**, in *every* fixed coordinate basis. A second page 30 positions later, when physically present, has the same scalar-only property.

The original source has sufficient uninterrupted text to make this nonlinguistic obstruction independent of φ: for each of the 30 source-phase residue classes, choose the longer of pages `j` and `j+30` (where present), where `j≡−φ mod30`. Every selected page provides **at least 201 genuinely original runes**; their original unmodified GP29 index of coincidence is low. Even if global field pairs are allowed to cross real page boundaries, at most **one leading rune** is governed by the preceding page's state. Removing just that possible spillover leaves **at least 201 runes** with IoC no higher than **0.0359890792** under all 30 phase choices. A nonzero scalar preserves that exact remaining rune-frequency distribution and cannot transform it into normal source-native GP prose.

The SFT enumerates **all 840 nonzero field elements β** and verifies `β³⁰=Norm(β)·1` exactly, as well as all **30 original-source phase witnesses**, physical page lengths, true global pair offsets and low retained IoCs. This is a complete mathematical exclusion of the **bare fixed-field power clock family**, including any source red-title primitive element g of order840 and all alternative generator periods. The direct diagnostic still assumes the page state starts inside its own β-power orbit; a distinct source-selected **coset seed** `h·α^p` can avoid a scalar page. Such a seed was tested separately on all **12,956 original runes** and failed as a direct prose decoder in [the independent complete-source decision](lp2-p7-p8-hseed-56clock-whole-book-original-negative.md).

## Additional true-original framing obstruction

The 55 rune-bearing unknown pages contain **12,956 GP29 runes**, but **32 of the 56 physical pages have an odd original rune count**. A reset-at-each-page two-rune operation therefore needs an unprinted padding/side-information convention for those pages. A manuscript-continuous pairing avoids loss, but then **22 actual page breaks cut between a consecutive pair of rune coordinates**, requiring a rule for which page state owns the pair. The original page frames alone do not specify that rule. The p0/p43 witnesses above remain completely aligned in both representations, so this ambiguity cannot rescue the simple field multiplier.

## Reproduction and controls

The [standalone source-native Windows/Node22 SFT](../sims/lp2_p7_gf29_squared_56page_scalar_no_go_sft.cjs) uses the original `lp2-corpus.json`, proves `M²=8I`, `M²⁸=−I`, `M⁵⁶=I` and full order56, checks several explicit independent bases, enumerates **all 24 exact-order-56 field elements**, and enumerates all **56 global phases** to select the correctly parity-matched p0/p43 witness. It checks all 28 possible nonzero GP field scalars on both original pages, with **exact integer rune-pair collision invariance and exact inverse**. Genuine solved p57 GP rune cleartext is used in additional planted invertible controls. A valid algebraic decoder will re-encrypt every key, so the collision-preservation obstruction is the decisive evidence.

[Successful Windows Node22 run 45051164652](https://github.com/FlareZ123/liber-primus/actions/runs/45051164652) uses the existing read-only research dispatcher.

**Complementary independent result:** [Agent37's complete-source frozen root± receiver SFT](../sims/lp2_p7_gf29sq_root56_pair_receiver_original_sft.cjs) tests exactly the zero-origin, globally paired field multiplier; it also finds no readable original p0, distant sections or genuine key. The present proof widens that narrow direct model to **all fixed bases and global phase choices** without postselection or computational key search.

## Research decision

**Retire every bare fixed-field multiplier page clock `×β^(page+phase)` with nonzero β in GF(29²), any fixed basis and any phase, as a complete whole-book ordinary-GP-prose decoder.** The p7 residual remains valid source arithmetic and a candidate source-defined **operand** for a more complex, separately selected operation. To progress, one must discover a first-party instruction specifying a different reversible consumption of α or the p8 title's companion field value, a true ciphertext receiver or an independently checkable plaintext fragment. Simply selecting more page origins, α/−α signs or basis matrices cannot overcome this no-go theorem.
