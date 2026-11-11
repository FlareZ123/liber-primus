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

## Adjacent p33 cuneiform prime-rank selector (provisional)

The repeated cuneiform header on physical pp33–39 gives the sexagesimal values `(17,13)` and `(55,1)`, hence **1033** and **3301**. These are the two 2014 Onion7 magic-square sums and both are prime. Their one-based prime ranks are **174** and **464**. The manuscript's two natural moduli expose an exact alignment:

| Prime value | Prime rank | Rank / 29 | Rank / 58 |
| --- | ---: | ---: | ---: |
| 1033 | 174 | **6** | **3** |
| 3301 | 464 | **16** | **8** |

Equivalently, `174 = 6×29 = 3×58` and `464 = 16×29 = 8×58`.

These quotients independently reproduce p32's fixed geometry:

- **6** concentric Chebyshev layers, with cell counts `[40,32,24,16,8,1]`;
- **16** cells on the inner 5×5 perimeter;
- **3** complete 11-rune rows (33 runes) in the first punctuation-delimited clause;
- **8** complete 11-rune rows (88 runes) in the second clause.

The same **6** and **16** are also the exponents in the existing cross-release projective relations `B = 21 A^6` and `M7 ~ Q2 A^16 Q2^-1` documented in `results/README.md`. The cuneiform appears immediately after p32, so it can plausibly be read as a backward selector for the preceding matrix. The 2014 text's “primes are sacred” and the 2016 signed message's “numbers are direction” make prime ranking a plausible human operation, though they do not prescribe this exact normalization.

A small same-book control set does not show the property: the prime ranks of the nine LP1 warning-line sums `[757,1009,691,353,769,911,1051,859,677]` are `[134,169,125,71,136,156,177,149,123]`; none is divisible by 29 or 58. This is a specificity check, **not** a formal significance test: the constants and matching geometric features were not preregistered against every possible modulus or structure.

This is a new exact cross-artifact alignment and a plausible source selector for p32's clause/ring geometry and matrix exponents. It is **not** a recovered key, plaintext, or proof of intent. Prime-rank normalization remains an inference; the next operation still needs independent source justification and a prospective result.

Source anchors: original p33 image `resources/liber-primus/50.jpg`; historical square sums `resources/cicada2014-openpuff-magic-squares.txt`; 2016 signed message `resources/historical/cicada2016-4gq25-outguess.asc`; p32 transcription and ring reproducer `resources/liber-primus/lp2-transcription.txt` and `sims/p32_two_clause_ring_checksum.cjs`.

## Bounded source-derived key tests on p55 (negative)

The new 6/16 selector motivates two direct key candidates for the 76-rune p55 text. Both were tested with the same printed-word parser used by `sims/lp2_2016_message_base58_word_map.cjs`; no word-like plaintext appeared.

1. **Inner 5×5 perimeter as a 16-symbol Vigenère key.** The perimeter was traversed clockwise from its top-left cell. Tested key encodings were GP ordinal indices `[18,14,7,23,15,23,27,17,11,28,27,21,12,27,6,27]`, prime weights modulo 29 `[9,18,19,2,24,2,20,3,8,22,20,21,12,20,17,20]`, and per-cell totients modulo 29 `[8,17,18,1,23,1,19,2,7,21,19,20,11,19,16,19]`. Forward/reversed keys and additive, subtractive and Beaufort conventions were tested. Best IoC was **0.042456**.

2. **Six concentric-layer sums as a six-symbol key.** Outside-in sums are `[1917,1539,1046,1136,388,19]`; tested reductions were sum modulo 29 `[3,2,2,5,12,19]`, sum of per-cell totients modulo 29 `[21,28,7,18,3,18]`, and totient-of-layer-sum modulo 29 `[14,15,0,9,18,18]`. Forward/reversed keys and the same three conventions were tested. Best IoC was **0.042105**.

3. **Cross-round 2×2 Hill use of the projective matrices.** Tested `A^6=[[11,17],[17,11]]`, `21A^6=[[28,9],[9,28]]`, `A^16=[[13,17],[17,13]]`, `M7=[[14,25],[25,28]]`, and `C=[[14,28],[25,20]]`, with direct/inverse and row/column vector conventions. Best IoC was **0.044561**.

For comparison, p55 ciphertext IoC is **0.037895** and the solved p57 prose IoC is **0.062711**. The best outputs remain far below the known-prose reference and contain no recognizable text. These bounded negatives reject only the direct periodic Vigenère and 2×2 Hill applications tested; they do not disprove a navigation role or a different stateful operation. Do not repeat these direct-key families.
## Interpretation and next use

The p33 cuneiform prime ranks now give an independent, source-motivated selector for p32's **3/8 clause partition**, **6/16 concentric geometry**, and the existing projective exponents **6/16**. This is the strongest new structural connection in this investigation. The direct Vigenère keys from the 16-cell perimeter and six layer sums, and direct 2×2 Hill uses of the p32/LP1 matrices on p55, have all failed; do not repeat them.

The remaining consequential question is whether the cuneiform-selected exponents and p32 projective matrices prescribe a unique stateful operation with a prospective prediction on an unknown page. Without a source-fixed state update, initialization and readout, further cipher-family sweeps would be unconstrained. No unknown LP2 plaintext, key, or complete decryption has been recovered.
