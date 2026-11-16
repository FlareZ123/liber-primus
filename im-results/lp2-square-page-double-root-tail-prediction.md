# Square-length LP2 pages: exact GF29 two-rune tail prediction

**Agent 7, 16 November 2026. Status: new original-ciphertext structural observation, a reversible proposed checksum, no verified plaintext/key/cipher/destination.**

## A source-visible square selector and two historical candidate constants

Of all **55 rune-bearing unsolved physical pages p0–55** totaling 12,956 GP29 runes, **only p6 (196=14×14) and p32 (121=11×11) have perfect-square complete rune counts**. The final known p57 injunction to shed circumferences, the p15 numbered square, and the p39 three-rune red polynomial motivate an inquiry into square-structured sources.

Two separately printed original-era numerals are the authenticated 2013 BASE29 example whose first output numeral is **3** (3301→3QO), and the isolated p39 red quadratic whose constant rune index is **27** (complete low-first coefficients 27,5,15). A possible field-checksum interpretation assigns **p6→3** and **p32→27**. **That particular assignment was made *after* the double roots were observed**; it is a source-conditioned hypothesis, never a blind, independently selected authorial operation.

## Exact original-ciphertext check and withheld-symbol reconstruction

Represent each unmodified complete original page as a high-degree-first GF29 polynomial. Its repeated root at r requires **P(r)=0 and P'(r)=0**. The unique last-two-rune predictor, using *only the first n−2 source indices*, follows by writing P(X)=X² Q(X)+aX+b and solving:

a = −r² Q'(r) (mod29)

b = −r² Q(r) − r a (mod29).

| Source page | Original n | Candidate r | Q(r), Q'(r) | Predicted last two | Observed last two | Both root constraints |
| --- | ---: | ---: | --- | --- | --- | --- |
| p6 | 196 | 3 | 0,7 | **24,15** = A S | **24,15** | zero, zero |
| p32 | 121 | 27 | 20,23 | **17,12** = B EO | **17,12** | zero, zero |

Both complete pages independently possess these exact **double roots**, and both 2-symbol predictions match. The two selected roots are generators of the GF29 multiplicative group and satisfy 3³=27 and 27¹⁹=3 mod29. These arithmetic relations do not select a key schedule.

Previously published source work identified *all* four original ciphertext pages with any double field root: **p0→10, p6→3, p29→24, p32→27**. The p29/256-cell numerical table repeated shared root24 and p39 source-factor identity were known **before** this study. The narrower *new* observation is that the two complete original square-length pages are among those four and each has a two-symbol exact source-domain completion under candidate historical root constants.

## Discriminating readouts and limitations

For p6, exactly **6 of its 196** whole-page cyclic origins produce any double root; all six preserve root3. For p32, exactly **6 of 121** origins produce a double root, but **only original origin zero** has root27. Treating the two original page rotations independently, the exact finite conditional frequency for **any** double root on both square pages is 36/(196×121)=**0.00151796256**; requiring the same original named roots gives 6/(196×121)=**0.0002530**. These are after-the-fact conditional reference frequencies, **not author-intent probabilities** and do not adjust for all earlier tested clue pairings.

The actual simplest decoder, exact high-first division by the source-deduced repeated linear factor, returns:
- **p6 / (X−3)²:** 194 GP29 rune coefficients, IoC **0.03584210245**, unreadable;
- **p32 / (X−27)²:** 119 GP29 coefficients, IoC **0.03332858567**, unreadable.

Both are near uniform 1/29 rather than natural known solved-page GP-English. Reading either square by a literal clockwise, top-left-starting **outer-to-inner concentric spiral** instead of the printed sequence does **not** preserve the double root. The source jets at the named roots become **(18,22)** for p6 and **(13,15)** for p32. The repeated-root relationship is therefore source-order-specific, not independent of square traversal. A solved-p57 plaintext parity plant confirms exactly recoverable withheld final symbols and rejects a tampered final symbol.

**Independent complete-chapter transfer test.** The original opening illustrated chapter pp0–2 is exactly **729 = 27×27** runes, a *third* square-length source object naturally selected without choosing any individual-page length. It has **no double GF29 root at any value 0–28** under the same high-first polynomial construction. In fact **none of the nine complete originally illustrated chapters has any repeated GF29 root**. This source-held-out counterexample is decisive against the stronger inference that square-length manuscript *units in general* were encoded with an appended double-root check. The observation remains specific to the two square-length **physical pages** rather than a general circumference/square cipher. The SFT checks all nine complete chapters without choosing a target root or tuning the unit boundaries.

**Decision:** This is a new reproducible source-square/polynomial *candidate*, with two original withheld ciphertext symbols exactly derivable for each page if the 3/27 roots were intended. It has **not** recovered any unknown plaintext, key, or historical decipherment instruction. Prefer finding independently creator-authored evidence that specifies the polynomial register and the 3/27 routing before applying further downstream ciphers. Do not enlarge source root choices or tune word scores solely to preserve a striking retrospective alignment.

[Read-only CommonJS SFT](../sims/lp2_square_pages_dual_derivative_tail_sft.cjs) checks complete original source lengths, all repeated page roots, both tail predictions, every cyclic rotation, both square-spiral gates, quotient IoC, and a solved-p57 source-native planted control. [Windows manual test workflow](../.github/workflows/agent7-square-pages-tail-sft-manual.yml).
