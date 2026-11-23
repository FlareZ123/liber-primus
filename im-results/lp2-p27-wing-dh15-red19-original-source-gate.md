# Original p27 wing's 15/19/2 geometry is consistent with the p29/p39 historical DH state

**Agent 44, 23 November 2026. Classification: conditional original-source key-state/visual-navigation hypothesis; one exact original mathematical correspondence and no authenticated LP2 cipher, unknown plaintext, or complete final path.** This is a prospective solve-path constraint, not an established attribution. The face values, page roles and use of the 2013 historical DH tuple were assembled after substantial examination of LP2, and the p27→p55 seam is previously known.

## The physical clue and a precise independent numerical prediction

On original physical LP2 p27, archive `44.jpg`, the independently measured isolated wing has **15 stable enclosed membrane faces**, of which **13 touch the exterior perimeter** and **two are wholly internal**. The tiny additional fifteenth face has only 288–385 white pixels at the tested five grayscale thresholds, which matters because some size cutoffs yield 14 instead; the original figure does not number the cells. The source-image SHA-256 is `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`. Existing frozen original-image geometry and direction-sensitive controls: [the 15-face graph](lp2-p27-original-wing-15face-graph-source-gate.md) and [13-rim/2-inner source SFT](../sims/lp2_p27_wing_perimeter_sft.py).

The same original p27 prints a **19-rune red heading**, then a red 13-dot mark **immediately after its nineteenth rune**. Among all 18 canonical red rune spans across physical LP2, this is the **sole length-19 span**. This is measured directly from [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json), separate from any decoding.

The genuine prior **2013 miniature Diffie–Hellman example** has a complete and checkable tuple:
```
p = 23, generator g = 5
client exponent b = 15, client public B = 5^15 mod 23 = 19
server exponent a = 6, server public A = 5^6 mod 23 = 8
shared K = A^15 mod 23 = B^6 mod 23 = 2
```
Here **15 = all original wing faces**, **19 = red heading length**, **2 = enclosed inner faces**. In the conditional reading, the wing exposes `b`, its red title exposes `B`, and the number of faces remaining after the exterior thirteen are removed exposes `K`. Reading the solved p57 instruction *“SHED OUR OWN CIRCUMFERENCES”* as a physical perimeter operation is a *candidate* clue; it does not label any DH operand on the wing. This is a structural match, not proof of a designed code.

A sharper **independently computable test** is available once `p=23` and `g=5` have been proposed: the multiplicative order of 5 modulo23 is **22**, so the unique exponent among 0–21 giving public value19 is **15**. Taking only 13 perimeter faces gives `5^13 mod23=21`, and taking 14 larger faces gives `5^14 mod23=13`. Neither produces the physical title length19. This distinguishes the full 15-compartment count from those two natural alternatives *within the conditional DH hypothesis*. It is not a significance level after model selection.

## Original p29/p39 source packet supplies the full tuple in a proposed register

The unchanged **first complete word** on p29 is GP29 `[2,23,6]`, provisionally `[K,p,a]`. The original **three red p39 runes** at offsets119–121 are `[27,5,15]`, provisionally `[-K,g,b] mod29`. Together they specify **`K=2,p=23,a=6,g=5,b=15` without looking at the p29 last word**. Modular exponentiation forces `A=8,B=19` and reproduces `K=2`. The untouched p29 final five GP29 runes are exactly `[18,12,6,8,19] = [A−B (mod29),K*a (mod29),a,A,B]` under that mapping. These values also generate the independent `Q(X)=[15,18,12,6]` polynomial parity relation on p29 in [the original word-boundary packet report](lp2-p29-dhframe-p28-exact-inner-original-gate.md).

Original numeric agreement is exact, and the cross-page arrangement helps constrain future reasoning. However, an unauthenticated choice of operand labels and polynomial coefficients made *after seeing* the values can connect unrelated phenomena. Neither the 2013 challenge nor printed LP2 instructs a solver to use these exact field labels or to perform this multiplication on the manuscript. Do not count p27’s 15 and p39’s final 15 as independent key derivations once the model is fixed.

## The previously known 15-step visual navigator is still an unconsumed pointer

An original **red 13-dot mark immediately after p27 rune19** allows a source-visible start position. Counting **15 next GP29 runes**, the complete 15-rune run is `NHGUIAHU BF DJU BEI` (spacing as printed, one multiletter `IA` rune). Its final six symbols `DJU BEI` match *exactly* p55's final six GP runes at positions70–75; the next p27 rune at offset34 equals the first rune of *solved* p56. This source-exact cross-page seam and fifteen-step count were established **before** this DH connection. They do provide a possible route `wing/marker → p27 end of fifteen-rune window → p55/p56`. They do **not** produce a reversible inverse of p55 or a key for p29.

The wing does not label its faces or their values. Restricting traversal to root-to-tip, self-avoiding, neighboring faces still admits at least **four** different complete 15-face routes in the frozen prior graph. Even the 13-rim/2-inner decomposition fixes no unique insertion/order for the internal faces. The physically available `b=15` is therefore a scalar **count**, not an independently specified sequence of 15 cipher-key runes. A 15-rune transposition also leaves original ciphertext symbol frequencies unchanged, and earlier exact original-source transforms did not recover native-GP prose.

## Decision and falsifiable next step

The assembled DH reading gives a **specific, bounded arithmetic and navigational explanation** for the exact triple `15 faces / 19 heading runes / 2 internal faces`, tied to the independent original p29/p39 field values. It deserves to remain available as a potential path selector. Its strongest unsupported premise is that the creator expected readers to map unlabeled geometric counts and separate red runes to an archived 2013 toy-DH exchange.

It advances toward actual plaintext **only if** a new source-authenticated instruction gives a typed consumer: which 269-rune register or p55 section is ciphertext, how one DH-derived value becomes the *entire* reversible transformation, where word and page resets occur, and what independent holdout the decoder must predict. No numerical equality, short shared motif or self-roundtripping synthetic encryptor meets that threshold. Additional guessed 15-face permutations or raw shifted-key sweeps would spend compute on the missing instruction rather than finding it.

**Reproduction**: [read-only Node22 SFT](../sims/lp2_p27_wing_dh15_19_2_source_sft.cjs), [successful Windows workflow run 45184367844](https://github.com/FlareZ123/liber-primus/actions/runs/45184367844). The SFT reads and hashes the unchanged original wing JPEG, verifies all source corpus/ink numeric positions, computes finite-field DH exponents and unique discrete log, and asserts the exact p27/p55/p56 seam. The published geometry 15/13/2 is separately recovered from original source pixels by the existing [image SFT](../sims/lp2_p27_wing_perimeter_sft.py); the Node script intentionally **does not** pretend to recalculate face regions.
