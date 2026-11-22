# 2016 source/page index-origin audit: p32 → p28 → p29

**Decision: positive but scoped for the typed coordinate origins and the predeclared p29 receiver; not a plaintext recovery.** This resolves Director issue [#1930](https://github.com/FlareZ123/liber-primus/issues/1930). The source-to-page conversion is historically motivated, and the frozen p29 holdout passes. The page-number-to-same-numbered-page-word rule remains an interpretation of the 2016 instruction, not an explicit signed format specification.

## Coordinate types must not be conflated

The candidate route uses three distinct coordinates:

1. **Signed-source word ordinal:** naturally one-based.
2. **LP2 physical page label:** zero-based, as shown by the 2014 Stage11 image sequence.
3. **Page-local word ordinal:** one-based, as in earlier Cicada book-code solutions and the existing LP2 parser.

The natural typed conversion from source word ordinal n to physical page is p = n − 1. This is equivalent to taking the zero-based source index i = n − 1 and selecting physical page p = i. It is not the rival direct mapping n → p = n.

## Source evidence

### Authenticated 2016 instruction

The PGP cleartext-signed source is [cicada2016-4gq25-outguess.asc](../resources/historical/cicada2016-4gq25-outguess.asc). Counting its 43 natural-language words after the cleartext-signature Hash header gives:

- THE at one-based ordinals 2, 8, 13, 18, 23, 29 (zero-based indices 1, 7, 12, 17, 22, 28).
- THEIR at ordinals 20 and 26 (indices 19 and 25).
- DIRECTION at ordinal 30 (index 29).

The last THE is immediately followed by DIRECTION. The signed text says that Liber Primus's words are the map and their numbers are the direction. It does **not** explicitly say that the signed message's own word ordinals are page addresses, nor does it specify a page-to-word formula. Treating the signed-source ordinals as a pointer stream is therefore an interpretation to test, not a quoted instruction.

### Zero-based physical page labels in the 2014 Stage11 archive

The archived [Stage11 index.html](../resources/historical/stage11-2014-index.html) contains exactly 58 sequential image names, 0.jpg through 57.jpg. The [manifest](../resources/historical/stage11-2014-index-manifest.json) maps each source N.jpg to the canonical LP2 image resources/liber-primus/(N+17).jpg. The source commit is dated 11 May 2014. The [image-archive README](../resources/liber-primus/README.md) records byte identity for all 58 images.

Important authentication boundary: the manifest classifies this as a 2014 participant Git archive, **not** a PGP-signed original HTTP response. It is a contemporaneous, source-native repeated page-label sequence, but not cryptographic proof of the original server response. It fixes the archived page labels 0–57; it does not by itself say how to index words on a page. In this mapping, p28, p29 and p30 are canonical images 45.jpg, 46.jpg and 47.jpg.

### Earlier Cicada book-code coordinate conventions

The earlier rounds provide a real precedent for one-based word/letter positions:

- The 2014 first-onion signed coordinate message selects Emerson's Self-Reliance. Its documented [book-code implementation](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/book-code.py) subtracts one from each paragraph, sentence, word and character coordinate. The implementation reproduces the historical onion address. This is a successful historical solve convention; the signed message does not literally print the phrase “one-indexed.”
- The 2012 [two-book-code reconstruction](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/README.md) and its [Agrippa implementation](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/agrippa.py) likewise subtract one from line and character coordinates. The README's explicit “first line is 0-indexed” instruction belongs to a separate Mabinogion line-count operation used to select a volume, not to the Agrippa book-code coordinates.

These precedents do not prove an LP2 address rule. They do show that Cicada's historical coordinate origins were typed by operation: one-based book coordinates can coexist with a zero-based page/file sequence. Thus ordinal n → page n−1 is not an arbitrary offset introduced to rescue p28.

## Full-source and all-page controls

The deterministic parser in [lp2_2016_index_origin_p32_p29_sft.cjs](../sims/lp2_2016_index_origin_p32_p29_sft.cjs) applies the frozen alternatives to all 43 natural-language source words and all 55 unsolved rune-bearing physical pages (p50 is the numeric table).

| Mapping | Last THE | DIRECTION | Result at the selected page word |
|---|---|---|---|
| Zero-based source index i → physical page p=i; equivalently one-based ordinal n → p=n−1 | index 28 / ordinal 29 → p28 | index 29 / ordinal 30 → p29 | p28 word28 is the unique center-adjacent receiver; p29 word29 passes the frozen DH-state test |
| Direct one-based ordinal n → physical page p=n | ordinal 29 → p29 | ordinal 30 → p30 | p29 word29 is not center-adjacent; p30 word30 has six runes and cannot be the predeclared two-rune receiver |

The repeated-source controls are not hidden: THE occurs at indices 1, 7, 12, 17, 22 and 28; THEIR at 19 and 25; IS at 11 and 21; ARE at 16 and 27; AND at 24 and 31. Under the zero-based source-index mapping, the six THE occurrences address p1, p7, p12, p17, p22 and p28. Under the direct one-based alternative, they address p2, p8, p13, p18, p23 and p29.

Applying the separate page p → one-based page-local word p rule across every unsolved rune-bearing page yields 48 in-range page-word selections. Only p28's word28 begins immediately after the exact center: p28 has 269 runes, center rune 135, and word28 begins at rune 136 with length five. The p27, p29 and p30 neighboring controls do not satisfy this center-adjacency condition. This is the all-page result already reproduced by [the p28 center-control SFT](../sims/lp2_p28_pageword_center_adjacency_control.cjs).

The complete 43-word source does **not** form a fully valid pointer list under either simple grammar. The zero-based mapping has 41/43 in-range page-word selections (HELLO → p0 word0 is undefined; YOU → p32 word32 is out of range). The direct one-based mapping has 42/43 (AND → p32 word32 is out of range). Do not interpret the valid fraction as evidence that every signed-source word is intended to be an address. The 2016 pronoun “Its” refers to Liber Primus, not to the signed message itself.

## Predeclared p29 receiver test

The p28 DH reconstruction fixes p=23, so the expected ordered pair is [p−1,p] = [22,23]. The endpoint transform was already fixed as H(x,y) = (x−y, x+y) mod 29.

The page-local parser counts printed hyphens and periods as word boundaries; spaces and line breaks are not boundaries. It resets the page-local word ordinal at each physical page. Separately, the complete-word census joins across page boundaries and excludes cross-page fragments from the complete two-rune population.

- p28 word28: starts at rune 136, length five; exact page center is rune 135.
- p29 word29: starts at rune 107, length two, GP0 pair [8,15]. It is a complete word contained wholly on p29, not a page-boundary fragment.
- H([8,15]) = [22,23], exactly the p28 DH target.
- The transformed target occurs once among all 448 complete two-rune words on the 55 unsolved rune-bearing pages.
- The direct one-based alternative sends DIRECTION ordinal 30 to p30 word30, which starts at rune 122 and has length six. It is not the frozen two-rune receiver.

A necessary nuance: the direct alternative also maps the preceding THE ordinal 29 to p29 word29, so the p29 pair alone does not distinguish which source word selected p29. The discriminating sequence is the pair of consecutive source words: under n→p=n−1, THE selects p28 and its unique center-adjacent word28 receiver, then DIRECTION selects p29 and the predeclared p29 word29 DH pair. Under n→p=n, the p28 center receiver disappears and DIRECTION moves to the six-rune p30 word30.

The p29 target and p30 control were frozen in the Director issue comments before this audit reproduced them. This is a held-out test relative to the p28 receiver discovery, not a blind discovery by this invocation.

## Decision and limits

**Positive, but only for the narrow navigation grammar.** The page-label origin is supported by the contemporaneous 2014 Stage11 image sequence; one-based word/letter coordinates have earlier Cicada book-code precedent; and the fixed n→p=n−1 mapping passes the predeclared p29 receiver test while the direct n→p=n alternative misses the p28 receiver and DIRECTION endpoint.

The page p → one-based word p equality is still an analyst interpretation of “words are the map; numbers are the direction,” not an explicit signed coordinate format. The 2014 Stage11 index is a participant archive rather than a signed HTTP capture. The full 43-word message is not a complete pointer list. Therefore retain p32→p28→p29 as a source-supported, held-out-validated **navigation hypothesis**, not an established cipher, recovered plaintext, key, or final destination.

Next work should require a separately predeclared source selector and receiver. Do not extend H to arbitrary word lengths, change word boundaries, shift offsets, or treat the p29 pair as permission for an unconstrained walk.

## Reproduction

Run:

    node sims/lp2_2016_index_origin_p32_p29_sft.cjs

Inputs are the original archived source/index, the canonical LP2 corpus/transcription and the 2016 signed message. No network access or fitted parameters are used.
