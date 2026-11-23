# Physical LP2 p28→p33: exact 55-word-edge / cubic-quotient register alignment

**Agent50, 23 November 2026.** New reproducible original-ink length relationship; eight frozen original inverse consumers fail to yield plaintext. This is a *candidate receiver layout*, with no authenticated original p28→p33 operation or decryption. Applies to Director [#2400](https://github.com/FlareZ123/liber-primus/issues/2400).

## Independent original typography fixes the required deletion count

The untouched physical p28 (source scan 45.jpg) has **269 GP29 runes** in **59 printed words**. Exactly **55** words contain more than one rune, and **four** are single-rune words. Retaining the singleton words and *shedding precisely one initial or final rune from each multi-rune word* therefore yields **269−55=214 GP29 runes**, matching the complete **214-rune** original physical p33 (scan 50.jpg). No synthetic word segmentation, length adjustment or inferred plaintext is involved.

The original p39-derived cubic **Q(X)=[15,18,12,6]** has already been observed to give the same three-coefficient original remainder **[17,27,12]** on p28 and p33, unique among distinct original pages. Their exact GF29 quotients have lengths **266** and **211**. Removing the three original p28 terminal polynomial remainder positions from its *final printed eight-rune word* leaves **55** multi-rune words unchanged; one edge per multi-rune word now yields **266−55=211**, exactly the transformed p33 quotient length. This is a second exact geometric alignment conditional on Q and the choice to inherit p28's printed words after GF29 polynomial division.

Do not mistake this quotient alignment for an independently decrypted fact. Polynomial division by Q transforms every rune upstream of the end. The 266 quotient values differ from the first 266 original p28 glyphs; the SFT properly repackets the *actual quotient* using the p28 printed word lengths with the last word shortened three. The present proposal also requires author-selected first-versus-last edge, p28/p33 order, and cipher.

## Original manuscript-wide controls

The whole-book 55-rune-bearing-page physical census permits **eight** ordered source→target page pairs with this exact one-edge-per-multiword length equation, out of 55×54 candidate distinct pairs:

```
p7→p15, p9→p23, p13→p33, p25→p3,
p28→p33, p29→p7, p44→p3, p47→p3
```

The earlier tentative p53→p22 match disappears when correctly accounting for the omitted runeless physical p50 in the transcript's segment numbering. Every corrected transcript word sequence is compared exactly to its original `lp2-corpus.json` rune list; there are no mismatches. The match is selective but **not unique**, and the prior p28/p33 Q association was discovered after multiple earlier hypotheses. This is useful geometric evidence for inspecting the named pair, not a calibrated postselection probability or an authenticated key.

## One fixed reversible receiver family on untouched ciphertext

Consider the smallest complete reading: use the **214 p28 retained original runes** as the key, and decrypt the full **214 original p33 runes** with ordinary GF29 addition or subtraction (both signs). Repeat on the *actual* Q-divided p28/p33 quotients at 211 symbols, retaining one edge from each multi-rune printed word in the quotient register. These are **eight** frozen cases: raw/quotient × first/last edge × ±. Every one perfectly re-encrypts its unchanged source, and a 95-rune authentic solved-p57 native control plants/retrieves correctly. No key phase, page reorder or fitted secret was permitted.

| Cipher register | Retained p28 edge | GF29 sign | Output symbols | Original decoded GP29 IoC |
| --- | --- | ---: | ---: | ---: |
| Raw original | First | − | 214 | 0.0365933921 |
| Raw original | First | + | 214 | 0.0339607740 |
| Raw original | Last | − | 214 | 0.0340046510 |
| Raw original | Last | + | 214 | 0.0342240358 |
| Actual Q quotient | First | − | 211 | 0.0342586324 |
| Actual Q quotient | First | + | 211 | 0.0342586324 |
| Actual Q quotient | Last | − | 211 | 0.0356127285 |
| Actual Q quotient | Last | + | 211 | 0.0337169939 |

All eight source outputs remain near the random GP29 baseline **1/29 ≈ 0.03448276**. None gives sustained coherent native plaintext; isolated short words in rendered transliteration are chance. The exact first 65 outputs of all eight are preserved in the test's deterministic output.

## All-secret stationary mapping is now eliminated for the exact four register alignments

The direct eight Vigenère gates leave the possibility of a stationary but completely secret nonlinear mapping from the p28 retained rune to its aligned p33 rune. That hypothesis has an **exact, key-independent contradiction**: a deterministic 29-symbol lookup cannot assign two different outputs to the same input.

Both raw edge choices use **all 29** possible input GP29 glyphs. For raw first edge, 198 *distinct input/output rune pairs* occur among 214 aligned positions, with **29/29 input symbols taking multiple incompatible output values**. Raw last edge has 195 distinct pairs, also **29/29 conflicting inputs**. The exact-Q quotient first and last gates have **183 and 186** distinct pairs among 211 positions; **28/29 and 29/29** source symbols have conflicting outputs. All four orientations also have 29/29 conflicting output symbols in the reverse direction.

This excludes *any one deterministic global substitution* between the two whole aligned streams, including arbitrary secret permutations and noninvertible lookup tables, without guessing the key. It **does not** exclude changing per-word/per-position keys, multiple cipher rounds, altered alignment or an authored side-information channel. Those would require independent source instructions.

## Judgment and next causal fork

The manuscript's solved p57 "shed circumferences" might motivate retaining word interiors, but supplies **no first/last choice**, no p28→p33 target pointer, and no instruction to combine shucked p28 with p33 before or after cubic long division. The red p39 factor and signed-DH candidate do not specify that missing operation. Recasting the eight failed direct options as an arbitrary 214-symbol keystream would be overfitting.

**Disposition:** close #2400's bounded typed-cipher inquiry under its stated missing-operation criterion. Preserve the exact 55-edge length match as a provisional visual register fact. Resume only when an independent first-party original source explicitly selects the edge convention, a cipher op and the p33/p28 transfer, or when a candidate correctly predicts a full untouched original paragraph and held-out region. No original unknown plaintext/key/destination recovered.

**Reproduction:** [standalone read-only CJS source test](../sims/lp2_p28_p33_shed55_source_receiver_sft.cjs) consumes the unchanged original LP2 transcription, normalized rune corpus and the source-defined Q. The test asserts the complete 55-page word matches, **eight** length-equality pairs, 269→214 and 266→211, common exact Q remainder, both full Q reconstructions, all eight direct decrypt/re-encrypt cases, four exact all-secret lookup conflicts and solved-native positive. **Windows Node22 PASS [run 45190278933](https://github.com/FlareZ123/liber-primus/actions/runs/45190278933)**.
