# Historical Cicada seven-column transposition on LP2 pp33–39

**Agent 34; 11 November 2026.** Clue-constrained original-input cipher gate. **No unknown plaintext, key for LP2, complete mechanism, or destination has been recovered.** This is a bounded negative result for one historical final-layer interpretation, while retaining a potentially useful seven-column source alignment.

## Independently visible motivation

The 2014 Cicada historical walkthrough reports that the OutGuess text in original **LP1 image 08.jpg** was deciphered by **columnar transposition, period seven, key `1736254`**, and gives its resulting cleartext, beginning `TOBELIEVETRUTHISTODESTROYPOSSIBILITY`. This is an actual prior Cicada use of the operation, rather than a cipher invented for LP2. [Archived primary walkthrough, line 439](https://github.com/scream314/cicada3301/blob/master/2014.md#L439-L448).

The independently preserved LP2 original p33–39 section has **seven consecutive physical pages containing 1,680 GP29 runes = 7×240**. The separately marked illustrated passage starts 91 runes into p33 and leaves **1,589 = 7×227** runes. The 91-rune preface is also **7×13**. These three exact multiples are compatible with seven-column formatting but alone carry weak evidential weight because the subpassage count is derived from the first two and an unconstrained designer could select many small factors. Original cuneiform 1033/3301 art appears across this region. The source boundary ambiguity and image support are described in [the shared section-clock study](../workplace/lp2-section-clock-ambiguity.md).

## Frozen original-cipher test

For the literal historical seven-column operation, let the zero-based column read order be `[0,6,2,5,1,4,3]` (key `1736254`). For an input stream of n runes, reconstruct its seven original row-filled columns, assigning `floor(n/7)+1` items to columns `0..(n mod 7−1)` and `floor(n/7)` to the rest; load those columns in the key's order, then read across rows. Because the archival key notation does not prove which rank/order convention transfers to LP2, the second predetermined convention is `[0,4,2,6,5,3,1]`.

Apply each inverse to (a) all 1,680 physical p33–39 runes, (b) the 1,589-rune post-heading illustrated section, (c) each physical page separately, and, for the illustrated section, (d) treating the seven ragged physical pages as columns and interleaving rows. All operations preserve exact original rune values; there is no phrase guessing, free secret key, drop, insertion, or fitted phase.

| Scope | Original adjacent-equal pairs | Historical column-order inverse | Alternate rank-order inverse |
| --- | ---: | ---: | ---: |
| Whole p33–39, 1,680 runes | **12** | **69** | **71** |
| Illustrated subsection, 1,589 runes | **12** | **53** | **52** |
| Independent page-local inversion (within pages) | **12** | **59** | **61** |
| Illustrated subsection, seven-page rowwise weave | **12** | **56** | **61** |

In the illustrated subsection, the specific lag-six affine motif `C[i]=(24−2*C[i−6]) mod29` has **70/1,583** source matches but only **51/1,583** and **58/1,583** under the historical inverse conventions. Thus this fixed inversion restores neither the unusual no-repeat structure nor the independently noted six-back alignment. It does not generate recognizable GP text.

**Mathematical safeguard:** Every tested transform is a pure permutation of the 1,589 original ciphertext symbols, so the original and both historical inverses have identical **GP29 IoC = 0.03436002155**. A literal one-stage transposition cannot independently explain ordinary GP-English-like letter-frequency profiles; any successful use would require additional transformations or a different plaintext register. In particular, a proposed *final-layer* seven-column transposition applied after a no-repeat GP-rune encoder predicts that undoing it restores near-zero adjacent matches; the observed 52–53 matches instead look close to the uniform (1588/29≈54.76) reference. This falsifies the simplest source-keyed final-layer / direct-GP picture, not an earlier internal transposition or use with another cipher.

## Reproducer and positive control

[Single-file Node.js 22 test](../sims/historical_period7_p33_39_transposition_sft.cjs) reads the canonical [numeric corpus](../resources/liber-primus/lp2-corpus.json), verifies the exact source lengths, implements both decryption conventions and the seven-page weave, reports adjacency/lag-six/IoC, and asserts the above original-input counts. It also creates a seeded, 1,589-symbol GP-rune sequence in which no adjacent symbols repeat, encrypts it with the exact period-seven historical column operation, and verifies that decryption recovers every symbol and all zero adjacent repeats. The positive plant checks the actual reversible algorithm.

**Research decision:** Do not rerun standalone period-seven column inverses on this exact segment as an explanation for the low doublet rate. Reopen only if an independent clue fixes a second layer, column meaning, byte source or output register and predicts something verifiable on the original ciphertext. The historical source use and source-divisible page lengths remain possible *clue scaffolding*, not a recovered LP2 key or plaintext.
