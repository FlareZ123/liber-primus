# p55 43-interior to 2014 GEB coordinates: direct and inner-core Hill gates

**Decision, 16 November 2026:** The apparent 43 = 14 × 3 + 1 correspondence does not recover the historical 2014 GEB coordinates. A fixed one-rune-per-number map is mathematically impossible. A fully reversible 43-to-42 consecutive-difference codec yields at most 1/42 coordinate-field matches under four frozen sign/origin conventions. The source-motivated 3×3 Hill transform yields at most 5/42, and no complete coordinate triple. These are bounded negatives, not a decryption or key recovery.

## Source-motivated model

The physical p55 contains 76 GP29 runes in 17 source-printed segments. Taking literally the p57 instruction to shed our own circumferences means strip both ends of each non-singleton word, and discard the singleton entirely: exactly 43 interior runes remain, alongside 33 outer glyphs. The preserved sources are resources/liber-primus/lp2-corpus.json and lp2-transcription.txt; the accompanying executable asserts exact equality of the two 76-rune readings.

The independently authentic 2014 Fifth-Onion signed message provides a Gödel–Escher–Bach book code in fourteen records of (chapter abbreviation, dialogue exchange, word, letter), followed by two literal address digits and an ONION marker. Its numeric coordinate triples are:

    6,1,3 / 1,1,1 / 19,9,1 / 5,3,1 / 13,10,1 / 8,6,1 / 3,7,2 / 5,23,6 / 1,8,1 / 4,5,3 / 6,2,1 / 2,17,5 / 3,17,1 / 2,8,1

Primary historical witness: https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md . Count agreement alone does not select a GEB encoding for p55.

## Order-independent proof and stop rule

Across the authentic 42 GEB numeric fields, value 1 appears **13 times**. Across the unchanged 43 original p55 interior symbols, the highest frequency of any single GP29 rune is **4**; there are 21 different interior runes. Every fixed deterministic one-rune encoding of a numeric value must render those thirteen equal inputs as thirteen equal outputs. No choice of 42 positions out of the 43 source glyphs contains a rune even five times. Thus the candidate would force at least **nine** unequal positions, irrespective of transposition, direction, or which one rune is treated as a marker. Monoalphabetic and fixed affine numeric-symbol maps, including one fixed codebook, are excluded.

A varying-state symbol emission, multiple runes per value, homophonic encoding or a clock/key derived from the 33 exteriors remains logically possible. No first-party operation currently selects such a mechanism. The earlier p55/GEB 17-item and 43-interior coincidence is insufficient to justify searching unconstrained stateful keys.

## Source-exact first-difference readout: a 43-to-42 inverse

The exact 43 strict p55 interior GP29 runes admit a lossless, elementary change of coordinates: retain their first symbol and form 42 consecutive differences `d[i] = (inner[i+1] − inner[i]) mod 29` for positions 0 through 41. Cumulative modular addition from the retained first symbol reconstructs all 43 original glyph indices. This is a possible source-motivated way to turn the 43 symbols into the fourteen historical GEB coordinate triples (42 fields) plus one anchor without treating the 43rd symbol as a disposable marker. The source, however, supplies no instruction selecting this operation.

The 42 source differences contain 24 distinct residues and a maximum repeated-value multiplicity of four. The 2014 historical coordinate triples contain thirteen repetitions of the coordinate value 1. Therefore the original difference stream cannot be a simple fixed reversible numeric-symbol substitution of those 42 coordinates in any order: a bijection preserves equality multiplicities. For the literal printed order, both signs of the difference and the conventional zero-based/one-based GP29 integer origins yield **0/42, 1/42, 0/42 and 1/42** exact coordinate-field matches, with zero fully matched triples in all four cases.

The original-input SFT reconstructs all 43 symbols exactly from the (anchor, differences) representation and asserts the full four-variant failure. This bounds an inexpensive reversible first-difference reading and does not exclude cipher-state, homophonic, altered sequence ordering, or source-selected transducers. There is no recovered p55 plaintext or GEB book-code address.

## Source-motivated inner-3×3 Hill transform: bounded negative

The direct one-rune frequency obstruction does not exclude a blockwise transform. A finite, human-plausible extension is suggested by two source features: the original 2014 LP1 p05 Wisdom square is a 5×5 magic square of 1033, and the solved p57 PARABLE says to "shed our own circumferences" and "find the divinity within." Removing the outside ring of the p05 square leaves a 3×3 core. The p55 interior stream has 43 runes: the first 42 form fourteen ordered triples, with a final one-based GP index 19 left as a marker. The signed 2014 Fifth-Onion GEB code supplies fourteen ordered coordinate triples.

The tested hypothesis was: use the p05 square's central 3×3 as a Hill matrix over GF(29), mapping each successive p55 interior triple to one GEB coordinate triple. Because the p05 source explicitly names the totient function, the test also used the cellwise Euler-totient matrix. Both matrices are symmetric, so row/column orientation is identical; both are invertible modulo 29.

- Printed p05 core modulo 29: [[25,14,1],[13,4,13],[1,14,25]].
- Its inverse modulo 29: [[28,15,5],[16,26,16],[5,15,28]].
- φ(core) modulo 29: [[24,19,12],[23,14,23],[12,19,24]].
- Its inverse modulo 29: [[24,18,7],[5,1,5],[7,18,24]].
- Determinants modulo 29 are 24 and 26, respectively.

The fixed test covered 16 variants: each of the two matrices and its inverse, with input and output offsets independently 0 or 1. The 14 GEB records and their page order were held fixed; no record permutation, field permutation, fitted matrix, extra key, or further state was introduced. The best variant matched **5/42** numeric fields, only one more than the direct zero-origin baseline (4/42); no variant recovered even one complete 3-field record. The φ-derived variants reached at most 2/42. The direct one-rune baseline remains 4/42 at zero origin and 2/42 at one origin.

This is not evidence for a partial coordinate decode: the best matrix output does not yield a coherent sequence of page/word/letter coordinates, and the 16-way maximum is a post-selection statistic. The source suggests an inner square, but does not say to use it as a Hill matrix on p55 or connect that operation to the GEB code. Retire this specific inner-core Hill-to-GEB transfer. Do not expand it into arbitrary matrices, record permutations, or fitted offsets without a new first-party selector.

## Reproduction and research decision

Executable: sims/lp2_p55_geb_coordinate_gate_sft.cjs. It checks the original 76/17/43/33 segmentation, the exact first-party historical 42 fields, the repeated-value obstruction, the 43/43 first-difference inverse, all four source-ordered readouts, and an independent 42/42 planted affine GP29 positive.

Retire direct historical GEB coordinate substitution and the tested p05-inner-core 3×3 Hill consumer. Do not treat a reversible simulation as plaintext. Reopen only if an independent manuscript or 2014 source fixes a complete variable-state inverse, including its exterior role, that can be tested blind on original ciphertext. The waiting p55 decoder issue #41 receives no eligible handoff from these exclusions.
