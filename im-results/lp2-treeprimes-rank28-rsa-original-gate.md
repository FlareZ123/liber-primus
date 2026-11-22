# Tree-prime RSA after reversible nonrepeat-rank inversion

**22 November 2026, Agent 1. Bounded original-cipher negative.** This is a direct attempt to recover previously unknown plaintext from LP2 physical p32 and p55. It supplies no unknown plaintext, historical cipher or continuation destination.

## Why a human might try it

The independently signed 2016 Cicada tree JPEG is **563×569** pixels, both dimensions prime. Physical p32 contains 121 original ciphertext runes, whose first row and first column in the proposed 11×11 reflow have GP-prime sums **563** and **569**. Its illustrated tree relates to the later p55 tree. Earlier studies tried raw GP29 four-rune RSA packets against modulus `563×569 = 320347`; they failed the RSA domain prerequisite (see `lp2-p32-signed-dim-rsa-domain-gate.md`).

A materially different interpretation uses an independently observed ciphertext property: LP2 almost never repeats an adjacent GP29 rune. A reversible encoding of one of 28 possible values as any rune *except* the preceding rune could account for this. Undoing it gives a radix-28 alphabet. This permits asking whether **the output of that proposed first layer** consists of four-digit RSA ciphertext residues under the signed-2016 dimensions. No source instructs solvers to combine these two features, and a strict nonrepeat mechanism already requires an exception channel for the actual original doublets.

## Fixed two-layer decipherment trial

Use the untouched original physical p32 **121** and p55 **76** rune indices and RSA modulus `N=320347`, with ordinary historical public exponent `e=65537` and mathematical inverse `d=160833`. The **domain check precedes any exponent**, so the rejection does not depend on which RSA exponent a creator might have used.

For every adjacent *unequal* pair of GP29 ciphertext runes `(previous,current)`, compute either independently documented rank28 inverse:

- **Sorted forbidden-symbol rank:** `r=current-[current>previous]`.
- **Cyclic forbidden-symbol rank:** `r=((current-previous+29) mod29)-1`.

Both output `0..27`. At an original adjacent *equal* pair, record the position as an exception/erasure and continue reading all remaining source glyphs; do not insert a guessed radix-28 digit. This is maximally accommodating to a putative separately encoded repeat marker, though it no longer constitutes a full, proven reversible original decoder. Reversing original page order is an explicit orientation sensitivity. Pack every consecutive four resulting base28 digits as one big-endian integer at phases `0..3`, keeping only complete packets. A valid direct RSA ciphertext representation requires **every packet strictly less than 320347**. Nothing in the original source selects a specific phase, mode or reverse direction.

## Original-input result

Every one of the **32** declared configurations has at least five mathematically inadmissible RSA ciphertext integers. Numbers below are invalid four-digit packets for phases 0 / 1 / 2 / 3, all referring to unmodified original runes:

| Physical page | Rank28 inverse | Reading | RSA-domain violations by phase |
| --- | --- | --- | --- |
| p32 | Sorted | Forward | **10 / 16 / 15 / 18** |
| p32 | Sorted | Reversed | **11 / 18 / 15 / 15** |
| p32 | Cyclic | Forward | **16 / 16 / 11 / 12** |
| p32 | Cyclic | Reversed | **13 / 12 / 17 / 14** |
| p55 | Sorted | Forward | **7 / 10 / 6 / 10** |
| p55 | Sorted | Reversed | **8 / 11 / 5 / 9** |
| p55 | Cyclic | Forward | **9 / 11 / 10 / 8** |
| p55 | Cyclic | Reversed | **7 / 9 / 8 / 7** |

Original nonrepeat-rank lengths are **118** for p32, after recording original repeat sites at zero-based rune offsets **30,104**, and **74** for p55, whose repeated site is **59**. The phase families contain **28–29** RSA packets on p32 and **17–18** packets on p55. Example: p32 forward sorted phase0's rank-digit packet at output offset12 is **365785**, already greater than N. P55 forward sorted phase0 fails at its first packet with **542031**. Thus a ciphertext RSA key search or an RSA output-to-plaintext interpretation cannot repair this representation.

## Exact source-native positive inversion

A complete positive construction shows that the proposed two-layer pipeline works when the source actually obeys it. Take **90 genuine solved-p57 GP29 plaintext runes**, pack them in **30 three-digit base29** groups, encrypt with the specified small RSA `e=65537`, serialize each resulting integer in **four base28 digits**, and wrap those **120** ranks with a correct no-repeat rank28 encoder seeded by the real first p32 rune. For **both sorted and cyclic** encoders, the test produces **121** synthetic ciphertext runes with zero adjacent repeats and then fully decodes and RSA-decrypts back to the original **90/90** known plaintext runes. Every synthetic packet is valid. That confirms the original failures are at the critical domain prerequisite.

## Decision

**Reject the specific direct 28-rank layer → four-base28-digit textbook RSA packet explanation for the two tree-related pages, irrespective of RSA exponent, source-reading direction and four natural packet phases.** This differs from existing raw-GP29 RSA negatives because it removes the candidate nonrepeat transport before packing. It cannot exclude a genuinely sourced alternative transport, variable-length RSA framing, unknown ciphertext escape records, or a different use of the source prime dimensions. The creator has not authenticated either layer. No unexplained original ciphertext glyph was assigned a favorable decoded value.

The read-only [Windows-compatible CommonJS SFT](../sims/lp2_treeprimes_rank28_rsa_source_sft.cjs) asserts the full source-derived tree dimensions, both page lengths, all 32 complete domain-violation counts, the literal doublet sites and **both 90-rune source-native positive inversions**. It reads `resources/liber-primus/lp2-corpus.json` and uses only Node.js built-ins.

**Progress boundary:** the independent geometry and unusual repeat suppression remain separate original observations. This test supplies neither a key nor new plaintext and offers no reason to extend this rejected RSA architecture through additional fitted escape rules or arbitrary radix shifts.
