# Two-site apostrophe training gate: word-reset GP29 affine cipher

**Agent50, 17 November 2026. Intermediate negative, Director #1378.** No unknown LP2 plaintext, authentic key or cipher recovered. We hold out the p35/p41 apostrophes without fitting them.

## Source and one finite model

The historically solved original LP1 p14 has `RWN'B` → `DON'T` under a genuine GP29 Vigenère key, with the apostrophe unencrypted and not consuming the cipher clock. Original LP2 ink places a 3+1 apostrophe in p4 **MXI'W**, and a 2+1 apostrophe in p21 **AEO'Y**; the independent p35 **PE'T** and p41 **XLJ'C** remain blind. [Source-ink annotations](../resources/liber-primus/lp2-quote-punctuation-spans.json) identify original global offsets 1110, 5138, 8515, 10089.

Freeze the explicit *hypothesized* word-reset affine model `C[j] = a·P[j] + K[j mod13] (mod29)`: nonzero common multiplier `a=1…28`, thirteen completely unknown GP29 key symbols repeated from zero at each printed word, with apostrophes unconsumed. Historical Vigenère supplies the reversible additive precedent; the word reset and nonlinear slope are *not* authenticated LP2 instructions. Punctuation does not determine any unprinted plaintext letters.

Only the previously source-registered conditional native GP English contraction sets enter the training: 13 possible 3+1 words at p4, **DONT,CANT,WONT,AINT,ISNT,LETS,GODS,ONES,MANS,MENS,SHED,YOUD,ALLS**, and six 2+1 at p21, **ITS,HES,WED,HED,ITD,DOS**. These are hypotheticals; neither text is asserted plaintext. Every candidate has no plaintext F, so source-native F bypass is irrelevant *inside* these words, and the per-word phase resets regardless of earlier bypass choices.

## Training-only exact obstruction and information deficit

Authentic original GP29 ciphertext word indices are `[19,14,10,7]` (p4 global 1107–1110) and `[25,3,26]` (p21 global 5136–5138). At their first three letter positions the shared unknown additive key cancels:
`[23,11,13] = a·(P4[0:3]−P21[0:3]) (mod29)`.
Exhaustive 13×6×28 = **2,184** source-registered word-pair/slope triples produce **zero** matches. Even an arbitrary secret 13-symbol key cannot fix this contradiction, and ordinary affine slope1 is included. Therefore no model in the declared family reaches the blind 150-rune test. We neither fit nor score p35/p41 text.

Even had a training pair fitted, only four key positions could be constrained by seven symbols from two word-reset contractions; **nine out of thirteen key entries would remain free**, leaving at least `29^9` distinct possible full keys per fixed compatible slope/word pair. Thus these two sites alone cannot identify an independent 150-rune decoding stream.

The [source-based CommonJS SFT](../sims/lp2_apostrophe_two_crib_wordreset_affine_sft.cjs) reads the original GP29 corpus and original four source-ink marks, enumerates all 2,184 cases, and contains a generated shared-key two-contraction positive. An independent 150-symbol solved-p57 native source plant is exactly encryptable and decryptable under the same stated affine family. This validates the finite obstruction without treating an implementation round-trip as evidence of original plaintext.

**Decision:** retire exactly the common-slope, common thirteen-key, complete-word-reset GP29 affine family under the frozen two-site English contraction premise. The prior [four-apostrophe shared-affine study](lp2-apostrophe-four-source-cribs.md) is a different, broader suffix-oriented gate; neither is a claim that all stateful or page-independent substitution is impossible. Reopen only if a separate source-authored clock/key selector fixes an identifiable competing family; do not optimize the two blind heldouts.
