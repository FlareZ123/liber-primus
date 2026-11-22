# Original-cipher GP28 rank stream: no fixed byte-modulo fingerprint

**Evidence class:** a bounded, source-fixed transport discriminator. **No original plaintext, key or encryption mechanism recovered.** Original input is the canonical 55 rune-bearing LP2 physical pages, physical 0–55, in resources/liber-primus/lp2-corpus.json.

## Premise and decisive test

The original LP2 ciphertext has only **86 equal adjacent pairs among 12,901 within-page transitions**, so a human solver might suspect that a designer draws one of the 28 runes other than the previous ciphertext rune. A straightforward implementation would take a uniformly random byte and use its remainder modulo 28 to index the 28 permitted runes. With independent uniform bytes, ranks 0,1,2,3 occur **10 times per 256 byte values**, while the other 24 ranks occur **9 times per 256**. That bias can be detected without guessing the key if the visible GP-order index mapping is fixed.

Predeclare two natural predecessor-excluding orders: (1) GP-alphabet ascending order with the previous rune removed (**sorted**); (2) move cyclically in the original GP alphabet, skipping the previous rune (**cyclic**). Each original within-page nonrepeat produces one rank 0–27. The 86 original equal pairs are excluded from this conditional test. Success means the predicted rank-0..3 concentration; failure downgrades that specified mechanism, rather than all GP28 encodings.

The four special residues under byte modulo 28 have probability 40/256 = 0.15625. The one-sided exact null for the count is Binomial(12,815,40/256). The script includes binomial self-checks and a synthetic complete-byte-control check.

| Frozen rank order | Source ranks 0..3 | Source fraction | Modulo-byte expected | Exact one-sided p |
| --- | ---: | ---: | ---: | ---: |
| Sorted, GP order minus previous | 1,864 / 12,815 | 0.145455 | 2,002.34 | 0.0003583252 |
| Cyclic successor order | 1,831 / 12,815 | 0.142879 | 2,002.34 | 0.0000131283 |

The two physical-page halves have sorted low-four counts **1,000/6,688** and **864/6,127**, and cyclic counts **981/6,688** and **850/6,127**. Both halves have less mass in the four modulo-favored ranks than the declared byte model predicts. Independently drawing distinct rune pairs from each page's measured marginal GP histogram gives predicted low-four rates **0.145553 sorted** and **0.142791 cyclic**, remarkably close to the source rates. The source's pagewise glyph histogram explains the observed rate without a positive byte-reduction fingerprint.

## Exact inference boundary

These two specified rank orders disfavor **one random byte per nonduplicate output, independently and uniformly reduced by remainder modulo 28**, provided the mechanism producing repeats does not selectively remove certain rank values. This test does not exclude rejection-sampling, scaling, correlated bytes, arbitrary secret permutations of 28 ranks, other rank assignments, changing state, compressed binary encoding, or separate handling of the 86 repeats. Both order tests use the same source text and are correlated evidence, not two independent experiments. A secret permutation can assign the four high-probability byte residues to any four of 28 ranks.

The result narrows one cheap human-plausible implementation. It supplies no recovered key or plaintext and makes no claim to identify the historical encryption system.

## Reproduce

Run **node sims/gp28_byte_reducer_gate.cjs** with Node.js 22 in the repository checkout. It checks the original counts, synthetic byte-bin control, exact binomial tails and prints all 28 rank frequencies and both half-corpus summaries. No dependency or workflow needed.
