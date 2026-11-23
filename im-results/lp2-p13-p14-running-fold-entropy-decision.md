# P13→p14 FOLD: one source-frozen moving inverse and the missing-information boundary

**Agent21 · 23 November 2026 · Director issue #2367.** Classification: bounded negative original-cipher test and information-theoretic architectural decision. **No authentic unknown LP2 plaintext, key, or creator-selected decoder was recovered.** This is not a second stationary folded-pair test, a generic key sweep, or an endorsement of the F-skip hypothesis.

## An executable, physically defined input

Original LP2 p13 (`30.jpg`) has twelve full printed lines of GP29 rune lengths

`[24,21,23,23,22,23 | 22,25,21,22,22,24]`.

The first and second groups each contain 136 runes. Folding the physical page across the six-line boundary superposes lines 1/12, 2/11, 3/10, 4/9, 5/8 and 6/7, aligning same-column runes. It gives **132 overlapping GP29 pairs, four upper and four lower overhang runes**: top `WAFX`, bottom `FJEI`. These are exact original-source inputs, not keys found by language fitting. The mirrored tree occupies facing margins on p13/p14; previous page p12 also has the left-side tree, so the apparent fold need not be instructional. P14 (`31.jpg`) contains 137 runes and the exact whole second transliterated GP word `FOLD` at rune offsets 2–5 (0-based); its initial `F` is GP0 and leaves 136 runes if bypassed.

Earlier independent work is **not duplicated here**: [#2342 physical stationary equality obstruction](lp2-p13-p14-physical-line-fold-keyless-decision.md), [40 frozen additive/prime-value flat fold keys](lp2-p13-p14-foldline-Fskip-source.md), and [flat/physical reusable-pad cancellation versus native word constraints](lp2-p13-p14-fold136-allsecret-wordtree.md). Their original negative results and limits remain intact.

## Exactly one nonstationary original-cipher receiver

We freeze a plain, human-recognizable *running modular sum* as the missing state update, with no unknown parameter. This is a **hypothesis**, not an authenticated Cicada instruction. It exercises a truly nonstationary architecture without fitting its transition to p14.

For each top line `r=0..5` and column `c`, pair top `a` with the same-column bottom `b` from line `11-r`; when the top line extends beyond the lower, take `b=0` as the neutral additive identity. Read the 136 top positions line-by-line, with no key reset within the page. Initialize `K[-1]=0` and compute

`K[i]=(K[i-1]+a[i]+b[i]) mod 29`.

For all printed p14 ciphertext runes except the literal original `F` at offset 2, in original order, decipher

`P[i]=(C[i]-K[i]) mod 29`.

For completeness, the paired forward operation is `C[i]=(P[i]+K[i]) mod29`, with the bypassed `F` reinserted at exact original offset2. This maps **all 137 original p14 runes** to a full 137-rune output and back. It takes the entire original p13 as a **retained known key object**, and does not purport to compress p13 itself. It consumes all 136 upper runes plus 132 lower runes; the four unmatched lower runes are genuinely unused by this convention, a visible underspecification. This single fixed convention is not a family-optimized best result.

### Original receiver result

| Diagnostic | Measured on original input |
| --- | ---: |
| Original p14 non-F ciphertext, GP29 IoC | 0.03420479302832244 |
| Running-fold candidate p14 non-F plaintext, GP29 IoC | **0.03398692810457516** |
| Independent authentic solved p57 original plaintext, GP29 IoC | **0.06270996640537514** |
| Original 137/137 forward reconstruction | **exact** |
| Authentic p57 forward plant/inverse under same first 95 key positions | **exact** |

The first 60 candidate symbols, separated to avoid GP multigraph ambiguity, are
`N EA NG W E TH A IA EA F C H OE E EA D O TH O L H EO TH I L I TH I R NG OE I D X U C N AE C B U X P OE F H E G EO I A U R U O D L F D P`.

They are not a recognizable sentence or instruction, and the rune collision rate stays at near-uniform ciphertext levels instead of authentic GP-native text. Forward reencryption tests **implementation correctness only**: every key in a true additive bijection will round-trip. The authentic p57 plant is likewise an implementation control, not proof that the original p14 used this cipher. No withheld next-page original receiver was tested because adjacent p15 has 159 runes, a different illustrated chapter and no source-defined 136-slot coupling; inventing a reset or truncate rule would make that a postselected test.

## The two incompatible meanings of “lossless fold”

1. **Standalone p13→p14 compression/reconstruction.** A general invertible mapping of arbitrary 272-rune GP29 p13 inputs to 137-rune GP29 p14 outputs is **impossible** with no other input. The source space has `29^272` possibilities, the target only `29^137`. A lossless encoder therefore needs at least **135 additional independent base29 digits** outside p14 (136 if the F slot is required to stay constant). Nonstationary updates, variable traversal and a 29-state register do not change this cardinality. The eight p13 physical overhang glyphs are **not independent external side information**, and thus do not close the missing capacity. This bound does not assert the actual fixed p13 text is incompressible under all dictionaries; a fixed literal can always be hardcoded, which is not an authored reversible rule.

2. **P14 ciphertext decryption using p13 retained as key.** An ordinary bijective running-key operation can use all of p13 as an external key and transform the 137 p14 runes reversibly with no compression. The test above instantiates one such architecture. But `FOLD`, the diagrams, source layout, and prior solved-page precedent do **not uniquely select** the modular sum rather than a difference, an interleave, a read direction, one of many state updates, the unused lower overhang handling, or the cross-page F bypass. That unresolved **author-visible operation selector** is exactly what is missing.

## Decision and re-entry condition

Close this one narrow test as **negative/no-selector**. Original geometry supports a possible physical fold; the hypothesized cumulative rule recovers no plausible unknown plaintext. Do not turn the direct p13→p14 cardinality impossibility into an objection to using *p13 as an existing key*: they are distinct claims. Another nonstationary decoder should only be attempted if a first-party source identifies **its combining rule, state initialization, treatment of overhangs, and p14 alignment** before the ciphertext is judged. Otherwise additional tuned fold formulas can reproduce any original input with sufficient private state and cannot identify a historical cipher.

**Reproducer:** [`sims/lp2_p13_p14_running_fold_original_sft.cjs`](../sims/lp2_p13_p14_running_fold_original_sft.cjs), source-attached to `resources/liber-primus/lp2-corpus.json` and original `lp2-transcription.txt`; checks image-audited line lengths, physical overhang, full original reconstruction, native p57 plant, and both reported IoC values.
