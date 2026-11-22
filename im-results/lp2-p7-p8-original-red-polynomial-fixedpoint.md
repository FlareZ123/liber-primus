# Original p7 red quintuple polynomial and p8 red fixed-point/derivative handoff

**Agent50, 22 November 2026. Source-exact new algebraic relationship; provisional cipher interpretation.** The five final p7 red complete words define a single natural GP29 polynomial. The very next p8 red two-word heading gives **its complete fixed-point set** in reverse order, and the p8 red terminal rune matches a **derivative** at the first fixed point. This is a concrete original-cipher operation candidate, independently of the already fitted p50 GF4/radix59 key. **No unknown-page plaintext, author-supplied decipherment opcode or final destination has been recovered.**

## Source objects and one executable construction

On original LP2 physical p7, JPEG `24.jpg`, the last fourteen runes form five fully red complete words with printed lengths **[2,4,3,2,3]**. Read their unchanged zero-based GP29 ordinal-index products modulo29, in their physical left-to-right order:

```text
p7 red coefficients  c = [11,26,8,15,2]
p8 red heading      h = [4,3]   (two words of 4 and 8 runes)
p8 heading last rune = 17 (B)
```

Take the five products as ascending-degree polynomial coefficients over the **native GP29 finite field**, requiring neither a hidden field basis nor an external table:

`P(X) = 11 + 26X + 8X² + 15X³ + 2X⁴  (mod29)`.

The fixed-point equation factors **exactly**:

```text
P(X) - X = 2(X-3)(X-4)(X²-8) mod29
```

The quadratic `X²-8` is irreducible over GF29, since 8 is a quadratic nonresidue. Consequently the complete set of **GF29 fixed points is exactly {3,4}**. That is precisely the two actual p8 red *whole-word* products, printed **[4,3]**. It reads as a possible source-defined handoff: the p7 five-word coefficient list predicts the two next-page red whole-word values.

The derivative adds a sharper check using an original feature outside those two products:

```text
P'(X) = 26 + 16X + 16X² + 8X³  mod29
P'(4) = 17
P'(3) = 28
```

The **last physical red rune of the p8 heading is B, GP29 index17**. Moreover `4×3×17=204≡1 (mod29)`: the predicted derivative is the inverse of the entire red heading's GP29 product12. An already known p8-only reciprocal `12×17=1` thus acquires an independent candidate upstream source: the p7 polynomial. The p8 terminal17 contributes to the second heading word's product3, so these target facts are correlated within that word. The p7 coefficient data, however, are separate original source input.

**Source-order limitation:** treating the exact five coefficients in conventional high-to-low printed order instead produces fixed point **{9}**, with no p8 match. The low-to-high coefficient convention has not been authenticated in original instructions and remains an explicit unresolved choice. It is nevertheless the single simple typed grammar that reproduces the p8 outputs.

## Discriminating source controls

The full original-image-backed Windows CJS SFT reconstructs **all 2,896** genuine printed words on unknown pages p0–p55 using original punctuation and physical ink, explicitly accounting for absent rune-free p50 in the master transcript. It verifies p7/p8 source runes and exact red whole-word boundaries before evaluating a polynomial.

- **Printed-order diagnostic:** of the **120** permutations of the five distinct original p7 products, **only the actual printed order** makes both GP29 values3 and4 fixed points. Its reversal fails.
- **Source-feature family:** eleven simple red whole-word features (rune length; GP0/GP1/prime sums; GP0/GP1/prime products; first/last GP0 indices; first/last prime residues), each under ascending and descending powers, give **22** source-first rival grammars. **Only ascending GP0 product** fixes both3 and4. The same GP0 feature was previously the sole tested one producing both GF3 242 and GF4 255 primitive register periods under their respective tap conventions; the fixed-point result is a mathematically different model and requires no GF4 table.
- **Different-shape continuation control:** physical p53 ends in **12** red complete words and p54 opens with **two** red words having products [24,10]. Neither the first five nor last five p53 red-word products produce both of these values as fixed points. This comparison is weaker because 12→2 is not the same physical 5→2 red interface. No general page-wide fixed-point transform is established.
- **Direct-cipher exclusion:** the function `P: GF29→GF29` realizes only **19 output symbols**. The complete original p8 255-rune ciphertext uses **all 29**, and **86** original p8 positions contain symbols outside the image of P. Therefore `C=P(plaintext)` is impossible as a simple pointwise encoder without an extra side channel. A viable decrypting mechanism would require a source-selected **reversible** use of this polynomial rather than direct substitution.

For calibration, if the five red products were independent uniform GF29 values and the p8 red outputs were specified beforehand, the two fixed-point equations have exact probability **1/29²**, and the condition of *no other GF29 fixed points* has exact probability **11,536/29⁵ = 0.00056242583**. The additional derivative condition `P'(4)=17` is a third independent linear condition, giving **1/29³** before the full-root requirement, and exactly **409/29⁵ = 0.00001994037** when the root-set requirement is also imposed. These are **conditional source-null diagnostics**, not discovery-wide significance: five red products, ascending coefficients, fixed-point operator, and choosing the 4/3 heading were recognized during exploratory study. Thousands of manuscript operators have been tried, and original title values were visible before this test.

## Irreducible factor selects a further exact finite-field candidate

The residual quadratic `X²-8` names an entirely source-derived extension **GF(29²)=GF29[α] / (α²-8)**. Because 8 has multiplicative order28 in GF29 and is a quadratic nonresidue, the element α has **order56** in GF(29²): α²⁸ = −1 and α⁵⁶ =1. This is a finite candidate page-state clock of length56, numerically equal to the p0–p55 unresolved physical-page count. It is an interesting possible route from a source-selected polynomial to a reversible linear field action, but manuscript page numbering was not printed in the distribution, and there is **no original instruction** that says to use α as a page clock, choose α versus −α, apply it to GP29 rune pairs, or interpret the rune-free table page as a state. Do not promote the count match to a key.

The polynomial's next concrete research fork is a source-authored invertible **consumer**, such as an explicitly specified field multiplication or a keyed state transition, followed by a frozen **complete original page** test. A plain scalar multiplication by 17 or12 only renames GP29 symbols, preserving equality patterns and index of coincidence; it does not by itself solve the ciphertext. An unrestricted polynomial Feistel or multi-round search would add choices absent from original evidence. The strongest existing alternatives remain an unrelated p7/p8 source coincidence and the previously conditional GF4/p50 key-fit route, which requires several other unsourced conventions.

## Reproduction and decision

- [Windows Node22 read-only original-source SFT](../sims/lp2_p7_p8_original_red_polynomial_fixedpoint_sft.cjs), **[CI PASS, 22 Nov 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45047067228)**. Frozen output verifies all polynomial identities, p8 red runes, source-word inventory, feature and direction controls, the first/last p53 continuation, GF29² root order and all 255 p8 ciphertext runes.
- [Related earlier p7→p8 dual GF3/GF4 field and radix-source audit](lp2-p7-p8-dual-field-original-source-selector.md) establishes an alternative mechanism whose radix59 and fifth-product-as-seed choices remain unauthenticated.
- [Agent45's separate p8 original Berggren/reciprocal gate](lp2-p8-berggren-original-source-selector-gate.md) already notices the p8 whole-heading inverse12×17 and excludes its separate first-party-untethered Gaussian additive receiver. The p7 polynomial above offers a **different, earlier-page source** for the specific derivative17 and must not be confused with a proven continuation.

**Decision:** Preserve this source-local polynomial as a higher-priority operation-selector hypothesis than the GF4/radix59 byte-pad speculation. The exact all-roots and derivative correspondence supplies reproducible, independent source constraints with only one low-first product grammar among22 examined. Demand a **reversible original-cipher inverse** or an independently authored instruction before claiming any decryption or promoting the polynomial to an established cipher mechanism.
