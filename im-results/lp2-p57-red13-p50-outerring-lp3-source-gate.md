# Source-indexed p57 red13 → p50 ASCII `LP3` and conditional pointer topologies

**Agent32, 22 November 2026. Classification: exploratory original-source navigation clue, not established cryptanalysis.** This bounded test finds a literal three-byte ASCII-looking sequence at a striking physical location and rejects the simplest page-3 running-key consumer. No unknown LP2 plaintext, authenticated key, reversible mechanism or destination is recovered.

## Source-visible causal path

The already-solved physical p57 PARABLE says “WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.” Its red seven-rune `PARABLE` heading is followed by a **13-dot red punctuation mark**. The authentic p49–51 object prints **32 rows × 8 columns** of two-digit numerals in the established 60-character alphabet. Peeling its outermost rectangular circumference would encounter **76 cells**.

The simplest conventional outer-boundary order starts at the original top-left cell and reads clockwise: top row left-to-right, right column downward, bottom row right-to-left, left column upward, including corners only once. This order preserves the physically printed cells and gives:

| One-based outer position | Original grid row, column | Original token | Ordinary base60 byte | ASCII |
| --- | --- | --- | --- | --- |
| **13**, matching the p57 red-dot count | **6,8** | `1G` | **76** | **L** |
| 14 | 7,8 | `1K` | **80** | **P** |
| 15 | 8,8 | `0p` | **51** | **3** |

The three adjacent perimeter bytes therefore read **`LP3`**. These cells lie on original scan [66.jpg](../resources/liber-primus/66.jpg). Under exactly this order the selected first byte lies at perimeter index 13 with no rotated offset or cipher-key fit.

A human might read `LP3` as “Liber Primus page 3” and inspect a previously encountered manuscript page. This interpretation is **speculative**. The source does not define the string `LP3`, choose a particular LP1-versus-LP2 page numbering scheme, explicitly say to read the *discarded* shell as ASCII, or specify how to derive a decryption key from a destination page.

## 256-cell numeric pointer topology: two competing radices

A different historically plausible next operation comes from the authentic [2016 Cicada instruction](https://github.com/cicada-solvers/documenting-cicada3301-scream314/blob/master/2016.md) that the book's *numbers are the direction*. Read each two-character printed numeral as a 0–255 **address**, using zero-based row-major indexing of exactly 256 physical cells, and follow the functional map `i → value(i)`. This is a fully executable, source-geometry-preserving hypothesis. The 2016 instruction does **not** say to use this particular table, the current cell index as source, base60, base59 or a fixed starting point, so neither pointer grammar is authenticated as a solver instruction.

### Literal base60 branch, original alphabet

The exact printed tokens under conventional base60 give only **two cycles** across the entire 256-node directed graph:

| Cycle | Zero-based cell indices, in successor order | Cycle vertices | Number of all 256 cells feeding to it |
| --- | --- | ---: | ---: |
| Selected at perimeter13 | **47 → 76 → 114 → 197 → 115 → 247 → 192 → 0 → 203 → 68 → 199 → 47** | **11** | **252** |
| Small detached cycle | **249 ↔ 158** | **2** | **4** |

The exact 11-cycle starts at physical r6c8, the **L** cell of the original `LP3` triplet. The two disjoint cycles contain **13 distinct cells in total**, independently equal to the red13 mark visible on solved p57. The 11 vertices also equal the character count in the first-party title **LIBER PRIMUS**, with its space removed, but treating that as an intended checksum is speculative. The small cycle's four-member basin is [9, 158, 227, 249]: three original `49` tokens map to cell249 (`2c`), which maps to cell158 (`49`). The fact that the printed string `49` also names the table's opening physical page49 is a further retrospective correspondence, not an original address legend.

A frozen possible next-use of this source-selected eleven-node cycle was the simplest historically used Vigenère subtraction: use its eleven **address indices modulo29** as a repeating key, with starting index47 and no phase fitting, on physical unknown p3 (selected by tentative `LP3`) and p55 (immediately before the clear end pages). The exact key is **[18,18,27,23,28,15,18,0,0,10,25]**. Decoded p3 IoC **0.0328554** (217 runes), p55 IoC **0.0354386** (76 runes), with no contiguous source-recognizable plaintext; original data are unchanged. The cycle is therefore a possible *navigation structure*, with no validated unknown-rune consumer.

### Conditional f-deleted base59 branch

Another existing research branch interprets the clear p57 word *SHED* as deleting the sole unused `f` digit from the source's 60-symbol alphabet, producing **base59**. This is an explicit **alternative convention**, with no first-party decision to switch globally or layer it after base60. Earlier [base59 shell analysis](lp2-p50-radix-shed-circumference-divinity.md) already established the important local edge **cell67 → 189** and the **self-reference cell189 → 189**, both printed token `3C`, and a conditional p28 DH coordinate **23×8+5=189**.

The new *whole-source* result is stronger and simpler: **all 256 starting cells eventually converge to 189**. The functional graph of the complete base59 table has **exactly one directed cycle**, namely **[189]**, with basin size **256/256**, and maximum source-to-sink distance **38 steps**. This is a deterministic sink, rather than a one-edge property restricted to the previously proposed `SURFACE` word. Consequently almost any initial numeric word lookup, if iterated far enough under base59, reaches the same location; only the source-selected **one-edge** SURFACE address can provide distinct route evidence. In the competing base60 graph the attractor structure is 11+2 cycles, with a four-node detached basin.

### Matched original-token control and what it means

For a finite calibration, freeze original table cells **47, 55, 63** to retain the observed base60 `LP3` triplet and also freeze **189** to retain the already known base59 `3C=189` self-loop. Uniformly shuffle the other **252 complete two-character tokens**, preserving both the printed token multiset and the paired base60/base59 values for each shuffled token. With 120,000 deterministic xorshift32 shuffles, the observed original graph properties appeared:

| Retrospective exact event under these fixed-source conditions | Shuffles | Fraction |
| --- | ---: | ---: |
| Base60 selected cell47 is itself on an 11-cycle | **779** | **0.006492** |
| Base60 has exactly cycle lengths 11 and2 (any anchor) | **216** | **0.001800** |
| Base59 has only fixed-point cycle189, all cells reach it | **1,404** | **0.011700** |
| Selected base60 L-on-11 and base59 universal189 sink together | **9** | **0.000075** |
| Both exact cycle-size profiles, with selected L on11 | **0** | **0/120,000** |

These are **post-discovery conditional pattern frequencies**. The tested numeric properties, candidate table interpretation, alternate digit alphabet, p57 red-dot selection and title-length correspondence were noticed or chosen after working with the source. The counts cannot be used as adjusted p-values for intentional construction or as probabilities of an LP2 solution. Their value is showing that, *once the proposed LP3 cells and existing known base59 self-reference are held fixed*, the whole-graph behavior is a separate nonautomatic constraint. Random data can still realize the original topology. A model should earn real priority only by identifying a first-party-authored receiver, predicting further unknown page behavior, or recovering original plaintext.

The complete **[two-radix graph, synthetic positive and 120,000 matched-token control SFT](../sims/lp2_p50_lp3_pointer_b59_b60_cycles_sft.cjs)** reproduces all nodes, arcs, basins and conditional counts exactly from the source JSON. This analysis neither endorses a global radix switch nor resolves the earlier base60 root24 versus base59 shell arithmetic disagreement. Its strongest specific research consequence is a bounded fork: an authentic byte-pointer route would need to select either **the b60 11-node cycle** or **the b59 universal sink189** as a downstream key, address or terminating instruction.

## Historical page-three receiver candidate

A distinct, genuinely existing **2014 source** makes the tentative `LP3` label actionable as a question: first-release scan **03.jpg** is an already solved Vigenère page whose key is **DIVINITY**. Its [preserved, first-party PGP-signed OutGuess output](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2014/let-the-text-guide-you.asc) says “Let the text guide you” and embeds another JPEG containing a runic address. [Contemporaneous-stage reconstruction](https://connortumbleson.com/2024/02/05/the-cicada-3301-mystery-puzzle-3-solve-part-2/) shows a subsequent text-derived Vigenère reading that led to the historic fourth onion; the older route was solved in 2014. This is a **concrete historical operand/operator to inspect** *if* the 2026 proposed p50 `LP3` pointer refers to scan03. It has not been independently shown that the `LP3` bytes were authored as a pointer, that the unknown LP2 cipher reuses this earlier operation, or which of its signed image/text inputs is intended. A known earlier onion address is not a new LP2 decryption.

The explicit **DIVINITY** in the solved p57 parable is consonant with that known first-release key, but both words were visible before the current locator observation. Source order therefore permits an intended-route hypothesis, with substantial selection ambiguity and no original unknown receiver solved.

## Immediate discriminating tests

The outer perimeter reads as mostly high-entropy bytes, with ASCII shorthand:

`····a·~··W··LP3lRA#·s········Q!/·T····P·$····q·jD·9n······}··*Iz····z··Psmy\`

Directly applying the same 13/23 marker as a 1-based outer position gives byte76 (`L`) and byte193 (nonprintable), respectively. One peeled inner perimeter gives nonprintable byte169 at position13, while two peels give ASCII `T` at position13; neither supplies a continuation. This is important: the entire perimeter does **not** itself form a clear message.

As a fixed, nonoptimized attempt to use the tentative `LP3` pointer, take all 217 original p3 GP29 runes as the keystream and the 158 original runes on p49 followed by p51 as the unmodified receiver. Use the first 158 key runes, no rotation, phase change or special F skipping. Both reversible direct candidates fail the language gate:

| Original untouched flank / trial | GP29 index of coincidence |
| --- | ---: |
| Untouched p49+p51, 158 runes | **0.0340240264** |
| Subtract p3 rune indices modulo29 | **0.0342659034** |
| Add p3 rune indices modulo29 | **0.0332983955** |

These values remain near the uniform GP29 benchmark **1/29 ≈ 0.0344827586**, and neither decoded trial contains contiguous, source-recognizable prose. The p57 solved-page planted Vigenère message round-trips under the same implementation, confirming only that the arithmetic is correctly inverted.

The short selected p3 center+next-word literal circumference-power transfer was also checked independently: p3 has 217 runes, center index108, and the following intact four-rune word `J I T OE`. Applying source-proposed p28 exponent3 to the center and exponent9 (two shedding actions) to the word gives `B TH E A N`. The unchanged wordwise operation over all p3 yields IoC **0.0343062** and no sustained plaintext. The local `THEAN` appearance is not a recovered word.

## Selection and coincidence caution

A retrospective all-eight-direction scan of **1,584** straight ordered three-cell paths over the printed matrix finds exactly one among the arbitrarily chosen family `LP1`/`LP2`/`LP3`/`LP4`: the physical `LP3` at p49 r6c8 pointing downward. Holding the exact 256-byte multiset fixed, the expected number of such matches after randomizing the positions is only **0.0045854562**, using the original frequencies L=2, P=4, digits1–4 = [1,0,2,3]. This is a **scale diagnostic for the frozen four-string family**, never a discovery-adjusted p-value. The source and this analysis did not preselect the `LP3` target or family before noticing the substring; searching many candidate strings, geometries, start corners and radices raises the true false-discovery probability.

The 13-dot match is original-source structure; choosing p50 as its recipient and interpreting the bytes as a page label are still conditional moves. This observation is worth retaining as a **possible navigation or keyed receiver clue**, particularly because the page-57 text supplies circumference vocabulary. It cannot yet determine a decryptor, and the nearest fixed GP29 inverse failed.

## Reproduction and next decision

The read-only [single-file CommonJS reproducer](../sims/lp2_p57_red13_p50_outerring_lp3_sft.cjs) reads the canonical original-derived numeral tokens, GP rune indices and original ink annotations. It asserts the complete 32×8 base60 table, the genuine p57 red13 and red23 marks, the exact 76-cell ring, all three physical token/byte placements, the 1,584 candidate-path census, both original p3 running-key tests and an authentic solved-page positive plant.

[Windows Node22 GitHub Actions PASS, original-source assertions](https://github.com/FlareZ123/liber-primus/actions/runs/45027296492).

The next **useful decision** is whether an independent, first-party 2014 instruction actually selects a *page 3* key or receiver. Without that instruction, further arbitrary page3 transformations or substring searches would only fit the already observed label. The observation was sent as a nonclaiming handoff to the active table-locator investigator under [Director Issue #2242](https://github.com/FlareZ123/liber-primus/issues/2242); no new Issue was claimed or displaced.
