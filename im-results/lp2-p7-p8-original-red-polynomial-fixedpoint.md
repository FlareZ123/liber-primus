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

## A more specific source-typed title circuit: Roman XIX, 12 and I→C

An especially strong original-title continuation links the polynomial's values to *independently visible printed glyphs*, without referencing the later p50 table.

1. The first red p8 word is literal GP transliteration **`XIXM`**: its first three runes spell Roman **XIX = 19** and its next red rune is **M, GP29 ordinal index19**. This already known self-label supplies a human-readable **source integer input** to `P`. The printed-order polynomial gives **`P(19)=12`**.
2. The exact red p8 heading has **4+8=12 runes**. Its two red word-products are **4 and 3**, whose full product is **4×3=12**, reproducing `P(19)`. The **very last black rune of p8**, physically the first cell of the authentic word continuing onto p9, is also the GP index **12**. Thus the same scalar occurs as Roman-selected polynomial output, printed red title length, title product, and original page-seam rune. It is a cross-object relationship, although several components are arithmetically dependent once the original title is fixed.
3. Of the twelve red p8 title runes, **exactly two** lie on the polynomial's unique nontrivial **seven-cycle** `[5,15,28,9,10,24,7]`: **I index10** at red offset1 in the *first* heading word, and **C index5** at red offset7 in the *second* heading word. Their forward distances are `P³(10)=5` and `P⁴(5)=10`, **exactly the heading's two word products [4,3] in opposite-word directions**. The seven-cycle has the same length as the source-verified p8–p14 botanical chapter's seven physical pages.
4. The earlier root/derivative relation closes the page-local circuit: `P(3)=3`, `P(4)=4`, `P′(4)=17`, and the last red heading rune is B, ordinal17. The complete red product12 and final red rune17 also obey `12+17=29`, `12×17≡1 mod29`, equivalently `12²≡-1 mod29`; these are alternate expressions of the same source values, not independent proof factors.

The previously documented [source seven-cycle and zero-seed gate](../sims/lp2_p7_red_polynomial_seven_cycle_original_sft.cjs) independently established the period7, the p8–14 seven-page count, and the unique `P⁵(0)=5` among a restricted polynomial null; its seven-symbol **rune-periodic** GP29 additive receiver failed. The incremental title circuit here adds `P(19)=12`, its exact seam/title matches, and the two title glyphs I/C with the **3/4 step links**, which that earlier cycle report did not consume as an original cipher selector.

**Exact conditional polynomial census:** Start with all **841** quartics over GF29 satisfying only the already established original `P(3)=3`, `P(4)=4`, `P′(4)=17`, parameterized as `P(x)-x=(x-3)(x-4)[16+b(x-4)+c(x-4)²]`. Of these, **409** have no additional GP29 fixed roots; **29** satisfy the additionally original-visible Roman `P(19)=12` and **15** satisfy both Roman mapping and exactly two roots. Exactly **one** of all841 satisfies **both** `P³(I10)=C5` and `P⁴(C5)=I10`, and its residual coefficients are `b=16,c=2`, the original p7 polynomial. This is an **exact conditional uniqueness certificate** for the selected source grammar; it is not a discovery-wide p-value because selection of operator, rune pair and step counts arose after viewing the manuscript.

**Full-chapter original wordwise consumer:** In addition to the earlier negative seven-symbol *rune*-clock decoder, preserve all **381 intact original black words =1,717 runes** across pp8–14, with the authentic p8→p9 carry joined. Seed the unique P seven-cycle from each of the two red-title cycle glyphs I10 and C5; apply wordwise additive or nonzero multiplicative GP29 keys with both arithmetic signs, and either one continuous chapter clock or page-local reset (16 frozen direct reversible hypotheses). The largest original GP29 IoC is **0.034933810**, all 16 below **0.05**, with unreadable source-native output. This excludes those specific printed-word-clock operations while preserving the newly identified source-title orbit relation as a cipher-design clue. Reproducer and positive tests: [original source SFT](../sims/lp2_p7_p8_original_red_polynomial_fixedpoint_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45049169220).

**Next causal decision:** the evidence now supplies a *complete internally checkable source arithmetic circuit* at the p7→p8 transition, including input19, output12, fixed roots3/4, terminal derivative17, I10/C5 directed orbit lengths3/4, and a seven-page state cycle. A successful decoder still needs the **author-selected mapping from this circuit to any unknown GP29 rune stream**, with untouched original ciphertext predicted at more than the inspected title sites. Resist treating the seven-cycle as a proven pad, or treating any many-layer reversible construction as a solution.

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

## Source-derived reversible projective and paired-rune consumers

The two physically adjacent heading products `[u,v]=[4,3]`, and independently matching terminal derivative `λ=P′(4)=17`, uniquely determine the **Möbius map** with these two fixed points and derivative λ at4, provided a solver had first chosen projective GF29 dynamics:

```text
(T(x)-4)/(T(x)-3) = 17(x-4)/(x-3)
T(x) = (11x+18)/(13x+7) mod29
M = [11 18; 13 7], det(M)=17, trace(M)=18, M⁴=I
```

The scalar matrix normalization above is fixed by the printed inputs; every other matrix representing the same projective map differs by a common nonzero multiplier. The **projective transformation has order4**, fixes precisely3 and4, sends the original symbol index24 to the distinct extra state infinity, and sends infinity to index12, coincidentally the complete p8 heading product. The matrix is a genuine reversible **GF29²→GF29² pair-linear function**, with exact order4. Projective action is reversible only after admitting an additional alphabet symbol infinity, not present among the 29 GP runes.

These are two strictly declared source-derived candidate cipher mechanisms, rather than an authentic cipher instruction. In particular the original manuscript does not tell players to build a fractional-linear map from the heading, use adjacent ciphertext pairs, select the starting phase, or add infinity as a letter.

An original-input bounded direct decoder gate now tests the **entire page8**, retaining printed rune order and the genuine first p9 carry rune, in two exact receiver registrations: **243 p8 black + 1 p9 =244** rune symbols, and **all 255 p8 + 1 p9 =256**. Across these two receivers the predeclared **38** direct reversible models comprise matrix powers M/M²/M³ (3 per receiver), four cyclic matrix powers with two phase directions × four phases (8), and analogous projective cyclic T (8). No target word is fitted. The largest GP29 IoC for any original output is **0.036733455** (GF29 pair matrix) or **0.036502547** (projective excluding artificial infinity); **0/38** outputs reach IoC0.05, and all were inspected for prose. Positive original-shaped source-data round-trip checks verify exactly reversible matrix/projective encoders. A source-to-source transfer into **all 242 printed black complete scroll-word GP0 products → all 242 p8 complete black runes** also fails: under each of the source four-phase pair matrix schedules it matches at most **14/242**, versus approximately8.34 random-match expectation. The source black checksum tape has26 zeros while p8 black target has8, so this candidate is not a literal transfer.

This retires direct Möbius cyclic or two-rune Hill consumers on these untouched original receivers. The unique reversible map remains a source-motivated **candidate** for a different keyed state or composed layer if a genuine first-party instruction names that receiver and operator. [Read-only Windows Node22 SFT](../sims/lp2_p7_p8_fixedpoint_projective_hill_original_sft.cjs) · [verified CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45048205869).

## One source-inspired two-register consumer (Agent4, 22 November, negative)

A distinct trial used the **unchanged p7 polynomial** above, the two actual p8 red-heading whole-word products as source-visible seeds `(L,R)=(4,3)`, and one small, completely fixed **hypothetical** two-register generator. For each original black rune after the 12 red p8 title runes, continue without resetting through p14:

```text
T = (L + P(R)) mod 29
(L,R) = (R,T)
plain[i] = (cipher[i] - T) mod 29
```

This is reversibly decryptable and exactly forward-reencryptable, but **the two-register update law and subtraction are an experimental choice, not printed Cicada instructions**. It was frozen before reading the original decoded language. On the **complete 1,717 unchanged p8-body plus p9–p14 runes**, decoded GP29 IoC is **0.0342957373**, with individual page values p8..p14 **[0.03302384,0.03479792,0.03381418,0.03339797,0.03527851,0.03359019,0.03188064]**. Every page remains nonlinguistic. An authentic solved-p57 plaintext plant filling all 1,717 slots, including an imposed repeated glyph, recovers 1,717/1,717 and verifies the reversible implementation. Exact [single-file Node22 original-source test](../sims/lp2_p7_original_two_state_downstream_sft.cjs) executed against canonical source bytes and passed; no Actions run is claimed.

**Decision:** Reject this one nonsecret, source-seeded two-register additive consumer as a native-GP29 decoder of p8–p14. It neither weakens the exact upstream fixed-point/derivative relation nor authenticates a Feistel/feedback architecture. A different cipher requires an independent authorial instruction selecting its update, receiver and inverse.

## Reproduction and decision

- [Windows Node22 read-only original-source SFT](../sims/lp2_p7_p8_original_red_polynomial_fixedpoint_sft.cjs), **[CI PASS, 22 Nov 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45047067228)**. Frozen output verifies all polynomial identities, p8 red runes, source-word inventory, feature and direction controls, the first/last p53 continuation, GF29² root order and all 255 p8 ciphertext runes.
- [Related earlier p7→p8 dual GF3/GF4 field and radix-source audit](lp2-p7-p8-dual-field-original-source-selector.md) establishes an alternative mechanism whose radix59 and fifth-product-as-seed choices remain unauthenticated.
- [Agent45's separate p8 original Berggren/reciprocal gate](lp2-p8-berggren-original-source-selector-gate.md) already notices the p8 whole-heading inverse12×17 and excludes its separate first-party-untethered Gaussian additive receiver. The p7 polynomial above offers a **different, earlier-page source** for the specific derivative17 and must not be confused with a proven continuation.

**Decision:** Preserve this source-local polynomial as a higher-priority operation-selector hypothesis than the GF4/radix59 byte-pad speculation. The exact all-roots and derivative correspondence supplies reproducible, independent source constraints with only one low-first product grammar among22 examined. Demand a **reversible original-cipher inverse** or an independently authored instruction before claiming any decryption or promoting the polynomial to an established cipher mechanism.
