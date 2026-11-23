# P39 exact F16 quotient/syndrome and source-spiral circulant consumer

**Agent 3, 23 November 2026. Original-source, bounded negative.** This records a new fully reversible, no-key original-cipher consumer motivated by the authentic p15/p39/p50 16-value/240-rune geometry. **No unknown-page plaintext, creator-selected cipher, key, or continuation is recovered.** Reproducer: [single-file Windows Node22/CJS test](../sims/lp2_p39_f16_quotient_sft.cjs).

## Motive and source-fixed inputs

The unchanged p39 image (original `56.jpg`) contains exactly **240 GP29 glyphs**, split by its red paragraph mark into **119+121** glyphs. The triad at GP indices 119–121 is `[27,5,15]`, straddling the exact 120-rune center. Independently the p15 illustration (original `32.jpg`) prints **16 distinct four-digit values** in a 4×4 Fibonacci-prime spiral. The original p49–51 table is 256 exact, source-validated radix60 values, provisionally reduced modulo29; its degree254 normalized polynomial has the known exact degree16 factor

```
F16(X) = [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]
```

in ascending order. The table's first byte203 vanishes mod29 and the second byte231 is −1 mod29. The normalized degree254 polynomial is exactly divisible by F16, leaving degree238. The independent printed p15 spiral in clockwise-unsigned order, reduced mod29, supplies

```
A15 = [22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21].
```

Earlier reports already exclude additive use of the 240-coefficient table quotient, 4×4 p15 mixing, and p39 red-quadratic division. The present experiment uses the **original p39 polynomial itself** as the numerator of an exact F16 quotient/syndrome extraction. As a second distinct, explicitly frozen operator, the p15 values generate one 16×16 *circulant* matrix over GF29 operating on the physical **15 rows of16** p39 glyphs; this is distinct from the prior 4-coordinate page operator.

## Exact GF29 extraction

Interpret all240 original glyphs as coefficients in printed order, high degree first, and divide by the source F16. The full lossless map is `C240(X) = F16(X)·Q223(X)+R15(X)`, where Q has224 symbols and R16. Preserve all16 remainder symbols as side data. This inversion is exact and has **no tunable key, dropped symbol or presumed plaintext**. The reverse physical coefficient orientation is the one alternate source reading tested.

| Original p39 reading | Extracted quotient (224) GP29 IoC | Syndrome (16), high degree first |
| --- | ---: | --- |
| Printed high-degree-first | **0.0333119795003** | `ARTDRAOORAEPUTHPXI` |
| Reversed | **0.0334320948110** | `FDNGCTHLEAOELOXHOEJRS` |

The solved source p57 clear text has GP29 IoC **0.062709966405**. Neither original 224-symbol quotient forms native-GP prose; the printed-direction output begins `SNSEOGCHDGIAIAOOESXPHNEIOEEIAB...`. The few English-like leading symbols in the 16-rune syndrome are far too short to qualify as recovered plaintext, especially when the remaining 13 symbols fail continuity. With independently sourced p57 text as the **entire planted quotient** (cyclically extended to224), the identical inverse recovers **224/224** planted native runes, retaining an original p39 syndrome. Both actual original inputs reconstruct byte/rune-exactly from their computed Q and R.

## The source-spiral full 16-wide mixing attempt

Build the **circulant** `M[i,j]=A15[(i-j) mod16]` from the printed unsigned p15 clockwise spiral. This is a specific historical-illustration-derived 16-symbol *linear mixing* operation, rather than simple transposition (which cannot change the low original ciphertext IoC). Divide p39 exactly into15 printed-order rows of16. Apply M and its full GF29 inverse to each row, preserving every rune. Permit only physical reversal of p39 and the printed/reversed A15 operand order. These **eight original reversible readouts** yield GP29 IoCs:

```
A15 printed: forward(printed/reverse) 0.034762901 / 0.035425384
             inverse(printed/reverse) 0.035146444 / 0.034483961
A15 reverse: forward(printed/reverse) 0.034449093 / 0.034065551
             inverse(printed/reverse) 0.035146444 / 0.034518828
```

All eight recover exact original ciphertext after the companion matrix operation and have no coherent plaintext; the strongest frequency concentration is still ordinary uniform GP29. The code checks the matrix inverse algebra and original replay. This finite test does **not** cover arbitrary column permutations, invented nonlinear transforms, changing 16-wide keys or altered printed boundaries.

## Decision and next prerequisite

Close these exact F16 quotient-to-prose and p15-source circulant consumers as original-input negatives. The p39 15×16 and triad-center artwork relationship remains a **conditional candidate clue**; original LP2 supplies **no instruction selecting quotient/syndrome versus circulant mixing, plaintext alphabet, or a second output transform**. The exact 16-rune remainder is legitimate derived data but not independently a message. Promote neither the apparent word `ART` nor the established p39/p50 factorization to decrypted text. Further testing of arbitrary output transforms would be post hoc; a valid successor needs a source-visible operator distinguishing it from these failures and must predict untouched original plaintext.

**Reproduction:** `node sims/lp2_p39_f16_quotient_sft.cjs`. Reads existing canonical JSON only; does not modify original assets. It pins the 256-byte table SHA-256, all p39 positions, F16 table factorization, both exact quotient/remainder inverses, an authentic-GP planted 224-rune quotient, and all eight original 16-wide circulant forward/inverse equations.
