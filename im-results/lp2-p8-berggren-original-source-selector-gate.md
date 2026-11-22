# P8 Pythagorean/Berggren-tree proposal: original-source selector gate

**Decision (22 November 2026, Agent 2; Director #2297):** The 243-black-rune count makes a depth-five ternary-tree model arithmetically possible, but **no original illustration or authenticated instruction selects one 243-rune value sequence or a reversible cipher operation**. The proposed 3–4–5 roots depend on taking a five-rune *page fragment* from p9; the authentic six-rune complete word crossing p8→p9 instead has GP29 product **2**. This does not disprove an intentionally segmented 3–4–5 mnemonic, but it makes the segment-extraction rule an extra, unprovided instruction. No unknown LP2 plaintext, authentic key, or historical inverse is established.

## Exact original operands, with scope

The authoritative page mapping is resources/liber-primus/README.md: physical LP2 p8 is original 25.jpg, p9 is 26.jpg, p10 is 27.jpg. The source registers are resources/liber-primus/lp2-corpus.json, lp2-transcription.txt, and lp2-ink-annotations.json.

- P8 prints 255 GP29 runes. Its red 12-rune heading contains **two complete printed words** of 4 and 8 runes: GP0 [14,10,14,19] and [1,14,19,5,2,13,3,17]. Their products modulo29 are respectively **4** and **3**. The 243 black runes include the last black p8 rune **EO** (GP0=12).
- The original page boundary is the printed tail ᛇ/ followed by a page separator and ᚣᚹᚫᚷᛄ. There is **no word separator** between the last p8 rune and the five p9 runes. The five p9-only runes have GP0 [26,7,25,6,11], product **5**. The authentic *whole six-rune word* has GP0 [12,26,7,25,6,11], product **2**. These are two distinguishable operands and must not be conflated.
- Another exact link exists: 4×3 mod29 = 12, the carried rune's GP0. Because the inverse of 12 is 17 modulo29, 2×17 mod29=5. Thus the 3–4–5 reading is equivalent to dividing the complete-word product2 by the carried GP12, an operation not explicitly stated by the original printing. A solver must choose fragment extraction over the printed whole-word grammar. **Relevant independent numeric echo:** the original last complete red word on preceding p7 is ᚷᛠᛗ, GP0 [6,28,19], whose product is **2**. The authentic six-rune p8→p9 word product2 therefore also matches the p7 terminal red-word product2 and the *already-known* 2013 DH shared K2; the separated page9 fragment product5 instead resembles the historical DH generator g5. This is a potentially useful source-local pair of interpretations, reported nonclaimingly in [#2267](https://github.com/FlareZ123/liber-primus/issues/2267). Both matches are retrospective; neither alone selects a decryption operation or establishes which reading the creator intended.
- At depth five, each ternary Berggren-tree parent has three primitive Pythagorean children, so 3⁵=243, matching the source black-rune count. This is a **matching count**, not a decipherment. The red heading count12 and carried GP12 also match the triangle's perimeter 3+4+5=12 after this choice of reading.

The historical Berggren/Barning/Hall matrices on (3,4,5) produce the first-level triples (5,12,13), (21,20,29), (15,8,17). Even granting this unprinted program, **the manuscript does not place the three matrix operations into one uniquely readable child order**. All six possible global orders produce 243 valid, distinct depth-five triples, with six **different** ordered 243-symbol streams when their hypotenuses are reduced modulo29. This is an explicit branch-order ambiguity, independent of language scores. Choosing either leg, perimeter, full-triple serialization, forward/reverse order, or feedback adds further options. The illustration specifies none of them.

## Exact original-cipher obstruction to direct 243-leaf symbol readout

The ambiguity can be narrowed further **without a guessed GP29 alphabet or reading order**. A direct reading of one Berggren numeric leaf coordinate as one p8 black rune, even if both 29-symbol alphabets are related by an **arbitrary secret 29! permutation**, must preserve the sorted 29-class symbol-frequency histogram. Permuting all 243 leaf positions, reversing the traversal, or choosing any of the six globally ordered Berggren child permutations does not change this condition.

For the **exact original 243 p8 black runes** (including the final carried EO/GP12), sorted frequency bins begin **[15,14,12,12,11,11,10,10,...]**. The fully enumerated standard depth-five primitive Berggren leaves have these first sorted-bin counts when the indicated numeric output is reduced modulo29:

| Leaf output | First sorted GP29 frequency bins | Direct original p8 readout under any secret fixed rune alphabet? |
| --- | --- | --- |
| First leg a | [20,11,11,11,11,10,...] | Impossible |
| Second leg b | [13,13,13,11,11,10,...] | Impossible |
| Hypotenuse c | [15,15,12,12,11,10,...] | Impossible |
| Perimeter a+b+c | [19,14,12,12,11,11,...] | Impossible |

The exhaustive 29-bin comparisons fail for every candidate. For the closest hypotenuse candidate, two bins each contain 15 leaves while the original has only one 15-count bin and one 14-count bin. **No secret substitution, stem-side order, global branch ordering, or permutation of all243 positions can repair this exact multiset mismatch.** This is stronger than having to guess which of six orders was intended and directly excludes treating those simple leaf quantities as the original p8 ciphertext under a single value-labeling alphabet. It does **not** exclude using the leaves as an evolving **key**, applying an additional value-changing cipher after leaf generation, choosing a different coordinate function, or encoding a 243-rune intermediate that need not equal the p8 black glyphs. Those possibilities still lack an authored selector.

The original-source SFT now asserts all four no-monoalphabetic-inverse gates as strict inequalities, alongside the whole-word and branch-order checks.

## Original image and historical-operation decision

Original p8 25.jpg and p10 27.jpg show the same irregular, naturalistic botanical stem reused beside the prose, rather than a five-tier regular ternary graph with 243 individually displayed leaves. In 25.jpg a large red initial ᛉ/X resembles a three-pronged fork, but is also the first canonical red rune (GP0=14), not a separately drawn cipher operator. There are no matrix labels, distinct leaf numbers, branch reading arrows, or marked depth-five paths. This comparison agrees with the independently established repeated stem and page-parity evidence in [closed #2294](https://github.com/FlareZ123/liber-primus/issues/2294) and its [bitmap report](../im-results/lp2-p8-p14-stem-side-parity-source-gate.md). The artwork could still allude to trees, but it does not physically encode a uniquely ordered Berggren key.

Prior [#2267 source decisions](https://github.com/FlareZ123/liber-primus/issues/2267) already tested direct Berggren hypotenuse/perimeter additive keys on untouched p8/p9–14, along with strict transparent-F and related feedback receivers; none recovered plaintext. Do **not** rerun or tune these rejected families using free branch, phase, sign, orientation, output or reset choices. The p8→p9 arithmetic also retrospectively echoes an already-known 2013 DH tuple, but supplies no original GP29 key schedule.

Any future ternary-tree cipher proposal needs a first-party visible instruction fixing **all** of: (1) five-rune fragment rather than six-rune whole word, (2) ordered child operations, (3) exact GP29-changing output and key/state law, (4) genuine p8→p9 carry preservation, and (5) one independently untouched original receiver yielding continuous linguistic plaintext. Reencryption alone cannot distinguish wrong bijective keys.

## Reproducible computation and disposition

[Read-only Windows11/Node22 CommonJS SFT](../sims/lp2_p8_berggren_source_selector_sft.cjs) reads the canonical GP29 indices, ink, and page-break printing; asserts both authentic word-product interpretations; generates all six branch-ordered depth-five Berggren trees; verifies their Pythagorean identities and cardinality; and asserts six distinct 243-rune GP29 hypotenuse sequences. It performs no plaintext optimization.

**Research disposition:** Retire the Berggren leaf streams as a *currently untyped* hypothetical key. The missing causal input is an authored output/branch-order/receiver instruction. Reopen only if independent evidence supplies that operation or a long authentic plaintext. The nearby scroll-to-p8 HEX differential has a separate investigation [#2296](https://github.com/FlareZ123/liber-primus/issues/2296) and cannot be layered onto an unselected ternary key.
