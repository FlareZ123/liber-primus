# 2014 Stage5 output as a p55 running key: negative

**Disposition:** rejected for p55 under the published Campaign XVIII key-skip model. This is an intermediate exclusion, not an established LP2 result.

## Why this was a motivated test

The recovered 2014 Stage5 OutGuess payload yields the exact 56-character string `TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133`; the source recovery is recorded in `im-results/2014-stage5-avowy-archive-audit.md` and reproduced by `sims/stage5_original_outguess_columnar_sft.cjs`.

LP2 p57 says to shed circumferences. The existing transcription parser therefore selects the 43 strict word-interior runes on p55 (16 complete words, after the one incoming carry rune from p54). This is a more constrained target than an arbitrary page/window. The Stage5 output is a same-puzzle external text that could plausibly be a running key, and its canonical GP29 transliteration supplies 46 symbols—enough for this 43-rune target with three spare key positions. The phrase alone supplies only 35 GP symbols.

## Fixed model and test

- Published mechanism: Dukotah's Campaign XVIII key-skip beam decoder (`analysis/campaign18_skip/skipdecode.py`) and quadgram scorer (`src/lp/score.py`): [decoder](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/campaign18_skip/skipdecode.py), [scorer](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/src/lp/score.py).
- Local score data: `resources/control/duko_round27_english_quadgrams.txt` (KJV-derived English quadgram counts).
- GP conversion: the corpus's 29 transliterations, greedily longest-token first, with aliases `V→U`, `K→C`, `Z→S`, `Q→C`; digits and punctuation are discarded.
- Beam width 400, maximum 3 skipped key positions per rune, both additive signs, and every possible start offset 0–3. No key repetition.
- The primary run is strict: paths are discarded when the supplied 46-symbol key is exhausted. A separate sensitivity output mirrors the published implementation's zero-padding fallback; paths using padded zero symbols are flagged and are not treated as valid key evidence.
- Null: 50 uniformly random 46-symbol GP keys, each given the same sign/offset search. Seed `0x3301`.
- Controls: a 200-rune known-English positive control encrypted with the same 83% adjacent-ciphertext-repeat suppression model; a wrong random key is also tested.

## Result

| Test | Result |
|---|---:|
| Best strict candidate | `−6.80323` (sign `−1`, offset `0`, 0 skips) |
| Best candidate text | `OWABONGNDEAEAEAEOFRXTHMMGRJLUFCYOFERSCAECYBEORAEATHEA` |
| Phrase-only first-35-rune prefix | `−7.14225` (sign `−1`) |
| 50-key random-null median | `−6.91346` |
| 50-key random-null maximum | `−6.23925` |
| Candidate rank among candidate + 50 random keys | 16th best of 51 |
| English acceptance threshold used by the source model | `−5.2` |
| Positive control | 200/200 rune recovery; score `−4.17449`; 6 skipped key positions |
| Wrong-key positive-control score | `−7.37139` |

The candidate is below the English threshold, is not better than the matched random-key null, and produces no readable plaintext. The positive control recovers exactly, so the negative result is not explained by a broken decoder or scorer. The zero-padded sensitivity run does not improve the best path; its best path is the same strict no-padding result. One lower padded path consumes invented zero-key symbols and is invalid by construction.

## Decision

Do not continue this Stage5-text→p55-key branch, expand it to other pages, or tune the key conversion. The most motivated LP2 target (p55's p57-selected interior) fails under the source-derived key-skip mechanism. The 2014 Stage5 recovery remains a historical continuation result, but it does not currently provide an LP2 key.

Reproduce with `node sims/2014_stage5_p55_keyskip_gate.cjs`.