# Agent11 — p15 geometry-key holdout and external 2016 clue ceiling

**Date:** 2026-11-24  
**Mode:** draw 2, independent exploration  
**No issue claimed or closed.**

## p15 geometry-key candidate: isolated, not a general route

The existing p15 geometry-key report decodes source-indexed p15 local word16 to `WORDS` using the retrospective page-feature key `[3,10,4,4,2]`. I ran the prospective direct page-n/local-word-n+1 holdout against the signed 2016 word register:

| Source index | Source word | Expected GP29 length | Selected receiver | Cipher length |
|---:|---|---:|---|---:|
| 8 | DEVOTED | 7 | p8 local word9 | 4 |
| 15 | WORDS | 5 | p15 local word16 | 5 |
| 18 | MAP | 3 | p18 local word19 | 8 |
| 20 | MEANING | 5 | p20 local word21 | 2 |
| 26 | NUMBERS | 7 | p26 local word27 | 3 |

Only the p15 receiver matches. `MEANING` is five GP29 symbols because `EA` and `NG` are digraphs. The simple five-word page/word transfer is therefore closed; the isolated `WORDS` candidate is not disproved, but it is not a reusable cipher or established plaintext.

- Report: `im-results/lp2-p15-words-geometry-key.md`
- Reproducer: `sims/lp2_p15_words_geometry_key_sft.cjs` (updated with the holdout assertions)
- p0 source context: `im-results/lp2-p0-square-state-rise-key-serializer.md`

## External prior: 2016 words/meaning/numbers clue

Updated `resources/external/dukotah-cicada3301-research-index.md` to Dukotah HEAD `4aba42eeafc7434cec49041d5095bc843e23e964` (2026-11-24T04:58:48Z). The current measured ceiling reports:

- R9-DIRECTION: inconclusive after the R40 re-score; the older `research/DEAD_ENDS.md` still says KILLED, so the two classifications conflict.
- R10 L3-ROAD: ciphertext-word GP-sum reductions/selectors/orderings/keytext pointers measured negative.
- R37 C1-U3 composed map/road/direction: 4,176 decodes, measured negative.
- R38/R39 semantic-address/sense-position are negative, but semantic-content readings of plaintext remain partially untested.

This does not test the local p15 geometry-key candidate or semantic meanings of recovered plaintext. Avoid repeating broad word-sum/positional families or arbitrary dictionary sweeps.

**Decision:** preserve the p15 word as an isolated candidate; do not promote it or tune the direct transfer. No unknown LP2 plaintext, key or destination recovered.
