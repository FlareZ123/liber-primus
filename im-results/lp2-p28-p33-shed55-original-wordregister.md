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

### Printed word boundaries do not carry across the 214-rune match

If shedding one edge per p28 multiword were the actual p33 transport, the resulting **59 source word units** would still have **58 interior word boundaries**. The 214-rune original p33 has **53 printed words** and **52 boundaries**. Of those 52 p33 boundaries, **only 13** fall on the shucked p28 word boundaries; a simple uniform-slot expectation is **14.16**. Thus the exact rune-length equality provides **no visible preservation of word boundaries**. Seven other source-length-compatible page pairs have boundary overlaps 7–14 and none exhibits a convincing boundary-preserving copy. Any viable p28→p33 plaintext route would have to rewrite the word boundaries, use a separate separator transducer, or regard shucked runes as a stream key rather than corresponding plaintext.

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

This excludes *any one deterministic global substitution* between the two whole aligned streams, including arbitrary secret permutations and noninvertible lookup tables, without guessing the key. Independently, the multiset gate below excludes the broader class of arbitrary **position permutations and word-break rewrites**, even after a fixed secret alphabet substitution. It **does not** exclude changing per-word/per-position keys, multiple cipher rounds, altered alignment or an authored side-information channel. Those would require independent source instructions.

## All-secret rune reordering and arbitrary space rewrites: an independent exact obstruction

**Agent8, 23 November 2026.** The original printed p28→p33 pair could in principle indicate **shedding one outer rune from each multi-rune word, followed by arbitrary reordering and new word breaks**. This is a different reversible mechanism from the eight failed direct Vigenère operations or the positionwise stationary mapping above: it grants *every one of the 214! / 211! rune position permutations* and *all possible p33 word separators*, without selecting a transposition route by decryptability. We also grant an arbitrarily unknown, but one globally fixed, 29-way rune alphabet permutation. An exact sufficient-condition invariant is still available: any such operation preserves the 29 rune-count histogram up to one permutation of its bins.

Let \(H_A\) and \(H_B\) be the 29-bin source and target rune frequencies. With GP29 glyph values fixed, the **minimum source rune substitutions required** to make any such whole-page reordering possible is \(n-\sum_i\min(H_A(i),H_B(i))\). Even allowing an entirely unknown global alphabet relabeling, the lower bound is \(n-\sum_i\min(H_A^\downarrow(i),H_B^\downarrow(i))\), where the 29 occurrence counts are independently sorted high-to-low. Sorting gives the maximum achievable multiset intersection under *any* secret alphabet permutation. A nonzero value rules out the whole family without exploring combinatorial key space or fitting to plaintext.

| Original source register and shed side | Rune count | Min changed runes, fixed GP29 alphabet | Min changed runes, arbitrary secret 29-way alphabet |
| --- | ---: | ---: | ---: |
| Original printed p28, shed **first** rune in each of 55 multiwords → full p33 | **214** | **33** | **7** |
| Original printed p28, shed **last** rune → full p33 | **214** | **38** | **17** |
| Correct GF29-Q quotient of p28, shed **first** rune → p33 quotient | **211** | **47** | **15** |
| Correct GF29-Q quotient of p28, shed **last** rune → p33 quotient | **211** | **41** | **7** |

These are **exact mathematical lower bounds** on original-value changes after allowing unrestricted position/word-break rearrangement; none is zero. A separate solved-p57 95-rune positive, passed through an arbitrary secret invertible alphabet substitution and a nontrivial global position permutation, has bound **zero**, as required. The original source's known p28/p33 Q remainders **[17,27,12]** and exact rune lengths are asserted in the same script, so this is an original-data test rather than a synthetic thought experiment. Full source-readable [SFT](../sims/lp2_p28_p33_shed55_permutation_no_go_sft.cjs), [Windows Node22 PASS 45197165593](https://github.com/FlareZ123/liber-primus/actions/runs/45197165593).

The exact same invariant was also applied **once to every original-source one-edge-shedding length-compatible pair**, rather than elevating p28→p33 merely because it had been studied most. The previously established full 55-page physical-word census fixes **exactly eight ordered pairs** before any histogram test. On all **16** original first/last-edge registers, the minimum original rune changes after granting any stationary global 29-way alphabet permutation is strictly positive:

| Printed source → original target | Shed first, min changes | Shed last, min changes |
| --- | ---: | ---: |
| p7→p15 | 10 | 8 |
| p9→p23 | 14 | 7 |
| p13→p33 | 9 | 8 |
| p25→p3 | 4 | 6 |
| p28→p33 | 7 | 17 |
| p29→p7 | 9 | 8 |
| p44→p3 | 6 | 7 |
| p47→p3 | 7 | 8 |

**None** of the eight original source-complete page pairs can be exactly obtained from its one-rune-shucked source solely by arbitrary rearrangement, rewritten punctuation and a globally fixed unknown alphabet. This 16-case exhaustive original-source extension is separately [Windows Node22 PASS 45197831742](https://github.com/FlareZ123/liber-primus/actions/runs/45197831742), using the same SFT and genuine solved-p57 synthetic positive. The smallest lower bound **4** at p25→p3 is *not* an authentic link: it is one of sixteen post-selection measurements, not a surviving zero-change inverse or a source-authored key. This exhausts the literal shed-and-reflow family without tuning cipher keys or words.

**Decision for issue #2278:** the hypothesized direct shedding→p33 *pure transposition + arbitrarily rewritten spaces*, with or without a secret stationary global alphabet permutation, is impossible on original ciphertext. Even the most favorable arrangement requires independently changed rune values at **at least 7 locations**; an author-selected changing-state cipher, homophonic mapping, another source, or a keyed receiver could overcome that bound, but the physical source gives no such instruction. This exact global-permutation family is retired, without suggesting arbitrary exceptions for those seven symbols or promoting the numerical coincidence to a decipherment.

## Judgment and next causal fork

The manuscript's solved p57 "shed circumferences" might motivate retaining word interiors, but supplies **no first/last choice**, no p28→p33 target pointer, and no instruction to combine shucked p28 with p33 before or after cubic long division. The red p39 factor and signed-DH candidate do not specify that missing operation. The new secret-permutation multiset theorem also blocks unrestricted pure shedding/reordering as a p33 source; at least seven rune values would have to change even under a wholly secret global 29-rune permutation. Recasting the failed direct options as arbitrary changing-state keys would be overfitting.

**Disposition:** close #2400's bounded typed-cipher inquiry under its stated missing-operation criterion. Preserve the exact 55-edge length match as a provisional visual register fact. Resume only when an independent first-party original source explicitly selects the edge convention, a cipher op and the p33/p28 transfer, or when a candidate correctly predicts a full untouched original paragraph and held-out region. No original unknown plaintext/key/destination recovered.

**Reproduction:** [standalone read-only CJS source test](../sims/lp2_p28_p33_shed55_source_receiver_sft.cjs) consumes the unchanged original LP2 transcription, normalized rune corpus and the source-defined Q. The test asserts the complete 55-page word matches, **eight** length-equality pairs, 269→214 and 266→211, common exact Q remainder, both full Q reconstructions, all eight direct decrypt/re-encrypt cases, four exact all-secret lookup conflicts, all eight printed-boundary controls and solved-native positive. **Windows Node22 PASS [original register run 45190278933](https://github.com/FlareZ123/liber-primus/actions/runs/45190278933)** and **[new all-secret lookup gate run 45191223186](https://github.com/FlareZ123/liber-primus/actions/runs/45191223186)**.
