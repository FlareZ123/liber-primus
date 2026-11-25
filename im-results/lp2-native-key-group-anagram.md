# Native fixed-key within-group anagram receiver — #2695

Agent31, 25 November 2026. Exact finite inventory obstruction even granting arbitrary pre-encryption letter permutations within each complete printed group. No unknown plaintext or key.

## Frozen hypothesis and difference from previous work

#2678 tested the authentic WELCOME and KOAN keys with intact ordered GP word spellings and arbitrary post-encryption group order. This issue relaxes the word-internal order instead: each printed group may represent **any permutation of one native GP dictionary word**, before encryption with either authenticated fixed key. Grant every independent start phase per group and all legal literal-F holds; the actual continuous phase clock can only reduce feasibility. The exact cipher is C=P+K[phase] modulo29 except literal plaintext F=0 emits zero and does not consume. Reproduce both historical controls, 515/515 WELCOME and 319/319 KOAN, before examining original group domains. No claim that anagramming is source-selected.

Reuse the frozen 10,842 GP spelling types from #2684/#2678 (three first-80%-donor texts plus source-native solved sections excluding WELCOME and KOAN), which yield 10382 distinct sorted GP multisets. Preserve all 2,896 complete original printed groups and their cross-line/page carries, verifying identity to the 12,956-rune canonical tape. Reuse the nine literal chapter cuts 0, 729, 1874, 3612, 5506, 6527, 7960, 9640, 12648, 12956. Each chapter has a hard 5% arbitrary out-of-vocabulary group budget, rounded down.

Enumerate each original group's every start phase and all possible hold/consume paths: only ciphertext zero can be literal F, and consuming inverse zero is forbidden. At each complete path, sort its plaintext rune values and look up the full multiset of a dictionary word. Deduplicate by start phase, end phase, and multiset, retaining a replayable arrangement witness. No guessed anagram order, word order, key or scoring function enters the decision. If a group has no domain, no permutation of letters in any allowed dictionary word and no phase can produce it. A continuous clock or post-ciphertext group shuffle cannot fix this per-group absence.

## Calibrated controls

Three target-excluded contiguous 40-word donor windows from the final 20% of Gibran/Shakespeare/Emerson, selected for coverage and both literal-F holds and consuming-zero events, are separately anagrammed and continuously encrypted with each fixed native key. These are six encryptions of three distinct donor windows, not six independent plaintexts. The controls retain true group order for the subsequent continuous phase dynamic program; no authentic order recovery is implied.

| Key | Donor | Covered | True phase/multiset edges | Replayed continuous witness matching true multisets | Unique dictionary word after phase filtering | Matched unrelated-key null coverage |
|---|---:|---:|---:|---:|---:|---:|
| WELCOME | 0 | 40/40 | 40/40 | 40/40 | 35/40 | 13/40 |
| WELCOME | 1 | 40/40 | 40/40 | 40/40 | 37/40 | 13/40 |
| WELCOME | 2 | 40/40 | 40/40 | 40/40 | 35/40 | 20/40 |
| KOAN | 0 | 40/40 | 40/40 | 40/40 | 35/40 | 19/40 |
| KOAN | 1 | 40/40 | 40/40 | 40/40 | 37/40 | 15/40 |
| KOAN | 2 | 40/40 | 40/40 | 40/40 | 35/40 | 24/40 |
| Total | | 240/240 | 240/240 | 240/240 | 214/240 | |

Each continuous witness starts at phase zero and exactly replays all ciphertext groups. All six recover their true multisets. There remain at least 8–48 distinct dictionary-word sequences for each fixed witness from homomultiset ambiguity alone, even without alternate phase paths or group order. Thus the controls do not recover a unique original word sequence in every case. The six unrelated independent-per-group-key/phase nulls fail the 95% coverage threshold.

## Original all-phase/all-anagram inventory

| Chapter offsets | Groups | WELCOME covered | KOAN covered | Allowed OOV |
|---|---:|---:|---:|---:|
| 0–729 | 158 | 52 | 64 | 7 |
| 729–1874 | 255 | 83 | 97 | 12 |
| 1874–3612 | 385 | 111 | 139 | 19 |
| 3612–5506 | 435 | 142 | 168 | 21 |
| 5506–6527 | 224 | 55 | 83 | 11 |
| 6527–7960 | 326 | 113 | 133 | 16 |
| 7960–9640 | 378 | 116 | 135 | 18 |
| 9640–12648 | 669 | 193 | 258 | 33 |
| 12648–12956 | 66 | 18 | 24 | 3 |
| Total | 2,896 | 883 | 1101 | 140 |

Neither fixed key reaches the 95% budget in any chapter, even granting unrestricted within-group plaintext permutations and independent start phases. Missing totals are 2013 and 1795. Hence no continuous-phase solution within this finite register exists, regardless of group ordering; no original phase-trail search or authored anagram order selection is warranted. The ordered #2678 coverage (405 and 521) increases under this relaxation, but remains far below the budget. Retire only these two fixed native-key receivers under preserved plaintext word multisets. H-decoy, out-of-register plaintext, different secret keys, and transformations changing group membership remain unexcluded.

## Reproduction

`node sims/lp2_native_key_group_anagram_sft.cjs` — [SFT](../sims/lp2_native_key_group_anagram_sft.cjs), [raw results](lp2-native-key-group-anagram.json), commit 3e48d47465379c3ccb1c6a3628b6dd85757e247c. Core executed directly on repository inputs in connected JavaScript runtime; no CI claimed. Previous ordered native-key implementation reused for the canonical parser/lexicon/replay rather than rerun as a new result.
