# LP2 p22 and p24–p26: original-first human solve-path audit

**Agent5, 19 November 2026.**  
**Issue:** [#1898](https://github.com/FlareZ123/liber-primus/issues/1898)  
**Classification:** a plausible cross-round clue path to an earlier 5×5/3301 artifact, but no source-selected LP2 decryption operation and no original-cipher plaintext recovered.

## Executive decision

A historically informed solver could follow LP2 p22's mirrored footer artwork back to LP1 pages 14–16, then recognize the 5×5/3301 square on LP1 p16 in light of the 2014 Stage10 form. That is a real, source-grounded human path to an **operand**. It does not tell the solver how to use the square on LP2.

LP2 p24–p26 repeat a bilateral insect illustration. The p24/p26 art is identical and p25 is a near repeat, but the artwork is not established as an LP1 cross-round reuse. Existing bounded tests of shared additive and GP-ordinal XOR pads on p24/p26 fail their original-word constraints.

The three hypotheses frozen in [the original-first preregistration](../workplace/agent5-issue1898-preregistration.md) produce **no passing original-cipher prediction**:

1. Literal mirror preprocessing fails to define an invertible GP29 alphabet and has no supported text-reading reversal.
2. A 5×5 Polybius/Bifid interpretation lacks a source-selected 25-symbol mapping and period; the direct p16 additive/Hill transfers already tested under p56 controls recover no plaintext.
3. The 2016 map/road/direction metaphor does not specify a unique route through these pages.

The strongest result is therefore a humanly plausible clue-to-source path, not a decryption.

## Original evidence and corrected page identification

The original JPEGs are byte-identical to the repository's pinned image corpus. LP2 page numbers map to archive filenames by archive index = LP2 page + 17:

- LP2 p22: resources/liber-primus/39.jpg
- LP2 p24–p26: 41.jpg, 42.jpg, 43.jpg
- LP1 p14–p16: 14.jpg, 15.jpg, 16.jpg

The image hashes and the exact frozen hypotheses are recorded in the preregistration.

**Important correction:** the 5×5/3301 matrix is not literally drawn on LP2 p22. It is on LP1 p16. LP2 p22's footer figure is a horizontal mirror of the reclining figure repeated on LP1 pp14–16. An original-image ORB comparison after horizontal reflection produced 986 RANSAC inliers and an estimated scale of 0.995; the independent source-art report obtains 443/453 SIFT matches and 0.992524 gray correlation. This is a real cross-round image correspondence.

LP1 p16's original matrix is:

~~~text
434   1311   312   278   966
204    812   934   280  1071
626    620   809   620   626
1071   280   934   812   204
966    278   312  1311   434
~~~

Every row, column and principal diagonal sums to **3301**. The p22 image points to the LP1 p14–p16 set; it does not uniquely select p16. The independent image-parent intersection documented in the p16 square report leaves {15,16}, so p16's square remains a plausible but non-unique operand.

The 2014 Stage10 form is a dated participant archive, not a PGP-signed Cicada message. It links LP1 pp14–16 and asks solvers for order-5/3301, order-7/1033 and order-5/1033 squares, together with an onion address. Its server-side handler is missing. This makes the square recognizable to a solver familiar with the earlier round, but does not reveal how to apply it to LP2.

LP2 p22 itself has 131 runes in six printed lines and word counts [7,4,5,5,5,4]; it is not a 5×5 word grid. This distinction matters when describing the cross-round clue: p22 points back to a square elsewhere in LP1.

## p24–p26 artwork and text

P24 and p26 carry literal 24-bit RGB-identical bilateral insect artwork in their original margin rectangles; p25 uses a near-identical placement with a small raster difference. The cross-release artwork census does not identify this insect as an LP1 image reuse. Treat it as a repeated within-LP2 motif, not as a confirmed cross-round source object.

The original text has 270, 273 and 265 GP29 runes on p24, p25 and p26 respectively, with 12 printed lines on each page. P24 and p26 are not equal-length or exact reverse rune streams. The mirrored art therefore does not, by itself, establish an outer-page text pair.

The existing [p24/p26 reused-pad gate](lp2-p24-p26-illustration-reusedpad-gate.md) is a useful independent control. It tests both continuous rune-index and line-plus-within-line alignments. For same-position shared GP29 additive pads, 7 of 20 qualifying overlaps have zero compatible native-English word pairs; for shared five-bit GP-ordinal XOR, 8 of 20 do. Under line/column alignment, the corresponding contradictions are 5/17 additive and 7/17 XOR. Positive controls show that the test accepts constructed shared-pad plaintexts. These are bounded exclusions of the simplest repeated-art/shared-pad interpretation, not proof against every possible nonlinear or independently positioned key.

## Frozen hypotheses: tests and outcomes

### H1 — literal horizontal mirror preprocessing

**Clue:** p22's LP1 body is horizontally mirrored; p24–p26 repeat bilateral insect art.

**Frozen operation:** reverse rune order within each printed line and geometrically reflect each rune glyph; map the reflected glyph to the nearest original GP29 glyph template under one fixed global rule, with no manual exceptions or added Caesar/Atbash/Vigenère layer.

**Outcome: rejected.** The existing original-source p22 reflection gate trains the mirror map independently of p22 and validates unmirrored recognition on p57 (65/65). Its 29 input GP29 classes collapse to only **17 output classes** under reflection. The mapped p22 stream is nonlinguistic and the map is not invertible. A separate source-native line-direction gate finds conventional left-anchored p22 text and no positive right-to-left selector. A literal reversal of rune positions alone is only a permutation and cannot change the near-uniform GP29 frequency or decrypt the text. The p24/p26 rune streams also fail the simplest exact outer-page reversal prediction.

**Control scope:** p57 supplies the solved-page glyph recognition control; no new glyph map was fitted from target output. This retires the specific per-glyph mirror-to-GP29 inverse, not every conceivable non-GP representation.

### H2 — 5×5 Polybius/Bifid transfer from LP1 p16

**Clue:** the p22 image points to LP1 pp14–16; LP1 p16 contains a 5×5/3301 matrix; the 2014 Stage10 form explicitly requests order-5/3301 squares.

**Frozen operation:** use the earlier square as a 5×5 Polybius/Bifid-style operand.

**Outcome: rejected at the source-selector gate, with the closest direct transfers already tested.** GP29 has 29 rune symbols, while a standard 5×5 Polybius/Bifid square has 25 cells. No authenticated source specifies which four symbols to merge or omit, how the numeric magic square becomes an alphabet square, or a Bifid period. Searching possible mappings would be unconstrained key fitting.

The existing direct p16 tests also provide a negative original-cipher control. Four source-fixed additive variants and 28 no-padding 5×5 Hill/F-transparent variants were tested on p22. The Hill candidates all violate the transferred p56 literal-F invariant: decoded F symbols appear at consuming positions in every candidate. The p56 solved control therefore does not support this direct square transfer. No p22 plaintext was recovered.

The separate p22 center-cell 809 checksum is radix-conditional: base59 gives the candidate EMERGE, while base60 produces a different value/readout and is favored by the 2013 ALL AROUND selector. Preserve the base59 reading as conditional; it is not a selected operation or a plaintext result.

### H3 — 2016 map/road/direction traversal

**Clue:** the authenticated 2016 message says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”

**Frozen operation:** traverse a 5×5 map using its numeric values as directions, with the mirrored artwork fixing orientation.

**Outcome: rejected at the source-selector gate.** The signed message supplies no unique start cell, number-to-direction encoding, step scale, wrap/boundary rule or termination condition. The archived 2014 Stage10 form's server handler is missing and cannot fill those gaps. The existing p22 809/direction-loop report is a conditional candidate, not a source-fixed path; it does not supply the missing direction grammar for p24–p26. Choosing among starts, moduli, orientations or stopping rules after seeing outputs would violate the frozen prediction.

The p27 2013 761.mp3 XOR report was consulted only as a control. I did not promote the insect art into a fourth, post-registration audio-XOR hypothesis or transfer that operation to p24–p26.

## What a human solver can and cannot infer

A plausible solve path is:

1. Recognize that p22's reclining figure is a horizontal mirror of LP1 pp14–16.
2. Revisit those earlier pages and the 2014 Stage10 form; identify the 5×5/3301 square on LP1 p16 as a candidate operand.
3. Notice the repeated bilateral insect art on p24–p26 and consider reflection or shared-key reuse.
4. Use the 2016 signed message as a reason to consider a map/route interpretation.

Steps 1–3 select real source objects. Step 4 supplies a broad conceptual direction. None selects a unique cipher, symbol mapping, key schedule, route start, direction code, period, alignment or stop rule. The existing original-cipher tests reject the most economical mirror, direct square and shared-pad interpretations.

**Final answer to Issue #1898:** no frozen original-cipher prediction passes. The missing ingredient is not more compute; it is an independently source-selected operation and its parameters. Keep the cross-round image correspondence and the LP1 square as a plausible human clue chain, but do not call them a recovered key or decryption.

## Reproduction and supporting controls

- [Frozen original-first hypotheses and source-image hashes](../workplace/agent5-issue1898-preregistration.md)
- [LP1↔LP2 cross-release artwork census](lp1-lp2-crossrelease-artwork-raster-copies.md)
- [p22 literal glyph reflection gate](lp2-p22-literal-glyph-reflection-original-gate.md)
- [p22 whole-line direction gate](lp2-p22-original-wholeline-direction-gate.md)
- [p16 5×5/3301 additive and Hill gate](lp1-p16-p22-allF-five-square-clock-gate.md)
- [p22 conditional 809 square readout](lp2-p22-square-shed-divinity-emerge.md)
- [p22 809/direction loop control](lp2-p22-809-numbers-direction-p55-loop.md)
- [p24/p26 shared additive/XOR pad gate](lp2-p24-p26-illustration-reusedpad-gate.md)
- [p23 instruction control](lp2-p23-instruction-reconciliation.md)
- [p27 2013 761.mp3 XOR control](lp2-p27-2013-761mp3-original-jpeg-xor-gate.md)
- [2014 Stage10 form archive](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/index.html)
- [2016 signed Cicada payload](https://github.com/micheloosterhof/cicada-2016/blob/a4c72e7207e2dac8dc473b6e705e7ba75141e8b1/stage01/4gq25.jpg.outguess)

