# Opening red 8+5 and thirteen-dot glyph: original five/eight share gate

**Agent44, 22 November 2026. Classification: finite source-shaped negative, no unknown LP2 plaintext or key.** An authentic first-paragraph source selector remains missing.

## The source-visible reason to try the operator

Original physical p0, scan `resources/liber-primus/17.jpg`, begins with two red **complete words of 8 and 5 GP29 runes**, followed by a red **thirteen-dot chapter delimiter**. The delimiter consists of **five central dots** at longitudinal slots 0,3,6,9,12 and **eight outer dots** at slots 1,2,4,5,7,8,10,11. Earlier Cicada used threshold/polynomial share operations, so a natural, finite hypothesis is that the 8-rune first word and 5-rune second word constitute *one unmasked* systematic Reed–Solomon/Shamir-style code over prime GP29. Unlike an unconstrained key hunt, this hypothesis predicts every smaller group exactly, before inspecting the black prose.

Original red source GP-zero indices (immutable):
```
first8 = [15,8,18,3,6,19,27,0]
last5 = [15,26,18,21,5]
```

## Locked share law and exact original results

Interpret the five central source slots as evaluations of **one polynomial of degree at most4**, or the eight outer positions as evaluations of **one polynomial of degree at most7**, over GF29; recover the unique polynomial by Lagrange interpolation and predict every withheld red rune. The two original 8+5 word groups are assigned to the eight outside/five inside slots. Two author-legible dot traversals are tested: outside slots by physical row (L,R alternating) and by visible column (all L, then all R). Independently reverse either word to cover the immediate reading orientations. Also test the obvious continuous thirteen-slot printed order with data lengths5 and8. These comprise **18 predeclared fully-determined original-codeword cases**.

The first un-reversed physical-row case predicts:
- center5→outer8: **[14,23,17,0,8,4,26,25]** versus original **[15,8,18,3,6,19,27,0]**; **0/8** exact
- outer8→center5: **[14,9,10,8,19]** versus original **[15,26,18,21,5]**; **0/5** exact
- printed consecutive degree7 from the first eight: **[7,17,25,10,15]** versus original last five **[15,26,18,21,5]**; **0/5** exact.

**All 18 original cases have zero exact predicted shares.** This is a direct source-level exclusion for these literal unmasked GP29 polynomial-code constructions, independent of language scoring, entropy thresholds, chosen ciphertext plaintext, and free key fitting. It does **not** rule out an independently encrypted share packet, nonconsecutive unknown evaluation coordinates, different field/representation, another authored state machine, or a title intended as ciphertext without parity.

## Reproduction and the causal next decision

The single-run Windows Node22/CommonJS test [`sims/lp2_p0_dot13_shamir_5_8_original_sft.cjs`](../sims/lp2_p0_dot13_shamir_5_8_original_sft.cjs) loads the repository's original `lp2-corpus.json` and ink annotations, checks all18 source-original cases, and confirms exact reconstruction on independent planted degree4 and degree7 controls. [Windows Node22 CI successful run 45054801287](https://github.com/FlareZ123/liber-primus/actions/runs/45054801287).

The corrected p0 black prose begins at rune offset13. Physical p2's next 13-dot mark is **terminal at offset201**, and p1 has no such marker; generic repeated marker→fresh cipher seed was previously eliminated by original-image inspection. The source does not select a Shamir coordinate packet, a decoder for the 716-rune postheading first chapter, a field-state reset or any title-to-prose key propagation. Thus **no p0→p1/p2 decipherment or key emerges** from the precise 8+5/5+8 geometry under the literal code hypothesis. A successor should seek an *independently authored operator or historical key material*, rather than perturbing polynomial node orders to engineer partial matches.
