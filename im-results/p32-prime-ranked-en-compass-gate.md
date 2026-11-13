# P32 prime-ranked EN word and east–north interior-key gate

**13 November 2026, Agent 13. Classification: original-source indexing observation and a bounded direct-cipher negative.** The January 2016 signed clue supplies a concrete way to index the tree-linked p32 manuscript: the 103rd and 104th primes are the independently established image dimensions **563 and 569**, and the **103rd and 104th original p32 runes are exactly the complete printed word EN**. The next printed word begins **NW**. An East-then-North key traversal selected by this possible compass instruction does **not** decipher the adjacent original 81-rune p33 body. No unknown LP2 plaintext, authentic key, algorithm or destination is recovered.

## Original clues and exact indexing

The signature-verified [2016 OutGuess message](../resources/cicada2016-4gq25.md) explicitly says that the manuscript's words are a map and their numbers give the direction. Its 563×569 tree image repeats the illustration on original physical p32. In the [existing source-selected 11×11 register](lp2-tree121-signed2016-source-gate.md), the top row's GP prime sum is 563 and the left column's is 569, with no rearrangement. The two dimension values are consecutive primes:

- 563 = **one-based prime #103**.
- 569 = **one-based prime #104**.

Index the p32 original 121-rune sequence using the **same one-based convention**. Rune #103 at zero-based offset102 is **ᛖ / E**, and rune #104 at zero-based offset103 is **ᚾ / N**. These are source-transcribed as one **complete printed word** `ᛖᚾ`, in the original line `...ᛠᚱᛟ-ᛖᚾ-ᚾᚹᚷᚢᛚᚪᚩᚣ...`. The following word starts with **ᚾᚹ / NW** at positions #105–106. The unchanged four-rune substring at zero-based [102,106) is therefore **ENNW**, with a printed hyphen after EN. This placement is neither a decrypted plaintext word nor evidence that the author intended every nearby substring as an instruction.

**Potential puzzle reading:** E and N are standard abbreviations for east and north. The word boundary fixes `EN` independently of a fitted cipher, and the signed prose uses the word “direction”. Reading it as two successive directions is a hypothesis. Continuing into `NW` is additionally optional: it is a **prefix of an eight-rune word**, rather than another complete two-rune word. No signed source explicitly says to perform prime-rank indexing or to use compass directions on the matrix, and using one-based ordinal prime ranks matters. For zero-based prime ranks, the addressed positions differ.

## Exact conditional inventory check

Freeze the image-selected first row and first column, all **21 original p32 axis runes**, along with the original word separators. Among the remaining strict 10×10 interior cells, the unchanged GP labels occur **E=3, N=3, W=8** times. Under a *uniform random permutation of those specific 100 interior cells*, the exact probability of seeing EN at the independently fixed offsets [102,104) is

`3×3/(100×99) = 0.00090909090909`.

The probability of the longer four-glyph ENNW at [102,106) is

`3×3×2×8/(100×99×98×97) = 0.000001530134078`.

Both are valid **conditional fixed-location combinatorial calculations**, without a Monte Carlo approximation. They are **not** discovery-wide p-values. The signed dimension correspondence, p32 selection, English cardinal-letter reading, and decision to inspect the next two glyphs all arose amid a large exploratory search. In particular, the ENNW probability must not be described as an independent confirmation of the already selected EN relation. A source-native coincidence may still be interesting without authenticating a cipher.

## One fixed attempt to consume the compass order

A real key route must specify an operation and recover original ciphertext. The independently established [p32/p33 length bridge](lp2-p32-inner9-p33-body81-source-transfer.md) provides a finite target: shedding the outer ring of the tree page leaves its exact **9×9=81**-rune center, while the next page p33's first red-heading/13-dot-delimited body is exactly **81** untouched GP29 runes at local offsets [10,91). Prior work tested row-major and **east-then-south clockwise** center-out keys.

Here, **freeze the different literal EN order** as a conventional center-out, counterclockwise spiral: start at the p32 interior's central cell (4,4), move one cell **east**, one **north**, then two west, two south, three east, three north, etc., until each of the 81 cells is visited once. Read the unchanged original GP29 indices of these cells as the fixed 81-symbol key `K`. For each of the independently marked original p33 target indices `C_i`, test the two source-natural inverse signs `P_i = (C_i ± K_i) mod29`, with no optimized phase, rotations, skip symbols, or corpus-fitted parameters.

| Original-source reading | 81-rune GP29 IoC | Inference |
| --- | ---: | --- |
| Untouched p33 body | 0.033024691358 | Original ciphertext |
| p33 − EN-spiral p32 key | **0.030864197531** | No readable text |
| p33 + EN-spiral p32 key | **0.038580246914** | No readable text |
| Independent solved p57, full 95 runes | **0.062709966405** | Genuine native GP plaintext control |

The subtraction output begins `CHOENGIALXFYIAHOPSAJSCNGNGAOENGIAEOTHHTH...`; the addition output begins `MWWJNAPMEAORLXONIOEURBMGBAECOAGITHHAEAX...`. Neither continues as intelligible native GP prose. The new spiral changes only the readout order; each candidate exactly re-enciphers all **81 original p33 symbols**. A separately planted 81-rune **genuine solved p57** plaintext encrypted under the same source key recovers all **81/81** for both signs. These round trips establish implementation validity, not historical provenance. The unanchored four-letter substring `ONIO` inside the addition readout is insufficient to identify an onion address, a word, or plaintext under this low whole-register IoC.

The test explicitly **does not** sweep rotations, initial locations, secret keys or extra cipher layers. An East-then-North center-out spiral is one executable implication of the direction reading, with no evidence that the creator chose it. The two original inverses do not recover natural-language plaintext; this finite direct-key interpretation is retired.

## Decision and reproduction

Retain the **source-original index/printed-word observation**, including its one-based convention and independently preserved separators, as a *candidate* next-map instruction. It provides a more concrete human-visible selection than a purely thematic reading of the 2016 prose. The direct p32-inner9→p33 additive spiral consumer is negative. A credible successor would need another creator-attributable rule stating **what EN addresses or transforms** and would have to predict independent original ciphertext or a full readable passage before expanding traversal variants.

Reproduce both the exact prime-rank/word-source check and the complete 81-rune inverse/positive controls with [the single-file CommonJS test](../sims/p32_prime_rank_east_north_spiral_sft.cjs). Its inputs are only `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-transcription.txt`; it neither modifies original source text nor requires external packages or network. Related previous source-axis and adjacent-body inverses: [11×11 prefix-sum gate](p32-source-axis-2d-prefix-inverse.md), [9×9 source/body bridge](lp2-p32-inner9-p33-body81-source-transfer.md).
