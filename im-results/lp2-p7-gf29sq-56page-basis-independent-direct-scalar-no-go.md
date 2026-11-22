# Basis-independent obstruction to the 56-page GF(29²) square-root clock

**Agent16, 22 November 2026. Director [#2309](https://github.com/FlareZ123/liber-primus/issues/2309).** **No new unknown-page plaintext, creator-selected key or decipherment operation recovered.** This is a strong exact exclusion of the simplest **whole-book, page-indexed, two-rune field-multiplication cipher**, across *every fixed basis, either root and every global phase*. It does **not** exclude an externally keyed field design, cross-page nonlinear mixing or a different human-selected decoder.

## Actual authored inputs, source motivation and missing selector

The five final red whole words on original physical p7 yield native GP0 products `[11,26,8,15,2]`, hence the already established quartic `P(x)=11+26x+8x²+15x³+2x⁴ mod29`. Its exact fixed-point factorization is

`P(x)-x = 2(x-3)(x-4)(x²-8) mod29`.

The native fixed roots **3,4** reproduce the original next-page red heading products in reverse order. The irreducible residual `x²-8` defines `K=GF29[α]/(α²-8)`. The element `α` has exact order **56**, because 8 has order28 in the prime field, `α²⁸=−1` and `α⁵⁶=1`. The second LP release has **56 unresolved physical pages p0–p55**, including rune-free numerical-table page p50. Those original objects motivate the hypothesis.

**Crucial unmet authored step:** the original art/text does not uniquely instruct a 2014 solver to make successive GP29 rune pairs into coordinates of K, choose multiplication by α, start a page-state clock at a particular physical page, carry across actual page/word boundaries or supply side information. The 56 count is a later classification of unresolved pages, and physical page labels do not print a field basis. Thus a coincident order56 by itself does not specify an inverse.

## The exact basis-independent no-go theorem

Suppose the cipher operates on two successive GP29 runes as an ordered pair of `GF29` coordinates, chooses **any one fixed invertible two-coordinate basis**, and applies the field root as a literal page clock `M^(page+phase)`, where `M` represents multiplication by either `+α` or `−α` (or its inverse). Both roots satisfy

`M² = 8I`, hence for **every** integer k, `M^(2k)=8^k I`.

This remains true under **every** invertible basis change `BMB⁻¹`, because the scalar matrix `8^k I` commutes with B. Swapping α for −α also leaves every even power unchanged. Changing the global page phase only switches which original page parity receives even exponents.

On each even-state page, **the entire two-rune transform is a uniform nonzero scalar multiplication**. It cannot alter the GP29 symbol collision count or index of coincidence (IoC): the map `r→λr (mod29)` merely permutes the 29 rune labels.

Original corpus provides two independent, long, exactly pair-aligned counterexample pages of **opposite physical parity**:

| Physical page | Original global rune offset | Original rune length | Original GP29 IoC |
| --- | ---: | ---: | ---: |
| **p0** | **0** | **262** | **0.034307273844** |
| **p43** | **10,416** | **274** | **0.035988342558** |

Both pages begin at an **even global rune offset** and have even rune lengths. Therefore the identical statement holds whether the mechanism pairs characters from the beginning of each physical page or pairs the entire original manuscript continuously. For **any** phase across 56 states, p0 and p43 have opposite exponent parities. At least one of them is an even-exponent page and thus **must preserve its listed low ciphertext IoC exactly**, regardless of the hidden fixed basis and root sign.

A 262–274-rune authentic natural-GP plaintext should not have such uniform glyph frequencies under the project's existing controls. The published source-native original 229-rune control census contains 3,517 native-English samples with IoC **at least 0.049529**, well above both counterexamples. Clear p57 GP95 has IoC **0.0627099664**. Therefore a pure 56-state page multiplication **cannot supply long ordinary natural-GP plaintext across all unknown pages**. The counterexample is whole-page and independent of any fitted language model.

The result has a cryptographic explanation beyond statistics: **half the 56 states are merely monoalphabetic rune substitutions**, even if the odd states are pair-swapping transformations. A state machine of this literal form lacks enough diffusion to hide frequency structure on every page.

## Additional true-original framing obstruction

The 55 rune-bearing unknown pages contain **12,956 GP29 runes**, but **32 of the 56 physical pages have an odd original rune count**. A reset-at-each-page two-rune operation therefore needs an unprinted padding/side-information convention for those pages. A manuscript-continuous pairing avoids loss, but then **22 actual page breaks cut between a consecutive pair of rune coordinates**, requiring a rule for which page state owns the pair. The original page frames alone do not specify that rule. The p0/p43 witnesses above remain completely aligned in both representations, so this ambiguity cannot rescue the simple field multiplier.

## Reproduction and controls

The [standalone source-native Windows/Node22 SFT](../sims/lp2_p7_gf29_squared_56page_scalar_no_go_sft.cjs) uses the original `lp2-corpus.json`, proves `M²=8I`, `M²⁸=−I`, `M⁵⁶=I` and full order56, checks several explicit independent bases and both root signs, and enumerates all **56 global phases** to select the correctly parity-matched p0/p43 witness. It checks all 28 possible nonzero GP field scalars on both original pages, with **exact integer rune-pair collision invariance and exact inverse**. Genuine solved p57 GP rune cleartext is used in additional planted invertible controls. A valid algebraic decoder will re-encrypt every key, so the collision-preservation obstruction is the decisive evidence.

[Successful Windows Node22 run 45051164652](https://github.com/FlareZ123/liber-primus/actions/runs/45051164652) uses the existing read-only research dispatcher.

**Complementary independent result:** [Agent37's complete-source frozen root± receiver SFT](../sims/lp2_p7_gf29sq_root56_pair_receiver_original_sft.cjs) tests exactly the zero-origin, globally paired field multiplier; it also finds no readable original p0, distant sections or genuine key. The present proof widens that narrow direct model to **all fixed bases and global phase choices** without postselection or computational key search.

## Research decision

**Retire the bare original-GP pair multiplier `×α^(page+phase)` as a complete whole-book natural-prose cipher under any fixed field basis.** The p7 residual remains valid source arithmetic and a candidate source-defined **operand** for a more complex, separately selected operation. To progress, one must discover a first-party instruction specifying a different reversible consumption of α or the p8 title's companion field value, a true ciphertext receiver or an independently checkable plaintext fragment. Simply selecting more page origins, α/−α signs or basis matrices cannot overcome this no-go theorem.
