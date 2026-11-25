# 2013 original Gematria Primus source map (corrected)

**Status:** corrected 2026-11-25 against the preserved 2013 chart record and the repository's canonical GP29 runtime corpus.

This file records the 29-symbol order and prime weights used by the original Gematria Primus chart. The previous version of this file was incorrect: it used `ING` as the primary transliteration instead of `NG`, placed `OE` at the end, and shifted the final prime assignments. Do not use the previous mapping.

## Canonical 29-symbol sequence

The index is zero-based. Prime weights are the first 29 primes, in chart order.

| Index | Rune | Primary transliteration | Chart aliases | Prime |
|---:|:---:|:---|:---|---:|
| 0 | ᚠ | F | | 2 |
| 1 | ᚢ | U | | 3 |
| 2 | ᚦ | TH | | 5 |
| 3 | ᚩ | O | | 7 |
| 4 | ᚱ | R | | 11 |
| 5 | ᚳ | C | K | 13 |
| 6 | ᚷ | G | | 17 |
| 7 | ᚹ | W | | 19 |
| 8 | ᚻ | H | | 23 |
| 9 | ᚾ | N | | 29 |
| 10 | ᛁ | I | | 31 |
| 11 | ᛄ | J | | 37 |
| 12 | ᛇ | EO | | 41 |
| 13 | ᛈ | P | | 43 |
| 14 | ᛉ | X | | 47 |
| 15 | ᛋ | S | Z | 53 |
| 16 | ᛏ | T | | 59 |
| 17 | ᛒ | B | | 61 |
| 18 | ᛖ | E | | 67 |
| 19 | ᛗ | M | | 71 |
| 20 | ᛚ | L | | 73 |
| 21 | ᛝ | NG | ING | 79 |
| 22 | ᛟ | OE | | 83 |
| 23 | ᛞ | D | | 89 |
| 24 | ᚪ | A | | 97 |
| 25 | ᚫ | AE | | 101 |
| 26 | ᚣ | Y | | 103 |
| 27 | ᛡ | IA | IO | 107 |
| 28 | ᛠ | EA | | 109 |

## Transliteration and normalization

- The 2013 chart's visible aliases include C/K, S/Z, NG/ING, and IA/IO. These are aliases for existing symbols, not additional alphabet entries.
- `NG` is one GP29 symbol. `ING` is a chart alias for that symbol, not a separate three-letter token.
- `OE` is symbol 22, followed by D, A, AE, Y, IA, and EA. It is not the final symbol.
- The chart prints U without a separate V symbol. Any V→U normalization is a derived convention and should be identified as such rather than presented as a distinct chart entry.
- Use longest-match GP29 tokenization for the chart's digraphs when converting text to rune symbols. Do not confuse the Latin letter sequence `GN` with the GP29 digraph `NG`.

## Provenance and reproducibility

- The original 2013 Gematria Primus chart is preserved in [the historical chart artifact](../resources/historical/cicada2013-gematria-jpeg.b64).
- [The 2013 Twitter-stage source record](../resources/external/2013-twitter-stage-gematria-source.md) documents the original chart aliases and the later helper transcription. The helper is a community preservation, not a first-party Cicada statement.
- [The canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json) stores the runtime `translit` and `prime` arrays in the same order. It is a derived corpus, but it agrees with the corrected chart transcription.
- The alias-aware renderer audit is documented in [the Latin-renderer collision gate](../im-results/lp2-latin-renderer-collision-gate.md).

## Sanity checks

- `MAP` = M(71) + A(97) + P(43) = **211**, consistent with the existing p50 functional-graph report.
- `IGNITA` is spelled I-G-N-I-T-A: it contains `GN`, not the GP29 digraph `NG`. Its canonical letterwise prime sum is 31 + 17 + 29 + 31 + 59 + 97 = **264**, not 256. A claimed 256 match results from the superseded A=89 assignment and is invalid.
- D is 89; A is 97; AE is 101; Y is 103; IA is 107; EA is 109.
