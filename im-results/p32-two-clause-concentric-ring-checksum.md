# p32 two-clause / concentric-ring prime-sum checksum

**Classification:** provisional source-level structural clue; no unknown LP2 plaintext, key, or cipher operation recovered. This report records one exact p32 arithmetic relation and a conditional layout-preserving randomization test. It does not establish creator intent or a decryptor.

## Source-fixed input

Physical p32 is the original 121-rune 11×11 page. The canonical word parser treats printed punctuation as word boundaries but ignores typographical line wraps. The page has 22 words, with a printed full stop after word 7:

- First clause: 7 words, 33 runes; lengths `[1,3,5,11,5,5,3]`.
- Second clause: 15 words, 88 runes; lengths `[11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]`.
- The ordered GP-prime sums of all 22 words are `[73,125,267,613,191,184,14,540,458,535,183,442,196,497,160,446,98,203,96,348,160,216]`.
- The first and second clause prime sums are **1,467** and **4,578**, respectively; the full page sum is **6,045**.

Reshape the original p32 rune-prime values row-major into 11×11 and group cells by Chebyshev distance from the center. The concentric rings have counts `[40,32,24,16,8,1]` and prime sums, outside inward, **`[1,917,1,539,1,046,1,136,388,19]`**.

## Exact cross-artifact identities

The first-clause relation was previously reported by Agent14: the first clause prime sum exceeds the 16-cell inner-5×5 perimeter sum by the historical 7×7 square center:

    1,467 = 1,136 + 331

The complementary second-clause relation is:

    4,578 = 4,502 + 76

Here:

- **1,136** is both the 16-cell inner-5×5 p32 perimeter prime sum and the exact byte length of the preserved signed 2016 payload (`resources/historical/cicada2016-4gq25-outguess.asc`).
- **331** is the center of the historical 2014 7×7 OpenPuff magic square and the Onion7 HTML div identifier.
- **4,502** is the sum of the three outer p32 ring sums: `1,917+1,539+1,046`.
- **76** is the one-cell circumference of the 32×8 LP2 numeric table (`2×32+2×8−4`) and also the rune count of physical p55.

The residuals close against the two innermost p32 rings:

    331 + 76 = 407 = 388 + 19

where **388** is the 8-cell inner-3×3 perimeter sum and **19** is the center rune's GP-prime weight. These equations partition the full page sum `6,045` consistently. The second-clause equality is the new observation; the first-clause equality and the 1,136/331 source links pre-existed.

## Conditional randomization test

The test is deliberately conditional on the observed p32 page, its printed word boundaries/order, the 33/88 clause cut, the 11×11 row-major geometry, the concentric ring grouping, and the independently identified external constants 1,136, 331, and 76. It does **not** correct for the wider search over possible source clues, page partitions, ring groupings, or external constants.

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

The result is compatible with a human solve-path reading of the 2016 instruction that words form a map and numbers give direction, together with the solved PARABLE instruction to shed circumferences. The two punctuation-delimited clauses split the 11×11 page into 3 and 8 complete rows, while their prime sums reconcile to the inner/outer ring sums plus the independently documented 2014 center and LP2 table circumference.

That is a source-derived checksum, **not** an inverse transformation. It supplies no ordering of the ring cells, key schedule, plaintext, or destination. A useful continuation must find a separately motivated operation that uses the clause/ring partition to make a prospective prediction on an original LP2 interval or a historically solved control. Do not broaden the test into arbitrary ring partitions, constants, or language-score searches.

## Reproduction inputs

- `resources/lp2-transcription.txt` — printed word/punctuation stream.
- `resources/liber-primus/lp2-corpus.json` — canonical GP rune indices and prime weights.
- `resources/historical/cicada2016-4gq25-outguess.asc` — signed 2016 payload (1,136 bytes).
- `im-results/onion7-magic-center-source-prime-gate.md` — 2014 square center 331.
- `im-results/2014-magic-square-direction-map.md` — 2014 5×5 source square and prime/totient mapping.
- `results/README.md` — LP2 table geometry and current research limits.
