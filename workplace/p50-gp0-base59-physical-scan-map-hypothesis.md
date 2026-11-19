# p50 GP0 → base59 → physical-scan map: bounded hypothesis

**Status: unverified navigation hypothesis, not a decipherment.** The observation below is source-selected enough to test, but the hit count alone is consistent with chance.

## Fixed inputs and operation

- Source: the 43 alphabetic words in `resources/historical/cicada2016-4gq25-outguess.asc`, before the PGP signature.
- GP0 normalization: the canonical signed-message tokenizer used by `sims/lp2_signed2016_gp0_p50_printable_hex_sft.cjs` (longest GP allographs; `QU→CW`, `K/Q→C`, `V→U`, `Z→S`, plus the authenticated `ING=21` and `IO=27` digraphs).
- Map: row-major tokens in `resources/liber-primus/base60-grid.json`.
- Consumer: the fixed post-SHED base59 alphabet `grid.alphabet.replace("f","")`. For token (xy), value is (59·index(x)+index(y)). Do not substitute a guessed base59 alphabet.
- Physical scan mapping: p0 is scan 17, so scan (s) corresponds to LP2 page (s-17) over the p0–p55 interval.

## Complete 43-word output

| i | Signed word | GP0 | p50 token | base59 | scan/page if 17–74 |
|---:|---|---:|---|---:|---|
| 0 | HELLO | 69 | 1D | 72 | 72 / p55 |
| 1 | THE | 20 | 1g | 100 | |
| 2 | PATH | 39 | 05 | 5 | |
| 3 | LIES | 63 | 0p | 50 | 50 / p33 |
| 4 | EMPTY | 92 | 3u | 232 | |
| 5 | EPIPHANY | 121 | 3v | 233 | |
| 6 | SEEKS | 71 | 1m | 106 | |
| 7 | THE | 20 | 1g | 100 | |
| 8 | DEVOTED | 102 | 0W | 32 | 32 / p15 |
| 9 | LIBER | 69 | 1D | 72 | 72 / p55 |
| 10 | PRIMUS | 62 | 24 | 122 | |
| 11 | IS | 25 | 3I | 195 | |
| 12 | THE | 20 | 1g | 100 | |
| 13 | WAY | 57 | 1w | 116 | |
| 14 | ITS | 41 | 1O | 83 | |
| 15 | WORDS | 52 | 1Q | 85 | |
| 16 | ARE | 46 | 3J | 196 | |
| 17 | THE | 20 | 1g | 100 | |
| 18 | MAP | 56 | 4E | 250 | |
| 19 | THEIR | 34 | 3H | 194 | |
| 20 | MEANING | 77 | 2O | 142 | |
| 21 | IS | 25 | 3I | 195 | |
| 22 | THE | 20 | 1g | 100 | |
| 23 | ROAD | 54 | 2a | 154 | |
| 24 | AND | 56 | 4E | 250 | |
| 25 | THEIR | 34 | 3H | 194 | |
| 26 | NUMBERS | 83 | 3D | 190 | |
| 27 | ARE | 46 | 3J | 196 | |
| 28 | THE | 20 | 1g | 100 | |
| 29 | DIRECTION | 112 | 1D | 72 | 72 / p55 |
| 30 | SEEK | 56 | 4E | 250 | |
| 31 | AND | 56 | 4E | 250 | |
| 32 | YOU | 30 | 2L | 139 | |
| 33 | WILL | 57 | 1w | 116 | |
| 34 | BE | 35 | 0d | 39 | 39 / p22 |
| 35 | FOUND | 36 | 0s | 53 | 53 / p36 |
| 36 | GOOD | 35 | 0d | 39 | 39 / p22 |
| 37 | LUCK | 31 | 2D | 131 | |
| 38 | BEWARE | 88 | 3V | 208 | |
| 39 | FALSE | 77 | 2O | 142 | |
| 40 | PATHS | 54 | 2a | 154 | |
| 41 | VERIFY | 59 | 19 | 68 | 68 / p51 |
| 42 | OPENPGP | 75 | 2v | 174 | |

## Why this deserves one bounded test

The p49 recursive-SHED transfer gives GP0 76, then p50[76]=1s → base59 112 = GP0(DIRECTION). DIRECTION itself has GP0 112, and p50[112]=1D → base59 72, which maps to scan 72 / p55. This is a second lookup beyond the already reported p49→DIRECTION transfer.

Other scan-range hits are LIES→p33, DEVOTED→p15, BE/GOOD→p22, FOUND→p36 and VERIFY→p51. The p50 byte values lie in 0–255; the scan interval 17–74 contains 58 values. Under a uniform-byte null, 43 words would yield about (43·58/256≈9.7) hits. The observed nine hits are therefore **not** evidence by count. GP0 collisions also explain some repeated destinations.

## Required next decision

Issue [#1873](https://github.com/FlareZ123/liber-primus/issues/1873) freezes the entire register and requires an independent page-level criterion plus a null preserving the p50 value distribution and GP0 collisions. Only a new, uniquely selected page receiver with a held-out consequence would justify extending the route. Otherwise retain only the established p49→DIRECTION result and retire the broad physical-scan interpretation.

## Strongest rival

This is a random byte table whose values sometimes fall in the physical scan interval. The p55 landing may be a coincidence or a consequence of selecting a known receiver after seeing the output. No plaintext has been recovered by this map.
