# Historical onion-2 256-byte source with a GP-EA primitive-root original inverse

**Classification: source-fixed original-cipher negative, 10 November 2026 (Agent 43).** This study applies an independently archived 2014 byte string to an exactly reversible candidate cipher on **all 12,956 unknown LP2 runes**. It recovers **no unknown plaintext, authentic key, or historically demonstrated operation**. It is a finite test for cross-track Issue #16, rather than a new entry in the established-results synthesis.

## Why this particular combination was worth an original test

The historical onion-2 growing string `cu343l33nqaekrnw.onion` has **256 archived bytes**, independent of the unknown LP2 transcription, in [the reconciled arrival record](../resources/cicada2014-onion2-timing.json). Earlier historical studies tested conventional additive 29-rune ciphers, direct SHA/AES/ChaCha outputs, fixed XOR subsets and the attested timing interleavings. Those studies did not establish an LP2 key.

A distinct [existing reversible candidate](../sims/ea_zero_step_reversible.cjs) uses the source-motivated primitive root **15 modulo 29**, and treats zero ciphertext differences as GP symbol **EA**, while nonzero differences carry 28-way exponents. This can account for exactly **86 original adjacent equal-rune events** without dropping visible symbols. The historical byte string would, if intended, supply a finite 256-step exponent pad. A second fixed orientation is now included: arrange the onion-2 bytes as 32 rows of 8 and reverse each row (flipLR). This is the unique D4 orientation selected by the separate 179 divisibility link to the LP2 grid and p53 red numeral, and it is geometrically compatible with the 2014 Rad→Ac eastward edge. Both links are retrospective interpretations, not authenticated instructions or independent proof of intent. The test still uses no ciphertext-selected phase or hidden key.

## Exact, reversible construction

Use the canonical 55 nonempty physical unsolved pages from [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), preserving the **original order, spaces only as annotations, and physical page boundaries**. The original key is the exact 256-byte onion-2 `final_hex`, matching `onion2` in [cicada-hiddenservice-256-candidates.json](../resources/cicada-hiddenservice-256-candidates.json). The only additional orientation is its fixed `flipLR` row mirror: reverse each group of eight bytes in the 32×8 arrangement. No other D4 orientation or phase is searched. Define a book-global rune clock `g=0..12955`; a byte at `B[g mod 256]` yields `K_g=B[g mod256] mod28`. An alternative source-defined quantizer is `K_g=floor(28 B[g mod256]/256)`. Neither mapping is fitted.

On each physical page, set its first `P_0=C_0` and, for positions `i>0`, encrypt:

```text
C_i = C_(i-1)                                      if P_i = 28 (EA)
C_i = (C_(i-1) + 15^((P_i + K_g) mod 28)) mod 29     otherwise
```

The 28 powers of 15 exhaust all nonzero residues of F29. Consequently, the inverse is uniquely determined at every position:

```text
P_i = 28                                      if C_i = C_(i-1)
P_i = (log_15((C_i-C_(i-1)) mod29) - K_g) mod28 otherwise
```

There is no erasure or fitted escape table. An original-cipher decode followed by this forward encoder must reproduce the exact original GP sequence for **every** possible key. Thus the round trip checks implementation consistency, while language evidence is required to distinguish the historically correct key.

## Original-cipher results

A fixed GP29 trigram scorer was trained on the first 80% of the checked-in [solved Cicada text](../resources/liber-primus/lp1-plaintext-reference.txt), normalized using the repository's established greedy digraph and QU/V/K/Z mapping. The remaining 20% was held out. Every trigram conditional probability uses additive smoothing 0.3, with the same scorer for all candidates. Higher values indicate closer agreement with that native solved-text register.

| 256-byte source | Byte-to-28 map | Complete original LP2 mean log-trigram | LP2 decoded IoC |
| --- | --- | ---: | ---: |
| Archived onion-2 final bytes, printed order | mod28 | **−3.4904** | 0.03527 |
| Archived onion-2 final bytes, printed order | scale to 28 | **−3.4943** | 0.03529 |
| Onion-2 horizontal row mirror (flipLR) | mod28 | −3.4933 | 0.03529 |
| Onion-2 horizontal row mirror (flipLR) | scale to 28 | −3.4933 | 0.03525 |
| Wrong-source onion-3 archive | mod28 | −3.5004 | 0.03527 |
| Wrong-source onion-3 archive | scale to 28 | −3.4963 | 0.03524 |
| Wrong-source onion-4 archive | mod28 | −3.5026 | 0.03529 |
| Wrong-source onion-4 archive | scale to 28 | −3.4991 | 0.03526 |
| Printed grid, conventional base60 bytes | mod28 | −3.4904 | 0.03523 |
| Printed grid, conventional base60 bytes | scale to 28 | −3.4900 | 0.03528 |

**Native GP solved-text holdout: −2.6771 nats/rune.** The mirrored-key candidates score **−3.49326570** (mod28) and **−3.49327933** (scaled28), with IoCs **0.03528670** and **0.03525352** respectively; they remain near the random GP29 baseline and are not readable plaintext. The printed-order onion-2 modulo construction yields the GP transliteration prefix `SLIAAEGHTHUWNRNXRFAEJHGSGRBAEEONGNGTHRAMH...`; it is not coherent English. None of the eight source-fixed combinations produces a GP text distribution approaching the native solved register. With the transparent EA rule, **all 86 original within-page repeated glyphs decode as EA** and all 12,956 runes are accounted for.

**Exact positive plants:** splitting the 3,254 GP symbols of the normalised reference across source physical page lengths, encrypting them under the printed-order onion-2 modulo key recovers **3,254/3,254** original plaintext symbols. Repeating the same plant under the fixed `flipLR` mirror key also recovers **3,254/3,254** exactly, with exact reciphering in both cases. The same exact forward-inverse identity holds for the full unknown original text under each candidate, without supporting either key's authenticity. The executable [source-locked SFT](../sims/onion2_gp_ea_source_locked_inverse.cjs) asserts these invariants and prints complete original scores, key alternatives, first-90 GP transliterations, and source-identity assertions.

## Decision and limits

This source-to-cipher bridge is **rejected as a source-native GP plaintext decoder for both the printed-order onion-2 bytes and the 179-selected `flipLR` row mirror, under the precise period-256 byte-exponent key and book-global clock**. The mirror's best score is slightly worse than the printed-order key and far below the native solved-text holdout; both mirror mappings are random-like. The test uses no language-guided phase search. It does not exclude nonlinear state transitions, source-selected offsets, the documented time-indexed arriving-byte process, a different plaintext register, or a genuine hidden-key stream cipher. Any follow-up should begin with an independently observable instruction selecting that additional operation, rather than expanding this key grid.

The next useful cross-track input is a *frozen*, clue-selected state schedule from [Issue #3](https://github.com/FlareZ123/liber-primus/issues/3) or another source lane and a lossless inverse from [Issue #5](https://github.com/FlareZ123/liber-primus/issues/5). Issue #16's independent tester can then run an untouched original interval and report native/wrong-source discrimination. This report does not claim the puzzle has been solved.
