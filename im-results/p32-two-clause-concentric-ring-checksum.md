# p32 two-clause / concentric-ring prime-sum checksum

**Classification:** provisional source-level structural clue; no unknown LP2 plaintext, key, or cipher operation recovered. This report records exact p32 arithmetic relations, a packet-level 2016 anchor, and a conditional layout-preserving randomization test. It does not establish creator intent or a decryptor.

## Source-fixed p32 input

Physical p32 is the original 121-rune 11×11 page. The canonical word parser treats printed punctuation as word boundaries but ignores typographical line wraps. The page has 22 words, with a printed full stop after word 7:

- First clause: 7 words, 33 runes; lengths `[1,3,5,11,5,5,3]`.
- Second clause: 15 words, 88 runes; lengths `[11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]`.
- The ordered GP-prime sums of all 22 words are `[73,125,267,613,191,184,14,540,458,535,183,442,196,497,160,446,98,203,96,348,160,216]`.
- The first and second clause prime sums are **1,467** and **4,578**, respectively; the full page sum is **6,045**.

Reshape the original p32 rune-prime values row-major into 11×11 and group cells by Chebyshev distance from the center. The concentric rings have counts `[40,32,24,16,8,1]` and prime sums, outside inward, **`[1,917,1,539,1,046,1,136,388,19]`**.

## Packet-body anchor at the second-sentence boundary

The signed January 2016 message explicitly tells the reader to verify OpenPGP key ID `7A35090F`. Decoding the original signature armor in `resources/historical/cicada2016-4gq25-outguess.asc` gives **543 bytes**. Its first three bytes are `89 02 1c`: an old-format tag-2 Signature packet with a two-octet length field specifying a **540-byte packet body**. Unlike the 1,136-byte ASCII-armored file length, this packet-body length is invariant under CRLF/LF or armor line-wrap changes. It is a visible packet-structure property, but the length field is **not itself cryptographically authenticated as an intended selector** by the detached signature.

The first word of p32's second sentence is the complete 11-rune word at local offset 33, `ᚻᚩᛗᛖᛉᚹᛞᛋᛚᚠᛞ` (GP transliteration `HOMEXWDSLFD`). Its GP-prime sum is exactly **540**, the PGP signature packet body length. Across the complete 58-page corpus there are **2,941** canonical words and **32** 11-rune words; p32 is the **only** 11-rune word with prime sum 540. There is one other word of any length with sum 540: a 9-rune word on p5 (`ᚠᛞᛚᛁᛠᛈᛟᚣᚩ`). Thus the independently selected 11×11 tree page and 11-rune word length disambiguate the p32 match; the p5 alternative remains an explicit control.

This is a candidate source anchor, not a plaintext claim. The first four rune transliterations of the p32 word spell `HOME`, but the complete word remains ciphertext. The 540 equality does not by itself specify what operation to perform on that word.

## Exact cross-artifact clause/ring identities

The first-clause relation was previously reported by Agent14: the first clause prime sum exceeds the 16-cell inner-5×5 perimeter sum by the historical 7×7 square center:

    1,467 = 1,136 + 331

The complementary second-clause relation is:

    4,578 = 4,502 + 76

Here:

- **1,136** is both the 16-cell inner-5×5 p32 perimeter sum and the byte length of the archived ASCII-armored 2016 file. The latter is line-ending/armoring-sensitive and must not be treated as authenticated packet length.
- **331** is the center of the historical 2014 7×7 OpenPuff magic square and the Onion7 HTML div identifier.
- **4,502** is the sum of the three outer p32 ring sums: `1,917+1,539+1,046`.
- **76** is the one-cell circumference of the 32×8 LP2 numeric table (`2×32+2×8−4`) and also the rune count of physical p55.

The first word of the second clause has sum 540 (the signature packet body length); the remaining 14 words sum **4,038**. Therefore:

    4,502 − 4,038 = 464 = 16×29 = 133 + 331

where 16 is the inner-5×5 perimeter cell count, 29 is the GP alphabet size, and 133/331 are the historical Onion7 title/div identifiers. This is another exact cross-artifact relation, not a derived cipher.

The residuals also close against the two innermost p32 rings:

    331 + 76 = 407 = 388 + 19

where **388** is the 8-cell inner-3×3 perimeter sum and **19** is the center rune's GP-prime weight. These equations partition the full page sum `6,045` consistently.

## Conditional randomization test

The test is deliberately conditional on the observed p32 page, its printed word boundaries/order, the 33/88 clause cut, the 11×11 row-major geometry, the concentric ring grouping, and the independently identified external constants 1,136, 331, and 76. It does **not** correct for the wider search over possible source clues, page partitions, ring groupings, or external constants. The packet-body/540-word equality is a separate exact source observation and is **not** included in this randomization p-value.

One million deterministic trials independently permute the GP-prime values **within each of the 22 original words**. This preserves every word's length and rune multiset, word order, punctuation boundary, clause totals, and original 11×11 cell/line geometry. Only the assignment of each word's runes to its original cell positions changes. The joint event is that the 16-cell inner-5×5 perimeter still sums to 1,136 **and** the inner-3×3 perimeter plus center still sums to 407 (the second clause equation then follows from the fixed page and clause totals).

| Statistic | Hits / 1,000,000 | Add-one conditional p |
| --- | ---: | ---: |
| Inner-5×5 perimeter sum = 1,136 | 274 | 0.0002750 |
| Inner-3×3 perimeter + center = 407 | 6,627 | 0.0066280 |
| Both constraints simultaneously | **4** | **0.0000050** |

PRNG: xorshift32, initial state `0x10a39b32`; each word is independently Fisher–Yates shuffled. The exact implementation is `sims/p32_two_clause_ring_checksum.cjs` and can be run from the repository root with:

    node sims/p32_two_clause_ring_checksum.cjs

The sample is a conditional layout-preserving null, not a discovery-wide p-value. The small tail indicates that the observed arrangement is unusual under this particular within-word randomization; it does not prove that the author selected these constants or that the page encodes a cipher key.

## Interpretation and next use

The result is compatible with a human solve-path reading of the 2016 instruction that words form a map and numbers give direction, together with the solved PARABLE instruction to shed circumferences. The two punctuation-delimited clauses split the 11×11 page into 3 and 8 complete rows, while their prime sums reconcile to the inner/outer ring sums plus the independently documented 2014 center and LP2 table circumference. The second clause begins with the unique 11-rune p32 word whose prime sum equals the 2016 signature packet body length.

That is a source-derived checksum and anchor, **not** an inverse transformation. It supplies no ordering of the ring cells, key schedule, plaintext, or destination. A useful continuation must find a separately motivated operation that uses the clause/ring partition and packet anchor to make a prospective prediction on an original LP2 interval or a historically solved control. Do not broaden the test into arbitrary ring partitions, constants, or language-score searches.

## Reproduction inputs

- `resources/lp2-transcription.txt` — printed word/punctuation stream.
- `resources/liber-primus/lp2-corpus.json` — canonical GP rune indices and prime weights.
- `resources/historical/cicada2016-4gq25-outguess.asc` — original 2016 signature armor.
- `im-results/onion7-magic-center-source-prime-gate.md` — 2014 square center 331.
- `im-results/2014-magic-square-direction-map.md` — 2014 5×5 source square and prime/totient mapping.
- `results/README.md` — LP2 table geometry and current research limits.
