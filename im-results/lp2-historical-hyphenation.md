# Historical deterministic hyphenation framing — capacity failure

Issue #2733; Agent 24. Frozen grammar: American English TeX patterns at [2011-06-20 upstream revision](https://github.com/hyphenation/tex-hyphen/blob/ee22323218150388abdeb36184ad5861e3669b65/hyph-utf8/tex/generic/hyph-utf8/patterns/tex/hyph-en-us.tex), original blob 53d376fc14e0622378d2c0797324ba423fa2b83b, version 2005-05-30. The unchanged file is archived as resources/external/tex-hyph-en-us-2011.tex. It includes 4,938 patterns and 14 exceptions. Use the standard max-overlap odd-score break rule with exceptions overriding patterns, left/right Latin minima 2/3. Retain every permitted Latin break that falls on an existing GP rune boundary; do not split a multiletter rune, do not insert or remove runes, do not fit a dictionary or threshold to ciphertext.

Native control preserves the exact solved rune sequences (740 groups, 2,979 runes). Match spellings against the solved Latin reference using fixed rune spelling variants, frequency then alphabetic tie-break; 739/740 tokens match uniquely and one uses canonical transliteration fallback. Independent controls use fixed greedy GP rendering and standard normalized Latin words. Three donor sources are pinned in JSON. Tests include exception examples associate/table/present; no new TeX execution or independent algorithm comparison was performed.

## Results

| Source | Base groups | Split groups | Base mean length | Split mean length | Split groups >=7 |
|---|---:|---:|---:|---:|---:|
| Exact solved GP | 740 | 949 | 4.026 | 3.139 | 12 |
| Gibran | 12572 | 14621 | 3.788 | 3.258 | 137 |
| Shakespeare | 55407 | 66632 | 3.918 | 3.258 | 1634 |
| Emerson | 74866 | 97438 | 4.099 | 3.149 | 1276 |

Original unsolved LP2: 2,896 groups across 12,956 runes (mean 4.474), 83 singletons, 531 groups length <=2 and 559 length >=7. For every possible contiguous fixed-rune-count donor window, count starts of groups, then conservatively subtract one to permit a cut through the terminal group. The minimum complete-group capacity is therefore a lower bound (not a simulated mean). No original fit or cipher parameters enter the computation.

| Donor | Whole-book group floor | Whole-book singleton floor | Whole-book <=2 floor | p54+p55 (308 runes) group floor |
|---|---:|---:|---:|---:|
| Gibran | 3943 | 130 | 1061 | 84 |
| Shakespeare | 3848 | 201 | 1033 | 79 |
| Emerson | 4016 | 130 | 1280 | 81 |
| Exact solved GP | too short | too short | too short | 90 |
| Original | 2896 | 83 | 531 | 66 |

Whole-book windows tested: 34,674 Gibran, 204,151 Shakespeare, 293,896 Emerson. Even the smallest donor floor requires 952 more groups than the original. Exact solved native splitting raises group count by 209 and reduces long groups from 106 to 12. At the original terminal 308-rune scale, the lowest literary floor is 79, exceeding 66; native floor is 90.

The complete-clause comparison uses 164 clauses between successive corrected stops within a visual chapter (same convention as #2729). With the same conservative arbitrary-cut floors, 21/164 original clauses have fewer groups than every length-matched donor window. Small clauses can have a weak capacity floor; whole-book and terminal tests carry the decisive discrepancy.

## Decision

The fixed subword split architecture worsens the exact existing length discrepancy, and fails the finite donor and native capacity gate; it does not merit a key/segmentation inverse. This is a register-limited exclusion, not a proof against all possible English texts or all subword models. No lexical inversion or original cipher fit was performed because the prerequisite failed. No unknown plaintext recovered.

Reproduce from repo root: `node sims/lp2_historical_hyphenation_sft.cjs`. Core executed on fetched source in V8; standalone Node filesystem wrapper not separately CI-run. See [raw output](lp2-historical-hyphenation.json).
