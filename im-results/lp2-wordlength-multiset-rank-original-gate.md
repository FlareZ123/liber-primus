# A source-preserving word-length order channel on LP2 pp0–55

**Agent41, 16 November 2026. Classification: reversible structural capacity and a bounded direct-read negative.** No unknown-page plaintext, authenticated key, decoding instruction or Cicada destination was recovered.

## Human puzzle premise and competing explanation

The authenticated 2016 Cicada statement, “Its words are the map. Their meaning is the road, and their numbers are the direction,” motivates asking whether word *lengths and order* transmit key/state beyond the 29 runic symbols. The premise is incomplete: the signed text does not prescribe a length permutation, rank convention, numeral radix, receiver or plaintext opcode. The ordinary competing explanation is that ciphertext preserves approximate natural-language word lengths while changing rune values. Both remain open.

A separate completed [source-boundary study](lp2-random-word-boundary-framing-source-gate.md) showed 9,007.9998 bits of **unconstrained boundary-position capacity** with punctuation spans and per-span word counts preserved. It also rejected uniform random boundary placement. The present channel is a deliberately narrower alternative: **preserve the exact multiset of word lengths within each punctuation span**, reordering only those lengths. It therefore preserves the observed nongeometric length histogram in every one of the original 175 spans and cannot be dismissed by the earlier memoryless-framing null. It does not move or alter any ciphertext runes, and is not an LP2 decryption.

## Exact lossless construction

Read original `resources/liber-primus/lp2-transcription.txt` until the end of unknown physical p55. GP29 runes increment a current word length; `-` closes a complete printed word; `.`, `$`, `&` and `§` close punctuation spans; `/` and `%` are line/page layout, never additional word separators. Assert equality of **every one of 12,956 canonical rune indices** with `resources/liber-primus/lp2-corpus.json`.

For each punctuation span `s`, let `L_s` be the ordered integer list of its printed word lengths, `W_s` its number of words, and `n_{s,l}` the count of length `l`. With all lengths' multiplicities frozen, the number of allowed distinct permutations is

```text
B_s = W_s! / product_l(n_{s,l}!)
B_total = product_s B_s
log2(B_total) = 6121.871208562708... bits
```

There are **175 spans** containing **2,896 words**, and **172** have a nontrivial ordering (`B_s>1`). The 175-span product yields **0.47251244 potential bits per original rune**. This is a combinatorial ceiling for a hypothetical deliberate length-order channel. The actual 2014 artwork does not identify it as a cipher.

A complete reversible serialization ranks `L_s` lexicographically among all distinct ascending-length multiset permutations, starting at zero. Pack the 175 ranks in original span order as one mixed-radix nonnegative integer, with the earliest span in the least significant place. The CJS SFT ranks, un-ranks, and byte-for-byte recovers each original length sequence; independent reversed-order planted length sequences also recover exactly.

## Direct original-input decision

Serialize that *one frozen rank integer* without additional password, crib, arbitrary phase, or keyed layer. Natural minimal-length little-endian and reversed big-endian byte readings contain **766 bytes** and **278 printable ASCII bytes** (36.29%). Neither has a recognizable text header; representative first 32 bytes are:

```text
LE: 0b114a66980d672ffe08e0bb15e6c3de291ee69d82a32aa737fa52dce00554e6
BE: 033e5023901c4387eca9c2abd11a481e1940c8975191369b4c3fc9fe7029f043
```

The direct native-order read yields no interpretable instruction, source-derived key or unknown prose. A different byte direction is not an independent clue. Because no source selects an enumerative codec, this is a bounded demonstration of capacity and a negative **for this exact direct-read codec**, not a cryptographic detection.

**Reproducer:** [read-only Node22/CommonJS SFT](../sims/lp2_wordlength_multiset_rank_original_sft.cjs). It validates 12,956 corpus rune identities, 2,896 complete words, 175 punctuation spans, the original 14-bin word-length histogram, every lossless rank inverse, an independent reversed-order plant, 172 informative spans, the 6121.87120856-bit capacity, and the precise byte prefixes.

**Future decision:** A key or segmentation hypothesis must supply an *independently original-source-selected* rule mapping these length-order ranks to GP29 cipher state or authentic bytes, before tuning on unknown plaintext. If no authored selector appears, this channel remains a formal possibility rather than a reason to brute-force rankings or KDFs. The stronger goal remains a contiguous, grammatical, exactly re-encryptable original plaintext.
