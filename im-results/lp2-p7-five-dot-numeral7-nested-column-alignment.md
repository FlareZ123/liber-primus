# The p7 five-dot order moves the unique p8–14 numeral 7 to a seven-column header

**17 November 2026, Agent24. Evidence class: exact original-image/ciphertext *alignment* and a bounded negative plaintext test.** The alignment is reproducible and source-constrained; an author-intended instruction, cipher key, plaintext or final Cicada destination has **not** been established. This report preserves one independently motivated solve-path hypothesis, with explicit failed first consumers and a way for future research to distinguish it from an accidental coincidence.

## Source-visible construction and strongest objection

The source p7 image **24.jpg** ends with five large black circles. Their exact reusable stencil, including its vertical reflection on p23 and horizontal reflection on solved p56, was previously established in [the original three-page art study](lp2-p7-p23-p56-five-dot-dihedral-triad.md). A human can sort the five p7 circles by horizontal position and read their **vertical positions from top to bottom**. Measured centers, sorted left to right, are:

| x position (native pixels) | y position | rank from top | zero-based column |
| ---: | ---: | ---: | ---: |
| 796.94613 | 3105.73973 | 3 | 0 |
| 992.46667 | 3166.68765 | 5 | 1 |
| 1296.96618 | 2866.70402 | 1 | 2 |
| 1479.36384 | 3127.50000 | 4 | 3 |
| 1527.21721 | 2936.20488 | 2 | 4 |

The **top-to-bottom column order is [2,4,0,3,1]**. That is one conventional geometric reading, rather than an authenticated imperative from the illustration. The strongest rival explanation is ornamental reuse of one five-dot stencil; there is no caption identifying columns.

Immediately after this drawing, original physical **pp8–14**, source scans **25.jpg–31.jpg**, form a visually bounded **seven-page runic chapter**. They contain precisely **1,729** canonical GP29 runes and exactly one visually distinctive, untranslated **Arabic numeral `7`**, on p10 / original scan **27.jpg** between runic word delimiters. The numeral is at zero-based position **692 when counting runes preceding it**; page-local mixed-stream position **169**. Counting the numeral as one additional standalone symbol makes the full source stream exactly **1,730 = 5×346** symbols. Critically, its position is **692 = 2×346**, the first slot of the third contiguous 346-symbol column.

The two independent observations meet mechanically: **the topmost of the five p7 dots is x-sorted column 2**, the very column at whose start the manuscript prints `7`. Reading down five source columns in dot top-to-bottom order, taking a rune at each common row before moving to the next, reconstructs a stream that begins with the **literal numeral `7`**. Strip that now-leading unencrypted marker and the rest has exactly **1,729 = 7×247** runes, while the physically bounded section itself spans **seven pages**. This supplies a plausible two-stage player path: five dots select the first column reading; the recovered `7` selects a following seven-column operation. The historical 2014 Cicada puzzle did use a seven-position rearrangement in a different stage, independently making that second operation imaginable to a period solver.

**This alignment is real. Its proposed meaning is not proven.** Top-to-bottom is only one of several reasonable dot-reading conventions; we noticed the match retrospectively, and the visible 7 could simply be ordinary plaintext numeric content left untouched by a separate rune cipher. Among all 5! arbitrary column orders, 24 put column 2 first, so locating the 7 at the first output position does not identify a unique secret permutation. With the top-down convention fixed, exactly one source position out of 1,730 would land first; that conditional combinatorial fraction is *not* a calibrated probability of authorial intent.

## An exact reversible test, with a solved-source plant

Let the source stream including the literal 7 be `C[0..1729]`, the five column heights be `h=346`, and the source image's y-sorted x-order be `q=[2,4,0,3,1]`. The proposed first inverse is:

```text
D[5r+j] = C[346*q[j]+r]     r=0..345, j=0..4
```

The observed original prints `C[692]=7`. Therefore `D[0] = C[346*q[0]] = C[692] = 7`, with no fitted phase, oracle or arbitrary alphabet values. The original layout and **all 1,729 GP rune identities** are recovered exactly by reversing this five-column rearrangement. An independent 1,729-rune actual **source-native solved LP1 English plant** with leading literal 7 is forward-transposed, places its numeral at original source index 692, and is then fully recovered by the identical inverse. These are losslessness checks, not validation of the unknown text.

Other straightforward dot sort orders put the numeral in the **first row but later column**: top-to-bottom output index 0, bottom-to-top index 4, left-to-right index 2 and right-to-left index 2. Only the top-to-bottom convention reveals the digit as the first output symbol among these four.

## Does a second source-motivated seven-column transform reveal plaintext?

After the first inverse, remove only the exposed numeral `7` and preserve all **1,729** original GP indices. The total is seven-divisible with column height **247**. Test the historical 2014 seven-tuple rearrangement in both directions, and conventional seven-column down/across rearrangements in both directions, with no fitted key or changing rune values. Score each candidate under the repository's separately trained **3,510-rune authentic solved-LP1 GP29 trigram model**. Clear solved p57, reserved as an independent check, scores **−2.468145**, whereas ciphertext-like text typically scores near **−3.4**:

| Original-scoped candidate | Mean native-GP trigram log score | Adjacent equal GP pairs / 1,728 |
| --- | ---: | ---: |
| Original p8–14, digit omitted | −3.421147 | 9 |
| Five-dot ordered deinterleave, initial 7 removed | **−3.411400** | 56 |
| Then historical seven-tuple order [0,6,2,5,1,4,3] | −3.421150 | 58 |
| Then inverse seven-tuple order [0,4,2,6,5,3,1] | −3.419532 | 53 |
| Then seven-column downward readout | −3.415380 | 70 |
| Then seven-column rowwise readout | **−3.410092** | 68 |

The first transform restores an ordinary number of adjacent equalities (56 from 9), but all four seven-column continuations remain nonlinguistic at the tested plaintext layer. In fact, **any pure symbol transposition preserves the near-uniform GP29 unigram frequency and collision index**, so these operations alone could never produce the native rune frequency concentration of established LP1 English. A genuinely solving interpretation would need an **independently sourced rune-value transformation or key** in addition to any column rearrangement.

[Read-only source-original Node22 CommonJS reproducer](../sims/lp2_p7_fivedot_seven_header_alignment_sft.cjs) validates the original scan hash, source rune transcript, unique 7 location, native source-art center order, exact marker movement, reverse transform, source-native positive plant, and all six reported original-cipher scores and doublet counts. The source image geometry itself remains separately reproducible from the earlier [native-raster art audit](lp2-p7-p23-p56-five-dot-dihedral-triad.md).

## Research decision

**Retain the header relocation as an explicit clue-constrained candidate, without promoting it to a decipherment.** It is more causally specific than searching unselected 5- or 7-column keys: the five circles, unique numeral, four original numerical alignments, and first-position relocation are fixed by source artifacts. The natural seven-column-only continuation is negative, and the five-dot stencil's reuse makes ornamentation a live rival.

A useful successor would identify a **first-party instruction or source-supplied rune-value key** that explains why the resulting 1,729-runic stream remains GP29-flat and can predict an independently held-out coherent original plaintext span. Further freely chosen permutations, phase shifts or cipher layers chosen solely to improve the observed score would not discriminate the intended solve path from overfitting. No new authenticated unknown LP2 plaintext has been recovered.
