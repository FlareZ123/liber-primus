# The 2016 / p50 / p55 43-unit bridge: source-selector gate

**Classification:** bounded source audit, negative. No source-authenticated, reversible 43-unit operation has been established. This closes the selector question without inventing a cipher or treating equal counts as evidence of decryption.

## Fixed source observations

### The authenticated 2016 message

The archived extraction record reports a good OpenPGP signature under key ID 7A35090F, linked to the historical Cicada public key. The signed text contains 43 alphabetic words and says:

> Its words are the map. Their meaning is the road, and their numbers are the direction.

It also warns against false paths and instructs readers to verify the signature. This is a high-level semantic instruction. It does not state a radix, page/word address formula, table-byte ordering, rune ordering, byte-to-rune encoding, cipher operation, key, or initial state.

### The p50 table interval

The original 32×8 numerical table contains 256 source bytes. At row-major byte offsets 83 and 127, the printed token is 3D, whose base-60 value is 193. The 43 bytes strictly between those markers, offsets 84–126, are:

[173, 28, 111, 65, 211, 220, 198, 49, 236, 84, 56, 35, 222, 150, 72, 34, 83, 229, 32, 206, 122, 63, 31, 218, 14, 184, 32, 115, 73, 143, 197, 247, 54, 171, 35, 184, 42, 237, 86, 54, 13, 20, 163]

The later signed-message word-map hypothesis sends the word “lies” to p50 token 3D. That singles out one table cell; it does not define a one-to-one mapping from all 43 signed words to all 43 interior bytes.

### Ornament-derived 44/193/43 bracket selector

The p55 fold artwork now supplies a separate conditional selector for the same p50 interval. Its ordinary five-position ornaments read **13** and **31**; the left filled cells are exactly positions 2,3,5, while 13 and31 are reversed primes. Their difference **18** reproduces the fold-selected fragment18. The left value13 is GP index P, and fragment18's sole equal folded pair is P/P, whose GP prime is **43**.

The archived 2013 `NUMBER` service would answer either 13 or31 with **`+`**, because each prime reverses to the other prime. Reading that historical response as an addition cue gives **13+31=44**; prime(44)=**193**. Under base60, 193 appears only at p50-global cells **83 and127**, exactly **44** apart, leaving **43** enclosed cells. Exhaustively checking all prime-valued base60 bytes finds this as the only pair with separation equal to the byte's prime ordinal. Under base59, cells83/127 equal190, value193 moves to cells61/234, and there is no such self-indexed prime-distance pair.

This is stronger selector evidence for the physical interval and a conditional discriminator in favor of base60. The unresolved premise is the semantic use of the historical `+` response as an instruction to add the later ornament values; the original server used it as a classification marker. It still does not provide the reversible 43-unit cipher operation.

### The p55 interior and p57 instruction

The p55 transcription contains 17 printed words with rune lengths:

[1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]

That is 76 page-local runes. The leading one-rune segment is the final boundary rune of an 11-rune word that begins on the preceding physical page; it is not a standalone singleton. Carrying that cross-page word correctly, the p55 page contributes 43 interior runes and 33 boundary runes. The interior sequence, represented as exact zero-based GP rune indices, is:

[19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 15, 23, 27, 13, 8, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 28, 10, 19, 5, 11, 18]

The solved p57 Parable says, “We must shed our own circumferences. Find the divinity within and emerge.” This supports an interior-extraction interpretation, but it does not explicitly prescribe the exact per-word stripping convention, and it says nothing about pairing the resulting runes with p50 bytes or 2016 message words. Nor does it specify whether any exterior symbols should be retained or reinserted.

### The earlier historical instructions

- The archived 2013 telnet NUMBER operation reverses decimal digits and factors the result. Applied to 193, it gives 391 = 17 × 23. This is a historically available operation, not an instruction to use those factors as a p50/p55 key, coordinate system, or ordering.
- The 2013 wisdom/folly material says primes and the totient function are sacred and that all things should be encrypted. It supplies no 43-unit selector.
- The 2014 Onion7 index has title value 133, div identifier 331, and 58 page links. The 2013 reversal operation relates 331 and 133, but the index does not prescribe any 43-unit correspondence.
- The 2014 May message provides an onion destination and an enlightenment prompt, not a byte/rune alignment.
- The 2017 signed warning repeats “Beware false paths” and PGP verification; it adds no mapping rule.

## Exact missing selector

No surviving, contemporaneous instruction reviewed here establishes all of the following:

1. Which signed-message word corresponds to which p50 byte and which p55 interior rune.
2. Whether the three 43-element sequences are paired in natural order, reversed, permuted, or grouped another way.
3. Whether a p50 value is a raw byte, a base-60 token, an 8-way direction/distance value, or something else when applied to a GP rune.
4. The direction and traversal order for the p55 interior sequence.
5. The reversible transform, key material, key/state initialization, and any skip or carry rule.
6. Whether the 33 boundary p55 runes are discarded, preserved as plaintext, or used as key/state material, including correct state carry for the incoming cross-page word.

The current 43-word base-58 address map is a later reconstruction from GP prime sums and the 58-page count, not a protocol stated in the signed message. Its exceptional “lies” → p50 3D result is not enough to determine the missing 43-way correspondence.

## Decision

**Stop arbitrary 43-way key expansion.** A newer source-derived navigation chain strengthens the cardinality selection while leaving the decoder incomplete. The repeated signed-word map selects **FOLD**; the p55 image fold selects one-based 13-dot fragment **18**; that fragment is the p27 red 19-rune title whose first rune is GP index **19**, leaving 18 payload runes. Folding that payload outer-to-inner gives **100000000₂ = 256**, and its only matching pair is **P/P**, whose GP prime is **43**. The full compound 19-rune signature occurs exactly once in the complete 13,136-rune LP2 source stream.

The table itself provides a same-representation 43-cell bracket: the derived signed `lies` address selects byte193 at cell83; the only other byte193 is at cell127; their outward neighbors are both 201, giving **[201,193] … [193,201]** around cells84–126, exactly 43 cells. This materially improves the earlier count-only alignment. **Traversal orientation remains unresolved.** The duplicated p27/p55 word pair is 1,432 canonical words apart and the selected section has 1,433 runes, but those are different units and the numerical −1 relation does not supply direction without another instruction.

The reverse order 126→84 was nevertheless tested as a conditional branch. As per-word GP29 shifts on the 43 signed-addressed LP2 words, same-source shuffle upper tails are **0.8141** (subtract) and **0.2164** (add); applied positionwise to the 43 p55 interiors they are **0.2207** and **0.7906**. Direct XOR and modular ± byte readouts remain unreadable, with at most **22/43** printable ASCII. No source yet fixes how the table interval, p55 interiors and signed words combine into a reversible key/state transition. Keep p55 unsolved. See [the header-fold report](p27-title-headerfold-256-43-reverse-table.md) and [standalone reproducer](../sims/p27_title_headerfold_256_43_reverse_sft.cjs).

## Sources

- Original signed extraction and source record: [cicada2016-4gq25-outguess.asc](../resources/historical/cicada2016-4gq25-outguess.asc), [cicada2016-4gq25.md](../resources/cicada2016-4gq25.md)
- Original p50 bytes and GP corpus: [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json), [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json)
- p55 and p57 transcription: [lp2-transcription.txt](../resources/lp2-transcription.txt)
- Provisional signed-message word map: [lp2-2016-signed-message-base58-word-map.md](lp2-2016-signed-message-base58-word-map.md)
- 2013 historical number operation and its limitations: [cicada2013-reversed-prime-cookie-original-inverse.md](cicada2013-reversed-prime-cookie-original-inverse.md), [cicada2013_parable_reversal_ring_sft.cjs](../sims/cicada2013_parable_reversal_ring_sft.cjs)
- 2013 wisdom/folly material: [cicada2013-wisdom-folly.md](../resources/cicada2013-wisdom-folly.md), [2013-0-wisdom-source.md](../resources/external/2013-0-wisdom-source.md)
- 2014 material: [cicada2014-may2-signed-message.asc](../resources/cicada2014-may2-signed-message.asc), [cicada2014-onion7-index.html](../resources/cicada2014-onion7-index.html)
- 2017 signed warning: [cicada2017-yEiTHhvF.asc](../resources/historical/cicada2017-yEiTHhvF.asc)
