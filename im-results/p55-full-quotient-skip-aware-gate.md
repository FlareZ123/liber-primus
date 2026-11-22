# P55 full-table quotient as a skip-aware GP29 key: bounded negative

**Decision, 11 November 2026 (Director Issue #374):** The frozen phase-zero base-60 quotient key from the 256 printed numeric cells, used with one published skip-aware GP29 inverse, produces no credible original page-55 plaintext. Both natural additive signs give ciphertext-level English scores. Two native-English GP29 plants decode correctly. The original order and ciphertext are unexceptional relative to controls. This rejects the stated key/decoder/register combination, without identifying the historical cipher.

## Independent inputs and frozen mechanism

- Original grid: resources/liber-primus/base60-grid.json, Git blob SHA-1 4698c0806e6bab06a39cfbc3c3283b862de58b35. The 32 rows of eight cells span physical pages 49, 50 and 51 in counts 10, 13 and 9 rows respectively (80 + 104 + 72 = 256 cells). The claim that all 256 appear on physical page 50 is incorrect.
- Original p55 ciphertext: resources/liber-primus/lp2-corpus.json, Git blob SHA-1 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. All 76 rune indices preserved in original order, including the one-rune p54 word carry, all 17 printed fragments and all 33 exterior runes. Fragment lengths: [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]. One adjacent doublet occurs at local second-rune index 59.
- Conditional source read: base 60 uses 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx. Set Q[i] = floor(byte[i]/29), i=0..255, with values 0..8 and histogram [22,33,38,22,29,32,34,21,25]. Use phase 0 in source row-major order, repeat only upon exhausting 256 digits. Base60 remains a plausible conventional reading without an authenticated Cicada radix legend. Original-image Issue #379 has disproved the earlier claim of matching p49/p55 nine-dot marks.
- Pinned published decoder: Dukotah/cicada3301 campaign18_skip/skipdecode.py, Git blob c536955b052742d8bfb25a1bc3cd87ebea6d8dbd, https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/campaign18_skip/skipdecode.py. Beam width 400; at most three rejected key symbols between consecutive accepted outputs; no original-target parameter fitting, phase search, offset scan or word reset.
- Frozen English model: original MIT-licensed Dukotah quadgram file, preserved byte-for-byte at resources/control/dukotah_english_quadgrams.txt, blob da56c2e11e004ad24454750dba8fbe2e19abbc71. Gibran native-GP control file blob df260a07d56bf5998d40a6360b6132c35c252d10 is an English-language comparator, not an author attribution.

At each rune, decode candidate p = (c + sign * Q[j]) mod 29. A proposed rejected earlier key at index m is valid only if (p − sign * Q[m]) mod 29 equals the preceding emitted ciphertext rune; all such checks are exact. The selected beam path maximizes independently frozen English quadgram likelihood.

## Original run and discriminating controls

| Readout | C minus Q | C plus Q |
| --- | ---: | ---: |
| Original p55 quadgram score (log10 per four transliterated letters) | −7.4404237585 | −7.3704510728 |
| Original raw ciphertext score (same both cases) | −7.3795271257 | −7.3795271257 |
| Chosen skipped key symbols | 0 | 1 |
| Last accepted zero-based Q index | 75 | 76 |
| Exact path-specific forward replay | 76/76 | 76/76 |
| 32 ciphertext shuffles, unigram and one-doublet matched, plus-one upper tail | 0.5152 | 0.6667 |
| 32 whole-key Q shuffles preserving digit histogram, plus-one upper tail | 0.5152 | 0.5152 |

Original C minus Q transliteration: XEXRRWPHTWWEASTHMOEDEBRIAOTHXAEDNIXEAUNCEXJEPMIAJIABGCTHGTLENREOUITWHYFSNIANGULIPEAEOEHAESJR

Original C plus Q transliteration: EAOATIDNGLOEDBPTHTHTHWTHUBGRJGLTHGMIAONBJAYPLBIAIASTHBISJXYEAMEOHMJBYMBRCAMOYPEATAEWMYTOAAP

All 612 separate 76-rune native-GP Gibran windows score better than both original candidates (window range −5.5642 to −3.6954; median −4.5017). A wrong fixed key displaced by 128 Q cells scores −8.1984 for the minus sign. The shuffled-cipher controls preserve the original exact one-doublet condition; the shuffled-key controls preserve its quotient digit inventory. Original ranks provide no meaningful key-source specificity.

Two deterministic fixed-suppression synthetic source-GP plants, one under each sign, recover 76/76 runes using the same decoder and passed explicit forward checks for every accepted/rejected key position. Planted suppression probability 0.83 is an independently frozen model parameter, never inferred from LP2; the original p55 paths do not recover a historical skip schedule. Exact forward replay alone cannot distinguish correct from wrong bijective keys.

**Source consequence:** both chosen original paths consume only the first 76 or 77 source-table entries, which are printed on physical p49. They never reach the physical p50 cells. Therefore this test neither establishes a special cipher role for p50 nor motivates an additional table-specific follow-up.

Reproduce using the pinned CommonJS test at sims/p55_full_quotient_skip_sft.cjs. The [manual GitHub Actions test 43122703496](https://github.com/FlareZ123/liber-primus/actions/runs/43122703496) finished successfully under Node 22. The script prints every key choice, all candidate runes, exact skip indices, positive controls and calibrated null summaries.

**Next research decision:** close Issue #374 without compensating offset/radix/beam retuning. Consider new hypotheses only when an independent original clue selects an operation, input mapping or recoverable key/state. No unknown LP2 plaintext or complete mechanism is recovered.
